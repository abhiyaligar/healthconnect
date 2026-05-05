from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
import uuid as uuid_pkg
from app.core.database import get_db
from app.models import PatientProfile
from app.schemas.profile import PatientProfileOut, PatientProfileUpdate, PatientProfileCreate
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/me", response_model=PatientProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user["id"]))
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/me", response_model=PatientProfileOut)
def create_my_profile(
    profile: PatientProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user["id"]))
    existing = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    db_profile = PatientProfile(**profile.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.patch("/me", response_model=PatientProfileOut)
def update_my_profile(
    profile: PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user["id"]))
    db_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
