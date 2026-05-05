from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class Slot(Base):
    __tablename__ = "slots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(String, ForeignKey("doctor_profiles.custom_id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="OPEN")  # OPEN, CLOSED, OVERBOOKED, CANCELLED
    max_capacity = Column(Integer, default=1)
    
    def __repr__(self):
        return f"<Slot(id={self.id}, doctor_id={self.doctor_id}, start={self.start_time})>"
