from typing import List, Dict, Any
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Order, OrderStatus, PickupSlot, User, UserRole
from app.schemas import OrderOut
from app.auth import get_current_user
from app.permissions import require_roles
from app.routers.orders import format_order_out

router = APIRouter(prefix="/kitchen", tags=["Kitchen Management"])

@router.get("/queue")
def get_kitchen_queue(
    target_date: str = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    if not target_date:
        target_date = datetime.date.today().strftime("%Y-%m-%d")

    slots = db.query(PickupSlot).filter(
        PickupSlot.slot_date == target_date,
        PickupSlot.is_active == True
    ).order_by(PickupSlot.start_time).all()

    queue_data = []
    for slot in slots:
        slot_orders = db.query(Order).filter(
            Order.pickup_slot_id == slot.id,
            Order.status.in_([OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY])
        ).order_by(Order.created_at).all()

        formatted_orders = [format_order_out(db, o) for o in slot_orders]
        
        is_overloaded = slot.reserved_capacity > slot.max_capacity

        queue_data.append({
            "slot_id": slot.id,
            "slot_time": f"{slot.start_time} - {slot.end_time}",
            "max_capacity": slot.max_capacity,
            "reserved_capacity": slot.reserved_capacity,
            "is_overloaded": is_overloaded,
            "orders": formatted_orders
        })

    return queue_data
