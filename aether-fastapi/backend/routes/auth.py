"""
Authentication routes
Handles user signup, login, and token management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from typing import Optional
from uuid import UUID
import uuid
from sqlalchemy.exc import SQLAlchemyError

from database import get_db
from models.user import User
from auth_utils import verify_password, get_password_hash, create_access_token, verify_token
from config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Pydantic models for request/response
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Helper function to get current user from token
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from Supabase JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # For Supabase auth, the token contains user_id in 'sub' claim
    user_id = verify_token(token)  # Returns the 'sub' claim which is user_id
    if user_id is None:
        raise credentials_exception
    
    try:
        # Ensure user_id is a valid UUID before querying
        user_uuid = uuid.UUID(str(user_id))
    except ValueError:
        raise credentials_exception

    try:
        # Query user by ID
        user = db.query(User).filter(User.id == user_uuid).first()
    except SQLAlchemyError as e:
        # Do not swallow database timeouts or errors as 401s!
        print(f"Database error in get_current_user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily overloaded"
        )
        
    if user is None:
        raise credentials_exception
    
    return user

# Routes
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user account
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password, returns JWT token
    """
    # Find user by email (username field in OAuth2 form)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current logged-in user information
    """
    return current_user

@router.post("/logout")
def logout():
    """
    Logout (client should delete token)
    """
    return {"message": "Successfully logged out"}
