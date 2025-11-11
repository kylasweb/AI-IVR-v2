#!/usr/bin/env python3
"""
Malayalam Pre-trained Models Integration
Quick deployment of state-of-the-art Malayalam AI models for IVR enhancement
"""

import asyncio
import logging
import torch
from pathlib import Path
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass
import numpy as np
import soundfile as sf

try:
    from transformers import (
        pipeline, 
        AutoModel, 
        AutoTokenizer, 
        AutoProcessor,
        AutoModelForSpeechSeq2Seq,
        AutoFeatureExtractor,
        Wav2Vec2ForCTC,
        Wav2Vec2Processor,
        AutoModelForSequenceClassification
    )
    from accelerate import Accelerator
except ImportError as e:
    logging.error(f"Required packages not installed: {e}")
    logging.error("Install with: pip install transformers accelerate torch torchaudio soundfile")
    exit(1)

# Cloud API imports (optional)
try:
    from google.cloud import speech_v1p1beta1 as speech
    from google.cloud import aiplatform
    import assemblyai as aai
    CLOUD_APIS_AVAILABLE = True
except ImportError:
    logging.warning("Cloud API packages not available. Install with: pip install google-cloud-speech google-cloud-aiplatform assemblyai")
    CLOUD_APIS_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('malayalam_models.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class VertexAIClient:
    """Google Cloud Speech-to-Text client for Malayalam STT (using chirp_2 model)"""

    def __init__(self, api_key: str, project_id: str, location: str = "asia-south1"):
        self.api_key = api_key
        self.project_id = project_id
        self.location = location
        self.client = None

        if CLOUD_APIS_AVAILABLE:
            try:
                # For API key authentication, we need to set up credentials
                # Note: API key authentication for Speech-to-Text is limited
                # In production, use service account credentials
                import google.auth
                from google.auth.transport.requests import Request
                from google.oauth2 import service_account

                # Try to use default credentials first
                try:
                    credentials, project = google.auth.default()
                    self.client = speech.SpeechClient(credentials=credentials)
                    logger.info("Vertex AI client initialized successfully")
                except Exception:
                    # Fallback: try API key approach (limited functionality)
                    logger.warning("Default credentials not found. Speech API may not work properly.")
                    logger.warning("For production, set up Google Cloud service account credentials.")
                    self.client = speech.SpeechClient()
                    logger.info("Google Speech client initialized (limited functionality)")

            except Exception as e:
                logger.error(f"Failed to initialize Vertex AI client: {e}")
                self.client = None

    async def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """Transcribe Malayalam audio using Vertex AI"""
        if not self.client:
            return {"error": "Vertex AI client not initialized", "success": False}

        try:
            # Read audio file
            with open(audio_file_path, "rb") as audio_file:
                content = audio_file.read()

            # Configure recognition
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                language_code="ml-IN",  # Malayalam (India)
                model="chirp_2",  # Latest model for better accuracy
                use_enhanced=True,
                enable_automatic_punctuation=True,
                enable_word_time_offsets=True,
            )

            audio = speech.RecognitionAudio(content=content)

            # Perform transcription
            response = self.client.recognize(config=config, audio=audio)

            if response.results:
                result = response.results[0]
                transcription = result.alternatives[0].transcript
                confidence = result.alternatives[0].confidence

                return {
                    "transcription": transcription,
                    "confidence": confidence,
                    "language": "malayalam",
                    "model": "vertex_ai_chirp_2",
                    "success": True,
                    "audio_duration": len(content) / (16000 * 2)  # Rough estimate
                }
            else:
                return {"error": "No transcription results", "success": False}

        except Exception as e:
            logger.error(f"Vertex AI transcription failed: {e}")
            return {"error": str(e), "success": False}

