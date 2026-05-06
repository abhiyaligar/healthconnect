from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime, timezone, date, timedelta
from sqlalchemy import func
import uuid as uuid_pkg
from app.core.database import get_db
from app.models import Appointment, Slot, PatientProfile, MedicalRecord, DoctorProfile
from app.schemas.appointment import AppointmentCreate, AppointmentOut, ClinicalNotesUpdate, MedicalRecordOut
from app.api.v1.auth import get_current_user
from app.schemas.pagination import PaginatedResponse, paginate
from app.services.analytics import calculate_doctor_avg
from app.services.email_service import EmailService
from app.core.storage import upload_medical_file
from fastapi import BackgroundTasks
from app.utils.time_ist import ist_date_str, ist_time_str

router = APIRouter()

@router.post("/", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def book_appointment(
    appointment: AppointmentCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user.id))
    
    db_slot = db.query(Slot).filter(Slot.id == appointment.slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    # Overbooking check
    active_count = db.query(Appointment).filter(Appointment.slot_id == appointment.slot_id, Appointment.status != "CANCELLED").count()
    
    if active_count >= db_slot.max_capacity:
        # 1. Fatigue Safety Valve: Check if doctor is running 40+ mins late
        active_apt = db.query(Appointment).join(Slot).filter(
            Slot.doctor_id == db_slot.doctor_id,
            func.date(Slot.start_time) == date.today(),
            Appointment.status == "IN_PROGRESS"
        ).first()
        
        is_fatigued = False
        if active_apt:
            now = datetime.now(timezone.utc)
            scheduled = active_apt.slot.start_time
            if scheduled.tzinfo is None: scheduled = scheduled.replace(tzinfo=timezone.utc)
            delay = int((now - scheduled).total_seconds() / 60)
            if delay >= 40:
                is_fatigued = True
        
        if is_fatigued:
            raise HTTPException(status_code=403, detail="Doctor is currently fatigued (Running 40+ mins late). Overbooking disabled for safety.")
        
        # 2. Hard Capacity Limit (Max 1 overbook)
        if active_count >= db_slot.max_capacity + 1:
            raise HTTPException(status_code=400, detail="Slot is at maximum overbooking capacity")

    # 3. Lobby Crowd Control (Walk-in Rate Limit)
    if appointment.source == "WALK_IN":
        fifteen_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=15)
        # We check the source from recent appointments if we were storing it, 
        # but since we just added it, let's just count total creations for now 
        # or assume we'll store it in the next step.
        # For now, let's assume the Appointment model has a source field.
        recent_walkins = db.query(Appointment).filter(
            Appointment.created_at >= fifteen_mins_ago
        ).count()
        
        if recent_walkins >= 5:
            raise HTTPException(status_code=429, detail="Lobby is currently overcrowded. Please wait a few minutes before registering more walk-ins.")

    # If receptionist/admin is booking for a patient
    role = current_user.user_metadata.get("role", "").lower()
    if appointment.patient_id and role in ["receptionist", "admin"]:
        patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == appointment.patient_id).first()
    else:
        # Default: Patient booking for themselves
        user_id = uuid_pkg.UUID(str(current_user.id))
        patient_profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()

    if not patient_profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    base_priority = patient_profile.base_priority
    patient_custom_id = patient_profile.custom_id

    queue_token = f"HC-{str(uuid_pkg.uuid4())[:8].upper()}"

    db_appointment = Appointment(
        patient_id=patient_custom_id,
        slot_id=appointment.slot_id,
        queue_token=queue_token,
        status="CONFIRMED",
        priority_score=base_priority,
        wait_start_time=datetime.now(timezone.utc)
    )
    
    # Update slot status if capacity is reached
    if active_count + 1 >= db_slot.max_capacity:
        db_slot.status = "CLOSED"
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    # 4. Send Confirmation Email (Background Task)
    email_details = {
        "doctor_name": db_slot.doctor.full_name,
        "date": ist_date_str(db_slot.start_time),
        "time": ist_time_str(db_slot.start_time),
        "token": queue_token
    }
    # We use current_user.email for the patient who is booking
    # If a receptionist is booking, we should fetch patient_profile.email
    target_email = patient_profile.email or current_user.email
    background_tasks.add_task(EmailService.send_appointment_confirmation, target_email, email_details)

    return db_appointment

