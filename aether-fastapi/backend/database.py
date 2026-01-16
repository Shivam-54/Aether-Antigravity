from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create database engine
# This connects to your Supabase PostgreSQL database
# Using psycopg3 driver (modern, async-capable)
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI.replace("postgresql://", "postgresql+psycopg://"),
    echo=False,  # Set to True for debugging SQL queries
    pool_pre_ping=True  # Verify connections before using them
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Database session dependency
    Usage in routes:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
