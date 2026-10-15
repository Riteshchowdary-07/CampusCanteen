from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MenuItem, MenuCategory, User, UserRole
from app.schemas import MenuItemOut, MenuItemCreate, MenuCategoryOut
from app.auth import get_current_user
from app.permissions import require_roles
from app.services.audit import log_admin_action

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("/categories", response_model=List[MenuCategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(MenuCategory).order_by(MenuCategory.display_order).all()

@router.get("/items", response_model=List[MenuItemOut])
def get_menu_items(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    available_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem)
    if available_only:
        query = query.filter(MenuItem.is_available == True)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    if search:
        query = query.filter(MenuItem.name.ilike(f"%{search}%"))

    items = query.all()
    res = []
    for item in items:
        cat_name = item.category.name if item.category else None
        res.append(MenuItemOut(
            id=item.id,
            name=item.name,
            description=item.description,
            price=item.price,
            category_id=item.category_id,
            category_name=cat_name,
            prep_time_mins=item.prep_time_mins,
            image_url=item.image_url,
            is_available=item.is_available,
            calories=item.calories,
            allergens=item.allergens
        ))
    return res

@router.post("/items", response_model=MenuItemOut)
def create_menu_item(
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    new_item = MenuItem(**item_data.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    log_admin_action(db, admin.id, "CREATE_MENU_ITEM", "menu_items", f"Created menu item '{new_item.name}' with price {new_item.price}")
    db.commit()

    cat_name = new_item.category.name if new_item.category else None
    return MenuItemOut(
        id=new_item.id,
        name=new_item.name,
        description=new_item.description,
        price=new_item.price,
        category_id=new_item.category_id,
        category_name=cat_name,
        prep_time_mins=new_item.prep_time_mins,
        image_url=new_item.image_url,
        is_available=new_item.is_available,
        calories=new_item.calories,
        allergens=new_item.allergens
    )

@router.put("/items/{item_id}", response_model=MenuItemOut)
def update_menu_item(
    item_id: int,
    item_data: MenuItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found.")

    old_price = item.price
    for key, val in item_data.model_dump().items():
        setattr(item, key, val)

    db.commit()
    db.refresh(item)

    log_admin_action(
        db, admin.id, "UPDATE_MENU_ITEM", "menu_items",
        f"Updated '{item.name}'", previous_value=f"Price: {old_price}", new_value=f"Price: {item.price}"
    )
    db.commit()

    cat_name = item.category.name if item.category else None
    return MenuItemOut(
        id=item.id,
        name=item.name,
        description=item.description,
        price=item.price,
        category_id=item.category_id,
        category_name=cat_name,
        prep_time_mins=item.prep_time_mins,
        image_url=item.image_url,
        is_available=item.is_available,
        calories=item.calories,
        allergens=item.allergens
    )
