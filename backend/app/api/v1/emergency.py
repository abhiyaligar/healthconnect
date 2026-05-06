from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import Appointment, Slot, Notification, PatientProfile, DoctorProfile
from app.services.email_service import EmailService
from fastapi import BackgroundTasks
from pydantic import BaseModel
from datetime import date, datetime
import uuid

router = APIRouter()

class EmergencyMoveRequest(BaseModel):
    source_doctor_id: str
    target_doctor_id: Optional[str] = None
    source_date: date
    target_date: date

@router.get("/preview")
def get_emergency_preview(
    source_doctor_id: str,
    source_date: date,
    target_doctor_id: Optional[str] = None,
    target_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    # 1. Get all confirmed appointments for the source doctor on source date
    displaced_appointments = (
        db.query(Appointment)
        .join(Slot)
        .filter(
            Slot.doctor_id == source_doctor_id,
            func.date(Slot.start_time) == source_date,
            Appointment.status == "CONFIRMED"
        )
        .order_by(Appointment.priority_score.desc(), Slot.start_time.asc())
        .all()
    )

    if not displaced_appointments:
        return {"message": "No appointments found to displace", "candidates": []}

    # 2. Find available capacity on target doctor/date
    target_doc = target_doctor_id or source_doctor_id
    target_day = target_date or source_date
    
    available_slots = (
        db.query(Slot)
        .filter(
            Slot.doctor_id == target_doc,
            func.date(Slot.start_time) == target_day
        )
        .order_by(Slot.start_time.asc())
        .all()
    )

    # 3. Simulate mapping
    mapping = []
    slot_index = 0
    slot_occupancy = {s.id: db.query(Appointment).filter(Appointment.slot_id == s.id, Appointment.status != "CANCELLED").count() for s in available_slots}

    for apt in displaced_appointments:
        found = False
        while slot_index < len(available_slots):
            slot = available_slots[slot_index]
            if slot_occupancy[slot.id] < slot.max_capacity:
                mapping.append({
                    "appointment_id": str(apt.id),
                    "patient_id": apt.patient_id,
                    "priority": apt.priority_score,
                    "original_time": apt.slot.start_time.isoformat(),
                    "suggested_slot_id": str(slot.id),
                    "suggested_time": slot.start_time.isoformat(),
                    "status": "ALLOCATED"
                })
                slot_occupancy[slot.id] += 1
                found = True
                break
            slot_index += 1
        
        if not found:
            mapping.append({
                "appointment_id": str(apt.id),
                "patient_id": apt.patient_id,
                "priority": apt.priority_score,
                "original_time": apt.slot.start_time.isoformat(),
                "status": "OVERFLOW"
            })

    return {
        "source_count": len(displaced_appointments),
        "allocated_count": len([m for m in mapping if m["status"] == "ALLOCATED"]),
        "overflow_count": len([m for m in mapping if m["status"] == "OVERFLOW"]),
        "mapping": mapping
    }

@router.post("/execute")
def execute_emergency_move(
    request: EmergencyMoveRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # This actually performs the move based on the preview logic
    preview = get_emergency_preview(
        request.source_doctor_id, 
        request.source_date, 
        request.target_doctor_id, 
        request.target_date, 
        db
    )
    
    moves = 0
    for item in preview["mapping"]:
        if item["status"] == "ALLOCATED":
            apt = db.query(Appointment).filter(Appointment.id == item["appointment_id"]).first()
            if apt:
                apt.slot_id = item["suggested_slot_id"]
                
                # Log Emergency Notification
                msg = f"EMERGENCY: Your appointment has been rescheduled due to doctor unavailability. New time: {item['suggested_time']}. We apologize for the inconvenience."
                notif = Notification(
                    patient_id=apt.patient_id,
                    type="EMERGENCY_RESCHEDULE",
                    message=msg
                )
                db.add(notif)

                # Send Email (Background Task)
                patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == apt.patient_id).first()
                doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.custom_id == request.target_doctor_id or request.source_doctor_id).first()
                
                if patient_profile and patient_profile.email:
                    email_details = {
                        "old_time": item["original_time"],
                        "new_time": item["suggested_time"],
                        "doctor_name": doctor_profile.full_name if doctor_profile else "Assigned Doctor",
                        "date": request.target_date.isoformat()
                    }
                    background_tasks.add_task(EmailService.send_emergency_reschedule, patient_profile.email, email_details)
                
                moves += 1
    
    db.commit()
    return {"message": f"Successfully moved {moves} appointments", "count": moves, "overflow": preview["overflow_count"]}
