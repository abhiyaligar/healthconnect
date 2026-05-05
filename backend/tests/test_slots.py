import uuid
from datetime import datetime, timedelta

def test_create_slot(client):
    doctor_id = str(uuid.uuid4())
    start_time = datetime.now() + timedelta(hours=1)
    end_time = start_time + timedelta(minutes=20)
    
    response = client.post(
        "/api/v1/slots/",
        json={
            "doctor_id": doctor_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "status": "OPEN",
            "max_capacity": 1
        }
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["doctor_id"] == doctor_id
    assert data["status"] == "OPEN"

def test_list_slots(client):
    response = client.get("/api/v1/slots/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
