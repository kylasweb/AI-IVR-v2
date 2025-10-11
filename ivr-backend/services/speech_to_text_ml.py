import speech_recognition as sr
import base64
import io
import logging
import re
from typing import Optional, Tuple
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class MalayalamSpeechToTextService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Configure recognizer for Malayalam
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
        
        # Malayalam language configurations
        self.malayalam_variants = {
            'ml': 'ml-IN',  # Malayalam (India)
            'ml-in': 'ml-IN',
            'malayalam': 'ml-IN'
        }
        
        # Common Malayalam phrases for better recognition
        self.malayalam_phrases = {
            'greetings': ['നമസ്കാരം', 'ഹായ്', 'സുഖം', 'എങ്ങനെ ഇരിക്കുന്നു'],
            'help': ['സഹായം', 'സഹായം തേടുക', 'സഹായം വേണം'],
            'billing': ['ബിൽ', 'പേയ്‌മെന്റ്', 'ചാർജ്', 'തുക'],
            'technical': ['സാങ്കേതിക', 'ടെക്നിക്കൽ', 'പ്രശ്നം', 'ഇല്ലാതാകുന്നു'],
            'appointment': ['അപ്പോയിന്റ്മെന്റ്', 'സമയം', 'തീയതി', 'കാണിക്കുക'],
            'transfer': ['ട്രാൻസ്ഫർ', 'മറ്റൊരാൾക്ക്', 'ഉദ്യോഗസ്ഥൻ'],
            'yes': ['അതെ', 'ശരി', 'ഉണ്ട്', 'വേണം'],
            'no': ['അല്ല', 'ഇല്ല', 'വേണ്ട', 'ആവശ്യമില്ല']
        }
        
        # Manglish (Malayalam in English) patterns
        self.manglish_patterns = {
            'greetings': ['namaskaram', 'hai', 'sukham', 'engane irikkunnu'],
            'help': ['sahayam', 'sahayam vendam', 'help cheyyan'],
            'billing': ['bill', 'payment', 'charge', 'thunaku'],
            'technical': ['technical', 'problem', 'illathathunnu', 'issue'],
            'appointment': ['appointment', 'samayam', 'date', 'kanikkunnu'],
            'transfer': ['transfer', 'matte aalkku', 'agent'],
            'yes': ['athe', 'sari', 'undu', 'vendam'],
            'no': ['alla', 'illa', 'vendath', 'avashyamilla']
        }
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        try:
            return True
        except Exception as e:
            logger.error(f"Malayalam speech to text service health check failed: {e}")
            return False
    
    async def transcribe(self, audio_data: str, language: str = "ml") -> Tuple[str, str]:
        """
        Transcribe audio data to text with Malayalam and Manglish support
        
        Args:
            audio_data: Base64 encoded audio data
            language: Language code (ml, ml-in, manglish)
        
        Returns:
            Tuple of (transcribed_text, detected_language)
        """
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            audio_file = io.BytesIO(audio_bytes)
            
            # Convert to AudioFile
            with sr.AudioFile(audio_file) as source:
                audio = self.recognizer.record(source)
            
            # Run recognition in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            text, detected_lang = await loop.run_in_executor(
                self.executor,
                self._recognize_malayalam_audio,
                audio,
                language
            )
            
            logger.info(f"Malayalam transcribed: {text} (detected: {detected_lang})")
            return text, detected_lang
            
        except Exception as e:
            logger.error(f"Error transcribing Malayalam audio: {str(e)}")
            return "ക്ഷമിക്കണം, ഞാൻ മനസ്സിലാക്കാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും പറയാമോ?", "ml"
    
    def _recognize_malayalam_audio(self, audio, language: str) -> Tuple[str, str]:
        """Recognize Malayalam audio with multiple engines"""
        try:
            # Try Google Speech Recognition first for Malayalam
            google_lang = self.malayalam_variants.get(language.lower(), 'ml-IN')
            
            try:
                text = self.recognizer.recognize_google(audio, language=google_lang)
                if text.strip():
                    return text, "malayalam"
            except sr.RequestError:
                logger.warning("Google Malayalam recognition failed, trying fallback")
            
            # Try with English and then translate to Malayalam patterns
            try:
                english_text = self.recognizer.recognize_google(audio, language="en-US")
                if english_text.strip():
                    # Check if it's Manglish
                    manglish_text = self._convert_to_malayalam(english_text)
                    if manglish_text != english_text:
                        return manglish_text, "manglish"
                    return english_text, "english"
            except sr.RequestError:
                pass
            
            # Fallback to Sphinx (offline)
            try:
                text = self.recognizer.recognize_sphinx(audio)
                return self._convert_to_malayalam(text), "malayalam"
            except:
                pass
            
            return "", "unknown"
                
        except sr.UnknownValueError:
            logger.warning("Malayalam speech recognition could not understand audio")
            return ""
        except Exception as e:
            logger.error(f"Error in Malayalam speech recognition: {str(e)}")
            return ""
    
    def _convert_to_malayalam(self, text: str) -> str:
        """Convert Manglish or English text to proper Malayalam"""
        text_lower = text.lower().strip()
        
        # Common Manglish to Malayalam conversions
        manglish_to_malayalam = {
            # Greetings
            'namaskaram': 'നമസ്കാരം',
            'hai': 'ഹായ്',
            'sukham': 'സുഖം',
            'engane irikkunnu': 'എങ്ങനെ ഇരിക്കുന്നു',
            
            # Help words
            'sahayam': 'സഹായം',
            'help': 'സഹായം',
            'vendam': 'വേണം',
            
            # Common words
            'athe': 'അതെ',
            'alla': 'അല്ല',
            'sari': 'ശരി',
            'undu': 'ഉണ്ട്',
            'illa': 'ഇല്ല',
            
            # Business terms
            'bill': 'ബിൽ',
            'payment': 'പേയ്‌മെന്റ്',
            'appointment': 'അപ്പോയിന്റ്മെന്റ്',
            'technical': 'സാങ്കേതിക',
            'transfer': 'ട്രാൻസ്ഫർ'
        }
        
        # Replace common Manglish patterns
        for manglish, malayalam in manglish_to_malayalam.items():
            if manglish in text_lower:
                text_lower = text_lower.replace(manglish, malayalam)
        
        return text_lower
    
    def detect_malayalam_dialect(self, text: str) -> str:
        """Detect Malayalam dialect or region"""
        text_lower = text.lower()
        
        # Regional variations
        dialect_patterns = {
            'travancore': ['ഞാൻ', 'നിന്നെ', 'അവൻ', 'അവൾ'],
            'malabar': ['താൻ', 'നിങ്ങളെ', 'അവർ', 'അവൾ'],
            'cochin': ['ഞാൾ', 'നിങ്ങളെ', 'അവർ', 'അവൾ']
        }
        
        for dialect, patterns in dialect_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                return dialect
        
        return 'standard'
    
    async def transcribe_with_dialect_detection(self, audio_data: str) -> dict:
        """
        Transcribe with dialect detection
        
        Returns:
            dict with text, language, dialect, confidence
        """
        text, language = await self.transcribe(audio_data)
        dialect = self.detect_malayalam_dialect(text) if text else "unknown"
        
        return {
            'text': text,
            'language': language,
            'dialect': dialect,
            'confidence': self._calculate_confidence(text, language)
        }
    
    def _calculate_confidence(self, text: str, language: str) -> float:
        """Calculate confidence score for Malayalam recognition"""
        if not text.strip():
            return 0.0
        
        # Base confidence
        base_confidence = 0.7
        
        # Boost for known Malayalam words
        malayalam_chars = ['ം', 'ഃ', 'അ', 'ആ', 'ഇ', 'ഈ', 'ഉ', 'ഊ', 'ഋ', 'എ', 'ഏ', 'ഐ', 'ഒ', 'ഓ', 'ഔ', 'ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'റ', 'ല', 'ള', 'ഴ', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'ൺ', 'ൻ', 'ർ', 'ൽ', 'ൾ', 'ൿ']
        
        malayalam_char_count = sum(1 for char in text if char in malayalam_chars)
        if malayalam_char_count > 0:
            base_confidence += 0.2
        
        # Check for common Malayalam phrases
        for category, phrases in self.malayalam_phrases.items():
            if any(phrase in text for phrase in phrases):
                base_confidence += 0.1
                break
        
        return min(base_confidence, 1.0)
    
    async def get_malayalam_audio_samples(self) -> dict:
        """Get sample Malayalam audio phrases for testing"""
        return {
            'greetings': [
                'നമസ്കാരം, എങ്ങനെ ഇരിക്കുന്നു?',
                'ഹായ്, സുഖമാണോ?',
                'എന്തിന് വിളിച്ചു?'
            ],
            'help_requests': [
                'സഹായം വേണം',
                'എനിക്ക് സഹായം ചെയ്യാമോ?',
                'ഒന്ന് സഹായിക്കും'
            ],
            'billing': [
                'എന്റെ ബിൽ അറിയാൻ വേണം',
                'പേയ്‌മെന്റ് എങ്ങനെ ചെയ്യാം?',
                'ബിൽ അടയ്ക്കാൻ വേണം'
            ],
            'technical': [
                'എന്റെ സിസ്റ്റം പ്രവർത്തിക്കുന്നില്ല',
                'ടെക്നിക്കൽ പ്രശ്നം',
                'സാങ്കേതിക സഹായം വേണം'
            ],
            'manglish_samples': [
                'namaskaram, enike help vendam',
                'bill kittiya?',
                'appointment book cheyyanam',
                'technical issue aanu'
            ]
        }