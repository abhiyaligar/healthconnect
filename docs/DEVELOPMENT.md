# Development Guide & Task Distribution

## Setup
1. Clone the repo.
2. Create `backend/.env` (see README for template).
3. `pip install -r backend/requirements.txt`
4. `alembic upgrade head`

## Testing
To run the test suite (uses a local SQLite `test.db`):
1. `cd backend`
2. `pytest`

## API Documentation
Once the server is running (`uvicorn main:app --reload`), visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **Redoc**: `http://localhost:8000/redoc`

## Phase 1: Data Foundation & Dynamic Tracking (COMPLETED)

### Models & Schemas
- **Slots**: Resource-based management of doctor time blocks.
- **Appointments**: Patient bookings with dynamic tracking (`actual_start`, `actual_end`).
- **Response Models**: All endpoints return enriched data, including nested Slot information in Appointment responses.

### Tracking API
- `PATCH /api/v1/appointments/{id}/call`: Start a consultation (records start time).
- `PATCH /api/v1/appointments/{id}/complete`: Complete a consultation (calculates duration).

## Team Task Distribution

### Developer 1: The "Scheduling & Logic" Lead
- **Current Progress**:
    - [x] Phase 1: Data Foundation & Dynamic Tracking.
- **Next Steps (Phase 2: The Stabilizer)**:
    - [ ] `app/services/scheduler.py`: Implement the conflict detection and fairness logic.
    - [ ] Supabase Realtime: Integrate live queue broadcasts.

### Developer 2: The "Domain & Resource" Lead
- **Responsibilities**:
    - `app/models/doctor.py`
    - `app/api/v1/doctors.py`
    - Notification service (Email/SMS integration).

## Git Workflow
- Create a branch for every feature: `feat/feature-name`.
- Always agree on Pydantic Schemas before implementing the logic.
