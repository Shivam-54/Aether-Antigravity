from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Document(Base):
    """Property Document model - stores documents related to properties"""
    __tablename__ = 'documents'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    
    document_type = Column(String, nullable=False)  # Deed, Valuation Report, Tax Document, etc.
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Local storage path
    file_url = Column(String, nullable=False)   # URL to access the file
    file_size = Column(Integer, nullable=True)  # Size in bytes
    mime_type = Column(String, nullable=True)   # File MIME type
    description = Column(String, nullable=True) # Optional description
    
    # Metadata
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", backref="documents")
    property = relationship("Property", backref="documents")

    def __repr__(self):
        return f"<Document(id={self.id}, type='{self.document_type}', property_id={self.property_id})>"
