import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import (
    User, UserRole, AccountStatus, StudentProfile, StaffProfile,
    MenuCategory, MenuItem, Recipe, RecipeIngredient, InventoryItem,
    PickupSlot, Timetable, TimetableEntry, EntryType
)
from app.auth import hash_password

def seed_database():
    print("Seeding database with 50 distinct items with 100% authentic dish-matching images...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Users & Accounts
        student_user = db.query(User).filter(User.email == "student@example.com").first()
        if not student_user:
            student_user = User(
                email="student@example.com",
                hashed_password=hash_password("password123"),
                full_name="Harsh Sharma",
                role=UserRole.STUDENT,
                status=AccountStatus.ACTIVE
            )
            db.add(student_user)
            db.flush()
            db.add(StudentProfile(user_id=student_user.id, student_id_number="STU-2026-001", department="Computer Science", year_of_study=3))

        staff_user = db.query(User).filter(User.email == "staff@example.com").first()
        if not staff_user:
            staff_user = User(
                email="staff@example.com",
                hashed_password=hash_password("password123"),
                full_name="Prof. Rajesh Kumar",
                role=UserRole.STAFF,
                status=AccountStatus.ACTIVE
            )
            db.add(staff_user)
            db.flush()
            db.add(StaffProfile(user_id=staff_user.id, staff_id_number="STAFF-2026-042", department="Mathematics"))

        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                hashed_password=hash_password("password123"),
                full_name="Canteen Operations Manager",
                role=UserRole.CANTEEN_ADMIN,
                status=AccountStatus.ACTIVE
            )
            db.add(admin_user)
            db.flush()

        # 2. Student Timetable setup
        if student_user:
            tt = db.query(Timetable).filter(Timetable.user_id == student_user.id).first()
            if not tt:
                tt = Timetable(user_id=student_user.id, title="Spring Semester Schedule", is_active=True)
                db.add(tt)
                db.flush()
                entries = [
                    TimetableEntry(timetable_id=tt.id, day_of_week=0, start_time="10:00", end_time="12:00", title="Data Structures", entry_type=EntryType.CLASS),
                    TimetableEntry(timetable_id=tt.id, day_of_week=0, start_time="12:00", end_time="12:45", title="Lunch Break", entry_type=EntryType.BREAK),
                    TimetableEntry(timetable_id=tt.id, day_of_week=0, start_time="12:45", end_time="14:00", title="Machine Learning", entry_type=EntryType.CLASS),
                ]
                db.add_all(entries)

        # 3. Pickup Slots setup
        slots_data = [
            ("11:30", "11:40", 20),
            ("11:40", "11:50", 20),
            ("11:50", "12:00", 20),
            ("12:00", "12:10", 25),
            ("12:10", "12:20", 25),
            ("12:20", "12:30", 25),
            ("12:30", "12:40", 25),
            ("12:40", "12:50", 20),
            ("13:00", "13:10", 20),
            ("13:10", "13:20", 20),
        ]
        today_str = datetime.date.today().isoformat()
        for st, et, cap in slots_data:
            existing_slot = db.query(PickupSlot).filter(PickupSlot.slot_date == today_str, PickupSlot.start_time == st, PickupSlot.end_time == et).first()
            if not existing_slot:
                db.add(PickupSlot(slot_date=today_str, start_time=st, end_time=et, max_capacity=cap, reserved_capacity=0, is_active=True))

        # 4. Inventory Raw Materials
        inv_data = [
            ("Rice", "kg", 500.0, 50.0, 45.0),
            ("Wheat Flour (Atta)", "kg", 400.0, 40.0, 35.0),
            ("Dosa Batter", "kg", 300.0, 30.0, 50.0),
            ("Chicken", "kg", 250.0, 20.0, 120.0),
            ("Paneer", "kg", 200.0, 15.0, 90.0),
            ("Vegetables Mix", "kg", 400.0, 40.0, 25.0),
            ("Milk", "liters", 500.0, 50.0, 30.0),
            ("Coffee Beans", "kg", 100.0, 10.0, 200.0),
            ("Tea Leaves", "kg", 100.0, 10.0, 150.0),
            ("Cooking Oil", "liters", 300.0, 30.0, 60.0),
            ("Spices & Masala", "kg", 150.0, 15.0, 100.0),
        ]
        inv_objs = {}
        for name, unit, qty, thresh, cost in inv_data:
            inv_item = db.query(InventoryItem).filter(InventoryItem.name == name).first()
            if not inv_item:
                inv_item = InventoryItem(name=name, unit=unit, quantity=qty, min_threshold=thresh, cost_per_unit=cost)
                db.add(inv_item)
                db.flush()
            else:
                inv_item.quantity = max(inv_item.quantity, qty)
            inv_objs[name] = inv_item

        # 5. Categories
        cat_names = [
            ("Breakfast", 1),
            ("Lunch", 2),
            ("Snacks", 3),
            ("Drinks", 4),
            ("Bakery & Desserts", 5),
        ]
        cat_objs = {}
        for cname, order in cat_names:
            c_item = db.query(MenuCategory).filter(MenuCategory.name == cname).first()
            if not c_item:
                c_item = MenuCategory(name=cname, display_order=order, description=f"Fresh {cname} Specials")
                db.add(c_item)
                db.flush()
            cat_objs[cname] = c_item

        # 6. Detailed 50 Food Items Catalog with 50 100% AUTHENTIC DISH MATCHING Images
        items_data = [
            # BREAKFAST (10 items)
            ("Crispy Masala Dosa", "Golden crispy dosa filled with spiced potato masala, served with coconut chutney & sambar.", 80.0, "Breakfast", 10, "/images/menu/crispy-masala-dosa.jpg", 220, "Gluten"),
            ("Idli Sambar (2 pcs)", "Steamed fluffy rice cakes served with hot lentil sambar and fresh coconut chutney.", 40.0, "Breakfast", 5, "/images/menu/idli-sambar.jpg", 150, "Vegan"),
            ("Ven Pongal", "Traditional South Indian rice and moong dal ghee pongal tempered with cashews & black pepper.", 60.0, "Breakfast", 5, "/images/menu/ven-pongal.jpg", 250, "Nuts, Dairy"),
            ("Medu Vada (2 pcs)", "Crispy fried lentil donuts served with spicy sambar and mint chutney.", 50.0, "Breakfast", 5, "/images/menu/medu-vada.jpg", 200, "Vegan"),
            ("Mysore Bonda (4 pcs)", "Golden fried flour bondas crisp outside and fluffy inside, served with ginger chutney.", 50.0, "Breakfast", 5, "/images/menu/mysore-bonda.jpg", 240, "Gluten"),
            ("Onion Rava Uttapam", "Thick savory pancake topped with finely chopped onions, green chilies, and coriander.", 75.0, "Breakfast", 10, "/images/menu/onion-rava-uttapam.jpg", 230, "Gluten"),
            ("Rava Upma", "Roasted semolina cooked with mustard seeds, curry leaves, cashews, and fresh vegetables.", 45.0, "Breakfast", 5, "/images/menu/rava-upma.jpg", 180, "Nuts"),
            ("Poori Sagu (3 pcs)", "Deep-fried fluffy wheat pooris served with flavorful potato sagu gravy.", 70.0, "Breakfast", 10, "/images/menu/poori-sagu.jpg", 320, "Gluten"),
            ("Oats & Dry Fruit Porridge", "Healthy warm oats cooked in milk topped with almonds, raisins, and honey.", 65.0, "Breakfast", 5, "/images/menu/oats-porridge.jpg", 210, "Nuts, Dairy"),
            ("Set Dosa (3 pcs)", "Soft sponge dosas served in a set of 3 with veg sagu and red chutney.", 70.0, "Breakfast", 10, "/images/menu/set-dosa.jpg", 260, "Gluten"),

            # LUNCH (10 items)
            ("Chicken Rice / Biryani", "Aromatic Hyderabadi chicken biryani cooked with dum spices, served with raita and mirchi ka salan.", 160.0, "Lunch", 15, "/images/menu/chicken-biryani.jpg", 550, "Spicy"),
            ("Deluxe Veg Thali", "Complete thali with Paneer Butter Masala, Dal Tadka, 2 Rotis, Veg Pulao, Curd, Gulab Jamun & Pickle.", 140.0, "Lunch", 12, "/images/menu/deluxe-veg-thali.jpg", 620, "Dairy, Gluten"),
            ("Special Non-Veg Thali", "Rich thali featuring Butter Chicken, Egg Curry, 2 Naans, Jeera Rice, Salad & Sweet.", 190.0, "Lunch", 15, "/images/menu/special-non-veg-thali.jpg", 720, "Dairy, Egg"),
            ("Paneer Butter Masala Meal", "Cottage cheese cubes simmered in creamy tomato butter gravy with 2 Butter Naans & Jeera Rice.", 150.0, "Lunch", 12, "/images/menu/paneer-butter-masala.jpg", 480, "Dairy, Nuts"),
            ("Chole Bhature (2 pcs)", "Spicy Punjabi chickpea curry served with 2 large puffed bhatures, onions & lemon pickle.", 110.0, "Lunch", 10, "/images/menu/chole-bhature.jpg", 510, "Gluten"),
            ("Rajma Chawal Bowl", "Classic North Indian red kidney beans curry served over steaming hot basmati rice.", 90.0, "Lunch", 8, "/images/menu/rajma-chawal.jpg", 380, "Vegan"),
            ("South Indian Meals", "Traditional thali served with Rice, Sambar, Rasam, Kootu, Poriyal, Curd, Papad & Payasam.", 120.0, "Lunch", 10, "/images/menu/south-indian-meals.jpg", 450, "Dairy"),
            ("Chicken Curry Rice", "Homestyle tender chicken curry served with steamed basmati rice and onion salad.", 150.0, "Lunch", 12, "/images/menu/chicken-curry-rice.jpg", 490, "Spicy"),
            ("Egg Fried Rice", "Wok-tossed basmati rice with scrambled eggs, fresh spring onions, and oriental sauces.", 110.0, "Lunch", 10, "/images/menu/egg-fried-rice.jpg", 410, "Egg"),
            ("Curd Rice with Pickle", "Soothing chilled rice mixed with curd, tempered with mustard, curry leaves & pomegranate.", 60.0, "Lunch", 5, "/images/menu/curd-rice-pickle.jpg", 250, "Dairy"),

            # SNACKS (10 items)
            ("Hot Samosa (2 pcs)", "Crispy golden fried pastry stuffed with spiced potatoes and peas, served with green chutney.", 30.0, "Snacks", 5, "/images/menu/hot-samosa.jpg", 220, "Gluten"),
            ("Iced Cold Coffee", "Double shot dark roast espresso blended with chilled milk and ice cream.", 80.0, "Snacks", 5, "/images/menu/iced-cold-coffee.jpg", 180, "Dairy"),
            ("Mumbai Pav Bhaji", "Spiced mashed vegetable curry served with 2 butter-toasted soft pav buns.", 90.0, "Snacks", 10, "/images/menu/mumbai-pav-bhaji.jpg", 350, "Dairy, Gluten"),
            ("Crispy Veg Cutlet (2 pcs)", "Breaded vegetable cutlets fried crisp, served with tomato ketchup & coriander dip.", 45.0, "Snacks", 5, "/images/menu/crispy-veg-cutlet.jpg", 190, "Gluten"),
            ("Bread Pakora (2 pcs)", "Spiced potato sandwich dipped in gram flour batter and fried golden.", 35.0, "Snacks", 5, "/images/menu/bread-pakora.jpg", 210, "Gluten"),
            ("Bombay Vada Pav (2 pcs)", "Spiced potato vada inside soft bun with garlic chutney & fried green chili.", 50.0, "Snacks", 5, "/images/menu/bombay-vada-pav.jpg", 260, "Gluten"),
            ("Salted French Fries", "Golden crispy potato fries sprinkled with sea salt & herbs.", 70.0, "Snacks", 8, "/images/menu/salted-french-fries.jpg", 280, "Vegan"),
            ("Chicken Kathi Roll", "Grilled spiced chicken tikka wrapped in flaky paratha roll with onions & sauces.", 110.0, "Snacks", 10, "/images/menu/chicken-kathi-roll.jpg", 340, "Gluten"),
            ("Cheese Garlic Bread (4 pcs)", "Toasted baguette slices topped with garlic butter and melted mozzarella cheese.", 85.0, "Snacks", 8, "/images/menu/cheese-garlic-bread.jpg", 290, "Dairy, Gluten"),
            ("Pani Puri (8 pcs)", "Crispy puri shells filled with spiced potato-sprouts mixture and chilled tangy mint water.", 40.0, "Snacks", 5, "/images/menu/pani-puri.jpg", 140, "Gluten"),

            # DRINKS (10 items)
            ("Fresh Mango Lassi", "Creamy yoghurt drink blended with sweet Alphonso mango pulp.", 70.0, "Drinks", 5, "/images/menu/fresh-mango-lassi.jpg", 210, "Dairy"),
            ("Kulhad Masala Chai", "Fresh brewed ginger cardamom tea served in authentic clay kulhad cup.", 25.0, "Drinks", 5, "/images/menu/kulhad-masala-chai.jpg", 90, "Dairy"),
            ("Sweet Punjabi Lassi", "Rich whipped sweet curd drink topped with fresh malai layer.", 60.0, "Drinks", 5, "/images/menu/sweet-punjabi-lassi.jpg", 220, "Dairy"),
            ("Fresh Lime Soda", "Chilled sparkling soda with fresh lime juice, salt and mint.", 40.0, "Drinks", 5, "/images/menu/fresh-lime-soda.jpg", 60, "Vegan"),
            ("Cold Badam Milk", "Chilled milk infused with almonds, saffron, and cardamom.", 50.0, "Drinks", 5, "/images/menu/cold-badam-milk.jpg", 190, "Nuts, Dairy"),
            ("Espresso Macchiato", "Double shot dark roast espresso topped with silky velvet milk foam.", 120.0, "Drinks", 5, "/images/menu/espresso-macchiato.jpg", 110, "Dairy"),
            ("Cold Brew Iced Tea", "Refreshing peach-infused iced black tea served with lemon slices.", 65.0, "Drinks", 5, "/images/menu/cold-brew-iced-tea.jpg", 80, "Vegan"),
            ("Fresh Orange Juice", "100% freshly squeezed Valencia oranges with pulp.", 75.0, "Drinks", 5, "/images/menu/fresh-orange-juice.jpg", 110, "Vegan"),
            ("Classic Hot Chocolate", "Rich Belgian dark chocolate melted with whole steamed milk.", 95.0, "Drinks", 5, "/images/menu/classic-hot-chocolate.jpg", 240, "Dairy"),
            ("Rose Milk Chiller", "Sweet chilled milk flavored with aromatic organic rose syrup and basil seeds.", 55.0, "Drinks", 5, "/images/menu/rose-milk-chiller.jpg", 170, "Dairy"),

            # BAKERY & DESSERTS (10 items)
            ("Belgian Dark Chocolate Brownie", "Warm dark chocolate fudge brownie topped with chocolate drizzle.", 90.0, "Bakery & Desserts", 5, "/images/menu/belgian-chocolate-brownie.jpg", 310, "Dairy, Gluten"),
            ("Hot Gulab Jamun (2 pcs)", "Soft milk solid dumplings fried and soaked in warm cardamom sugar syrup.", 50.0, "Bakery & Desserts", 5, "/images/menu/hot-gulab-jamun.jpg", 260, "Dairy"),
            ("Kolkata Rasgulla (2 pcs)", "Spongy cottage cheese balls soaked in light sugar syrup.", 45.0, "Bakery & Desserts", 5, "/images/menu/kolkata-rasgulla.jpg", 180, "Dairy"),
            ("Chocolate Fudge Sundae", "Vanilla ice cream topped with hot chocolate fudge, nuts, and cherry.", 110.0, "Bakery & Desserts", 5, "/images/menu/chocolate-fudge-sundae.jpg", 350, "Dairy, Nuts"),
            ("Red Velvet Cupcake", "Moist red velvet sponge topped with rich cream cheese frosting.", 75.0, "Bakery & Desserts", 5, "/images/menu/red-velvet-cupcake.jpg", 280, "Dairy, Gluten"),
            ("Classic New York Cheesecake", "Creamy baked cheesecake with a graham cracker crust.", 130.0, "Bakery & Desserts", 5, "/images/menu/classic-cheesecake.jpg", 410, "Dairy, Gluten"),
            ("Crispy Jalebi (250g)", "Spiral fried batter soaked in saffron sugar syrup, served warm.", 70.0, "Bakery & Desserts", 5, "/images/menu/crispy-jalebi.jpg", 320, "Gluten"),
            ("Butter Croissant", "Flaky, buttery French pastry baked to golden perfection.", 85.0, "Bakery & Desserts", 5, "/images/menu/butter-croissant.jpg", 270, "Dairy, Gluten"),
            ("Blueberry Muffin", "Soft bakery muffin packed with sweet blueberries.", 65.0, "Bakery & Desserts", 5, "/images/menu/blueberry-muffin.jpg", 230, "Dairy, Gluten"),
            ("Saffron Kheer / Payasam", "Traditional rice pudding infused with saffron, cardamom, and toasted nuts.", 60.0, "Bakery & Desserts", 5, "/images/menu/saffron-kheer-payasam.jpg", 210, "Dairy, Nuts"),
        ]

        for name, desc, price, cat_name, prep, img, cal, alg in items_data:
            category = cat_objs.get(cat_name) or cat_objs["Breakfast"]
            m_item = db.query(MenuItem).filter(MenuItem.name == name).first()
            if not m_item:
                m_item = MenuItem(
                    name=name,
                    description=desc,
                    price=price,
                    category_id=category.id,
                    prep_time_mins=prep,
                    image_url=img,
                    calories=cal,
                    allergens=alg,
                    is_available=True
                )
                db.add(m_item)
                db.flush()
            else:
                m_item.description = desc
                m_item.price = price
                m_item.category_id = category.id
                m_item.prep_time_mins = prep
                m_item.image_url = img
                m_item.calories = cal
                m_item.allergens = alg
                m_item.is_available = True

            # Attach Recipe & Recipe Ingredients
            recipe = db.query(Recipe).filter(Recipe.menu_item_id == m_item.id).first()
            if not recipe:
                recipe = Recipe(menu_item_id=m_item.id, name=f"Recipe for {name}", notes="Standard canteen prep protocol.")
                db.add(recipe)
                db.flush()

                main_inv = inv_objs.get("Rice") or inv_objs.get("Wheat Flour (Atta)")
                if main_inv:
                    db.add(RecipeIngredient(recipe_id=recipe.id, inventory_item_id=main_inv.id, quantity_required=0.1))

        db.commit()
        print("Database successfully seeded with 50 items and authentic food images!")
    except Exception as e:
        db.rollback()
        print("Seeding error:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
