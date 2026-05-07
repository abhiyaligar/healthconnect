# HealthConnect

**🏆 1st Runner Up - Hackfusion 2.0 (AGM Engineering College)**

## Problem Statement: FS-02 Healthcare Appointment Overbooking Stabilizer

Hospitals often overbook appointments to maximize efficiency, leading to conflicts, long wait times, and patient dissatisfaction. **HealthConnect** was designed to intelligently manage overbooked slots and dynamically reschedule patients while maintaining fairness and minimizing disruption.

### Key Features Addressed:
- **Capacity-Aware Slot Management**: Intelligent booking system capable of handling concurrent "cancellation storms."
- **Doctor Fatigue Optimization**: Real-time availability tracking synchronized with doctor workload.
- **Queue Visualization**: Live dashboards with wait-time prediction for patients and staff.
- **Conflict Resolver**: A sophisticated engine that balances priority and fairness during overbooking.
- **Dynamic Rescheduling**: An automated system to minimize patient disruption when shifts occur.

---

## What It Does

HealthConnect manages the complete lifecycle of a patient's clinic visit:
- Patients book appointments by specialty → doctor → time slot
- Receptionists manage live queues, handle conflicts, and register walk-ins
- Doctors conduct consultations, record vitals, write prescriptions, and complete sessions
- Admins oversee users, system settings, and view analytics

---

## Hackathon Achievements
- **End-to-End Automation**: Implemented a seamless flow from appointment booking to clinical consultation.
- **Real-time Queue Management**: Developed a dynamic queue system for receptionists to manage patient flow efficiently.
- **Secure Authentication**: Integrated custom OTP-based verification for secure user access.
- **Robust Architecture**: Built with a scalable FastAPI backend and a responsive React frontend.

---

## Team & Contributors

| Name | Role | Primary Contributions | GitHub |
|------|------|-----------------------|--------|
| **Abhishek Yaligar** | Full-Stack Lead & System Architect | End-to-End System Design, Core Backend & Database Engineering, Cloud Deployment, Frontend Integration | [@abhiyaligar](https://github.com/abhiyaligar) |
| **Farhan** | Backend Reliability & QA | Unit & Integration Testing, API Validation, Performance Benchmarking | [@aifaru](https://github.com/aifaru) |
| **Prajwal** | Frontend | UI/UX Design, React Component Implementation, Dashboard Logic | [@prajwalnmokashi03](https://github.com/prajwalnmokashi03) |
| **Swaroop** | Presentation & QA | Project Presentation, Quality Assurance, Documentation | [@swaroopjoshi2005](https://github.com/swaroopjoshi2005) |

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
