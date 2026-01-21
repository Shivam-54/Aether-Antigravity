from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import shutil
from pathlib import Path
import uuid
from uuid import UUID as UUID_Type

from database import get_db
from models.document import Document
from models.real_estate import Property
from models.user import User
from routes.auth import get_current_user

router = APIRouter(prefix="/api/realestate/documents", tags=["Documents"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".txt", ".doc", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# --- Pydantic Schemas ---

class DocumentResponse(BaseModel):
    id: UUID_Type
    user_id: UUID_Type
    property_id: UUID_Type
    document_type: str
    file_name: str
    file_url: str
    file_size: Optional[int]
    mime_type: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True

# --- Helper Functions ---

def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    """Generate unique filename to avoid collisions"""
    ext = get_file_extension(original_filename)
    unique_id = uuid.uuid4().hex[:8]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{ext}"

# --- Routes ---

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    property_id: UUID_Type = Form(...),
    document_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document for a property
    """
    # Verify property belongs to user
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024)}MB"
        )
    
    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create document record
    document = Document(
        user_id=current_user.id,
        property_id=property_id,
        document_type=document_type,
        file_name=file.filename,
        file_path=str(file_path),
        file_url=f"/api/realestate/documents/file/{unique_filename}",
        file_size=file_size,
        mime_type=file.content_type
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all documents for the current user
    """
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    return documents

@router.get("/property/{property_id}", response_model=List[DocumentResponse])
async def get_property_documents(
    property_id: UUID_Type,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all documents for a specific property
    """
    # Verify property belongs to user
    property = db.query(Property).filter(
        Property.id == property_id,
        Property.user_id == current_user.id
    ).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    documents = db.query(Document).filter(
        Document.property_id == property_id,
        Document.user_id == current_user.id
    ).all()
    
    return documents

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID_Type,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from filesystem
    try:
        file_path = Path(document.file_path)
        if file_path.exists():
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Failed to delete file {document.file_path}: {str(e)}")
    
    # Delete database record
    db.delete(document)
    db.commit()
    
    return None

from fastapi.responses import FileResponse

@router.get("/file/{filename}")
async def get_document_file(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download/view a document file
    """
    # Find document by filename in the file_url
    expected_url = f"/api/realestate/documents/file/{filename}"
    
    # Verify user owns this document
    document = db.query(Document).filter(
        Document.file_url == expected_url,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=403, detail="Access denied or document not found")
    
    # Check if file exists
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=document.file_name,
        media_type=document.mime_type
    )
