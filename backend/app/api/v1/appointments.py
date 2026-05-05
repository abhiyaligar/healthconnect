from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid as uuid_pkg
from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.slot import Slot
from app.schemas.appointment import AppointmentCreate, AppointmentOut, AppointmentUpdate
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appointment: AppointmentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_slot = db.query(Slot).filter(Slot.id == appointment.slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if db_slot.status == "CLOSED":
        raise HTTPException(status_code=400, detail="Slot is closed")

    queue_token = f"HC-{str(uuid_pkg.uuid4())[:8].upper()}"

    db_appointment = Appointment(
        patient_id=current_user["id"],
        slot_id=appointment.slot_id,
        queue_token=queue_token,
        status="CONFIRMED"
    )
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.get("/me", response_model=List[AppointmentOut])
def list_my_appointments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Appointment).filter(Appointment.patient_id == current_user["id"]).all()

@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(appointment_id: UUID, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

@router.patch("/{appointment_id}/call", response_model=AppointmentOut)
def start_consultation(appointment_id: UUID, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = "IN_PROGRESS"
    db_appointment.actual_start_time = datetime.utcnow()
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.patch("/{appointment_id}/complete", response_model=AppointmentOut)
def complete_consultation(appointment_id: UUID, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = "COMPLETED"
    db_appointment.actual_end_time = datetime.utcnow()
    
    if db_appointment.actual_start_time:
        duration = (db_appointment.actual_end_time - db_appointment.actual_start_time).total_seconds() / 60
        db_appointment.consultation_duration = int(duration)
        
    db.commit()
    db.refresh(db_appointment)
    return db_appointment
