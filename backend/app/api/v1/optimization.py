from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.services.optimization import OptimizationService
from app.api.v1.auth import get_current_user
from app.models import Appointment, PatientProfile, DoctorProfile
from app.services.email_service import EmailService
from fastapi import BackgroundTasks

router = APIRouter()

@router.get("/suggestions/{doctor_id}")
def get_optimization_suggestions(doctor_id: str, db: Session = Depends(get_db)):
    return OptimizationService.get_compaction_suggestions(db, doctor_id)

@router.post("/apply")
def apply_optimizations(suggestions: List[dict], background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    from app.models.notification import Notification
    from app.models import Slot
    
    updated_count = 0
    for sug in suggestions:
        apt = db.query(Appointment).filter(Appointment.id == sug["appointment_id"]).first()
        if apt:
            old_slot = db.query(Slot).filter(Slot.id == apt.slot_id).first()
            new_slot = db.query(Slot).filter(Slot.id == sug["suggested_slot_id"]).first()
            
            apt.slot_id = sug["suggested_slot_id"]
            
            # Log Notification
            msg = f"Good news! A gap has opened up. Your appointment has been moved from {old_slot.start_time.strftime('%H:%M')} to {new_slot.start_time.strftime('%H:%M')}. Please arrive early if possible."
            notif = Notification(
                patient_id=apt.patient_id,
                type="COME_EARLY",
                message=msg
            )
            db.add(notif)
            
            # Send Email (Background Task)
            patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == apt.patient_id).first()
            if patient_profile and patient_profile.email:
                email_details = {
                    "doctor_name": new_slot.doctor.full_name if new_slot.doctor else "Assigned Doctor",
                    "date": new_slot.start_time.strftime("%Y-%m-%d"),
                    "old_time": old_slot.start_time.strftime("%H:%M"),
                    "new_time": new_slot.start_time.strftime("%H:%M"),
                }
                background_tasks.add_task(EmailService.send_emergency_reschedule, patient_profile.email, email_details)
            
            updated_count += 1
    
    db.commit()
    return {"message": f"Successfully moved {updated_count} appointments and notified patients.", "count": updated_count}

@router.get("/notifications", response_model=List[dict])
def get_optimization_notifications(db: Session = Depends(get_db)):
    from app.models.notification import Notification
    notifs = db.query(Notification).order_by(Notification.created_at.desc()).limit(20).all()
    return [
        {
            "id": str(n.id),
            "patient_id": n.patient_id,
            "type": n.type,
            "message": n.message,
            "created_at": n.created_at.isoformat()
        } for n in notifs
    ]
