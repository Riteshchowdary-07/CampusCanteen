from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import InventoryItem, Recipe, RecipeIngredient, MenuItem, User, UserRole, StockMovement
from app.schemas import InventoryItemOut, InventoryItemCreate, RecipeOut, RecipeCreate
from app.auth import get_current_user
from app.permissions import require_roles
from app.services.audit import log_admin_action

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])

@router.get("", response_model=List[InventoryItemOut])
def get_inventory_items(
    low_stock_only: bool = False,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    query = db.query(InventoryItem)
    if low_stock_only:
        query = query.filter(InventoryItem.quantity < InventoryItem.min_threshold)

    items = query.order_by(InventoryItem.name).all()
    res = []
    for item in items:
        res.append(InventoryItemOut(
            id=item.id,
            name=item.name,
            category=item.category,
            quantity=item.quantity,
            unit=item.unit,
            min_threshold=item.min_threshold,
            max_threshold=item.max_threshold,
            cost_per_unit=item.cost_per_unit,
            is_low_stock=(item.quantity < item.min_threshold),
            updated_at=item.updated_at
        ))
    return res

@router.post("", response_model=InventoryItemOut)
def create_inventory_item(
    item_in: InventoryItemCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    existing = db.query(InventoryItem).filter(InventoryItem.name == item_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Ingredient '{item_in.name}' already exists.")

    new_item = InventoryItem(**item_in.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    log_admin_action(db, admin.id, "CREATE_INVENTORY_ITEM", "inventory_items", f"Added '{new_item.name}' ({new_item.quantity} {new_item.unit})")
    db.commit()

    return InventoryItemOut(
        id=new_item.id,
        name=new_item.name,
        category=new_item.category,
        quantity=new_item.quantity,
        unit=new_item.unit,
        min_threshold=new_item.min_threshold,
        max_threshold=new_item.max_threshold,
        cost_per_unit=new_item.cost_per_unit,
        is_low_stock=(new_item.quantity < new_item.min_threshold),
        updated_at=new_item.updated_at
    )

@router.put("/{item_id}", response_model=InventoryItemOut)
def update_inventory_stock(
    item_id: int,
    quantity: float,
    min_threshold: Optional[float] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found.")

    old_qty = item.quantity
    item.quantity = quantity
    if min_threshold is not None:
        item.min_threshold = min_threshold

    movement = StockMovement(
        inventory_item_id=item.id,
        change_amount=(quantity - old_qty),
        movement_type="ADJUSTMENT",
        reason=f"Manual inventory adjustment by admin {admin.full_name}"
    )
    db.add(movement)

    log_admin_action(
        db, admin.id, "UPDATE_INVENTORY", "inventory_items",
        f"Adjusted '{item.name}' stock", previous_value=f"{old_qty} {item.unit}", new_value=f"{quantity} {item.unit}"
    )

    db.commit()
    db.refresh(item)

    return InventoryItemOut(
        id=item.id,
        name=item.name,
        category=item.category,
        quantity=item.quantity,
        unit=item.unit,
        min_threshold=item.min_threshold,
        max_threshold=item.max_threshold,
        cost_per_unit=item.cost_per_unit,
        is_low_stock=(item.quantity < item.min_threshold),
        updated_at=item.updated_at
    )

@router.get("/recipes", response_model=List[RecipeOut])
def get_recipes(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    recipes = db.query(Recipe).all()
    res = []
    for r in recipes:
        ing_list = []
        for ing in r.ingredients:
            inv = db.query(InventoryItem).filter(InventoryItem.id == ing.inventory_item_id).first()
            ing_list.append({
                "inventory_item_id": ing.inventory_item_id,
                "inventory_item_name": inv.name if inv else "Unknown",
                "quantity_required": ing.quantity_required,
                "unit": inv.unit if inv else ""
            })
        res.append(RecipeOut(
            id=r.id,
            menu_item_id=r.menu_item_id,
            name=r.name,
            notes=r.notes,
            ingredients=ing_list
        ))
    return res

@router.post("/recipes", response_model=RecipeOut)
def create_recipe(
    recipe_in: RecipeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.CANTEEN_ADMIN]))
):
    # Check if recipe for menu item exists
    existing = db.query(Recipe).filter(Recipe.menu_item_id == recipe_in.menu_item_id).first()
    if existing:
        db.query(RecipeIngredient).filter(RecipeIngredient.recipe_id == existing.id).delete()
        recipe_obj = existing
        recipe_obj.name = recipe_in.name
        recipe_obj.notes = recipe_in.notes
    else:
        recipe_obj = Recipe(
            menu_item_id=recipe_in.menu_item_id,
            name=recipe_in.name,
            notes=recipe_in.notes
        )
        db.add(recipe_obj)
        db.flush()

    for ing_data in recipe_in.ingredients:
        ri = RecipeIngredient(
            recipe_id=recipe_obj.id,
            inventory_item_id=ing_data.inventory_item_id,
            quantity_required=ing_data.quantity_required
        )
        db.add(ri)

    db.commit()
    db.refresh(recipe_obj)

    return RecipeOut(
        id=recipe_obj.id,
        menu_item_id=recipe_obj.menu_item_id,
        name=recipe_obj.name,
        notes=recipe_obj.notes,
        ingredients=[]
    )
