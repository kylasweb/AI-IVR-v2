import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from services.conversation_manager import ConversationManager


class TestConversationManager:
    """Test suite for ConversationManager"""

    @pytest.fixture
    def conv_manager(self):
        """Create ConversationManager instance"""
        return ConversationManager()

    @pytest.fixture
    def mock_session(self):
        """Create mock session object"""
        session = Mock()
        session.language = "en"
        session.user_id = "test_user_123"
        session.call_id = "call_456"
        return session

    def test_init(self, conv_manager):
        """Test ConversationManager initialization"""
        assert conv_manager.conversation_flows is not None
        assert conv_manager.responses is not None
        assert "main_menu" in conv_manager.conversation_flows
        assert "billing" in conv_manager.conversation_flows

    def test_load_conversation_flows(self, conv_manager):
        """Test conversation flows loading"""
        flows = conv_manager._load_conversation_flows()
        assert isinstance(flows, dict)
        assert "main_menu" in flows
        assert "greeting" in flows["main_menu"]
        assert "options" in flows["main_menu"]
        assert isinstance(flows["main_menu"]["options"], list)

    def test_load_responses(self, conv_manager):
        """Test responses loading"""
        responses = conv_manager._load_responses()
        assert isinstance(responses, dict)
        assert "greeting" in responses
        assert "goodbye" in responses

    @pytest.mark.asyncio
    async def test_generate_response_greeting(self, conv_manager, mock_session):
        """Test greeting response generation"""
        response = await conv_manager.generate_response(
            "hello", "greeting", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_goodbye(self, conv_manager, mock_session):
        """Test goodbye response generation"""
        response = await conv_manager.generate_response(
            "goodbye", "goodbye", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_help(self, conv_manager, mock_session):
        """Test help response generation"""
        response = await conv_manager.generate_response(
            "help me", "help", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_unknown(self, conv_manager, mock_session):
        """Test unknown intent response generation"""
        response = await conv_manager.generate_response(
            "xyz123", "unknown", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_billing(self, conv_manager, mock_session):
        """Test billing intent response generation"""
        response = await conv_manager.generate_response(
            "billing", "billing", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_technical_support(self, conv_manager, mock_session):
        """Test technical support response generation"""
        response = await conv_manager.generate_response(
            "technical support", "technical_support", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_appointment(self, conv_manager, mock_session):
        """Test appointment response generation"""
        response = await conv_manager.generate_response(
            "appointment", "appointment", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_transfer(self, conv_manager, mock_session):
        """Test transfer response generation"""
        response = await conv_manager.generate_response(
            "transfer", "transfer", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_emergency(self, conv_manager, mock_session):
        """Test emergency response generation"""
        response = await conv_manager.generate_response(
            "emergency", "emergency", {"emergency_type": "medical"}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_confirmation(self, conv_manager, mock_session):
        """Test confirmation response generation"""
        response = await conv_manager.generate_response(
            "yes", "yes", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_negation(self, conv_manager, mock_session):
        """Test negation response generation"""
        response = await conv_manager.generate_response(
            "no", "no", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_with_entities(self, conv_manager, mock_session):
        """Test response generation with entities"""
        entities = {"time": "tomorrow", "department": "billing"}
        response = await conv_manager.generate_response(
            "schedule appointment", "appointment", entities, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_generate_response_error_handling(self, conv_manager, mock_session):
        """Test error handling in response generation"""
        # Test with invalid intent
        response = await conv_manager.generate_response(
            "invalid", "invalid_intent", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    def test_get_conversation_flow(self, conv_manager):
        """Test getting conversation flow"""
        # Access flows directly since there's no getter method
        flow = conv_manager.conversation_flows.get("main_menu")
        assert flow is not None
        assert "greeting" in flow
        assert "options" in flow

    def test_get_conversation_flow_invalid(self, conv_manager):
        """Test getting invalid conversation flow"""
        flow = conv_manager.conversation_flows.get("invalid_flow")
        assert flow is None

    def test_get_response_template(self, conv_manager):
        """Test getting response template"""
        # Access responses directly
        template = conv_manager.responses.get("greeting")
        assert template is not None
        assert isinstance(template, dict)  # It's a dict with language keys

    def test_get_response_template_invalid(self, conv_manager):
        """Test getting invalid response template"""
        template = conv_manager.responses.get("invalid_template")
        assert template is None

    @pytest.mark.asyncio
    async def test_handle_greeting(self, conv_manager, mock_session):
        """Test greeting handler"""
        response = await conv_manager._handle_greeting("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_goodbye(self, conv_manager, mock_session):
        """Test goodbye handler"""
        response = await conv_manager._handle_goodbye("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_help(self, conv_manager, mock_session):
        """Test help handler"""
        response = await conv_manager._handle_help("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_unknown(self, conv_manager, mock_session):
        """Test unknown handler"""
        response = await conv_manager._handle_unknown("unknown input", "en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_billing(self, conv_manager, mock_session):
        """Test billing handler"""
        response = await conv_manager._handle_billing("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_technical_support(self, conv_manager, mock_session):
        """Test technical support handler"""
        response = await conv_manager._handle_technical_support("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_appointment(self, conv_manager, mock_session):
        """Test appointment handler"""
        response = await conv_manager._handle_appointment("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_transfer(self, conv_manager, mock_session):
        """Test transfer handler"""
        response = await conv_manager._handle_transfer("en", mock_session)
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_confirmation(self, conv_manager, mock_session):
        """Test confirmation handler"""
        response = await conv_manager.generate_response(
            "yes", "yes", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0

    @pytest.mark.asyncio
    async def test_handle_negation(self, conv_manager, mock_session):
        """Test negation handler"""
        response = await conv_manager.generate_response(
            "no", "no", {}, mock_session
        )
        assert isinstance(response, str)
        assert len(response) > 0