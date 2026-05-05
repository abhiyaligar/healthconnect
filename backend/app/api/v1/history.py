from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.models import Appointment, MedicalRecord, PatientProfile
from app.schemas.appointment import AppointmentOut, MedicalRecordOut
from app.api.v1.auth import get_current_user

router = APIRouter()

@router.get("/{patient_id}", response_model=List[AppointmentOut])
def get_patient_clinical_history(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns the full clinical history of a patient.
    Accessible only to doctors or the patient themselves.
    """
    # Security check: User must be DOCTOR or the PATIENT itself
    is_doctor = current_user.user_metadata.get("role") == "DOCTOR"
    if not is_doctor and str(current_user["id"]) != str(patient_id):
         raise HTTPException(status_code=403, detail="Access denied")

    history = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient_id)
        .filter(Appointment.status == "COMPLETED")
        .order_by(Appointment.actual_end_time.desc())
        .all()
    )
    return history

@router.get("/{patient_id}/records", response_model=List[MedicalRecordOut])
def get_patient_records(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns all uploaded medical records for a patient.
    """
    is_doctor = current_user.user_metadata.get("role") == "DOCTOR"
    if not is_doctor and str(current_user["id"]) != str(patient_id):
         raise HTTPException(status_code=403, detail="Access denied")

    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.patient_id == patient_id)
        .order_by(MedicalRecord.created_at.desc())
        .all()
    )
    return records
