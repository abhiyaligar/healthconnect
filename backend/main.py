from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

from app.api.v1.auth import router as auth_router
from app.api.v1.slots import router as slots_router
from app.api.v1.appointments import router as appointments_router

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(slots_router, prefix="/api/v1/slots", tags=["Slots"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["Appointments"])

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
