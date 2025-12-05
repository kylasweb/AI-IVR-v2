# TTS Service Orchestrator with Multi-Provider Support

import time
from typing import List, Optional, Dict
from ...schemas.tts import (
    TTSRequest, TTSResponse, AudioData, Voice,
    VoiceListResponse, ProviderStatus, TTSProvider
)
from .base import TTSProviderBase
from .google_cloud import GoogleCloudTTSProvider
from .huggingface import HuggingFaceTTSProvider
from .svara import SvaraTTSProvider

class TTSService:
    """
    Main TTS service with multi-provider support and automatic failover
    """
    
    def __init__(self, config: Dict):
        self.config = config
        
        # Initialize providers
        self.providers: Dict[TTSProvider, TTSProviderBase] = {}
        
        # Google Cloud (primary)
        if config.get("google_cloud"):
            self.providers[TTSProvider.GOOGLE_CLOUD] = GoogleCloudTTSProvider(
                config["google_cloud"]
            )
        
        # HuggingFace (fallback 1)
        if config.get("huggingface"):
            self.providers[TTSProvider.HUGGINGFACE] = HuggingFaceTTSProvider(
                config["huggingface"]
            )
        
        # Svara (fallback 2)
        if config.get("svara"):
            self.providers[TTSProvider.SVARA] = SvaraTTSProvider(
                config["svara"]
            )
        
        # Provider priority order
        self.provider_priority = [
            TTSProvider.GOOGLE_CLOUD,
            TTSProvider.SVARA,
            TTSProvider.HUGGINGFACE
        ]
        
        # Provider health cache
        self.provider_health_cache: Dict[TTSProvider, bool] = {}
        self.last_health_check = 0
        self.health_check_interval = 60  # seconds
        
    async def synthesize(
        self,
        request: TTSRequest
    ) -> TTSResponse:
        """
        Synthesize speech with automatic provider failover
        
        Args:
            request: TTS synthesisrequest
            
        Returns:
            TTSResponse with audio and metadata
        """
        start_time = time.time()
        
        # Determine provider to use
        provider_name = request.provider or self._get_best_provider(request.language)
        
        # Try primary provider
        try:
            result = await self._synthesize_with_provider(provider_name, request)
            processing_time = (time.time() - start_time) * 1000
            
            return TTSResponse(
                success=True,
                audio=result,
                provider=provider_name,
                processing_time=processing_time,
                characters=len(request.text),
                cost=self._calculate_cost(provider_name, len(request.text)),
                voice_used=request.voice,
                metadata={
                    "original_text": request.text,
                    "language": request.language,
                    "speed": request.speed,
                    "pitch": request.pitch
                }
            )
        except Exception as primary_error:
            print(f"Primary provider {provider_name} failed: {primary_error}")
            
            # Try failover
            for fallback_provider in self.provider_priority:
                if fallback_provider == provider_name:
                    continue
                
                if fallback_provider not in self.providers:
                    continue
                
                try:
                    print(f"Attempting failover to {fallback_provider}")
                    result = await self._synthesize_with_provider(fallback_provider, request)
                    processing_time = (time.time() - start_time) * 1000
                    
                    return TTSResponse(
                        success=True,
                        audio=result,
                        provider=fallback_provider,
                        processing_time=processing_time,
                        characters=len(request.text),
                        cost=self._calculate_cost(fallback_provider, len(request.text)),
                        voice_used=request.voice,
                        metadata={
                            "original_text": request.text,
                            "language": request.language,
                            "failover_from": provider_name.value,
                            "error": str(primary_error)
                        }
                    )
                except Exception as fallback_error:
                    print(f"Fallback provider {fallback_provider} failed: {fallback_error}")
                    continue
            
            # All providers failed
            raise Exception(f"All TTS providers failed. Last error: {primary_error}")
    
    async def list_voices(
        self,
        language: Optional[str] = None,
        provider: Optional[TTSProvider] = None
    ) -> VoiceListResponse:
        """
        List available voices from all or specific provider
        
        Args:
            language: Filter by language code
            provider: Specific provider to query
            
        Returns:
            VoiceListResponse with available voices
        """
        all_voices: List[Voice] = []
        
        providers_to_query = (
            [provider] if provider else list(self.providers.keys())
        )
        
        for provider_name in providers_to_query:
            if provider_name not in self.providers:
                continue
            
            try:
                voices = await self.providers[provider_name].list_voices(language)
                all_voices.extend(voices)
            except Exception as e:
                print(f"Error listing voices from {provider_name}: {e}")
        
        return VoiceListResponse(
            voices=all_voices,
            total=len(all_voices),
            provider=provider
        )
    
    async def get_provider_status(self) -> List[ProviderStatus]:
        """
        Get health status of all providers
        
        Returns:
            List of provider statuses
        """
        statuses = []
        
        for provider_name, provider_instance in self.providers.items():
            try:
                start = time.time()
                is_healthy = await provider_instance.check_health()
                latency = (time.time() - start) * 1000
                
                statuses.append(ProviderStatus(
                    provider=provider_name,
                    status="healthy" if is_healthy else "down",
                    latency=latency,
                    error_rate=0.0,
                    last_check=time.strftime("%Y-%m-%d %H:%M:%S")
                ))
            except Exception  as e:
                statuses.append(ProviderStatus(
                    provider=provider_name,
                    status="down",
                    latency=None,
                    error_rate=100.0,
                    last_check=time.strftime("%Y-%m-%d %H:%M:%S")
                ))
        
        return statuses
    
    # Private helper methods
    
    async def _synthesize_with_provider(
        self,
        provider_name: TTSProvider,
        request: TTSRequest
    ) -> AudioData:
        """Synthesize with specific provider"""
        if provider_name not in self.providers:
            raise Exception(f"Provider {provider_name} not configured")
        
        provider = self.providers[provider_name]
        return await provider.synthesize(request)
    
    def _get_best_provider(self, language: str) -> TTSProvider:
        """
        Determine best provider for language
        
        Args:
            language: Language code
            
        Returns:
            Best provider for the language
        """
        # Check provider health cache
        current_time = time.time()
        if current_time - self.last_health_check > self.health_check_interval:
            self.provider_health_cache.clear()
        
        # Try providers in priority order
        for provider_name in self.provider_priority:
            if provider_name not in self.providers:
                continue
            
            # Check if provider supports language
            provider = self.providers[provider_name]
            if language in provider.get_supported_languages():
                return provider_name
        
        # Default to first available
        return next(iter(self.providers.keys()))
    
    def _calculate_cost(self, provider: TTSProvider, characters: int) -> float:
        """Calculate cost for provider"""
        if provider not in self.providers:
            return 0.0
        
        return self.providers[provider].calculate_cost(characters)
