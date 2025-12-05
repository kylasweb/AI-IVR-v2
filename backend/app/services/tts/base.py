# TTS Provider Base Class

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from ..schemas.tts import TTSRequest, AudioData, Voice, VoiceMetadata

class TTSProviderBase(ABC):
    """Base class for TTS providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.provider_name = self.__class__.__name__
        
    @abstractmethod
    async def synthesize(
        self,
        request: TTSRequest
    ) -> AudioData:
        """
        Synthesize speech from text
        
        Args:
            request: TTS request with text and parameters
            
        Returns:
            AudioData with synthesized speech
        """
        pass
    
    @abstractmethod
    async def list_voices(
        self,
        language: Optional[str] = None
    ) -> List[Voice]:
        """
        List available voices
        
        Args:
            language: Filter by language code (optional)
            
        Returns:
            List of available voices
        """
        pass
    
    @abstractmethod
    async def get_voice_metadata(
        self,
        voice_id: str
    ) -> VoiceMetadata:
        """
        Get metadata for a specific voice
        
        Args:
            voice_id: Voice identifier
            
        Returns:
            Voice metadata
        """
        pass
    
    @abstractmethod
    async def check_health(self) -> bool:
        """
        Check if provider is healthy
        
        Returns:
            True if healthy, False otherwise
        """
        pass
    
    def get_supported_formats(self) -> List[str]:
        """Get supported audio formats"""
        return ["mp3", "wav", "ogg"]
    
    def get_supported_languages(self) -> List[str]:
        """Get supported language codes"""
        return []
    
    def calculate_cost(self, characters: int) -> float:
        """Calculate estimated cost for synthesis"""
        return 0.0
