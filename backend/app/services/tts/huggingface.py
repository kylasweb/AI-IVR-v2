# HuggingFace TTS Provider Implementation

import base64
import os
from typing import List, Optional
import aiohttp
from .base import TTSProviderBase
from ...schemas.tts import (
    TTSRequest, AudioData, Voice, VoiceMetadata,
    VoiceGender, AudioFormat, TTSProvider
)

class HuggingFaceTTSProvider(TTSProviderBase):
    """HuggingFace Text-to-Speech provider (fallback)"""
    
    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key") or os.getenv("HUGGINGFACE_API_KEY")
        self.base_url = "https://api-inference.huggingface.co/models"
        
        # Model configurations
        self.models = {
            "ml-IN": "facebook/mms-tts-mal",  # Malayalam
            "en-US": "facebook/fastspeech2-en-ljspeech",
            "hi-IN": "facebook/mms-tts-hin",  # Hindi
            "ta-IN": "facebook/mms-tts-tam",  # Tamil
        }
        
    async def synthesize(self, request: TTSRequest) -> AudioData:
        """Synthesize speech using HuggingFace"""
        
        # Get model for language
        model = self.models.get(request.language, self.models.get("en-US"))
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {"inputs": request.text}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/{model}",
                headers=headers,
                json=payload
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"HuggingFace API error: {error_text}")
                
                audio_bytes = await response.read()
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_bytes).decode()
        audio_data = f"data:audio/flac;base64,{audio_base64}"
        
        # Estimate duration
        duration = len(request.text) * 0.08
        
        return AudioData(
            data=audio_data,
            format=AudioFormat.FLAC,  # HuggingFace returns FLAC
            duration=duration,
            size=len(audio_bytes),
            sample_rate=16000  # MMS-TTS uses 16kHz
        )
    
    async def list_voices(self, language: Optional[str] = None) -> List[Voice]:
        """List available HuggingFace voices"""
        
        voices = []
        for lang_code, model_id in self.models.items():
            if language and lang_code != language:
                continue
                
            voices.append(Voice(
                id=model_id,
                name=f"HuggingFace {lang_code}",
                language=lang_code,
                language_codes=[lang_code],
                gender=VoiceGender.NEUTRAL,
                provider=TTSProvider.HUGGINGFACE,
                quality="standard",
                recommended=False
            ))
        
        return voices
    
    async def get_voice_metadata(self, voice_id: str) -> VoiceMetadata:
        """Get HuggingFace voice metadata"""
        return VoiceMetadata(
            gender=VoiceGender.NEUTRAL,
            quality="standard"
        )
    
    async def check_health(self) -> bool:
        """Check if HuggingFace API is accessible"""
        try:
            headers = {"Authorization": f"Bearer {self.api_key}"}
            async with aiohttp.ClientSession() as session:
                # Test with a small request
                async with session.post(
                    f"{self.base_url}/facebook/mms-tts-mal",
                   headers=headers,
                    json={"inputs": "test"},
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    return response.status in [200, 503]  # 503 = model loading
        except Exception as e:
            print(f"HuggingFace health check failed: {e}")
            return False
    
    def calculate_cost(self, characters: int) -> float:
        """HuggingFace is free (rate-limited)"""
        return 0.0
    
    def get_supported_languages(self) -> List[str]:
        """Get supported languages"""
        return list(self.models.keys())
