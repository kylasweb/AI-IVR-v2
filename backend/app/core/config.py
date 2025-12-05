# FastAPI Configuration Settings

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "AI IVR TTS Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Google Cloud
    GOOGLE_CLOUD_TTS_API_KEY: str = ""
    GOOGLE_CLOUD_PROJECT_ID: str = ""
    GCS_BUCKET_NAME: str = ""
    
    # HuggingFace
    HUGGINGFACE_API_KEY: str = ""
    
    # Svara TTS
    SVARA_API_KEY: str = ""
    SVARA_BASE_URL: str = "https://api.svaraspeech.ai/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:3001"]
    
    # Caching
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 3600
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
