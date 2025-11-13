import pytest
from services.voice_agent import VoiceAgent


class TestVoiceAgent:
    """Unit tests for VoiceAgent"""

    def setup_method(self):
        """Setup test fixtures"""
        self.agent = VoiceAgent()

    def test_initialization(self):
        """Test agent initialization"""
        assert self.agent is not None
        assert hasattr(self.agent, 'is_running')
        assert hasattr(self.agent, 'agent_config')
        assert self.agent.agent_config['name'] == "AI Assistant"

    def test_is_healthy(self):
        """Test health check"""
        assert self.agent.is_healthy() is True

    @pytest.mark.asyncio
    async def test_initialize(self):
        """Test agent initialization"""
        await self.agent.initialize()
        assert self.agent.is_running is True

    @pytest.mark.asyncio
    async def test_shutdown(self):
        """Test agent shutdown"""
        self.agent.is_running = True
        await self.agent.shutdown()
        assert self.agent.is_running is False

    @pytest.mark.asyncio
    async def test_process_call(self):
        """Test call processing"""
        result = await self.agent.process_call("session123", "+1234567890")
        assert isinstance(result, dict)
        assert 'session_id' in result
        assert 'status' in result
        assert result['session_id'] == "session123"
        assert result['phone_number'] == "+1234567890"

    @pytest.mark.asyncio
    async def test_handle_interruption(self):
        """Test interruption handling"""
        result = await self.agent.handle_interruption("session123")
        assert isinstance(result, bool)
        assert result is True

    @pytest.mark.asyncio
    async def test_detect_silence(self):
        """Test silence detection"""
        # Test with short audio data (should be considered silence)
        short_audio = "dGVzdA=="  # base64 for "test"
        result = await self.agent.detect_silence(short_audio)
        assert isinstance(result, bool)

    @pytest.mark.asyncio
    async def test_get_agent_response(self):
        """Test agent response generation"""
        context = {"session_id": "test"}
        response = await self.agent.get_agent_response("hello", context)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_get_agent_response_empty_input(self):
        """Test agent response with empty input"""
        context = {"session_id": "test"}
        response = await self.agent.get_agent_response("", context)
        assert isinstance(response, str)
        assert "help" in response.lower()

    def test_update_config(self):
        """Test configuration update"""
        new_config = {"voice": "male", "speed": 1.2}
        self.agent.update_config(new_config)
        assert self.agent.agent_config['voice'] == "male"
        assert self.agent.agent_config['speed'] == 1.2

    def test_get_config(self):
        """Test configuration retrieval"""
        config = self.agent.get_config()
        assert isinstance(config, dict)
        assert 'name' in config
        assert 'voice' in config
        assert config['name'] == "AI Assistant"