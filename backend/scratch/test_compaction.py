from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Appointment, Slot, DoctorProfile, PatientProfile
from datetime import datetime, timedelta, date, timezone
import uuid

def setup_test_scenario():
    db = SessionLocal()
    try:
        # 1. Create a fresh test doctor
        test_doc_id = f"TEST-DOC-{uuid.uuid4().hex[:6]}"
        doctor = DoctorProfile(
            custom_id=test_doc_id,
            user_id=uuid.uuid4(),
            full_name=f"Dr. Compaction-{test_doc_id}",
            specialty="Optimization"
        )
        db.add(doctor)
        db.commit()
        db.refresh(doctor)

        # 2. Create 6 slots for today (starting 1 hour from now)
        start_base = datetime.now(timezone.utc) + timedelta(hours=1)
        slots = []
        for i in range(6):
            slot_start = start_base + timedelta(minutes=i*30)
            slot = Slot(
                id=uuid.uuid4(),
                doctor_id=str(doctor.custom_id),
                start_time=slot_start,
                end_time=slot_start + timedelta(minutes=30),
                status="AVAILABLE",
                max_capacity=1
            )
            db.add(slot)
            slots.append(slot)
        
        db.commit()
        for s in slots: db.refresh(s)

        # 3. Book patients into all 6 slots
        for i, slot in enumerate(slots):
            # Create dummy patient if needed
            patient_id = f"TEST-PATIENT-{i}"
            apt = Appointment(
                id=uuid.uuid4(),
                patient_id=patient_id,
                slot_id=slot.id,
                status="CONFIRMED",
                queue_token=f"TKN-{i}",
                priority_score=10,
                wait_start_time=datetime.now(timezone.utc)
            )
            db.add(apt)
        
        db.commit()
        print(f"Created 6 appointments for {doctor.full_name}")

        # 4. CANCEL slots 1 and 2 (the middle ones) to create a GAP
        # Sequence: 0 (OK), 1 (GAP), 2 (GAP), 3 (OK), 4 (OK), 5 (OK)
        # We expect 3, 4, 5 to be moved into 1, 2, 3
        apts = db.query(Appointment).join(Slot).filter(Slot.doctor_id == doctor.custom_id).order_by(Slot.start_time).all()
        apts[1].status = "CANCELLED"
        apts[2].status = "CANCELLED"
        db.commit()
        print("Cancelled 2 middle appointments. GAP CREATED.")
        print(f"Doctor ID for Dashboard: {doctor.custom_id}")

    finally:
        db.close()

if __name__ == "__main__":
    setup_test_scenario()
