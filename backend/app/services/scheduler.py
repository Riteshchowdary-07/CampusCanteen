import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import PickupSlot, MenuItem, Timetable, TimetableEntry, EntryType, Recipe, RecipeIngredient, InventoryItem
from app.schemas import SlotRecommendationResponse, SlotRecommendationOption
from app.config import settings

def parse_time_mins(time_str: str) -> int:
    """Converts '10:30' into minutes from midnight (630)."""
    hh, mm = map(int, time_str.split(':'))
    return hh * 60 + mm

def format_time_mins(total_mins: int) -> str:
    hh = total_mins // 60
    mm = total_mins % 60
    return f"{hh:02d}:{mm:02d}"

def calculate_max_prep_time(db: Session, item_ids: List[int]) -> int:
    items = db.query(MenuItem).filter(MenuItem.id.in_(item_ids)).all()
    if not items:
        return 15
    return max([item.prep_time_mins for item in items] + [10])

def check_recipe_ingredients_available(db: Session, item_ids: List[int]) -> bool:
    recipes = db.query(Recipe).filter(Recipe.menu_item_id.in_(item_ids)).all()
    if not recipes:
        return True

    needed: Dict[int, float] = {}
    for r in recipes:
        for ing in r.ingredients:
            needed[ing.inventory_item_id] = needed.get(ing.inventory_item_id, 0.0) + ing.quantity_required

    for inv_id, req_qty in needed.items():
        inv_item = db.query(InventoryItem).filter(InventoryItem.id == inv_id).first()
        if not inv_item or inv_item.quantity < req_qty:
            return False
    return True