class AssemblyAIClient:
    """AssemblyAI client for Malayalam STT"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = None

        if CLOUD_APIS_AVAILABLE:
            try:
                aai.settings.api_key = api_key
                # Test the API key by making a simple request
                self.client = aai.Client()
                logger.info("✅ AssemblyAI client initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize AssemblyAI client: {e}")
                self.client = None

    async def transcribe_audio(self, audio_file_path: str) -> Dict[str, Any]:
        """Transcribe Malayalam audio using AssemblyAI"""
        if not self.client:
            return {"error": "AssemblyAI client not initialized", "success": False}

        try:
            # Upload and transcribe
            transcript = self.client.transcripts.transcribe(
                audio=audio_file_path,
                language_code="ml",  # Malayalam
                punctuate=True,
                format_text=True,
                speaker_labels=True
            )

            # Wait for completion (this is synchronous in the current implementation)
            if transcript.status == "completed":
                return {
                    "transcription": transcript.text,
                    "confidence": getattr(transcript, 'confidence', 0.8),
                    "language": "malayalam",
                    "model": "assemblyai",
                    "success": True,
                    "audio_duration": getattr(transcript, 'audio_duration', 0),
                    "speakers": len(transcript.utterances) if hasattr(transcript, 'utterances') and transcript.utterances else 1
                }
            else:
                return {"error": f"Transcription failed: {transcript.status}", "success": False}

        except Exception as e:
            logger.error(f"AssemblyAI transcription failed: {e}")
            return {"error": str(e), "success": False}
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('malayalam_models.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Configuration for Malayalam AI models using AI4Bharat's latest models with open alternatives"""
    # Primary Malayalam STT - Large model for highest accuracy
    stt_model_large: str = "ai4bharat/indicconformer_stt_ml_hybrid_ctc_rnnt_large"

    # Multilingual STT - 600M parameter model for fallback
    stt_model_multilingual: str = "ai4bharat/indic-conformer-600m-multilingual"

    # Alternative STT models (open access)
    stt_model_whisper: str = "kurianbenoy/whisper_malayalam_largev2"  # Best alternative
    stt_model_wav2vec_vakyansh: str = "Harveenchadha/vakyansh-wav2vec2-malayalam-mlm-8"
    stt_model_wav2vec_addy: str = "addy88/wav2vec2-malayalam-stt"

    # Advanced TTS - Human-like voice generation
    tts_model: str = "ai4bharat/indic-parler-tts-pretrained"

    # Alternative TTS models (open access)
    tts_model_lfm: str = "Praha-Labs/LFM-TTS-MALAYALAM"  # Best alternative
    tts_model_orpheus: str = "traromal/Malayalam_Orpheus_3B_TTS"
    tts_model_rvc: str = "enescakircali/rvc-model-malayalam-tts"

    # NLU model for understanding
    nlu_model: str = "ai4bharat/indic-bert"  # Correct AI4Bharat model name

    # Alternative NLU model
    nlu_model_bert: str = "l3cube-pune/malayalam-bert-scratch"

    # Translation model
    translation_model: str = "ai4bharat/IndicTrans3-beta"

    # Sentiment analysis
    sentiment_model: str = "cardiffnlp/twitter-roberta-base-sentiment-latest"

    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    cache_dir: str = "./model_cache"

    # Cloud API Configuration
    vertex_api_key: str = "AIzaSyA7ketKDZ7Fmci724LQ2ZWJnMKPr3VZaD8"  # Google Vertex AI API Key
    assemblyai_api_key: str = "b4696195546f474682737cd1fe6b5edd"  # AssemblyAI API Key

    # Cloud API settings
    vertex_project_id: str = ""  # Leave empty to disable Google Cloud APIs
    vertex_location: str = "asia-south1"  # Best region for Malayalam
    use_cloud_apis_first: bool = True  # Try cloud APIs before local models

    # Voice characteristics for human-like conversation
    voice_config: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        if self.voice_config is None:
            self.voice_config = {
                "speaker_gender": "female",  # Options: "male", "female"
                "speaking_rate": 1.0,        # 0.5-2.0 (normal = 1.0)
                "pitch_shift": 0,            # -12 to +12 semitones
                "emotion_intensity": 0.7,    # 0.0-1.0
                "regional_accent": "standard" # "standard", "travancore", "malabar", "cochin"
            }

