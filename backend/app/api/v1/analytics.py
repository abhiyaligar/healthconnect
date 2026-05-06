from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone, date, timedelta
from app.core.database import get_db
from app.models import Appointment, Slot, DoctorProfile, PatientProfile
from typing import List, Dict

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    
    # 1. Queue Status
    total_today = db.query(Appointment).join(Slot).filter(func.date(Slot.start_time) == today).count()
    
    # Priority Breakdown (Mocked logic for now: priority_score > 10 is Elevated, > 20 is Emergency)
    routine = db.query(Appointment).join(Slot).filter(func.date(Slot.start_time) == today, Appointment.priority_score <= 10).count()
    elevated = db.query(Appointment).join(Slot).filter(func.date(Slot.start_time) == today, Appointment.priority_score > 10, Appointment.priority_score <= 20).count()
    emergency = db.query(Appointment).join(Slot).filter(func.date(Slot.start_time) == today, Appointment.priority_score > 20).count()

    # 2. Avg Wait Time (Mocked based on avg_consultation_time of doctors)
    avg_wait = db.query(func.avg(DoctorProfile.avg_consultation_time)).scalar() or 20

    # 3. Doctor Workload
    doctors = db.query(DoctorProfile).all()
    workload = []
    for doc in doctors:
        booked = db.query(Appointment).join(Slot).filter(Slot.doctor_id == doc.custom_id, func.date(Slot.start_time) == today).count()
        total_slots = db.query(Slot).filter(Slot.doctor_id == doc.custom_id, func.date(Slot.start_time) == today).count()
        capacity_pct = (booked / total_slots * 100) if total_slots > 0 else 0
        workload.append({
            "name": doc.full_name,
            "capacity": int(capacity_pct),
            "current": booked,
            "total": total_slots
        })

    # 4. Conflict Detection (Real overbooking detection)
    conflicts = []
    overbooked_slots = (
        db.query(Slot)
        .filter(func.date(Slot.start_time) == today)
        .all()
    )
    
    for slot in overbooked_slots:
        apt_count = db.query(Appointment).filter(Appointment.slot_id == slot.id, Appointment.status != "CANCELLED").count()
        if apt_count > slot.max_capacity:
            conflicts.append({
                "doctor": slot.doctor.full_name,
                "time": slot.start_time.strftime("%I:%M %p"),
                "risk": "high" if apt_count > slot.max_capacity + 1 else "medium",
                "reason": f"{apt_count}/{slot.max_capacity} capacity exceeded",
                "slot_id": str(slot.id)
            })

    # 5. System Health (Simplified logic: 100% - (Overbooked Slots / Total Slots))
    total_slots = len(overbooked_slots)
    health = 100
    if total_slots > 0:
        health = int(100 - (len(conflicts) / total_slots * 100))

    return {
        "queue": {
            "total": total_today,
            "routine": routine,
            "elevated": elevated,
            "emergency": emergency
        },
        "system_health": health,
        "avg_wait_time": int(avg_wait),
        "workload": workload,
        "conflicts": conflicts
    }

@router.get("/conflicts/detailed")
def get_detailed_conflicts(db: Session = Depends(get_db)):
    today = date.today()
    now = datetime.now(timezone.utc)
    
    slots = db.query(Slot).filter(func.date(Slot.start_time) == today).all()
    detailed_conflicts = []
    
    # Track doctor workload for fatigue
    doctor_counts = {}

    for slot in slots:
        appointments = db.query(Appointment).filter(
            Appointment.slot_id == slot.id, 
            Appointment.status != "CANCELLED"
        ).all()
        
        doctor_counts[slot.doctor_id] = doctor_counts.get(slot.doctor_id, 0) + len(appointments)

        # 1. Overcapacity Conflict
        if len(appointments) > slot.max_capacity:
            affected_patients = []
            for apt in appointments:
                # Fetch real patient name
                patient_name = "Unknown"
                patient_profile = db.query(PatientProfile).filter(PatientProfile.custom_id == apt.patient_id).first()
                if patient_profile:
                    patient_name = patient_profile.full_name

                # Calculate priority score components
                base = 3 if apt.priority_score >= 30 else (2 if apt.priority_score >= 20 else 1)
                
                wait_mins = 0
                if apt.wait_start_time:
                    wst = apt.wait_start_time
                    if wst.tzinfo is None:
                        wst = wst.replace(tzinfo=timezone.utc)
                    wait_mins = int((now - wst).total_seconds() / 60)
                
                wait_score = wait_mins * 0.1
                penalty = apt.reschedule_count * 0.5
                total_score = round(base + wait_score - penalty, 2)
                
                affected_patients.append({
                    "id": str(apt.id),
                    "patient_name": patient_name,
                    "priority": f"P{base}",
                    "total_score": total_score,
                    "breakdown": {
                        "base": base,
                        "wait": round(wait_score, 1),
                        "penalty": round(penalty, 1)
                    },
                    "reschedule_count": apt.reschedule_count,
                    "action": "RETAIN"
                })
            
            # Simple balancing: Keep those with highest scores
            affected_patients.sort(key=lambda x: x["total_score"], reverse=True)
            for i, p in enumerate(affected_patients):
                if i >= slot.max_capacity:
                    p["action"] = "MOVE"

            detailed_conflicts.append({
                "type": "SLOT_OVERCAPACITY",
                "severity": "HIGH" if len(appointments) > slot.max_capacity + 1 else "MEDIUM",
                "doctor": slot.doctor.full_name,
                "time": slot.start_time.strftime("%I:%M %p"),
                "patients_affected": len(appointments),
                "patients": affected_patients,
                "suggestion": f"Move {len(appointments) - slot.max_capacity} patient(s) to next available slots"
            })

    # 2. Doctor Fatigue Detection
    for doc_id, count in doctor_counts.items():
        if count > 10: # Fatigue threshold
            doc = db.query(DoctorProfile).filter(DoctorProfile.custom_id == doc_id).first()
            if doc:
                detailed_conflicts.append({
                    "type": "FATIGUE_THRESHOLD_BREACHED",
                    "severity": "MEDIUM",
                    "doctor": doc.full_name,
                    "time": "Shift-wide",
                    "patients_affected": count,
                    "patients": [], # Simplified for now
                    "suggestion": "Redistribute afternoon patients across available doctors"
                })
    return detailed_conflicts

