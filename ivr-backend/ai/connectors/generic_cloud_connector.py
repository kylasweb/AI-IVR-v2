"""
Generic Cloud Connector

Provides fallback AI capabilities through generic cloud providers.
Supports multiple cloud AI services for maximum availability.
"""

import logging
import aiohttp
import json
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime

from ..models.ai_model_router import AIProvider, AIModelType

logger = logging.getLogger(__name__)


class GenericCloudConnector:
    """Connector for generic cloud AI providers (OpenAI, etc.)"""

    def __init__(self, config: Dict[str, Any]):
        self.endpoint = config.get('endpoint', 'https://api.openai.com/v1')
        self.api_key = config.get('api_key', '')
        self.timeout_seconds = config.get('timeout_seconds', 60)
        self.retry_attempts = config.get('retry_attempts', 2)
        self.session: Optional[aiohttp.ClientSession] = None

        # Model mappings for different providers
        self.model_mappings = config.get('model_mappings', {
            'conversational': 'gpt-4',
            'stt': 'whisper-1',
            'tts': 'tts-1'
        })

        # Supported languages (broad support)
        self.supported_languages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'es', 'fr', 'de']

    async def initialize(self) -> bool:
        """Initialize the connector"""
        try:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout_seconds)
            )
            logger.info("Generic Cloud connector initialized")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Generic Cloud connector: {e}")
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
        Process conversational request using GPT-4
        """
        try:
            model = self.model_mappings.get('conversational', 'gpt-4')

            # Create system prompt based on language
            system_prompt = self._get_system_prompt(language, dialect)

            messages = [
                {"role": "system", "content": system_prompt}
            ]

            # Add context if available
            if context and context.get('conversation_history'):
                for msg in context['conversation_history'][-5:]:  # Last 5 messages
                    messages.append({
                        "role": msg.get('role', 'user'),
                        "content": msg.get('content', '')
                    })

            messages.append({"role": "user", "content": text})

            payload = {
                "model": model,
                "messages": messages,
                "max_tokens": 200,
                "temperature": 0.7,
                "presence_penalty": 0.1,
                "frequency_penalty": 0.1
            }

            response = await self._make_request('chat/completions', payload)

            choice = response.get('choices', [{}])[0]
            message = choice.get('message', {})

            return {
                'provider': AIProvider.GENERIC_CLOUD.value,
                'model': model,
                'text': message.get('content', ''),
                'confidence': 0.8,  # Generic confidence for GPT
                'language': language,
                'dialect': dialect,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'tokens_used': response.get('usage', {}).get('total_tokens', 0),
                'cost': self._calculate_cost(response.get('usage', {}), 'conversational')
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
        Process speech-to-text using Whisper
        """
        try:
            model = self.model_mappings.get('stt', 'whisper-1')

            # Convert audio to base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')

            # For OpenAI Whisper, we need to send as multipart form data
            # This is a simplified version - in practice, you'd use aiohttp.FormData

            payload = {
                'model': model,
                'language': language if language in ['en', 'es', 'fr', 'de'] else None,
                'response_format': 'json',
                'temperature': 0.0
            }

            # Note: In real implementation, audio file would be sent as multipart
            response = await self._make_request('audio/transcriptions', payload, audio_data=audio_data)

            return {
                'provider': AIProvider.GENERIC_CLOUD.value,
                'model': model,
                'text': response.get('text', ''),
                'confidence': 0.85,  # Generic confidence for Whisper
                'language': response.get('language', language),
                'dialect': dialect,
                'processing_time_ms': response.get('processing_time_ms', 0),
                'audio_duration_ms': response.get('duration', 0) * 1000,  # Convert to ms
                'cost': 0.006  # Fixed cost per minute for Whisper
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
        Process text-to-speech using OpenAI TTS
        """
        try:
            model = self.model_mappings.get('tts', 'tts-1')

            payload = {
                'model': model,
                'input': text,
                'voice': voice_config.get('voice', 'alloy') if voice_config else 'alloy',
                'response_format': 'wav',
                'speed': voice_config.get('speed', 1.0) if voice_config else 1.0
            }

            response = await self._make_request('audio/speech', payload)

            # Response contains binary audio data
            audio_base64 = base64.b64encode(response).decode('utf-8')

            return {
                'provider': AIProvider.GENERIC_CLOUD.value,
                'model': model,
                'audio_data': audio_base64,
                'audio_format': 'wav',
                'sample_rate': 24000,  # OpenAI TTS default
                'language': language,
                'dialect': dialect,
                'processing_time_ms': 0,  # Not provided by OpenAI
                'audio_duration_ms': len(text) * 50,  # Rough estimate: 50ms per character
                'cost': 0.015  # Fixed cost per 1K characters for TTS-1
            }

        except Exception as e:
            logger.error(f"Error processing TTS request: {e}")
            raise

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on cloud service"""
        try:
            payload = {
                'model': 'gpt-3.5-turbo',
                'messages': [{'role': 'user', 'content': 'Hello'}],
                'max_tokens': 5
            }

            start_time = datetime.now()
            response = await self._make_request('chat/completions', payload)
            response_time = (datetime.now() - start_time).total_seconds() * 1000

            return {
                'provider': AIProvider.GENERIC_CLOUD.value,
                'status': 'healthy',
                'response_time_ms': response_time,
                'supported_languages': self.supported_languages,
                'models_available': list(self.model_mappings.values()),
                'last_check': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'provider': AIProvider.GENERIC_CLOUD.value,
                'status': 'unhealthy',
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

    async def _make_request(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        audio_data: Optional[bytes] = None
    ) -> Any:
        """Make HTTP request to cloud API"""
        if not self.session:
            raise RuntimeError("Connector not initialized")

        url = f"{self.endpoint}/{endpoint}"

        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

        for attempt in range(self.retry_attempts):
            try:
                if audio_data and endpoint == 'audio/transcriptions':
                    # Special handling for Whisper API
                    # In real implementation, this would use FormData
                    headers['Content-Type'] = 'multipart/form-data'
                    # Simplified - actual implementation would use aiohttp.FormData

                async with self.session.post(
                    url,
                    json=payload,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        if endpoint == 'audio/speech':
                            # Return binary data for TTS
                            return await response.read()
                        else:
                            return await response.json()
                    elif response.status == 429:  # Rate limited
                        logger.warning(f"Rate limited (attempt {attempt + 1}), retrying...")
                        await asyncio.sleep(2 ** attempt)
                        continue
                    elif response.status == 401:  # Unauthorized
                        raise RuntimeError("Invalid API key")
                    else:
                        error_text = await response.text()
                        logger.warning(
                            f"Request failed (attempt {attempt + 1}): "
                            f"Status {response.status}, Error: {error_text}"
                        )

            except Exception as e:
                logger.warning(f"Request failed (attempt {attempt + 1}): {e}")

            if attempt < self.retry_attempts - 1:
                await asyncio.sleep(1)

        raise RuntimeError(f"Failed to get response from {endpoint} after {self.retry_attempts} attempts")

    def _get_system_prompt(self, language: str, dialect: Optional[str]) -> str:
        """Get system prompt based on language and dialect"""
        base_prompts = {
            'ml': "You are a helpful AI assistant for Malayalam speakers. Respond in Malayalam script. Be culturally sensitive and understanding of Kerala context.",
            'ta': "You are a helpful AI assistant for Tamil speakers. Respond in Tamil script. Be culturally sensitive and understanding of Tamil Nadu context.",
            'hi': "You are a helpful AI assistant for Hindi speakers. Respond in Hindi script. Be culturally sensitive and understanding of Indian context.",
            'te': "You are a helpful AI assistant for Telugu speakers. Respond in Telugu script. Be culturally sensitive and understanding of Andhra Pradesh context.",
            'kn': "You are a helpful AI assistant for Kannada speakers. Respond in Kannada script. Be culturally sensitive and understanding of Karnataka context.",
            'en': "You are a helpful AI assistant. Provide clear, accurate, and culturally appropriate responses."
        }

        prompt = base_prompts.get(language, base_prompts['en'])

        if dialect:
            prompt += f" Consider {dialect} dialect preferences when appropriate."

        return prompt

    def _calculate_cost(self, usage: Dict[str, Any], model_type: str) -> float:
        """Calculate cost based on usage"""
        if not usage:
            return 0.01  # Default fallback cost

        if model_type == 'conversational':
            # GPT-4 pricing (approximate)
            input_tokens = usage.get('prompt_tokens', 0)
            output_tokens = usage.get('completion_tokens', 0)

            input_cost = (input_tokens / 1000) * 0.03  # $0.03 per 1K input tokens
            output_cost = (output_tokens / 1000) * 0.06  # $0.06 per 1K output tokens

            return round(input_cost + output_cost, 6)

        elif model_type == 'stt':
            return 0.006  # $0.006 per minute for Whisper

        elif model_type == 'tts':
            return 0.015  # $0.015 per 1K characters for TTS

        return 0.01  # Default cost

    async def get_supported_languages(self) -> List[str]:
        """Get list of supported languages"""
        return self.supported_languages.copy()

    async def switch_provider(self, new_endpoint: str, new_api_key: str) -> bool:
        """Switch to a different cloud provider"""
        try:
            self.endpoint = new_endpoint
            self.api_key = new_api_key
            logger.info(f"Switched to new cloud provider: {new_endpoint}")
            return True
        except Exception as e:
            logger.error(f"Failed to switch provider: {e}")
            return False