@router.get("/me", response_model=PaginatedResponse[AppointmentOut])
def list_my_appointments(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user.id))
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
    if not profile:
        return PaginatedResponse(items=[], total=0, page=page, size=limit, pages=0)
    query = db.query(Appointment).filter(Appointment.patient_id == profile.custom_id)
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

@router.get("/doctor/me", response_model=PaginatedResponse[AppointmentOut])
def list_doctor_appointments(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user.id))
    doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
    if not doctor:
        return PaginatedResponse(items=[], total=0, page=page, size=limit, pages=0)
    query = db.query(Appointment).join(Slot).filter(Slot.doctor_id == doctor.custom_id)
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

@router.get("/all", response_model=PaginatedResponse[AppointmentOut])
def list_all_appointments(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    query = db.query(Appointment).filter(Appointment.status != 'CANCELLED')
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

@router.get("/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a single appointment by ID. Accessible by the patient who owns it, their doctor, or admin/receptionist."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    role = current_user.user_metadata.get("role", "").lower()
    user_id = uuid_pkg.UUID(str(current_user.id))

    # Admin & receptionist can view all
    if role in ["admin", "receptionist"]:
        return appointment

    # Doctor can view their own appointments
    if role == "doctor":
        doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
        if doctor and appointment.slot and appointment.slot.doctor_id == doctor.custom_id:
            return appointment
        raise HTTPException(status_code=403, detail="Not authorized to view this appointment")

    # Patient can only view their own appointments
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == user_id).first()
    if patient and appointment.patient_id == patient.custom_id:
        return appointment

    raise HTTPException(status_code=403, detail="Not authorized to view this appointment")



@router.patch("/{appointment_id}/call", response_model=AppointmentOut)
def start_consultation(
    appointment_id: UUID, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = "IN_PROGRESS"
    db_appointment.actual_start_time = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_appointment)

    # Send "Turn Arrived" Email (Background Task)
    patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == db_appointment.patient_id).first()
    if patient_profile and patient_profile.email:
        email_details = {
            "doctor_name": db_appointment.slot.doctor.full_name if db_appointment.slot and db_appointment.slot.doctor else "Your Doctor",
            "room": "101" # Mock room number
        }
        background_tasks.add_task(EmailService.send_turn_arrival_notification, patient_profile.email, email_details)

    return db_appointment

@router.patch("/{appointment_id}/no-show", response_model=AppointmentOut)
def mark_no_show(
    appointment_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = "CANCELLED"
    
    # Re-open the slot for other patients
    if db_appointment.slot:
        db_appointment.slot.status = "OPEN"
        
    db.commit()
    db.refresh(db_appointment)

    # Send Email (Background Task)
    patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == db_appointment.patient_id).first()
    if patient_profile and patient_profile.email:
        email_details = {
            "doctor_name": db_appointment.slot.doctor.full_name if db_appointment.slot and db_appointment.slot.doctor else "Assigned Doctor",
            "date": ist_date_str(db_appointment.slot.start_time) if db_appointment.slot else "N/A",
            "time": ist_time_str(db_appointment.slot.start_time) if db_appointment.slot else "N/A",
            "reason": "No-show recorded"
        }
        background_tasks.add_task(EmailService.send_appointment_cancellation, patient_profile.email, email_details)

    return db_appointment

