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
    # Transaction Mode pooling (port 6543) requires disabling server-side
    # prepared statements — each transaction may land on a different backend.
    connect_args["prepare_threshold"] = None

engine = create_engine(
    db_url,
    echo=False,
    # ── Connection Pool (prevent MaxClientsInSessionMode on Supabase) ────────
    # With 2 uvicorn workers each gets its own pool.
    # pool_size=2 + max_overflow=1 → max 3 connections per worker → 6 total.
    # Switch DATABASE_URL port 5432 → 6543 (Transaction Mode) for even lower
    # connection counts per request.
    pool_size=2,
    max_overflow=1,
    pool_pre_ping=True,    # drop stale connections before reuse
    pool_recycle=300,      # recycle connections every 5 minutes
    pool_timeout=10,       # raise error after 10 s instead of queuing
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
