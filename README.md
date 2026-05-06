# HealthConnect

A full-stack clinical scheduling and queue management platform built for hospitals and clinics.

---

## What It Does

HealthConnect manages the complete lifecycle of a patient's clinic visit:
- Patients book appointments by specialty → doctor → time slot
- Receptionists manage live queues, handle conflicts, and register walk-ins
- Doctors conduct consultations, record vitals, write prescriptions, and complete sessions
- Admins oversee users, system settings, and view analytics

---

## Roles

| Role | Dashboard | Key Actions |
|------|-----------|-------------|
| Patient | `/dashboard` | Book appointments, view history, view medical profile |
| Doctor | `/doctors` | View today's queue, conduct consultations, record clinical data |
| Receptionist | `/reception` | Manage live queue, register walk-ins, resolve conflicts |
| Admin | `/analytics` | User management, audit logs, system settings, analytics |

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Copy and fill in backend/.env (see docs/DEVELOPMENT.md)
alembic upgrade head
uvicorn main:app --reload
```

API available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Required Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://<id>.supabase.co
SUPABASE_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@healthconnect.com
```

---

## Documentation

| File | Contents |
|------|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, layers, directory structure |
| [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md) | All endpoints with request/response details |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | All tables, columns, and relationships |
| [`docs/APP_FLOW.md`](docs/APP_FLOW.md) | User flows, navigation map, screen inventory |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Technologies, versions, environment setup |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Setup guide, phases, common issues |
| [`docs/FRONTEND_GUIDELINES.md`](docs/FRONTEND_GUIDELINES.md) | Component patterns and UI conventions |

---

## Tech Stack

**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS  
**Backend**: FastAPI + Python 3.11 + SQLAlchemy 2.0  
**Database**: Supabase (PostgreSQL)  
**Auth**: Supabase Auth (JWT)  
**Storage**: Supabase Storage (medical records)  
**Email**: SMTP (OTP password reset + notifications)
