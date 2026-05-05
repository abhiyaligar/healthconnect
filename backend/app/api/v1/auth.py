from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import UserAuth, SignupRequest, TokenResponse, UserResponse, UserRole
from app.core.supabase import get_supabase
from app.core.database import get_db
from app.models.doctor import DoctorProfile
from app.models.patient import PatientProfile
from sqlalchemy.orm import Session
from gotrue.errors import AuthApiError

router = APIRouter()
security = HTTPBearer()

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
async def signup(user_data: SignupRequest, db: Session = Depends(get_db)):
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
                mobile=user_data.mobile,
                custom_id=custom_id,
                specialty="General"
            )
        else:
            # Generate custom_id: first 5 of mobile + 4 chars of name
            prefix = user_data.mobile[:5]
            name_part = user_data.full_name[:4].replace(" ", "").upper()
            custom_id = f"{prefix}-{name_part}"
            
            db_profile = PatientProfile(
                user_id=user_id,
                full_name=user_data.full_name,
                mobile=user_data.mobile,
                custom_id=custom_id,
                base_priority=0,
                date_of_birth=user_data.dob if user_data.dob else None,
                gender=user_data.gender
            )
        
        db.add(db_profile)
        db.commit()
        
        return UserResponse(
            id=response.user.id,
            email=response.user.email,
            full_name=user_data.full_name,
            role=user_data.role,
            custom_id=custom_id
        )
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Signup Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

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
        print(f"Auth Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        print(f"Login Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    user_meta = current_user.user_metadata or {}
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=user_meta.get("full_name"),
        role=user_meta.get("role")
    )
