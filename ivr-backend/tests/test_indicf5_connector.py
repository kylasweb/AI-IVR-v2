"""
Unit tests for IndicF5 TTS Connector

Tests the IndicF5 connector for:
- Initialization and device detection
- Reference audio loading
- Synthesis functionality (mocked)
- Health check functionality
- Error handling
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from pathlib import Path


class TestIndicF5Connector:
    """Test suite for IndicF5Connector"""

    @pytest.fixture
    def connector_config(self):
        """Default connector configuration"""
        return {
            'enabled': True,
            'device': 'cpu',
            'reference_audio_dir': 'models/reference_audios',
            'cache_dir': './models/indicf5_cache',
            'sample_rate': 24000
        }

    @pytest.fixture
    def mock_connector(self, connector_config):
        """Create connector with mocked dependencies"""
        with patch('ai.connectors.indicf5_connector.IndicF5Connector._load_model', return_value=True):
            from ai.connectors.indicf5_connector import IndicF5Connector
            connector = IndicF5Connector(connector_config)
            connector.model = Mock()
            connector.initialized = True
            return connector

    def test_init_with_config(self, connector_config):
        """Test connector initialization with config"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector(connector_config)
        
        assert connector.enabled == True
        assert connector.device_preference == 'cpu'
        assert connector.sample_rate == 24000
        assert connector.initialized == False  # Not yet initialized

    def test_init_disabled(self):
        """Test connector with disabled flag"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({'enabled': False})
        
        assert connector.enabled == False

    def test_device_detection_cpu(self):
        """Test device detection falls back to CPU when no CUDA"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({'device': 'auto'})
        
        with patch.dict('sys.modules', {'torch': Mock(cuda=Mock(is_available=Mock(return_value=False)))}):
            device = connector._detect_device()
            assert device == 'cpu'

    def test_device_detection_forced_cpu(self):
        """Test device detection respects forced CPU setting"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({'device': 'cpu'})
        device = connector._detect_device()
        
        assert device == 'cpu'

    def test_supported_languages(self):
        """Test supported languages constant"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({})
        
        assert 'ml' in connector.SUPPORTED_LANGUAGES
        assert 'ta' in connector.SUPPORTED_LANGUAGES
        assert 'hi' in connector.SUPPORTED_LANGUAGES

    def test_kerala_dialects(self):
        """Test Kerala dialect mappings"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({})
        
        # Check all 14 districts
        assert 'thiruvananthapuram' in connector.KERALA_DIALECTS
        assert 'ernakulam' in connector.KERALA_DIALECTS
        assert 'kozhikode' in connector.KERALA_DIALECTS
        assert 'kasaragod' in connector.KERALA_DIALECTS
        
        # Check aliases
        assert 'travancore' in connector.KERALA_DIALECTS
        assert 'malabar' in connector.KERALA_DIALECTS
        assert 'cochin' in connector.KERALA_DIALECTS

    def test_get_supported_dialects(self, mock_connector):
        """Test getting supported dialects"""
        dialects = mock_connector.get_supported_dialects()
        
        assert isinstance(dialects, list)
        assert len(dialects) > 0
        assert 'ernakulam' in dialects

    @pytest.mark.asyncio
    async def test_synthesize_success(self, mock_connector):
        """Test successful synthesis"""
        import numpy as np
        
        # Mock model output
        mock_connector.model.return_value = np.array([0.1, 0.2, 0.3], dtype=np.float32)
        
        with patch.object(mock_connector, '_synthesize_sync', return_value='base64_audio_data'):
            with patch('asyncio.get_event_loop') as mock_loop:
                mock_loop.return_value.run_in_executor = AsyncMock(return_value='base64_audio_data')
                
                result = await mock_connector.synthesize(
                    text="നമസ്കാരം",
                    language='ml',
                    dialect='ernakulam'
                )
        
        assert result['provider'] == 'indicf5'
        assert result['language'] == 'ml'
        assert result['dialect'] == 'ernakulam'
        assert result['success'] == True

    @pytest.mark.asyncio
    async def test_synthesize_unsupported_language(self, mock_connector):
        """Test synthesis with unsupported language"""
        with pytest.raises(ValueError, match="not supported"):
            await mock_connector.synthesize(
                text="Hello",
                language='xyz'
            )

    @pytest.mark.asyncio
    async def test_synthesize_default_dialect(self, mock_connector):
        """Test synthesis uses default dialect when none specified"""
        with patch.object(mock_connector, '_synthesize_sync', return_value='base64_audio_data'):
            with patch('asyncio.get_event_loop') as mock_loop:
                mock_loop.return_value.run_in_executor = AsyncMock(return_value='base64_audio_data')
                
                result = await mock_connector.synthesize(
                    text="നമസ്കാരം",
                    language='ml'
                )
        
        assert result['dialect'] == 'ernakulam'  # Default

    @pytest.mark.asyncio
    async def test_synthesize_not_initialized(self):
        """Test synthesis fails when not initialized"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({'enabled': True})
        # Not initialized
        
        with pytest.raises(RuntimeError, match="not initialized"):
            await connector.synthesize("Test", language='ml')

    @pytest.mark.asyncio
    async def test_health_check_healthy(self, mock_connector):
        """Test health check when healthy"""
        result = await mock_connector.health_check()
        
        assert result['provider'] == 'indicf5'
        assert result['status'] == 'healthy'
        assert result['initialized'] == True
        assert 'statistics' in result

    @pytest.mark.asyncio
    async def test_health_check_not_initialized(self):
        """Test health check when not initialized"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        
        connector = IndicF5Connector({'enabled': True})
        result = await connector.health_check()
        
        assert result['status'] == 'unhealthy'

    def test_has_reference_audio(self, mock_connector):
        """Test checking reference audio existence"""
        mock_connector.reference_audios['ernakulam'] = '/path/to/audio.wav'
        
        assert mock_connector.has_reference_audio('ernakulam') == True
        assert mock_connector.has_reference_audio('unknown') == False

    @pytest.mark.asyncio
    async def test_close(self, mock_connector):
        """Test connector cleanup"""
        await mock_connector.close()
        
        assert mock_connector.initialized == False
        assert mock_connector.model is None


class TestIndicF5TTSService:
    """Test suite for IndicF5TTSService"""

    @pytest.fixture
    def service_config(self):
        """Default service configuration"""
        return {
            'enabled': True,
            'device': 'cpu'
        }

    @pytest.mark.asyncio
    async def test_service_init(self, service_config):
        """Test service initialization"""
        from services.text_to_speech_indicf5 import IndicF5TTSService
        
        service = IndicF5TTSService(service_config)
        
        assert service.enabled == True
        assert service.initialized == False

    def test_service_not_healthy_before_init(self, service_config):
        """Test service reports unhealthy before initialization"""
        from services.text_to_speech_indicf5 import IndicF5TTSService
        
        service = IndicF5TTSService(service_config)
        
        assert service.is_healthy() == False

    @pytest.mark.asyncio
    async def test_synthesize_empty_text(self, service_config):
        """Test synthesis with empty text returns empty string"""
        from services.text_to_speech_indicf5 import IndicF5TTSService
        
        service = IndicF5TTSService(service_config)
        service.initialized = True
        service.connector = Mock()
        
        result = await service.synthesize("", language='ml')
        
        assert result == ""

    @pytest.mark.asyncio
    async def test_get_supported_dialects_no_connector(self, service_config):
        """Test getting dialects when connector not initialized"""
        from services.text_to_speech_indicf5 import IndicF5TTSService
        
        service = IndicF5TTSService(service_config)
        dialects = service.get_supported_dialects()
        
        assert dialects == []


class TestIndicF5Integration:
    """Integration tests for IndicF5 with mocked model"""

    @pytest.mark.asyncio
    async def test_full_synthesis_flow(self):
        """Test complete synthesis flow with mocked model"""
        from ai.connectors.indicf5_connector import IndicF5Connector
        import numpy as np
        
        config = {
            'enabled': True,
            'device': 'cpu',
            'reference_audio_dir': 'models/reference_audios'
        }
        
        connector = IndicF5Connector(config)
        
        # Mock the model loading and synthesis
        with patch.object(connector, '_load_model', return_value=True):
            with patch.object(connector, '_synthesize_sync', return_value='dGVzdF9hdWRpbw=='):  # base64 of 'test_audio'
                connector.model = Mock()
                connector.initialized = True
                
                with patch('asyncio.get_event_loop') as mock_loop:
                    mock_loop.return_value.run_in_executor = AsyncMock(return_value='dGVzdF9hdWRpbw==')
                    
                    result = await connector.synthesize(
                        text="ഹലോ, എങ്ങനെയുണ്ട്?",
                        language='ml',
                        dialect='thrissur'
                    )
        
        assert result['success'] == True
        assert result['audio_data'] == 'dGVzdF9hdWRpbw=='
        assert result['dialect'] == 'thrissur'
        assert result['sample_rate'] == 24000


# Run tests
if __name__ == '__main__':
    pytest.main([__file__, '-v'])
