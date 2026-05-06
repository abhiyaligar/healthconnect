from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models import Appointment, MedicalRecord, PatientProfile
from app.schemas.appointment import AppointmentOut, MedicalRecordOut
from app.api.v1.auth import get_current_user
from app.schemas.pagination import PaginatedResponse, paginate

router = APIRouter()

@router.get("/{patient_id}", response_model=PaginatedResponse[AppointmentOut])
def get_patient_clinical_history(
    patient_id: str,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns the full clinical history of a patient.
    Accessible only to doctors or the patient themselves.
    """
    # Security check: User must be DOCTOR or the PATIENT itself
    is_doctor = current_user.user_metadata.get("role") == "DOCTOR"
    
    if not is_doctor:
        # Check if the custom_id belongs to the current user
        profile = db.query(PatientProfile).filter(PatientProfile.custom_id == patient_id).first()
        if not profile or str(profile.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")

    query = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .filter(Appointment.status == "COMPLETED")
        .order_by(Appointment.actual_end_time.desc())
    )
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

@router.get("/{patient_id}/records", response_model=PaginatedResponse[MedicalRecordOut])
def get_patient_records(
    patient_id: str,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns all uploaded medical records for a patient.
    """
    is_doctor = current_user.user_metadata.get("role") == "DOCTOR"
    
    if not is_doctor:
        profile = db.query(PatientProfile).filter(PatientProfile.custom_id == patient_id).first()
        if not profile or str(profile.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")

    query = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
    )
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

@router.get("/me/full", response_model=PaginatedResponse[AppointmentOut])
def get_my_full_history(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == str(current_user.id)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    query = (
        db.query(Appointment)
        .filter(Appointment.patient_id == profile.custom_id)
        .order_by(Appointment.actual_end_time.desc())
    )
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)

@router.get("/doctor/me", response_model=PaginatedResponse[AppointmentOut])
def get_doctor_consultation_history(
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from app.models import Slot
    role = current_user.user_metadata.get("role")
    if role != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can access this")
        
    # Find doctor custom_id
    from app.models import DoctorProfile
    doc = db.query(DoctorProfile).filter(DoctorProfile.user_id == str(current_user.id)).first()
    if not doc:
        return []
        
    query = (
        db.query(Appointment)
        .join(Slot)
        .filter(Slot.doctor_id == doc.custom_id, Appointment.status == "COMPLETED")
        .order_by(Appointment.actual_end_time.desc())
    )
    items, total, pages = paginate(query, page, limit)
    return PaginatedResponse(items=items, total=total, page=page, size=limit, pages=pages)
