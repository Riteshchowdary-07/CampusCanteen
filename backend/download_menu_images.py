import os
import sys
import json
import urllib.request
import urllib.parse
from PIL import Image

HEADERS = {
    'User-Agent': 'CampusCafeApp/1.0 (contact: student@campuscafe.local)'
}

DEST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "images", "menu"))
os.makedirs(DEST_DIR, exist_ok=True)

# Explicit mapping of menu items to Wikipedia articles / direct Wikimedia Commons images
WIKI_MAPPING = {
    "crispy-masala-dosa.jpg": ["Masala dosa", "Dosa (food)"],
    "idli-sambar.jpg": ["Idli"],
    "ven-pongal.jpg": ["Pongal (dish)"],
    "medu-vada.jpg": ["Vada (food)"],
    "mysore-bonda.jpg": ["Bonda"],
    "onion-rava-uttapam.jpg": ["Uttapam"],
    "rava-upma.jpg": ["Upma"],
    "poori-sagu.jpg": ["Puri (food)"],
    "oats-porridge.jpg": ["Porridge", "Oatmeal"],
    "set-dosa.jpg": ["Dosa (food)"],
    "chicken-biryani.jpg": ["Biryani", "Hyderabadi biryani"],
    "deluxe-veg-thali.jpg": ["Thali"],
    "special-non-veg-thali.jpg": ["Thali"],
    "paneer-butter-masala.jpg": ["Paneer tikka masala", "Shahi paneer"],
    "chole-bhature.jpg": ["Chole bhature"],
    "rajma-chawal.jpg": ["Rajma"],
    "hot-samosa.jpg": ["Samosa"],
    "crispy-veg-cutlet.jpg": ["Cutlet"],
    "bread-pakora.jpg": ["Pakora"],
    "bombay-vada-pav.jpg": ["Vada pav"],
    "salted-french-fries.jpg": ["French fries"],
    "chicken-kathi-roll.jpg": ["Kati roll"],
    "cheese-garlic-bread.jpg": ["Garlic bread"],
    "pani-puri.jpg": ["Panipuri"],
    "fresh-mango-lassi.jpg": ["Lassi"],
    "kulhad-masala-chai.jpg": ["Masala chai"],
    "sweet-punjabi-lassi.jpg": ["Lassi"],
    "fresh-lime-soda.jpg": ["Limeade", "Lemonade"],
    "cold-badam-milk.jpg": ["Almond milk"],
    "espresso-macchiato.jpg": ["Caffè macchiato"],
    "cold-brew-iced-tea.jpg": ["Iced tea"],
    "fresh-orange-juice.jpg": ["Orange juice"],
    "classic-hot-chocolate.jpg": ["Hot chocolate"],
    "rose-milk-chiller.jpg": ["Bandung (drink)", "Sharbat"],
    "belgian-chocolate-brownie.jpg": ["Chocolate brownie"],
    "hot-gulab-jamun.jpg": ["Gulab jamun"],
    "kolkata-rasgulla.jpg": ["Rasgulla"],
    "chocolate-fudge-sundae.jpg": ["Sundae"],
    "red-velvet-cupcake.jpg": ["Cupcake"],
    "classic-cheesecake.jpg": ["Cheesecake"],
    "crispy-jalebi.jpg": ["Jalebi"],
    "butter-croissant.jpg": ["Croissant"],
    "blueberry-muffin.jpg": ["Muffin"],
    "saffron-kheer-payasam.jpg": ["Kheer"],
    "noodles.jpg": ["Instant noodles", "Lo mein", "Ramen"],
}

