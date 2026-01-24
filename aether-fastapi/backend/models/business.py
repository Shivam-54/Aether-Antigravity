from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Business(Base):
    """Business model - stores user's business venture holdings"""
    __tablename__ = 'businesses'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    # Business identification
    name = Column(String, nullable=False)
    industry = Column(String, nullable=False)  # Technology, Real Estate, Agriculture, etc.
    description = Column(Text, nullable=True)
    
    # Ownership & Valuation
    ownership = Column(Float, default=100.0)  # Ownership percentage (0-100)
    ownership_type = Column(String, default="Sole Proprietor") # Sole Proprietor, Partnership, Corporation, Investor Stake
    valuation = Column(Float, default=0.0)  # Current business valuation
    
    # Financial metrics
    annual_revenue = Column(Float, default=0.0)
    annual_profit = Column(Float, default=0.0)
    monthly_revenue = Column(Float, default=0.0)
    monthly_profit = Column(Float, default=0.0)
    cash_flow = Column(Float, default=0.0)
    
    # Status: Growing, Stable, Declining, Inactive
    status = Column(String, default="Stable")
    
    # Dates
    founded = Column(Date, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", backref="businesses")
    transactions = relationship("BusinessTransaction", back_populates="business", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Business(id={self.id}, name='{self.name}', industry='{self.industry}')>"


class BusinessTransaction(Base):
    """Business transaction model - stores cash flow transactions"""
    __tablename__ = 'business_transactions'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)
    
    # Transaction details
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)  # Positive for income, negative for expense
    type = Column(String, nullable=False)  # Income, Expense, Investment
    category = Column(String, nullable=True)  # Client Payment, Salary, Rent, etc.
    notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User", backref="business_transactions")
    business = relationship("Business", back_populates="transactions")

    def __repr__(self):
        return f"<BusinessTransaction(id={self.id}, type='{self.type}', amount={self.amount})>"
