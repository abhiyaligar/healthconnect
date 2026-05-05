# HealthConnect

HealthConnect is a professional healthcare appointment management system designed to handle overbooking and concurrent cancellation storms with fairness and efficiency.

## Tech Stack
- **Backend**: FastAPI
- **Database/Auth**: Supabase (PostgreSQL)
- **Migrations**: Alembic

## Getting Started

### 1. Prerequisites
- Python 3.9+
- A Supabase Project

### 2. Environment Setup
Create a `.env` file in the root directory and populate it with your Supabase credentials:
```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
SECRET_KEY=your-jwt-secret
PROJECT_NAME=HealthConnect
```

### 3. Backend Installation

```powershell
# Navigate to the backend directory
cd backend

# Create a virtual environment (if not already created)
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\Activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Running the Backend

```powershell
cd backend
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.
Visit `http://localhost:8000/docs` for the interactive Swagger documentation.

## Project Structure
- `backend/`: FastAPI application code.
- `alembic/`: Database migration scripts.
- `requirements.txt`: Python dependencies.
