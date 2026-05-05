from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import Appointment, DoctorProfile, Slot
from uuid import UUID

def calculate_doctor_avg(doctor_id: UUID, db: Session):
    """
    Calculates the rolling average consultation time based on the last 10 
    COMPLETED appointments for a specific doctor.
    """
    last_appointments = (
        db.query(Appointment)
        .join(Slot)
        .filter(Slot.doctor_id == doctor_id)
        .filter(Appointment.status == "COMPLETED")
        .filter(Appointment.consultation_duration.isnot(None))
        .order_by(desc(Appointment.actual_end_time))
        .limit(10)
        .all()
    )
    
    if not last_appointments:
        return
    
    total_duration = sum([a.consultation_duration for a in last_appointments])
    new_avg = int(total_duration / len(last_appointments))
    
    # Update doctor profile
    doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_id).first()
    if doctor_profile:
        doctor_profile.avg_consultation_time = new_avg
        db.commit()
