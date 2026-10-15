from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Timetable, TimetableEntry, User, UserRole
from app.schemas import TimetableCreate, TimetableOut, TimetableEntryCreate
from app.auth import get_current_user

router = APIRouter(prefix="/timetable", tags=["Timetable"])

@router.get("", response_model=TimetableOut)
def get_user_timetable(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    timetable = db.query(Timetable).filter(
        Timetable.user_id == current_user.id,
        Timetable.is_active == True
    ).first()

    if not timetable:
        # Create default empty timetable for user
        timetable = Timetable(user_id=current_user.id, title="Weekly Class Schedule", is_active=True)
        db.add(timetable)
        db.commit()
        db.refresh(timetable)

    return timetable

@router.post("", response_model=TimetableOut)
def update_user_timetable(
    timetable_data: TimetableCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    timetable = db.query(Timetable).filter(
        Timetable.user_id == current_user.id,
        Timetable.is_active == True
    ).first()

    if not timetable:
        timetable = Timetable(user_id=current_user.id, title=timetable_data.title, is_active=True)
        db.add(timetable)
        db.flush()

    # Clear old entries and insert new schedule entries
    db.query(TimetableEntry).filter(TimetableEntry.timetable_id == timetable.id).delete()

    for entry_in in timetable_data.entries:
        entry_obj = TimetableEntry(
            timetable_id=timetable.id,
            day_of_week=entry_in.day_of_week,
            start_time=entry_in.start_time,
            end_time=entry_in.end_time,
            title=entry_in.title,
            entry_type=entry_in.entry_type
        )
        db.add(entry_obj)

    db.commit()
    db.refresh(timetable)
    return timetable
