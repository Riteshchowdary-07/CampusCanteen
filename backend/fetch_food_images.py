import urllib.request
import urllib.parse
import json
import sqlite3
import re
import time

items_queries = [
    # BREAKFAST
    ("Crispy Masala Dosa", "masala dosa south indian food photo"),
    ("Idli Sambar (2 pcs)", "idli sambar chutney photo"),
    ("Ven Pongal", "ven pongal south indian photo"),
    ("Medu Vada (2 pcs)", "medu vada sambar photo"),
    ("Mysore Bonda (4 pcs)", "mysore bonda indian snack photo"),
    ("Onion Rava Uttapam", "onion uttapam photo"),
    ("Rava Upma", "rava upma indian food photo"),
    ("Poori Sagu (3 pcs)", "poori bhaji sagu photo"),
    ("Oats & Dry Fruit Porridge", "oats porridge fruit bowl photo"),
    ("Set Dosa (3 pcs)", "set dosa south indian photo"),

    # LUNCH
    ("Chicken Rice / Biryani", "hyderabadi chicken biryani photo"),
    ("Deluxe Veg Thali", "indian veg thali meal photo"),
    ("Special Non-Veg Thali", "indian non veg thali butter chicken photo"),
    ("Paneer Butter Masala Meal", "paneer butter masala naan photo"),
    ("Chole Bhature (2 pcs)", "chole bhature punjabi photo"),
    ("Rajma Chawal Bowl", "rajma chawal bowl photo"),
    ("South Indian Meals", "south indian meals thali banana leaf photo"),
    ("Chicken Curry Rice", "chicken curry rice indian photo"),
    ("Egg Fried Rice", "egg fried rice bowl photo"),
    ("Curd Rice with Pickle", "curd rice thayir sadam photo"),

    # SNACKS
    ("Hot Samosa (2 pcs)", "samosa indian snack photo"),
    ("Iced Cold Coffee", "iced cold coffee glass photo"),
    ("Mumbai Pav Bhaji", "mumbai pav bhaji photo"),
    ("Crispy Veg Cutlet (2 pcs)", "crispy veg cutlet photo"),
    ("Bread Pakora (2 pcs)", "bread pakora indian snack photo"),
    ("Bombay Vada Pav (2 pcs)", "mumbai vada pav photo"),
    ("Salted French Fries", "crispy french fries photo"),
    ("Chicken Kathi Roll", "chicken kathi roll wrap photo"),
    ("Cheese Garlic Bread (4 pcs)", "cheese garlic bread photo"),
    ("Pani Puri (8 pcs)", "pani puri golgappa photo"),

    # DRINKS
    ("Fresh Mango Lassi", "fresh mango lassi glass photo"),
    ("Kulhad Masala Chai", "kulhad masala chai tea photo"),
    ("Sweet Punjabi Lassi", "punjabi sweet lassi malai photo"),
    ("Fresh Lime Soda", "fresh lime soda drink photo"),
    ("Cold Badam Milk", "badam milk almond drink photo"),
    ("Espresso Macchiato", "espresso macchiato coffee cup photo"),
    ("Cold Brew Iced Tea", "iced tea peach lemon photo"),
    ("Fresh Orange Juice", "fresh orange juice glass photo"),
    ("Classic Hot Chocolate", "hot chocolate mug marshmallows photo"),
    ("Rose Milk Chiller", "rose milk drink chiller photo"),

    # BAKERY & DESSERTS
    ("Belgian Dark Chocolate Brownie", "chocolate brownie fudge photo"),
    ("Hot Gulab Jamun (2 pcs)", "gulab jamun sweet indian photo"),
    ("Kolkata Rasgulla (2 pcs)", "kolkata rasgulla sweet photo"),
    ("Chocolate Fudge Sundae", "chocolate fudge sundae ice cream photo"),
    ("Red Velvet Cupcake", "red velvet cupcake frosting photo"),
    ("Classic New York Cheesecake", "new york cheesecake slice photo"),
    ("Crispy Jalebi (250g)", "crispy jalebi sweet photo"),
    ("Butter Croissant", "flaky butter croissant pastry photo"),
    ("Blueberry Muffin", "fresh blueberry muffin photo"),
    ("Saffron Kheer / Payasam", "saffron rice kheer payasam photo")
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

matched_dict = {}

print("Searching for exact food item images...")

for name, query in items_queries:
    try:
        token_url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
        token_req = urllib.request.Request(token_url, headers=headers)
        html = urllib.request.urlopen(token_req).read().decode('utf-8')
        m = re.search(r'vqd=([\d-]+)&', html) or re.search(r'vqd="([\d-]+)"', html)
        if m:
            vqd = m.group(1)
            img_url = f"https://duckduckgo.com/i.js?q={urllib.parse.quote(query)}&o=json&vqd={vqd}"
            img_req = urllib.request.Request(img_url, headers=headers)
            res_json = json.loads(urllib.request.urlopen(img_req).read().decode('utf-8'))
            results = res_json.get('results', [])
            if results:
                image_src = results[0]['image']
                matched_dict[name] = image_src
                print(f"✓ {name} -> {image_src[:70]}...")
            else:
                print(f"⚠ No results for {name}")
        else:
            print(f"⚠ No vqd token for {name}")
        time.sleep(0.3)
    except Exception as e:
        print(f"✗ Error for {name}: {e}")

print(f"\nSuccessfully matched {len(matched_dict)} / {len(items_queries)} items.")

if len(matched_dict) > 0:
    conn = sqlite3.connect('smart_canteen.db')
    cursor = conn.cursor()
    for name, img_url in matched_dict.items():
        cursor.execute("UPDATE menu_items SET image_url = ? WHERE name = ?", (img_url, name))
    conn.commit()
    conn.close()
    print("Database updated with exact food photos!")
