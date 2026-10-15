from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PickupSlot, User, UserRole
from app.schemas import PickupSlotOut, SlotRecommendationRequest, SlotRecommendationResponse
from app.auth import get_current_user
from app.permissions import require_roles
from app.services.scheduler import get_recommended_pickup_slots
from app.services.audit import log_admin_action

router = APIRouter(prefix="/pickup-slots", tags=["Pickup Slots"])

@router.get("", response_model=List[PickupSlotOut])
def get_pickup_slots(
    target_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not target_date:
        target_date = datetime.date.today().strftime("%Y-%m-%d")

    slots = db.query(PickupSlot).filter(
        PickupSlot.slot_date == target_date,
        PickupSlot.is_active == True
    ).order_by(PickupSlot.start_time).all()

    res = []
    for s in slots:
        avail = max(0, s.max_capacity - s.reserved_capacity)
        res.append(PickupSlotOut(
            id=s.id,
            slot_date=s.slot_date,
            start_time=s.start_time,
            end_time=s.end_time,
            max_capacity=s.max_capacity,
            reserved_capacity=s.reserved_capacity,
            available_capacity=avail,
            is_full=(avail == 0),
            is_active=s.is_active
        ))
    return res

@router.post("/recommend", response_model=SlotRecommendationResponse)
def recommend_pickup_slot(
    req: SlotRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes the Smart Timetable-Aware Capacity-Constrained Scheduling Engine.
    """
    if not req.item_ids:
        raise HTTPException(status_code=400, detail="Cart cannot be empty for slot recommendation.")

    return get_recommended_pickup_slots(db, current_user.id, req.item_ids, req.target_date)

@router.put("/{slot_id}/capacity", response_model=PickupSlotOut)
def update_slot_capacity(
    slot_id: int,
    max_capacity: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    slot = db.query(PickupSlot).filter(PickupSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Pickup slot not found.")

    old_cap = slot.max_capacity
    slot.max_capacity = max_capacity
    db.commit()
    db.refresh(slot)

    log_admin_action(
        db, admin.id, "UPDATE_SLOT_CAPACITY", "pickup_slots",
        f"Slot {slot.start_time}-{slot.end_time} capacity changed from {old_cap} to {max_capacity}"
    )
    db.commit()

    avail = max(0, slot.max_capacity - slot.reserved_capacity)
    return PickupSlotOut(
        id=slot.id,
        slot_date=slot.slot_date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        max_capacity=slot.max_capacity,
        reserved_capacity=slot.reserved_capacity,
        available_capacity=avail,
        is_full=(avail == 0),
        is_active=slot.is_active
    )
