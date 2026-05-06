from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.models.base import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=False)
    patient_id = Column(String, ForeignKey("patient_profiles.custom_id"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctor_profiles.custom_id"), nullable=False)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id"), nullable=False)
    
    medicine_name = Column(String, nullable=False)
    dosage = Column(String, nullable=True) # e.g. 500mg
    frequency = Column(String, nullable=True) # e.g. 1-0-1
    duration = Column(String, nullable=True) # e.g. 5 days
    instructions = Column(String, nullable=True) # e.g. After food

    prescription = relationship("Prescription", back_populates="items")
