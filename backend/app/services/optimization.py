from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timezone
from app.models import Appointment, Slot
from typing import List, Dict

class OptimizationService:
    @staticmethod
    def get_compaction_suggestions(db: Session, doctor_id: str) -> List[Dict]:
        today = date.today()
        now = datetime.now(timezone.utc)

        # 1. Get all active (not cancelled, not completed) appointments for this doctor today
        active_appointments = (
            db.query(Appointment)
            .join(Slot)
            .filter(
                Slot.doctor_id == doctor_id,
                func.date(Slot.start_time) == today,
                Appointment.status == "CONFIRMED",
                Slot.start_time > now # Only future appointments
            )
            .order_by(Slot.start_time.asc())
            .all()
        )

        # 2. Get all available capacity in future slots
        available_slots = (
            db.query(Slot)
            .filter(
                Slot.doctor_id == doctor_id,
                func.date(Slot.start_time) == today,
                Slot.start_time > now
            )
            .order_by(Slot.start_time.asc())
            .all()
        )

        suggestions = []
        
        # Simple Greedy Compaction: 
        # Move the latest appointments into the earliest available gaps
        
        # Map slots to their current occupation
        slot_occupancy = {}
        for slot in available_slots:
            count = db.query(Appointment).filter(Appointment.slot_id == slot.id, Appointment.status != "CANCELLED").count()
            slot_occupancy[slot.id] = count

        # Try to move appointments
        for apt in reversed(active_appointments): # Start from the latest
            for slot in available_slots:
                # If slot is earlier than current slot and has capacity
                if slot.start_time < apt.slot.start_time and slot_occupancy[slot.id] < slot.max_capacity:
                    suggestions.append({
                        "appointment_id": str(apt.id),
                        "patient_id": apt.patient_id,
                        "current_slot_id": str(apt.slot_id),
                        "current_time": apt.slot.start_time.isoformat(),
                        "suggested_slot_id": str(slot.id),
                        "suggested_time": slot.start_time.isoformat(),
                        "time_saved_mins": int((apt.slot.start_time - slot.start_time).total_seconds() / 60)
                    })
                    slot_occupancy[slot.id] += 1
                    slot_occupancy[apt.slot_id] -= 1
                    break # Found a move for this appointment

        return suggestions
