import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, AccountStatus, StudentProfile, StaffProfile,
    Timetable, TimetableEntry, EntryType, MenuCategory, MenuItem,
    InventoryItem, Recipe, RecipeIngredient, PickupSlot, Order, OrderItem, OrderStatus, Token, TokenStatus, Invoice
)
from app.auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "student@example.com").first():
            print("Database already seeded.")
            return

        print("Seeding Smart Canteen Database...")

        # 1. Create Demo Accounts
        student_user = User(
            email="student@example.com",
            hashed_password=hash_password("password123"),
            full_name="Harsh Sharma",
            role=UserRole.STUDENT,
            status=AccountStatus.ACTIVE
        )
        staff_user = User(
            email="staff@example.com",
            hashed_password=hash_password("password123"),
            full_name="Prof. Rajesh Verma",
            role=UserRole.STAFF,
            status=AccountStatus.ACTIVE
        )
        admin_user = User(
            email="admin@example.com",
            hashed_password=hash_password("password123"),
            full_name="Canteen Manager Anita",
            role=UserRole.CANTEEN_ADMIN,
            status=AccountStatus.ACTIVE
        )
        db.add_all([student_user, staff_user, admin_user])
        db.flush()

        sp = StudentProfile(user_id=student_user.id, student_id_number="CS2026-089", department="Computer Science", year_of_study=3)
        st = StaffProfile(user_id=staff_user.id, staff_id_number="EMP-771", department="Electrical Engineering")
        db.add_all([sp, st])

        # 2. Student Timetable matching Demo Scenario (Section 2 & 51)
        tt = Timetable(user_id=student_user.id, title="Spring 2026 Semester Schedule", is_active=True)
        db.add(tt)
        db.flush()

        # Seed Mon to Fri timetable entries
        for day in range(5):
            entries = [
                TimetableEntry(timetable_id=tt.id, day_of_week=day, start_time="10:00", end_time="12:00", title="Data Structures & Algorithms", entry_type=EntryType.CLASS),
                TimetableEntry(timetable_id=tt.id, day_of_week=day, start_time="12:00", end_time="12:45", title="Lunch Break", entry_type=EntryType.BREAK),
                TimetableEntry(timetable_id=tt.id, day_of_week=day, start_time="12:45", end_time="14:00", title="Machine Learning", entry_type=EntryType.CLASS),
                TimetableEntry(timetable_id=tt.id, day_of_week=day, start_time="14:00", end_time="15:00", title="Cloud Computing Lab", entry_type=EntryType.CLASS),
                TimetableEntry(timetable_id=tt.id, day_of_week=day, start_time="15:00", end_time="15:30", title="Evening Tea Break", entry_type=EntryType.BREAK),
            ]
            db.add_all(entries)

        # 3. Menu Categories
        cat_meals = MenuCategory(name="Meals", description="Hearty main course meals", display_order=1)
        cat_snack = MenuCategory(name="Snacks", description="Quick bites and savories", display_order=2)
        cat_bev = MenuCategory(name="Beverages", description="Hot & cold drinks", display_order=3)
        cat_dessert = MenuCategory(name="Desserts", description="Sweet treats", display_order=4)
        db.add_all([cat_meals, cat_snack, cat_bev, cat_dessert])
        db.flush()

        # 4. Menu Items
        item1 = MenuItem(
            category_id=cat_meals.id,
            name="Chicken Rice",
            description="Tender seasoned chicken served over basmati rice with aromatic curry",
            price=80.0,
            prep_time_mins=15,
            image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop",
            is_available=True,
            calories=650,
            allergens="Dairy"
        )
        item2 = MenuItem(
            category_id=cat_meals.id,
            name="Deluxe Veg Thali",
            description="Complete balanced meal with Paneer Butter Masala, Dal Tadka, Rice & Roti",
            price=70.0,
            prep_time_mins=10,
            image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop",
            is_available=True,
            calories=580,
            allergens="Dairy, Gluten"
        )
        item3 = MenuItem(
            category_id=cat_snack.id,
            name="Crispy Masala Dosa",
            description="Golden rice crepes filled with spiced potato masala, served with sambar & chutney",
            price=50.0,
            prep_time_mins=12,
            image_url="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop",
            is_available=True,
            calories=420,
            allergens="Mustard"
        )
        item4 = MenuItem(
            category_id=cat_bev.id,
            name="Iced Cold Coffee",
            description="Rich blended cold espresso coffee topped with chocolate drizzle",
            price=40.0,
            prep_time_mins=5,
            image_url="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop",
            is_available=True,
            calories=210,
            allergens="Milk"
        )
        item5 = MenuItem(
            category_id=cat_snack.id,
            name="Hot Samosa (2 pcs)",
            description="Crispy pastry stuffed with spiced potatoes and green peas",
            price=25.0,
            prep_time_mins=5,
            image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop",
            is_available=True,
            calories=310,
            allergens="Gluten"
        )
        db.add_all([item1, item2, item3, item4, item5])
        db.flush()

        # 5. Inventory Items (with Chicken as LOW STOCK per Section 52)
        inv_rice = InventoryItem(name="Basmati Rice", category="Grains", quantity=25.0, unit="kg", min_threshold=10.0, max_threshold=100.0, cost_per_unit=60.0)
        inv_chicken = InventoryItem(name="Fresh Chicken", category="Meat", quantity=4.0, unit="kg", min_threshold=10.0, max_threshold=50.0, cost_per_unit=220.0) # Low stock alert!
        inv_oil = InventoryItem(name="Cooking Oil", category="Pantry", quantity=18.0, unit="L", min_threshold=5.0, max_threshold=50.0, cost_per_unit=140.0)
        inv_spices = InventoryItem(name="Mixed Spices", category="Spices", quantity=5.0, unit="kg", min_threshold=2.0, max_threshold=20.0, cost_per_unit=300.0)
        inv_paneer = InventoryItem(name="Fresh Paneer", category="Dairy", quantity=8.0, unit="kg", min_threshold=5.0, max_threshold=30.0, cost_per_unit=280.0)
        db.add_all([inv_rice, inv_chicken, inv_oil, inv_spices, inv_paneer])
        db.flush()

        # 6. Recipe for Chicken Rice
        rec_cr = Recipe(menu_item_id=item1.id, name="Chicken Rice Standard Recipe", notes="200g Rice + 100g Chicken per plate")
        db.add(rec_cr)
        db.flush()
        db.add_all([
            RecipeIngredient(recipe_id=rec_cr.id, inventory_item_id=inv_rice.id, quantity_required=0.20),
            RecipeIngredient(recipe_id=rec_cr.id, inventory_item_id=inv_chicken.id, quantity_required=0.10),
            RecipeIngredient(recipe_id=rec_cr.id, inventory_item_id=inv_oil.id, quantity_required=0.01),
            RecipeIngredient(recipe_id=rec_cr.id, inventory_item_id=inv_spices.id, quantity_required=0.005),
        ])

        # 7. Pickup Slots for Today
        today_str = datetime.date.today().strftime("%Y-%m-%d")
        slot1 = PickupSlot(slot_date=today_str, start_time="12:00", end_time="12:10", max_capacity=10, reserved_capacity=8, is_active=True)
        slot2 = PickupSlot(slot_date=today_str, start_time="12:10", end_time="12:20", max_capacity=10, reserved_capacity=10, is_active=True) # Full slot
        slot3 = PickupSlot(slot_date=today_str, start_time="12:20", end_time="12:30", max_capacity=10, reserved_capacity=4, is_active=True) # Recommended slot!
        slot4 = PickupSlot(slot_date=today_str, start_time="12:30", end_time="12:40", max_capacity=10, reserved_capacity=2, is_active=True)
        slot5 = PickupSlot(slot_date=today_str, start_time="12:40", end_time="12:50", max_capacity=10, reserved_capacity=0, is_active=True)
        db.add_all([slot1, slot2, slot3, slot4, slot5])
        db.flush()

        # 8. Demo Pre-existing Orders for Admin Dashboard Overview
        ord1 = Order(
            order_number="ORD-10240",
            user_id=student_user.id,
            pickup_slot_id=slot1.id,
            status=OrderStatus.PREPARING,
            subtotal=80.0,
            tax=4.0,
            total_amount=84.0,
            notes="Extra spicy"
        )
        db.add(ord1)
        db.flush()

        db.add(OrderItem(order_id=ord1.id, menu_item_id=item1.id, quantity=1, unit_price=80.0, subtotal=80.0))
        db.add(Token(token_number="A141", order_id=ord1.id, status=TokenStatus.ACTIVE))
        db.add(Invoice(invoice_number="INV-2026-1001", order_id=ord1.id, user_id=student_user.id, amount=84.0, tax=4.0, status="PAID"))

        db.commit()
        print("Database Seeded Successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
