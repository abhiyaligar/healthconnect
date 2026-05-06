from sqlalchemy import Column, String, DateTime, Boolean, UUID
from app.models.base import Base
import uuid
from datetime import datetime, timezone

class OTPRecord(Base):
    __tablename__ = "otp_records"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    purpose = Column(String, nullable=False) # e.g., "RESET_PASSWORD"
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
