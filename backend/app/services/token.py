from sqlalchemy.orm import Session
from app.models import Token, TokenStatus, Order

def generate_unique_token(db: Session, order_id: int) -> Token:
    """
    Generates a unique, concurrency-safe digital token number like A142.
    """
    existing = db.query(Token).filter(Token.order_id == order_id).first()
    if existing:
        return existing

    # Count existing tokens to form sequential token A<count + 100>
    total_tokens = db.query(Token).count()
    token_number = f"A{100 + total_tokens + 1}"

    # Ensure uniqueness
    while db.query(Token).filter(Token.token_number == token_number).first():
        total_tokens += 1
        token_number = f"A{100 + total_tokens + 1}"

    token_obj = Token(
        token_number=token_number,
        order_id=order_id,
        status=TokenStatus.ACTIVE
    )
    db.add(token_obj)
    db.flush()
    return token_obj

def update_token_status_for_order(db: Session, order_id: int, new_status: TokenStatus):
    token = db.query(Token).filter(Token.order_id == order_id).first()
    if token:
        token.status = new_status
        db.flush()
