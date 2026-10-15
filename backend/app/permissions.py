from typing import List
from fastapi import HTTPException, status, Depends
from app.models import User, UserRole, Order, Timetable, Invoice, Token
from app.auth import get_current_user

def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Role '{current_user.role.value}' is not authorized for this resource."
            )
        return current_user
    return role_checker

def verify_order_ownership(current_user: User, order: Order):
    """
    Prevents BOLA/IDOR vulnerabilities (Section 12).
    Students/Staff can only access their own orders. Admins can access all orders.
    """
    if current_user.role == UserRole.CANTEEN_ADMIN:
        return
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not own this order."
        )

def verify_timetable_ownership(current_user: User, timetable: Timetable):
    if current_user.role == UserRole.CANTEEN_ADMIN:
        return
    if timetable.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not own this timetable."
        )

def verify_invoice_ownership(current_user: User, invoice: Invoice):
    if current_user.role == UserRole.CANTEEN_ADMIN:
        return
    if invoice.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not own this invoice."
        )
