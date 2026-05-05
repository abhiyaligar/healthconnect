from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"
    RECEPTIONIST = "RECEPTIONIST"

class UserAuth(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(UserAuth):
    full_name: str
    mobile: str
    role: UserRole

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: Optional[UserRole] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
