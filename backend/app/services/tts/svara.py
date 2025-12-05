# Svara TTS v1 Provider Implementation

import base64
import os
from typing import List, Optional
import aiohttp
from .base import TTSProviderBase
from ...schemas.tts import (
    TTSRequest, AudioData, Voice, VoiceMetadata,
    VoiceGender, AudioFormat, TTSProvider
)

class SvaraTTSProvider(TTSProviderBase):
    """Svara TTS v1 provider (Indian language specialist)"""
    
    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key") or os.getenv("SVARA_API_KEY")
        self.base_url = config.get("base_url", "https://api.svaraspeech.ai/v1")
        
        # Svara specializes in Indian languages
        self.supported_languages = [
            "ml-IN",  # Malayalam
            "hi-IN",  # Hindi
            "ta-IN",  # Tamil
            "te-IN",  # Telugu
            "kn-IN",  # Kannada
           "mr-IN",  # Marathi
            "gu-IN",  # Gujarati
            "bn-IN",  # Bengali
        ]
        
    async def synthesize(self, request: TTSRequest) -> AudioData:
        """Synthesize speech using Svara TTS"""
        
        if not self.api_key:
            raise Exception("Svara API key not configured")
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "text": request.text,
            "language": request.language,
            "voice": request.voice,
            "speed": request.speed,
            "pitch": request.pitch,
            "format": request.format.value
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/synthesize",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Svara API error: {error_text}")
                
                result = await response.json()
        
        # Svara returns audio URL or base64
        audio_data = result.get("audio_url") or result.get("audio_data")
        
        return AudioData(
            data=audio_data,
            format=request.format,
            duration=result.get("duration", len(request.text) * 0.08),
            size=result.get("size", 0),
            sample_rate=result.get("sample_rate", 22050)
        )
    
    async def list_voices(self, language: Optional[str] = None) -> List[Voice]:
        """List available Svara voices"""
        
        if not self.api_key:
            return []
        
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/voices",
                    headers=headers,
                    params={"language": language} if language else None
                ) as response:
                    if response.status != 200:
                        return []
                    
                    data = await response.json()
                    
                    voices = []
                    for voice_data in data.get("voices", []):
                        voices.append(Voice(
                            id=voice_data["id"],
                            name=voice_data["name"],
                            language=voice_data["language"],
                            language_codes=voice_data.get("language_codes", [voice_data["language"]]),
                            gender=VoiceGender(voice_data.get("gender", "neutral")),
                            provider=TTSProvider.SVARA,
                            quality=voice_data.get("quality", "standard"),
                            recommended=voice_data.get("recommended", False)
                        ))
                    
                    return voices
        except Exception as e:
            print(f"Error listing Svara voices: {e}")
            return []
    
    async def get_voice_metadata(self, voice_id: str) -> VoiceMetadata:
        """Get Svara voice metadata"""
        
        # Parse from voice_id or API call
        return VoiceMetadata(
            gender=VoiceGender.NEUTRAL,
            quality="standard",
            accent="indian"
        )
    
    async def check_health(self) -> bool:
        """Check if Svara TTS is accessible"""
        
        if not self.api_key:
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.base_url}/health",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    return response.status == 200
        except Exception as e:
            print(f"Svara health check failed: {e}")
            return False
    
    def calculate_cost(self, characters: int) -> float:
        """Calculate Svara TTS cost (assumed pricing)"""
        # Placeholder - update with actual Svara pricing
        return (characters / 1_000_000) * 2.0  # $2 per 1M chars (example)
    
    def get_supported_languages(self) -> List[str]:
        """Get supported languages"""
        return self.supported_languages
