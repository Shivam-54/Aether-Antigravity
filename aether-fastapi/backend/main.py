from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Aether API",
    description="Portfolio Management System API",
    version="1.0.0"
)

# CORS middleware to allow frontend to call backend
# Allow file:// origin (null) and localhost for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:3000",
        "http://127.0.0.1:8000",
        "null"  # Allow file:// protocol
    ],
    allow_credentials=False,  # Must be False when using "null" origin
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Import routes
# Import here to avoid SQLAlchemy loading issues - ensuring config is loaded first
from routes import auth, real_estate, documents, crypto, shares, bonds, business
from database import engine, Base
from models import user, real_estate as re_model, document, crypto as crypto_model, shares as shares_model, bonds as bonds_model, business as business_model # Import models to register them

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(real_estate.router)
app.include_router(documents.router)
app.include_router(crypto.router)
app.include_router(shares.router)
app.include_router(bonds.router)
app.include_router(business.router)

@app.get("/api")
def api_root():
    """Root endpoint for API"""
    return {
        "message": "Welcome to Aether API",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Mount frontend - catch all - MUST BE LAST
import os
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

# Trigger reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
