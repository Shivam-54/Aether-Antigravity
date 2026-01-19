from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# Create database engine
# This connects to your Supabase PostgreSQL database
# Using psycopg3 driver (modern, async-capable)
# Create database engine
# This connects to your Supabase PostgreSQL database
# Using psycopg3 driver (modern, async-capable)

db_url = settings.SQLALCHEMY_DATABASE_URI
connect_args = {}

if "sqlite" in db_url:
    connect_args["check_same_thread"] = False
else:
    # Use psycopg binary for postgres
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://")

engine = create_engine(
    db_url,
    echo=False,  # Set to True for debugging SQL queries
    pool_pre_ping=True,  # Verify connections before using them
    connect_args=connect_args
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
