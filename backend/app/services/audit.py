from sqlalchemy.orm import Session
from typing import Optional
from app.models import AuditLog

def log_admin_action(
    db: Session,
    user_id: Optional[int],
    action: str,
    resource: str,
    details: Optional[str] = None,
    previous_value: Optional[str] = None,
    new_value: Optional[str] = None
):
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        details=details,
        previous_value=previous_value,
        new_value=new_value
    )
    db.add(audit_entry)
    db.flush()
