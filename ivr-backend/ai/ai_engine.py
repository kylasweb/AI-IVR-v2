"""
AI Engine

Main orchestration engine for the IMOS Communications Engine AI layer.
Coordinates between the AI Model Router and provider connectors.
"""

import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime

from .models.ai_model_router import AIModelRouter, AIProvider, AIModelType, RoutingDecision
from .connectors import ProprietaryMLConnector, AI4BharatConnector, GenericCloudConnector, VocodeConnector

logger = logging.getLogger(__name__)


class AIEngine:
    """
    Main AI orchestration engine that coordinates routing and provider interactions
    """

    def __init__(self, config_path: str = "ai/models/routing_config.yaml"):
        self.config_path = config_path
        self.router: Optional[AIModelRouter] = None
        self.connectors: Dict[AIProvider, Any] = {}
        self.is_initialized = False

    async def initialize(self) -> bool:
        """Initialize the AI engine and all components"""
        try:
            logger.info("Initializing AI Engine...")

            # Initialize model router
            self.router = AIModelRouter(self.config_path)
            if not await self.router.initialize():
                raise RuntimeError("Failed to initialize AI Model Router")

            # Load provider configurations
            provider_configs = await self._load_provider_configs()

            # Initialize connectors
            await self._initialize_connectors(provider_configs)

            # Register connectors with router
            for provider, connector in self.connectors.items():
                await self.router.register_provider_connector(provider, connector)

            self.is_initialized = True
            logger.info("AI Engine initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize AI Engine: {e}")
            await self.cleanup()
            return False

    async def cleanup(self) -> None:
        """Clean up all resources"""
        try:
            # Close all connectors
            for connector in self.connectors.values():
                if hasattr(connector, 'close'):
                    await connector.close()

            self.connectors.clear()
            self.is_initialized = False
            logger.info("AI Engine cleaned up")

        except Exception as e:
            logger.error(f"Error during cleanup: {e}")

    async def process_conversational_request(
        self,
        text: str,
        language: str,
        dialect: Optional[str] = None,
        session_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a conversational AI request

        Args:
            text: Input text
            language: Language code
            dialect: Dialect code
            session_context: Session context for conversation history

        Returns:
            AI response with metadata
        """
        if not self.is_initialized:
            raise RuntimeError("AI Engine not initialized")

        try:
            # Route the request
            routing_decision = await self.router.route_request(
                language=language,
                dialect=dialect,
                model_type=AIModelType.CONVERSATIONAL_AI,
                context=session_context
            )

            # Get the connector
            connector = await self.router.get_provider_connector(routing_decision.selected_provider)
            if not connector:
                raise RuntimeError(f"No connector available for {routing_decision.selected_provider}")

            # Process the request
            response = await connector.process_conversational_request(
                text=text,
                language=language,
                dialect=dialect,
                context=session_context
            )

            # Add routing metadata
            response.update({
                'routing_decision': {
                    'provider': routing_decision.selected_provider.value,
                    'model': routing_decision.selected_model,
                    'confidence_score': routing_decision.confidence_score,
                    'estimated_cost': routing_decision.estimated_cost,
                    'fallback_used': routing_decision.fallback_used,
                    'reasoning': routing_decision.reasoning
                },
                'processed_at': datetime.now().isoformat(),
                'engine_version': '1.0.0'
            })

            logger.info(
                f"Processed conversational request for {language} "
                f"via {routing_decision.selected_provider.value}"
            )

            return response

        except Exception as e:
            logger.error(f"Error processing conversational request: {e}")
            # Return fallback response
            return await self._get_fallback_response(text, language, "conversational")

    async def process_conversation(
        self,
        session_id: str,
        user_input: str,
        language: str,
        dialect: Optional[str] = None
    ) -> Any:
        """
        Process a conversation turn for the API server

        Args:
            session_id: Session identifier
            user_input: User's input text
            language: Language code
            dialect: Dialect code

        Returns:
            AI response object
        """
        # Create a simple response object
        class AIResponse:
            def __init__(self, response_text: str, actions=None, metadata=None):
                self.response_text = response_text
                self.actions = actions or {}
                self.metadata = metadata or {}

        try:
            # Process through the conversational request method
            result = await self.process_conversational_request(
                text=user_input,
                language=language,
                dialect=dialect,
                session_context={"session_id": session_id}
            )

            return AIResponse(
                response_text=result.get("response", "ക്ഷമിക്കണം, എനിക്ക് മറുപടി നൽകാൻ കഴിഞ്ഞില്ല"),
                actions=result.get("actions", {}),
                metadata=result.get("metadata", {})
            )

        except Exception as e:
            logger.error(f"Error in process_conversation: {e}")
            return AIResponse(
                response_text="ക്ഷമിക്കണം, സാങ്കേതിക പ്രശ്നം സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
                actions={},
                metadata={"error": str(e)}
            )

    async def process_speech_to_text(
        self,
        audio_data: bytes,
        language: str,
        dialect: Optional[str] = None,
        session_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process speech-to-text request

        Args:
            audio_data: Raw audio bytes
            language: Language code
            dialect: Dialect code
            session_context: Session context

        Returns:
            Transcription with metadata
        """
        if not self.is_initialized:
            raise RuntimeError("AI Engine not initialized")

        try:
            # Route the request
            routing_decision = await self.router.route_request(
                language=language,
                dialect=dialect,
                model_type=AIModelType.SPEECH_TO_TEXT,
                context=session_context
            )

            # Get the connector
            connector = await self.router.get_provider_connector(routing_decision.selected_provider)
            if not connector:
                raise RuntimeError(f"No connector available for {routing_decision.selected_provider}")

            # Process the request
            response = await connector.process_speech_to_text(
                audio_data=audio_data,
                language=language,
                dialect=dialect,
                context=session_context
            )

            # Add routing metadata
            response.update({
                'routing_decision': {
                    'provider': routing_decision.selected_provider.value,
                    'model': routing_decision.selected_model,
                    'confidence_score': routing_decision.confidence_score,
                    'estimated_cost': routing_decision.estimated_cost,
                    'fallback_used': routing_decision.fallback_used
                },
                'processed_at': datetime.now().isoformat()
            })

            logger.info(
                f"Processed STT request for {language} "
                f"via {routing_decision.selected_provider.value}"
            )

            return response

        except Exception as e:
            logger.error(f"Error processing STT request: {e}")
            return await self._get_fallback_response(audio_data, language, "stt")

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
        if not self.is_initialized:
            raise RuntimeError("AI Engine not initialized")

        try:
            # Route the request
            routing_decision = await self.router.route_request(
                language=language,
                dialect=dialect,
                model_type=AIModelType.TEXT_TO_SPEECH,
                context={'voice_config': voice_config}
            )

            # Get the connector
            connector = await self.router.get_provider_connector(routing_decision.selected_provider)
            if not connector:
                raise RuntimeError(f"No connector available for {routing_decision.selected_provider}")

            # Process the request
            response = await connector.process_text_to_speech(
                text=text,
                language=language,
                dialect=dialect,
                voice_config=voice_config
            )

            # Add routing metadata
            response.update({
                'routing_decision': {
                    'provider': routing_decision.selected_provider.value,
                    'model': routing_decision.selected_model,
                    'confidence_score': routing_decision.confidence_score,
                    'estimated_cost': routing_decision.estimated_cost,
                    'fallback_used': routing_decision.fallback_used
                },
                'processed_at': datetime.now().isoformat()
            })

            logger.info(
                f"Processed TTS request for {language} "
                f"via {routing_decision.selected_provider.value}"
            )

            return response

        except Exception as e:
            logger.error(f"Error processing TTS request: {e}")
            return await self._get_fallback_response(text, language, "tts")

    async def get_health_status(self) -> Dict[str, Any]:
        """Get health status of all AI components"""
        if not self.is_initialized:
            return {'status': 'not_initialized'}

        try:
            # Get router stats
            router_stats = await self.router.get_routing_stats()

            # Get connector health
            connector_health = {}
            for provider, connector in self.connectors.items():
                try:
                    health = await connector.health_check()
                    connector_health[provider.value] = health
                except Exception as e:
                    connector_health[provider.value] = {
                        'status': 'error',
                        'error': str(e)
                    }

            return {
                'status': 'healthy',
                'router': router_stats,
                'connectors': connector_health,
                'last_check': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error getting health status: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

    async def update_model_health(self, provider: AIProvider, model_name: str, is_healthy: bool) -> None:
        """Update health status of a specific model"""
        if self.router:
            await self.router.update_model_health(model_name, is_healthy)
            logger.info(f"Updated health status for {provider.value}:{model_name} to {is_healthy}")

    async def get_supported_languages(self) -> List[str]:
        """Get list of all supported languages across providers"""
        if not self.is_initialized:
            return []

        languages = set()
        for connector in self.connectors.values():
            try:
                if hasattr(connector, 'get_supported_languages'):
                    connector_langs = await connector.get_supported_languages()
                    languages.update(connector_langs)
            except Exception as e:
                logger.warning(f"Error getting languages from connector: {e}")

        return sorted(list(languages))

    async def _load_provider_configs(self) -> Dict[str, Dict[str, Any]]:
        """Load provider configurations from routing config"""
        try:
            import yaml
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)

            return config.get('provider_configs', {})

        except Exception as e:
            logger.error(f"Error loading provider configs: {e}")
            return {}

    async def _initialize_connectors(self, provider_configs: Dict[str, Dict[str, Any]]) -> None:
        """Initialize all AI provider connectors"""
        connector_classes = {
            AIProvider.PROPRIETARY_ML: ProprietaryMLConnector,
            AIProvider.AI4BHARAT: AI4BharatConnector,
            AIProvider.GENERIC_CLOUD: GenericCloudConnector,
            AIProvider.VOCODE: VocodeConnector
        }

        for provider, config in provider_configs.items():
            try:
                provider_enum = AIProvider(provider)
                connector_class = connector_classes.get(provider_enum)

                if connector_class:
                    connector = connector_class(config)
                    if await connector.initialize():
                        self.connectors[provider_enum] = connector
                        logger.info(f"Initialized {provider} connector")
                    else:
                        logger.warning(f"Failed to initialize {provider} connector")
                else:
                    logger.warning(f"No connector class found for {provider}")

            except Exception as e:
                logger.error(f"Error initializing {provider} connector: {e}")

    async def _get_fallback_response(self, input_data: Any, language: str, request_type: str) -> Dict[str, Any]:
        """Generate a fallback response when all providers fail"""
        fallback_responses = {
            'conversational': {
                'text': f"I'm sorry, I'm having trouble processing your request in {language}. Please try again.",
                'confidence': 0.1,
                'language': language,
                'fallback': True
            },
            'stt': {
                'text': '',
                'confidence': 0.0,
                'language': language,
                'fallback': True
            },
            'tts': {
                'audio_data': '',
                'audio_format': 'wav',
                'language': language,
                'fallback': True
            }
        }

        response = fallback_responses.get(request_type, {'error': 'Unknown request type'})
        response.update({
            'provider': 'fallback',
            'model': 'none',
            'processed_at': datetime.now().isoformat(),
            'error': 'All AI providers failed'
        })

        return response

    async def get_routing_stats(self) -> Dict[str, Any]:
        """Get routing statistics"""
        if self.router:
            return await self.router.get_routing_stats()
        return {}

    async def reload_config(self) -> bool:
        """Reload routing configuration"""
        try:
            if self.router:
                # Reinitialize router (this will reload config)
                await self.router.initialize()
                logger.info("Routing configuration reloaded")
                return True
        except Exception as e:
            logger.error(f"Error reloading config: {e}")

        return False