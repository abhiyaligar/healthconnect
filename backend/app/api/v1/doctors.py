from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models.doctor import DoctorProfile
from app.schemas.profile import DoctorProfileOut, DoctorProfileUpdate, DoctorProfileCreate
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[DoctorProfileOut])
def list_doctors(db: Session = Depends(get_db)):
    return db.query(DoctorProfile).filter(DoctorProfile.status == "ACTIVE").all()

@router.get("/{doctor_id}", response_model=DoctorProfileOut)
def get_doctor(doctor_id: UUID, db: Session = Depends(get_db)):
    doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.post("/me", response_model=DoctorProfileOut)
def create_my_profile(
    profile: DoctorProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user["id"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    db_profile = DoctorProfile(**profile.model_dump(), user_id=current_user["id"])
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.patch("/me", response_model=DoctorProfileOut)
def update_my_profile(
    profile: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user["id"]).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
