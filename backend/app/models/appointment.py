from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(String, ForeignKey("patient_profiles.custom_id"), nullable=False)
    slot_id = Column(UUID(as_uuid=True), ForeignKey("slots.id"), nullable=False)
    
    status = Column(String, default="PENDING")  # PENDING, CONFIRMED, BUMPED, CANCELLED, IN_PROGRESS, COMPLETED
    queue_token = Column(String, unique=True, nullable=True)
    priority_score = Column(Integer, default=0)
    reschedule_count = Column(Integer, default=0) # Track fairness
    wait_start_time = Column(DateTime(timezone=True), nullable=True) # For score calc
    
    # Tracking fields for real-time analytics
    actual_start_time = Column(DateTime(timezone=True), nullable=True)
    actual_end_time = Column(DateTime(timezone=True), nullable=True)
    consultation_duration = Column(Integer, nullable=True)  # in minutes
    status_changed_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    
    # Rating & Feedback
    rating = Column(Integer, nullable=True) # 1-5 stars
    feedback = Column(Text, nullable=True)

    # Clinical fields
    clinical_notes = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)

    slot = relationship("Slot", backref="appointments")
    vitals = relationship("Vitals", back_populates="appointment", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="appointment", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Appointment(id={self.id}, patient_id={self.patient_id}, status={self.status})>"
