import pytest

def test_smart_scheduler_recommendation(client):
    # Login as Student
    stu_login = client.post("/api/auth/login", json={"email": "student@example.com", "password": "password123"}).json()
    headers = {"Authorization": f"Bearer {stu_login['access_token']}"}

    # Fetch menu items
    menu_items = client.get("/api/menu/items").json()
    chicken_rice = next(i for i in menu_items if i["name"] == "Chicken Rice")

    # Request slot recommendation for Chicken Rice
    res = client.post("/api/pickup-slots/recommend", json={"item_ids": [chicken_rice["id"]]}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["prep_time_required_mins"] == 15
    assert data["recommended_slot"] is not None
    assert data["recommended_slot"]["fits_break"] is True
    assert data["recommended_slot"]["available_capacity"] > 0
    assert data["recommended_slot"]["start_time"] in ["12:00", "12:20"]

def test_order_placement_token_and_inventory(client):
    # 1. Login as Student
    stu_login = client.post("/api/auth/login", json={"email": "student@example.com", "password": "password123"}).json()
    headers = {"Authorization": f"Bearer {stu_login['access_token']}"}

    menu_items = client.get("/api/menu/items").json()
    chicken_rice = next(i for i in menu_items if i["name"] == "Chicken Rice")
    slots = client.get("/api/pickup-slots").json()
    open_slot = next(s for s in slots if s["start_time"] == "12:20")

    # 2. Place Order
    order_payload = {
        "pickup_slot_id": open_slot["id"],
        "items": [{"menu_item_id": chicken_rice["id"], "quantity": 1}],
        "notes": "No onions please"
    }
    res_order = client.post("/api/orders", json=order_payload, headers=headers)
    assert res_order.status_code == 200
    order_data = res_order.json()

    assert order_data["status"] == "PLACED"
    assert order_data["token_number"] is not None
    assert order_data["token_number"].startswith("A")
    assert order_data["total_amount"] > 0

    order_id = order_data["id"]

    # 3. Test IDOR/BOLA Protection: Login as Staff and try to read Student's order
    staff_login = client.post("/api/auth/login", json={"email": "staff@example.com", "password": "password123"}).json()
    staff_headers = {"Authorization": f"Bearer {staff_login['access_token']}"}

    res_idor = client.get(f"/api/orders/{order_id}", headers=staff_headers)
    assert res_idor.status_code == 403  # Must be rejected!

    # 4. Student can view their own order
    res_own = client.get(f"/api/orders/{order_id}", headers=headers)
    assert res_own.status_code == 200
    assert res_own.json()["id"] == order_id
