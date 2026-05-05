from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), nullable=False)  # Reference to patient user
    slot_id = Column(UUID(as_uuid=True), ForeignKey("slots.id"), nullable=False)
    
    status = Column(String, default="PENDING")  # PENDING, CONFIRMED, BUMPED, CANCELLED, IN_PROGRESS, COMPLETED
    queue_token = Column(String, unique=True, nullable=True)
    priority_score = Column(Integer, default=0)
    
    # Tracking fields for real-time analytics
    actual_start_time = Column(DateTime(timezone=True), nullable=True)
    actual_end_time = Column(DateTime(timezone=True), nullable=True)
    consultation_duration = Column(Integer, nullable=True)  # in minutes

    # Clinical fields
    clinical_notes = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)

    slot = relationship("Slot", backref="appointments")

    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, status={self.status})>"
