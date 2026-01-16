from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Aether API",
    description="Portfolio Management System API",
    version="1.0.0"
)

# CORS middleware to allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """Root endpoint - API health check"""
    return {
        "message": "Welcome to Aether API",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

# Include authentication routes
# Import here to avoid SQLAlchemy loading issues
@app.on_event("startup")
async def startup_event():
    """Load routes on startup"""
    from routes import auth
    app.include_router(auth.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