# Direct high quality fallback URLs for anything that Wikipedia thumbnail might miss
DIRECT_URLS = {
    "mysore-bonda.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Goli_Bajji_-_Mangalore_bajji.jpg/800px-Goli_Bajji_-_Mangalore_bajji.jpg",
    "bread-pakora.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bread_pakora.jpg/800px-Bread_pakora.jpg",
    "cold-badam-milk.jpg": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=800&auto=format&fit=crop&q=80",
    "rose-milk-chiller.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Bandung_drink.jpg/800px-Bandung_drink.jpg",
    "special-non-veg-thali.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Non-Veg_Thali.jpg/800px-Non-Veg_Thali.jpg",
    "crispy-veg-cutlet.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vegetable_cutlet.jpg/800px-Vegetable_cutlet.jpg",
    "set-dosa.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Set_Dosa.jpg/800px-Set_Dosa.jpg",
}

def query_wiki_image(title):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=pageimages&format=json&pithumbsize=1000"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data['query']['pages']
            for pid, page in pages.items():
                if 'thumbnail' in page:
                    return page['thumbnail']['source']
    except Exception as e:
        print(f"  Wiki error for '{title}': {e}")
    return None

def download_image(url, dest_path):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            if len(data) < 1000:
                print(f"  Downloaded file too small ({len(data)} bytes) from {url}")
                return False
            with open(dest_path, "wb") as f:
                f.write(data)
            # Verify image with PIL
            with Image.open(dest_path) as img:
                img.verify()
            return True
    except Exception as e:
        print(f"  Download error for {url}: {e}")
        if os.path.exists(dest_path):
            try:
                os.remove(dest_path)
            except:
                pass
        return False

def main():
    print(f"Saving menu images to: {DEST_DIR}")
    for filename, titles in WIKI_MAPPING.items():
        dest = os.path.join(DEST_DIR, filename)
        if os.path.exists(dest) and os.path.getsize(dest) > 5000:
            print(f"[EXISTS] {filename} ({os.path.getsize(dest)} bytes)")
            continue

        print(f"[FETCHING] {filename}...")
        img_url = None
        for title in titles:
            img_url = query_wiki_image(title)
            if img_url:
                print(f"  Found URL for '{title}': {img_url}")
                break

        if not img_url and filename in DIRECT_URLS:
            img_url = DIRECT_URLS[filename]
            print(f"  Using direct URL fallback: {img_url}")

        if img_url:
            success = download_image(img_url, dest)
            if success:
                print(f"  [SUCCESS] Saved {filename} ({os.path.getsize(dest)} bytes)")
            else:
                # Try direct URL if wiki thumb failed
                if filename in DIRECT_URLS and DIRECT_URLS[filename] != img_url:
                    print(f"  Retrying with direct URL...")
                    if download_image(DIRECT_URLS[filename], dest):
                        print(f"  [SUCCESS] Saved via direct URL: {filename}")
        else:
            print(f"  [WARNING] Could not find URL for {filename}")

    # Aliases
    aliases = [
        ("iced-cold-coffee.jpg", "iced-coffee.jpg"),
        ("mumbai-pav-bhaji.jpg", "pav-bhaji.jpg"),
    ]
    for src_name, dst_name in aliases:
        src = os.path.join(DEST_DIR, src_name)
        dst = os.path.join(DEST_DIR, dst_name)
        if os.path.exists(src) and not os.path.exists(dst):
            import shutil
            shutil.copy2(src, dst)
            print(f"[ALIAS] Created {dst_name} -> {src_name}")

    # Fallback image: create frontend/public/images/fallback-food.jpg
    fallback_path = os.path.abspath(os.path.join(DEST_DIR, "..", "fallback-food.jpg"))
    if not os.path.exists(fallback_path):
        src_fallback = os.path.join(DEST_DIR, "deluxe-veg-thali.jpg")
        if not os.path.exists(src_fallback):
            src_fallback = os.path.join(DEST_DIR, "south-indian-meals.jpg")
        if os.path.exists(src_fallback):
            import shutil
            shutil.copy2(src_fallback, fallback_path)
            print(f"[FALLBACK] Created fallback-food.jpg from {os.path.basename(src_fallback)}")

if __name__ == "__main__":
    main()
