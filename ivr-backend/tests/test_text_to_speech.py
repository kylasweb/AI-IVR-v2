import pytest
import asyncio
import base64
from unittest.mock import Mock, patch, AsyncMock
from services.text_to_speech import TextToSpeechService


class TestTextToSpeechService:
    """Test suite for TextToSpeechService"""

    @pytest.fixture
    def tts_service(self):
        """Create TextToSpeechService instance with mocked initialization"""
        with patch('concurrent.futures.ThreadPoolExecutor'):
            service = TextToSpeechService()
            service.executor = Mock()
            service.voices_cache = {}
            return service

    def test_init(self, tts_service):
        """Test TextToSpeechService initialization"""
        assert tts_service.executor is not None
        assert tts_service.voices_cache == {}

    def test_is_healthy_success(self, tts_service):
        """Test health check when service is healthy"""
        mock_engine = Mock()
        mock_engine.getProperty.return_value = [Mock(), Mock()]  # Two voices

        with patch('pyttsx3.init', return_value=mock_engine):
            assert tts_service.is_healthy() is True

    def test_is_healthy_no_voices(self, tts_service):
        """Test health check when no voices available"""
        mock_engine = Mock()
        mock_engine.getProperty.return_value = []  # No voices

        with patch('pyttsx3.init', return_value=mock_engine):
            assert tts_service.is_healthy() is False

    def test_is_healthy_exception(self, tts_service):
        """Test health check when exception occurs"""
        with patch('pyttsx3.init', side_effect=Exception("Init failed")):
            assert tts_service.is_healthy() is False

    @pytest.mark.asyncio
    async def test_synthesize_success(self, tts_service):
        """Test successful text synthesis"""
        test_text = "Hello world"
        expected_b64 = "ZmFrZSBhdWRpbyBkYXRh"  # base64 of "fake audio data"

        # Mock the _synthesize_text method
        tts_service._synthesize_text = Mock(return_value=expected_b64)

        with patch('asyncio.get_event_loop') as mock_loop:
            # Mock run_in_executor to actually call the function
            async def mock_run_in_executor(executor, func, *args):
                return func(*args)
            mock_loop.return_value.run_in_executor = mock_run_in_executor

            result = await tts_service.synthesize(test_text, "en")

        assert result == expected_b64
        tts_service._synthesize_text.assert_called_once_with(test_text, "en")

    @pytest.mark.asyncio
    async def test_synthesize_empty_text(self, tts_service):
        """Test synthesis with empty text"""
        result = await tts_service.synthesize("", "en")
        assert result == ""

    @pytest.mark.asyncio
    async def test_synthesize_whitespace_only(self, tts_service):
        """Test synthesis with whitespace-only text"""
        result = await tts_service.synthesize("   ", "en")
        assert result == ""

    @pytest.mark.asyncio
    async def test_synthesize_different_languages(self, tts_service):
        """Test synthesis with different languages"""
        test_text = "Hola mundo"
        expected_b64 = "c3BhbmlzaCBhdWRpbw=="  # base64 of "spanish audio"

        tts_service._synthesize_text = Mock(return_value=expected_b64)

        with patch('asyncio.get_event_loop') as mock_loop:
            async def mock_run_in_executor(executor, func, *args):
                return func(*args)
            mock_loop.return_value.run_in_executor = mock_run_in_executor

            result = await tts_service.synthesize(test_text, "es")

        assert isinstance(result, str)
        assert result == expected_b64
        tts_service._synthesize_text.assert_called_once_with(test_text, "es")

    @pytest.mark.asyncio
    async def test_synthesize_executor_error(self, tts_service):
        """Test synthesis when executor fails"""
        # Mock the executor to raise exception
        with patch('asyncio.get_event_loop') as mock_loop:
            mock_loop.return_value.run_in_executor.side_effect = Exception("Synthesis failed")

            result = await tts_service.synthesize("test", "en")

        # Should return empty string on error
        assert result == ""

    def test_synthesize_text_method(self, tts_service):
        """Test the _synthesize_text method"""
        expected_b64 = "YXVkaW8gZGF0YQ=="  # base64 of "audio data"

        with patch('pyttsx3.init') as mock_init, \
             patch('tempfile.NamedTemporaryFile') as mock_temp, \
             patch('os.unlink') as mock_unlink, \
             patch('builtins.open', create=True) as mock_open:

            mock_engine = Mock()
            mock_init.return_value = mock_engine

            # Mock temporary file
            mock_temp_file = Mock()
            mock_temp_file.name = "temp.wav"
            mock_temp.return_value.__enter__.return_value = mock_temp_file

            # Mock file reading
            mock_file = Mock()
            mock_file.read.return_value = b"audio data"
            mock_open.return_value.__enter__.return_value = mock_file

            result = tts_service._synthesize_text("Hello", "en")

        assert result == expected_b64
        mock_engine.save_to_file.assert_called_once_with("Hello", "temp.wav")
        mock_engine.runAndWait.assert_called_once()
        mock_unlink.assert_called_once_with("temp.wav")

    def test_synthesize_text_with_voice_selection(self, tts_service):
        """Test text synthesis with voice selection"""
        expected_b64 = "YXVkaW8gZGF0YQ=="  # base64 of "audio data"

        mock_voice = Mock()
        mock_voice.id = "english_voice"
        mock_voice.name = "English Voice"

        with patch('pyttsx3.init') as mock_init, \
             patch('tempfile.NamedTemporaryFile') as mock_temp, \
             patch('os.unlink') as mock_unlink, \
             patch('builtins.open', create=True) as mock_open:

            mock_engine = Mock()
            mock_engine.getProperty.return_value = [mock_voice]
            mock_init.return_value = mock_engine

            # Mock temporary file
            mock_temp_file = Mock()
            mock_temp_file.name = "temp.wav"
            mock_temp.return_value.__enter__.return_value = mock_temp_file

            # Mock file reading
            mock_file = Mock()
            mock_file.read.return_value = b"audio data"
            mock_open.return_value.__enter__.return_value = mock_file

            result = tts_service._synthesize_text("Hello", "en")

        assert result == expected_b64
        mock_engine.setProperty.assert_any_call('voice', 'english_voice')

    @pytest.mark.asyncio
    async def test_synthesize_long_text(self, tts_service):
        """Test synthesis of long text"""
        long_text = "This is a very long text that should still be synthesized properly. " * 10
        expected_b64 = "bG9uZyBhdWRpbyBkYXRh"  # base64 of "long audio data"

        tts_service._synthesize_text = Mock(return_value=expected_b64)

        with patch('asyncio.get_event_loop') as mock_loop:
            mock_loop.return_value.run_in_executor = AsyncMock(return_value=expected_b64)

            result = await tts_service.synthesize(long_text, "en")

        assert isinstance(result, str)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_synthesize_special_characters(self, tts_service):
        """Test synthesis with special characters"""
        special_text = "Hello @#$%^&*()!~"
        expected_b64 = "c3BlY2lhbCBhdWRpbw=="  # base64 of "special audio"

        tts_service._synthesize_text = Mock(return_value=expected_b64)

        result = await tts_service.synthesize(special_text, "en")

        assert isinstance(result, str)

    def test_synthesize_text_empty_result(self, tts_service):
        """Test when synthesis returns empty audio"""
        with patch('pyttsx3.init') as mock_init, \
             patch('tempfile.NamedTemporaryFile') as mock_temp, \
             patch('os.unlink') as mock_unlink, \
             patch('builtins.open', create=True) as mock_open:

            mock_engine = Mock()
            mock_init.return_value = mock_engine

            # Mock temporary file
            mock_temp_file = Mock()
            mock_temp_file.name = "temp.wav"
            mock_temp.return_value.__enter__.return_value = mock_temp_file

            # Mock file reading (empty file)
            mock_file = Mock()
            mock_file.read.return_value = b""
            mock_open.return_value.__enter__.return_value = mock_file

            result = tts_service._synthesize_text("Hello", "en")

        assert result == ""