from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, time, timezone
from uuid import UUID
from app.core.database import get_db
from app.models.slot import Slot
from app.schemas.slot import SlotCreate, SlotOut, SlotUpdate

router = APIRouter()

@router.post("/", response_model=SlotOut, status_code=status.HTTP_201_CREATED)
def create_slot(slot: SlotCreate, db: Session = Depends(get_db)):
    db_slot = Slot(**slot.model_dump())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.get("/", response_model=List[SlotOut])
def list_slots(
    doctor_id: Optional[str] = None, 
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Slot).filter(Slot.status == "OPEN")
    if doctor_id:
        query = query.filter(Slot.doctor_id == doctor_id)
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            # Filter for slots on this date (timezone aware)
            query = query.filter(
                Slot.start_time >= datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc),
                Slot.start_time <= datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    return query.order_by(Slot.start_time.asc()).all()

@router.get("/{slot_id}", response_model=SlotOut)
def get_slot(slot_id: UUID, db: Session = Depends(get_db)):
    db_slot = db.query(Slot).filter(Slot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    return db_slot