@router.patch("/{appointment_id}/bump", response_model=AppointmentOut)
def bump_priority(appointment_id: UUID, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.priority_score += 5
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.patch("/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    appointment_id: UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = "CANCELLED"
    if db_appointment.slot:
        db_appointment.slot.status = "OPEN"
        
    db.commit()
    db.refresh(db_appointment)

    # Send Email (Background Task)
    patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == db_appointment.patient_id).first()
    if patient_profile and patient_profile.email:
        email_details = {
            "doctor_name": db_appointment.slot.doctor.full_name if db_appointment.slot and db_appointment.slot.doctor else "Assigned Doctor",
            "date": ist_date_str(db_appointment.slot.start_time) if db_appointment.slot else "N/A",
            "time": ist_time_str(db_appointment.slot.start_time) if db_appointment.slot else "N/A",
            "reason": "Cancelled by user/staff"
        }
        background_tasks.add_task(EmailService.send_appointment_cancellation, patient_profile.email, email_details)

    return db_appointment

@router.patch("/{appointment_id}/complete", response_model=AppointmentOut)
def complete_consultation(appointment_id: UUID, db: Session = Depends(get_db)):
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_appointment.status = "COMPLETED"
    db_appointment.actual_end_time = datetime.now(timezone.utc)
    
    if db_appointment.actual_start_time:
        # Ensure actual_start_time is aware if it's not (though it should be)
        start_time = db_appointment.actual_start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
            
        duration = (db_appointment.actual_end_time - start_time).total_seconds() / 60
        db_appointment.consultation_duration = max(1, int(duration))
        
    try:
        db.commit()
        db.refresh(db_appointment)
        
        db_slot = db_appointment.slot
        if db_slot:
            calculate_doctor_avg(db_slot.doctor_id, db)
            
        return db_appointment
    except Exception as e:
        print(f"Error completing consultation: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{appointment_id}/clinical-notes", response_model=AppointmentOut)
def update_clinical_notes(
    appointment_id: UUID,
    notes: ClinicalNotesUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user.id))
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
    if not doctor or db_appointment.slot.doctor_id != doctor.custom_id:
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
    current_user = Depends(get_current_user)
):
    user_id = uuid_pkg.UUID(str(current_user.id))
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    doctor = db.query(DoctorProfile).filter(DoctorProfile.user_id == user_id).first()
    if not doctor or db_appointment.slot.doctor_id != doctor.custom_id:
        raise HTTPException(status_code=403, detail="Not authorized to add records to this appointment")

    content = await file.read()
    file_url = upload_medical_file(content, file.filename, file.content_type)
    
    db_record = MedicalRecord(
        appointment_id=appointment_id,
        patient_id=db_appointment.patient_id,
        doctor_id=doctor.custom_id,
        file_url=file_url,
        file_type=file_type,
        description=description
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/batch-reschedule")
def batch_reschedule(
    mapping: Dict[str, str], # appointment_id -> new_slot_id
    db: Session = Depends(get_db)
):
    updated = 0
    for apt_id, slot_id in mapping.items():
        apt = db.query(Appointment).filter(Appointment.id == apt_id).first()
        if apt:
            # Re-open old slot if it was CLOSED
            if apt.slot:
                apt.slot.status = "OPEN"
            
            apt.slot_id = slot_id
            apt.reschedule_count += 1
            
            # Close new slot
            new_slot = db.query(Slot).filter(Slot.id == slot_id).first()
            if new_slot:
                new_slot.status = "CLOSED"
                
            updated += 1
    
    db.commit()
    return {"message": f"Successfully rescheduled {updated} appointments.", "count": updated}

@router.post("/{appointment_id}/rate")
def rate_appointment(
    appointment_id: UUID,
    rating: int,
    feedback: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    # Security check: Only the patient who booked it can rate
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == str(current_user.id)).first()
    if not profile or str(appointment.patient_id) != str(profile.custom_id):
         raise HTTPException(status_code=403, detail="You can only rate your own appointments")
         
    if appointment.status != "COMPLETED":
        raise HTTPException(status_code=400, detail="Can only rate completed appointments")
        
    appointment.rating = rating
    appointment.feedback = feedback
    db.commit()
    return {"message": "Rating submitted successfully"}
