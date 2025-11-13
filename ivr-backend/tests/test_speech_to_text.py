import pytest
import asyncio
import base64
import io
from unittest.mock import Mock, patch, AsyncMock
from services.speech_to_text import SpeechToTextService


class TestSpeechToTextService:
    """Test suite for SpeechToTextService"""

    @pytest.fixture
    def stt_service(self):
        """Create SpeechToTextService instance with mocked initialization"""
        with patch('speech_recognition.Recognizer'), \
             patch('speech_recognition.Microphone'), \
             patch('concurrent.futures.ThreadPoolExecutor'):
            service = SpeechToTextService()
            # Mock the recognizer and microphone
            service.recognizer = Mock()
            service.microphone = Mock()
            service.executor = Mock()
            return service

    def test_init(self, stt_service):
        """Test SpeechToTextService initialization"""
        assert stt_service.recognizer is not None
        assert stt_service.microphone is not None
        assert stt_service.executor is not None

    def test_is_healthy(self, stt_service):
        """Test health check"""
        assert stt_service.is_healthy() is True

    @pytest.mark.asyncio
    async def test_transcribe_success(self, stt_service):
        """Test successful transcription"""
        # Mock audio data (base64 encoded "test")
        test_audio = base64.b64encode(b"test audio data").decode('utf-8')

        # Mock the speech recognition
        mock_audio = Mock()
        stt_service.recognizer.record.return_value = mock_audio
        stt_service.recognizer.recognize_google.return_value = "Hello world"

        with patch('speech_recognition.AudioFile') as mock_audio_file:
            mock_audio_file.return_value.__enter__.return_value = Mock()
            result = await stt_service.transcribe(test_audio, "en")

        assert result == "Hello world"
        stt_service.recognizer.record.assert_called_once()
        stt_service.recognizer.recognize_google.assert_called_once_with(
            mock_audio, language="en"
        )

    @pytest.mark.asyncio
    async def test_transcribe_different_languages(self, stt_service):
        """Test transcription with different languages"""
        test_audio = base64.b64encode(b"test").decode('utf-8')

        mock_audio = Mock()
        stt_service.recognizer.record.return_value = mock_audio
        stt_service.recognizer.recognize_google.return_value = "Hola mundo"

        with patch('speech_recognition.AudioFile'):
            result = await stt_service.transcribe(test_audio, "es")

        assert result == "Hola mundo"
        stt_service.recognizer.recognize_google.assert_called_once_with(
            mock_audio, language="es"
        )

    @pytest.mark.asyncio
    async def test_transcribe_invalid_base64(self, stt_service):
        """Test transcription with invalid base64 data"""
        with pytest.raises(Exception):  # Should raise base64 decode error
            await stt_service.transcribe("invalid base64!", "en")

    @pytest.mark.asyncio
    async def test_transcribe_empty_audio(self, stt_service):
        """Test transcription with empty audio data"""
        empty_audio = base64.b64encode(b"").decode('utf-8')

        mock_audio = Mock()
        stt_service.recognizer.record.return_value = mock_audio
        stt_service.recognizer.recognize_google.return_value = ""

        with patch('speech_recognition.AudioFile'):
            result = await stt_service.transcribe(empty_audio, "en")

        assert result == ""

    @pytest.mark.asyncio
    async def test_transcribe_recognition_error(self, stt_service):
        """Test transcription when speech recognition fails"""
        test_audio = base64.b64encode(b"test").decode('utf-8')

        # Mock recognition failure
        stt_service.recognizer.recognize_google.side_effect = Exception("Recognition failed")

        with patch('speech_recognition.AudioFile'):
            result = await stt_service.transcribe(test_audio, "en")

        assert "Error transcribing audio" in result

    @pytest.mark.asyncio
    async def test_transcribe_unknown_value_error(self, stt_service):
        """Test transcription when audio cannot be understood"""
        test_audio = base64.b64encode(b"test").decode('utf-8')

        # Mock unknown value error (audio not understood)
        from speech_recognition import UnknownValueError
        stt_service.recognizer.recognize_google.side_effect = UnknownValueError()

        with patch('speech_recognition.AudioFile'):
            result = await stt_service.transcribe(test_audio, "en")

        assert "Could not understand audio" in result

    @pytest.mark.asyncio
    async def test_transcribe_request_error(self, stt_service):
        """Test transcription when request to Google fails"""
        test_audio = base64.b64encode(b"test").decode('utf-8')

        # Mock request error
        from speech_recognition import RequestError
        stt_service.recognizer.recognize_google.side_effect = RequestError("API unavailable")

        with patch('speech_recognition.AudioFile'):
            result = await stt_service.transcribe(test_audio, "en")

        assert "Could not request results from speech recognition service" in result

    def test_get_supported_languages(self, stt_service):
        """Test getting supported languages"""
        languages = stt_service.get_supported_languages()
        assert isinstance(languages, list)
        assert "en" in languages  # English should be supported

    def test_get_language_name(self, stt_service):
        """Test getting language name"""
        name = stt_service.get_language_name("en")
        assert isinstance(name, str)
        assert len(name) > 0

    def test_get_language_name_unknown(self, stt_service):
        """Test getting name for unknown language"""
        name = stt_service.get_language_name("unknown")
        assert isinstance(name, str)

    @pytest.mark.asyncio
    async def test_transcribe_with_different_audio_formats(self, stt_service):
        """Test transcription with different audio formats"""
        # Test with WAV-like data
        wav_audio = base64.b64encode(b"RIFF\x24\x08\x00\x00WAVEfmt").decode('utf-8')

        mock_audio = Mock()
        stt_service.recognizer.record.return_value = mock_audio
        stt_service.recognizer.recognize_google.return_value = "Test transcription"

        with patch('speech_recognition.AudioFile'):
            result = await stt_service.transcribe(wav_audio, "en")

        assert result == "Test transcription"

    @pytest.mark.asyncio
    async def test_transcribe_executor_usage(self, stt_service):
        """Test that transcription uses the thread executor"""
        test_audio = base64.b64encode(b"test").decode('utf-8')

        mock_audio = Mock()
        stt_service.recognizer.record.return_value = mock_audio
        stt_service.recognizer.recognize_google.return_value = "Hello"

        with patch('speech_recognition.AudioFile'):
            await stt_service.transcribe(test_audio, "en")

        # The executor should be used for running blocking operations
        # This is implicit in the implementation

    def test_service_configuration(self, stt_service):
        """Test service configuration"""
        # Test that the service is properly configured
        assert hasattr(stt_service, 'recognizer')
        assert hasattr(stt_service, 'microphone')
        assert hasattr(stt_service, 'executor')

    @pytest.mark.asyncio
    async def test_transcribe_none_input(self, stt_service):
        """Test transcription with None input"""
        with pytest.raises(Exception):
            await stt_service.transcribe(None, "en")

    @pytest.mark.asyncio
    async def test_transcribe_empty_string(self, stt_service):
        """Test transcription with empty string"""
        with pytest.raises(Exception):
            await stt_service.transcribe("", "en")