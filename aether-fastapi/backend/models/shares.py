from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func
import enum
from database import Base



class HoldingDuration(str, enum.Enum):
    SHORT = "Short"   # <1 year
    MID = "Mid"       # 1-3 years
    LONG = "Long"     # >3 years


class ShareStatus(str, enum.Enum):
    ACTIVE = "active"
    SOLD = "sold"


class Share(Base):
    __tablename__ = "shares"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)

    
    # Stock Information
    symbol = Column(String, nullable=False)  # e.g., AAPL, RELIANCE.BSE
    company_name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    
    # Holding Details
    quantity = Column(Float, nullable=False)
    avg_buy_price = Column(Float, nullable=False)  # Average purchase price per share
    current_price = Column(Float, nullable=False)  # Latest market price
    
    # Dates
    acquisition_date = Column(DateTime, default=datetime.utcnow)
    holding_duration = Column(Enum(HoldingDuration), default=HoldingDuration.SHORT)
    
    # Status
    status = Column(Enum(ShareStatus), default=ShareStatus.ACTIVE)
    
    # Sale Information (only for sold shares)
    sale_date = Column(DateTime, nullable=True)
    sale_price = Column(Float, nullable=True)  # Price per share at sale
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    owner = relationship("User", backref="shares")

    
    @property
    def total_value(self):
        """Current total value of the holding"""
        return self.quantity * self.current_price
    
    @property
    def total_invested(self):
        """Total amount invested"""
        return self.quantity * self.avg_buy_price
    
    @property
    def gain_loss(self):
        """Total gain or loss in currency"""
        return self.total_value - self.total_invested
    
    @property
    def gain_loss_percent(self):
        """Gain or loss as percentage"""
        if self.total_invested == 0:
            return 0
        return (self.gain_loss / self.total_invested) * 100
    
    @property
    def sale_total_value(self):
        """Total value at sale (only for sold shares)"""
        if self.status == ShareStatus.SOLD and self.sale_price:
            return self.quantity * self.sale_price
        return None
    
    @property
    def profit_loss(self):
        """Profit or loss from sale (only for sold shares)"""
        if self.status == ShareStatus.SOLD and self.sale_total_value:
            return self.sale_total_value - self.total_invested
        return None
