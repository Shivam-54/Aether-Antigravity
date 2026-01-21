"""
Authentication utilities
Handles password hashing, JWT token generation, and user verification
"""
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing user data (usually {'sub': user_email})
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    """
    Verify a Supabase JWT token and return the user ID
    
    Args:
        token: Supabase JWT token string
        
    Returns:
        User ID (UUID string) if valid, None if invalid
    """
    try:
        # Try to decode with Supabase JWT secret first (preferred)
        supabase_jwt_secret = settings.SUPABASE_JWT_SECRET
        try:
            payload = jwt.decode(
                token, 
                supabase_jwt_secret, 
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        except JWTError:
            # Fallback: Try to decode with Backend Secret Key (for local auth)
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM],
                options={"verify_aud": False}
            )
        
        # Extract user ID from 'sub' claim
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
            
        return user_id
        
    except JWTError as e:
        print(f"JWT verification failed: {e}")
        return None
