from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Bond(Base):
    """Bond model - stores user's bond holdings"""
    __tablename__ = 'bonds'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    # Bond identification
    ticker = Column(String, nullable=False)  # e.g., GOI-2030, RIL-2027
    description = Column(String, nullable=False)  # Full bond name/description
    issuer = Column(String, nullable=False)  # Bond issuer name
    
    # Bond type (Government, Treasury, Municipal, Corporate, Agency, Sovereign, etc.)
    type = Column(String, default="Government")
    
    # Financial details
    face_value = Column(Float, nullable=False)  # Principal amount
    coupon_rate = Column(Float, default=0.0)  # Annual interest rate (%)
    yield_to_maturity = Column(Float, default=0.0)  # YTM (%)
    
    # Dates
    maturity_date = Column(Date, nullable=False)
    purchase_date = Column(Date, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", backref="bonds")

    @property
    def annual_income(self):
        """Calculate annual coupon income"""
        return self.face_value * (self.coupon_rate / 100)

    def __repr__(self):
        return f"<Bond(id={self.id}, ticker='{self.ticker}', issuer='{self.issuer}')>"
