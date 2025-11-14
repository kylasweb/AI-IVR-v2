"""
Proprietary ML Connector

Connects to custom ML models for the IMOS Communications Engine.
Provides high-performance, regionally-optimized AI capabilities.
"""

import logging
import aiohttp
import json
from typing import Dict, Any, Optional, List
from datetime import datetime

from ..models.ai_model_router import AIProvider, AIModelType

logger = logging.getLogger(__name__)


class ProprietaryMLConnector:
    """Connector for proprietary ML models"""

    def __init__(self, config: Dict[str, Any]):
        self.endpoint = config.get('endpoint', 'http://localhost:8001/api/v1')
        self.api_key = config.get('api_key', '')
        self.timeout_seconds = config.get('timeout_seconds', 30)
        self.retry_attempts = config.get('retry_attempts', 3)
        self.session: Optional[aiohttp.ClientSession] = None

    async def initialize(self) -> bool:
        """Initialize the connector"""
        try:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)
            )
            logger.info("ProprietaryML connector initialized")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize ProprietaryML connector: {e}")
            return False

    async def close(self) -> None:
        """Close the connector"""
        if self.session:
            await self.session.close()
            self.session = None

    async def process_conversational_request(
        self,
        text: str,
        language: str,
        dialect: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a conversational AI request

        Args:
            text: Input text
            language: Language code
            dialect: Dialect code
            context: Additional context

        Returns:
            Response with text, confidence, etc.
        """
        try:
            payload = {
                'text': text,
                'language': language,
                'dialect': dialect,
                'context': context or {},
                'model_type': 'conversational',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('conversational', payload)

            return {
                'provider': AIProvider.PROPRIETARY_ML.value,
                'model': f'{language}_{dialect or "standard"}',
                'text': response.get('response', ''),
                'confidence': response.get('confidence', 0.8),
                'language': response.get('detected_language', language),
                'dialect': response.get('detected_dialect', dialect),
                'processing_time_ms': response.get('processing_time_ms', 0),
                'tokens_used': response.get('tokens_used', 0),
                'cost': response.get('cost', 0.005)
            }

        except Exception as e:
            logger.error(f"Error processing conversational request: {e}")
            raise

    async def process_speech_to_text(
        self,
        audio_data: bytes,
        language: str,
        dialect: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process speech-to-text request

        Args:
            audio_data: Raw audio bytes
            language: Language code
            dialect: Dialect code
            context: Additional context

        Returns:
            Transcribed text with metadata
        """
        try:
            # For proprietary ML, we'd typically send audio data
            # For now, we'll simulate with a placeholder
            payload = {
                'audio_format': 'wav',  # Assume WAV format
                'language': language,
                'dialect': dialect,
                'context': context or {},
                'model_type': 'stt',
                'timestamp': datetime.now().isoformat()
            }

            # In real implementation, audio_data would be sent as multipart
            response = await self._make_request('stt', payload)

            return {
                'provider': AIProvider.PROPRIETARY_ML.value,
                'model': f'{language}_stt_{dialect or "standard"}',
                'text': response.get('transcription', ''),
                'confidence': response.get('confidence', 0.85),
                'language': response.get('detected_language', language),
                'dialect': response.get('detected_dialect', dialect),
                'processing_time_ms': response.get('processing_time_ms', 0),
                'audio_duration_ms': response.get('audio_duration_ms', 0),
                'cost': response.get('cost', 0.002)
            }

        except Exception as e:
            logger.error(f"Error processing STT request: {e}")
            raise

    async def process_text_to_speech(
        self,
        text: str,
        language: str,
        dialect: Optional[str] = None,
        voice_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process text-to-speech request

        Args:
            text: Text to synthesize
            language: Language code
            dialect: Dialect code
            voice_config: Voice configuration

        Returns:
            Audio data with metadata
        """
        try:
            payload = {
                'text': text,
                'language': language,
                'dialect': dialect,
                'voice_config': voice_config or {},
                'model_type': 'tts',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('tts', payload)

            return {
                'provider': AIProvider.PROPRIETARY_ML.value,
                'model': f'{language}_tts_{dialect or "standard"}',
                'audio_data': response.get('audio_base64', ''),  # Base64 encoded audio
                'audio_format': response.get('format', 'wav'),
                'sample_rate': response.get('sample_rate', 16000),
                'language': language,
                'dialect': dialect,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'audio_duration_ms': response.get('duration_ms', 0),
                'cost': response.get('cost', 0.004)
            }

        except Exception as e:
            logger.error(f"Error processing TTS request: {e}")
            raise

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on the proprietary ML service"""
        try:
            payload = {
                'action': 'health_check',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('health', payload)

            return {
                'provider': AIProvider.PROPRIETARY_ML.value,
                'status': 'healthy' if response.get('status') == 'ok' else 'unhealthy',
                'response_time_ms': response.get('response_time_ms', 0),
                'models_available': response.get('models', []),
                'last_check': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'provider': AIProvider.PROPRIETARY_ML.value,
                'status': 'unhealthy',
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

    async def _make_request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to proprietary ML service"""
        if not self.session:
            raise RuntimeError("Connector not initialized")

        url = f"{self.endpoint}/{endpoint}"

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }

        for attempt in range(self.retry_attempts):
            try:
                async with self.session.post(
                    url,
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        logger.warning(
                            f"Request failed (attempt {attempt + 1}): "
                            f"Status {response.status}, Error: {error_text}"
                        )

            except Exception as e:
                logger.warning(f"Request failed (attempt {attempt + 1}): {e}")

            if attempt < self.retry_attempts - 1:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff

        raise RuntimeError(f"Failed to get response from {endpoint} after {self.retry_attempts} attempts")

    async def get_model_capabilities(self) -> List[Dict[str, Any]]:
        """Get capabilities of available models"""
        try:
            payload = {
                'action': 'get_capabilities',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('capabilities', payload)

            return response.get('capabilities', [])

        except Exception as e:
            logger.error(f"Failed to get model capabilities: {e}")
            return []

    async def update_model(self, model_name: str, model_data: Dict[str, Any]) -> bool:
        """Update a model with new data (for continuous learning)"""
        try:
            payload = {
                'model_name': model_name,
                'model_data': model_data,
                'action': 'update_model',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('update', payload)

            return response.get('success', False)

        except Exception as e:
            logger.error(f"Failed to update model {model_name}: {e}")
            return False