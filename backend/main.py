from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

from app.api.v1.auth import router as auth_router
from app.api.v1.slots import router as slots_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.doctors import router as doctors_router
from app.api.v1.patients import router as patients_router
from app.api.v1.history import router as history_router
from app.api.v1.schedules import router as schedules_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.clinical import router as clinical_router
from app.api.v1.optimization import router as optimization_router

settings = get_settings()

# Force restart
app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(slots_router, prefix="/api/v1/slots", tags=["Slots"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["Appointments"])
app.include_router(doctors_router, prefix="/api/v1/doctors", tags=["Doctors"])
app.include_router(patients_router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(history_router, prefix="/api/v1/history", tags=["History"])
app.include_router(schedules_router, prefix="/api/v1/schedules", tags=["Schedules"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(clinical_router, prefix="/api/v1/clinical", tags=["Clinical"])
app.include_router(optimization_router, prefix="/api/v1/optimization", tags=["Optimization"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
