import os

class Settings:
    PROJECT_NAME: str = "Smart Canteen Management System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smart_canteen_super_secret_jwt_key_2026_dev_mode")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day

    # Database: Default to SQLite for zero-setup instant local running, support Postgres via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smart_canteen.db")

    # Canteen Scheduling Settings
    SLOT_DURATION_MINUTES: int = 10
    DEFAULT_SLOT_CAPACITY: int = 10
    DEFAULT_PREPARATION_BUFFER_MINS: int = 5
    WALKING_BUFFER_MINS: int = 5
    CANTEEN_OPEN_TIME: str = "08:00"
    CANTEEN_CLOSE_TIME: str = "20:00"

    # Razorpay Sandbox Credentials
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_canteen2026_sandbox")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "canteen_razorpay_secret_key_2026")

settings = Settings()
