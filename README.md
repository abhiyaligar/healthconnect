# MediSync: HealthConnect
A professional healthcare appointment management system designed to handle overbooking and concurrent cancellation storms with fairness and efficiency.

## Key Features
- **Smart Scheduling**: Doctors can set weekly templates and staff can launch slots for specific dates.
- **Dynamic Patient Booking**: Real-time slot availability with calendar date selection.
- **Queue Stabilization**: Handles "cancellation storms" by automatically re-opening slots and re-balancing the queue.
- **Clinical Management**: Integrated clinical notes, medical record uploads, and consultation duration tracking.
- **Multi-role Dashboards**: Dedicated views for Patients, Doctors, and Receptionists.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python 3.12+).
- **Database/Auth**: Supabase (PostgreSQL).
- **Storage**: Supabase Storage for medical records.

## Getting Started

### 1. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
DATABASE_URL=...
SECRET_KEY=...
```

### 2. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```

## Project Structure
- `backend/`: FastAPI application code and API routes.
- `frontend/`: React application with Tailwind CSS and TypeScript.
- `docs/`: Comprehensive technical and architectural documentation.
