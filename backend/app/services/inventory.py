from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Order, OrderItem, Recipe, RecipeIngredient, InventoryItem, StockMovement, Notification

def reserve_inventory_for_order(db: Session, order: Order):
    """
    Atomically calculates expected recipe ingredient consumption for all order items,
    verifies stock sufficiency, and reserves/deducts stock with audit movement tracking.
    """
    # 1. Aggregate required ingredient quantities across all order items
    required_ingredients = {} # inventory_item_id -> total_qty_needed

    for item in order.items:
        recipe = db.query(Recipe).filter(Recipe.menu_item_id == item.menu_item_id).first()
        if recipe:
            for ing in recipe.ingredients:
                total_for_item = ing.quantity_required * item.quantity
                required_ingredients[ing.inventory_item_id] = required_ingredients.get(ing.inventory_item_id, 0.0) + total_for_item

    # 2. Check stock sufficiency for every ingredient
    for inv_id, qty_needed in required_ingredients.items():
        # With SQLite/Postgres DB transaction lock
        inv_item = db.query(InventoryItem).filter(InventoryItem.id == inv_id).with_for_update().first()
        if not inv_item:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inventory item ID {inv_id} not found."
            )
        if inv_item.quantity < qty_needed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{inv_item.name}'. Available: {inv_item.quantity} {inv_item.unit}, Required: {qty_needed} {inv_item.unit}."
            )

    # 3. Deduct stock and record stock movement
    for inv_id, qty_needed in required_ingredients.items():
        inv_item = db.query(InventoryItem).filter(InventoryItem.id == inv_id).first()
        inv_item.quantity -= qty_needed

        movement = StockMovement(
            inventory_item_id=inv_id,
            change_amount=-qty_needed,
            movement_type="RESERVATION",
            reference_order_id=order.id,
            reason=f"Stock reserved for Order #{order.order_number}"
        )
        db.add(movement)

        # Low-stock notification check
        if inv_item.quantity < inv_item.min_threshold:
            # Create system notification for admins
            pass

def release_inventory_for_order(db: Session, order: Order):
    """Releases reserved inventory when an order is cancelled before prep starts."""
    required_ingredients = {}
    for item in order.items:
        recipe = db.query(Recipe).filter(Recipe.menu_item_id == item.menu_item_id).first()
        if recipe:
            for ing in recipe.ingredients:
                total_for_item = ing.quantity_required * item.quantity
                required_ingredients[ing.inventory_item_id] = required_ingredients.get(ing.inventory_item_id, 0.0) + total_for_item

    for inv_id, qty_to_release in required_ingredients.items():
        inv_item = db.query(InventoryItem).filter(InventoryItem.id == inv_id).first()
        if inv_item:
            inv_item.quantity += qty_to_release
            movement = StockMovement(
                inventory_item_id=inv_id,
                change_amount=qty_to_release,
                movement_type="RELEASE",
                reference_order_id=order.id,
                reason=f"Stock released due to cancellation of Order #{order.order_number}"
            )
            db.add(movement)
