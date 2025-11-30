import os
import logging
import base64
from typing import Optional, Dict, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

try:
    from google.cloud import texttospeech
    from google.oauth2 import service_account
    GOOGLE_TTS_AVAILABLE = True
except ImportError:
    GOOGLE_TTS_AVAILABLE = False
    logger.warning("Google Cloud TTS SDK not available. Install with: pip install google-cloud-texttospeech")


class GoogleTTSService:
    """
    Google Cloud Text-to-Speech service for high-quality Malayalam voice synthesis
    """
    
    def __init__(self):
        self.client = None
        self.enabled = False
        self.cache = {}
        self.cache_max_age = timedelta(hours=1)
        
        # Malayalam voice configurations
        self.malayalam_voices = {
            'ml-IN-Standard-A': {
                'name': 'ml-IN-Standard-A',
                'language_code': 'ml-IN',
                'ssml_gender': texttospeech.SsmlVoiceGender.FEMALE if GOOGLE_TTS_AVAILABLE else 'FEMALE',
                'description': 'Standard Malayalam Female Voice',
                'quality': 'standard',
                'gender': 'female'
            },
            'ml-IN-Standard-B': {
                'name': 'ml-IN-Standard-B',
                'language_code': 'ml-IN',
                'ssml_gender': texttospeech.SsmlVoiceGender.MALE if GOOGLE_TTS_AVAILABLE else 'MALE',
                'description': 'Standard Malayalam Male Voice',
                'quality': 'standard',
                'gender': 'male'
            },
            'ml-IN-Wavenet-A': {
                'name': 'ml-IN-Wavenet-A',
                'language_code': 'ml-IN',
                'ssml_gender': texttospeech.SsmlVoiceGender.FEMALE if GOOGLE_TTS_AVAILABLE else 'FEMALE',
                'description': 'Neural Malayalam Female Voice (High Quality)',
                'quality': 'wavenet',
                'gender': 'female'
            },
            'ml-IN-Wavenet-B': {
                'name': 'ml-IN-Wavenet-B',
                'language_code': 'ml-IN',
                'ssml_gender': texttospeech.SsmlVoiceGender.MALE if GOOGLE_TTS_AVAILABLE else 'MALE',
                'description': 'Neural Malayalam Male Voice (High Quality)',
                'quality': 'wavenet',
                'gender': 'male'
            }
        }
        
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Google Cloud TTS client"""
        if not GOOGLE_TTS_AVAILABLE:
            logger.warning("Google Cloud TTS SDK not installed")
            return
        
        try:
            # Check if Google Cloud credentials are configured
            api_key = os.getenv('GOOGLE_CLOUD_TTS_API_KEY')
            credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            enabled = os.getenv('GOOGLE_CLOUD_TTS_ENABLED', 'false').lower() == 'true'
            
            if not enabled:
                logger.info("Google Cloud TTS is disabled in configuration")
                return
            
            if credentials_path and os.path.exists(credentials_path):
                # Use service account credentials
                credentials = service_account.Credentials.from_service_account_file(
                    credentials_path
                )
                self.client = texttospeech.TextToSpeechClient(credentials=credentials)
                self.enabled = True
                logger.info("Google Cloud TTS initialized with service account credentials")
            elif api_key:
                # Use API key (if supported)
                self.client = texttospeech.TextToSpeechClient()
                self.enabled = True
                logger.info("Google Cloud TTS initialized with API key")
            else:
                # Try default credentials
                self.client = texttospeech.TextToSpeechClient()
                self.enabled = True
                logger.info("Google Cloud TTS initialized with default credentials")
                
        except Exception as e:
            logger.warning(f"Could not initialize Google Cloud TTS: {e}")
            logger.info("Falling back to local TTS. To use Google Cloud TTS, set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_TTS_API_KEY")
            self.enabled = False
    
    def is_available(self) -> bool:
        """Check if Google Cloud TTS is available and configured"""
        return self.enabled and self.client is not None
    
    async def synthesize(
        self,
        text: str,
        voice_name: str = 'ml-IN-Wavenet-A',
        speaking_rate: float = 1.0,
        pitch: float = 0.0,
        volume_gain_db: float = 0.0,
        use_ssml: bool = False
    ) -> Optional[str]:
        """
        Synthesize Malayalam text to speech using Google Cloud TTS
        
        Args:
            text: Text to synthesize (Malayalam, Manglish, or English)
            voice_name: Voice to use (default: ml-IN-Wavenet-A)
            speaking_rate: Speaking rate (0.25 to 4.0, default: 1.0)
            pitch: Voice pitch (-20.0 to 20.0, default: 0.0)
            volume_gain_db: Volume adjustment (-96.0 to 16.0, default: 0.0)
            use_ssml: Whether text is SSML formatted
            
        Returns:
            Base64 encoded audio data (MP3 format)
        """
        if not self.is_available():
            return None
        
        try:
            # Check cache
            cache_key = f"{voice_name}:{text}:{speaking_rate}:{pitch}"
            if cache_key in self.cache:
                cached_item = self.cache[cache_key]
                if datetime.now() - cached_item['timestamp'] < self.cache_max_age:
                    logger.debug(f"Returning cached audio for: {text[:50]}...")
                    return cached_item['audio']
            
            # Get voice configuration
            voice_config = self.malayalam_voices.get(voice_name)
            if not voice_config:
                logger.warning(f"Voice {voice_name} not found, using default")
                voice_name = 'ml-IN-Wavenet-A'
                voice_config = self.malayalam_voices[voice_name]
            
            # Set up synthesis input
            if use_ssml:
                synthesis_input = texttospeech.SynthesisInput(ssml=text)
            else:
                synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configure voice parameters
            voice = texttospeech.VoiceSelectionParams(
                language_code=voice_config['language_code'],
                name=voice_config['name'],
                ssml_gender=voice_config['ssml_gender']
            )
            
            # Configure audio output
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate,
                pitch=pitch,
                volume_gain_db=volume_gain_db,
                sample_rate_hertz=24000
            )
            
            # Perform text-to-speech synthesis
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            # Encode audio to base64
            audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
            
            # Cache the result
            self.cache[cache_key] = {
                'audio': audio_base64,
                'timestamp': datetime.now()
            }
            
            logger.info(f"Successfully synthesized {len(text)} characters with voice {voice_name}")
            return audio_base64
            
        except Exception as e:
            logger.error(f"Error synthesizing speech with Google Cloud TTS: {e}")
            return None
    
    def create_ssml(
        self,
        text: str,
        emphasis: Optional[str] = None,
        break_time: Optional[str] = None,
        prosody_rate: Optional[str] = None,
        prosody_pitch: Optional[str] = None
    ) -> str:
        """
        Create SSML formatted text for advanced speech control
        
        Args:
            text: Text to format
            emphasis: Emphasis level ('strong', 'moderate', 'reduced', 'none')
            break_time: Pause duration (e.g., '500ms', '1s')
            prosody_rate: Speaking rate ('x-slow', 'slow', 'medium', 'fast', 'x-fast')
            prosody_pitch: Pitch ('x-low', 'low', 'medium', 'high', 'x-high')
            
        Returns:
            SSML formatted text
        """
        ssml_parts = ['<speak>']
        
        if prosody_rate or prosody_pitch:
            prosody_attrs = []
            if prosody_rate:
                prosody_attrs.append(f'rate="{prosody_rate}"')
            if prosody_pitch:
                prosody_attrs.append(f'pitch="{prosody_pitch}"')
            ssml_parts.append(f'<prosody {" ".join(prosody_attrs)}>')
        
        if emphasis:
            ssml_parts.append(f'<emphasis level="{emphasis}">')
        
        ssml_parts.append(text)
        
        if emphasis:
            ssml_parts.append('</emphasis>')
        
        if break_time:
            ssml_parts.append(f'<break time="{break_time}"/>')
        
        if prosody_rate or prosody_pitch:
            ssml_parts.append('</prosody>')
        
        ssml_parts.append('</speak>')
        
        return ''.join(ssml_parts)
    
    def get_available_voices(self) -> List[Dict]:
        """Get list of available Malayalam voices"""
        return [
            {
                'id': voice_id,
                'name': config['description'],
                'gender': config['gender'],
                'quality': config['quality'],
                'language': 'Malayalam (ml-IN)'
            }
            for voice_id, config in self.malayalam_voices.items()
        ]
    
    def clear_cache(self):
        """Clear the audio cache"""
        self.cache.clear()
        logger.info("Audio cache cleared")
    
    def get_cache_stats(self) -> Dict:
        """Get cache statistics"""
        return {
            'total_entries': len(self.cache),
            'cache_max_age_hours': self.cache_max_age.total_seconds() / 3600
        }