@router.get("/admin/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    today = date.today()
    
    # 1. KPIs
    total_today = db.query(Appointment).join(Slot).filter(func.date(Slot.start_time) == today).count()
    cancelled_today = db.query(Appointment).join(Slot).filter(func.date(Slot.start_time) == today, Appointment.status == "CANCELLED").count()
    
    # Resolution Rate (Mocked for now based on reschedule_count > 0)
    total_conflicts = db.query(Slot).filter(func.date(Slot.start_time) == today).count() # Very simplified
    resolved_count = db.query(Appointment).filter(Appointment.reschedule_count > 0).count()
    
    avg_wait = db.query(func.avg(DoctorProfile.avg_consultation_time)).scalar() or 20

    # 2. Hourly Data
    hourly_data = []
    for hour in range(8, 18): # 8 AM to 5 PM
        count = db.query(Appointment).join(Slot).filter(
            func.date(Slot.start_time) == today,
            func.extract('hour', Slot.start_time) == hour
        ).count()
        label = f"{hour if hour <= 12 else hour - 12}{'AM' if hour < 12 else 'PM'}"
        hourly_data.append({"hour": label, "count": count})

    # 3. Doctor Load
    doctors = db.query(DoctorProfile).all()
    doctor_load = []
    for doc in doctors:
        booked = db.query(Appointment).join(Slot).filter(Slot.doctor_id == doc.custom_id, func.date(Slot.start_time) == today).count()
        total_slots = db.query(Slot).filter(Slot.doctor_id == doc.custom_id, func.date(Slot.start_time) == today).count()
        doctor_load.append({
            "name": doc.full_name,
            "specialty": doc.specialty,
            "scheduled": booked,
            "capacity": total_slots or 20
        })

    # 4. Alerts (Recent 6 status changes)
    recent_events = []
    recent_apts = db.query(Appointment).order_by(Appointment.id.desc()).limit(6).all()
    for apt in recent_apts:
        atype = "info"
        if apt.status == "COMPLETED": atype = "success"
        elif apt.status == "CANCELLED": atype = "error"
        elif apt.status == "IN_PROGRESS": atype = "warning"
        
        recent_events.append({
            "id": str(apt.id),
            "type": atype,
            "time": "Just now",
            "message": f"Patient {apt.queue_token} is now {apt.status.replace('_', ' ').lower()}."
        })

    return {
        "kpis": [
            { "label": "Total Appointments", "value": str(total_today), "sub": "Live data", "trend": "up", "icon": "Calendar", "color": "text-primary-600", "bg": "bg-primary-50" },
            { "label": "Conflicts Resolved", "value": f"{resolved_count}", "sub": "Across system", "trend": "up", "icon": "CheckCircle2", "color": "text-status-open", "bg": "bg-status-open/10", "fillPct": 85 },
            { "label": "Avg. Wait Time", "value": f"{int(avg_wait)} min", "sub": "Global average", "trend": "down-good", "icon": "Clock", "color": "text-primary-600", "bg": "bg-primary-50" },
            { "label": "Cancellations", "value": f"{cancelled_today}", "sub": "Today", "trend": "up-bad", "icon": "Users", "color": "text-status-error", "bg": "bg-status-error/10" }
        ],
        "hourly_data": hourly_data,
        "doctor_load": doctor_load,
        "alerts": recent_events
    }
@router.get("/surge-status")
def get_surge_status(db: Session = Depends(get_db)):
    today = date.today()
    now = datetime.now(timezone.utc)
    half_hour_ago = now - timedelta(minutes=30)
    
    # 1. Cancellation Velocity (Last 30 mins)
    cancellations_recent = db.query(Appointment).join(Slot).filter(
        func.date(Slot.start_time) == today,
        Appointment.status == "CANCELLED",
        Appointment.status_changed_at >= half_hour_ago
    ).count()
    
    # 2. Total Gaps (Cancelled slots with no other active appointments)
    # This is a bit complex, let's simplify: percentage of cancelled appointments today
    total_active = db.query(Appointment).join(Slot).filter(
        func.date(Slot.start_time) == today,
        Appointment.status != "CANCELLED"
    ).count()
    
    total_cancelled = db.query(Appointment).join(Slot).filter(
        func.date(Slot.start_time) == today,
        Appointment.status == "CANCELLED"
    ).count()
    
    gap_pct = (total_cancelled / (total_active + total_cancelled) * 100) if (total_active + total_cancelled) > 0 else 0
    
    # 3. Decision Logic
    is_storm = cancellations_recent >= 5 or gap_pct >= 20
    
    return {
        "is_storm": is_storm,
        "cancellation_velocity": cancellations_recent, # per 30 mins
        "gap_percentage": int(gap_pct),
        "recommendation": "TRIGGER_COMPACTION" if is_storm else "STABLE",
        "message": "High cancellation volume detected. Consider compacting the schedule." if is_storm else "Schedule is stable."
    }
