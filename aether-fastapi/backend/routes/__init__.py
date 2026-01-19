# Routes package
# Import all routers here

from .auth import router as auth_router
from .real_estate import router as real_estate_router
from .documents import router as documents_router
from .crypto import router as crypto_router
from .shares import router as shares_router

__all__ = ["auth_router", "real_estate_router", "documents_router", "crypto_router", "shares_router"]
