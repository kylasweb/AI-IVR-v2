"""
IndicF5 TTS Service

High-level service wrapper for IndicF5 text-to-speech with fallback support.
This service acts as a fallback to Google Cloud TTS when IndicF5 is available.
"""

import logging
import base64
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class IndicF5TTSService:
    """
    TTS Service using AI4Bharat's IndicF5 model.
    
    Designed as a fallback provider:
    - Primary: Google Cloud TTS (fast, requires API key)
    - Fallback: IndicF5 (high quality, requires model download, supports CPU)
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize IndicF5 TTS Service.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.connector = None
        self.initialized = False
        self.enabled = self.config.get('enabled', True)
        
    async def initialize(self) -> bool:
        """Initialize the IndicF5 connector"""
        if not self.enabled:
            logger.info("IndicF5 TTS Service is disabled")
            return False
            
        try:
            from ai.connectors.indicf5_connector import IndicF5Connector
            
            self.connector = IndicF5Connector(self.config)
            success = await self.connector.initialize()
            
            if success:
                self.initialized = True
                logger.info("IndicF5 TTS Service initialized")
            else:
                logger.warning("IndicF5 TTS Service initialization failed")
                
            return success
            
        except ImportError as e:
            logger.warning(f"IndicF5 dependencies not available: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize IndicF5 TTS Service: {e}")
            return False
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        return self.initialized and self.connector is not None
    
    async def synthesize(
        self,
        text: str,
        language: str = "ml",
        dialect: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Synthesize text to speech.
        
        Args:
            text: Text to synthesize
            language: Language code (default: 'ml' for Malayalam)
            dialect: Kerala dialect (e.g., 'ernakulam', 'malabar')
            **kwargs: Additional arguments passed to connector
            
        Returns:
            Base64 encoded audio data
        """
        if not self.is_healthy():
            logger.error("IndicF5 TTS Service not healthy")
            return ""
        
        if not text.strip():
            return ""
        
        try:
            result = await self.connector.synthesize(
                text=text,
                language=language,
                dialect=dialect,
                voice_config=kwargs.get('voice_config')
            )
            
            return result.get('audio_data', '')
            
        except Exception as e:
            logger.error(f"IndicF5 synthesis failed: {e}")
            return ""
    
    async def synthesize_with_dialect(
        self,
        text: str,
        dialect: str,
        language: str = "ml"
    ) -> str:
        """
        Synthesize with specific Kerala dialect.
        
        Args:
            text: Malayalam text to synthesize
            dialect: Kerala dialect code
            language: Language code
            
        Returns:
            Base64 encoded audio data
        """
        return await self.synthesize(
            text=text,
            language=language,
            dialect=dialect
        )
    
    async def synthesize_with_emotion(
        self,
        text: str,
        emotion: str = "neutral",
        language: str = "ml",
        dialect: Optional[str] = None
    ) -> str:
        """
        Synthesize text with emotional tone.
        
        Note: IndicF5's emotion support comes from reference audio selection.
        For full emotion support, ensure appropriate reference audios are available.
        
        Args:
            text: Text to synthesize
            emotion: Emotional tone (happy, sad, angry, neutral)
            language: Language code
            dialect: Kerala dialect
            
        Returns:
            Base64 encoded audio data
        """
        # IndicF5 emotion is controlled via reference audio
        # Map emotions to dialect variants if available
        voice_config = {
            'emotion': emotion,
            'ref_text': self._get_emotional_ref_text(emotion, language)
        }
        
        return await self.synthesize(
            text=text,
            language=language,
            dialect=dialect,
            voice_config=voice_config
        )
    
    def _get_emotional_ref_text(self, emotion: str, language: str) -> str:
        """Get reference text for emotional synthesis"""
        if language != 'ml':
            return ""
        
        # Malayalam reference texts for different emotions
        emotion_texts = {
            'happy': 'എനിക്ക് വളരെ സന്തോഷമുണ്ട്! ഇത് മനോഹരമായ ഒരു ദിവസമാണ്!',
            'sad': 'എനിക്ക് വളരെ ദുഃഖമുണ്ട്. ഇത് വളരെ ബുദ്ധിമുട്ടുള്ള സമയമാണ്.',
            'angry': 'ഇത് തികച്ചും അസ്വീകാര്യമാണ്! എന്തുകൊണ്ടാണ് ഇത് സംഭവിക്കുന്നത്?',
            'neutral': 'നമസ്കാരം, എന്റെ പേര് മലയാളം ആണ്. ഞാൻ കേരളത്തിൽ നിന്നാണ്.',
            'professional': 'നിങ്ങളുടെ അഭ്യർത്ഥന ഞാൻ പ്രോസസ്സ് ചെയ്യുന്നു. ദയവായി കാത്തിരിക്കുക.'
        }
        
        return emotion_texts.get(emotion, emotion_texts['neutral'])
    
    def get_supported_dialects(self) -> list:
        """Get list of supported Kerala dialects"""
        if self.connector:
            return self.connector.get_supported_dialects()
        return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        if not self.connector:
            return {
                'service': 'indicf5_tts',
                'status': 'not_initialized',
                'enabled': self.enabled
            }
        
        connector_health = await self.connector.health_check()
        return {
            'service': 'indicf5_tts',
            **connector_health
        }
    
    async def close(self) -> None:
        """Clean up resources"""
        if self.connector:
            await self.connector.close()
            self.connector = None
        self.initialized = False


# Convenience function for quick synthesis
async def synthesize_malayalam(
    text: str,
    dialect: str = 'ernakulam'
) -> str:
    """
    Quick synthesis function for Malayalam text.
    
    Args:
        text: Malayalam text to synthesize
        dialect: Kerala dialect
        
    Returns:
        Base64 encoded audio data
    """
    service = IndicF5TTSService({'enabled': True})
    
    if await service.initialize():
        result = await service.synthesize(text, language='ml', dialect=dialect)
        await service.close()
        return result
    
    return ""
