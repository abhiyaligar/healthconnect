from sqlalchemy import Column, String, DateTime, JSON, UUID, Boolean
from app.models.base import Base
import uuid
from datetime import datetime, timezone

class SystemSetting(Base):
    __tablename__ = "system_settings"
    key = Column(String, primary_key=True)
    value = Column(JSON)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String) # e.g., "USER_DEACTIVATED", "SETTINGS_UPDATED"
    performed_by = Column(String) # User full name or ID
    details = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AdminProfile(Base):
    __tablename__ = "admin_profiles"
    user_id = Column(UUID(as_uuid=True), primary_key=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    status = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
