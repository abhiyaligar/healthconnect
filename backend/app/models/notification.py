from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(String, index=True) # Linked to patient custom_id
    type = Column(String) # e.g., 'COME_EARLY', 'RESCHEDULE', 'CANCEL'
    message = Column(Text)
    status = Column(String, default="SENT") # SENT, READ, FAILED
    created_at = Column(DateTime(timezone=True), default=func.now())
