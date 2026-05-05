from sqlalchemy import Column, String, Integer, Text, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    full_name = Column(String, nullable=True) # Added for consistency
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    base_priority = Column(Integer, default=0)
    medical_history = Column(Text, nullable=True)
