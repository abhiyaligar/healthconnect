from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.core.database import get_db
from app.models import Vitals, Prescription, PrescriptionItem, Appointment, PatientProfile
from app.schemas.clinical import VitalsCreate, VitalsOut, PrescriptionCreate, PrescriptionOut, ICDCode
from app.api.v1.auth import get_current_user

router = APIRouter()

# --- Vitals APIs ---

@router.post("/vitals", response_model=VitalsOut, status_code=status.HTTP_201_CREATED)
def create_vitals(vitals: VitalsCreate, db: Session = Depends(get_db)):
    db_vitals = Vitals(**vitals.model_dump())
    db.add(db_vitals)
    db.commit()
    db.refresh(db_vitals)
    return db_vitals

@router.get("/vitals/history/{patient_id}", response_model=List[VitalsOut])
def get_vitals_history(patient_id: str, db: Session = Depends(get_db)):
    return db.query(Vitals).filter(Vitals.patient_id == patient_id).order_by(Vitals.recorded_at.desc()).all()

# --- Prescription APIs ---

@router.post("/prescription", response_model=PrescriptionOut, status_code=status.HTTP_201_CREATED)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    # 1. Create the main prescription record
    db_prescription = Prescription(
        appointment_id=prescription.appointment_id,
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
        notes=prescription.notes
    )
    db.add(db_prescription)
    db.flush() # Get the ID before adding items

    # 2. Add prescription items
    for item in prescription.items:
        db_item = PrescriptionItem(
            prescription_id=db_prescription.id,
            **item.model_dump()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_prescription)
    return db_prescription

@router.get("/prescription/{appointment_id}", response_model=Optional[PrescriptionOut])
def get_prescription(appointment_id: UUID, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.appointment_id == appointment_id).first()

# --- ICD-10 Search (Mocked for now with common codes) ---

COMMON_ICD_CODES = [
    {"code": "I10", "description": "Essential (primary) hypertension"},
    {"code": "E11.9", "description": "Type 2 diabetes mellitus without complications"},
    {"code": "J06.9", "description": "Acute upper respiratory infection, unspecified"},
    {"code": "M54.5", "description": "Low back pain"},
    {"code": "K21.9", "description": "Gastro-esophageal reflux disease without esophagitis"},
    {"code": "N39.0", "description": "Urinary tract infection, site not specified"},
    {"code": "F41.1", "description": "Generalized anxiety disorder"},
    {"code": "E66.9", "description": "Obesity, unspecified"},
]

@router.get("/icd10", response_model=List[ICDCode])
def search_icd10(query: str):
    if not query:
        return []
    query = query.lower()
    results = [
        code for code in COMMON_ICD_CODES 
        if query in code["code"].lower() or query in code["description"].lower()
    ]
    return results[:10] # Limit to 10 results
