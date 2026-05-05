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

---

## 🚀 Progress Tracking

### Phase 1: Data Foundation (COMPLETED)
- Basic Slot/Appointment CRUD.
- Real-time tracking hooks for consultation duration.

### Phase 2: Identity & Intelligence (COMPLETED)
- **Profiles**: Doctor and Patient profile management.
- **Analytics**: Rolling Average calculation service.
- **Priority**: Base priority inheritance for appointments.

### Phase 3: The Stabilizer (NEXT)
- Conflict detection and automatic rescheduling logic.

---

## Team Task Distribution

### Developer 1: The "Scheduling & Logic" Lead
- **Completed**: Phase 1 & Intelligence Foundation.
- **Next Steps**:
    - [ ] `app/services/scheduler.py`: The Stabilizer logic.
    - [ ] Real-time Queue updates.

### Developer 2: The "Domain & Resource" Lead
- **Completed**: Profile Models and APIs.
- **Next Steps**:
    - [ ] Medical record storage integration.
    - [ ] Notification service (Email/SMS).

## Git Workflow
- Always update documentation when database schemas change.
- Run `pytest` before every commit.
