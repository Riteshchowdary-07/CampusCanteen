import urllib.request
import json
import sqlite3
import re

# Item mapping with specific search query terms to get real food photos matching dish names
items_queries = [
    # BREAKFAST
    ("Crispy Masala Dosa", "masala dosa"),
    ("Idli Sambar (2 pcs)", "idli sambar"),
    ("Ven Pongal", "pongal dish"),
    ("Medu Vada (2 pcs)", "medu vada"),
    ("Mysore Bonda (4 pcs)", "bonda indian food"),
    ("Onion Rava Uttapam", "uttapam"),
    ("Rava Upma", "upma indian food"),
    ("Poori Sagu (3 pcs)", "poori bhaji"),
    ("Oats & Dry Fruit Porridge", "oats porridge bowl"),
    ("Set Dosa (3 pcs)", "south indian dosa"),

    # LUNCH
    ("Chicken Rice / Biryani", "chicken biryani"),
    ("Deluxe Veg Thali", "indian thali"),
    ("Special Non-Veg Thali", "butter chicken naan thali"),
    ("Paneer Butter Masala Meal", "paneer butter masala"),
    ("Chole Bhature (2 pcs)", "chole bhature"),
    ("Rajma Chawal Bowl", "rajma chawal"),
    ("South Indian Meals", "south indian meal rice"),
    ("Chicken Curry Rice", "chicken curry rice"),
    ("Egg Fried Rice", "egg fried rice"),
    ("Curd Rice with Pickle", "curd rice"),

    # SNACKS
    ("Hot Samosa (2 pcs)", "samosa"),
    ("Iced Cold Coffee", "iced cold coffee"),
    ("Mumbai Pav Bhaji", "pav bhaji"),
    ("Crispy Veg Cutlet (2 pcs)", "vegetable cutlet"),
    ("Bread Pakora (2 pcs)", "pakora indian snack"),
    ("Bombay Vada Pav (2 pcs)", "vada pav"),
    ("Salted French Fries", "french fries"),
    ("Chicken Kathi Roll", "chicken kathi roll"),
    ("Cheese Garlic Bread (4 pcs)", "garlic bread cheese"),
    ("Pani Puri (8 pcs)", "pani puri golgappa"),

    # DRINKS
    ("Fresh Mango Lassi", "mango lassi"),
    ("Kulhad Masala Chai", "masala chai tea"),
    ("Sweet Punjabi Lassi", "sweet lassi drink"),
    ("Fresh Lime Soda", "fresh lime soda mint"),
    ("Cold Badam Milk", "badam milk almond drink"),
    ("Espresso Macchiato", "espresso macchiato coffee"),
    ("Cold Brew Iced Tea", "iced tea lemon"),
    ("Fresh Orange Juice", "fresh orange juice"),
    ("Classic Hot Chocolate", "hot chocolate mug"),
    ("Rose Milk Chiller", "rose milk drink"),

    # BAKERY & DESSERTS
    ("Belgian Dark Chocolate Brownie", "chocolate brownie fudge"),
    ("Hot Gulab Jamun (2 pcs)", "gulab jamun sweet"),
    ("Kolkata Rasgulla (2 pcs)", "rasgulla sweet"),
    ("Chocolate Fudge Sundae", "ice cream sundae chocolate"),
    ("Red Velvet Cupcake", "red velvet cupcake"),
    ("Classic New York Cheesecake", "cheesecake slice"),
    ("Crispy Jalebi (250g)", "jalebi indian sweet"),
    ("Butter Croissant", "butter croissant pastry"),
    ("Blueberry Muffin", "blueberry muffin bakery"),
    ("Saffron Kheer / Payasam", "kheer rice pudding")
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
used_photo_ids = set()
matched_dict = {}

print("Searching Unsplash API for exact food item images...")

for name, query in items_queries:
    encoded_q = urllib.parse.quote(query)
    url = f"https://unsplash.com/napi/search/photos?query={encoded_q}&per_page=10"
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode('utf-8'))
        results = data.get('results', [])
        chosen_url = None
        for r in results:
            pid = r['id']
            if pid not in used_photo_ids:
                used_photo_ids.add(pid)
                raw_url = r['urls']['raw']
                chosen_url = f"{raw_url}&w=600&auto=format&fit=crop&q=60"
                break
        if chosen_url:
            matched_dict[name] = chosen_url
            print(f"✓ Mapped '{name}' -> Unsplash ID: {pid}")
        else:
            print(f"⚠ Fallback for '{name}'")
    except Exception as e:
        print(f"Error querying for '{name}': {e}")

print(f"\nSuccessfully matched {len(matched_dict)} / {len(items_queries)} items.")

# Update SQLite Database Directly
conn = sqlite3.connect('smart_canteen.db')
cursor = conn.cursor()

for name, img_url in matched_dict.items():
    cursor.execute("UPDATE menu_items SET image_url = ? WHERE name = ?", (img_url, name))

conn.commit()
conn.close()

print("SQLite Database successfully updated with exact matching food item images!")
