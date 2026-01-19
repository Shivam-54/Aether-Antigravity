import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings and configuration"""
    
    # App Settings
    APP_NAME: str = "Aether API"
    DEBUG: bool = True
    
    # Database Settings - Supabase PostgreSQL
    # TODO: Replace with your Supabase connection string
    # Format: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
    SUPABASE_DB_URL: Optional[str] = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/aether"  # Placeholder
    )
    
    # SQLAlchemy Settings
    SQLALCHEMY_DATABASE_URI: str = SUPABASE_DB_URL
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    
    # JWT Settings (for authentication)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Supabase Settings (optional - if using Supabase Auth)
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")

settings = Settings()
