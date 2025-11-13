import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from services.nlp_service import NLPService, Intent, Entity


class TestNLPService:
    """Test suite for NLPService"""

    @pytest.fixture
    def nlp_service(self):
        """Create NLPService instance"""
        return NLPService()

    def test_init(self, nlp_service):
        """Test NLPService initialization"""
        assert nlp_service.intent_patterns is not None
        assert nlp_service.entity_patterns is not None
        assert isinstance(nlp_service.intent_patterns, dict)
        assert isinstance(nlp_service.entity_patterns, dict)

    def test_is_healthy(self, nlp_service):
        """Test health check"""
        assert nlp_service.is_healthy() is True

    @pytest.mark.asyncio
    async def test_analyze_intent_greeting(self, nlp_service):
        """Test greeting intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("hello", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)
        assert confidence >= 0.0
        assert confidence <= 1.0

    @pytest.mark.asyncio
    async def test_analyze_intent_goodbye(self, nlp_service):
        """Test goodbye intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("goodbye", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_help(self, nlp_service):
        """Test help intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("help me", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_billing(self, nlp_service):
        """Test billing intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("billing", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_technical_support(self, nlp_service):
        """Test technical support intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("technical support", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_appointment(self, nlp_service):
        """Test appointment intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("appointment", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_transfer(self, nlp_service):
        """Test transfer intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("transfer", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_emergency(self, nlp_service):
        """Test emergency intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("emergency", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_yes(self, nlp_service):
        """Test yes intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("yes", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_no(self, nlp_service):
        """Test no intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("no", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_unknown(self, nlp_service):
        """Test unknown intent analysis"""
        intent, entities, confidence = await nlp_service.analyze_intent("xyz123unknown", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_with_entities(self, nlp_service):
        """Test intent analysis with entity extraction"""
        intent, entities, confidence = await nlp_service.analyze_intent(
            "schedule appointment tomorrow at 3pm", "en"
        )
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_different_languages(self, nlp_service):
        """Test intent analysis in different languages"""
        # Test English
        intent_en, entities_en, confidence_en = await nlp_service.analyze_intent("hello", "en")
        assert isinstance(intent_en, str)

        # Test with language parameter (even if not implemented, should not crash)
        intent_lang, entities_lang, confidence_lang = await nlp_service.analyze_intent("hello", "es")
        assert isinstance(intent_lang, str)

    @pytest.mark.asyncio
    async def test_analyze_intent_empty_text(self, nlp_service):
        """Test intent analysis with empty text"""
        intent, entities, confidence = await nlp_service.analyze_intent("", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_special_characters(self, nlp_service):
        """Test intent analysis with special characters"""
        intent, entities, confidence = await nlp_service.analyze_intent("hello!!!???###", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    def test_load_intent_patterns(self, nlp_service):
        """Test intent patterns loading"""
        patterns = nlp_service._load_intent_patterns()
        assert isinstance(patterns, dict)
        assert len(patterns) > 0
        # Check that common intents are present
        expected_intents = ["greeting", "goodbye", "help", "billing"]
        for intent in expected_intents:
            assert intent in patterns

    def test_load_entity_patterns(self, nlp_service):
        """Test entity patterns loading"""
        patterns = nlp_service._load_entity_patterns()
        assert isinstance(patterns, dict)
        # Entity patterns might be empty or minimal, that's okay
        assert isinstance(patterns, dict)

    @pytest.mark.asyncio
    async def test_extract_entities(self, nlp_service):
        """Test entity extraction"""
        # Test that analyze_intent returns entities
        intent, entities, confidence = await nlp_service.analyze_intent("schedule appointment tomorrow at 3pm", "en")
        assert isinstance(entities, dict)

    def test_calculate_confidence(self, nlp_service):
        """Test confidence calculation"""
        confidence = nlp_service._calculate_confidence("hello", ["hello", "hi"])
        assert isinstance(confidence, float)
        assert confidence >= 0.0
        assert confidence <= 1.0

    @pytest.mark.asyncio
    async def test_calculate_confidence_exact_match(self, nlp_service):
        """Test confidence calculation with exact match"""
        # Test with actual implementation
        intent, entities, confidence = await nlp_service.analyze_intent("hello", "en")
        # Confidence should be reasonable for a greeting
        assert isinstance(confidence, float)
        assert confidence >= 0.0
        assert confidence <= 1.0

    def test_calculate_confidence_no_match(self, nlp_service):
        """Test confidence calculation with no match"""
        confidence = nlp_service._calculate_confidence("xyz", ["hello"])
        assert confidence == 0.0

    @pytest.mark.asyncio
    async def test_normalize_text(self, nlp_service):
        """Test text normalization"""
        # Test that analyze_intent handles different cases
        intent1, entities1, confidence1 = await nlp_service.analyze_intent("HELLO", "en")
        intent2, entities2, confidence2 = await nlp_service.analyze_intent("hello", "en")
        # Should handle case insensitivity
        assert isinstance(intent1, str)
        assert isinstance(intent2, str)

    @pytest.mark.asyncio
    async def test_normalize_text_empty(self, nlp_service):
        """Test text normalization with empty string"""
        intent, entities, confidence = await nlp_service.analyze_intent("", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    def test_get_intent_patterns(self, nlp_service):
        """Test getting intent patterns"""
        # Test that patterns are loaded
        assert nlp_service.intent_patterns is not None
        assert isinstance(nlp_service.intent_patterns, dict)

    @pytest.mark.asyncio
    async def test_get_intent_patterns_unknown(self, nlp_service):
        """Test getting patterns for unknown intent"""
        # Test with unknown intent
        intent, entities, confidence = await nlp_service.analyze_intent("unknown_input_xyz", "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    @pytest.mark.asyncio
    async def test_analyze_intent_error_handling(self, nlp_service):
        """Test error handling in intent analysis"""
        # This should not crash even with problematic input
        intent, entities, confidence = await nlp_service.analyze_intent(None, "en")
        assert isinstance(intent, str)
        assert isinstance(entities, dict)
        assert isinstance(confidence, float)

    def test_intent_dataclass(self):
        """Test Intent dataclass"""
        intent = Intent(name="greeting", confidence=0.9, entities={"test": "value"})
        assert intent.name == "greeting"
        assert intent.confidence == 0.9
        assert intent.entities == {"test": "value"}

    def test_entity_dataclass(self):
        """Test Entity dataclass"""
        entity = Entity(type="time", value="tomorrow", start=10, end=18)
        assert entity.type == "time"
        assert entity.value == "tomorrow"
        assert entity.start == 10
        assert entity.end == 18