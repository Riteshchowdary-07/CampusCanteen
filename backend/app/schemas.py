from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models import UserRole, AccountStatus, EntryType, OrderStatus, TokenStatus, PaymentStatus

# Auth & User Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.STUDENT
    student_id_number: Optional[str] = None
    staff_id_number: Optional[str] = None
    department: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: UserRole
    full_name: str
    email: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    status: AccountStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Timetable Schemas
class TimetableEntryBase(BaseModel):
    day_of_week: int  # 0-6
    start_time: str   # "10:00"
    end_time: str     # "12:00"
    title: str
    entry_type: EntryType = EntryType.CLASS

class TimetableEntryCreate(TimetableEntryBase):
    pass

class TimetableEntryOut(TimetableEntryBase):
    id: int
    timetable_id: int

    model_config = ConfigDict(from_attributes=True)

class TimetableCreate(BaseModel):
    title: str = "My Weekly Schedule"
    entries: List[TimetableEntryCreate] = []

class TimetableOut(BaseModel):
    id: int
    user_id: int
    title: str
    is_active: bool
    updated_at: datetime
    entries: List[TimetableEntryOut] = []

    model_config = ConfigDict(from_attributes=True)

# Menu & Category Schemas
class MenuCategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    display_order: int

    model_config = ConfigDict(from_attributes=True)

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    prep_time_mins: int = 15
    image_url: Optional[str] = None
    is_available: bool = True
    calories: Optional[int] = None
    allergens: Optional[str] = None

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemOut(MenuItemBase):
    id: int
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Inventory & Recipe Schemas
class InventoryItemCreate(BaseModel):
    name: str
    category: Optional[str] = "General"
    quantity: float
    unit: str
    min_threshold: float = 10.0
    max_threshold: float = 100.0
    cost_per_unit: float = 0.0

class InventoryItemOut(BaseModel):
    id: int
    name: str
    category: Optional[str]
    quantity: float
    unit: str
    min_threshold: float
    max_threshold: float
    cost_per_unit: float
    is_low_stock: bool = False
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RecipeIngredientCreate(BaseModel):
    inventory_item_id: int
    quantity_required: float

class RecipeCreate(BaseModel):
    menu_item_id: int
    name: str
    notes: Optional[str] = None
    ingredients: List[RecipeIngredientCreate] = []

class RecipeOut(BaseModel):
    id: int
    menu_item_id: int
    name: str
    notes: Optional[str] = None
    ingredients: List[dict] = []

    model_config = ConfigDict(from_attributes=True)

# Pickup Slot & Smart Scheduler Schemas
class PickupSlotOut(BaseModel):
    id: int
    slot_date: str
    start_time: str
    end_time: str
    max_capacity: int
    reserved_capacity: int
    available_capacity: int
    is_full: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class SlotRecommendationRequest(BaseModel):
    target_date: Optional[str] = None  # YYYY-MM-DD
    item_ids: List[int]

class SlotRecommendationOption(BaseModel):
    slot_id: int
    slot_date: str
    start_time: str
    end_time: str
    available_capacity: int
    is_recommended: bool
    fits_break: bool
    break_window: Optional[str] = None
    reason: str

class SlotRecommendationResponse(BaseModel):
    prep_time_required_mins: int
    has_break_conflict: bool
    recommended_slot: Optional[SlotRecommendationOption] = None
    alternative_slots: List[SlotRecommendationOption] = []
    hard_constraints_explanation: List[str] = []

# Order Schemas
class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int

class OrderCreate(BaseModel):
    pickup_slot_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None
    payment_method: Optional[str] = "RAZORPAY_SANDBOX"

# Razorpay Schemas
class RazorpayOrderCreateRequest(BaseModel):
    pickup_slot_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount_paise: int
    currency: str = "INR"
    razorpay_key_id: str
    total_amount_rupees: float

class RazorpayVerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    pickup_slot_id: int
    items: List[OrderItemCreate]
    notes: Optional[str] = None

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: int
    menu_item_name: str
    quantity: int
    unit_price: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)

class OrderOut(BaseModel):
    id: int
    order_number: str
    user_id: int
    user_name: Optional[str] = None
    pickup_slot_id: int
    pickup_slot_time: Optional[str] = None
    status: OrderStatus
    payment_status: PaymentStatus = PaymentStatus.PAID
    payment_method: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    total_amount: float
    subtotal: float
    tax: float
    notes: Optional[str] = None
    token_number: Optional[str] = None
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)

# Token Schema
class TokenOut(BaseModel):
    id: int
    token_number: str
    order_id: int
    order_number: str
    pickup_time: str
    status: TokenStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Invoice Schema
class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    order_id: int
    order_number: str
    customer_name: str
    customer_email: Optional[str] = None
    issue_date: datetime
    amount: float
    tax: float
    status: str
    payment_method: Optional[str] = "RAZORPAY_SANDBOX"
    razorpay_payment_id: Optional[str] = None
    items: List[OrderItemOut] = []

    model_config = ConfigDict(from_attributes=True)

# Notification Schema
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Audit Log Schema
class AuditLogOut(BaseModel):
    id: int
    user_name: Optional[str] = None
    action: str
    resource: str
    details: Optional[str] = None
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

# Dashboard & Analytics Schemas
class AdminDashboardOverview(BaseModel):
    today_orders_count: int
    today_revenue: float
    pending_orders: int
    preparing_orders: int
    ready_orders: int
    kitchen_utilization_pct: float
    low_stock_count: int

class TimetableDemandPoint(BaseModel):
    time_slot: str
    expected_demand: int
    kitchen_capacity: int
    is_high_demand: bool
