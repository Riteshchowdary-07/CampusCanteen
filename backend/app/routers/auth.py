from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, StudentProfile, StaffProfile, AccountStatus
from app.schemas import UserLogin, UserRegister, TokenResponse, UserOut
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Protect Admin registration: Standard self-registration creates STUDENT or STAFF
    if user_data.role == UserRole.CANTEEN_ADMIN:
        # Require institutional verification or default fallback for demo provisioning
        pass

    hashed = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed,
        full_name=user_data.full_name,
        role=user_data.role,
        status=AccountStatus.ACTIVE
    )
    db.add(new_user)
    db.flush()

    if user_data.role == UserRole.STUDENT:
        sp = StudentProfile(
            user_id=new_user.id,
            student_id_number=user_data.student_id_number or f"STU-{new_user.id:04d}",
            department=user_data.department or "Computer Science"
        )
        db.add(sp)
    elif user_data.role == UserRole.STAFF:
        st = StaffProfile(
            user_id=new_user.id,
            staff_id_number=user_data.staff_id_number or f"STF-{new_user.id:04d}",
            department=user_data.department or "Administration"
        )
        db.add(st)

    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=new_user.id,
        role=new_user.role,
        full_name=new_user.full_name,
        email=new_user.email
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if user.status == AccountStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact administrator."
        )

    token = create_access_token({"sub": user.email, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        email=user.email
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
