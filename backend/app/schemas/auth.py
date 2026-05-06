from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"
    RECEPTIONIST = "RECEPTIONIST"
    ADMIN = "ADMIN"

class UserAuth(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(UserAuth):
    full_name: str
    mobile: str
    role: UserRole
    dob: Optional[str] = None
    gender: Optional[str] = None
    specialty: Optional[str] = "General"
    bio: Optional[str] = None
    medical_history: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    custom_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class AdminRegisterRequest(UserAuth):
    full_name: str
