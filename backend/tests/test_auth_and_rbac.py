import pytest

def test_login_success(client):
    # Test Student login
    res = client.post("/api/auth/login", json={"email": "student@example.com", "password": "password123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "STUDENT"

    # Test Staff login
    res_staff = client.post("/api/auth/login", json={"email": "staff@example.com", "password": "password123"})
    assert res_staff.status_code == 200
    assert res_staff.json()["role"] == "STAFF"

    # Test Admin login
    res_admin = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "password123"})
    assert res_admin.status_code == 200
    assert res_admin.json()["role"] == "CANTEEN_ADMIN"

def test_login_failure(client):
    res = client.post("/api/auth/login", json={"email": "student@example.com", "password": "wrongpassword"})
    assert res.status_code == 401

def test_rbac_enforcement(client):
    # 1. Login as Student
    stu_login = client.post("/api/auth/login", json={"email": "student@example.com", "password": "password123"}).json()
    stu_token = stu_login["access_token"]
    stu_headers = {"Authorization": f"Bearer {stu_token}"}

    # 2. Student attempts to access Admin endpoint -> MUST RETURN 403 FORBIDDEN
    res_admin_api = client.get("/api/admin/dashboard/overview", headers=stu_headers)
    assert res_admin_api.status_code == 403

    # 3. Login as Admin
    admin_login = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "password123"}).json()
    admin_token = admin_login["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 4. Admin accessing Admin endpoint -> MUST SUCCEED 200 OK
    res_admin_ok = client.get("/api/admin/dashboard/overview", headers=admin_headers)
    assert res_admin_ok.status_code == 200
    assert "kitchen_utilization_pct" in res_admin_ok.json()
