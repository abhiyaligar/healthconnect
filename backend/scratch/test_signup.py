import uuid
from app.core.database import SessionLocal
from app.models import PatientProfile

def test_signup():
    db = SessionLocal()
    user_id = uuid.uuid4()
    custom_id = "12345-TEST"
    
    profile = PatientProfile(
        user_id=user_id,
        full_name="Test Patient",
        mobile="1234567890",
        custom_id=custom_id,
        base_priority=0
    )
    
    print("Adding profile...")
    db.add(profile)
    print("Committing...")
    try:
        db.commit()
        print("Success!")
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_signup()
