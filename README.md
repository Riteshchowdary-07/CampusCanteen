# Cloud-Based Smart Canteen Pre-Order, Timetable-Aware Token and Inventory Management System

A complete, production-grade campus canteen SaaS platform that coordinates **Student/Staff Availability + Food Demand + Kitchen Capacity + Recipe Inventory + Pickup Scheduling + Digital Token Management** to eliminate canteen queue congestion and food waste.

---

## 🌟 Core Differentiator

> **Timetable-Aware, Capacity-Constrained Smart Scheduling**

Unlike generic food-ordering apps that accept every order at any time, this system evaluates:
1. **Student/Staff Timetable**: Identifies class hours (busy/unavailable) vs. lunch breaks (free windows).
2. **Food Preparation Time**: Calculates max preparation time based on selected cart items.
3. **Recipe Ingredient Stock**: Verifies raw ingredient availability before order confirmation.
4. **Kitchen Slot Capacity**: Enforces max order limits per 10-minute window (e.g., max 10 orders).
5. **Alternative Slot Generation**: Automatically suggests feasible pickup windows within the user's break when preferred slots are full or in conflict.

---

## 🚀 Pre-Provisioned Demo Credentials

All portals come pre-seeded with ready-to-use development credentials:

| Portal | Role | Email | Password | Access Route |
| :--- | :--- | :--- | :--- | :--- |
| **Student Portal** | `STUDENT` | `student@example.com` | `password123` | `/student/login` |
| **Staff Portal** | `STAFF` | `staff@example.com` | `password123` | `/staff/login` |
| **Canteen Admin** | `CANTEEN_ADMIN` | `admin@example.com` | `password123` | `/admin/login` |

---

## 🏗️ System Architecture & Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons + Recharts
- **Backend**: FastAPI (Python 3.11/3.14) + SQLAlchemy + Pydantic v2 + PyJWT + Passlib/Bcrypt
- **Database**: PostgreSQL (Docker / Cloud ready) & SQLite (Zero-setup instant local execution)
- **Testing**: Pytest automated test suite (Auth, RBAC, IDOR, Concurrency, Scheduler)
- **Containers**: Docker & Docker Compose

---

## 🛠️ Quick Start Instructions

### 1. Backend Setup & Local Server

```bash
cd backend

# Create virtualenv or use system python
python -m pip install -r requirements.txt

# Seed the database with demo accounts, menu items, recipes, stock, and timetables
python -m app.seed

# Run FastAPI backend server (Runs on http://localhost:8000)
uvicorn app.main:app --reload --port 8000
```

- **OpenAPI Swagger Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup & Dev Server

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (Runs on http://localhost:3000)
npm run dev
```

---

## 🧪 Running Automated Tests

Run the backend Pytest suite verifying auth, RBAC enforcement, IDOR/BOLA security checks, smart slot recommendation, and atomic stock reservation:

```bash
cd backend
python -m pytest -v
```

---

## 🐳 Docker Deployment

To launch PostgreSQL, FastAPI Backend, and Nginx React Frontend concurrently:

```bash
docker-compose up --build -d
```

---

## 🎬 End-to-End Demonstration Walkthrough (Section 51 & 52)

1. **Student Login**: Navigate to `/` and click **Student Login**. Log in with `student@example.com` / `password123`.
2. **Timetable Verification**: Visit `/student/timetable`. Notice pre-configured class windows (`10:00 - 12:00` Class, `12:00 - 12:45` Lunch Break, `12:45 - 14:00` Class).
3. **Menu Selection**: Go to `/student/menu` and add **Chicken Rice (₹80)** to your cart.
4. **Smart Pickup Recommendation**: Go to `/student/checkout`. The Smart Scheduler evaluates:
   - Prep time: 15 mins
   - Ingredient stock: Checked
   - Break window: 12:00 PM – 12:45 PM
   - Slot 12:10 PM is Full (10/10)
   - **Recommends: 12:20 PM – 12:30 PM** (Fits break, kitchen capacity available).
5. **Order Confirmation & Token**: Click **Confirm Order**. The system atomically reserves stock, reserves slot capacity, and issues digital token **`A142`**.
6. **Kitchen Kanban**: Open a new browser window, log in as Admin (`admin@example.com` / `password123`), and open `/admin/kitchen`.
7. **Kitchen State Transition**: Update order status from `PLACED` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`.
8. **Student Notification**: Student dashboard updates in real-time with status changes!
