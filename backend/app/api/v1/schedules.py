from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, time, timedelta, timezone
from app.core.database import get_db
from app.models.availability import DoctorAvailability
from app.models.doctor import DoctorProfile
from app.models.slot import Slot
from app.schemas.availability import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate, ScheduleLaunchRequest
from app.api.v1.auth import get_current_user
import uuid

router = APIRouter()

@router.get("/availability", response_model=List[AvailabilityOut])
def list_availability(doctor_id: str, db: Session = Depends(get_db)):
    return db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor_id).all()

@router.post("/availability", response_model=AvailabilityOut)
def create_availability(availability: AvailabilityCreate, db: Session = Depends(get_db)):
    db_avail = DoctorAvailability(**availability.model_dump())
    db.add(db_avail)
    db.commit()
    db.refresh(db_avail)
    return db_avail

@router.delete("/availability/{id}")
def delete_availability(id: uuid.UUID, db: Session = Depends(get_db)):
    db_avail = db.query(DoctorAvailability).filter(DoctorAvailability.id == id).first()
    if not db_avail:
        raise HTTPException(status_code=404, detail="Availability not found")
    db.delete(db_avail)
    db.commit()
    return {"message": "Deleted successfully"}


@router.post("/launch", status_code=status.HTTP_201_CREATED)
def launch_schedule(request: ScheduleLaunchRequest, db: Session = Depends(get_db)):
    # 1. Parse date and find day of week
    try:
        target_date = datetime.strptime(request.date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    day_of_week = target_date.weekday() # 0=Monday
    
    # 2. Get doctor profile for duration
    doctor = db.query(DoctorProfile).filter(DoctorProfile.custom_id == request.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    duration = doctor.avg_consultation_time or 20
    
    # 3. Get availability templates for this day
    templates = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == request.doctor_id,
        DoctorAvailability.day_of_week == day_of_week,
        DoctorAvailability.is_active == True
    ).all()
    
    if not templates:
        raise HTTPException(status_code=400, detail=f"No active availability templates found for {target_date.strftime('%A')}")
    
    # 4. Generate slots
    created_slots = 0
    for template in templates:
        # Create timezone-aware datetimes (UTC)
        current_time = datetime.combine(target_date, template.start_time).replace(tzinfo=timezone.utc)
        end_dt = datetime.combine(target_date, template.end_time).replace(tzinfo=timezone.utc)
        
        while current_time + timedelta(minutes=duration) <= end_dt:
            # Check if slot already exists
            existing = db.query(Slot).filter(
                Slot.doctor_id == request.doctor_id,
                Slot.start_time == current_time
            ).first()
            
            if not existing:
                new_slot = Slot(
                    doctor_id=request.doctor_id,
                    start_time=current_time,
                    end_time=current_time + timedelta(minutes=duration),
                    status="OPEN",
                    max_capacity=1
                )
                db.add(new_slot)
                created_slots += 1
            
            current_time += timedelta(minutes=duration)
    
    db.commit()
    return {"message": f"Successfully launched schedule. Created {created_slots} new slots.", "date": request.date}
