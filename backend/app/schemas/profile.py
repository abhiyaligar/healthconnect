from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime, date
from typing import Optional

class DoctorProfileBase(BaseModel):
    full_name: str
    specialty: str
    bio: Optional[str] = None
    status: str = "ACTIVE"

class DoctorProfileCreate(DoctorProfileBase):
    pass

class DoctorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    specialty: Optional[str] = None
    bio: Optional[str] = None
    manual_speed_factor: Optional[float] = None
    status: Optional[str] = None

class DoctorProfileOut(DoctorProfileBase):
    custom_id: str
    user_id: UUID
    mobile: Optional[str] = None
    avg_consultation_time: int
    manual_speed_factor: float
    model_config = ConfigDict(from_attributes=True)

class PatientProfileBase(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    base_priority: int = 0

class PatientProfileCreate(PatientProfileBase):
    pass

class PatientProfileUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    base_priority: Optional[int] = None
    medical_history: Optional[str] = None

class PatientProfileOut(PatientProfileBase):
    custom_id: str
    user_id: UUID
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    medical_history: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
