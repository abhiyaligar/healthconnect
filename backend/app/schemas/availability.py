from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import time
from typing import Optional, List

class AvailabilityBase(BaseModel):
    doctor_id: str
    day_of_week: int  # 0=Monday, 6=Sunday
    start_time: time
    end_time: time
    is_active: bool = True

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityUpdate(BaseModel):
    day_of_week: Optional[int] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_active: Optional[bool] = None

class AvailabilityOut(AvailabilityBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ScheduleLaunchRequest(BaseModel):
    doctor_id: str
    date: str # ISO date string YYYY-MM-DD
