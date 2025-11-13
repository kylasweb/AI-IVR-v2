import pytest
from services.manglish_service import ManglishService


class TestManglishService:
    """Unit tests for ManglishService"""

    def setup_method(self):
        """Setup test fixtures"""
        self.service = ManglishService()

    def test_initialization(self):
        """Test service initialization"""
        assert self.service is not None
        assert hasattr(self.service, 'manglish_to_malayalam_map')
        assert hasattr(self.service, 'manglish_patterns')
        assert hasattr(self.service, 'phonetic_mappings')

    def test_is_manglish_positive(self):
        """Test Manglish detection - positive case"""
        result = self.service.is_manglish("namaskaram")
        assert result is True

    def test_is_manglish_negative(self):
        """Test Manglish detection - negative case"""
        result = self.service.is_manglish("hello")
        assert result is False

    def test_manglish_to_malayalam_basic(self):
        """Test basic Manglish to Malayalam conversion"""
        result = self.service.manglish_to_malayalam("namaskaram")
        assert result == "നമസ്കാരം"

    def test_manglish_to_malayalam_unknown(self):
        """Test Manglish to Malayalam conversion for unknown word"""
        result = self.service.manglish_to_malayalam("unknownword")
        assert isinstance(result, str)

    def test_malayalam_to_manglish(self):
        """Test Malayalam to Manglish conversion"""
        result = self.service.malayalam_to_manglish("നമസ്കാരം")
        assert isinstance(result, str)

    def test_detect_manglish_context(self):
        """Test Manglish context detection"""
        result = self.service.detect_manglish_context("namaskaram")
        assert isinstance(result, dict)
        assert 'is_manglish' in result
        assert 'language' in result

    def test_get_manglish_suggestions(self):
        """Test getting Manglish suggestions"""
        suggestions = self.service.get_manglish_suggestions("nam")
        assert isinstance(suggestions, list)

    def test_normalize_manglish(self):
        """Test Manglish normalization"""
        result = self.service.normalize_manglish("NAMASKARAM")
        assert isinstance(result, str)

    def test_validate_manglish_input(self):
        """Test Manglish input validation"""
        result = self.service.validate_manglish_input("namaskaram")
        assert isinstance(result, dict)
        assert 'is_valid' in result
        assert 'confidence' in result

    def test_create_manglish_response_templates(self):
        """Test creating response templates"""
        templates = self.service.create_manglish_response_templates()
        assert isinstance(templates, dict)
        assert len(templates) > 0

    def test_get_regional_variation(self):
        """Test getting regional variation"""
        result = self.service.get_regional_variation("namaskaram", "travancore")
        assert isinstance(result, str)