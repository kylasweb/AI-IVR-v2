import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class MalayalamConversationManager:
    def __init__(self):
        self.malayalam_conversation_flows = self._load_malayalam_conversation_flows()
        self.malayalam_responses = self._load_malayalam_responses()
        self.manglish_responses = self._load_manglish_responses()
        
        # Cultural context handlers
        self.respect_levels = {
            'formal': ['സർ', 'മാഷ്', 'ചേട്ടൻ', 'ചേച്ചി', 'അമ്മ', 'അച്ഛൻ'],
            'informal': ['മോനേ', 'മോളേ', 'എടാ', 'എടി', 'ബാബു'],
            'neutral': []
        }
        
        # Regional dialect handlers
        self.dialect_handlers = {
            'travancore': self._handle_travancore_dialect,
            'malabar': self._handle_malabar_dialect,
            'cochin': self._handle_cochin_dialect,
            'standard': self._handle_standard_dialect
        }
        
    def _load_malayalam_conversation_flows(self) -> Dict[str, Dict]:
        """Load Malayalam conversation flows"""
        flows = {
            "main_menu": {
                "greeting": "നമസ്കാരം, ഞങ്ങളുടെ AI IVR സിസ്റ്റത്തിലേക്ക് സ്വാഗതം. ഇന്ന് എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
                "options": [
                    "ബിൽ അന്വേഷണങ്ങൾക്ക് 'ബിൽ' എന്ന് പറയുക അല്ലെങ്കിൽ ഒന്ന് അമർത്തുക",
                    "സാങ്കേതിക പിന്തുണയ്ക്ക് 'സാങ്കേതിക' എന്ന് പറയുക അല്ലെങ്കിൽ രണ്ട് അമർത്തുക",
                    "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ 'അപ്പോയിന്റ്മെന്റ്' എന്ന് പറയുക അല്ലെങ്കിൽ മൂന്ന് അമർത്തുക",
                    "ഉദ്യോഗസ്ഥനെ സംസാരിക്കാൻ 'ഉദ്യോഗസ്ഥൻ' എന്ന് പറയുക അല്ലെങ്കിൽ പൂജ്യം അമർത്തുക"
                ],
                "timeout_message": "ക്ഷമിക്കണം, ഞാൻ മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി ലഭ്യമായ ഓപ്ഷനുകളിൽ നിന്ന് തിരഞ്ഞെടുക്കൂ.",
                "max_attempts": 3
            },
            "billing": {
                "greeting": "ബിൽ അന്വേഷണങ്ങൾക്ക് ഞാൻ സഹായിക്കാം. എന്താണ് അറിയാൻ വേണ്ടത്?",
                "options": [
                    "നിലവിലെ ബാക്കി അറിയാൻ 'ബാക്കി' എന്ന് പറയുക അല്ലെങ്കിൽ ഒന്ന് അമർത്തുക",
                    "പേയ്‌മെന്റ് ചെയ്യാൻ 'പേയ്‌മെന്റ്' എന്ന് പറയുക അല്ലെങ്കിൽ രണ്ട് അമർത്തുക",
                    "ബിൽ ചരിത്രം അറിയാൻ 'ചരിത്രം' എന്ന് പറയുക അല്ലെങ്കിൽ മൂന്ന് അമർത്തുക",
                    "ബിൽ വിശദീകരണത്തിന് 'വിശദീകരണം' എന്ന് പറയുക അല്ലെങ്കിൽ നാല് അമർത്തുക"
                ],
                "timeout_message": "ബിൽ സംബന്ധമായ സഹായം ലഭ്യമാണ്. ബാക്കി, പേയ്‌മെന്റ്, ചരിത്രം, അല്ലെങ്കിൽ വിശദീകരണം എന്താണ് വേണ്ടത്?",
                "max_attempts": 3
            },
            "technical_support": {
                "greeting": "സാങ്കേതിക പ്രശ്നങ്ങൾക്ക് ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് പ്രശ്നം?",
                "options": [
                    "ഇന്റർനെറ്റ്/നെറ്റ്‌വർക്ക് പ്രശ്നങ്ങൾക്ക് 'ഇന്റർനെറ്റ്' എന്ന് പറയുക അല്ലെങ്കിൽ ഒന്ന് അമർത്തുക",
                    "സോഫ്റ്റ്‌വെയർ പ്രശ്നങ്ങൾക്ക് 'സോഫ്റ്റ്‌വെയർ' എന്ന് പറയുക അല്ലെങ്കിൽ രണ്ട് അമർത്തുക",
                    "ഹാർഡ്‌വെയർ പ്രശ്നങ്ങൾക്ക് 'ഹാർഡ്‌വെയർ' എന്ന് പറയുക അല്ലെങ്കിൽ മൂന്ന് അമർത്തുക",
                    "അക്കൗണ്ട് പ്രശ്നങ്ങൾക്ക് 'അക്കൗണ്ട്' എന്ന് പറയുക അല്ലെങ്കിൽ നാല് അമർത്തുക"
                ],
                "timeout_message": "സാങ്കേതിക സഹായം ലഭ്യമാണ്. ഇന്റർനെറ്റ്, സോഫ്റ്റ്‌വെയർ, ഹാർഡ്‌വെയർ, അല്ലെങ്കിൽ അക്കൗണ്ട് എന്താണ് പ്രശ്നം?",
                "max_attempts": 3
            },
            "appointment": {
                "greeting": "അപ്പോയിന്റ്മെന്റ് ഷെഡ്യൂൾ ചെയ്യാൻ ഞാൻ സന്തോഷത്തോടെ സഹായിക്കും.",
                "options": [
                    "കൺസൾട്ടേഷന് 'കൺസൾട്ടേഷൻ' എന്ന് പറയുക അല്ലെങ്കിൽ ഒന്ന് അമർത്തുക",
                    "�തു പരിശോധനയ്ക്ക് 'പരിശോധന' എന്ന് പറയുക അല്ലെങ്കിൽ രണ്ട് അമർത്തുക",
                    "ഫോളോവപ്പ് വിസിറ്റിന് 'ഫോളോവപ്പ്' എന്ന് പറയുക അല്ലെങ്കിൽ മൂന്ന് അമർത്തുക",
                    "അപ്പോയിന്റ്മെന്റ് റദ്ദാക്കാൻ 'റദ്ദാക്കുക' എന്ന് പറയുക അല്ലെങ്കിൽ നാല് അമർത്തുക"
                ],
                "timeout_message": "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ സഹായിക്കുന്നു. കൺസൾട്ടേഷൻ, പരിശോധന, ഫോളോവപ്പ്, അല്ലെങ്കിൽ റദ്ദാക്കൽ എന്താണ് വേണ്ടത്?",
                "max_attempts": 3
            },
            "emergency": {
                "greeting": "അടിയന്തര സഹായം ഇപ്പോൾ ലഭ്യമാണ്. എന്താണ് അടിയന്തര സാഹചര്യം?",
                "options": [
                    "മെഡിക്കൽ അടിയന്തരത്തിന് 'മെഡിക്കൽ' എന്ന് പറയുക അല്ലെങ്കിൽ ഒന്ന് അമർത്തുക",
                    "പോലീസ് സഹായത്തിന് 'പോലീസ്' എന്ന് പറയുക അല്ലെങ്കിൽ രണ്ട് അമർത്തുക",
                    "ഫയർ സർവീസിന് 'ഫയർ' എന്ന് പറയുക അല്ലെങ്കിൽ മൂന്ന് അമർത്തുക",
                    "മറ്റ് അടിയന്തരങ്ങൾക്ക് 'മറ്റ്' എന്ന് പറയുക അല്ലെങ്കിൽ നാല് അമർത്തുക"
                ],
                "timeout_message": "അടിയന്തര സഹായം ഉടന് ലഭ്യമാക്കുന്നു. മെഡിക്കൽ, പോലീസ്, ഫയർ, അല്ലെങ്കിൽ മറ്റ് എന്താണ് ആവശ്യം?",
                "max_attempts": 1  # Higher priority for emergencies
            }
        }
        return flows
    
    def _load_malayalam_responses(self) -> Dict[str, Dict[str, str]]:
        """Load Malayalam response templates"""
        responses = {
            "greeting": {
                "formal": "നമസ്കാരം, എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
                "informal": "ഹായ്, എന്താണ് വേണ്ടത്?",
                "neutral": "നമസ്കാരം, ഇന്ന് എങ്ങനെ സഹായിക്കാം?"
            },
            "goodbye": {
                "formal": "വിളിച്ചതിന് നന്ദി. വീണ്ടും കാണാം!",
                "informal": "ബൈ, വീണ്ടും കാണാം!",
                "neutral": "നന്ദി, വീണ്ടും സംസാരിക്കാം!"
            },
            "apology": {
                "formal": "ക്ഷമിക്കണം, ഞാൻ മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും പറയാമോ?",
                "informal": "ക്ഷമിക്കൂ, മനസ്സിലായില്ല. വീണ്ടും പറയാമോ?",
                "neutral": "ക്ഷമിക്കണം, തിരിച്ച് പറയൂ."
            },
            "confirmation": {
                "formal": "ശരി, ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്.",
                "informal": "ശരി, സഹായിക്കാം.",
                "neutral": "അതെ, ഞാൻ സഹായിക്കും."
            },
            "unclear": {
                "formal": "ക്ഷമിക്കണം, ഞാൻ ശരിയായി മനസ്സിലാക്കിയില്ല. ദയവായി വീണ്ടും പറയാമോ?",
                "informal": "ക്ഷമിക്കൂ, മനസ്സിലായില്ല. വീണ്ടും പറയൂ.",
                "neutral": "മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. വീണ്ടും പറയൂ."
            },
            "emergency": {
                "formal": "അടിയന്തര സഹായം ഉടന് ലഭ്യമാക്കുന്നു. ദയവായി കാത്തിരിക്കൂ.",
                "informal": "ഉടന് സഹായം ലഭിക്കും. കാത്തിരിക്കൂ.",
                "neutral": "അടിയന്തര സേവനം സജീവമാണ്."
            }
        }
        return responses
    
    def _load_manglish_responses(self) -> Dict[str, Dict[str, str]]:
        """Load Manglish response templates"""
        responses = {
            "greeting": {
                "formal": "Namaskaram, engane sahayikkam?",
                "informal": "Hai, enthanu vendam?",
                "neutral": "Namaskaram, innengane sahayikkan?"
            },
            "goodbye": {
                "formal": "Vilichathu nandi. vittu kanam!",
                "informal": "Bye, vittu kanam!",
                "neutral": "Nandi, vittu samsarikkan!"
            },
            "apology": {
                "formal": "Kshamikkam, enikku manasilakkan kazhinjilla. dayavayi vittum parayamo?",
                "informal": "Kshamikkoo, manasilayilla. vittum parayo?",
                "neutral": "Kshamikkam, thirichu parayoo."
            },
            "confirmation": {
                "formal": "Sari, enikku sahayikan thayarayam.",
                "informal": "Sari, sahayikkan.",
                "neutral": "Athe, enikku sahayikkum."
            },
            "unclear": {
                "formal": "Kshamikkam, enikku sariyayi manasilakkiyilla. dayavayi vittum parayamo?",
                "informal": "Kshamikkoo, manasilayilla. vittum parayoo.",
                "neutral": "Manasilakkan kazhinjilla. vittum parayoo."
            },
            "emergency": {
                "formal": "Adiyanthra sahayam udan labhyamakkunnu. dayavayi kathirikkoo.",
                "informal": "Udan sahayam kittum. kathirikkoo.",
                "neutral": "Adiyanthra sevanam sajeevam."
            }
        }
        return responses
    
    async def get_malayalam_greeting(self, language: str = "ml", respect_level: str = "neutral") -> str:
        """Get greeting message in Malayalam with respect level"""
        try:
            if language == "manglish":
                return self.manglish_responses["greeting"][respect_level]
            else:
                return self.malayalam_responses["greeting"][respect_level]
        except Exception as e:
            logger.error(f"Error getting Malayalam greeting: {str(e)}")
            return self.malayalam_responses["greeting"]["neutral"]
    
    async def generate_malayalam_response(self, user_input: str, intent: str, entities: Dict[str, Any], 
                                        session, language: str = "ml", dialect: str = "standard") -> str:
        """
        Generate appropriate Malayalam response based on user input and intent
        
        Args:
            user_input: User's transcribed speech
            intent: Detected intent
            entities: Extracted entities
            session: Call session object
            language: Language code (ml, manglish)
            dialect: Malayalam dialect
        
        Returns:
            Generated response text
        """
        try:
            # Detect respect level from entities
            respect_level = entities.get('respect_level', 'neutral')
            
            # Handle different intents
            if intent == "greeting":
                return await self._handle_malayalam_greeting(language, respect_level, session)
            elif intent == "goodbye":
                return await self._handle_malayalam_goodbye(language, respect_level, session)
            elif intent == "help":
                return await self._handle_malayalam_help(language, respect_level, session)
            elif intent == "transfer":
                return await self._handle_malayalam_transfer(language, respect_level, session)
            elif intent == "billing":
                return await self._handle_malayalam_billing(language, respect_level, session)
            elif intent == "technical_support":
                return await self._handle_malayalam_technical_support(language, respect_level, session)
            elif intent == "appointment":
                return await self._handle_malayalam_appointment(language, respect_level, session)
            elif intent == "emergency":
                return await self._handle_malayalam_emergency(language, respect_level, session)
            elif intent == "yes":
                return await self._handle_malayalam_confirmation(language, respect_level, session)
            elif intent == "no":
                return await self._handle_malayalam_negation(language, respect_level, session)
            elif intent == "unknown":
                return await self._handle_malayalam_unknown(user_input, language, respect_level, session)
            else:
                return await self._handle_malayalam_general_intent(intent, entities, language, respect_level, dialect, session)
                
        except Exception as e:
            logger.error(f"Error generating Malayalam response: {str(e)}")
            return self.malayalam_responses["apology"][respect_level]
    
    async def _handle_malayalam_greeting(self, language: str, respect_level: str, session) -> str:
        """Handle greeting intent"""
        # Check if this is the first interaction
        if not hasattr(session, 'greeting_handled'):
            session.greeting_handled = True
            flow = self.malayalam_conversation_flows["main_menu"]
            if language == "manglish":
                greeting = "Namaskaram, nannangale AI IVR systemilekk swagatham. innengane sahayikkam?"
                options = [
                    "Billing inquirieskk 'bill' parayu allekil one amarttu",
                    "Technical supportkk 'technical' parayu allekil randu amarttu",
                    "Appointment book cheyyan 'appointment' parayu allekil moonu amarttu",
                    "Udyogasthane samsarikan 'agent' parayu allekil pujyam amarttu"
                ]
            else:
                greeting = flow["greeting"]
                options = flow["options"]
            
            return f"{greeting} {' '.join(options)}"
        else:
            if language == "manglish":
                return self.manglish_responses["greeting"][respect_level]
            else:
                return self.malayalam_responses["greeting"][respect_level]
    
    async def _handle_malayalam_goodbye(self, language: str, respect_level: str, session) -> str:
        """Handle goodbye intent"""
        session.status = "ending"
        if language == "manglish":
            return self.manglish_responses["goodbye"][respect_level]
        else:
            return self.malayalam_responses["goodbye"][respect_level]
    
    async def _handle_malayalam_help(self, language: str, respect_level: str, session) -> str:
        """Handle help intent"""
        flow = self.malayalam_conversation_flows["main_menu"]
        if language == "manglish":
            return "Njan sahayikan thayarayam. enthanu avashyam?"
        else:
            return f"ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. {flow['greeting']} {' '.join(flow['options'])}"
    
    async def _handle_malayalam_transfer(self, language: str, respect_level: str, session) -> str:
        """Handle transfer to agent intent"""
        session.status = "transferring"
        if language == "manglish":
            return "Njan ninn oru udyogasthane bandappetuttam. dayavayu kathirikkoo."
        else:
            return "ഞാൻ നിങ്ങളെ ഒരു ഉദ്യോഗസ്ഥനെ ബന്ധപ്പെടുത്താൻ ശ്രമിക്കുന്നു. ദയവായി കാത്തിരിക്കൂ."
    
    async def _handle_malayalam_billing(self, language: str, respect_level: str, session) -> str:
        """Handle billing intent"""
        session.current_flow = "billing"
        flow = self.malayalam_conversation_flows["billing"]
        if language == "manglish":
            return "Bill inquirieskk njan sahayikkan. enthu ariyan vendam?"
        else:
            return f"{flow['greeting']} {' '.join(flow['options'])}"
    
    async def _handle_malayalam_technical_support(self, language: str, respect_level: str, session) -> str:
        """Handle technical support intent"""
        session.current_flow = "technical_support"
        flow = self.malayalam_conversation_flows["technical_support"]
        if language == "manglish":
            return "Technical problemskk njan sahayikan. enthanu problem?"
        else:
            return f"{flow['greeting']} {' '.join(flow['options'])}"
    
    async def _handle_malayalam_appointment(self, language: str, respect_level: str, session) -> str:
        """Handle appointment intent"""
        session.current_flow = "appointment"
        flow = self.malayalam_conversation_flows["appointment"]
        if language == "manglish":
            return "Appointment book cheyyan njan santhoshathode sahayikkan."
        else:
            return f"{flow['greeting']} {' '.join(flow['options'])}"
    
    async def _handle_malayalam_emergency(self, language: str, respect_level: str, session) -> str:
        """Handle emergency intent"""
        session.current_flow = "emergency"
        session.priority = "high"
        flow = self.malayalam_conversation_flows["emergency"]
        if language == "manglish":
            return "Adiyanthra sahayam udan labhyam. enthanu adiyanthra sahacharyam?"
        else:
            return f"{flow['greeting']} {' '.join(flow['options'])}"
    
    async def _handle_malayalam_confirmation(self, language: str, respect_level: str, session) -> str:
        """Handle yes/confirmation intent"""
        if hasattr(session, 'pending_action'):
            action = session.pending_action
            delattr(session, 'pending_action')
            
            if action == "transfer":
                return await self._handle_malayalam_transfer(language, respect_level, session)
            elif action == "schedule_appointment":
                if language == "manglish":
                    return "Sari, njan appointment schedule cheyyan sahayikkan. ethu date samam?"
                else:
                    return "ശരി, ഞാൻ അപ്പോയിന്റ്മെന്റ് ഷെഡ്യൂൾ ചെയ്യാൻ സഹായിക്കും. ഏത് തീയതി നല്ലത്?"
            elif action == "payment":
                if language == "manglish":
                    return "Sari, njan payment process cheyyan sahayikkan. enthu amount?"
                else:
                    return "ശരി, ഞാൻ പേയ്‌മെന്റ് പ്രോസസ് ചെയ്യാൻ സഹായിക്കും. എത്ര തുക?"
        
        if language == "manglish":
            return self.manglish_responses["confirmation"][respect_level]
        else:
            return self.malayalam_responses["confirmation"][respect_level]
    
    async def _handle_malayalam_negation(self, language: str, respect_level: str, session) -> str:
        """Handle no/negation intent"""
        if hasattr(session, 'pending_action'):
            delattr(session, 'pending_action')
        
        if language == "manglish":
            return "Manasilayi. vere entho sahayikkanamo?"
        else:
            return "മനസ്സിലായി. മറ്റെന്തെങ്കിലും സഹായം വേണോ?"
    
    async def _handle_malayalam_unknown(self, user_input: str, language: str, respect_level: str, session) -> str:
        """Handle unknown intent"""
        # Check if we're in a specific flow
        if hasattr(session, 'current_flow') and session.current_flow in self.malayalam_conversation_flows:
            flow = self.malayalam_conversation_flows[session.current_flow]
            if language == "manglish":
                return "Kshamikkoo, manasilayilla. available optionsil ninnu thirikkukka."
            else:
                return flow["timeout_message"]
        
        # Try to detect if it's a question
        if any(word in user_input.lower() for word in ["എന്ത്", "എങ്ങനെ", "എവിടെ", "എപ്പോൾ", "enthu", "engane", "evide", "eppol"]):
            if language == "manglish":
                return "Athe good question. njan athin sahayikkan. vishamavum parayamo?"
            else:
                return "അതൊരു നല്ല ചോദ്യമാണ്. ഞാൻ അതിന് ഉത്തരം നൽകാൻ ശ്രമിക്കും. കൂടുതൽ വിശദമായി പറയാമോ?"
        
        if language == "manglish":
            return self.manglish_responses["unclear"][respect_level]
        else:
            return self.malayalam_responses["unclear"][respect_level]
    
    async def _handle_malayalam_general_intent(self, intent: str, entities: Dict[str, Any], 
                                             language: str, respect_level: str, dialect: str, session) -> str:
        """Handle general intents with dialect support"""
        # Apply dialect handler if available
        if dialect in self.dialect_handlers:
            handler = self.dialect_handlers[dialect]
            return await handler(intent, entities, language, respect_level, session)
        
        # Default responses
        responses = {
            "question": "അതൊരു നല്ല ചോദ്യമാണ്. ഞാൻ അതിന് ഉത്തരം നൽകാൻ ശ്രമിക്കും.",
            "request": "ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?",
            "statement": "പറഞ്ഞതിന് നന്ദി. കൂടുതൽ സഹായം വേണോ?",
            "complaint": "പരാതിക്ക് ഖേദം. ഞാൻ അത് പരിഹരിക്കാൻ ശ്രമിക്കുന്നു.",
            "information": "വിവരം നൽകാൻ സന്തോഷം. എന്താണ് അറിയാൻ വേണ്ടത്?",
            "sales": "ഉൽപ്പന്നങ്ങളെക്കുറിച്ച് അന്വേഷിക്കാൻ സന്തോഷം. എന്താണ് താൽപര്യം?"
        }
        
        return responses.get(intent, "ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?")
    
    # Dialect handlers
    async def _handle_travancore_dialect(self, intent: str, entities: Dict[str, Any], 
                                       language: str, respect_level: str, session) -> str:
        """Handle Travancore dialect"""
        # Add Travancore-specific variations
        base_response = await self._handle_malayalam_general_intent(intent, entities, language, respect_level, "standard", session)
        
        # Replace some words with Travancore variants
        travancore_replacements = {
            "ഞാൻ": "ഞാൾ",
            "നിങ്ങൾ": "നിങ്ങൾ",
            "അവർ": "അവർ"
        }
        
        for standard, travancore in travancore_replacements.items():
            base_response = base_response.replace(standard, travancore)
        
        return base_response
    
    async def _handle_malabar_dialect(self, intent: str, entities: Dict[str, Any], 
                                     language: str, respect_level: str, session) -> str:
        """Handle Malabar dialect"""
        base_response = await self._handle_malayalam_general_intent(intent, entities, language, respect_level, "standard", session)
        
        # Add Malabar-specific variations
        malabar_replacements = {
            "നിങ്ങൾ": "നിങ്ങളെ",
            "അവർ": "അവർ",
            "വരുന്നു": "വരുന്നു"
        }
        
        for standard, malabar in malabar_replacements.items():
            base_response = base_response.replace(standard, malabar)
        
        return base_response
    
    async def _handle_cochin_dialect(self, intent: str, entities: Dict[str, Any], 
                                    language: str, respect_level: str, session) -> str:
        """Handle Cochin dialect"""
        base_response = await self._handle_malayalam_general_intent(intent, entities, language, respect_level, "standard", session)
        
        # Add Cochin-specific variations
        cochin_replacements = {
            "നിങ്ങൾ": "നിങ്ങളെ",
            "അവർ": "അവർ",
            "വരുന്നു": "വരുന്നു"
        }
        
        for standard, cochin in cochin_replacements.items():
            base_response = base_response.replace(standard, cochin)
        
        return base_response
    
    async def _handle_standard_dialect(self, intent: str, entities: Dict[str, Any], 
                                      language: str, respect_level: str, session) -> str:
        """Handle standard Malayalam dialect"""
        return await self._handle_malayalam_general_intent(intent, entities, language, respect_level, "standard", session)
    
    async def get_malayalam_fallback_response(self, language: str = "ml", respect_level: str = "neutral") -> str:
        """Get fallback response when no other response is available"""
        try:
            if language == "manglish":
                return self.manglish_responses["unclear"][respect_level]
            else:
                return self.malayalam_responses["unclear"][respect_level]
        except Exception as e:
            logger.error(f"Error getting Malayalam fallback response: {str(e)}")
            return "ക്ഷമിക്കണം, ഞാൻ മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും പറയാമോ?"
    
    def get_malayalam_conversation_state(self, session) -> Dict[str, Any]:
        """Get current conversation state"""
        state = {
            "current_flow": getattr(session, 'current_flow', 'main_menu'),
            "attempts": getattr(session, 'attempts', 0),
            "pending_action": getattr(session, 'pending_action', None),
            "last_intent": getattr(session, 'last_intent', None),
            "respect_level": getattr(session, 'respect_level', 'neutral'),
            "dialect": getattr(session, 'dialect', 'standard'),
            "language": getattr(session, 'language', 'ml')
        }
        return state
    
    def update_malayalam_conversation_state(self, session, intent: str, response: str, 
                                          entities: Dict[str, Any], language: str, dialect: str):
        """Update conversation state based on interaction"""
        session.last_intent = intent
        session.language = language
        session.dialect = dialect
        
        # Update respect level
        if 'respect_level' in entities:
            session.respect_level = entities['respect_level']
        
        # Increment attempts if we're in a flow
        if hasattr(session, 'current_flow'):
            session.attempts = getattr(session, 'attempts', 0) + 1
            
            # Check if we've exceeded max attempts
            flow = self.malayalam_conversation_flows.get(session.current_flow, {})
            max_attempts = flow.get('max_attempts', 3)
            
            if session.attempts >= max_attempts:
                session.pending_action = "transfer"
                session.status = "needs_transfer"