from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.admin import SystemSetting, AuditLog
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.api.v1.auth import get_current_user
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def check_admin(current_user = Depends(get_current_user)):
    user_meta = current_user.user_metadata or {}
    if user_meta.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users")
def list_users(
    query: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    _ = Depends(check_admin)
):
    # Combine Doctor and Patient profiles
    doctors = db.query(DoctorProfile).all()
    patients = db.query(PatientProfile).all()
    
    users = []
    for d in doctors:
        users.append({
            "id": d.user_id,
            "name": d.full_name,
            "email": d.email,
            "role": "DOCTOR",
            "status": "Active", # Simplified for now
            "lastActive": "N/A"
        })
    for p in patients:
        users.append({
            "id": p.user_id,
            "name": p.full_name,
            "email": p.email,
            "role": "PATIENT",
            "status": "Active",
            "lastActive": "N/A"
        })
    
    if query:
        q = query.lower()
        users = [u for u in users if q in u["name"].lower() or q in u["email"].lower()]
    
    if role:
        users = [u for u in users if u["role"] == role.upper()]
        
    return users

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), _ = Depends(check_admin)):
    settings = db.query(SystemSetting).all()
    return {s.key: s.value for s in settings}

@router.post("/settings")
def update_settings(settings_dict: dict, db: Session = Depends(get_db), _ = Depends(check_admin)):
    for key, value in settings_dict.items():
        db_setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if not db_setting:
            db_setting = SystemSetting(key=key, value=value)
            db.add(db_setting)
        else:
            db_setting.value = value
    db.commit()
    return {"message": "Settings updated"}

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), _ = Depends(check_admin)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
