# FastAPI TTS API Routes

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from ..schemas.tts import (
    TTSRequest, TTSResponse, VoiceListResponse,
    ProviderStatus, BatchTTSRequest, BatchTTSResponse,
    TTSProvider
)
from ..services.tts import TTSService
from ..core.config import get_settings

router = APIRouter(prefix="/api/v1/tts", tags=["TTS"])

# Dependency to get TTS service
def get_tts_service() -> TTSService:
    """Get TTS service instance"""
    settings = get_settings()
    
    config = {
        "google_cloud": {
            "api_key": settings.GOOGLE_CLOUD_TTS_API_KEY,
            "project_id": settings.GOOGLE_CLOUD_PROJECT_ID,
            "bucket_name": settings.GCS_BUCKET_NAME
        },
        "huggingface": {
            "api_key": settings.HUGGINGFACE_API_KEY
        },
        "svara": {
            "api_key": settings.SVARA_API_KEY,
            "base_url": settings.SVARA_BASE_URL
        }
    }
    
    return TTSService(config)

@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(
    request: TTSRequest,
    tts_service: TTSService = Depends(get_tts_service)
):
    """
    Synthesize speech from text
    
    - **text**: Text to convert to speech (max 5000 chars)
    - **voice**: Voice ID to use
    - **language**: Language code (e.g., 'en-US', 'ml-IN')
    - **provider**: TTS provider (optional, auto-selected if not specified)
    - **speed**: Speaking rate (0.25 - 4.0)
    - **pitch**: Pitch adjustment (-20 to +20)
    - **format**: Audio format (mp3, wav, ogg, flac)
    """
    try:
        result = await tts_service.synthesize(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices", response_model=VoiceListResponse)
async def list_voices(
    language: Optional[str] = None,
    provider: Optional[TTSProvider] = None,
    tts_service: TTSService = Depends(get_tts_service)
):
    """
    List available TTS voices
    
    - **language**: Filter by language code (optional)
    - **provider**: Filter by provider (optional)
    """
    try:
        result = await tts_service.list_voices(language, provider)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/providers/status", response_model=List[ProviderStatus])
async def get_provider_status(
    tts_service: TTSService = Depends(get_tts_service)
):
    """
    Get health status of all TTS providers
    
    Returns latency, error rate, and availability for each provider
    """
    try:
        statuses = await tts_service.get_provider_status()
        return statuses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=BatchTTSResponse)
async def batch_synthesize(
    batch_request: BatchTTSRequest,
    tts_service: TTSService = Depends(get_tts_service)
):
    """
    Batch synthesize multiple texts
    
    - **requests**: List of TTS requests (max 100)
    
    Processes all requests concurrently and returns results
    """
    import asyncio
    import time
    
    start_time = time.time()
    
    try:
        # Process all requests concurrently
        tasks = [tts_service.synthesize(req) for req in batch_request.requests]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Separate successful and failed
        successful = [r for r in results if isinstance(r, TTSResponse)]
        failed = [r for r in results if isinstance(r, Exception)]
        
        processing_time = (time.time() - start_time) * 1000
        
        return BatchTTSResponse(
            results=successful,
            total=len(batch_request.requests),
            successful=len(successful),
            failed=len(failed),
            processing_time=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "service": "tts"}
