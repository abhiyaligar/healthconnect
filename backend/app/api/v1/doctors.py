from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import uuid as uuid_pkg
from app.core.database import get_db
from app.models.doctor import DoctorProfile
from app.schemas.profile import DoctorProfileOut, DoctorProfileUpdate, DoctorProfileCreate
from app.api.v1.auth import get_current_user

from app.models.appointment import Appointment
from app.models.slot import Slot
from datetime import datetime, timezone

router = APIRouter()

@router.get("/recommend")
def recommend_doctors(specialty: str, db: Session = Depends(get_db)):
    # 1. Get all doctors in this specialty
    doctors = db.query(DoctorProfile).filter(
        DoctorProfile.specialty == specialty,
        DoctorProfile.status == "ACTIVE"
    ).all()
    
    today = datetime.now(timezone.utc).date()
    
    # 2. Calculate load for each doctor (Appointments for today)
    doctor_loads = []
    for doc in doctors:
        load = db.query(Appointment).join(Slot).filter(
            Slot.doctor_id == doc.custom_id,
            Slot.start_time >= datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc),
            Slot.start_time <= datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc),
            Appointment.status != "CANCELLED"
        ).count()
        
        doctor_loads.append({
            "doctor": doc,
            "load": load
        })
    
    # 3. Sort by load (ascending)
    sorted_docs = sorted(doctor_loads, key=lambda x: x["load"])
    
    return [
        {
            **DoctorProfileOut.model_validate(item["doctor"]).model_dump(),
            "current_load": item["load"]
        } for item in sorted_docs
    ]

@router.get("/", response_model=List[DoctorProfileOut])
def list_doctors(db: Session = Depends(get_db)):
    return db.query(DoctorProfile).filter(DoctorProfile.status == "ACTIVE").all()

@router.get("/me", response_model=DoctorProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user.id))
    doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    return doctor

@router.get("/{doctor_id}", response_model=DoctorProfileOut)
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(DoctorProfile).filter(DoctorProfile.custom_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.post("/me", response_model=DoctorProfileOut)
def create_my_profile(
    profile: DoctorProfileCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing = db.query(DoctorProfile).filter(DoctorProfile.user_id == uuid_pkg.UUID(str(current_user.id))).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    db_profile = DoctorProfile(**profile.model_dump(), user_id=uuid_pkg.UUID(str(current_user.id)))
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.patch("/me", response_model=DoctorProfileOut)
def update_my_profile(
    profile: DoctorProfileUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == uuid_pkg.UUID(str(current_user.id))).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile
