from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import uuid as uuid_pkg
from app.core.database import get_db
from app.models import Appointment, Slot, PatientProfile, MedicalRecord
from app.schemas.appointment import AppointmentCreate, AppointmentOut, ClinicalNotesUpdate, MedicalRecordOut
from app.api.v1.auth import get_current_user
from app.services.analytics import calculate_doctor_avg
from app.core.storage import upload_medical_file

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

    patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user["id"]).first()
    base_priority = patient_profile.base_priority if patient_profile else 0

    queue_token = f"HC-{str(uuid_pkg.uuid4())[:8].upper()}"

    db_appointment = Appointment(
        patient_id=current_user["id"],
        slot_id=appointment.slot_id,
        queue_token=queue_token,
        status="CONFIRMED",
        priority_score=base_priority
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
        db_appointment.consultation_duration = max(1, int(duration))
        
    db.commit()
    db.refresh(db_appointment)
    
    db_slot = db_appointment.slot
    if db_slot:
        calculate_doctor_avg(db_slot.doctor_id, db)
        
    return db_appointment

@router.patch("/{appointment_id}/clinical-notes", response_model=AppointmentOut)
def update_clinical_notes(
    appointment_id: UUID,
    notes: ClinicalNotesUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Security: Ensure current_user is the doctor of this appointment
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if doctor owns the slot
    if db_appointment.slot.doctor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this appointment")
    
    db_appointment.clinical_notes = notes.clinical_notes
    db_appointment.diagnosis = notes.diagnosis
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.post("/{appointment_id}/records", response_model=MedicalRecordOut)
async def upload_record(
    appointment_id: UUID,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if db_appointment.slot.doctor_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to add records to this appointment")

    # Upload to Supabase Storage
    content = await file.read()
    file_url = upload_medical_file(content, file.filename, file.content_type)
    
    db_record = MedicalRecord(
        appointment_id=appointment_id,
        patient_id=db_appointment.patient_id,
        doctor_id=current_user["id"],
        file_url=file_url,
        file_type=file_type,
        description=description
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
