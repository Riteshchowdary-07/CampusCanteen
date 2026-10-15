import pytest

def test_razorpay_payment_flow(client):
    # 1. Login as student
    stu_login = client.post("/api/auth/login", json={"email": "student@example.com", "password": "password123"}).json()
    headers = {"Authorization": f"Bearer {stu_login['access_token']}"}

    menu_items = client.get("/api/menu/items").json()
    item = menu_items[0]
    slots = client.get("/api/pickup-slots").json()
    slot = slots[0]

    # 2. Step 1: Create Razorpay Order
    rzp_req = {
        "pickup_slot_id": slot["id"],
        "items": [{"menu_item_id": item["id"], "quantity": 2}],
        "notes": "Testing Razorpay sandbox"
    }
    res_rzp = client.post("/api/orders/razorpay-order", json=rzp_req, headers=headers)
    assert res_rzp.status_code == 200
    rzp_data = res_rzp.json()
    assert "razorpay_order_id" in rzp_data
    assert rzp_data["amount_paise"] > 0
    assert rzp_data["razorpay_key_id"] is not None

    rzp_order_id = rzp_data["razorpay_order_id"]
    rzp_payment_id = "pay_sb_test_99812"
    rzp_signature = "sb_sig_valid_test_hash"

    # 3. Step 2: Verify Razorpay Payment Signature and create Order + Token
    verify_req = {
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": rzp_payment_id,
        "razorpay_signature": rzp_signature,
        "pickup_slot_id": slot["id"],
        "items": [{"menu_item_id": item["id"], "quantity": 2}],
        "notes": "Testing Razorpay sandbox signature verification"
    }
    res_verify = client.post("/api/orders/verify-razorpay-payment", json=verify_req, headers=headers)
    assert res_verify.status_code == 200
    order_data = res_verify.json()

    assert order_data["status"] == "PLACED"
    assert order_data["payment_status"] == "PAID"
    assert order_data["payment_method"] == "RAZORPAY_SANDBOX"
    assert order_data["razorpay_payment_id"] == rzp_payment_id
    assert order_data["token_number"] is not None

    # 4. Step 3: Fetch Itemized Invoice HTML Print View
    invoices = client.get("/api/invoices", headers=headers).json()
    inv_id = invoices[0]["id"]

    res_html = client.get(f"/api/invoices/{inv_id}/html", headers=headers)
    assert res_html.status_code == 200
    assert "Invoice" in res_html.text
    assert "Print / Download PDF" in res_html.text
    assert rzp_payment_id in res_html.text
