# Google Cloud TTS Provider Implementation

import base64
import os
from typing import List, Optional
from google.cloud import texttospeech_v1 as texttospeech
from google.cloud import storage
from .base import TTSProviderBase
from ...schemas.tts import (
    TTSRequest, AudioData, Voice, VoiceMetadata,
    VoiceGender, AudioFormat, TTSProvider
)

class GoogleCloudTTSProvider(TTSProviderBase):
    """Google Cloud Text-to-Speech provider"""
    
    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key") or os.getenv("GOOGLE_CLOUD_TTS_API_KEY")
        self.project_id = config.get("project_id") or os.getenv("GOOGLE_CLOUD_PROJECT_ID")
        self.bucket_name = config.get("bucket_name") or os.getenv("GCS_BUCKET_NAME")
        
        # Initialize clients
        self.tts_client = texttospeech.TextToSpeechClient()
        self.storage_client = storage.Client(project=self.project_id) if self.bucket_name else None
        
    async def synthesize(self, request: TTSRequest) -> AudioData:
        """Synthesize speech using Google Cloud TTS"""
        
        # Prepare input
        if request.ssml:
            synthesis_input = texttospeech.SynthesisInput(ssml=request.text)
        else:
            synthesis_input = texttospeech.SynthesisInput(text=request.text)
        
        # Configure voice
        voice = texttospeech.VoiceSelectionParams(
            language_code=request.language,
            name=request.voice
        )
        
        # Configure audio
        audio_encoding = self._get_audio_encoding(request.format)
        audio_config = texttospeech.AudioConfig(
            audio_encoding=audio_encoding,
            speaking_rate=request.speed,
            pitch=request.pitch,
            volume_gain_db=self._volume_to_db(request.volume),
            sample_rate_hertz=request.sample_rate
        )
        
        #Synthesize
        response = self.tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )
        
        # Handle storage
        audio_content = response.audio_content
        audio_size = len(audio_content)
        
        if self.storage_client and request.cache:
            # Upload to Google Cloud Storage
            audio_url = await self._upload_to_gcs(audio_content, request)
            audio_data_field = audio_url
        else:
            # Return base64
            audio_data_field = f"data:audio/{request.format.value};base64,{base64.b64encode(audio_content).decode()}"
        
        # Estimate duration (rough calculation)
        duration = len(request.text) * 0.08  # ~0.08s per character
        
        return AudioData(
            data=audio_data_field,
            format=request.format,
            duration=duration,
            size=audio_size,
            sample_rate=request.sample_rate
        )
    
    async def list_voices(self, language: Optional[str] = None) -> List[Voice]:
        """List available Google Cloud voices"""
        
        # Get all voices
        voices_response = self.tts_client.list_voices(language_code=language or "")
        
        voices = []
        for voice in voices_response.voices:
            # Parse voice info
            gender = self._parse_gender(voice.ssml_gender)
            quality = "neural" if "Wavenet" in voice.name or "Neural" in voice.name else "standard"
            
            voices.append(Voice(
                id=voice.name,
                name=voice.name,
                language=voice.language_codes[0],
                language_codes=list(voice.language_codes),
                gender=gender,
                provider=TTSProvider.GOOGLE_CLOUD,
                quality=quality,
                recommended="Wavenet" in voice.name
            ))
        
        return voices
    
    async def get_voice_metadata(self, voice_id: str) -> VoiceMetadata:
        """Get metadata for a Google Cloud voice"""
        
        # In a real implementation, you'd query the API
        # For now, parse from voice_id
        gender = VoiceGender.FEMALE if "-A" in voice_id or "Female" in voice_id else VoiceGender.MALE
        quality = "neural" if "Wavenet" in voice_id or "Neural" in voice_id else "standard"
        
        return VoiceMetadata(
            gender=gender,
            quality=quality,
            accent="neutral"
        )
    
    async def check_health(self) -> bool:
        """Check if Google Cloud TTS is accessible"""
        try:
            # Simple health check - list voices
            self.tts_client.list_voices(language_code="en-US")
            return True
        except Exception as e:
            print(f"Google Cloud TTS health check failed: {e}")
            return False
    
    def calculate_cost(self, characters: int) -> float:
        """
        Calculate Google Cloud TTS cost
        Pricing: $4 per 1M characters for WaveNet, $16 per 1M for Neural2
        """
        return (characters / 1_000_000) * 4.0  # Assuming WaveNet
    
    def get_supported_languages(self) -> List[str]:
        """Get supported languages"""
        return [
            "en-US", "en-GB", "en-AU", "en-IN",
            "ml-IN",  # Malayalam
            "hi-IN", "ta-IN", "te-IN",  # Other Indian languages
            "es-ES", "fr-FR", "de-DE", "it-IT", "ja-JP", "ko-KR", "zh-CN"
            # ... many more
        ]
    
    # Helper methods
    
    def _get_audio_encoding(self, format: AudioFormat):
        """Convert AudioFormat to Google Cloud encoding"""
        mapping = {
            AudioFormat.MP3: texttospeech.AudioEncoding.MP3,
            AudioFormat.WAV: texttospeech.AudioEncoding.LINEAR16,
            AudioFormat.OGG: texttospeech.AudioEncoding.OGG_OPUS,
        }
        return mapping.get(format, texttospeech.AudioEncoding.MP3)
    
    def _volume_to_db(self, volume: float) -> float:
        """Convert volume (0-2) to dB (-96 to +16)"""
        if volume <= 0:
            return -96.0
        import math
        return 20 * math.log10(volume)
    
    def _parse_gender(self, ssml_gender) -> VoiceGender:
        """Parse Google Cloud gender enum"""
        gender_map = {
            texttospeech.SsmlVoiceGender.MALE: VoiceGender.MALE,
            texttospeech.SsmlVoiceGender.FEMALE: VoiceGender.FEMALE,
            texttospeech.SsmlVoiceGender.NEUTRAL: VoiceGender.NEUTRAL,
        }
        return gender_map.get(ssml_gender, VoiceGender.NEUTRAL)
    
    async def _upload_to_gcs(self, audio_content: bytes, request: TTSRequest) -> str:
        """Upload audio to Google Cloud Storage"""
        import hashlib
        from datetime import datetime
        
        # Generate filename
        text_hash = hashlib.md5(request.text.encode()).hexdigest()[:8]
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"tts/{request.language}/{request.voice}/{timestamp}_{text_hash}.{request.format.value}"
        
        # Upload
        bucket = self.storage_client.bucket(self.bucket_name)
        blob = bucket.blob(filename)
        blob.upload_from_string(audio_content, content_type=f"audio/{request.format.value}")
        
        # Make public or generate signed URL
        blob.make_public()
        
        return blob.public_url
