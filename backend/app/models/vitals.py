from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.models.base import Base

class Vitals(Base):
    __tablename__ = "vitals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    patient_id = Column(String, ForeignKey("patient_profiles.custom_id"), nullable=False)
    
    bp_systolic = Column(Integer, nullable=True)
    bp_diastolic = Column(Integer, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    spo2 = Column(Integer, nullable=True)
    temperature = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    appointment = relationship("Appointment", back_populates="vitals")

    def __repr__(self):
        return f"<Vitals(id={self.id}, patient={self.patient_id}, bp={self.bp_systolic}/{self.bp_diastolic})>"