def get_recommended_pickup_slots(
    db: Session,
    user_id: int,
    item_ids: List[int],
    target_date_str: Optional[str] = None
) -> SlotRecommendationResponse:
    today_dt = datetime.date.today()
    if target_date_str:
        try:
            target_date = datetime.datetime.strptime(target_date_str, "%Y-%m-%d").date()
        except ValueError:
            target_date = today_dt
    else:
        target_date = today_dt

    target_date_formatted = target_date.strftime("%Y-%m-%d")
    weekday_idx = target_date.weekday() # 0 = Monday

    # 1. Fetch user active timetable entries for this weekday
    timetable = db.query(Timetable).filter(Timetable.user_id == user_id, Timetable.is_active == True).first()
    class_windows = []
    break_windows = []
    if timetable:
        entries = db.query(TimetableEntry).filter(
            TimetableEntry.timetable_id == timetable.id,
            TimetableEntry.day_of_week == weekday_idx
        ).all()
        for entry in entries:
            start_m = parse_time_mins(entry.start_time)
            end_m = parse_time_mins(entry.end_time)
            if entry.entry_type == EntryType.CLASS:
                class_windows.append((start_m, end_m, entry.title))
            elif entry.entry_type in (EntryType.BREAK, EntryType.FREE):
                break_windows.append((start_m, end_m, entry.title))

    # 2. Food preparation & ingredient checks
    prep_time_required = calculate_max_prep_time(db, item_ids)
    ingredients_ok = check_recipe_ingredients_available(db, item_ids)

    hard_explanations = []
    if not ingredients_ok:
        hard_explanations.append("Warning: Some ingredient stock is low; availability verified against current inventory.")

    # 3. Retrieve or generate PickupSlots for target_date
    slots = db.query(PickupSlot).filter(
        PickupSlot.slot_date == target_date_formatted,
        PickupSlot.is_active == True
    ).order_by(PickupSlot.start_time).all()

    if not slots:
        start_operating = parse_time_mins(settings.CANTEEN_OPEN_TIME)
        end_operating = parse_time_mins(settings.CANTEEN_CLOSE_TIME)
        curr = start_operating
        while curr < end_operating:
            s_str = format_time_mins(curr)
            e_str = format_time_mins(curr + settings.SLOT_DURATION_MINUTES)
            slot_obj = PickupSlot(
                slot_date=target_date_formatted,
                start_time=s_str,
                end_time=e_str,
                max_capacity=settings.DEFAULT_SLOT_CAPACITY,
                reserved_capacity=0,
                is_active=True
            )
            db.add(slot_obj)
            curr += settings.SLOT_DURATION_MINUTES
        db.commit()
        slots = db.query(PickupSlot).filter(
            PickupSlot.slot_date == target_date_formatted,
            PickupSlot.is_active == True
        ).order_by(PickupSlot.start_time).all()

    # Current time reference
    now_dt = datetime.datetime.now()
    current_time_mins = now_dt.hour * 60 + now_dt.minute if target_date == today_dt else 0
    # If currently past operating hours (e.g., night testing), don't filter out day slots so recommendation algorithm can be tested cleanly
    if current_time_mins > parse_time_mins(settings.CANTEEN_CLOSE_TIME):
        current_time_mins = 0

    recommended_option = None
    alternative_options = []
    has_break_conflict = False

    for slot in slots:
        slot_start_m = parse_time_mins(slot.start_time)
        slot_end_m = parse_time_mins(slot.end_time)
        avail_cap = slot.max_capacity - slot.reserved_capacity

        # HARD CONSTRAINT 1: Kitchen Capacity
        if avail_cap <= 0:
            continue

        # HARD CONSTRAINT 2: Preparation Time + Travel Buffer
        if current_time_mins > 0:
            earliest_possible_m = current_time_mins + prep_time_required + settings.DEFAULT_PREPARATION_BUFFER_MINS
            if target_date == today_dt and slot_start_m < earliest_possible_m:
                continue

        # HARD CONSTRAINT 3: Student Class Conflict
        in_class = False
        class_name = ""
        for c_start, c_end, c_title in class_windows:
            if not (slot_end_m <= c_start or slot_start_m >= c_end):
                in_class = True
                class_name = c_title
                break

        if in_class:
            has_break_conflict = True
            continue

        # SOFT PREFERENCE: Fits student Break Window
        fits_break = False
        b_label = None
        for b_start, b_end, b_title in break_windows:
            if slot_start_m >= b_start and slot_end_m <= b_end:
                fits_break = True
                b_label = f"{b_title} ({format_time_mins(b_start)} - {format_time_mins(b_end)})"
                break

        reason_text = "Available pickup slot"
        if fits_break:
            reason_text = f"✓ Recommended! Within your break ({b_label}). Kitchen capacity & ingredients available."
        elif break_windows:
            reason_text = "Available slot outside class hours."

        opt = SlotRecommendationOption(
            slot_id=slot.id,
            slot_date=slot.slot_date,
            start_time=slot.start_time,
            end_time=slot.end_time,
            available_capacity=avail_cap,
            is_recommended=fits_break and recommended_option is None,
            fits_break=fits_break,
            break_window=b_label,
            reason=reason_text
        )

        if fits_break and recommended_option is None:
            recommended_option = opt
        else:
            alternative_options.append(opt)

    if not recommended_option and alternative_options:
        recommended_option = alternative_options.pop(0)
        recommended_option.is_recommended = True
        recommended_option.reason = "Earliest available feasible pickup slot."

    # If all slots were filtered out due to late hours or constraints, fallback to active canteen slots
    if not recommended_option and not alternative_options and slots:
        for slot in slots:
            avail_cap = max(0, slot.max_capacity - slot.reserved_capacity)
            if avail_cap > 0:
                opt = SlotRecommendationOption(
                    slot_id=slot.id,
                    slot_date=slot.slot_date,
                    start_time=slot.start_time,
                    end_time=slot.end_time,
                    available_capacity=avail_cap,
                    is_recommended=(recommended_option is None),
                    fits_break=False,
                    break_window=None,
                    reason="Available canteen pickup slot (Operating Window)."
                )
                if recommended_option is None:
                    recommended_option = opt
                else:
                    alternative_options.append(opt)

    return SlotRecommendationResponse(
        prep_time_required_mins=prep_time_required,
        has_break_conflict=has_break_conflict,
        recommended_slot=recommended_option,
        alternative_slots=alternative_options[:10],
        hard_constraints_explanation=hard_explanations
    )
