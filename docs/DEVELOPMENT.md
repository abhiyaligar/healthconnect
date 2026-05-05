# Development Guide & Task Distribution

## Setup
1. Clone the repo.
2. Create `backend/.env` (see README for template).
3. `pip install -r backend/requirements.txt`
4. `alembic upgrade head`

## Team Task Distribution

### Developer 1: The "Scheduling & Logic" Lead
- **Module**: Appointment Engine & Conflict Resolver.
- **Responsibilities**:
    - `app/models/appointment.py`
    - `app/services/scheduler.py` (The logic for resolving overbooking)
    - WebSocket integration for live queue updates.

### Developer 2: The "Domain & Resource" Lead
- **Module**: Doctor Management & Patient Profiles.
- **Responsibilities**:
    - `app/models/doctor.py`
    - `app/api/v1/doctors.py`
    - Notification service (Email/SMS integration).

## Git Workflow
- Create a branch for every feature: `feat/feature-name`.
- Always agree on Pydantic Schemas before implementing the logic.
