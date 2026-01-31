from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Property(Base):
    """Property model - maps to 'properties' table in Supabase"""
    __tablename__ = 'properties'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    name = Column(String, nullable=False)
    type = Column(String, default="Residential") # Residential, Commercial, Land
    status = Column(String, default="Owned") # Owned, Rented
    
    land_area = Column(Float, default=0.0)
    land_unit = Column(String, default="sq ft")
    
    purchase_price = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    
    location = Column(String, nullable=True) # City, State
    address = Column(String, nullable=True) # Full address
    
    acquisition_date = Column(Date, nullable=True)
    description = Column(String, nullable=True)
    
    # Ownership details
    holding_duration = Column(String, nullable=True) # e.g. "2 years" (could be calculated)
    ownership_structure = Column(String, default="Individual")
    
    # Rental tracking
    rent_status = Column(String, default="Not Rented") # Not Rented, Rented
    rent_amount = Column(Float, nullable=True)
    rent_type = Column(String, nullable=True) # Monthly, Yearly
    rent_start_date = Column(Date, nullable=True)
    security_deposit = Column(Float, nullable=True)
    tenant_type = Column(String, nullable=True) # Individual, Corporate, etc.
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", backref="properties")
    valuations = relationship("PropertyValuation", back_populates="property", cascade="all, delete-orphan", order_by="PropertyValuation.valuation_date.desc()")


    def __repr__(self):
        return f"<Property(id={self.id}, name='{self.name}', user_id={self.user_id})>"
