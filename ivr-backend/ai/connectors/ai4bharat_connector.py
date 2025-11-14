"""
AI4Bharat Connector

Connects to AI4Bharat models for regional language AI capabilities.
Specialized for Indian languages with high accuracy for Malayalam, Tamil, etc.
"""

import logging
import aiohttp
import json
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime

from ..models.ai_model_router import AIProvider, AIModelType

logger = logging.getLogger(__name__)


class AI4BharatConnector:
    """Connector for AI4Bharat models"""

    def __init__(self, config: Dict[str, Any]):
        self.endpoint = config.get('endpoint', 'https://api.ai4bharat.org/v1')
        self.api_key = config.get('api_key', '')
        self.timeout_seconds = config.get('timeout_seconds', 45)
        self.retry_attempts = config.get('retry_attempts', 2)
        self.session: Optional[aiohttp.ClientSession] = None

        # AI4Bharat specific configurations
        self.supported_languages = ['ml', 'ta', 'te', 'kn', 'hi', 'en']
        self.model_mappings = {
            'conversational': 'indic-gpt',
            'stt': 'indic-asr',
            'tts': 'indic-tts',
            'nlu': 'indic-nlu'
        }

    async def initialize(self) -> bool:
        """Initialize the connector"""
        try:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)
            )
            logger.info("AI4Bharat connector initialized")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize AI4Bharat connector: {e}")
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
        Process a conversational AI request using AI4Bharat Indic-GPT
        """
        try:
            if language not in self.supported_languages:
                raise ValueError(f"Language {language} not supported by AI4Bharat")

            payload = {
                'text': text,
                'language': language,
                'dialect': dialect,
                'context': context or {},
                'model': self.model_mappings['conversational'],
                'max_tokens': 150,
                'temperature': 0.7,
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('chat/completions', payload)

            return {
                'provider': AIProvider.AI4BHARAT.value,
                'model': f'indic-gpt-{language}',
                'text': response.get('choices', [{}])[0].get('message', {}).get('content', ''),
                'confidence': response.get('confidence', 0.75),
                'language': language,
                'dialect': dialect,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'tokens_used': response.get('usage', {}).get('total_tokens', 0),
                'cost': self._calculate_cost(response.get('usage', {}))
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
        Process speech-to-text using AI4Bharat Indic-ASR
        """
        try:
            if language not in self.supported_languages:
                raise ValueError(f"Language {language} not supported by AI4Bharat")

            # Convert audio to base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')

            payload = {
                'audio': audio_base64,
                'language': language,
                'model': self.model_mappings['stt'],
                'config': {
                    'encoding': 'linear16',
                    'sample_rate': 16000,
                    'language': language
                },
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('asr', payload)

            return {
                'provider': AIProvider.AI4BHARAT.value,
                'model': f'indic-asr-{language}',
                'text': response.get('transcript', ''),
                'confidence': response.get('confidence', 0.8),
                'language': response.get('detected_language', language),
                'dialect': dialect,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'audio_duration_ms': response.get('duration_ms', 0),
                'cost': 0.002  # Fixed cost for ASR
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
        Process text-to-speech using AI4Bharat Indic-TTS
        """
        try:
            if language not in self.supported_languages:
                raise ValueError(f"Language {language} not supported by AI4Bharat")

            payload = {
                'text': text,
                'language': language,
                'model': self.model_mappings['tts'],
                'voice': voice_config or {
                    'gender': 'female',
                    'age': 'adult',
                    'style': 'neutral'
                },
                'config': {
                    'format': 'wav',
                    'sample_rate': 22050
                },
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('tts', payload)

            return {
                'provider': AIProvider.AI4BHARAT.value,
                'model': f'indic-tts-{language}',
                'audio_data': response.get('audio_base64', ''),
                'audio_format': 'wav',
                'sample_rate': 22050,
                'language': language,
                'dialect': dialect,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'audio_duration_ms': response.get('duration_ms', 0),
                'cost': 0.004  # Fixed cost for TTS
            }

        except Exception as e:
            logger.error(f"Error processing TTS request: {e}")
            raise

    async def process_nlu_request(
        self,
        text: str,
        language: str,
        intent_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Process natural language understanding request
        """
        try:
            payload = {
                'text': text,
                'language': language,
                'model': self.model_mappings['nlu'],
                'intent_types': intent_types or ['general'],
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('nlu', payload)

            return {
                'provider': AIProvider.AI4BHARAT.value,
                'model': f'indic-nlu-{language}',
                'intent': response.get('intent', 'unknown'),
                'entities': response.get('entities', []),
                'confidence': response.get('confidence', 0.7),
                'language': language,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'cost': 0.001  # Low cost for NLU
            }

        except Exception as e:
            logger.error(f"Error processing NLU request: {e}")
            raise

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on AI4Bharat service"""
        try:
            payload = {
                'action': 'health_check',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('health', payload)

            return {
                'provider': AIProvider.AI4BHARAT.value,
                'status': 'healthy' if response.get('status') == 'ok' else 'unhealthy',
                'response_time_ms': response.get('response_time_ms', 0),
                'supported_languages': self.supported_languages,
                'models_available': list(self.model_mappings.keys()),
                'last_check': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'provider': AIProvider.AI4BHARAT.value,
                'status': 'unhealthy',
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

    async def _make_request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to AI4Bharat API"""
        if not self.session:
            raise RuntimeError("Connector not initialized")

        url = f"{self.endpoint}/{endpoint}"

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}',
            'User-Agent': 'IMOS-Communications-Engine/1.0'
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
                    elif response.status == 429:  # Rate limited
                        logger.warning(f"Rate limited (attempt {attempt + 1}), retrying...")
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        error_text = await response.text()
                        logger.warning(
                            f"Request failed (attempt {attempt + 1}): "
                            f"Status {response.status}, Error: {error_text}"
                        )

            except Exception as e:
                logger.warning(f"Request failed (attempt {attempt + 1}): {e}")

            if attempt < self.retry_attempts - 1:
                await asyncio.sleep(1)  # Fixed delay for AI4Bharat

        raise RuntimeError(f"Failed to get response from {endpoint} after {self.retry_attempts} attempts")

    def _calculate_cost(self, usage: Dict[str, Any]) -> float:
        """Calculate cost based on token usage"""
        # AI4Bharat pricing (example rates)
        input_tokens = usage.get('prompt_tokens', 0)
        output_tokens = usage.get('completion_tokens', 0)

        # Cost per 1K tokens
        input_cost_per_1k = 0.002  # $0.002 per 1K input tokens
        output_cost_per_1k = 0.004  # $0.004 per 1K output tokens

        total_cost = (
            (input_tokens / 1000) * input_cost_per_1k +
            (output_tokens / 1000) * output_cost_per_1k
        )

        return round(total_cost, 6)

    async def get_supported_languages(self) -> List[str]:
        """Get list of supported languages"""
        return self.supported_languages.copy()

    async def get_model_info(self, model_type: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        try:
            payload = {
                'model_type': model_type,
                'action': 'model_info',
                'timestamp': datetime.now().isoformat()
            }

            response = await self._make_request('models/info', payload)

            return {
                'model_type': model_type,
                'name': response.get('name', ''),
                'version': response.get('version', ''),
                'supported_languages': response.get('languages', []),
                'capabilities': response.get('capabilities', []),
                'performance_metrics': response.get('metrics', {})
            }

        except Exception as e:
            logger.error(f"Failed to get model info for {model_type}: {e}")
            return {}