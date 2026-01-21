from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models.user import User
from .auth import get_current_user


router = APIRouter(prefix="/business", tags=["business"])

@router.get("/", response_model=List[Dict[str, Any]])
def get_business_ventures(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get all business ventures for the current user
    """
    # Placeholder for future implementation
    return []
