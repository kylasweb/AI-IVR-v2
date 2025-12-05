# FastAPI TTS Service - Core Types

from typing import Optional, Literal, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum

class TTSProvider(str, Enum):
    """Available TTS providers"""
    GOOGLE_CLOUD = "google_cloud"
    HUGGINGFACE = "huggingface"
    SVARA = "svara"

class AudioFormat(str, Enum):
    """Supported audio formats"""
    MP3 = "mp3"
    WAV = "wav"
    OGG = "ogg"
    FLAC = "flac"

class VoiceGender(str, Enum):
    """Voice gender options"""
    MALE = "male"
    FEMALE = "female"
    NEUTRAL = "neutral"

class TTSRequest(BaseModel):
    """Request model for TTS synthesis"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to synthesize")
    voice: str = Field(..., description="Voice ID to use")
    language: Optional[str] = Field("en-US", description="Language code")
    provider: Optional[TTSProvider] = Field(TTSProvider.GOOGLE_CLOUD, description="TTS provider")
    
    # Voice modulation options
    speed: Optional[float] = Field(1.0, ge=0.25, le=4.0, description="Speaking rate")
    pitch: Optional[float] = Field(0.0, ge=-20.0, le=20.0, description="Pitch shift")
    volume: Optional[float] = Field(1.0, ge=0.0, le=2.0, description="Volume gain")
    
    # Output options
    format: Optional[AudioFormat] = Field(AudioFormat.MP3, description="Output audio format")
    sample_rate: Optional[int] = Field(24000, description="Sample rate in Hz")
    
    # Advanced options
    ssml: Optional[bool] = Field(False, description="Input is SSML")
    cache: Optional[bool] = Field(True, description="Enable caching")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hello, welcome to our service!",
                "voice": "en-US-Wavenet-A",
                "language": "en-US",
                "provider": "google_cloud",
                "speed": 1.0,
                "pitch": 0.0
            }
        }

class AudioData(BaseModel):
    """Audio data response"""
    data: str = Field(..., description="Base64 encoded audio or GCS URL")
    format: AudioFormat
    duration: float = Field(..., description="Duration in seconds")
    size: int = Field(..., description="Size in bytes")
    sample_rate: int
    
class VoiceMetadata(BaseModel):
    """Voice characteristics"""
    gender: VoiceGender
    age: Optional[str] = None
    accent: Optional[str] = None
    quality: Literal["standard", "premium", "neural"] = "standard"

class TTSResponse(BaseModel):
    """Response model for TTS synthesis"""
    success: bool
    audio: AudioData
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    # Processing info
    provider: TTSProvider
    processing_time: float = Field(..., description="Processing time in ms")
    characters: int = Field(..., description="Character count")
    cost: Optional[float] = Field(None, description="Estimated cost in USD")
    
    # Voice info
    voice_used: str
    voice_metadata: Optional[VoiceMetadata] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "audio": {
                    "data": "https://storage.googleapis.com/...",
                    "format": "mp3",
                    "duration": 3.5,
                    "size": 56000,
                    "sample_rate": 24000
                },
                "provider": "google_cloud",
                "processing_time": 1250,
                "characters": 32,
                "voice_used": "en-US-Wavenet-A"
            }
        }

class Voice(BaseModel):
    """Voice information"""
    id: str
    name: str
    language: str
    language_codes: List[str]
    gender: VoiceGender
    provider: TTSProvider
    quality: str
    recommended: bool = False
    
class VoiceListResponse(BaseModel):
    """Response for voice listing"""
    voices: List[Voice]
    total: int
    provider: Optional[TTSProvider] = None

class ProviderStatus(BaseModel):
    """Provider health status"""
    provider: TTSProvider
    status: Literal["healthy", "degraded", "down"]
    latency: Optional[float] = None  # ms
    error_rate: Optional[float] = None  # percentage
    last_check: str

class BatchTTSRequest(BaseModel):
    """Batch TTS processing request"""
    requests: List[TTSRequest] = Field(..., max_length=100)
    
class BatchTTSResponse(BaseModel):
    """Batch TTS processing response"""
    results: List[TTSResponse]
    total: int
    successful: int
    failed: int
    processing_time: float
