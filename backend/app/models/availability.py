from sqlalchemy import Column, String, Integer, Time, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(String, ForeignKey("doctor_profiles.custom_id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<DoctorAvailability(doctor={self.doctor_id}, day={self.day_of_week}, {self.start_time}-{self.end_time})>"
