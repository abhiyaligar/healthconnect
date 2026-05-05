from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.models.base import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey("appointments.id"), nullable=True)
    patient_id = Column(String, ForeignKey("patient_profiles.custom_id"), nullable=False)
    doctor_id = Column(UUID(as_uuid=True), nullable=False)
    
    file_url = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # e.g. LAB_REPORT, PRESCRIPTION, SCAN
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
