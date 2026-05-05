from sqlalchemy import Column, String, Integer, Text, Date
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    custom_id = Column(String, primary_key=True) # Generated as: 5-digits + NAME
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    mobile = Column(String, unique=True, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    base_priority = Column(Integer, default=0)
    medical_history = Column(Text, nullable=True)
