from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class CryptoHolding(Base):
    """Crypto holding model - stores user's cryptocurrency holdings"""
    __tablename__ = 'crypto_holdings'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    symbol = Column(String, nullable=False)  # BTC, ETH, SOL
    name = Column(String, nullable=False)    # Bitcoin, Ethereum, Solana
    network = Column(String, default="Bitcoin")  # Bitcoin, Ethereum, Solana, etc.
    
    quantity = Column(Float, nullable=False, default=0.0)
    purchase_price_avg = Column(Float, default=0.0)  # Average buy price in INR
    current_price = Column(Float, default=0.0)       # Current price in INR
    purchase_date = Column(Date, nullable=True)      # Date when crypto was acquired
    
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("crypto_wallets.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", backref="crypto_holdings")

    def __repr__(self):
        return f"<CryptoHolding(id={self.id}, symbol='{self.symbol}', quantity={self.quantity})>"


class CryptoTransaction(Base):
    """Crypto transaction model - stores on-chain activity"""
    __tablename__ = 'crypto_transactions'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    type = Column(String, nullable=False)  # Incoming, Outgoing, Swap, Fee
    asset_symbol = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    amount_currency_value = Column(Float, default=0.0)  # Value in INR at time of tx
    
    wallet_name = Column(String, nullable=True)
    tx_hash = Column(String, nullable=True)  # Transaction hash
    network = Column(String, default="Ethereum")
    status = Column(String, default="Completed")  # Completed, Pending, Failed
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    owner = relationship("User", backref="crypto_transactions")

    def __repr__(self):
        return f"<CryptoTransaction(id={self.id}, type='{self.type}', asset='{self.asset_symbol}')>"


class CryptoWallet(Base):
    """Crypto wallet model - stores connected wallets"""
    __tablename__ = 'crypto_wallets'

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    
    name = Column(String, nullable=False)        # "Ledger Nano X", "MetaMask Main"
    network = Column(String, default="Multi-Chain")  # Multi-Chain, Ethereum, Solana
    address = Column(String, nullable=True)      # Wallet address
    
    total_value = Column(Float, default=0.0)     # Calculated total value
    asset_count = Column(Integer, default=0)     # Number of assets
    last_active = Column(String, nullable=True)  # "2 hours ago"
    is_connected = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", backref="crypto_wallets")
    holdings = relationship("CryptoHolding", backref="wallet")

    def __repr__(self):
        return f"<CryptoWallet(id={self.id}, name='{self.name}', network='{self.network}')>"
