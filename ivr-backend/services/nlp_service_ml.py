import re
import logging
from typing import Tuple, List, Dict, Any, Optional
import asyncio
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class MalayalamIntent:
    name: str
    confidence: float
    entities: Dict[str, Any]
    language: str  # 'malayalam' or 'manglish'

@dataclass
class MalayalamEntity:
    type: str
    value: str
    start: int
    end: int
    language: str

class MalayalamNLPService:
    def __init__(self):
        self.malayalam_intent_patterns = self._load_malayalam_intent_patterns()
        self.manglish_intent_patterns = self._load_manglish_intent_patterns()
        self.malayalam_entity_patterns = self._load_malayalam_entity_patterns()
        self.manglish_entity_patterns = self._load_manglish_entity_patterns()
        
        # Enhanced Malayalam cultural and contextual patterns
        self.cultural_patterns = {
            'respectful_address': {
                'malayalam': ['സർ', 'മാം', 'മാഷ്', 'ടീച്ചർ', 'ചേട്ടൻ', 'ചേച്ചി', 'അമ്മ', 'അച്ഛൻ', 'മുത്തശ്ശി', 'മുത്തശ്ശൻ'],
                'manglish': ['sir', 'mam', 'mash', 'teacher', 'chetan', 'chechi', 'amma', 'achan', 'muthassi', 'muthassan']
            },
            'informal_address': {
                'malayalam': ['മോനേ', 'മോളേ', 'എടാ', 'എടി', 'ബാബു', 'കുട്ടി', 'ഡാ', 'ഡി'],
                'manglish': ['mone', 'mole', 'eda', 'edi', 'babu', 'kutti', 'da', 'di']
            },
            'religious_context': {
                'malayalam': ['ദൈവം', 'ഭഗവാൻ', 'അള്ളാഹ്', 'യേശു', 'കൃഷ്ണൻ', 'ശിവൻ', 'ഗണപതി'],
                'manglish': ['daivam', 'bhagawan', 'allah', 'yesu', 'krishnan', 'shivan', 'ganapathi']
            },
            'family_hierarchy': {
                'malayalam': ['വലിയച്ഛൻ', 'വലിയമ്മ', 'ചെറിയച്ഛൻ', 'ചെറിയമ്മ', 'ചിറ്റപ്പൻ', 'അണിയൻ', 'അഗ്രജൻ'],
                'manglish': ['valiyachan', 'valiyamma', 'cheriyachan', 'cheriyamma', 'chirappan', 'aniyan', 'agrajan']
            },
            'festival_context': {
                'malayalam': ['ഓണം', 'വിഷു', 'ദീപാവലി', 'ഈദ്', 'ക്രിസ്മസ്', 'പൂരം', 'തിരുവാതിര'],
                'manglish': ['onam', 'vishu', 'deepavali', 'eid', 'christmas', 'pooram', 'thiruvatira']
            },
            'age_respect_markers': {
                'malayalam': ['മുതിർന്നവർ', 'വൃദ്ധർ', 'യുവാക്കൾ', 'കുട്ടികൾ', 'പ്രായമായവർ'],
                'manglish': ['muthirnavar', 'vridhar', 'yuvaakkal', 'kuttikall', 'prayamayavar']
            },
            'regional_indicators': {
                'malayalam': ['തിരുവിതാംകൂർ', 'മലബാർ', 'കൊച്ചി', 'തൃശ്ശൂർ', 'കണ്ണൂർ'],
                'manglish': ['thiruvithankur', 'malabar', 'kochi', 'thrissur', 'kannur']
            },
            'social_hierarchy': {
                'malayalam': ['ജാതി', 'കുലം', 'വർണ്ണം', 'സമുദായം', 'മതം'],
                'manglish': ['jaathi', 'kulam', 'varnam', 'samudayam', 'matham']
            },
            'politeness_levels': {
                'high': {
                    'malayalam': ['താങ്കൾ', 'അവിടുന്ന്', 'തിരുമുമ്പിൽ', 'അങ്ങ്', 'ബഹുമാനപൂർവം'],
                    'manglish': ['thankall', 'avidunnu', 'thirumumshil', 'angu', 'bahumanapoorvam']
                },
                'medium': {
                    'malayalam': ['നിങ്ങൾ', 'തങ്ങൾ', 'സാർ', 'മാഡം'],
                    'manglish': ['ningall', 'thankall', 'sir', 'madam']
                },
                'low': {
                    'malayalam': ['നീ', 'ഇവൻ', 'ഇവൾ', 'അവൻ', 'അവൾ'],
                    'manglish': ['nee', 'ivan', 'ival', 'avan', 'aval']
                }
            }
        }
        
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return len(self.malayalam_intent_patterns) > 0
        except Exception as e:
            logger.error(f"Malayalam NLP service health check failed: {e}")
            return False
    
    async def analyze_cultural_context(self, text: str, language: str = "ml") -> Dict[str, Any]:
        """
        Analyze cultural context in Malayalam/Manglish text
        
        Args:
            text: Input text to analyze
            language: Language code ("ml" for Malayalam, "en" for Manglish)
        
        Returns:
            Dictionary containing cultural context information
        """
        try:
            cultural_context = {
                'politeness_level': 'medium',
                'formality': 'neutral',
                'respect_markers': [],
                'family_context': [],
                'religious_context': [],
                'regional_context': [],
                'age_considerations': [],
                'gender_considerations': [],
                'festival_context': [],
                'social_hierarchy': [],
                'cultural_sensitivity_score': 0.5
            }
            
            text_lower = text.lower()
            language_key = 'malayalam' if language == 'ml' else 'manglish'
            
            # Analyze politeness level
            politeness_score = {'high': 0, 'medium': 0, 'low': 0}
            
            for level, markers in self.cultural_patterns['politeness_levels'].items():
                if language_key in markers:
                    for marker in markers[language_key]:
                        if marker.lower() in text_lower:
                            politeness_score[level] += 1
            
            # Determine predominant politeness level
            if politeness_score['high'] > 0:
                cultural_context['politeness_level'] = 'high'
                cultural_context['formality'] = 'formal'
                cultural_context['cultural_sensitivity_score'] += 0.3
            elif politeness_score['low'] > 0:
                cultural_context['politeness_level'] = 'low'
                cultural_context['formality'] = 'informal'
                cultural_context['cultural_sensitivity_score'] -= 0.2
            
            # Check for respect markers
            for marker in self.cultural_patterns['respectful_address'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['respect_markers'].append(marker)
                    cultural_context['cultural_sensitivity_score'] += 0.1
            
            # Check for family hierarchy markers
            for marker in self.cultural_patterns['family_hierarchy'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['family_context'].append(marker)
                    cultural_context['cultural_sensitivity_score'] += 0.1
            
            # Check for religious context
            for marker in self.cultural_patterns['religious_context'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['religious_context'].append(marker)
                    cultural_context['cultural_sensitivity_score'] += 0.15
            
            # Check for festival context
            for marker in self.cultural_patterns['festival_context'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['festival_context'].append(marker)
                    cultural_context['cultural_sensitivity_score'] += 0.1
            
            # Check for regional indicators
            for marker in self.cultural_patterns['regional_indicators'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['regional_context'].append(marker)
            
            # Check for age respect markers
            for marker in self.cultural_patterns['age_respect_markers'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['age_considerations'].append(marker)
                    cultural_context['cultural_sensitivity_score'] += 0.1
            
            # Check for social hierarchy markers
            for marker in self.cultural_patterns['social_hierarchy'][language_key]:
                if marker.lower() in text_lower:
                    cultural_context['social_hierarchy'].append(marker)
                    cultural_context['cultural_sensitivity_score'] += 0.05
            
            # Normalize cultural sensitivity score
            cultural_context['cultural_sensitivity_score'] = min(cultural_context['cultural_sensitivity_score'], 1.0)
            
            return cultural_context
            
        except Exception as e:
            logger.error(f"Error analyzing cultural context: {str(e)}")
            return {
                'politeness_level': 'medium',
                'formality': 'neutral',
                'respect_markers': [],
                'family_context': [],
                'religious_context': [],
                'regional_context': [],
                'age_considerations': [],
                'gender_considerations': [],
                'festival_context': [],
                'social_hierarchy': [],
                'cultural_sensitivity_score': 0.5
            }
    
    def generate_culturally_appropriate_response(self, intent: str, cultural_context: Dict[str, Any], language: str = "ml") -> str:
        """
        Generate culturally appropriate response based on detected cultural context
        
        Args:
            intent: Detected intent
            cultural_context: Cultural context analysis result
            language: Response language
        
        Returns:
            Culturally appropriate response string
        """
        try:
            responses = {
                'malayalam': {
                    'greeting': {
                        'high': 'ആദരപൂർവം നമസ്കാരം. താങ്കളെ എങ്ങനെ സഹായിക്കാം?',
                        'medium': 'നമസ്കാരം. എനിക്ക് എങ്ങനെ സഹായിക്കാം?',
                        'low': 'ഹായ്! എന്താ വേണ്ടത്?'
                    },
                    'help': {
                        'high': 'താങ്കളുടെ സേവനത്തിൽ ഞാൻ. എന്ത് സഹായം വേണം?',
                        'medium': 'സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് വേണ്ടത്?',
                        'low': 'പറയൂ, എന്ത് പ്രശ്നമാണ്?'
                    },
                    'goodbye': {
                        'high': 'നന്ദി. താങ്കൾക്ക് ശുഭദിനം.',
                        'medium': 'നന്ദി. വീണ്ടും കാണാം.',
                        'low': 'ബൈ! വീണ്ടും വരണേ.'
                    }
                },
                'manglish': {
                    'greeting': {
                        'high': 'Respectful namaskaram. How may I assist you?',
                        'medium': 'Namaskaram. How can I help you?',
                        'low': 'Hi! What do you need?'
                    },
                    'help': {
                        'high': 'I am at your service. What assistance do you need?',
                        'medium': 'Ready to help. What do you need?',
                        'low': 'Tell me, what\'s the problem?'
                    },
                    'goodbye': {
                        'high': 'Thank you. Have a blessed day.',
                        'medium': 'Thank you. See you again.',
                        'low': 'Bye! Come back again.'
                    }
                }
            }
            
            lang_key = 'malayalam' if language == 'ml' else 'manglish'
            politeness = cultural_context.get('politeness_level', 'medium')
            
            # Add religious blessing if religious context detected
            response = responses.get(lang_key, {}).get(intent, {}).get(politeness, '')
            
            if cultural_context.get('religious_context'):
                if language == 'ml':
                    response += ' ദൈവത്തിന്റെ അനുഗ്രഹം ഉണ്ടാകട്ടെ.'
                else:
                    response += ' May God bless you.'
            
            # Add festival greetings if festival context detected
            if cultural_context.get('festival_context'):
                if language == 'ml':
                    response += ' ഉത്സവാശംസകൾ!'
                else:
                    response += ' Festival greetings!'
            
            return response if response else 'എങ്ങനെ സഹായിക്കാം?' if language == 'ml' else 'How can I help?'
            
        except Exception as e:
            logger.error(f"Error generating culturally appropriate response: {str(e)}")
            return 'എങ്ങനെ സഹായിക്കാം?' if language == 'ml' else 'How can I help?'
    
    async def analyze_malayalam_intent(self, text: str, language: str = "ml") -> Tuple[str, Dict[str, Any], float, str]:
        """
        Analyze Malayalam/Manglish text to determine intent and extract entities
        
        Args:
            text: Input text
            language: Language code (ml, manglish)
        
        Returns:
            Tuple of (intent, entities, confidence, detected_language)
        """
        try:
            if not text.strip():
                return "unknown", {}, 0.0, language
            
            text = text.strip()
            detected_language = self._detect_language_variant(text)
            
            # Choose appropriate pattern set
            if detected_language == "manglish":
                patterns = self.manglish_intent_patterns
                entity_patterns = self.manglish_entity_patterns
            else:
                patterns = self.malayalam_intent_patterns
                entity_patterns = self.malayalam_entity_patterns
            
            # Check each intent pattern
            best_intent = "unknown"
            best_entities = {}
            best_confidence = 0.0
            
            for intent_name, intent_patterns in patterns.items():
                for pattern in intent_patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        confidence = self._calculate_malayalam_confidence(text, pattern, detected_language)
                        if confidence > best_confidence:
                            best_confidence = confidence
                            best_intent = intent_name
                            
                            # Extract entities
                            entities = self._extract_malayalam_entities(text, intent_name, entity_patterns)
                            best_entities = entities
            
            # If no intent matched, try contextual analysis
            if best_intent == "unknown":
                best_intent = self._contextual_malayalam_analysis(text, detected_language)
                best_confidence = 0.5
            
            # Add cultural context to entities
            best_entities.update(self._extract_cultural_context(text, detected_language))
            
            logger.info(f"Malayalam intent detected: {best_intent} (confidence: {best_confidence:.2f}, language: {detected_language})")
            return best_intent, best_entities, best_confidence, detected_language
            
        except Exception as e:
            logger.error(f"Error analyzing Malayalam intent: {str(e)}")
            return "unknown", {}, 0.0, language
    
    def _detect_language_variant(self, text: str) -> str:
        """Detect if text is Malayalam or Manglish"""
        # Check for Malayalam characters
        malayalam_chars = ['ം', 'ഃ', 'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'റ', 'ല', 'ള', 'ഴ', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'ൺ', 'ൻ', 'ർ', 'ൽ', 'ൾ', 'ൿ']
        
        malayalam_char_count = sum(1 for char in text if char in malayalam_chars)
        total_chars = len(text.replace(' ', ''))
        
        if total_chars == 0:
            return "unknown"
        
        malayalam_ratio = malayalam_char_count / total_chars
        
        if malayalam_ratio > 0.3:
            return "malayalam"
        else:
            return "manglish"
    
    def _load_malayalam_intent_patterns(self) -> Dict[str, List[str]]:
        """Load Malayalam intent patterns"""
        patterns = {
            "greeting": [
                r'\b(നമസ്കാരം|ഹായ്|സുഖം|എങ്ങനെ ഇരിക്കുന്നു|വണക്കം)\b',
                r'\b(സുപ്രഭാതം|ശുഭ രാവിലെ|ശുഭ സന്ധ്യ)\b'
            ],
            "goodbye": [
                r'\b(നന്ദി|വീണ്ടും കാണാം|പിരിയുന്നു|ബൈ)\b',
                r'\b(മിണ്ടാതെ|ശുഭ യാത്ര)\b'
            ],
            "help": [
                r'\b(സഹായം|സഹായം വേണം|സഹായം തേടുന്നു|ഒന്ന് സഹായിക്കും)\b',
                r'\b(എനിക്ക് സഹായം ചെയ്യാമോ|സഹായിക്കൂ)\b'
            ],
            "yes": [
                r'\b(അതെ|ശരി|ഉണ്ട്|വേണം|ശരിയാണ്|അതേ)\b',
                r'\b(ഉവ്വ്|ചേട്ട|മാഷ്)\b'
            ],
            "no": [
                r'\b(അല്ല|ഇല്ല|വേണ്ട|ആവശ്യമില്ല|ഇല്ലെങ്കിൽ)\b',
                r'\b(ഇല്ലേ|വേണ്ടേ|അല്ലേ)\b'
            ],
            "transfer": [
                r'\b(ട്രാൻസ്ഫർ|മറ്റൊരാൾക്ക്|ഉദ്യോഗസ്ഥൻ|മനുഷ്യൻ|ഉദ്യോഗസ്ഥയെ സംസാരിക്കാൻ)\b',
                r'\b(ഉദ്യോഗസ്ഥനെ തരാൻ|മറ്റൊരാൾ വേണം)\b'
            ],
            "appointment": [
                r'\b(അപ്പോയിന്റ്മെന്റ്|സമയം|തീയതി|കാണിക്കുക|ബുക്ക് ചെയ്യുക)\b',
                r'\b(റണ്ടാം തവണ|വീണ്ടും കാണണം|ഷെഡ്യൂൾ ചെയ്യുക)\b'
            ],
            "billing": [
                r'\b(ബിൽ|പേയ്‌മെന്റ്|ചാർജ്|തുക|അടവ്|ക്രെഡിറ്റ് കാർഡ്)\b',
                r'\b(ബിൽ അടയ്ക്കാൻ|പേയ്‌മെന്റ് ചെയ്യാൻ|ബിൽ അറിയാൻ)\b'
            ],
            "technical_support": [
                r'\b(സാങ്കേതിക|ടെക്നിക്കൽ|പ്രശ്നം|ഇല്ലാതാകുന്നു|പ്രവർത്തിക്കുന്നില്ല)\b',
                r'\b(സിസ്റ്റം|സോഫ്റ്റ്‌വെയർ|ഹാർഡ്‌വെയർ|ഇന്റർനെറ്റ്)\b'
            ],
            "information": [
                r'\b(വിവരം|അറിയാൻ|പറയൂ|എന്താണ്|എങ്ങനെ|എവിടെ)\b',
                r'\b(വിശദമായി|കൂടുതൽ അറിയാൻ|വിശദീകരിക്കൂ)\b'
            ],
            "complaint": [
                r'\b(പരാതി|പ്രശ്നം|അസന്തുഷ്ടം|ദേഷ്യം|പ്രശ്നമുണ്ട്)\b',
                r'\b(എനിക്ക് ഇഷ്ടമില്ല|ശരിയായില്ല|തെറ്റ്)\b'
            ],
            "emergency": [
                r'\b(അടിയന്തരം|അടിയന്തര സഹായം|പെട്ടെന്ന്|ഉടന്|അപകടം)\b',
                r'\b(ആശുപത്രി|ഡോക്ടർ|പോലീസ്|ഫയർ സർവീസ്)\b'
            ],
            # Ride-hailing intents
            "book_ride": [
                r'\b(ടാക്സി|കാർ|ഓട്ടോ|വാഹനം|റൈഡ്|കാബ്|ബുക്ക് ചെയ്യുക|ഓർഡർ ചെയ്യുക)\b',
                r'\b(വാഹനം വേണം|കാർ വേണം|ടാക്സി വേണം|യാത്ര ചെയ്യാൻ)\b'
            ],
            "ride_status": [
                r'\b(റൈഡ് സ്റ്റാറ്റസ്|എവിടെ|എത്തിയോ|എത്തും|കാത്തിരിക്കുക)\b',
                r'\b(ഡ്രൈവർ എവിടെ|കാർ എവിടെ|എത്ര നേരം|യാത്ര നിലവിലെ)\b'
            ],
            "cancel_ride": [
                r'\b(റൈഡ് റദ്ദാക്കുക|കാൻസൽ|റദ്ദാക്കുക|വേണ്ട|നിർത്തുക)\b',
                r'\b(യാത്ര റദ്ദാക്കുക|ബുക്കിംഗ് റദ്ദാക്കുക|ആവശ്യമില്ല)\b'
            ],
            "change_destination": [
                r'\b(ലക്ഷ്യസ്ഥാനം മാറ്റുക|ഡ്രോപ്പ് മാറ്റുക|സ്ഥലം മാറ്റുക)\b',
                r'\b(മറ്റൊരു സ്ഥലത്ത്|പോകേണ്ടത് മാറി|വേറെ സ്ഥലം)\b'
            ],
            "payment_issue": [
                r'\b(പേയ്‌മെന്റ് പ്രശ്നം|പണം|ചാർജ്|ബിൽ|ക്രെഡിറ്റ്)\b',
                r'\b(റൈഡ് ചാർജ്|യാത്ര തുക|പേയ്‌മെന്റ് പരാജയം)\b'
            ],
            "driver_issue": [
                r'\b(ഡ്രൈവർ പ്രശ്നം|ഡ്രൈവർ വരുന്നില്ല|ഡ്രൈവർ പോയി)\b',
                r'\b(ഡ്രൈവർ പിക്കപ്പ് ചെയ്യുന്നില്ല|വാഹനം കിട്ടുന്നില്ല)\b'
            ],
            "safety_emergency": [
                r'\b(സുരക്ഷിതമല്ല|അപകടം|ആക്രമണം|സഹായം വേണം)\b',
                r'\b(പോലീസ് വിളിക്കുക|അടിയന്തര സഹായം|റൈഡിൽ പ്രശ്നം)\b'
            ],
            "fare_estimate": [
                r'\b(കൂലി എത്ര|ചാർജ് എത്ര|ഫെയർ|വില|തുക എത്ര)\b',
                r'\b(യാത്ര ചിലവ്|ഏത്ര രൂപ|കണക്ക് പറയൂ)\b'
            ],
            "share_trip": [
                r'\b(യാത്ര പങ്കിടുക|ഷെയർ|പങ്കാളി|കൂടെ പോകുക)\b',
                r'\b(ഷെയർ റൈഡ്|പങ്കിട്ടു പോകുക|കൂട്ടുകാർ)\b'
            ],
            "schedule_ride": [
                r'\b(ഷെഡ്യൂൾ|നാളെ|പിന്നീട്|നിശ്ചിത സമയം|ബുക്ക് ചെയ്യുക)\b',
                r'\b(മുൻകൂട്ടി ബുക്ക്|നിശ്ചിത യാത്ര|സമയം നിശ്ചയിക്കുക)\b'
            ],
            "ride_type": [
                r'\b(ഓട്ടോ|കാർ|ബൈക്ക്|ഷെയർ|എസി|നോൺ എസി|ലക്ഷ്വറി)\b',
                r'\b(വാഹനം തരം|തരം തിരഞ്ഞെടുകക|്കുതരം മാറ്റുക)\b'
            ],
            "pickup_location": [
                r'\b(പിക്കപ്പ്|എവിടെ നിന്ന്|എവിടെ നിൽക്കുക|എവിടെ വരാം)\b',
                r'\b(എന്റെ സ്ഥാനം|നിലവിലെ സ്ഥലം|പിക്കപ്പ് സ്ഥലം)\b'
            ],
            "drop_location": [
                r'\b(ഡ്രോപ്പ്|എവിടെയ്ക്ക്|ലക്ഷ്യസ്ഥാനം|എവിടെ പോകണം)\b',
                r'\b(എന്റെ ലക്ഷ്യം|അവസാന സ്ഥലം|ലക്ഷ്യസ്ഥാനം)\b'
            ],
            # Cultural Considerations - Malayalam Intent Patterns
            "respectful_greeting": [
                r'\b(നമസ്കാരം സർ|നമസ്കാരം മാം|നമസ്കാരം മാഷേ|നമസ്കാരം ടീച്ചർ)\b',
                r'\b(വണക്കം സാർ|വണക്കം മിസ്സ്|ആദരവോടെ|ബഹുമാനപൂർവം)\b',
                r'\b(കാൽകഴുകി വന്ദനം|സാദര നമസ്കാരം|പ്രണാമം)\b'
            ],
            "informal_greeting": [
                r'\b(ഹായ് ചേട്ടാ|ഹായ് ചേച്ചി|എന്താടാ|എന്താടി)\b',
                r'\b(സുഖമായിരിക്കുന്നോ കുട്ടി|എങ്ങനെയുണ്ട് മോനേ|എങ്ങനെയുണ്ട് മോളേ)\b',
                r'\b(ആഹാൻ|ഹലോ ബ്രോ|ഹലോ സിസ്റ്റർ|കൊള്ളാമല്ലോ)\b'
            ],
            "elder_respect": [
                r'\b(അച്ഛൻ|അമ്മ|മുത്തശ്ശി|മുത്തശ്ശൻ|മുത്തശ്ശി അമ്മ)\b',
                r'\b(ചിറ്റപ്പൻ|വലിയച്ഛൻ|വലിയമ്മ|ചെറിയമ്മ|ഏട്ടൻ|ചേട്ടൻ)\b',
                r'\b(അജ്ജി|അപ്പൂപ്പൻ|ഉമ്മാച്ചി|ഇക്കാ|എത്തായി|എത്തി)\b',
                r'\b(മാമൻ|മാമി|അമ്മാവൻ|അമ്മായി|മാവേലി|മാവേലി അച്ഛൻ)\b'
            ],
            "family_hierarchy": [
                r'\b(കുടുംബത്തിലെ മൂത്തവൻ|കുടുംബപ്രമുഖൻ|വീട്ടിലെ മുതിർന്നവർ)\b',
                r'\b(ചെറുത്തവൻ|കുട്ടി|പിള്ള|ബാലൻ|ബാല|കുഞ്ഞ്)\b',
                r'\b(അണിയൻ|അനുജൻ|അഗ്രജൻ|സഹോദരൻ|സഹോദരി)\b'
            ],
            "religious_greetings": [
                r'\b(അസ്സലാമു അലൈകും|വ്വലൈകുമുസ്സലാം|ആമീൻ)\b',
                r'\b(ഓം നമഃ ശിവായ|ഹരേ കൃഷ്ണ|ജയ് ശ്രീ രാം)\b',
                r'\b(ക്രിസ്തു ദൈവത്തിന്റെ അനുഗ്രഹം|യേശുവിന്റെ അനുഗ്രഹം)\b',
                r'\b(ഗുരുവായൂരപ്പന്റെ അനുഗ്രഹം|അമ്മേ നാരായണ)\b'
            ],
            "festival_references": [
                r'\b(ഓണം|വിഷു|ദീപാവലി|ഹോളി|ഈദ്|ക്രിസ്മസ്)\b',
                r'\b(നവരാത്രി|ദുർഗാഷ്ടമി|അഷ്ടമി രോഹിണി|തിരുവാതിര)\b',
                r'\b(പൂരം|തൃശ്ശൂർ പൂരം|അരട്ട്|തിരുവോണം|ഉത്രാടം)\b',
                r'\b(മകര വിളക്ക്|സബരിമല|പദ്മനാഭസ്വാമി|ഗുരുവായൂർ)\b'
            ],
            "cultural_food": [
                r'\b(സാധ്യ|ഓണസാധ്യ|വിഷുക്കാണി|പായസം|അപ്പം)\b',
                r'\b(പുട്ട്|കടല കറി|ഫിഷ് കറി|സാമ്പാർ|റസം)\b',
                r'\b(ദോശ|ഇഡ്ഡലി|ഉത്തപ്പം|പൊറോട്ട|ചപ്പാത്തി)\b',
                r'\b(പലാദ|അച്ചാർ|തോരൻ|ഓല്ലം|എരിശ്ശേരി)\b'
            ],
            "marriage_customs": [
                r'\b(കല്യാണം|വിവാഹം|താലി കെട്ടൽ|സപ്തപദി)\b',
                r'\b(നിശ്ചയം|അഗ്നിസാക്ഷി|മാംഗല്യം|തിരുമാംഗല്യം)\b',
                r'\b(പൂജ്യപാദം|ആദരാഞ്ജലി|പാണിഗ്രഹണം|മുഹൂർത്തം)\b'
            ],
            "birth_rituals": [
                r'\b(ജാതകർമം|നാമകരണം|ചോറൂണ്|അക്ഷരാഭ്യാസം)\b',
                r'\b(ഉപനയനം|വിദ്യാരംഭം|അന്നപ്രാശനം|കർണവേധം)\b'
            ],
            "death_rituals": [
                r'\b(ശ്രാദ്ധം|പിണ്ഡദാനം|തർപ്പണം|സംസ്കാരം)\b',
                r'\b(അന്ത്യേഷ്ടി|ദഹനം|കുടുംബദീപം|പിതൃപക്ഷം)\b'
            ],
            "caste_considerations": [
                r'\b(ജാതി|വർണ്ണം|കുലം|ഗോത്രം|സമുദായം)\b',
                r'\b(ബ്രാഹ്മണൻ|ക്ഷത്രിയൻ|വൈശ്യൻ|ശൂദ്രൻ|ദലിത്)\b',
                r'\b(നായർ|മേനോൻ|പിള്ള|കുറുപ്പ്|നമ്പൂതിരി|പോത്തി)\b'
            ],
            "gender_respect": [
                r'\b(സ്ത്രീ|പുരുഷൻ|മഹിള|സ്ത്രീകൾക്കുള്ള ആദരവ്)\b',
                r'\b(അമ്മായി|ചേച്ചി|പെങ്ങൾ|മകൾ|മരുമകൾ)\b',
                r'\b(മൂത്ത സ്ത്രീ|യുവതി|പ്രായമായ സ്ത്രീ|ഗർഭിണി)\b'
            ],
            "age_respect": [
                r'\b(മുതിർന്നവർ|വൃദ്ധർ|പ്രായമായവർ|മുതുകിട)\b',
                r'\b(യുവജനങ്ങൾ|കുട്ടികൾ|ബാലകർ|കൗമാരക്കാർ)\b',
                r'\b(അധികാരി|മുതിർന്ന ഉദ്യോഗസ്ഥൻ|സീനിയർ|ജൂനിയർ)\b'
            ],
            "regional_dialects": [
                r'\b(തിരുവിതാംകൂർ|മലബാർ|കൊച്ചി|പാലക്കാട്)\b',
                r'\b(വടക്കൻ മലയാളം|തെക്കൻ മലയാളം|നടുത്തരം)\b',
                r'\b(തൃശൂർ ഭാഷ|കണ്ണൂർ ഭാഷ|കോട്ടയം ഭാഷ)\b'
            ],
            "traditional_occupations": [
                r'\b(കൃഷിക്കാരൻ|മത്സ്യത്തൊഴിലാളി|തച്ചൻ|കമ്മാരൻ)\b',
                r'\b(വയനാട്ടുകാരൻ|തോട്ടക്കാരൻ|പടവലൻ|ചെറുകിട കൃഷിക്കാരൻ)\b',
                r'\b(കളരിപ്പയറ്റ് ഗുരു|ആയുർവേദ വൈദ്യൻ|ജ്യോതിഷി)\b'
            ],
            "social_etiquette": [
                r'\b(മര്യാദ|നന്മ|ശിഷ്ടാചാരം|സഭ്യത|അച്ചടക്കം)\b',
                r'\b(വിനയം|താഴ്മ|ബഹുമാനം|ആദരവ്|കീഴ്പെടൽ)\b',
                r'\b(അതിഥിദേവോ ഭവ|മാതൃദേവോ ഭവ|പിതൃദേവോ ഭവ)\b'
            ],
            "linguistic_politeness": [
                r'\b(താങ്കൾ|നിങ്ങൾ|അങ്ങ്|തങ്ങൾ|അവിടുന്ന്)\b',
                r'\b(തിരുമുമ്പിൽ|അടിയൻ|ദാസൻ|സേവകൻ|ഭക്തൻ)\b',
                r'\b(കൃപ|അനുഗ്രഹം|അനുവാദം|ആശീർവാദം)\b'
            ],
            "cultural_taboos": [
                r'\b(പുണ്യവാനായ|അപവിത്രം|മലിനം|ദോഷം|തൊടരുത്)\b',
                r'\b(മന്ത്രവാദം|തന്ത്രം|ദൈവക്കോപം|ശാപം|വിധി)\b',
                r'\b(ചൊവ്വാഴ്ച|വെള്ളിയാഴ്ച|അമാവാസി|പൂർണിമ)\b'
            ]
        }
        return patterns
    
    def _load_manglish_intent_patterns(self) -> Dict[str, List[str]]:
        """Load Manglish (Malayalam in English) intent patterns"""
        patterns = {
            "greeting": [
                r'\b(namaskaram|hai|sukham|engane irikkunnu|vanakkam)\b',
                r'\b(good morning|suprabhatham|subha sandhya)\b'
            ],
            "goodbye": [
                r'\b(nandi|vittu kanam|piriyunnu|bye)\b',
                r'\b(millate|subha yathra)\b'
            ],
            "help": [
                r'\b(sahayam|sahayam vendam|sahayam thedunnu|onn sahayikkum)\b',
                r'\b(enikk sahayam cheyyamo|sahayikkoo)\b'
            ],
            "yes": [
                r'\b(athe|sari|undu|vendam|sariyanu|athe)\b',
                r'\b(uvu|chetta|mash|chetta)\b'
            ],
            "no": [
                r'\b(alla|illa|vendath|avashyamilla|illenkil)\b',
                r'\b(ille|vendathe|alle)\b'
            ],
            "transfer": [
                r'\b(transfer|matte aalkku|udyogasthan|manushyan|udyogasthaye samsarikan)\b',
                r'\b(udyogasthan tharan|matte aal venam)\b'
            ],
            "appointment": [
                r'\b(appointment|samayam|thee|kanikkunnu|book cheyyukka)\b',
                r'\b(randam thavam|vittu kanam|schedule cheyyukka)\b'
            ],
            "billing": [
                r'\b(bill|payment|charge|thunaku|adavu|credit card)\b',
                r'\b(bill adakkan|payment cheyyan|bill ariyan)\b'
            ],
            "technical_support": [
                r'\b(technical|problem|illathunnu|pravarthikkunilla|issue)\b',
                r'\b(system|software|hardware|internet)\b'
            ],
            "information": [
                r'\b(vivaram|ariyan|parayoo|enthanu|engane|evide)\b',
                r'\b(visudhaya|koodal ariyan|visudharikkoo)\b'
            ],
            "complaint": [
                r'\b(parathy|problem|asanthusham|deshyam|problemundu)\b',
                r'\b(enikk ishtamilla|sariyalla|thettu)\b'
            ],
            "emergency": [
                r'\b(adiyantharam|adiyanthra sahayam|pettennu|udan|apadu)\b',
                r'\b(ashupathi|doctor|police|fire service)\b'
            ],
            # Ride-hailing intents in Manglish
            "book_ride": [
                r'\b(taxi|car|auto|vehicle|ride|cab|book cheyyukka|order cheyyukka)\b',
                r'\b(vehicle vendam|car vendam|taxi vendam|yathra cheyyan)\b'
            ],
            "ride_status": [
                r'\b(ride status|evide|ethiyo|ethum|kathirikkuka)\b',
                r'\b(driver evide|car evide|ethra neram|yathra nilavile)\b'
            ],
            "cancel_ride": [
                r'\b(ride cancel|cancel|cancel cheyyuka|vendam|nirthukka)\b',
                r'\b(yathra cancel cheyyuka|booking cancel cheyyuka|avashyamilla)\b'
            ],
            "change_destination": [
                r'\b(destination change|drop change|sthalam mathukka)\b',
                r'\b(matte oru sthathil|pokendath mathi|vere sthalam)\b'
            ],
            "payment_issue": [
                r'\b(payment issue|panam|charge|bill|credit)\b',
                r'\b(ride charge|yathra thuka|payment parajayam)\b'
            ],
            "driver_issue": [
                r'\b(driver problem|driver varunilla|driver poyi)\b',
                r'\b(driver pickup cheyyunilla|vehicle kittunilla)\b'
            ],
            "safety_emergency": [
                r'\b(safety illa|apadu|akramanam|sahayam vendam)\b',
                r'\b(police vilikkuka|adiyanthra sahayam|ride il problem)\b'
            ],
            "fare_estimate": [
                r'\b(kooli ethra|charge ethra|fare|vila|thukka ethra)\b',
                r'\b(yathra chilavu|ethra roopa|kanak parayoo)\b'
            ],
            "share_trip": [
                r'\b(yathra pankidukka|share|pankali|kude pokuka)\b',
                r'\b(share ride|pankidittu pokuka|kootukar)\b'
            ],
            "schedule_ride": [
                r'\b(schedule|nale|pinnitt|nischita samayam|book cheyyukka)\b',
                r'\b(munkoodi book|nischita yathra|samayam nischayikkuka)\b'
            ],
            "ride_type": [
                r'\b(auto|car|bike|share|ac|non ac|luxury)\b',
                r'\b(vehicle tharam|tham thiranneetukka|tharam mathukka)\b'
            ],
            "pickup_location": [
                r'\b(pickup|evide ninnum|evide nilukka|evide varam)\b',
                r'\b(ente sthanam|nilavile sthalam|pickup sthalam)\b'
            ],
            "drop_location": [
                r'\b(drop|evideykk|lakshyasthanam|evide pokanam)\b',
                r'\b(ente lakshyam|avasan sthalam|lakshyasthanam)\b'
            ],
            # Cultural Considerations - Manglish Intent Patterns
            "respectful_greeting": [
                r'\b(namaskaram sir|namaskaram mam|namaskaram mashe|namaskaram teacher)\b',
                r'\b(vanakkam sir|vanakkam miss|adaravode|bahumanapoorvam)\b',
                r'\b(kalkakuki vandanam|sadar namaskaram|pranaamam)\b'
            ],
            "informal_greeting": [
                r'\b(hai chetta|hai chechi|enthada|enthadi)\b',
                r'\b(sukhamaayirikkunno kutti|enganeyund mone|enganeyund mole)\b',
                r'\b(aahan|hello bro|hello sister|kollaamallo)\b'
            ],
            "elder_respect": [
                r'\b(achan|amma|muthassi|muthassan|muthassi amma)\b',
                r'\b(chirappan|valiyachan|valiyamma|cheriyamma|ettan|chetan)\b',
                r'\b(ajji|appooppan|ummaachi|ikka|ettayi|etti)\b',
                r'\b(maman|mami|ammavan|ammayi|maveli|maveli achan)\b'
            ],
            "family_hierarchy": [
                r'\b(kudumbathile moothavan|kudumbapramukhan|veetile muthirnavar)\b',
                r'\b(cheruthavan|kutti|pilla|balan|bala|kunju)\b',
                r'\b(aniyan|anujan|agrajan|sahodharan|sahodhari)\b'
            ],
            "religious_greetings": [
                r'\b(assalamu alaikum|vvalaikumussalam|ameen)\b',
                r'\b(om nama shivaya|hare krishna|jai shree ram)\b',
                r'\b(christhu daivathinte anugrahom|yeshuvinte anugrahom)\b',
                r'\b(guruvayurappante anugrahom|amme narayana)\b'
            ],
            "festival_references": [
                r'\b(onam|vishu|deepavali|holi|eid|christmas)\b',
                r'\b(navaratri|durgashtami|ashtami rohini|thiruvatira)\b',
                r'\b(pooram|thrissur pooram|aratt|thiruvonon|uthradom)\b',
                r'\b(makara vilakku|sabarimala|padmanabhaswami|guruvayur)\b'
            ],
            "cultural_food": [
                r'\b(sadhya|ona sadhya|vishukkaani|payasam|appam)\b',
                r'\b(puttu|kadala kari|fish kari|sambar|rasam)\b',
                r'\b(dosa|idali|uthappam|porotta|chapathi)\b',
                r'\b(palada|achar|thoran|ollam|erisheri)\b'
            ],
            "marriage_customs": [
                r'\b(kalyanam|vivaaham|thali kettal|saptapadi)\b',
                r'\b(nischayam|agnisakshi|mangalyam|thirumangalyam)\b',
                r'\b(poojyapadam|adaranjali|panigrahanam|muhurtham)\b'
            ],
            "birth_rituals": [
                r'\b(jatakarma|namakaranam|choroon|aksharabyasam)\b',
                r'\b(upanayanam|vidyarambam|annaprasanam|karnavedham)\b'
            ],
            "death_rituals": [
                r'\b(shraddham|pindadanam|tharppanam|samskaram)\b',
                r'\b(anthyeshti|dahanam|kudumbadeepam|pithrupaksham)\b'
            ],
            "caste_considerations": [
                r'\b(jaathi|varnam|kulam|gothram|samudayam)\b',
                r'\b(brahmanan|kshatriyan|vaishyan|shudhran|dalith)\b',
                r'\b(nair|menon|pillai|kurup|namboothiri|pothi)\b'
            ],
            "gender_respect": [
                r'\b(sthree|purushan|mahila|sthreekalkkulla aadarav)\b',
                r'\b(ammayi|chechi|pengal|makal|marumakal)\b',
                r'\b(mootha sthree|yuvathi|prayamaya sthree|garbhini)\b'
            ],
            "age_respect": [
                r'\b(muthirnavar|vridhar|prayamayavar|muthukida)\b',
                r'\b(yuvajanangal|kuttikall|balakka|kaumarakkar)\b',
                r'\b(adhikari|muthirna udyogasthan|senior|junior)\b'
            ],
            "regional_dialects": [
                r'\b(thiruvithankur|malabar|kochi|palakkad)\b',
                r'\b(vadakan malayalam|thekkan malayalam|nadutharam)\b',
                r'\b(thrissur bhasha|kannur bhasha|kottayam bhasha)\b'
            ],
            "traditional_occupations": [
                r'\b(krishikkaran|mathsyathozhhilali|thachan|kammaran)\b',
                r'\b(vayanattukkaran|thottakkaran|padavalan|cherukida krishikkaran)\b',
                r'\b(kalarippayatt guru|ayurveda vaidyan|jyothishi)\b'
            ],
            "social_etiquette": [
                r'\b(maryadha|nanma|shishtacharam|sabhyatha|achadakkam)\b',
                r'\b(vinayam|thazhma|bahumanam|aadarav|keezhpedal)\b',
                r'\b(athithidevo bhava|matrudevo bhava|pithrudevo bhava)\b'
            ],
            "linguistic_politeness": [
                r'\b(thankall|ningall|angu|thankall|avidunnu)\b',
                r'\b(thirumumshil|adiyan|daasan|sevakan|bhakthan)\b',
                r'\b(kripa|anugrahom|anuvaadam|aashirvadam)\b'
            ],
            "cultural_taboos": [
                r'\b(punyavaanaya|apavithram|malinam|dosham|thodaruth)\b',
                r'\b(manthravaadam|thanthram|daivakkopam|shaapam|vidhi)\b',
                r'\b(chovazcha|velliyazcha|amaavasi|poornima)\b'
            ]
        }
        return patterns
    
    def _load_malayalam_entity_patterns(self) -> Dict[str, str]:
        """Load Malayalam entity extraction patterns"""
        patterns = {
            "phone": r'\b(\+?91?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})\b',
            "email": r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b',
            "time": r'\b(രാവിലെ|ഉച്ച|വൈകുന്നേരം|രാത്രി|ഒന്ന്|രണ്ട്|മൂന്ന്|നാല്|അഞ്ച്|ആറ്|ഏഴ്|എട്ട്|ഒൻപത്|പത്ത്)\s*(മണിക്കൂർ)?\b',
            "date": r'\b(ഇന്ന്|നാളെ|ഇന്നലെ|തിങ്കളാഴ്ച|വ്യാഴാഴ്ച|വെള്ളിയാഴ്ച|ശനിയാഴ്ച)\b',
            "number": r'\b([൦൧൨൩൪൫൬൭൮൯]+|\d+)\b',
            "money": r'\b(രൂപ|രൂപാ|കോടി|ലക്ഷം)\s*([൦൧൨൩൪൫൬൭൮൯]+|\d+)\b',
            "place": r'\b(കേരളം|തിരുവനന്തപുരം|കൊച്ചി|കോഴിക്കോട്|മലപ്പുറം|പാലക്കാട്|കോട്ടയം|കൊല്ലം)\b',
            # Ride-hailing specific entities
            "vehicle_type": r'\b(ഓട്ടോ|കാർ|ബൈക്ക്|സ്കൂട്ടർ|ടാക്സി|കാബ്|ഷെയർ|എസി|നോൺ എസി|ലക്ഷ്വറി|സെഡാൻ|എസ്‌യുവി)\b',
            "ride_fare": r'\b(രൂപ|രൂപാ|കോടി|ലക്ഷം|തുക|കൂലി|ചാർജ്|ഫെയർ)\s*([൦൧൨൩൪൫൬൭൮൯]+|\d+)\b',
            "distance": r'\b([൦൧൨൩൪൫൬൭൮൯]+|\d+)\s*(കിലോമീറ്റർ|കിമീ|മീറ്റർ|കിലോ)\b',
            "time_duration": r'\b([൦൧൨൩൪൫൬൭൮൯]+|\d+)\s*(മിനിറ്റ്|മണിക്കൂർ|മണി|മിനിറ്റ്)\b',
            # Cultural entity patterns for Malayalam
            "cultural_titles": r'\b(സർ|മാം|മാഷ്|ടീച്ചർ|ചേട്ടൻ|ചേച്ചി|അമ്മ|അച്ഛൻ|മുത്തശ്ശി|മുത്തശ്ശൻ)\b',
            "festivals": r'\b(ഓണം|വിഷു|ദീപാവലി|ഹോളി|ഈദ്|ക്രിസ്മസ്|നവരാത്രി|ദുർഗാഷ്ടമി|പൂരം|തൃശ്ശൂർ പൂരം)\b',
            "religious_terms": r'\b(അസ്സലാമു അലൈകും|ഓം നമഃ ശിവായ|ഹരേ കൃഷ്ണ|ജയ് ശ്രീ രാം|ഗുരുവായൂരപ്പൻ|പദ്മനാഭസ്വാമി)\b',
            "family_relations": r'\b(അച്ഛൻ|അമ്മ|ചിറ്റപ്പൻ|വലിയച്ഛൻ|വലിയമ്മ|ചെറിയമ്മ|ഏട്ടൻ|മാമൻ|മാമി|അമ്മാവൻ|അമ്മായി)\b',
            "caste_communities": r'\b(നായർ|മേനോൻ|പിള്ള|കുറുപ്പ്|നമ്പൂതിരി|പോത്തി|ബ്രാഹ്മണൻ|ക്ഷത്രിയൻ|വൈശ്യൻ|ശൂദ്രൻ)\b',
            "kerala_regions": r'\b(തിരുവിതാംകൂർ|മലബാർ|കൊച്ചി|തൃശൂർ|കണ്ണൂർ|കോട്ടയം|പാലക്കാട്|മലപ്പുറം|ഇടുക്കി|വയനാട്)\b',
            "traditional_food": r'\b(സാധ്യ|പുട്ട്|കടല കറി|ഫിഷ് കറി|സാമ്പാർ|ദോശ|ഇഡ്ഡലി|പൊറോട്ട|പായസം|അപ്പം)\b',
            "cultural_items": r'\b(താലി|മാംഗല്യം|മുണ്ട്|കാശാവ്|കലമേഴുത്ത്|നെറിയത്|പവാട|മേൽമുണ്ട്)\b',
            "traditional_arts": r'\b(കളരിപ്പയറ്റ്|കഥകളി|മോഹിനിയാട്ടം|തിരുവാതിരകളി|ചെണ്ട|ചെണ്ടമേളം|പഞ്ചവാദ്യം|തയംബക)\b'
        }
        return patterns
    
    def _load_manglish_entity_patterns(self) -> Dict[str, str]:
        """Load Manglish entity extraction patterns"""
        patterns = {
            "phone": r'\b(\+?91?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})\b',
            "email": r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b',
            "time": r'\b(ravil|ucha|vaykkunna rathri|onn|randu|moonu|nal|anchu|aru|ezhu|ettu|onpathu|pathu)\s*(manikoor)?\b',
            "date": r'\b(innu|nale|innale|tingalazhcha|vyaazhcha|velliyaazhcha|shaniyaazhcha)\b',
            "number": r'\b(\d+)\b',
            "money": r'\b(rupees|rupay|kodi|laksham)\s*(\d+)\b',
            "place": r'\b(keralam|thiruvananthapuram|kochi|kozhikode|malappuram|palakkad|kottayam|kollam)\b',
            # Ride-hailing specific entities in Manglish
            "vehicle_type": r'\b(auto|car|bike|scooter|taxi|cab|share|ac|non ac|luxury|sedan|suv)\b',
            "ride_fare": r'\b(rupees|rupay|kodi|laksham|thukka|kooli|charge|fare)\s*(\d+)\b',
            "distance": r'\b(\d+)\s*(kilometer|km|meter|kilo)\b',
            "time_duration": r'\b(\d+)\s*(minutes|hours|hr|min)\b',
            # Cultural entity patterns for Manglish
            "cultural_titles": r'\b(sir|mam|mash|teacher|chetan|chechi|amma|achan|muthassi|muthassan)\b',
            "festivals": r'\b(onam|vishu|deepavali|holi|eid|christmas|navaratri|durgashtami|pooram|thrissur pooram)\b',
            "religious_terms": r'\b(assalamu alaikum|om nama shivaya|hare krishna|jai shree ram|guruvayurappan|padmanabhaswami)\b',
            "family_relations": r'\b(achan|amma|chirappan|valiyachan|valiyamma|cheriyamma|ettan|maman|mami|ammavan|ammayi)\b',
            "caste_communities": r'\b(nair|menon|pillai|kurup|namboothiri|pothi|brahmanan|kshatriyan|vaishyan|shudhran)\b',
            "kerala_regions": r'\b(thiruvithankur|malabar|kochi|thrissur|kannur|kottayam|palakkad|malappuram|idukki|wayanad)\b',
            "traditional_food": r'\b(sadhya|puttu|kadala kari|fish kari|sambar|dosa|idli|porotta|payasam|appam)\b',
            "cultural_items": r'\b(thali|mangalyam|mundu|kasavu|kalamezhuthu|neriyath|pavada|melmund)\b',
            "traditional_arts": r'\b(kalarippayatt|kathakali|mohiniyattam|thiruvatira kali|chenda|chenda melam|panchavadyam|thayambaka)\b'
        }
        return patterns
    
    def _calculate_malayalam_confidence(self, text: str, pattern: str, language: str) -> float:
        """Calculate confidence score for Malayalam pattern match"""
        try:
            match = re.search(pattern, text, re.IGNORECASE)
            if not match:
                return 0.0
            
            # Base confidence on match length
            match_length = len(match.group())
            text_length = len(text)
            
            if text_length == 0:
                return 0.0
            
            base_confidence = match_length / text_length
            
            # Boost confidence for exact matches
            if match.group().lower() == text.lower():
                base_confidence = min(base_confidence * 1.5, 1.0)
            
            # Additional boost for Malayalam specific patterns
            if language == "malayalam":
                malayalam_chars = ['ം', 'ഃ', 'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'റ', 'ല', 'ള', 'ഴ', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ']
                malayalam_char_count = sum(1 for char in text if char in malayalam_chars)
                if malayalam_char_count > 0:
                    base_confidence += 0.2
            
            return min(base_confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating Malayalam confidence: {str(e)}")
            return 0.0
    
    def _extract_malayalam_entities(self, text: str, intent: str, entity_patterns: Dict[str, str]) -> Dict[str, Any]:
        """Extract Malayalam entities from text"""
        entities = {}
        
        try:
            # Extract general entities
            for entity_type, pattern in entity_patterns.items():
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    entities[entity_type] = matches
            
            # Extract intent-specific entities
            if intent == "appointment":
                entities.update(self._extract_malayalam_appointment_entities(text))
            elif intent == "billing":
                entities.update(self._extract_malayalam_billing_entities(text))
            elif intent == "technical_support":
                entities.update(self._extract_malayalam_support_entities(text))
            elif intent == "emergency":
                entities.update(self._extract_malayalam_emergency_entities(text))
            
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting Malayalam entities: {str(e)}")
            return {}
    
    def _extract_malayalam_appointment_entities(self, text: str) -> Dict[str, Any]:
        """Extract appointment-specific entities"""
        entities = {}
        
        # Service types in Malayalam
        services = {
            "consultation": ["കൺസൾട്ടേഷൻ", "ഡോക്ടറെ കാണുക", "പരിശോധന"],
            "checkup": ["ചെക്കപ്പ്", "പൊതുവായ പരിശോധന", "ആരോഗ്യപരിശോധന"],
            "followup": ["ഫോളോവപ്പ്", "വീണ്ടും കാണൽ", "തുടർപരിശോധന"],
            "emergency": ["അടിയന്തരം", "അപകടം", "ഉടന്"]
        }
        
        for service, keywords in services.items():
            for keyword in keywords:
                if keyword in text:
                    entities["service_type"] = service
                    break
        
        return entities
    
    def _extract_malayalam_billing_entities(self, text: str) -> Dict[str, Any]:
        """Extract billing-specific entities"""
        entities = {}
        
        # Payment methods in Malayalam
        payment_methods = {
            "credit_card": ["ക്രെഡിറ്റ് കാർഡ്", "കാർഡ്", "വിസ", "മാസ്റ്റർകാർഡ്"],
            "debit_card": ["ഡെബിറ്റ് കാർഡ്", "എടിഎം കാർഡ്", "ബാങ്ക് കാർഡ്"],
            "cash": ["പണം", "കാഷ്", "കൈയിൽ നൽകുക"],
            "online": ["ഓൺലൈൻ", "ഇന്റർനെറ്റ്", "ജിപേ", "ഫോൺപേ"]
        }
        
        for method, keywords in payment_methods.items():
            for keyword in keywords:
                if keyword in text:
                    entities["payment_method"] = method
                    break
        
        return entities
    
    def _extract_malayalam_support_entities(self, text: str) -> Dict[str, Any]:
        """Extract technical support entities"""
        entities = {}
        
        # Issue types in Malayalam
        issues = {
            "internet": ["ഇന്റർനെറ്റ്", "വൈഫൈ", "നെറ്റ്‌വർക്ക്", "കണക്ഷൻ"],
            "software": ["സോഫ്റ്റ്‌വെയർ", "ആപ്പ്", "പ്രോഗ്രാം", "ആപ്ലിക്കേഷൻ"],
            "hardware": ["ഹാർഡ്‌വെയർ", "ഡിവൈസ്", "കമ്പ്യൂട്ടർ", "മൊബൈൽ"],
            "account": ["അക്കൗണ്ട്", "ലോഗിൻ", "പാസ്‌വേഡ്", "യൂസർ ഐഡി"]
        }
        
        for issue, keywords in issues.items():
            for keyword in keywords:
                if keyword in text:
                    entities["issue_type"] = issue
                    break
        
        return entities
    
    def _extract_malayalam_emergency_entities(self, text: str) -> Dict[str, Any]:
        """Extract emergency-specific entities"""
        entities = {}
        
        # Emergency types in Malayalam
        emergency_types = {
            "medical": ["ആശുപത്രി", "ഡോക്ടർ", "വൈദ്യൻ", "വൈദ്യശാസ്ത്രം", "മരുന്ന്"],
            "police": ["പോലീസ്", "പൊലീസ്", "സ്റ്റേഷൻ", "കേസ്", "ക്രൈം"],
            "fire": ["ഫയർ", "തീ", "അഗ്നിശമനം", "ഫയർ സർവീസ്"],
            "accident": ["അപകടം", "വാഹനാപകടം", "റോഡ് അപകടം"]
        }
        
        for emergency_type, keywords in emergency_types.items():
            for keyword in keywords:
                if keyword in text:
                    entities["emergency_type"] = emergency_type
                    break
        
        return entities
    
    def _extract_cultural_context(self, text: str, language: str) -> Dict[str, Any]:
        """Extract cultural context from Malayalam text"""
        entities = {}
        
        try:
            # Check for respectful address
            for respect_term in self.cultural_patterns['respectful_address']:
                if respect_term in text:
                    entities['respect_level'] = 'formal'
                    break
            
            # Check for informal address
            for informal_term in self.cultural_patterns['informal_address']:
                if informal_term in text:
                    entities['respect_level'] = 'informal'
                    break
            
            # Check for time references
            for time_ref in self.cultural_patterns['time_references']:
                if time_ref in text:
                    entities['time_context'] = time_ref
                    break
            
            # Check for place references
            for place_ref in self.cultural_patterns['place_references']:
                if place_ref in text:
                    entities['place_context'] = place_ref
                    break
            
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting cultural context: {str(e)}")
            return {}
    
    def _contextual_malayalam_analysis(self, text: str, language: str) -> str:
        """Perform contextual analysis for Malayalam text"""
        text_lower = text.lower()
        
        # Question detection in Malayalam
        question_words = ['എന്ത്', 'എങ്ങനെ', 'എവിടെ', 'എപ്പോൾ', 'എന്തുകൊണ്ട്', 'ആര്', 'എന്താണ്']
        if any(word in text_lower for word in question_words):
            return "question"
        
        # Request detection
        request_words = ['ചെയ്യാമോ', 'തരാമോ', 'പറയാമോ', 'കിട്ടുമോ', 'വേണം']
        if any(word in text_lower for word in request_words):
            return "request"
        
        # Statement detection
        statement_words = ['എനിക്ക് വേണം', 'എനിക്ക് ആവശ്യം', 'ഞാൻ ആഗ്രഹിക്കുന്നു']
        if any(word in text_lower for word in statement_words):
            return "request"
        
        return "statement"
    
    async def get_malayalam_response_suggestions(self, intent: str, entities: Dict[str, Any], language: str = "ml") -> List[str]:
        """Get response suggestions based on Malayalam intent and entities"""
        suggestions = {
            "greeting": [
                "നമസ്കാരം, എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
                "ഹായ്, എന്താണ് ആവശ്യം?",
                "വണക്കം, എന്തിന് വിളിച്ചു?"
            ],
            "help": [
                "ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?",
                "തീർച്ചയായും, എന്താണ് സഹായം വേണ്ടത്?",
                "സന്തോഷത്തോടെ സഹായിക്കാം. പറയൂ..."
            ],
            "transfer": [
                "ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുത്താൻ ശ്രമിക്കാം. ദയവായി കാത്തിരിക്കൂ.",
                "തീർച്ചയായും, ഞാൻ നിങ്ങളെ ഒരു ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുത്തും.",
                "മനുഷ്യസഹായം ലഭിക്കാൻ ഞാൻ സഹായിക്കും."
            ],
            "appointment": [
                "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ സഹായിക്കാം. എന്ത് തരം അപ്പോയിന്റ്മെന്റ് വേണം?",
                "തീർച്ചയായും, അപ്പോയിന്റ്മെന്റ് ഷെഡ്യൂൾ ചെയ്യാം. ഏത് ദിവസം നല്ലത്?",
                "നിങ്ങൾക്ക് അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ ഞാൻ സഹായിക്കും."
            ],
            "billing": [
                "ബിൽ അന്വേഷണങ്ങൾക്ക് ഞാൻ സഹായിക്കാം. എന്താണ് അറിയാൻ വേണ്ടത്?",
                "ബിൽ സംബന്ധമായ ചോദ്യങ്ങൾക്ക് ഞാൻ ഉത്തരം നൽകാം.",
                "പേയ്‌മെന്റ് സംബന്ധമായി എന്തെങ്കിലും സഹായം വേണോ?"
            ],
            "technical_support": [
                "സാങ്കേതിക പ്രശ്നങ്ങൾക്ക് ഞാൻ സഹായിക്കാം. എന്താണ് പ്രശ്നം?",
                "സാങ്കേതിക സഹായം ലഭ്യമാണ്. എന്ത് പ്രശ്നമാണ് നേരിടുന്നത്?",
                "ടെക്നിക്കൽ പിന്തുണ ഞാൻ നൽകാം. പറയൂ പ്രശ്നം."
            ],
            "emergency": [
                "അടിയന്തര സഹായം ഉടന് ലഭ്യമാക്കാം. എന്താണ് അടിയന്തര സാഹചര്യം?",
                "ഉടന് സഹായം ലഭിക്കും. എവിടെയാണ് പ്രശ്നം?",
                "അടിയന്തര സേവനം സജീവമാക്കുന്നു. ദയവായി വിവരം തരൂ."
            ]
        }
        
        # Adjust suggestions based on respect level
        if entities.get('respect_level') == 'formal':
            suggestions = {k: [s.replace('ഞാൻ', 'ഞങ്ങൾ') for s in v] for k, v in suggestions.items()}
        
        return suggestions.get(intent, ["ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?"])