import re
import logging
from typing import Dict, List, Tuple, Optional, Any
import json

logger = logging.getLogger(__name__)


class ManglishService:
    """Service for handling Manglish (Malayalam in English script)"""

    def __init__(self):
        self.manglish_to_malayalam_map = self._load_manglish_to_malayalam_map()
        self.malayalam_to_manglish_map = self._load_malayalam_to_manglish_map()
        self.manglish_patterns = self._load_manglish_patterns()
        self.phonetic_mappings = self._load_phonetic_mappings()

        # Common Manglish phrases and their contexts
        self.manglish_phrases = {
            "greetings": [
                "namaskaram", "hai", "sukham", "engane irikkunnu", "vanakkam",
                "good morning", "suprabhatham", "subha sandhya"
            ],
            "farewells": [
                "nandi", "vittu kanam", "piriyunnu", "bye", "millate",
                "subha yathra"
            ],
            "politeness": [
                "dayavayi", "please", "nandi", "thanks", "thank you",
                "sorry", "kshamikkoo"
            ],
            "help_requests": [
                "sahayam", "help", "sahayam vendam", "help cheyyan",
                "onn sahayikkum", "enne sahayikko"
            ],
            "business_terms": [
                "bill", "payment", "charge", "thunaku", "appointment",
                "booking", "schedule", "technical", "support"
            ],
            "emotions": [
                "santhosham", "happy", "khedam", "sad", "kopa", "angry",
                "bayankaram", "afraid"
            ]
        }

        # Regional variations in Manglish
        self.regional_variations = {
            "travancore": {
                "namaskaram": "namaskaram",
                "sukham": "sukham",
                "dayavayi": "dayavayi"
            },
            "malabar": {
                "namaskaram": "namaskaram",
                "sukham": "sukham",
                "dayavayi": "dayavayi"
            },
            "cochin": {
                "namaskaram": "namaskaram",
                "sukham": "sukham",
                "dayavayi": "dayavayi"
            }
        }

    def _load_manglish_to_malayalam_map(self) -> Dict[str, str]:
        """Load comprehensive Manglish to Malayalam mapping"""
        return {
            # Greetings
            "namaskaram": "നമസ്കാരം",
            "hai": "ഹായ്",
            "sukham": "സുഖം",
            "engane irikkunnu": "എങ്ങനെ ഇരിക്കുന്നു",
            "vanakkam": "വണക്കം",
            "suprabhatham": "സുപ്രഭാതം",
            "subha sandhya": "ശുഭ സന്ധ്യ",

            # Politeness
            "dayavayi": "ദയവായി",
            "please": "ദയവായി",
            "nandi": "നന്ദി",
            "thanks": "നന്ദി",
            "thank you": "നന്ദി",
            "sorry": "ക്ഷമിക്കണം",
            "kshamikkoo": "ക്ഷമിക്കൂ",

            # Help and assistance
            "sahayam": "സഹായം",
            "help": "സഹായം",
            "sahayam vendam": "സഹായം വേണം",
            "help cheyyan": "സഹായം ചെയ്യാൻ",
            "onn sahayikkum": "ഒന്ന് സഹായിക്കും",
            "enne sahayikko": "എന്നെ സഹായിക്കൂ",

            # Business terms
            "bill": "ബിൽ",
            "payment": "പേയ്‌മെന്റ്",
            "charge": "ചാർജ്",
            "thunaku": "തുക",
            "appointment": "അപ്പോയിന്റ്മെന്റ്",
            "booking": "ബുക്കിംഗ്",
            "schedule": "ഷെഡ്യൂൾ",
            "technical": "സാങ്കേതിക",
            "support": "പിന്തുണ",

            # Common words
            "athe": "അതെ",
            "alla": "അല്ല",
            "sari": "ശരി",
            "undu": "ഉണ്ട്",
            "illa": "ഇല്ല",
            "vendam": "വേണ്ട",
            "vendath": "വേണ്ട",
            "avashyam": "ആവശ്യം",
            "avashyamilla": "ആവശ്യമില്ല",

            # Questions
            "enthu": "എന്ത്",
            "engane": "എങ്ങനെ",
            "evide": "എവിടെ",
            "eppol": "എപ്പോൾ",
            "ean": "എന്തുകൊണ്ട്",
            "aar": "ആര്",
            "enthanu": "എന്താണ്",
            "engane aanu": "എങ്ങനെയാണ്",

            # Time and date
            "innu": "ഇന്ന്",
            "nale": "നാളെ",
            "innale": "ഇന്നലെ",
            "ravil": "രാവിലെ",
            "ucha": "ഉച്ച",
            "vaykkunna rathri": "വൈകുന്നേരം",
            "tingalazhcha": "തിങ്കളാഴ്ച",
            "vyaazhcha": "വ്യാഴാഴ്ച",
            "velliyaazhcha": "വെള്ളിയാഴ്ച",
            "shaniyaazhcha": "ശനിയാഴ്ച",

            # Numbers
            "onn": "ഒന്ന്",
            "randu": "രണ്ട്",
            "moonu": "മൂന്ന്",
            "naalu": "നാല്",
            "anchu": "അഞ്ച്",
            "aru": "ആറ്",
            "ezhu": "ഏഴ്",
            "ettu": "എട്ട്",
            "onpathu": "ഒൻപത്",
            "pathu": "പത്ത്",

            # Family and relationships
            "appan": "അപ്പൻ",
            "amma": "അമ്മ",
            "makan": "മകൻ",
            "makal": "മകൾ",
            "chettan": "ചേട്ടൻ",
            "chechi": "ചേച്ചി",

            # Places
            "keralam": "കേരളം",
            "thiruvananthapuram": "തിരുവനന്തപുരം",
            "kochi": "കൊച്ചി",
            "kozhikode": "കോഴിക്കോട്",
            "malappuram": "മലപ്പുറം",

            # Emotions
            "santhosham": "സന്തോഷം",
            "khedam": "ഖേദം",
            "kopa": "കോപം",
            "bayankaram": "ഭയാനകം",
            "premam": "പ്രേമം",
            "sneham": "സ്നേഹം"
        }

    def _load_malayalam_to_manglish_map(self) -> Dict[str, str]:
        """Load Malayalam to Manglish mapping"""
        return {v: k for k, v in self.manglish_to_malayalam_map.items()}

    def _load_manglish_patterns(self) -> Dict[str, List[str]]:
        """Load Manglish patterns for different contexts"""
        return {
            "questions": [
                r"\b(enthu|engane|evide|eppol|ean|enthanu|engane aanu)\b",
                r"\b(who|what|when|where|why|how)\b.*malayalam"
            ],
            "requests": [
                r"\b(dayavayi|please|sahayam|help|vendam|vendath)\b",
                r"\b(can you|could you|will you)\b.*malayalam"
            ],
            "statements": [
                r"\b(enikku|athu|avaru|njan)\b.*malayalam",
                r"\b(i want|i need|i would like)\b.*malayalam"
            ],
            "emotions": [
                r"\b(santhosham|khedam|kopa|bayankaram|happy|sad|angry)\b",
                r"\b(feeling|emotion)\b.*malayalam"
            ]
        }

    def _load_phonetic_mappings(self) -> Dict[str, str]:
        """Load phonetic mappings for better transliteration"""
        return {
            # Vowel mappings
            "a": "അ", "aa": "ആ", "i": "ഇ", "ee": "ഈ", "u": "ഉ",
            "oo": "ഊ", "e": "എ", "ai": "ഐ", "o": "ഒ", "au": "ഔ",

            # Consonant mappings (Malayalam)
            "ka": "ക", "kha": "ഖ", "ga": "ഗ", "gha": "ഘ", "nga": "ങ",
            "cha": "ച", "chha": "ഛ", "ja": "ജ", "jha": "ഝ", "nya": "ഞ",
            "ta": "ട", "tta": "ഠ", "dda": "ഡ", "ddha": "ഢ", "nna": "ണ",
            "tha": "ത", "thha": "ഥ", "da": "ദ", "dha": "ധ", "na": "ന",
            "pa": "പ", "pha": "ഫ", "ba": "ബ", "bha": "ഭ", "ma": "മ",
            "ya": "യ", "ra": "ര", "la": "ല", "va": "വ", "sha": "ശ",
            "ssha": "ഷ", "sa": "സ", "ha": "ഹ",

            # Special characters
            "am": "ം", "ah": "ഃ",
            # Chillu characters
            "n_chillu": "ൻ", "r_chillu": "ർ", "l_chillu": "ൽ", "ll_chillu": "ൾ", "k_chillu": "ൿ"
        }

    def is_manglish(self, text: str) -> bool:
        """Check if text is Manglish"""
        text_lower = text.lower()

        # Check for common Manglish indicators
        manglish_indicators = [
            "namaskaram", "hai", "sukham", "engane", "enthu", "dayavayi",
            "sahayam", "athe", "alla", "sari", "vendam", "nandi"
        ]

        manglish_word_count = sum(
            1 for word in manglish_indicators if word in text_lower)

        # Check if it's mostly English but with Malayalam context
        english_words = len(re.findall(r'\b[a-zA-Z]+\b', text))
        total_words = len(re.findall(r'\b\w+\b', text))

        if total_words == 0:
            return False

        english_ratio = english_words / total_words

        # Consider it Manglish if:
        # 1. Has Manglish indicator words, OR
        # 2. Mostly English but in Malayalam context
        return manglish_word_count > 0 or (
            english_ratio > 0.7 and manglish_word_count > 0)

    def manglish_to_malayalam(self, text: str) -> str:
        """Convert Manglish text to Malayalam"""
        try:
            text_lower = text.lower()

            # Direct word replacements
            for manglish, malayalam in self.manglish_to_malayalam_map.items():
                if manglish in text_lower:
                    text_lower = text_lower.replace(manglish, malayalam)

            # Handle partial matches and phonetic conversions
            text_lower = self._phonetic_conversion(text_lower)

            # Handle common patterns
            text_lower = self._handle_common_patterns(text_lower)

            return text_lower

        except Exception as e:
            logger.error(f"Error converting Manglish to Malayalam: {str(e)}")
            return text

    def malayalam_to_manglish(self, text: str) -> str:
        """Convert Malayalam text to Manglish"""
        try:
            # Direct word replacements
            for malayalam, manglish in self.malayalam_to_manglish_map.items():
                if malayalam in text:
                    text = text.replace(malayalam, manglish)

            return text

        except Exception as e:
            logger.error(f"Error converting Malayalam to Manglish: {str(e)}")
            return text

    def _phonetic_conversion(self, text: str) -> str:
        """Apply phonetic conversion rules"""
        # This is a simplified phonetic conversion
        # In a production system, you'd use more sophisticated transliteration

        # Common phonetic patterns
        phonetic_rules = {
            "namaskaram": "നമസ്കാരം",
            "enthanu": "എന്താണ്",
            "engane": "എങ്ങനെ",
            "evide": "എവിടെ",
            "dayavayi": "ദയവായി",
            "sahayam": "സഹായം"
        }

        for pattern, replacement in phonetic_rules.items():
            if pattern in text:
                text = text.replace(pattern, replacement)

        return text

    def _handle_common_patterns(self, text: str) -> str:
        """Handle common Manglish patterns"""
        # Handle question patterns
        question_patterns = {
            r"\benthu\w*\b": "എന്ത്",
            r"\bengane\w*\b": "എങ്ങനെ",
            r"\bevide\w*\b": "എവിടെ",
            r"\beppol\w*\b": "എപ്പോൾ"
        }

        for pattern, replacement in question_patterns.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        # Handle response patterns
        response_patterns = {
            r"\bathe\w*\b": "അതെ",
            r"\balla\w*\b": "അല്ല",
            r"\bsari\w*\b": "ശരി",
            r"\bundu\w*\b": "ഉണ്ട്",
            r"\billa\w*\b": "ഇല്ല"
        }

        for pattern, replacement in response_patterns.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

        return text

    def detect_manglish_context(self, text: str) -> Dict[str, Any]:
        """Detect context and intent from Manglish text"""
        context = {
            "is_manglish": self.is_manglish(text),
            "language": "manglish" if self.is_manglish(text) else "unknown",
            "context_type": None,
            "entities": {},
            "sentiment": None
        }

        text_lower = text.lower()

        # Detect context type
        for context_type, patterns in self.manglish_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    context["context_type"] = context_type
                    break

        # Extract entities
        context["entities"] = self._extract_manglish_entities(text_lower)

        # Detect sentiment
        context["sentiment"] = self._detect_manglish_sentiment(text_lower)

        return context

    def _extract_manglish_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities from Manglish text"""
        entities = {}

        # Time entities
        time_patterns = {
            "time": r"\b(innu|nale|innale|ravil|ucha|vaykkunna rathri)\b",
            "date": r"\b(tingalazhcha|vyaazhcha|velliyaazhcha|shaniyaazhcha)\b",
            "number": r"\b(onn|randu|moonu|naalu|anchu|aru|ezhu|ettu|onpathu|pathu)\b"
        }

        for entity_type, pattern in time_patterns.items():
            matches = re.findall(pattern, text)
            if matches:
                entities[entity_type] = matches

        # Business entities
        business_patterns = {
            "service": r"\b(bill|payment|appointment|technical|support)\b",
            "action": r"\b(schedule|book|cancel|transfer|help)\b"
        }

        for entity_type, pattern in business_patterns.items():
            matches = re.findall(pattern, text)
            if matches:
                entities[entity_type] = matches

        return entities

    def _detect_manglish_sentiment(self, text: str) -> str:
        """Detect sentiment from Manglish text"""
        positive_words = ["santhosham", "happy", "sari", "athe", "nandi", "thanks"]
        negative_words = [
            "khedam",
            "sad",
            "alla",
            "illa",
            "kopa",
            "angry",
            "sorry",
            "problem"]

        positive_count = sum(1 for word in positive_words if word in text)
        negative_count = sum(1 for word in negative_words if word in text)

        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    def get_manglish_suggestions(self, text: str) -> List[str]:
        """Get suggestions for better Manglish input"""
        suggestions = []

        if not self.is_manglish(text):
            return ["Try using Malayalam words in English script (Manglish)"]

        text_lower = text.lower()

        # Check for common mistakes
        common_corrections = {
            "namaste": "namaskaram",
            "thank u": "nandi",
            "pls": "please",
            "sry": "sorry",
            "whatsup": "sukham"
        }

        for mistake, correction in common_corrections.items():
            if mistake in text_lower:
                suggestions.append(
                    f"Consider using '{correction}' instead of '{mistake}'")

        # Check for incomplete words
        incomplete_patterns = {
            r"namask": "namaskaram",
            r"sahay": "sahayam",
            r"dayav": "dayavayi"
        }

        for pattern, completion in incomplete_patterns.items():
            if re.search(pattern, text_lower):
                suggestions.append(f"Did you mean '{completion}'?")

        return suggestions

    def normalize_manglish(self, text: str) -> str:
        """Normalize Manglish text for better processing"""
        # Convert to lowercase
        text = text.lower()

        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text)

        # Handle common abbreviations
        abbreviations = {
            "pls": "please",
            "u": "you",
            "r": "are",
            "k": "okay",
            "thnx": "thanks",
            "sry": "sorry"
        }

        for abbr, expansion in abbreviations.items():
            text = text.replace(f" {abbr} ", f" {expansion} ")

        return text.strip()

    def create_manglish_response_templates(self) -> Dict[str, Dict[str, str]]:
        """Create response templates for Manglish"""
        return {
            "greeting": {
                "formal": "Namaskaram, engane sahayikkam?",
                "informal": "Hai, enthanu vendam?",
                "neutral": "Namaskaram, innengane sahayikkan?"
            },
            "help": {
                "formal": "Njan sahayikan thayarayam. enthanu avashyam?",
                "informal": "Njan sahayikkan. enthu vendam?",
                "neutral": "Sahayam labhyam. parayu vendathathu"
            },
            "confirmation": {
                "formal": "Sari, njan sahayikan thayarayam.",
                "informal": "Sari, sahayikkan.",
                "neutral": "Athe, njan sahayikkum."
            },
            "apology": {
                "formal": "Kshamikkam, enikku manasilakkan kazhinjilla. dayavayi vittum parayamo?",
                "informal": "Kshamikkoo, manasilayilla. vittum parayoo?",
                "neutral": "Kshamikkam, thirichu parayoo."
            },
            "goodbye": {
                "formal": "Vilichathu nandi. vittu kanam!",
                "informal": "Bye, vittu kanam!",
                "neutral": "Nandi, vittu samsarikkan!"
            }
        }

    def get_regional_variation(self, text: str, region: str) -> str:
        """Apply regional variations to Manglish text"""
        if region not in self.regional_variations:
            return text

        regional_map = self.regional_variations[region]
        text_lower = text.lower()

        for standard, regional in regional_map.items():
            if standard in text_lower:
                text_lower = text_lower.replace(standard, regional)

        return text_lower

    def validate_manglish_input(self, text: str) -> Dict[str, Any]:
        """Validate Manglish input and provide feedback"""
        validation = {
            "is_valid": True,
            "confidence": 0.0,
            "errors": [],
            "suggestions": [],
            "corrections": {}
        }

        if not text.strip():
            validation["is_valid"] = False
            validation["errors"].append("Empty input")
            return validation

        # Check if it's recognizable Manglish
        if self.is_manglish(text):
            validation["confidence"] = 0.8
            validation["suggestions"] = self.get_manglish_suggestions(text)
        else:
            validation["confidence"] = 0.3
            validation["errors"].append("Not recognizable as Manglish")
            validation["suggestions"].append(
                "Try using Malayalam words in English script")

        # Check for common issues
        if len(text.split()) < 2:
            validation["suggestions"].append("Try to provide more context")

        return validation
