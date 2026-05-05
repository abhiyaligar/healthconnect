from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class SlotBase(BaseModel):
    doctor_id: UUID
    start_time: datetime
    end_time: datetime
    status: str = "OPEN"
    max_capacity: int = 1

class SlotCreate(SlotBase):
    pass

class SlotUpdate(BaseModel):
    status: Optional[str] = None
    max_capacity: Optional[int] = None

class SlotOut(SlotBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
