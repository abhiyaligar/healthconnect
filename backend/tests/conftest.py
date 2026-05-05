import sys
import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import uuid

# Add the backend directory to the path so 'main' can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import Base, Slot, Appointment, DoctorProfile, PatientProfile, MedicalRecord

# Use SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the test database tables
Base.metadata.create_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]

@pytest.fixture
def mock_user():
    user_id = uuid.uuid4()
    # Mock class to behave like Supabase User object
    class MockUser:
        def __init__(self, id, email):
            self.id = id
            self.email = email
            self.user_metadata = {"role": "PATIENT", "full_name": "Test User"}
        
        def __getitem__(self, key):
            if key == "id": return self.id
            if key == "email": return self.email
            return None

    return MockUser(user_id, "test@example.com")

@pytest.fixture
def authenticated_client(client, mock_user, db):
    from app.models.patient import PatientProfile
    
    # Ensure a profile exists for the mock user
    existing = db.query(PatientProfile).filter(PatientProfile.user_id == mock_user["id"]).first()
    if not existing:
        db_profile = PatientProfile(user_id=mock_user["id"], base_priority=0)
        db.add(db_profile)
        db.commit()

    def override_get_current_user():
        return mock_user
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield client
    del app.dependency_overrides[get_current_user]
