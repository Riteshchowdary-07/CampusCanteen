from typing import List, Dict, Any
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import (
    Order, OrderStatus, MenuItem, InventoryItem, PickupSlot, User, UserRole, AccountStatus, AuditLog, TimetableEntry, EntryType
)
from app.schemas import AdminDashboardOverview, TimetableDemandPoint, UserOut, AuditLogOut
from app.auth import get_current_user
from app.permissions import require_roles
from app.services.audit import log_admin_action

router = APIRouter(prefix="/admin", tags=["Admin Management & Analytics"])

@router.get("/dashboard/overview", response_model=AdminDashboardOverview)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    today_str = datetime.date.today().strftime("%Y-%m-%d")

    # Today's orders count and revenue
    today_orders = db.query(Order).all()
    today_count = len(today_orders)
    today_rev = sum([o.total_amount for o in today_orders if o.status != OrderStatus.CANCELLED])

    pending_c = db.query(Order).filter(Order.status.in_([OrderStatus.PLACED, OrderStatus.CONFIRMED])).count()
    preparing_c = db.query(Order).filter(Order.status == OrderStatus.PREPARING).count()
    ready_c = db.query(Order).filter(Order.status == OrderStatus.READY).count()

    # Kitchen utilization
    slots = db.query(PickupSlot).filter(PickupSlot.slot_date == today_str).all()
    tot_max = sum([s.max_capacity for s in slots]) or 1
    tot_res = sum([s.reserved_capacity for s in slots])
    utilization_pct = min(100.0, round((tot_res / tot_max) * 100, 1))

    low_stock_c = db.query(InventoryItem).filter(InventoryItem.quantity < InventoryItem.min_threshold).count()

    return AdminDashboardOverview(
        today_orders_count=today_count,
        today_revenue=round(today_rev, 2),
        pending_orders=pending_c,
        preparing_orders=preparing_c,
        ready_orders=ready_c,
        kitchen_utilization_pct=utilization_pct,
        low_stock_count=low_stock_c
    )

@router.get("/timetable-analytics", response_model=List[TimetableDemandPoint])
def get_timetable_demand_analytics(
    target_date: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    """
    Analyzes student timetable break hours to aggregate expected food demand vs canteen kitchen capacity.
    """
    if not target_date:
        target_date = datetime.date.today().strftime("%Y-%m-%d")

    try:
        t_dt = datetime.datetime.strptime(target_date, "%Y-%m-%d").date()
    except ValueError:
        t_dt = datetime.date.today()

    weekday_idx = t_dt.weekday()

    # Fetch all break entries for all students on this weekday
    break_entries = db.query(TimetableEntry).filter(
        TimetableEntry.day_of_week == weekday_idx,
        TimetableEntry.entry_type.in_([EntryType.BREAK, EntryType.FREE])
    ).all()

    # Calculate expected break demand per 15-minute window
    slots = db.query(PickupSlot).filter(PickupSlot.slot_date == target_date).order_by(PickupSlot.start_time).all()
    if not slots:
        # Generate sample slots for analytics
        pass

    results = []
    for slot in slots:
        # Count break entries overlapping with this slot
        s_time = slot.start_time
        e_time = slot.end_time

        overlap_count = 0
        for b in break_entries:
            # Overlap condition: start < e_time and end > s_time
            if b.start_time < e_time and b.end_time > s_time:
                overlap_count += 1

        exp_demand = max(slot.reserved_capacity + 5, overlap_count * 2)
        is_high = exp_demand > slot.max_capacity

        results.append(TimetableDemandPoint(
            time_slot=f"{s_time} - {e_time}",
            expected_demand=exp_demand,
            kitchen_capacity=slot.max_capacity,
            is_high_demand=is_high
        ))

    return results

@router.get("/reports/sales")
def get_sales_report(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    completed_orders = db.query(Order).filter(Order.status != OrderStatus.CANCELLED).all()
    total_sales = sum([o.total_amount for o in completed_orders])

    # Sales by menu item
    items_summary = {}
    for o in completed_orders:
        for item in o.items:
            m = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
            name = m.name if m else f"Item #{item.menu_item_id}"
            if name not in items_summary:
                items_summary[name] = {"quantity": 0, "revenue": 0.0}
            items_summary[name]["quantity"] += item.quantity
            items_summary[name]["revenue"] += item.subtotal

    return {
        "total_orders": len(completed_orders),
        "total_revenue": round(total_sales, 2),
        "average_order_value": round(total_sales / len(completed_orders), 2) if completed_orders else 0.0,
        "items_breakdown": items_summary
    }

@router.get("/users", response_model=List[UserOut])
def get_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.put("/users/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    new_status: AccountStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_s = target_user.status
    target_user.status = new_status

    log_admin_action(
        db, admin.id, "CHANGE_USER_STATUS", "users",
        f"User {target_user.email} status changed", previous_value=old_s.value, new_value=new_status.value
    )

    db.commit()
    db.refresh(target_user)
    return target_user

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    res = []
    for l in logs:
        u_name = l.user.full_name if l.user else "System"
        res.append(AuditLogOut(
            id=l.id,
            user_name=u_name,
            action=l.action,
            resource=l.resource,
            details=l.details,
            previous_value=l.previous_value,
            new_value=l.new_value,
            timestamp=l.timestamp
        ))
    return res
