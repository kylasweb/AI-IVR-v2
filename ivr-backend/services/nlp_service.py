import re
import logging
from typing import Tuple, List, Dict, Any, Optional
import asyncio
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class Intent:
    name: str
    confidence: float
    entities: Dict[str, Any]


@dataclass
class Entity:
    type: str
    value: str
    start: int
    end: int


class NLPService:
    def __init__(self):
        self.intent_patterns = self._load_intent_patterns()
        self.entity_patterns = self._load_entity_patterns()

    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return len(self.intent_patterns) > 0
        except Exception as e:
            logger.error(f"NLP service health check failed: {e}")
            return False

    async def analyze_intent(
            self, text: str, language: str = "en") -> Tuple[str, Dict[str, Any], float]:
        """
        Analyze text to determine intent and extract entities

        Args:
            text: Input text
            language: Language code

        Returns:
            Tuple of (intent, entities, confidence)
        """
        try:
            if not text.strip():
                return "unknown", {}, 0.0

            text = text.lower().strip()

            # Check each intent pattern
            best_intent = "unknown"
            best_entities = {}
            best_confidence = 0.0

            for intent_name, patterns in self.intent_patterns.items():
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        confidence = self._calculate_confidence(text, pattern)
                        if confidence > best_confidence:
                            best_confidence = confidence
                            best_intent = intent_name

                            # Extract entities
                            entities = self._extract_entities(text, intent_name)
                            best_entities = entities

            # If no intent matched, try to detect general purpose
            if best_intent == "unknown":
                best_intent = self._detect_general_intent(text)
                best_confidence = 0.5

            logger.info(
                f"Intent detected: {best_intent} (confidence: {
                    best_confidence:.2f})")
            return best_intent, best_entities, best_confidence

        except Exception as e:
            logger.error(f"Error analyzing intent: {str(e)}")
            return "unknown", {}, 0.0

    def _load_intent_patterns(self) -> Dict[str, List[str]]:
        """Load intent patterns for different languages"""
        patterns = {
            "greeting": [
                r'\b(hello|hi|hey|good morning|good afternoon|good evening)\b',
                r'\b(hola|bonjour|guten tag|buongiorno)\b'
            ],
            "goodbye": [
                r'\b(bye|goodbye|see you|later|farewell)\b',
                r'\b(adios|au revoir|auf wiedersehen|arrivederci)\b'
            ],
            "help": [
                r'\b(help|assist|support|need help|can you help)\b',
                r'\b(ayuda|aide|hilfe|aiuto)\b'
            ],
            "yes": [
                r'\b(yes|yeah|yep|sure|okay|ok|correct|right)\b',
                r'\b(si|oui|ja|sì)\b'
            ],
            "no": [
                r'\b(no|nope|not|negative|wrong|incorrect)\b',
                r'\b(no|non|nein|no)\b'
            ],
            "transfer": [
                r'\b(transfer|speak to|talk to|agent|representative|human)\b',
                r'\b(transferir|hablar con|agente)\b'
            ],
            "appointment": [
                r'\b(appointment|schedule|book|meeting|reservation)\b',
                r'\b(cita|reserva|reunión)\b'
            ],
            "billing": [
                r'\b(bill|payment|invoice|charge|cost|price)\b',
                r'\b(factura|pago|costo)\b'
            ],
            "technical_support": [
                r'\b(technical|support|issue|problem|broken|not working)\b',
                r'\b(técnico|soporte|problema|no funciona)\b'
            ],
            "information": [
                r'\b(information|info|details|about|what is|tell me)\b',
                r'\b(información|detalles|acerca de)\b'
            ],
            "complaint": [
                r'\b(complaint|unhappy|dissatisfied|angry|frustrated)\b',
                r'\b(queja|descontento|enojado)\b'
            ],
            "sales": [
                r'\b(buy|purchase|order|sale|price|cost)\b',
                r'\b(comprar|pedido|venta|precio)\b'
            ],
            # Cultural Considerations - English Intent Patterns for Kerala Context
            "respectful_greeting": [
                r'\b(good morning sir|good evening ma\'am|respected sir|honored madam)\b',
                r'\b(namaste sir|namaste madam|greetings with respect|humble greetings)\b',
                r'\b(dear sir|dear madam|your honor|your grace|esteemed)\b'
            ],
            "informal_greeting": [
                r'\b(hi bro|hello sister|hey buddy|what\'s up|how are you doing)\b',
                r'\b(hello friend|hey there|good to see you|nice to meet you)\b'
            ],
            "elder_respect": [
                r'\b(uncle|aunty|elder|senior|grandfather|grandmother)\b',
                r'\b(respected elder|senior citizen|elderly person|aged person)\b',
                r'\b(father figure|mother figure|patriarch|matriarch)\b'
            ],
            "family_hierarchy": [
                r'\b(eldest|youngest|senior|junior|family head|patriarch)\b',
                r'\b(older brother|younger sister|cousin|nephew|niece)\b',
                r'\b(son|daughter|son-in-law|daughter-in-law)\b'
            ],
            "religious_greetings": [
                r'\b(peace be upon you|god bless|divine blessings|may god help)\b',
                r'\b(allah hafez|om shanti|hare krishna|praise the lord)\b',
                r'\b(with gods grace|by gods will|in gods name)\b'
            ],
            "festival_references": [
                r'\b(onam celebration|vishu festival|diwali|holi|eid|christmas)\b',
                r'\b(malayalam new year|kerala festival|traditional festival)\b',
                r'\b(temple festival|church festival|mosque celebration)\b',
                r'\b(harvest festival|religious celebration|cultural event)\b'
            ],
            "cultural_food": [
                r'\b(kerala sadhya|traditional meal|malayalam cuisine|local food)\b',
                r'\b(coconut rice|fish curry|banana chips|jackfruit)\b',
                r'\b(toddy|kerala tea|spiced tea|coconut water)\b'
            ],
            "marriage_customs": [
                r'\b(wedding ceremony|marriage ritual|wedding tradition|nuptials)\b',
                r'\b(malayalam wedding|kerala marriage|traditional wedding)\b',
                r'\b(bridal ceremony|groom ceremony|engagement|betrothal)\b'
            ],
            "birth_rituals": [
                r'\b(naming ceremony|baby blessing|birth celebration|christening)\b',
                r'\b(first rice ceremony|child blessing|baby\'s first)\b'
            ],
            "death_rituals": [
                r'\b(funeral ceremony|last rites|memorial service|condolence)\b',
                r'\b(mourning period|death anniversary|prayer meeting)\b'
            ],
            "caste_considerations": [
                r'\b(community|caste|social group|traditional family)\b',
                r'\b(brahmin family|nair community|christian family)\b',
                r'\b(social hierarchy|community leader|traditional role)\b'
            ],
            "gender_respect": [
                r'\b(lady|woman|female|mother|sister|daughter)\b',
                r'\b(gentleman|man|male|father|brother|son)\b',
                r'\b(pregnant woman|elderly lady|young woman|working woman)\b'
            ],
            "age_respect": [
                r'\b(senior citizen|elderly|aged|mature|adult|young)\b',
                r'\b(teenager|adolescent|child|kid|baby|infant)\b',
                r'\b(working age|retirement age|middle aged|old aged)\b'
            ],
            "regional_dialects": [
                r'\b(malabar dialect|travancore region|cochin area|north kerala)\b',
                r'\b(south kerala|central kerala|kerala accent|local dialect)\b'
            ],
            "traditional_occupations": [
                r'\b(farmer|fisherman|carpenter|blacksmith|weaver)\b',
                r'\b(ayurveda doctor|traditional healer|astrologer|priest)\b',
                r'\b(coconut climber|spice grower|rubber tapper|boat maker)\b'
            ],
            "social_etiquette": [
                r'\b(courtesy|politeness|respect|manners|etiquette)\b',
                r'\b(humble|modest|respectful|dignified|gracious)\b',
                r'\b(guest respect|hospitality|welcoming|kind treatment)\b'
            ],
            "linguistic_politeness": [
                r'\b(please|kindly|humbly|respectfully|graciously)\b',
                r'\b(may i|could you|would you|if you don\'t mind)\b',
                r'\b(your permission|your blessing|your guidance)\b'
            ],
            "cultural_taboos": [
                r'\b(inappropriate|disrespectful|offensive|taboo|forbidden)\b',
                r'\b(cultural sensitivity|religious respect|traditional values)\b',
                r'\b(proper behavior|acceptable conduct|social norms)\b'
            ]
        }
        return patterns

    def _load_entity_patterns(self) -> Dict[str, str]:
        """Load entity extraction patterns"""
        patterns = {
            "phone": r'\b(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})\b',
            "email": r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b',
            "time": r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b',
            "date": r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b',
            "number": r'\b(\d+)\b',
            "money": r'\$(\d+(?:\.\d{2})?)',
            "percentage": r'(\d+(?:\.\d+)?)%',
            # Cultural entity patterns for Kerala context
            "cultural_titles": r'\b(sir|madam|uncle|aunty|teacher|sir ji|madam ji|respected)\b',
            "festivals": r'\b(onam|vishu|diwali|holi|eid|christmas|easter|dussehra|navaratri)\b',
            "religious_terms": r'\b(temple|church|mosque|gurudwara|prayer|blessing|divine|sacred)\b',
            "family_relations": r'\b(father|mother|brother|sister|uncle|aunt|cousin|grandfather|grandmother)\b',
            "caste_communities": r'\b(brahmin|nair|christian|muslim|hindu|sikh|parsi|buddhist)\b',
            "kerala_regions": r'\b(trivandrum|kochi|calicut|thrissur|kannur|kottayam|palakkad|malappuram|idukki|wayanad)\b',
            "traditional_food": r'\b(sadhya|puttu|appam|dosa|idli|sambar|rasam|curry|coconut|rice)\b',
            "cultural_items": r'\b(saree|mundu|dhoti|kurta|jewelry|ornaments|traditional dress)\b',
            "traditional_arts": r'\b(kathakali|mohiniyattam|theyyam|kalaripayattu|classical dance|folk dance)\b'
        }
        return patterns

    def _calculate_confidence(self, text: str, pattern: str) -> float:
        """Calculate confidence score for pattern match"""
        try:
            match = re.search(pattern, text, re.IGNORECASE)
            if not match:
                return 0.0

            # Base confidence on match length relative to text length
            match_length = len(match.group())
            text_length = len(text)

            if text_length == 0:
                return 0.0

            base_confidence = match_length / text_length

            # Boost confidence for exact matches
            if match.group().lower() == text.lower():
                base_confidence = min(base_confidence * 1.5, 1.0)

            return min(base_confidence, 1.0)

        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.0

    def _extract_entities(self, text: str, intent: str) -> Dict[str, Any]:
        """Extract entities from text based on intent"""
        entities = {}

        try:
            # Extract general entities
            for entity_type, pattern in self.entity_patterns.items():
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    entities[entity_type] = matches

            # Extract intent-specific entities
            if intent == "appointment":
                entities.update(self._extract_appointment_entities(text))
            elif intent == "billing":
                entities.update(self._extract_billing_entities(text))
            elif intent == "technical_support":
                entities.update(self._extract_support_entities(text))

            return entities

        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            return {}

    def _extract_appointment_entities(self, text: str) -> Dict[str, Any]:
        """Extract appointment-specific entities"""
        entities = {}

        # Service types
        services = {
            "consultation": ["consultation", "consult", "meeting"],
            "checkup": ["checkup", "check-up", "examination"],
            "followup": ["followup", "follow-up", "review"]
        }

        for service, keywords in services.items():
            for keyword in keywords:
                if keyword in text.lower():
                    entities["service_type"] = service
                    break

        return entities

    def _extract_billing_entities(self, text: str) -> Dict[str, Any]:
        """Extract billing-specific entities"""
        entities = {}

        # Payment methods
        payment_methods = {
            "credit_card": ["credit card", "visa", "mastercard", "amex"],
            "debit_card": ["debit card", "bank card"],
            "bank_transfer": ["bank transfer", "wire", "ach"],
            "check": ["check", "cheque"]
        }

        for method, keywords in payment_methods.items():
            for keyword in keywords:
                if keyword in text.lower():
                    entities["payment_method"] = method
                    break

        return entities

    def _extract_support_entities(self, text: str) -> Dict[str, Any]:
        """Extract technical support entities"""
        entities = {}

        # Issue types
        issues = {
            "login": ["login", "sign in", "password", "account"],
            "connection": ["connection", "internet", "wifi", "network"],
            "software": ["software", "application", "app", "program"],
            "hardware": ["hardware", "device", "equipment", "machine"]
        }

        for issue, keywords in issues.items():
            for keyword in keywords:
                if keyword in text.lower():
                    entities["issue_type"] = issue
                    break

        return entities

    def _detect_general_intent(self, text: str) -> str:
        """Detect general intent when no specific pattern matches"""
        text_lower = text.lower()

        # Question detection
        if any(
            word in text_lower for word in [
                "what",
                "where",
                "when",
                "how",
                "why",
                "who"]):
            return "question"

        # Request detection
        if any(
            word in text_lower for word in [
                "can",
                "could",
                "would",
                "may",
                "might"]):
            return "request"

        # Statement detection
        if any(word in text_lower for word in ["i want", "i need", "i would like"]):
            return "request"

        return "statement"

    async def get_response_suggestions(
            self, intent: str, entities: Dict[str, Any]) -> List[str]:
        """Get response suggestions based on intent and entities"""
        suggestions = {
            "greeting": [
                "Hello! How can I help you today?",
                "Hi there! What can I do for you?",
                "Good day! How may I assist you?"
            ],
            "help": [
                "I'm here to help! What do you need assistance with?",
                "I'd be happy to help you. Please tell me what you need.",
                "How can I assist you today?"
            ],
            "transfer": [
                "I'll connect you with a human agent right away.",
                "Let me transfer you to a representative who can help.",
                "I'm connecting you with someone who can better assist you."
            ],
            "appointment": [
                "I can help you schedule an appointment. What type of service do you need?",
                "I'd be happy to book an appointment for you. When would you like to come in?",
                "Let me help you schedule a visit. What works best for you?"
            ],
            "billing": [
                "I can help you with billing questions. What specific billing issue are you having?",
                "I'm here to help with payment and billing concerns. What can I assist you with?",
                "Let me help you with your billing inquiry. What do you need to know?"
            ],
            "technical_support": [
                "I understand you're having technical issues. Let me help you resolve this.",
                "I'm sorry you're experiencing problems. Let's work together to fix this.",
                "Technical support is what I'm here for. What issue are you facing?"
            ]
        }

        return suggestions.get(intent, ["I'm here to help. How can I assist you?"])
