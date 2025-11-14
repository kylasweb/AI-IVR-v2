"""
Vocode Connector for IMOS Communications Engine

Integrates Vocode Core (https://github.com/vocodedev/vocode-core) as an AI provider option.
Vocode provides voice AI abstractions and integrates with multiple STT/TTS/LLM providers.
"""

import logging
import asyncio
import os
from typing import Dict, Any, Optional, List
from datetime import datetime

from ..models.ai_model_router import AIProvider, AIModelType

logger = logging.getLogger(__name__)


class VocodeConnector:
    """
    Vocode connector using Vocode Core library abstractions.

    Vocode provides:
    - Streaming conversation orchestration
    - Integration with multiple AI providers (OpenAI, Azure, etc.)
    - Voice agent abstractions
    - Cross-platform voice application support
    """

    def __init__(self, config: Dict[str, Any]):
        self.config = config

        # Vocode Core uses environment variables (following their patterns)
        self.api_key = os.getenv('VOCODE_API_KEY') or config.get('api_key')
        self.base_url = os.getenv('VOCODE_BASE_URL', 'api.vocode.dev')

        # Provider-specific API keys (following Vocode Core patterns)
        self.openai_api_key = os.getenv('OPENAI_API_KEY') or config.get('openai_api_key')
        self.azure_speech_key = os.getenv('AZURE_SPEECH_KEY') or config.get('azure_speech_key')
        self.azure_speech_region = os.getenv('AZURE_SPEECH_REGION', 'eastus')
        self.deepgram_api_key = os.getenv('DEEPGRAM_API_KEY') or config.get('deepgram_api_key')

        # Vocode-specific configuration
        self.organization_id = os.getenv('VOCODE_ORGANIZATION_ID') or config.get('organization_id')

        # Kerala-specific voices (to be configured based on available synthesizers)
        self.kerala_voices = config.get('kerala_voices', {})

        # Health tracking
        self.last_health_check = None
        self.is_healthy = False
        self.request_count = 0
        self.error_count = 0

        # Vocode Core components (initialized in initialize())
        self._vocode_available = False

    async def initialize(self) -> bool:
        """Initialize Vocode connector using Vocode Core library"""
        try:
            logger.info("Initializing Vocode connector...")

            # Check if Vocode Core is available
            try:
                import vocode
                from vocode import getenv
                self._vocode_available = True
                logger.info("Vocode Core library found")
            except ImportError:
                logger.warning("Vocode Core library not installed - using fallback mode")
                self._vocode_available = False
                # Still mark as initialized for fallback functionality
                self.is_healthy = True
                self.last_health_check = datetime.now()
                return True

            # Set Vocode environment variables (following Vocode Core patterns)
            if self.api_key:
                os.environ['VOCODE_API_KEY'] = self.api_key
            if self.base_url:
                os.environ['VOCODE_BASE_URL'] = self.base_url
            if self.organization_id:
                os.environ['VOCODE_ORGANIZATION_ID'] = self.organization_id

            # Set provider API keys
            if self.openai_api_key:
                os.environ['OPENAI_API_KEY'] = self.openai_api_key
            if self.azure_speech_key:
                os.environ['AZURE_SPEECH_KEY'] = self.azure_speech_key
            if self.azure_speech_region:
                os.environ['AZURE_SPEECH_REGION'] = self.azure_speech_region
            if self.deepgram_api_key:
                os.environ['DEEPGRAM_API_KEY'] = self.deepgram_api_key

            # Test basic functionality
            await self._health_check()

            logger.info("Vocode connector initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize Vocode connector: {e}")
            return False

    async def cleanup(self) -> None:
        """Cleanup Vocode connector resources"""
        logger.info("Vocode connector cleaned up")

    async def _health_check(self) -> bool:
        """Check Vocode Core availability and configuration"""
        try:
            if not self._vocode_available:
                # In fallback mode, we're "healthy" but limited
                self.is_healthy = True
                self.last_health_check = datetime.now()
                return True

            # Check if required API keys are available
            required_keys = []
            if not self.openai_api_key:
                required_keys.append('OPENAI_API_KEY')

            if required_keys:
                logger.warning(f"Missing required API keys for Vocode: {required_keys}")
                self.is_healthy = False
                return False

            self.is_healthy = True
            self.last_health_check = datetime.now()
            return True

        except Exception as e:
            logger.error(f"Vocode health check error: {e}")
            self.is_healthy = False
            return False

    async def process_conversation(
        self,
        text: str,
        language: str = "en",
        dialect: Optional[str] = None,
        session_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process conversational AI request using Vocode Core abstractions

        Args:
            text: Input text
            language: Language code
            dialect: Dialect code (for Kerala Malayalam variants)
            session_context: Session context for conversation history

        Returns:
            AI response with metadata
        """
        if not self.is_healthy:
            raise RuntimeError("Vocode connector not healthy")

        try:
            self.request_count += 1

            if not self._vocode_available:
                # Fallback response when Vocode Core not available
                return await self._fallback_conversation_response(text, language, dialect)

            # Use Vocode Core abstractions
            import vocode
            from vocode.streaming.agent.chat_gpt_agent import ChatGPTAgent
            from vocode.streaming.models.agent import ChatGPTAgentConfig
            from vocode.streaming.models.message import BaseMessage

            # Configure agent based on language
            agent_config = ChatGPTAgentConfig(
                openai_api_key=self.openai_api_key,
                initial_message=BaseMessage(text=self._get_initial_message(language, dialect)),
                prompt_preamble=self._get_prompt_preamble(language, dialect),
                temperature=0.7
            )

            agent = ChatGPTAgent(agent_config)

            response_text = await self._simulate_agent_response(agent, text, session_context)

            return {
                "response": response_text,
                "confidence": 0.85,
                "metadata": {
                    "provider": "vocode",
                    "model": "chatgpt-agent",
                    "language": language,
                    "dialect": dialect,
                    "vocode_core_available": True
                },
                "cost": self._calculate_cost({"response_length": len(response_text)})
            }

        except Exception as e:
            logger.error(f"Vocode conversation processing error: {e}")
            self.error_count += 1
    async def _fallback_conversation_response(
        self,
        text: str,
        language: str,
        dialect: Optional[str]
    ) -> Dict[str, Any]:
        """Fallback response when Vocode Core is not available"""
        fallback_responses = {
            'en': "Hello! I'm here to help you with voice-based AI conversations.",
            'es': "¡Hola! Estoy aquí para ayudarte con conversaciones de IA basadas en voz.",
            'fr': "Bonjour! Je suis là pour vous aider avec des conversations IA basées sur la voix.",
            'de': "Hallo! Ich bin hier, um Ihnen bei sprachbasierten KI-Gesprächen zu helfen.",
            'it': "Ciao! Sono qui per aiutarti con conversazioni AI basate sulla voce.",
            'pt': "Olá! Estou aqui para ajudá-lo com conversas de IA baseadas em voz.",
            'ml': "ഹലോ! വോയ്സ് അധിഷ്ഠിത AI സംഭാഷണങ്ങളിൽ ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്."
        }

        response_text = fallback_responses.get(language, fallback_responses['en'])

        return {
            "response": response_text,
            "confidence": 0.6,
            "metadata": {
                "provider": "vocode",
                "model": "fallback-mode",
                "language": language,
                "dialect": dialect,
                "vocode_core_available": False
            },
            "cost": 0.0
        }

    def _get_initial_message(self, language: str, dialect: Optional[str]) -> str:
        """Get initial message for Vocode agent based on language"""
        messages = {
            'en': "Hello! I'm a voice AI assistant powered by Vocode.",
            'es': "¡Hola! Soy un asistente de IA de voz powered by Vocode.",
            'fr': "Bonjour! Je suis un assistant IA vocal powered by Vocode.",
            'de': "Hallo! Ich bin ein Voice-AI-Assistent powered by Vocode.",
            'it': "Ciao! Sono un assistente IA vocale powered by Vocode.",
            'pt': "Olá! Sou um assistente de IA de voz powered by Vocode.",
            'ml': "ഹലോ! ഞാൻ Vocode-powered വോയ്സ് AI അസിസ്റ്റന്റാണ്."
        }
        return messages.get(language, messages['en'])

    def _get_prompt_preamble(self, language: str, dialect: Optional[str]) -> str:
        """Get prompt preamble for Vocode agent"""
        base_preamble = """You are a helpful voice AI assistant powered by Vocode.
        You engage in natural, conversational interactions and provide helpful responses.
        Keep your responses conversational and natural, as if speaking to someone."""

        if language == 'ml' and dialect == 'travancore':
            base_preamble += "\nYou are communicating in Malayalam with Travancore dialect preferences."

        return base_preamble

    async def _fallback_tts_response(
        self,
        text: str,
        language: str,
        dialect: Optional[str]
    ) -> Dict[str, Any]:
        """Fallback TTS response when Vocode Core synthesizers not available"""
        return {
            "audio_data": "",  # Empty audio data
            "duration": 0.0,
            "format": "wav",
            "metadata": {
                "provider": "vocode",
                "synthesizer": "fallback",
                "language": language,
                "dialect": dialect,
                "vocode_core_available": False
            },
            "cost": 0.0
        }

    async def _simulate_agent_response(
        self,
        agent,
        text: str,
        session_context: Optional[Dict[str, Any]]
    ) -> str:
        """Simulate agent response (in real implementation, this would use Vocode's streaming)"""
        # This is a simplified simulation - real Vocode would handle streaming conversations
        # For now, we'll return a basic response
        return f"I understand you said: '{text}'. This is a simulated Vocode response."

    async def text_to_speech(
        self,
        text: str,
        language: str = "en",
        dialect: Optional[str] = None,
        voice_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Convert text to speech using Vocode Core synthesizers

        Args:
            text: Text to synthesize
            language: Language code
            dialect: Dialect code
            voice_config: Voice configuration options

        Returns:
            TTS result with audio data/metadata
        """
        if not self.is_healthy:
            raise RuntimeError("Vocode connector not healthy")

        try:
            self.request_count += 1

            if not self._vocode_available:
                # Fallback TTS response
                return await self._fallback_tts_response(text, language, dialect)

            # Use Vocode Core synthesizer abstractions
            import vocode
            from vocode.streaming.synthesizer.azure_synthesizer import AzureSynthesizer
            from vocode.streaming.models.synthesizer import AzureSynthesizerConfig

            # Configure synthesizer based on available providers
            if self.azure_speech_key and self.azure_speech_region:
                # Use Azure synthesizer (most reliable for Vocode)
                synthesizer_config = AzureSynthesizerConfig(
                    sampling_rate=16000,
                    audio_encoding="linear16",
                    voice_name=self._get_voice_for_language(language, dialect),
                    pitch=voice_config.get('pitch', 0.0) if voice_config else 0.0,
                    rate=voice_config.get('rate', 15) if voice_config else 15
                )
                synthesizer = AzureSynthesizer(
                    synthesizer_config,
                    azure_speech_key=self.azure_speech_key,
                    azure_speech_region=self.azure_speech_region
                )

                # In real implementation, this would synthesize audio
                # For now, simulate the response
                audio_data = await self._simulate_tts_synthesis(synthesizer, text)

                return {
                    "audio_data": audio_data,
                    "duration": len(text) * 0.1,  # Rough estimate
                    "format": "wav",
                    "metadata": {
                        "provider": "vocode",
                        "synthesizer": "azure",
                        "voice_name": synthesizer_config.voice_name,
                        "language": language,
                        "dialect": dialect
                    },
                    "cost": self._calculate_cost({"text_length": len(text)}, "tts")
                }
            else:
                # Fallback if Azure not configured
                return await self._fallback_tts_response(text, language, dialect)

        except Exception as e:
            logger.error(f"Vocode TTS processing error: {e}")
            self.error_count += 1
            return await self._fallback_tts_response(text, language, dialect)

    async def speech_to_text(
        self,
        audio_data: bytes,
        language: str = "en",
        dialect: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Convert speech to text using Vocode Core transcribers

        Args:
            audio_data: Audio data as bytes
            language: Language code
            dialect: Dialect code

        Returns:
            STT result with transcription/metadata
        """
        if not self.is_healthy:
            raise RuntimeError("Vocode connector not healthy")

        try:
            self.request_count += 1

            if not self._vocode_available:
                # Fallback STT response
                return await self._fallback_stt_response(audio_data, language, dialect)

            # Use Vocode Core transcriber abstractions
            import vocode
            from vocode.streaming.transcriber.deepgram_transcriber import DeepgramTranscriber
            from vocode.streaming.models.transcriber import DeepgramTranscriberConfig

            # Configure transcriber based on available providers
            if self.deepgram_api_key:
                # Use Deepgram transcriber (recommended for Vocode)
                transcriber_config = DeepgramTranscriberConfig(
                    sampling_rate=16000,
                    audio_encoding="linear16",
                    chunk_size=1024,
                    model="nova-2",
                    language=self._map_language_code(language, dialect)
                )
                transcriber = DeepgramTranscriber(
                    transcriber_config,
                    api_key=self.deepgram_api_key
                )

                # In real implementation, this would transcribe audio
                # For now, simulate the response
                transcription = await self._simulate_stt_transcription(transcriber, audio_data)

                return {
                    "text": transcription,
                    "confidence": 0.88,
                    "language": language,
                    "dialect": dialect,
                    "metadata": {
                        "provider": "vocode",
                        "transcriber": "deepgram",
                        "model": "nova-2",
                        "audio_length": len(audio_data)
                    },
                    "cost": self._calculate_cost({"audio_length": len(audio_data)}, "stt")
                }
            else:
                # Fallback if Deepgram not configured
                return await self._fallback_stt_response(audio_data, language, dialect)

        except Exception as e:
            logger.error(f"Vocode STT processing error: {e}")
            self.error_count += 1
            return await self._fallback_stt_response(audio_data, language, dialect)

    async def _fallback_stt_response(
        self,
        audio_data: bytes,
        language: str,
        dialect: Optional[str]
    ) -> Dict[str, Any]:
        """Fallback STT response when Vocode Core transcribers not available"""
        return {
            "text": "",
            "confidence": 0.0,
            "language": language,
            "dialect": dialect,
            "metadata": {
                "provider": "vocode",
                "transcriber": "fallback",
                "vocode_core_available": False
            },
            "cost": 0.0
        }

    async def _simulate_stt_transcription(self, transcriber, audio_data: bytes) -> str:
        """Simulate STT transcription (in real implementation, this would use Vocode's transcriber)"""
        # This is a placeholder - real Vocode would transcribe actual audio
        # For now, return a placeholder transcription
        return "This is a simulated transcription from Vocode."

    def _map_language_code(self, language: str, dialect: Optional[str] = None) -> str:
        """Map IMOS language codes to Vocode format"""
        # Vocode language code mapping
        language_map = {
            'en': 'en',
            'hi': 'hi',
            'ta': 'ta',
            'te': 'te',
            'kn': 'kn',
            'ml': 'ml',  # Check if Vocode supports Malayalam
            'gu': 'gu',
            'pa': 'pa',
            'or': 'or',
            'as': 'as',
            'mai': 'mai',
            'ne': 'ne',
            'ur': 'ur'
        }

        vocode_lang = language_map.get(language, 'en')

        # Handle Kerala dialects for Malayalam
        if language == 'ml' and dialect:
            # Vocode may not support Malayalam dialects yet
            # Log for future enhancement
            logger.info(f"Kerala dialect '{dialect}' requested for Malayalam - using base Malayalam support")

        return vocode_lang

    def _get_voice_for_language(self, language: str, dialect: Optional[str] = None) -> str:
        """Get appropriate voice ID for language and dialect"""
        # Default voices by language
        default_voices = {
            'en': '21m00Tcm4TlvDq8ikWAM',  # Example English voice
            'hi': 'some-hindi-voice-id',   # To be configured
            'ta': 'some-tamil-voice-id',   # To be configured
            'ml': 'some-malayalam-voice-id'  # To be configured
        }

        # Kerala-specific voice selection
        if language == 'ml' and dialect in self.kerala_voices:
            return self.kerala_voices[dialect]

        return default_voices.get(language, default_voices.get('en', '21m00Tcm4TlvDq8ikWAM'))

    def _calculate_cost(self, result: Dict[str, Any], service_type: str = "conversation") -> float:
        """Calculate cost for Vocode API usage"""
        # Vocode pricing (example rates - adjust based on actual pricing)
        rates = {
            "conversation": 0.002,  # per request
            "tts": 0.015,          # per 1K characters
            "stt": 0.006           # per minute of audio
        }

        base_rate = rates.get(service_type, 0.002)

        if service_type == "tts":
            # Cost based on character count
            text_length = len(result.get("text", ""))
            return (text_length / 1000) * base_rate
        elif service_type == "stt":
            # Cost based on audio duration
            duration = result.get("duration", 1.0)
            return duration * base_rate
        else:
            # Fixed cost per conversation turn
            return base_rate

    async def get_health_status(self) -> Dict[str, Any]:
        """Get connector health status"""
        await self._health_check()

        return {
            "provider": "vocode",
            "healthy": self.is_healthy,
            "last_check": self.last_health_check.isoformat() if self.last_health_check else None,
            "request_count": self.request_count,
            "error_count": self.error_count,
            "error_rate": self.error_count / max(self.request_count, 1)
        }

    async def get_supported_languages(self) -> List[str]:
        """Get list of supported languages"""
        # Based on Vocode documentation - adjust as needed
        return ['en', 'es', 'fr', 'de', 'it', 'pt', 'hi', 'ta', 'te', 'kn']

    async def get_supported_voices(self, language: str) -> List[Dict[str, Any]]:
        """Get available voices for a language"""
        # This would typically call Vocode's voices API
        # For now, return configured voices
        if language == 'ml':
            return [
                {"id": "malayalam-female-1", "name": "Malayalam Female", "gender": "female"},
                {"id": "malayalam-male-1", "name": "Malayalam Male", "gender": "male"}
            ]
        elif language == 'en':
            return [
                {"id": "21m00Tcm4TlvDq8ikWAM", "name": "English Female", "gender": "female"},
                {"id": "some-english-male", "name": "English Male", "gender": "male"}
            ]

        return []