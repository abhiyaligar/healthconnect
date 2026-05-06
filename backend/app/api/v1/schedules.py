from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, time, timedelta, timezone
import pytz
from app.core.database import get_db
from app.models.availability import DoctorAvailability
from app.models.doctor import DoctorProfile
from app.models.slot import Slot
from app.schemas.availability import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate, ScheduleLaunchRequest
from app.api.v1.auth import get_current_user
import uuid

IST = pytz.timezone('Asia/Kolkata')

router = APIRouter()

@router.get("/availability", response_model=List[AvailabilityOut])
def list_availability(doctor_id: str, db: Session = Depends(get_db)):
    return db.query(DoctorAvailability).filter(DoctorAvailability.doctor_id == doctor_id).all()

@router.post("/availability", response_model=AvailabilityOut)
def create_availability(availability: AvailabilityCreate, db: Session = Depends(get_db)):
    try:
        db_avail = DoctorAvailability(**availability.model_dump())
        db.add(db_avail)
        db.commit()
        db.refresh(db_avail)
        return db_avail
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create availability: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred while creating availability")

@router.delete("/availability/{id}")
def delete_availability(id: uuid.UUID, db: Session = Depends(get_db)):
    try:
        db_avail = db.query(DoctorAvailability).filter(DoctorAvailability.id == id).first()
        if not db_avail:
            raise HTTPException(status_code=404, detail="Availability not found")
        db.delete(db_avail)
        db.commit()
        return {"message": "Deleted successfully"}
    except HTTPException: raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete availability: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")


@router.post("/launch", status_code=status.HTTP_201_CREATED)
def launch_schedule(request: ScheduleLaunchRequest, db: Session = Depends(get_db)):
    return _internal_launch(request.doctor_id, request.date, db)

def _internal_launch(doctor_id: str, date_str: str, db: Session):
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    day_of_week = target_date.weekday()
    doctor = db.query(DoctorProfile).filter(DoctorProfile.custom_id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    duration = doctor.avg_consultation_time or 20
    templates = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id,
        DoctorAvailability.day_of_week == day_of_week,
        DoctorAvailability.is_active == True
    ).all()
    
    if not templates:
        return {"message": f"No active templates for {date_str}", "created": 0}
    
    day_start = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
    day_end = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)
    
    existing_slots = db.query(Slot).filter(
        Slot.doctor_id == doctor_id,
        Slot.start_time >= day_start,
        Slot.start_time <= day_end
    ).all()
    existing_times = {s.start_time.astimezone(timezone.utc) for s in existing_slots}
    
    created_slots = 0
    for template in templates:
        # Combine the date with the template time, treating it as IST
        # (Doctor enters 09:00 IST — we must convert to UTC for storage)
        current_time_ist = IST.localize(datetime.combine(target_date, template.start_time))
        end_dt_ist = IST.localize(datetime.combine(target_date, template.end_time))
        current_time = current_time_ist.astimezone(timezone.utc)
        end_dt = end_dt_ist.astimezone(timezone.utc)
        
        while current_time + timedelta(minutes=duration) <= end_dt:
            if current_time not in existing_times:
                new_slot = Slot(
                    doctor_id=doctor_id,
                    start_time=current_time,
                    end_time=current_time + timedelta(minutes=duration),
                    status="OPEN",
                    max_capacity=1
                )
                db.add(new_slot)
                created_slots += 1
                existing_times.add(current_time)
            current_time += timedelta(minutes=duration)
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Batch commit failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save generated slots")

    return {"message": f"Success for {date_str}", "created": created_slots}

@router.post("/launch/bulk")
def bulk_launch_schedule(doctor_id: str, days: int = Query(7, ge=1, le=30), db: Session = Depends(get_db)):
    today = datetime.now(IST).date()  # Use IST date, not UTC
    results = []
    for i in range(days):
        target_date = today + timedelta(days=i)
        res = _internal_launch(doctor_id, target_date.strftime("%Y-%m-%d"), db)
        results.append(res)
    
    total_created = sum(r["created"] for r in results)
    return {"message": f"Bulk launch completed. Total slots created: {total_created}", "details": results}
