"""
Property Valuation Model - Historical price tracking for ML predictions
"""
from sqlalchemy import Column, String, DateTime, Numeric, Text, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from database import Base


class PropertyValuation(Base):
    """Historical property valuations for improved ML forecasting"""
    __tablename__ = "property_valuations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False)
    
    # Valuation details
    valuation_date = Column(Date, nullable=False, index=True)
    value = Column(Numeric(15, 2), nullable=False)  # Property value at this date
    
    # Metadata
    source = Column(String(50), default='manual')  # 'manual', 'appraisal', 'current', 'market_comparison', etc.
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="valuations")
    user = relationship("User")

    def __repr__(self):
        return f"<PropertyValuation {self.property_id} @ {self.valuation_date}: ₹{self.value}>"

    class Config:
        orm_mode = True
