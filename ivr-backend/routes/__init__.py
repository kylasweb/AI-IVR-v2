"""
IVR Backend Routes Package
Exports all route modules for easy import
"""

from .extended_api import router as extended_router, include_extended_routes
from .whatsapp_api import router as whatsapp_router, include_whatsapp_routes

__all__ = [
    "extended_router", "include_extended_routes",
    "whatsapp_router", "include_whatsapp_routes"
]
