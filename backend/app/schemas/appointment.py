from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class AppointmentBase(BaseModel):
    slot_id: UUID
    status: str = "PENDING"
    priority_score: int = 0

class AppointmentCreate(BaseModel):
    slot_id: UUID
    reason: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    priority_score: Optional[int] = None

class AppointmentOut(AppointmentBase):
    id: UUID
    patient_id: UUID
    queue_token: Optional[str] = None
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    consultation_duration: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)