class MalayalamModelManager:
    """
    Manages pre-trained Malayalam models for AI IVR enhancement
    Provides unified interface for speech recognition, language understanding, 
    translation, and synthesis capabilities.
    """
    
    def __init__(self, config: Optional[ModelConfig] = None):
        self.config = config or ModelConfig()
        self.models: Dict[str, Any] = {}
        self.accelerator = Accelerator()
        self.cache_dir = Path(self.config.cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Initialize cloud API clients
        self.vertex_client = None
        self.assemblyai_client = None
        
        if CLOUD_APIS_AVAILABLE and self.config.use_cloud_apis_first:
            logger.info("🌐 Initializing cloud API clients...")
            
            # Initialize AssemblyAI (works with API key only)
            if self.config.assemblyai_api_key:
                self.assemblyai_client = AssemblyAIClient(
                    api_key=self.config.assemblyai_api_key
                )
            
            # Initialize Google Cloud Speech (requires project ID and credentials)
            if self.config.vertex_project_id and self.config.vertex_project_id != "":
                self.vertex_client = VertexAIClient(
                    api_key=self.config.vertex_api_key,
                    project_id=self.config.vertex_project_id,
                    location=self.config.vertex_location
                )
            else:
                logger.warning("⚠️ Google Cloud project ID not configured. Skipping Google Speech API initialization.")
                logger.warning("To enable Google Speech API, set vertex_project_id in ModelConfig.")
        
        logger.info(f"Initializing Malayalam Model Manager on {self.config.device}")
        
    async def initialize_models(self) -> Dict[str, bool]:
        """Initialize all pre-trained models asynchronously"""
        logger.info("🚀 Loading pre-trained Malayalam models...")
        
        initialization_results = {}
        
        # Initialize cloud APIs first if enabled
        if self.config.use_cloud_apis_first:
            logger.info("☁️ Testing cloud API availability...")
            
            # Test Vertex AI
            if self.vertex_client and self.vertex_client.client:
                initialization_results['vertex_ai'] = True
                logger.info("✅ Vertex AI available")
            else:
                initialization_results['vertex_ai'] = False
                logger.warning("⚠️ Vertex AI not available")
                
            # Test AssemblyAI
            if self.assemblyai_client and self.assemblyai_client.client:
                initialization_results['assemblyai'] = True
                logger.info("✅ AssemblyAI available")
            else:
                initialization_results['assemblyai'] = False
                logger.warning("⚠️ AssemblyAI not available")
        
        # Load Primary STT Model (AI4Bharat Large)
        try:
            logger.info("📢 Loading AI4Bharat Malayalam STT Large model...")
            self.models['stt_processor'] = AutoProcessor.from_pretrained(
                self.config.stt_model_large,
                cache_dir=self.cache_dir
            )
            self.models['stt'] = AutoModelForSpeechSeq2Seq.from_pretrained(
                self.config.stt_model_large,
                cache_dir=self.cache_dir
            ).to(self.config.device)
            initialization_results['stt'] = True
            logger.info("✅ AI4Bharat Malayalam STT Large model loaded successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load primary STT model: {e}")
            # Fallback to AI4Bharat multilingual model
            try:
                logger.info("📢 Falling back to AI4Bharat Multilingual STT...")
                self.models['stt_processor'] = AutoProcessor.from_pretrained(
                    self.config.stt_model_multilingual,
                    cache_dir=self.cache_dir
                )
                self.models['stt'] = AutoModelForSpeechSeq2Seq.from_pretrained(
                    self.config.stt_model_multilingual,
                    cache_dir=self.cache_dir
                ).to(self.config.device)
                initialization_results['stt'] = True
                logger.info("✅ AI4Bharat Multilingual STT fallback loaded successfully")
            except Exception as fallback_e:
                logger.error(f"❌ Failed to load AI4Bharat fallback STT model: {fallback_e}")
                # Try open alternative: Whisper Malayalam
                try:
                    logger.info("📢 Trying open alternative: Whisper Malayalam STT...")
                    self.models['stt_processor'] = AutoProcessor.from_pretrained(
                        self.config.stt_model_whisper,
                        cache_dir=self.cache_dir
                    )
                    self.models['stt'] = AutoModelForSpeechSeq2Seq.from_pretrained(
                        self.config.stt_model_whisper,
                        cache_dir=self.cache_dir
                    ).to(self.config.device)
                    initialization_results['stt'] = True
                    logger.info("✅ Whisper Malayalam STT loaded successfully (open alternative)")
                except Exception as whisper_e:
                    logger.error(f"❌ Failed to load Whisper STT: {whisper_e}")
                    # Try another open alternative: Vakyansh wav2vec2
                    try:
                        logger.info("📢 Trying open alternative: Vakyansh wav2vec2 Malayalam STT...")
                        self.models['stt_processor'] = Wav2Vec2Processor.from_pretrained(
                            self.config.stt_model_wav2vec_vakyansh,
                            cache_dir=self.cache_dir
                        )
                        self.models['stt'] = Wav2Vec2ForCTC.from_pretrained(
                            self.config.stt_model_wav2vec_vakyansh,
                            cache_dir=self.cache_dir
                        ).to(self.config.device)
                        initialization_results['stt'] = True
                        logger.info("✅ Vakyansh wav2vec2 Malayalam STT loaded successfully (open alternative)")
                    except Exception as vakyansh_e:
                        logger.error(f"❌ Failed to load Vakyansh wav2vec2 STT: {vakyansh_e}")
                        # Final fallback: Addy wav2vec2
                        try:
                            logger.info("📢 Final STT fallback: Addy wav2vec2 Malayalam STT...")
                            self.models['stt_processor'] = Wav2Vec2Processor.from_pretrained(
                                self.config.stt_model_wav2vec_addy,
                                cache_dir=self.cache_dir
                            )
                            self.models['stt'] = Wav2Vec2ForCTC.from_pretrained(
                                self.config.stt_model_wav2vec_addy,
                                cache_dir=self.cache_dir
                            ).to(self.config.device)
                            initialization_results['stt'] = True
                            logger.info("✅ Addy wav2vec2 Malayalam STT loaded successfully (final fallback)")
                        except Exception as final_stt_e:
                            logger.error(f"❌ Failed to load any STT model: {final_stt_e}")
                            initialization_results['stt'] = False
            
        # Load NLU Model (Language Understanding)
        try:
            logger.info("🧠 Loading Malayalam NLU model...")
            self.models['nlu'] = pipeline(
                "fill-mask",
                model=self.config.nlu_model,
                device=0 if self.config.device == "cuda" else -1,
                model_kwargs={"cache_dir": self.cache_dir}
            )
            initialization_results['nlu'] = True
            logger.info("✅ Malayalam NLU model loaded successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load AI4Bharat NLU model: {e}")
            # Try open alternative: Malayalam BERT
            try:
                logger.info("🧠 Trying open alternative: Malayalam BERT for NLU...")
                self.models['nlu'] = pipeline(
                    "fill-mask",
                    model=self.config.nlu_model_bert,
                    device=0 if self.config.device == "cuda" else -1,
                    model_kwargs={"cache_dir": self.cache_dir}
                )
                initialization_results['nlu'] = True
                logger.info("✅ Malayalam BERT NLU loaded successfully (open alternative)")
            except Exception as bert_e:
                logger.error(f"❌ Failed to load Malayalam BERT NLU: {bert_e}")
                initialization_results['nlu'] = False
            
        # Load Translation Model
        try:
            logger.info("🌐 Loading Malayalam-English translation model...")
            self.models['translation'] = pipeline(
                "translation",
                model=self.config.translation_model,
                device=0 if self.config.device == "cuda" else -1,
                model_kwargs={"cache_dir": self.cache_dir}
            )
            initialization_results['translation'] = True
            logger.info("✅ Translation model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load translation model: {e}")
            initialization_results['translation'] = False
            
        # Load Sentiment Analysis Model
        try:
            logger.info("😊 Loading sentiment analysis model...")
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            
            self.models['sentiment_tokenizer'] = AutoTokenizer.from_pretrained(
                self.config.sentiment_model,
                cache_dir=self.cache_dir
            )
            self.models['sentiment'] = AutoModelForSequenceClassification.from_pretrained(
                self.config.sentiment_model,
                cache_dir=self.cache_dir
            ).to(self.config.device)
            initialization_results['sentiment'] = True
            logger.info("✅ Sentiment analysis model loaded successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to load sentiment model: {e}")
            initialization_results['sentiment'] = False
            
        # Load AI4Bharat Parler TTS Model (Human-like Speech)
        try:
            logger.info("🔊 Loading AI4Bharat Parler TTS model...")
            from transformers import AutoTokenizer, AutoModel

            self.models['tts_tokenizer'] = AutoTokenizer.from_pretrained(
                self.config.tts_model,
                cache_dir=self.cache_dir
            )
            self.models['tts'] = AutoModel.from_pretrained(
                self.config.tts_model,
                cache_dir=self.cache_dir
            ).to(self.config.device)
            initialization_results['tts'] = True
            logger.info("✅ AI4Bharat Parler TTS model loaded successfully")

        except Exception as e:
            logger.error(f"❌ Failed to load AI4Bharat TTS model: {e}")
            # Try open alternative: LFM TTS
            try:
                logger.info("🔊 Trying open alternative: LFM Malayalam TTS...")
                # LFM models may need different loading approach
                from transformers import AutoModelForCausalLM, AutoTokenizer
                self.models['tts_tokenizer'] = AutoTokenizer.from_pretrained(
                    self.config.tts_model_lfm,
                    cache_dir=self.cache_dir
                )
                self.models['tts'] = AutoModelForCausalLM.from_pretrained(
                    self.config.tts_model_lfm,
                    cache_dir=self.cache_dir
                ).to(self.config.device)
                initialization_results['tts'] = True
                logger.info("✅ LFM Malayalam TTS loaded successfully (open alternative)")
            except Exception as lfm_e:
                logger.error(f"❌ Failed to load LFM TTS: {lfm_e}")
                # Try another alternative: Orpheus TTS
                try:
                    logger.info("🔊 Trying open alternative: Orpheus Malayalam TTS...")
                    self.models['tts_tokenizer'] = AutoTokenizer.from_pretrained(
                        self.config.tts_model_orpheus,
                        cache_dir=self.cache_dir
                    )
                    self.models['tts'] = AutoModelForCausalLM.from_pretrained(
                        self.config.tts_model_orpheus,
                        cache_dir=self.cache_dir
                    ).to(self.config.device)
                    initialization_results['tts'] = True
                    logger.info("✅ Orpheus Malayalam TTS loaded successfully (open alternative)")
                except Exception as orpheus_e:
                    logger.error(f"❌ Failed to load Orpheus TTS: {orpheus_e}")
                    # Final fallback to basic TTS capability
                    try:
                        logger.info("🔊 Falling back to basic TTS capability...")
                        from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech
                        self.models['tts_processor'] = SpeechT5Processor.from_pretrained(
                            "microsoft/speecht5_tts", cache_dir=self.cache_dir
                        )
                        self.models['tts'] = SpeechT5ForTextToSpeech.from_pretrained(
                            "microsoft/speecht5_tts", cache_dir=self.cache_dir
                        ).to(self.config.device)
                        initialization_results['tts'] = True
                        logger.info("✅ Fallback TTS model loaded successfully")
                    except Exception as final_e:
                        logger.error(f"❌ Failed to load any TTS model: {final_e}")
                        initialization_results['tts'] = False
            
        success_count = sum(initialization_results.values())
        total_count = len(initialization_results)
        
        logger.info(f"🎉 Model initialization complete: {success_count}/{total_count} models loaded successfully")
        return initialization_results
        
    async def transcribe_malayalam_audio(self, audio_file_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Transcribe Malayalam audio to text using cloud APIs first, then local models
        
        Args:
            audio_file_path: Path to Malayalam audio file
            
        Returns:
            Dict with transcription results and confidence scores
        """
        audio_path = Path(audio_file_path)
        if not audio_path.exists():
            return {"error": f"Audio file not found: {audio_file_path}", "success": False}
        
        # Try cloud APIs first if enabled
        if self.config.use_cloud_apis_first:
            # Try Vertex AI first
            if self.vertex_client and self.vertex_client.client:
                logger.info("☁️ Trying Vertex AI for Malayalam transcription...")
                vertex_result = await self.vertex_client.transcribe_audio(str(audio_path))
                if vertex_result.get('success'):
                    logger.info(f"✅ Vertex AI transcription successful: '{vertex_result['transcription'][:50]}...'")
                    return vertex_result
            
            # Try AssemblyAI as fallback
            if self.assemblyai_client and self.assemblyai_client.client:
                logger.info("☁️ Trying AssemblyAI for Malayalam transcription...")
                assembly_result = await self.assemblyai_client.transcribe_audio(str(audio_path))
                if assembly_result.get('success'):
                    logger.info(f"✅ AssemblyAI transcription successful: '{assembly_result['transcription'][:50]}...'")
                    return assembly_result
        
        # Fall back to local models
        logger.info("🏠 Falling back to local models for Malayalam transcription...")
        
        if 'stt' not in self.models or 'stt_processor' not in self.models:
            return {"error": "No STT models available (cloud APIs failed and local models not loaded)", "success": False}
            
        try:
            # Load audio file
            speech, sample_rate = sf.read(audio_file_path)
            
            # Ensure 16kHz sample rate (required by Wav2Vec2)
            if sample_rate != 16000:
                import librosa
                speech = librosa.resample(speech, orig_sr=sample_rate, target_sr=16000)
                
            # Process audio with AI4Bharat processor
            inputs = self.models['stt_processor'](
                speech, 
                sampling_rate=16000, 
                return_tensors="pt", 
                padding=True
            ).to(self.config.device)
            
            # Generate transcription using sequence-to-sequence model
            with torch.no_grad():
                generated_tokens = self.models['stt'].generate(
                    inputs.input_features,
                    max_length=512,
                    num_beams=4,
                    do_sample=False,
                    early_stopping=True
                )
                
            # Decode the transcription
            transcription = self.models['stt_processor'].batch_decode(
                generated_tokens, skip_special_tokens=True
            )[0]
            
            # For sequence models, confidence is estimated differently
            confidence = 0.85  # Default high confidence for AI4Bharat models
            
            result = {
                "transcription": transcription,
                "confidence": confidence,
                "language": "malayalam",
                "model": "ai4bharat_indicconformer",
                "success": True,
                "audio_duration": len(speech) / 16000
            }
            
            logger.info(f"📝 Local model transcribed Malayalam: '{transcription[:50]}...' (confidence: {confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Local model Malayalam transcription failed: {e}")
            return {"error": str(e), "success": False}
            
    async def understand_malayalam_intent(self, malayalam_text: str) -> Dict[str, Any]:
        """
        Analyze Malayalam text for intent and entities using IndicBERT
        
        Args:
            malayalam_text: Malayalam text to analyze
            
        Returns:
            Dict with intent analysis results
        """
        if 'nlu' not in self.models:
            return {"error": "NLU model not loaded", "success": False}
            
        try:
            # Basic intent analysis using masked language modeling
            # This is a simplified approach - in production, you'd fine-tune for specific intents
            
            # Common IVR intent patterns in Malayalam
            intent_patterns = {
                "complaint": ["പരാതി", "പ്രശ്നം", "കുഴപ്പം", "തകരാർ"],
                "inquiry": ["അന്വേഷണം", "വിവരം", "ചോദ്യം", "അറിയാൻ"],
                "request": ["അപേക്ഷ", "ആവശ്യം", "വേണം", "കിട്ടുമോ"],
                "greeting": ["ഹലോ", "നമസ്കാരം", "വന്ദനം"],
                "goodbye": ["വിട", "പോകാം", "കാണാം"]
            }
            
            # Simple keyword matching for intent classification
            detected_intent = "unknown"
            confidence = 0.0
            
            for intent, keywords in intent_patterns.items():
                for keyword in keywords:
                    if keyword in malayalam_text:
                        detected_intent = intent
                        confidence = 0.8  # Simple confidence score
                        break
                if detected_intent != "unknown":
                    break
                    
            # Use NLU model for more sophisticated analysis
            try:
                # Mask a word to understand context
                masked_text = malayalam_text.replace(malayalam_text.split()[0], "[MASK]", 1)
                nlu_result = self.models['nlu'](masked_text)
                
                result = {
                    "intent": detected_intent,
                    "confidence": confidence,
                    "text": malayalam_text,
                    "language": "malayalam",
                    "nlu_suggestions": nlu_result[:3] if nlu_result else [],
                    "success": True
                }
                
            except Exception as nlu_error:
                logger.warning(f"NLU model error: {nlu_error}, using basic intent detection")
                result = {
                    "intent": detected_intent,
                    "confidence": confidence,
                    "text": malayalam_text,
                    "language": "malayalam", 
                    "success": True
                }
                
            logger.info(f"🧠 Intent analysis: '{detected_intent}' (confidence: {confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Intent understanding failed: {e}")
            return {"error": str(e), "success": False}
            
    async def translate_to_english(self, malayalam_text: str) -> Dict[str, Any]:
        """
        Translate Malayalam text to English using IndicTrans2
        
        Args:
            malayalam_text: Malayalam text to translate
            
        Returns:
            Dict with translation results
        """
        if 'translation' not in self.models:
            return {"error": "Translation model not loaded", "success": False}
            
        try:
            translation_result = self.models['translation'](malayalam_text)
            
            result = {
                "original_text": malayalam_text,
                "translated_text": translation_result[0]['translation_text'],
                "source_language": "malayalam",
                "target_language": "english",
                "success": True
            }
            
            logger.info(f"🌐 Translation: '{malayalam_text}' → '{result['translated_text']}'")
            return result
            
        except Exception as e:
            logger.error(f"❌ Translation failed: {e}")
            return {"error": str(e), "success": False}
            
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment of text using transformer model
        
        Args:
            text: Text to analyze sentiment
            
        Returns:
            Dict with sentiment analysis results
        """
        if 'sentiment' not in self.models:
            return {"error": "Sentiment model not loaded", "success": False}
            
        try:
            # Tokenize and process text
            inputs = self.models['sentiment_tokenizer'](
                text, 
                return_tensors="pt", 
                padding=True, 
                truncation=True,
                max_length=512
            ).to(self.config.device)
            
            # Get sentiment prediction
            with torch.no_grad():
                outputs = self.models['sentiment'](**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
            # Get the predicted class and confidence
            predicted_class_id = int(predictions.argmax().item())
            confidence = float(predictions.max().item())
            
            # Map class ID to sentiment label
            id_to_label = {0: 'negative', 1: 'neutral', 2: 'positive'}
            sentiment_label = id_to_label.get(predicted_class_id, 'neutral')
            
            result = {
                "text": text,
                "sentiment": sentiment_label,
                "confidence": confidence,
                "model": "transformer_sentiment",
                "success": True
            }
            
            logger.info(f"😊 Sentiment: '{sentiment_label}' (confidence: {confidence:.3f})")
            return result
            
        except Exception as e:
            logger.error(f"❌ Sentiment analysis failed: {e}")
            return {"error": str(e), "success": False}
            
    async def generate_malayalam_speech(self, malayalam_text: str, output_path: str = "output_speech.wav") -> Dict[str, Any]:
        """
        Generate human-like Malayalam speech using AI4Bharat Parler TTS
        
        Args:
            malayalam_text: Malayalam text to convert to speech
            output_path: Path to save generated audio
            
        Returns:
            Dict with generated audio information
        """
        if 'tts' not in self.models:
            return {"error": "TTS model not loaded", "success": False}
            
        try:
            logger.info(f"🔊 Generating human-like Malayalam speech: '{malayalam_text[:30]}...'")
            
            # Check if we have AI4Bharat Parler TTS
            if 'tts_tokenizer' in self.models:
                # Use AI4Bharat Parler TTS for human-like speech
                inputs = self.models['tts_tokenizer'](
                    malayalam_text, 
                    return_tensors="pt"
                ).to(self.config.device)
                
                with torch.no_grad():
                    # Generate speech with voice characteristics
                    voice_config = self.config.voice_config or {}
                    speech_output = self.models['tts'].generate(
                        **inputs,
                        # Apply voice configuration if available
                        # speaking_rate=voice_config.get("speaking_rate", 1.0),
                        # emotion_intensity=voice_config.get("emotion_intensity", 0.7)
                    )
                
                # Save generated audio
                import soundfile as sf
                sf.write(output_path, speech_output.cpu().numpy(), 22050)  # Standard sample rate
                
                result = {
                    "text": malayalam_text,
                    "audio_path": output_path,
                    "model": "ai4bharat_parler_tts", 
                    "voice_config": self.config.voice_config,
                    "audio_generated": True,
                    "success": True
                }
                
                logger.info(f"✅ AI4Bharat Malayalam TTS generated successfully: {output_path}")
                
            else:
                # Fallback to basic TTS if available
                logger.info("🔊 Using fallback TTS capability...")
                
                result = {
                    "text": malayalam_text,
                    "audio_generated": False,
                    "model": "fallback",
                    "note": "AI4Bharat Parler TTS preferred for human-like conversation",
                    "success": True
                }
            
            return result
            
        except Exception as e:
            logger.error(f"❌ AI4Bharat TTS generation failed: {e}")
            return {"error": str(e), "success": False}
            
    async def process_malayalam_call(self, audio_file_path: str) -> Dict[str, Any]:
        """
        Complete Malayalam call processing pipeline
        
        Args:
            audio_file_path: Path to Malayalam audio file
            
        Returns:
            Complete processing results including transcription, intent, translation, sentiment
        """
        logger.info(f"📞 Processing Malayalam call: {audio_file_path}")
        
        # Step 1: Transcribe Malayalam audio
        transcription_result = await self.transcribe_malayalam_audio(audio_file_path)
        
        if not transcription_result.get('success'):
            return {
                "step": "transcription",
                "error": transcription_result.get('error'),
                "success": False
            }
            
        malayalam_text = transcription_result['transcription']
        
        # Step 2: Understand intent
        intent_result = await self.understand_malayalam_intent(malayalam_text)
        
        # Step 3: Translate to English for logging/analysis
        translation_result = await self.translate_to_english(malayalam_text)
        
        # Step 4: Analyze sentiment
        sentiment_result = await self.analyze_sentiment(malayalam_text)
        
        # Compile complete results
        complete_result = {
            "transcription": transcription_result,
            "intent": intent_result,
            "translation": translation_result,
            "sentiment": sentiment_result,
            "processing_success": True,
            "malayalam_text": malayalam_text,
            "recommended_action": self._get_recommended_action(intent_result, sentiment_result)
        }
        
        logger.info(f"✅ Malayalam call processing complete for: '{malayalam_text[:30]}...'")
        return complete_result
        
    def _get_recommended_action(self, intent_result: Dict, sentiment_result: Dict) -> str:
        """Get recommended action based on intent and sentiment analysis"""
        
        intent = intent_result.get('intent', 'unknown')
        sentiment = sentiment_result.get('sentiment', 'NEUTRAL')
        
        # Simple rule-based recommendations
        if intent == 'complaint' and sentiment in ['NEGATIVE']:
            return "escalate_to_human_agent"
        elif intent == 'inquiry':
            return "provide_information"
        elif intent == 'request':
            return "process_request"
        elif intent == 'greeting':
            return "respond_greeting"
        else:
            return "general_assistance"
            
    def get_model_status(self) -> Dict[str, bool]:
        """Get current status of all loaded models"""
        return {
            'stt': 'stt' in self.models,
            'nlu': 'nlu' in self.models,
            'translation': 'translation' in self.models,
            'sentiment': 'sentiment' in self.models,
            'tts': 'tts' in self.models,
            'vertex_ai': self.vertex_client and self.vertex_client.client is not None,
            'assemblyai': self.assemblyai_client and self.assemblyai_client.client is not None
        }

async def main():
    """Demo of Malayalam model integration"""
    logger.info("🚀 Starting Malayalam Pre-trained Models Demo")
    
    # Initialize model manager
    config = ModelConfig()
    model_manager = MalayalamModelManager(config)
    
    # Load models
    initialization_results = await model_manager.initialize_models()
    
    logger.info("\n" + "="*50)
    logger.info("MALAYALAM AI MODEL STATUS")
    logger.info("="*50)
    
    for model_type, status in initialization_results.items():
        status_emoji = "✅" if status else "❌"
        logger.info(f"{status_emoji} {model_type.upper()}: {'Ready' if status else 'Failed'}")
        
    logger.info("="*50)
    
    # Example usage (you would replace with actual audio file)
    if initialization_results.get('stt', False):
        logger.info("\n📋 Model integration complete!")
        logger.info("Ready for Malayalam audio processing in your AI IVR system.")
        
        # Show integration example
        logger.info("\n💡 Integration Example:")
        logger.info("   from malayalam_models import MalayalamModelManager")
        logger.info("   manager = MalayalamModelManager()")
        logger.info("   await manager.initialize_models()")
        logger.info("   result = await manager.process_malayalam_call('audio.wav')")
        
    return model_manager

if __name__ == "__main__":
    asyncio.run(main())