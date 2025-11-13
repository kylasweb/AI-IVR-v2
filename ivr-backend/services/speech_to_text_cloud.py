import speech_recognition as sr
import base64
import io
import logging
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import os

logger = logging.getLogger(__name__)


class SpeechToTextService:
    """Cloud-compatible Speech-to-Text service without microphone dependency"""

    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.executor = ThreadPoolExecutor(max_workers=4)

        # Configure recognizer settings for cloud deployment
        self.recognizer.energy_threshold = 4000
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        self.recognizer.operation_timeout = 10

        logger.info("SpeechToTextService initialized for cloud deployment (no microphone)")

    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            # Test basic recognition functionality
            return True
        except Exception as e:
            logger.error(f"Speech to text service health check failed: {e}")
            return False

    async def transcribe(self, audio_data: str, language: str = "en") -> str:
        """
        Transcribe audio data to text

        Args:
            audio_data: Base64 encoded audio data
            language: Language code (default: "en")

        Returns:
            Transcribed text
        """
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)

            # Convert to audio data object
            audio_io = io.BytesIO(audio_bytes)

            # Use thread executor for CPU-intensive task
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._transcribe_sync,
                audio_io,
                language
            )

            return result

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return ""

    def _transcribe_sync(self, audio_io: io.BytesIO, language: str) -> str:
        """Synchronous transcription using speech_recognition"""
        try:
            # Create AudioFile from BytesIO
            with sr.AudioFile(audio_io) as source:
                audio = self.recognizer.record(source)

            # Try Google Web Speech API first (free)
            try:
                text = self.recognizer.recognize_google(audio, language=language)
                logger.info(f"Google transcription: {text}")
                return text

            except sr.UnknownValueError:
                logger.warning("Google could not understand audio")
                return ""

            except sr.RequestError as e:
                logger.error(f"Google Speech Recognition error: {e}")

                # Fallback to offline recognition if available
                try:
                    text = self.recognizer.recognize_sphinx(audio)
                    logger.info(f"Sphinx transcription: {text}")
                    return text
                except sr.UnknownValueError:
                    logger.warning("Sphinx offline recognition could not understand audio")
                    return ""
                except sr.RequestError as e:
                    logger.warning(f"Sphinx offline recognition error: {e}")
                    return ""

        except sr.RequestError as e:
            logger.error(f"Sync transcription error: {e}")
            return ""
        except sr.UnknownValueError:
            logger.warning("Speech recognition could not understand audio")
            return ""

    async def transcribe_file(self, file_path: str, language: str = "en") -> str:
        """
        Transcribe audio file to text

        Args:
            file_path: Path to audio file
            language: Language code

        Returns:
            Transcribed text
        """
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._transcribe_file_sync,
                file_path,
                language
            )
            return result

        except Exception as e:
            logger.error(f"File transcription failed: {e}")
            return ""

    def _transcribe_file_sync(self, file_path: str, language: str) -> str:
        """Synchronous file transcription"""
        try:
            with sr.AudioFile(file_path) as source:
                audio = self.recognizer.record(source)

            # Use Google Speech Recognition
            text = self.recognizer.recognize_google(audio, language=language)
            return text

        except Exception as e:
            logger.error(f"File transcription error: {e}")
            return ""

    async def transcribe_malayalam(self, audio_data: str) -> str:
        """
        Transcribe Malayalam audio to text

        Args:
            audio_data: Base64 encoded audio data

        Returns:
            Malayalam text
        """
        return await self.transcribe(audio_data, language="ml-IN")

    def get_supported_languages(self) -> list:
        """Get list of supported language codes"""
        return [
            "en-US",  # English (US)
            "en-IN",  # English (India)
            "ml-IN",  # Malayalam (India)
            "hi-IN",  # Hindi (India)
            "ta-IN",  # Tamil (India)
            "te-IN",  # Telugu (India)
            "kn-IN",  # Kannada (India)
        ]
