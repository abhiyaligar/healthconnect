from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.auth import UserAuth, TokenResponse, UserResponse
from app.core.supabase import get_supabase
from gotrue.errors import AuthApiError

router = APIRouter()
security = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    supabase = get_supabase()
    try:
        # Validate the token with Supabase
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
async def signup(user_data: UserAuth):
    supabase = get_supabase()
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        if not response.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        return UserResponse(
            id=response.user.id,
            email=response.user.email
        )
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
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
        
        return TokenResponse(
            access_token=response.session.access_token,
            token_type="bearer",
            user=UserResponse(
                id=response.user.id,
                email=response.user.email
            )
        )
    except AuthApiError as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email
    )
