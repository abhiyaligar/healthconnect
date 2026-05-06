from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# Vitals Schemas
class VitalsBase(BaseModel):
    appointment_id: Optional[UUID] = None
    patient_id: str
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    heart_rate: Optional[int] = None
    spo2: Optional[int] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None

class VitalsCreate(VitalsBase):
    pass

class VitalsOut(VitalsBase):
    id: UUID
    recorded_at: datetime
    model_config = ConfigDict(from_attributes=True)

# Prescription Schemas
class PrescriptionItemBase(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None

class PrescriptionItemCreate(PrescriptionItemBase):
    pass

class PrescriptionItemOut(PrescriptionItemBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class PrescriptionBase(BaseModel):
    appointment_id: UUID
    patient_id: str
    doctor_id: str
    notes: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    items: List[PrescriptionItemCreate]

class PrescriptionOut(PrescriptionBase):
    id: UUID
    created_at: datetime
    items: List[PrescriptionItemOut]
    model_config = ConfigDict(from_attributes=True)

# ICD-10 Schemas
class ICDCode(BaseModel):
    code: str
    description: str
