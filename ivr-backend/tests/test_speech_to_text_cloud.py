import sys
import pytest
import base64
from unittest.mock import Mock, patch

# Mock the speech_recognition module since it may not be available in test environment
sys.modules['speech_recognition'] = Mock()
import speech_recognition as sr

# Mock the sr module components
sr.Recognizer = Mock
sr.AudioFile = Mock
sr.UnknownValueError = Exception
sr.RequestError = Exception

from services.speech_to_text_cloud import SpeechToTextService


class TestSpeechToTextService:
    """Unit tests for SpeechToTextService"""

    def setup_method(self):
        """Setup test fixtures"""
        with patch('services.speech_to_text_cloud.sr.Recognizer'), \
             patch('services.speech_to_text_cloud.sr.AudioFile'):
            self.service = SpeechToTextService()

    def test_initialization(self):
        """Test service initialization"""
        assert self.service is not None
        assert hasattr(self.service, 'recognizer')
        assert hasattr(self.service, 'executor')

    def test_is_healthy(self):
        """Test health check"""
        assert self.service.is_healthy() is True

    def test_get_supported_languages(self):
        """Test supported languages list"""
        languages = self.service.get_supported_languages()

        assert isinstance(languages, list)
        assert "en-US" in languages
        assert "ml-IN" in languages
        assert len(languages) > 0

    @pytest.mark.asyncio
    async def test_transcribe_with_mocked_service(self):
        """Test transcription with fully mocked service"""
        with patch.object(self.service, '_transcribe_sync', return_value="Hello world"):
            audio_data = base64.b64encode(b"fake audio data").decode()
            result = await self.service.transcribe(audio_data)
            assert result == "Hello world"

    @pytest.mark.asyncio
    async def test_transcribe_malayalam_with_mocked_service(self):
        """Test Malayalam transcription with mocked service"""
        with patch.object(self.service, 'transcribe', return_value="നമസ്കാരം"):
            audio_data = base64.b64encode(b"fake audio data").decode()
            result = await self.service.transcribe_malayalam(audio_data)
            assert result == "നമസ്കാരം"

    @pytest.mark.asyncio
    async def test_transcribe_file_with_mocked_service(self):
        """Test file transcription with mocked service"""
        with patch.object(self.service, '_transcribe_file_sync', return_value="File content"):
            result = await self.service.transcribe_file("test.wav")
            assert result == "File content"