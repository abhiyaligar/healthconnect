from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.schemas.slot import SlotOut

class AppointmentBase(BaseModel):
    slot_id: UUID
    status: str = "PENDING"
    priority_score: int = 0

class AppointmentCreate(BaseModel):
    slot_id: UUID
    reason: Optional[str] = None
    patient_id: Optional[str] = None # For admin/receptionist booking

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    priority_score: Optional[int] = None

class ClinicalNotesUpdate(BaseModel):
    clinical_notes: Optional[str] = None
    diagnosis: Optional[str] = None

class AppointmentOut(AppointmentBase):
    id: UUID
    patient_id: str
    queue_token: Optional[str] = None
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    consultation_duration: Optional[int] = None
    clinical_notes: Optional[str] = None
    diagnosis: Optional[str] = None
    slot: Optional[SlotOut] = None
    model_config = ConfigDict(from_attributes=True)

class MedicalRecordOut(BaseModel):
    id: UUID
    patient_id: str
    appointment_id: Optional[UUID] = None
    file_url: str
    file_type: str
    description: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
