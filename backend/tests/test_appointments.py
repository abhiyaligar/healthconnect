import uuid
from datetime import datetime, timedelta

def test_book_appointment(authenticated_client, db):
    # 1. Create a slot first
    doctor_id = str(uuid.uuid4())
    start_time = datetime.now() + timedelta(hours=1)
    end_time = start_time + timedelta(minutes=20)
    
    slot_response = authenticated_client.post(
        "/api/v1/slots/",
        json={
            "doctor_id": doctor_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat()
        }
    )
    slot_id = slot_response.json()["id"]

    # 2. Book the slot
    response = authenticated_client.post(
        "/api/v1/appointments/",
        json={"slot_id": slot_id}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["slot_id"] == slot_id
    assert data["status"] == "CONFIRMED"
    assert "queue_token" in data
    assert data["queue_token"].startswith("HC-")

def test_book_closed_slot(authenticated_client):
    # 1. Create a closed slot
    doctor_id = str(uuid.uuid4())
    slot_response = authenticated_client.post(
        "/api/v1/slots/",
        json={
            "doctor_id": doctor_id,
            "start_time": datetime.now().isoformat(),
            "end_time": datetime.now().isoformat(),
            "status": "CLOSED"
        }
    )
    slot_id = slot_response.json()["id"]

    # 2. Try to book it
    response = authenticated_client.post(
        "/api/v1/appointments/",
        json={"slot_id": slot_id}
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Slot is closed"

def test_list_my_appointments(authenticated_client):
    response = authenticated_client.get("/api/v1/appointments/me")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
