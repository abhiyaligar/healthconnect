from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import UserAuth, SignupRequest, TokenResponse, UserResponse, UserRole, ResetPasswordRequest, AdminRegisterRequest
from app.core.supabase import get_supabase, get_supabase_admin
from app.core.database import get_db
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from app.models.admin import AdminProfile
from app.models.otp import OTPRecord
from sqlalchemy.orm import Session
from supabase_auth.errors import AuthApiError
from app.services.email_service import EmailService
from fastapi import BackgroundTasks
import random
import string
import uuid as uuid_pkg
import logging
from datetime import datetime, timedelta, timezone

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

def handle_auth_error(e: AuthApiError):
    msg = str(e).lower()
    if "invalid login credentials" in msg:
        return HTTPException(status_code=401, detail="Invalid email or password. Please try again.")
    if "user already registered" in msg:
        return HTTPException(status_code=409, detail="This email is already associated with an account.")
    if "password should be at least" in msg:
        return HTTPException(status_code=400, detail="Password is too weak. Must be at least 6 characters.")
    if "email not confirmed" in msg:
        return HTTPException(status_code=403, detail="Please verify your email before logging in.")
    
    logger.error(f"Supabase Auth Error: {str(e)}")
    return HTTPException(status_code=400, detail=str(e))

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    supabase = get_supabase()
    try:
        response = supabase.auth.get_user(token.credentials)
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
        return response.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

@router.post("/signup", response_model=UserResponse)
async def signup(user_data: SignupRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    supabase = get_supabase()
    try:
        # 1. Sign up in Supabase with metadata
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "role": user_data.role,
                    "full_name": user_data.full_name,
                    "mobile": user_data.mobile
                }
            }
        })
        
        if not response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # 2. Create the corresponding profile in our database
        user_id = response.user.id
        
        if user_data.role == UserRole.DOCTOR:
            prefix = user_data.mobile[:5]
            name_part = user_data.full_name[:4].replace(" ", "").upper()
            custom_id = f"{prefix}-{name_part}"
            
            db_profile = DoctorProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                email=user_data.email,
                mobile=user_data.mobile,
                custom_id=custom_id,
                specialty=user_data.specialty or "General",
                bio=user_data.bio
            )
        elif user_data.role == UserRole.PATIENT:
            # Generate custom_id: first 5 of mobile + 4 chars of name
            prefix = user_data.mobile[:5]
            name_part = user_data.full_name[:4].replace(" ", "").upper()
            custom_id = f"{prefix}-{name_part}"
            
            db_profile = PatientProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                email=user_data.email,
                mobile=user_data.mobile,
                custom_id=custom_id,
                base_priority=0,
                date_of_birth=user_data.dob if user_data.dob else None,
                gender=user_data.gender,
                medical_history=user_data.medical_history
            )
        elif user_data.role == UserRole.ADMIN:
            custom_id = f"ADM-{user_data.full_name[:4].upper()}"
            db_profile = AdminProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                email=user_data.email
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid role specified")
        
        db.add(db_profile)
        db.commit()
        
        # 3. Send Verification Email (Background Task)
        # Mocking a code for demonstration
        verify_code = ''.join(random.choices(string.digits, k=6))
        background_tasks.add_task(EmailService.send_verification_email, user_data.email, verify_code)
        
        return UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=user_data.full_name,
            role=user_data.role,
            custom_id=custom_id
        )
    except AuthApiError as e:
        raise handle_auth_error(e)
    except Exception as e:
        logger.error(f"Critical Signup Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred during signup. Please try again later.")

@router.post("/register-admin", response_model=UserResponse)
async def register_admin(user_data: AdminRegisterRequest, db: Session = Depends(get_db)):
    supabase_admin = get_supabase_admin()
    try:
        # Sign up in Supabase with admin role
        response = supabase_admin.auth.admin.create_user({
            "email": user_data.email,
            "password": user_data.password,
            "email_confirm": True,
            "user_metadata": {
                "role": UserRole.ADMIN.value,
                "full_name": user_data.full_name
            }
        })
        
        if not response.user:
            raise HTTPException(status_code=400, detail="Admin registration failed")
            
        user_id = response.user.id
        db_profile = AdminProfile(
            user_id=user_id,
            full_name=user_data.full_name,
            email=user_data.email
        )
        
        db.add(db_profile)
        db.commit()
        
        return UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=user_data.full_name,
            role=UserRole.ADMIN
        )
    except Exception as e:
        logger.error(f"Critical Admin Registration Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal server error occurred during admin registration.")


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserAuth):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Extract metadata
        user_meta = response.user.user_metadata or {}
        
        return TokenResponse(
            access_token=response.session.access_token,
            token_type="bearer",
            user=UserResponse(
                id=response.user.id,
                email=response.user.email,
                full_name=user_meta.get("full_name"),
                role=user_meta.get("role")
            )
        )
    except AuthApiError as e:
        raise handle_auth_error(e)
    except Exception as e:
        logger.error(f"Critical Login Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unable to complete login. Please verify your connection.")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    user_meta = current_user.user_metadata or {}
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=user_meta.get("full_name"),
        role=user_meta.get("role")
    )

@router.post("/forgot-password")
async def forgot_password(email: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    otp_code = "".join(random.choices(string.digits, k=6))
    
    otp_record = OTPRecord(
        email=email.strip().lower(),
        otp_code=otp_code,
        purpose="RESET_PASSWORD",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(otp_record)
    db.commit()
    
    background_tasks.add_task(EmailService.send_password_reset_otp, email.strip().lower(), otp_code)
    return {"message": "If this email is registered, a reset code has been sent."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    # Find the most recent OTP for this email
    otp_record = db.query(OTPRecord).filter(
        OTPRecord.email == email,
        OTPRecord.purpose == "RESET_PASSWORD",
        OTPRecord.is_used == False
    ).order_by(OTPRecord.created_at.desc()).first()

    if not otp_record or otp_record.otp_code != request.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")
    
    # Check if naive or timezone-aware
    now = datetime.now(timezone.utc)
    # SQLAlchemy sometimes returns naive datetimes. Make sure we handle it safely.
    if otp_record.expires_at.tzinfo is None:
        expires_at = otp_record.expires_at.replace(tzinfo=timezone.utc)
    else:
        expires_at = otp_record.expires_at
        
    if expires_at < now:
        raise HTTPException(status_code=400, detail="Reset code has expired.")
        
    try:
        supabase_admin = get_supabase_admin()
        
        # We need to find the user id from email
        response = supabase_admin.auth.admin.list_users()
        user_id = None
        for u in response:
            if u.email.lower() == email:
                user_id = u.id
                break
                
        if not user_id:
            raise HTTPException(status_code=404, detail="User not found.")
            
        # Update user's password
        supabase_admin.auth.admin.update_user_by_id(user_id, {"password": request.new_password})
        
        # Mark OTP as used
        otp_record.is_used = True
        db.commit()
        
        return {"message": "Password updated successfully."}
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to reset password. Please try again later.")

@router.post('/resend-otp')
async def resend_otp(email: str, background_tasks: BackgroundTasks):
    verify_code = ''.join(random.choices(string.digits, k=6))
    background_tasks.add_task(EmailService.send_verification_email, email, verify_code)
    return {'message': 'A new verification code has been sent to your email.'}


