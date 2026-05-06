from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import uuid as uuid_pkg
import pytz
from app.core.database import get_db
from app.models.doctor import DoctorProfile
from app.schemas.profile import DoctorProfileOut, DoctorProfileUpdate, DoctorProfileCreate
from app.api.v1.auth import get_current_user
from app.schemas.pagination import PaginatedResponse, paginate

from app.models.appointment import Appointment
from app.models.slot import Slot
from datetime import datetime, timezone

IST = pytz.timezone('Asia/Kolkata')

router = APIRouter()

@router.get("/recommend")
def recommend_doctors(specialty: str, db: Session = Depends(get_db)):
    # 1. Get all doctors in this specialty
    doctors = db.query(DoctorProfile).filter(
        DoctorProfile.specialty == specialty,
        DoctorProfile.status == "ACTIVE"
    ).all()
    
    today = datetime.now(IST).date()  # Use IST date
    
    # 2. Calculate load for each doctor (Appointments for today)
    doctor_loads = []
    for doc in doctors:
        # Compute IST day boundaries in UTC for the DB query
        from datetime import time
        day_start = IST.localize(datetime.combine(today, time.min)).astimezone(timezone.utc)
        day_end = IST.localize(datetime.combine(today, time.max)).astimezone(timezone.utc)
        load = db.query(Appointment).join(Slot).filter(
            Slot.doctor_id == doc.custom_id,
            Slot.start_time >= day_start,
            Slot.start_time <= day_end,
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

@router.get("/", response_model=PaginatedResponse[DoctorProfileOut])
def list_doctors(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    query = db.query(DoctorProfile).filter(DoctorProfile.status == "ACTIVE")
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

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
