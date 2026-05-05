from sqlalchemy import Column, String, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    custom_id = Column(String, primary_key=True) # Generated as: 5-digits + NAME
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    mobile = Column(String, unique=True, nullable=True)
    specialty = Column(String, nullable=False)
    bio = Column(Text, nullable=True)
    avg_consultation_time = Column(Integer, default=20)
    manual_speed_factor = Column(Float, default=1.0)
    status = Column(String, default="ACTIVE") # ACTIVE, INACTIVE, ON_BREAK
    
    slots = relationship("Slot", back_populates="doctor")
