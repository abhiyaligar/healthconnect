from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.admin import SystemSetting, AuditLog
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.core.supabase import get_supabase, get_supabase_admin
from app.api.v1.auth import get_current_user
from app.schemas.auth import SignupRequest, UserRole, UserResponse
from app.models.admin import AdminProfile
from app.schemas.pagination import PaginatedResponse, paginate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def check_admin(current_user = Depends(get_current_user)):
    user_meta = current_user.user_metadata or {}
    if user_meta.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def log_action(db: Session, action: str, performed_by: str, details: str):
    log = AuditLog(action=action, performed_by=performed_by, details=details)
    db.add(log)
    db.commit()

@router.get("/users")
def list_users(
    query: Optional[str] = None,
    role: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
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
        
    total = len(users)
    pages = (total + limit - 1) // limit if limit > 0 else 0
    paginated_users = users[(page - 1) * limit : page * limit]
        
    return {
        "items": paginated_users,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages
    }

@router.post("/users", response_model=UserResponse)
def create_user(
    user_data: SignupRequest,
    db: Session = Depends(get_db),
    admin_user = Depends(check_admin)
):
    supabase_admin = get_supabase_admin()
    
    try:
        response = supabase_admin.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,
            "user_metadata": {
                "role": user_data.role.value,
                "full_name": user_data.full_name,
                "mobile": user_data.mobile
            }
        })
        
        if not response.user:
            raise HTTPException(status_code=400, detail="User creation failed")
            
        user_id = response.user.id
        custom_id = None
        
        if user_data.role == UserRole.DOCTOR:
            prefix = user_data.mobile[:5]
            name_part = user_data.full_name[:4].replace(" ", "").upper()
            custom_id = f"{prefix}-{name_part}"
            db_profile = DoctorProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                email=user_data.email,
                mobile=user_data.mobile,
                custom_id=custom_id,
                specialty=user_data.specialty or "General",
                bio=user_data.bio
            )
        elif user_data.role == UserRole.PATIENT:
            prefix = user_data.mobile[:5]
            name_part = user_data.full_name[:4].replace(" ", "").upper()
            custom_id = f"{prefix}-{name_part}"
            db_profile = PatientProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                email=user_data.email,
                mobile=user_data.mobile,
                custom_id=custom_id,
                base_priority=0,
                date_of_birth=user_data.dob if user_data.dob else None,
                gender=user_data.gender,
                medical_history=user_data.medical_history
            )
        elif user_data.role == UserRole.ADMIN:
            custom_id = f"ADM-{user_data.full_name[:4].upper()}"
            db_profile = AdminProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                email=user_data.email
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid role specified")
            
        db.add(db_profile)
        
        # log_action(db, "USER_CREATED", admin_user.email, f"Created new {user_data.role.value} user: {user_data.email}") # wait, admin_user is a supabase User object
        # check_admin returns current_user, so admin_user.email works
        log_action(db, "USER_CREATED", admin_user.email, f"Created new {user_data.role.value} user: {user_data.email}")
        
        db.commit()
        
        return UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=user_data.full_name,
            role=user_data.role,
            custom_id=custom_id
        )
    except Exception as e:
        logger.error(f"Error creating user in admin dashboard: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/users/{user_id}/status")
def toggle_user_status(user_id: str, active: bool, db: Session = Depends(get_db), current_user = Depends(check_admin)):
    # We update both Doctor and Patient profiles if found
    doc = db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
    pat = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
    
    status_str = "ACTIVE" if active else "INACTIVE"
    if doc: doc.status = status_str
    if pat: pat.status = status_str
    
    db.commit()
    log_action(db, "USER_STATUS_CHANGE", current_user.email, f"Changed user {user_id} status to {status_str}")
    return {"message": f"User status updated to {status_str}"}

@router.patch("/users/{user_id}/role")
def update_user_role(user_id: str, new_role: str, db: Session = Depends(get_db), current_user = Depends(check_admin)):
    # 1. Update in Supabase (Metadata)
    supabase = get_supabase()
    supabase.auth.admin.update_user_by_id(user_id, {"user_metadata": {"role": new_role.upper()}})
    
    # 2. Log it
    log_action(db, "USER_ROLE_CHANGE", current_user.email, f"Changed user {user_id} role to {new_role}")
    return {"message": f"User role updated to {new_role}"}

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
def get_audit_logs(page: int = 1, limit: int = 10, db: Session = Depends(get_db), _ = Depends(check_admin)):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    items, total, pages = paginate(query, page, limit)
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages
    }
