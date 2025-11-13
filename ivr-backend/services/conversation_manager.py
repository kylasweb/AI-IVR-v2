import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class ConversationManager:
    def __init__(self):
        self.conversation_flows = self._load_conversation_flows()
        self.responses = self._load_responses()

    def _load_conversation_flows(self) -> Dict[str, Dict]:
        """Load predefined conversation flows"""
        flows = {
            "main_menu": {
                "greeting": "Welcome to our AI IVR system. How can I help you today?",
                "options": [
                    "For billing inquiries, say 'billing' or press 1",
                    "For technical support, say 'support' or press 2",
                    "To schedule an appointment, say 'appointment' or press 3",
                    "To speak with an agent, say 'agent' or press 0"
                ],
                "timeout_message": "I didn't understand that. Please choose from the available options.",
                "max_attempts": 3
            },
            "billing": {
                "greeting": "I can help you with billing questions. What would you like to know?",
                "options": [
                    "For current balance, say 'balance' or press 1",
                    "To make a payment, say 'payment' or press 2",
                    "For billing history, say 'history' or press 3",
                    "To speak with billing specialist, say 'agent' or press 0"
                ],
                "timeout_message": "I can help with balance, payments, or billing history. What would you like?",
                "max_attempts": 3
            },
            "technical_support": {
                "greeting": "I'm sorry you're experiencing technical issues. Let me help you resolve this.",
                "options": [
                    "For login issues, say 'login' or press 1",
                    "For connection problems, say 'connection' or press 2",
                    "For software issues, say 'software' or press 3",
                    "To speak with technical specialist, say 'agent' or press 0"
                ],
                "timeout_message": "I can help with login, connection, or software issues. What are you experiencing?",
                "max_attempts": 3
            },
            "appointment": {
                "greeting": "I'd be happy to help you schedule an appointment.",
                "options": [
                    "For a consultation, say 'consultation' or press 1",
                    "For a checkup, say 'checkup' or press 2",
                    "For a follow-up visit, say 'followup' or press 3",
                    "To speak with scheduling specialist, say 'agent' or press 0"
                ],
                "timeout_message": "I can schedule consultations, checkups, or follow-up visits. What type of appointment do you need?",
                "max_attempts": 3
            }
        }
        return flows

    def _load_responses(self) -> Dict[str, Dict[str, str]]:
        """Load response templates"""
        responses = {
            "greeting": {
                "en": "Hello! How can I help you today?",
                "es": "¡Hola! ¿Cómo puedo ayudarte hoy?",
                "fr": "Bonjour! Comment puis-je vous aider aujourd'hui?",
                "de": "Guten Tag! Wie kann ich Ihnen heute helfen?",
                "it": "Buongiorno! Come posso aiutarla oggi?",
                "pt": "Olá! Como posso ajudá-lo hoje?",
                "ru": "Здравствуйте! Чем я могу вам помочь сегодня?",
                "ja": "こんにちは！今日はどのようなお手伝いができますか？",
                "zh": "你好！今天我能为您做些什么？",
                "ko": "안녕하세요! 오늘 어떻게 도와드릴까요?"
            },
            "goodbye": {
                "en": "Thank you for calling. Goodbye!",
                "es": "¡Gracias por llamar! ¡Adiós!",
                "fr": "Merci d'avoir appelé. Au revoir!",
                "de": "Vielen Dank für Ihren Anruf. Auf Wiedersehen!",
                "it": "Grazie per aver chiamato. Arrivederci!",
                "pt": "Obrigado por ligar. Tchau!",
                "ru": "Спасибо за звонок. До свидания!",
                "ja": "お電話ありがとうございました。さようなら！",
                "zh": "感谢您的来电。再见！",
                "ko": "전화해주셔서 감사합니다. 안녕히 계세요!"
            },
            "apology": {
                "en": "I'm sorry about that. Let me try to help you.",
                "es": "Lamento eso. Déjeme intentar ayudarle.",
                "fr": "Je suis désolé pour cela. Laissez-moi essayer de vous aider.",
                "de": "Es tut mir leid. Lassen Sie mich versuchen zu helfen.",
                "it": "Mi dispiace per questo. Lasciami provare ad aiutarla.",
                "pt": "Sinto muito por isso. Deixe-me tentar ajudá-lo.",
                "ru": "Мне жаль это слышать. Позвольте мне попытаться вам помочь.",
                "ja": "申し訳ありません。お手伝いさせてください。",
                "zh": "很抱歉。让我来帮助您。",
                "ko": "죄송합니다. 도와드리겠습니다."
            },
            "confirmation": {
                "en": "I understand. Let me help you with that.",
                "es": "Entiendo. Déjeme ayudarle con eso.",
                "fr": "Je comprends. Laissez-moi vous aider avec cela.",
                "de": "Ich verstehe. Lassen Sie mich Ihnen damit helfen.",
                "it": "Capisco. Lasciami aiutarla con quello.",
                "pt": "Entendo. Deixe-me ajudá-lo com isso.",
                "ru": "Я понимаю. Позвольте мне помочь вам с этим.",
                "ja": "わかりました。お手伝いいたします。",
                "zh": "我明白了。让我来帮助您。",
                "ko": "이해했습니다. 도와드리겠습니다."
            },
            "unclear": {
                "en": "I'm sorry, I didn't quite understand that. Could you please repeat?",
                "es": "Lo siento, no entendí bien. ¿Podría repetir, por favor?",
                "fr": "Je suis désolé, je n'ai pas bien compris. Pourriez-vous répéter s'il vous plaît?",
                "de": "Es tut mir leid, ich habe nicht ganz verstanden. Könnten Sie bitte wiederholen?",
                "it": "Mi dispiace, non ho capito bene. Potrebbe ripetere per favore?",
                "pt": "Desculpe, não entendi bem. Você poderia repetir, por favor?",
                "ru": "Извините, я не совсем понял. Не могли бы вы повторить?",
                "ja": "すみません、よく理解できませんでした。もう一度おっしゃっていただけますか？",
                "zh": "对不起，我没有完全理解。您能再说一遍吗？",
                "ko": "죄송합니다, 잘 이해하지 못했습니다. 다시 말씀해주시겠어요?"
            }
        }
        return responses

    async def get_greeting(self, language: str = "en") -> str:
        """Get greeting message in specified language"""
        try:
            return self.responses["greeting"].get(
                language, self.responses["greeting"]["en"])
        except Exception as e:
            logger.error(f"Error getting greeting: {str(e)}")
            return self.responses["greeting"]["en"]

    async def generate_response(self,
                                user_input: str,
                                intent: str,
                                entities: Dict[str,
                                               Any],
                                session) -> str:
        """
        Generate appropriate response based on user input and intent

        Args:
            user_input: User's transcribed speech
            intent: Detected intent
            entities: Extracted entities
            session: Call session object

        Returns:
            Generated response text
        """
        try:
            # Get language preference
            language = getattr(session, 'language', 'en')

            # Handle different intents
            if intent == "greeting":
                return await self._handle_greeting(language, session)
            elif intent == "goodbye":
                return await self._handle_goodbye(language, session)
            elif intent == "help":
                return await self._handle_help(language, session)
            elif intent == "transfer":
                return await self._handle_transfer(language, session)
            elif intent == "billing":
                return await self._handle_billing(language, session)
            elif intent == "technical_support":
                return await self._handle_technical_support(language, session)
            elif intent == "appointment":
                return await self._handle_appointment(language, session)
            elif intent == "yes":
                return await self._handle_confirmation(language, session)
            elif intent == "no":
                return await self._handle_negation(language, session)
            elif intent == "unknown":
                return await self._handle_unknown(user_input, language, session)
            else:
                return await self._handle_general_intent(intent, entities, language, session)

        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return self.responses["apology"].get(
                language, self.responses["apology"]["en"])

    async def _handle_greeting(self, language: str, session) -> str:
        """Handle greeting intent"""
        # Check if this is the first interaction
        if not hasattr(session, 'greeting_handled'):
            session.greeting_handled = True
            flow = self.conversation_flows["main_menu"]
            return f"{flow['greeting']} {' '.join(flow['options'])}"
        else:
            return self.responses["greeting"].get(
                language, self.responses["greeting"]["en"])

    async def _handle_goodbye(self, language: str, session) -> str:
        """Handle goodbye intent"""
        session.status = "ending"
        return self.responses["goodbye"].get(language, self.responses["goodbye"]["en"])

    async def _handle_help(self, language: str, session) -> str:
        """Handle help intent"""
        flow = self.conversation_flows["main_menu"]
        return f"I'm here to help! {flow['greeting']} {' '.join(flow['options'])}"

    async def _handle_transfer(self, language: str, session) -> str:
        """Handle transfer to agent intent"""
        session.status = "transferring"
        return "I'll connect you with a human agent right away. Please hold while I transfer your call."

    async def _handle_billing(self, language: str, session) -> str:
        """Handle billing intent"""
        session.current_flow = "billing"
        flow = self.conversation_flows["billing"]
        return f"{flow['greeting']} {' '.join(flow['options'])}"

    async def _handle_technical_support(self, language: str, session) -> str:
        """Handle technical support intent"""
        session.current_flow = "technical_support"
        flow = self.conversation_flows["technical_support"]
        return f"{flow['greeting']} {' '.join(flow['options'])}"

    async def _handle_appointment(self, language: str, session) -> str:
        """Handle appointment intent"""
        session.current_flow = "appointment"
        flow = self.conversation_flows["appointment"]
        return f"{flow['greeting']} {' '.join(flow['options'])}"

    async def _handle_confirmation(self, language: str, session) -> str:
        """Handle yes/confirmation intent"""
        if hasattr(session, 'pending_action'):
            action = session.pending_action
            delattr(session, 'pending_action')

            if action == "transfer":
                return await self._handle_transfer(language, session)
            elif action == "schedule_appointment":
                return "Great! I can help you schedule that. What date and time works best for you?"
            elif action == "payment":
                return "Perfect! I can process your payment. What's the payment amount?"

        return self.responses["confirmation"].get(
            language, self.responses["confirmation"]["en"])

    async def _handle_negation(self, language: str, session) -> str:
        """Handle no/negation intent"""
        if hasattr(session, 'pending_action'):
            delattr(session, 'pending_action')

        return "I understand. Is there something else I can help you with?"

    async def _handle_unknown(self, user_input: str, language: str, session) -> str:
        """Handle unknown intent"""
        # Check if we're in a specific flow
        if hasattr(
                session,
                'current_flow') and session.current_flow in self.conversation_flows:
            flow = self.conversation_flows[session.current_flow]
            return flow["timeout_message"]

        # Try to detect if it's a question
        if any(word in user_input.lower()
               for word in ["what", "where", "when", "how", "why", "who"]):
            return "That's a great question. Let me help you with that. Could you provide more details?"

        return self.responses["unclear"].get(language, self.responses["unclear"]["en"])

    async def _handle_general_intent(
            self, intent: str, entities: Dict[str, Any], language: str, session) -> str:
        """Handle general intents"""
        responses = {
            "question": "That's a good question. Let me help you find the answer.",
            "request": "I'd be happy to help you with that. What specifically do you need?",
            "statement": "Thank you for sharing that. How can I assist you further?",
            "complaint": "I'm sorry to hear you're having issues. Let me help resolve this for you.",
            "information": "I can provide you with that information. What would you like to know?",
            "sales": "I'd be happy to discuss our products and services. What are you interested in?"}

        return responses.get(intent, "I'm here to help. How can I assist you?")

    async def get_fallback_response(self, language: str = "en") -> str:
        """Get fallback response when no other response is available"""
        return self.responses["unclear"].get(language, self.responses["unclear"]["en"])

    def get_conversation_state(self, session) -> Dict[str, Any]:
        """Get current conversation state"""
        state = {
            "current_flow": getattr(session, 'current_flow', 'main_menu'),
            "attempts": getattr(session, 'attempts', 0),
            "pending_action": getattr(session, 'pending_action', None),
            "last_intent": getattr(session, 'last_intent', None)
        }
        return state

    def update_conversation_state(self, session, intent: str, response: str):
        """Update conversation state based on interaction"""
        session.last_intent = intent

        # Increment attempts if we're in a flow
        if hasattr(session, 'current_flow'):
            session.attempts = getattr(session, 'attempts', 0) + 1

            # Check if we've exceeded max attempts
            flow = self.conversation_flows.get(session.current_flow, {})
            max_attempts = flow.get('max_attempts', 3)

            if session.attempts >= max_attempts:
                session.pending_action = "transfer"
                session.status = "needs_transfer"
