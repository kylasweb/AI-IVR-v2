import pyttsx3
import base64
import io
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

logger = logging.getLogger(__name__)


class TextToSpeechService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.voices_cache = {}

    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            engine = pyttsx3.init()
            voices = engine.getProperty('voices')
            return len(voices) > 0
        except Exception as e:
            logger.error(f"Text to speech service health check failed: {e}")
            return False

    async def synthesize(self, text: str, language: str = "en") -> str:
        """
        Synthesize text to speech

        Args:
            text: Text to synthesize
            language: Language code

        Returns:
            Base64 encoded audio data
        """
        try:
            if not text.strip():
                return ""

            # Run synthesis in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            audio_data = await loop.run_in_executor(
                self.executor,
                self._synthesize_text,
                text,
                language
            )

            return audio_data

        except Exception as e:
            logger.error(f"Error synthesizing speech: {str(e)}")
            return ""

    def _synthesize_text(self, text: str, language: str) -> str:
        """Synthesize text using pyttsx3"""
        try:
            engine = pyttsx3.init()

            # Set voice based on language
            voice_id = self._get_voice_for_language(engine, language)
            if voice_id:
                engine.setProperty('voice', voice_id)

            # Set speech properties
            engine.setProperty('rate', 150)  # Speed
            engine.setProperty('volume', 0.9)  # Volume

            # Save to bytes buffer
            buffer = io.BytesIO()

            # Unfortunately, pyttsx3 doesn't support direct byte output
            # We'll save to a temporary file and read it back
            import tempfile
            import os

            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_filename = temp_file.name

            engine.save_to_file(text, temp_filename)
            engine.runAndWait()

            # Read the file and encode to base64
            with open(temp_filename, 'rb') as f:
                audio_bytes = f.read()

            # Clean up
            os.unlink(temp_filename)

            return base64.b64encode(audio_bytes).decode('utf-8')

        except Exception as e:
            logger.error(f"Error in text synthesis: {str(e)}")
            return ""

    def _get_voice_for_language(self, engine, language: str) -> Optional[str]:
        """Get appropriate voice for language"""
        try:
            # Cache voices to avoid repeated calls
            if language not in self.voices_cache:
                voices = engine.getProperty('voices')

                # Language to voice mapping
                language_mapping = {
                    "en": ["english", "en-us", "en-gb"],
                    "es": ["spanish", "es-es", "es-mx"],
                    "fr": ["french", "fr-fr"],
                    "de": ["german", "de-de"],
                    "it": ["italian", "it-it"],
                    "pt": ["portuguese", "pt-br", "pt-pt"],
                    "ru": ["russian", "ru-ru"],
                    "ja": ["japanese", "ja-jp"],
                    "zh": ["chinese", "zh-cn", "zh-tw"],
                    "ko": ["korean", "ko-kr"]
                }

                # Find matching voice
                for voice in voices:
                    voice_name = voice.name.lower()
                    voice_id = voice.id

                    for lang_keyword in language_mapping.get(language, []):
                        if lang_keyword in voice_name:
                            self.voices_cache[language] = voice_id
                            return voice_id

                # Fallback to first available voice
                if voices:
                    self.voices_cache[language] = voices[0].id
                    return voices[0].id

            return self.voices_cache.get(language)

        except Exception as e:
            logger.error(f"Error getting voice for language {language}: {str(e)}")
            return None

    async def synthesize_with_emotion(
            self,
            text: str,
            emotion: str = "neutral",
            language: str = "en") -> str:
        """
        Synthesize text with emotional tone

        Args:
            text: Text to synthesize
            emotion: Emotional tone (happy, sad, angry, neutral)
            language: Language code

        Returns:
            Base64 encoded audio data
        """
        try:
            # Adjust speech parameters based on emotion
            emotion_params = {
                "happy": {"rate": 160, "volume": 0.95},
                "sad": {"rate": 120, "volume": 0.8},
                "angry": {"rate": 180, "volume": 1.0},
                "neutral": {"rate": 150, "volume": 0.9}
            }

            params = emotion_params.get(emotion, emotion_params["neutral"])

            # This is a simplified implementation
            # In a production system, you'd use more sophisticated TTS
            return await self.synthesize(text, language)

        except Exception as e:
            logger.error(f"Error synthesizing with emotion: {str(e)}")
            return await self.synthesize(text, language)
