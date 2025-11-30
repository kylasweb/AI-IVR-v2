import pyttsx3
import base64
import io
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict, List
import tempfile
import os

logger = logging.getLogger(__name__)

# Import Google TTS service
try:
    from .google_tts_service import GoogleTTSService
    GOOGLE_TTS_AVAILABLE = True
except ImportError:
    GOOGLE_TTS_AVAILABLE = False
    logger.warning("Google TTS service not available")


class MalayalamTextToSpeechService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.voices_cache = {}
        self.malayalam_voice_id = None
        
        # Initialize Google Cloud TTS (priority)
        self.google_tts = GoogleTTSService() if GOOGLE_TTS_AVAILABLE else None
        self.use_cloud_tts = self.google_tts and self.google_tts.is_available()

        # Initialize local Malayalam TTS engine (fallback)
        self._initialize_malayalam_engine()
        
        logger.info(f"TTS Service initialized - Cloud: {self.use_cloud_tts}, Local: {self.engine is not None}")

        # Malayalam pronunciation mappings
        self.pronunciation_map = {
            # Common Malayalam words with proper pronunciation hints
            'നമസ്കാരം': 'namaskaaram',
            'സുഖം': 'sukham',
            'എങ്ങനെ': 'engane',
            'ഇരിക്കുന്നു': 'irikkunnu',
            'സഹായം': 'sahayam',
            'വേണം': 'vendam',
            'ബിൽ': 'bill',
            'പേയ്‌മെന്റ്': 'payment',
            'അപ്പോയിന്റ്മെന്റ്': 'appointment',
            'സാങ്കേതിക': 'sangketika',
            'ട്രാൻസ്ഫർ': 'transfer',
            'അതെ': 'athe',
            'അല്ല': 'alla',
            'ശരി': 'sari'
        }

        # Emotion-based speech parameters for Malayalam
        self.emotion_params = {
            'happy': {'rate': 160, 'volume': 0.95, 'pitch': 1.1},
            'sad': {'rate': 120, 'volume': 0.8, 'pitch': 0.9},
            'angry': {'rate': 180, 'volume': 1.0, 'pitch': 1.2},
            'neutral': {'rate': 150, 'volume': 0.9, 'pitch': 1.0},
            'professional': {'rate': 140, 'volume': 0.85, 'pitch': 1.0}
        }

    def _initialize_malayalam_engine(self):
        """Initialize TTS engine for Malayalam"""
        try:
            self.engine = pyttsx3.init()

            # Try to find Malayalam voice
            voices = self.engine.getProperty('voices')
            for voice in voices:
                if 'malayalam' in voice.name.lower() or 'ml' in voice.id.lower():
                    self.malayalam_voice_id = voice.id
                    self.engine.setProperty('voice', voice.id)
                    logger.info(f"Found Malayalam voice: {voice.name}")
                    break

            if not self.malayalam_voice_id:
                logger.warning("Malayalam voice not found, using default voice")
                # Use first available voice as fallback
                if voices:
                    self.malayalam_voice_id = voices[0].id
                    self.engine.setProperty('voice', voices[0].id)

            # Set default Malayalam-friendly settings
            self.engine.setProperty('rate', 140)  # Slightly slower for Malayalam
            self.engine.setProperty('volume', 0.9)

        except Exception as e:
            logger.error(f"Error initializing Malayalam TTS engine: {e}")
            self.engine = None

    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return self.engine is not None
        except Exception as e:
            logger.error(f"Malayalam text to speech service health check failed: {e}")
            return False

    async def synthesize(
            self,
            text: str,
            language: str = "ml",
            emotion: str = "neutral",
            voice_name: Optional[str] = None) -> str:
        """
        Synthesize Malayalam text to speech with cloud TTS (Google) or local fallback

        Args:
            text: Text to synthesize
            language: Language code (ml, manglish)
            emotion: Emotional tone
            voice_name: Google Cloud voice name (e.g., 'ml-IN-Wavenet-A')

        Returns:
            Base64 encoded audio data
        """
        try:
            if not text.strip():
                return ""

            # Preprocess text for better Malayalam pronunciation
            processed_text = self._preprocess_malayalam_text(text, language)
            
            # Try Google Cloud TTS first
            if self.use_cloud_tts and self.google_tts:
                try:
                    # Map emotion to speaking rate and pitch
                    emotion_settings = self.emotion_params.get(
                        emotion, self.emotion_params['neutral'])
                    
                    speaking_rate = emotion_settings['rate'] / 150.0  # Convert to Google's scale
                    pitch = (emotion_settings['pitch'] - 1.0) * 10.0  # Convert to semitones
                    
                    # Use specified voice or default
                    cloud_voice = voice_name or 'ml-IN-Wavenet-A'
                    
                    audio_data = await self.google_tts.synthesize(
                        text=processed_text,
                        voice_name=cloud_voice,
                        speaking_rate=speaking_rate,
                        pitch=pitch
                    )
                    
                    if audio_data:
                        logger.info(f"Successfully synthesized with Google Cloud TTS (voice: {cloud_voice})")
                        return audio_data
                    else:
                        logger.warning("Google Cloud TTS returned empty audio, falling back to local TTS")
                        
                except Exception as e:
                    logger.warning(f"Google Cloud TTS failed: {e}, falling back to local TTS")

            # Fallback to local TTS
            if not self.engine:
                logger.error("Both cloud and local TTS engines unavailable")
                return ""

            logger.info("Using local TTS engine")
            
            # Apply emotion settings for local TTS
            emotion_settings = self.emotion_params.get(
                emotion, self.emotion_params['neutral'])

            # Run synthesis in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            audio_data = await loop.run_in_executor(
                self.executor,
                self._synthesize_malayalam_text,
                processed_text,
                emotion_settings
            )

            return audio_data

        except Exception as e:
            logger.error(f"Error synthesizing Malayalam speech: {str(e)}")
            return ""

    def _preprocess_malayalam_text(self, text: str, language: str) -> str:
        """Preprocess text for better Malayalam pronunciation"""
        if language == "manglish":
            # Convert Manglish to proper Malayalam
            text = self._manglish_to_malayalam(text)

        # Add pronunciation pauses for better Malayalam flow
        text = self._add_pronunciation_pauses(text)

        return text

    def _manglish_to_malayalam(self, text: str) -> str:
        """Convert Manglish text to Malayalam"""
        manglish_map = {
            'namaskaram': 'നമസ്കാരം',
            'hai': 'ഹായ്',
            'sukham': 'സുഖം',
            'engane': 'എങ്ങനെ',
            'irikkunnu': 'ഇരിക്കുന്നു',
            'sahayam': 'സഹായം',
            'vendam': 'വേണം',
            'athe': 'അതെ',
            'alla': 'അല്ല',
            'sari': 'ശരി',
            'bill': 'ബിൽ',
            'payment': 'പേയ്‌മെന്റ്',
            'appointment': 'അപ്പോയിന്റ്മെന്റ്',
            'technical': 'സാങ്കേതിക',
            'transfer': 'ട്രാൻസ്ഫർ',
            'help': 'സഹായം',
            'problem': 'പ്രശ്നം',
            'issue': 'പ്രശ്നം'
        }

        text_lower = text.lower()
        for manglish, malayalam in manglish_map.items():
            text_lower = text_lower.replace(manglish, malayalam)

        return text_lower

    def _add_pronunciation_pauses(self, text: str) -> str:
        """Add pauses for better Malayalam pronunciation"""
        # Add commas after common Malayalam conjunctions
        conjunctions = ['എന്നും', 'ആയി', 'ഉം', 'മാത്രം', 'എന്നാൽ']
        for conj in conjunctions:
            text = text.replace(conj, f"{conj},")

        # Add pauses at question marks
        text = text.replace('?', '.,')
        text = text.replace('?', '.')

        return text

    def _synthesize_malayalam_text(self, text: str, emotion_settings: Dict) -> str:
        """Synthesize Malayalam text using pyttsx3"""
        try:
            # Create temporary engine instance for thread safety
            temp_engine = pyttsx3.init()

            # Set voice
            if self.malayalam_voice_id:
                temp_engine.setProperty('voice', self.malayalam_voice_id)

            # Apply emotion settings
            temp_engine.setProperty('rate', emotion_settings['rate'])
            temp_engine.setProperty('volume', emotion_settings['volume'])

            # Save to temporary file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_filename = temp_file.name

            temp_engine.save_to_file(text, temp_filename)
            temp_engine.runAndWait()

            # Read the file and encode to base64
            with open(temp_filename, 'rb') as f:
                audio_bytes = f.read()

            # Clean up
            os.unlink(temp_filename)
            temp_engine.stop()

            return base64.b64encode(audio_bytes).decode('utf-8')

        except Exception as e:
            logger.error(f"Error in Malayalam text synthesis: {str(e)}")
            return ""

    async def synthesize_with_dialect(
            self,
            text: str,
            dialect: str = "standard",
            emotion: str = "neutral") -> str:
        """
        Synthesize text with specific Malayalam dialect

        Args:
            text: Text to synthesize
            dialect: Malayalam dialect (travancore, malabar, cochin, standard)
            emotion: Emotional tone

        Returns:
            Base64 encoded audio data
        """
        try:
            # Adjust text based on dialect
            dialect_text = self._apply_dialect_variations(text, dialect)

            # Adjust speech parameters based on dialect
            dialect_emotion = self._get_dialect_emotion_settings(dialect, emotion)

            return await self.synthesize(dialect_text, "ml", dialect_emotion)

        except Exception as e:
            logger.error(f"Error synthesizing with dialect: {str(e)}")
            return await self.synthesize(text, "ml", emotion)

    def _apply_dialect_variations(self, text: str, dialect: str) -> str:
        """Apply dialect-specific variations to text"""
        dialect_variations = {
            'travancore': {
                'നിങ്ങൾ': 'നിങ്ങൾ',
                'അവർ': 'അവർ',
                'വരുന്നു': 'വരുന്നു'
            },
            'malabar': {
                'നിങ്ങൾ': 'നിങ്ങളെ',
                'അവർ': 'അവർ',
                'വരുന്നു': 'വരുന്നു'
            },
            'cochin': {
                'നിങ്ങൾ': 'നിങ്ങളെ',
                'അവർ': 'അവർ',
                'വരുന്നു': 'വരുന്നു'
            }
        }

        if dialect in dialect_variations:
            variations = dialect_variations[dialect]
            for standard, dialect_variant in variations.items():
                text = text.replace(standard, dialect_variant)

        return text

    def _get_dialect_emotion_settings(self, dialect: str, emotion: str) -> str:
        """Get emotion settings adjusted for dialect"""
        base_emotion = self.emotion_params.get(emotion, self.emotion_params['neutral'])

        # Adjust speech rate based on dialect
        dialect_adjustments = {
            'travancore': {'rate_adjust': -10},  # Slightly slower
            'malabar': {'rate_adjust': 5},       # Slightly faster
            'cochin': {'rate_adjust': 0},        # Standard
            'standard': {'rate_adjust': 0}
        }

        adjustment = dialect_adjustments.get(dialect, {'rate_adjust': 0})
        adjusted_emotion = base_emotion.copy()
        adjusted_emotion['rate'] += adjustment['rate_adjust']

        return emotion  # Return original emotion name for simplicity

    async def create_malayalam_audio_library(self) -> Dict[str, str]:
        """Create a library of common Malayalam phrases"""
        common_phrases = {
            'greeting': 'നമസ്കാരം, എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
            'help_response': 'ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?',
            'billing_menu': 'ബിൽ അന്വേഷണങ്ങൾക്ക് ഒന്ന് അമർത്തുക',
            'technical_menu': 'സാങ്കേതിക പിന്തുണയ്ക്ക് രണ്ട് അമർത്തുക',
            'appointment_menu': 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ മൂന്ന് അമർത്തുക',
            'transfer_menu': 'ഉദ്യോഗസ്ഥനെ സംസാരിക്കാൻ പൂജ്യം അമർത്തുക',
            'goodbye': 'വിളിച്ചതിന് നന്ദി. വീണ്ടും കാണാം!',
            'error_message': 'ക്ഷമിക്കണം, എനിക്ക് മനസ്സിലായില്ല. ദയവായി വീണ്ടും പറയാമോ?',
            'confirmation': 'ശരി, ഞാൻ സഹായിക്കാം',
            'thanks': 'നന്ദി'}

        audio_library = {}
        for key, phrase in common_phrases.items():
            audio_data = await self.synthesize(phrase, "ml", "professional")
            audio_library[key] = audio_data

        return audio_library

    def get_malayalam_voice_settings(self) -> Dict:
        """Get current Malayalam voice settings"""
        return {
            'voice_id': self.malayalam_voice_id,
            'available_emotions': list(self.emotion_params.keys()),
            'supported_dialects': ['travancore', 'malabar', 'cochin', 'standard'],
            'default_settings': {
                'rate': 140,
                'volume': 0.9,
                'pitch': 1.0
            }
        }

    def update_malayalam_voice_settings(self, settings: Dict):
        """Update Malayalam voice settings"""
        try:
            if self.engine and settings:
                if 'rate' in settings:
                    self.engine.setProperty('rate', settings['rate'])
                if 'volume' in settings:
                    self.engine.setProperty('volume', settings['volume'])
                if 'voice_id' in settings:
                    self.engine.setProperty('voice', settings['voice_id'])
                    self.malayalam_voice_id = settings['voice_id']

                logger.info(f"Updated Malayalam voice settings: {settings}")
        except Exception as e:
            logger.error(f"Error updating Malayalam voice settings: {e}")
    
    def get_all_available_voices(self) -> Dict:
        """Get all available voices from cloud and local TTS"""
        voices = {
            'cloud_voices': [],
            'local_voices': [],
            'cloud_available': self.use_cloud_tts,
            'local_available': self.engine is not None
        }
        
        # Get Google Cloud voices
        if self.google_tts and self.use_cloud_tts:
            try:
                voices['cloud_voices'] = self.google_tts.get_available_voices()
            except Exception as e:
                logger.error(f"Error getting cloud voices: {e}")
        
        # Get local voices
        if self.engine:
            try:
                local_voices = self.engine.getProperty('voices')
                voices['local_voices'] = [
                    {
                        'id': voice.id,
                        'name': voice.name,
                        'languages': voice.languages
                    }
                    for voice in local_voices
                ]
            except Exception as e:
                logger.error(f"Error getting local voices: {e}")
        
        return voices
    
    def get_service_status(self) -> Dict:
        """Get current TTS service status"""
        return {
            'cloud_tts_enabled': self.use_cloud_tts,
            'cloud_tts_available': self.google_tts is not None and self.google_tts.is_available(),
            'local_tts_available': self.engine is not None,
            'malayalam_voice_id': self.malayalam_voice_id,
            'primary_service': 'google_cloud' if self.use_cloud_tts else 'local_pyttsx3'
        }
