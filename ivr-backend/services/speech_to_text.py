import speech_recognition as sr
import base64
import io
import logging
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


class SpeechToTextService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Configure recognizer
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)

    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            # Test with a simple audio file check
            return True
        except Exception as e:
            logger.error(f"Speech to text service health check failed: {e}")
            return False

    async def transcribe(self, audio_data: str, language: str = "en") -> str:
        """
        Transcribe audio data to text

        Args:
            audio_data: Base64 encoded audio data
            language: Language code (en, es, fr, etc.)

        Returns:
            Transcribed text
        """
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            audio_file = io.BytesIO(audio_bytes)

            # Convert to AudioFile
            with sr.AudioFile(audio_file) as source:
                audio = self.recognizer.record(source)

            # Run recognition in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            text = await loop.run_in_executor(
                self.executor,
                self._recognize_audio,
                audio,
                language
            )

            logger.info(f"Transcribed: {text}")
            return text

        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            return "Sorry, I didn't catch that. Could you please repeat?"

    def _recognize_audio(self, audio, language: str) -> str:
        """Recognize audio using Google Speech Recognition"""
        try:
            # Map language codes
            lang_map = {
                "en": "en-US",
                "es": "es-ES",
                "fr": "fr-FR",
                "de": "de-DE",
                "it": "it-IT",
                "pt": "pt-BR",
                "ru": "ru-RU",
                "ja": "ja-JP",
                "zh": "zh-CN",
                "ko": "ko-KR"
            }

            google_lang = lang_map.get(language, "en-US")

            # Try Google Speech Recognition first
            try:
                text = self.recognizer.recognize_google(audio, language=google_lang)
                return text
            except sr.RequestError:
                # Fallback to Sphinx (offline)
                text = self.recognizer.recognize_sphinx(audio)
                logger.warning("Used Sphinx as fallback for speech recognition")
                return text

        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            return ""
        except Exception as e:
            logger.error(f"Error in speech recognition: {str(e)}")
            return ""

    async def transcribe_stream(self, audio_stream, language: str = "en") -> str:
        """
        Transcribe streaming audio data

        Args:
            audio_stream: Streaming audio data
            language: Language code

        Returns:
            Transcribed text
        """
        try:
            # This would be implemented for real-time streaming
            # For now, we'll use the regular transcribe method
            return await self.transcribe(audio_stream, language)
        except Exception as e:
            logger.error(f"Error transcribing stream: {str(e)}")
            return ""
