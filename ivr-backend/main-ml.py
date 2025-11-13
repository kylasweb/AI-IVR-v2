import os
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AI IVR Malayalam Backend...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Port: {os.getenv('PORT', 8000)}")
    logger.info("Primary Language: Malayalam with Manglish support")
    yield
    # Shutdown
    logger.info("Shutting down AI IVR Malayalam Backend...")

# Create FastAPI app
app = FastAPI(
    title="AI IVR Malayalam Platform",
    description=(
        "Interactive Voice Response platform with Malayalam AI agents "
        "and Manglish support"
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for production
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import Malayalam services with error handling
try:
    from services.voice_agent import VoiceAgent
    from services.speech_to_text_ml import MalayalamSpeechToTextService
    from services.text_to_speech_ml import MalayalamTextToSpeechService
    from services.nlp_service_ml import MalayalamNLPService
    from services.conversation_manager_ml import MalayalamConversationManager
    from services.manglish_service import ManglishService

    # Initialize Malayalam services
    voice_agent = VoiceAgent()
    stt_service = MalayalamSpeechToTextService()
    tts_service = MalayalamTextToSpeechService()
    nlp_service = MalayalamNLPService()
    conversation_manager = MalayalamConversationManager()
    manglish_service = ManglishService()

    logger.info("All Malayalam services initialized successfully")

except ImportError as e:
    logger.error(f"Failed to import Malayalam services: {e}")
    # Set dummy services for deployment
    voice_agent = None
    stt_service = None
    tts_service = None
    nlp_service = None
    conversation_manager = None
    manglish_service = None

# In-memory storage for sessions (for production, use Redis or database)
active_sessions = {}


class CallRequest(BaseModel):
    phone_number: str
    language: str = "ml"
    dialect: str = "standard"
    ivr_flow_id: Optional[str] = None


class VoiceData(BaseModel):
    audio_data: str
    session_id: str


class TextResponse(BaseModel):
    text: str
    session_id: str
    intent: Optional[str] = None
    confidence: Optional[float] = None
    language: Optional[str] = None
    dialect: Optional[str] = None
# Health check endpoint


@app.get("/health")
async def health_check():
    """Health check endpoint for Render.com"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0",
        "primary_language": "Malayalam",
        "supports_manglish": True,
        "supported_dialects": ["standard", "travancore", "malabar", "cochin"]
    }


@app.get("/")
async def root():
    return {
        "message": "AI IVR Malayalam Platform API",
        "status": "active",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "primary_language": "Malayalam",
        "supports_manglish": True
    }


@app.post("/api/call/start")
async def start_call(request: CallRequest):
    """Initialize a new IVR call session with Malayalam support"""
    try:
        session_id = str(uuid.uuid4())

        # Create session with Malayalam support
        session_data = {
            "session_id": session_id,
            "phone_number": request.phone_number,
            "language": request.language,
            "dialect": request.dialect,
            "ivr_flow_id": request.ivr_flow_id,
            "status": "initialized",
            "start_time": datetime.now().isoformat()
        }

        active_sessions[session_id] = session_data

        # Get Malayalam greeting
        if conversation_manager:
            greeting = await conversation_manager.get_malayalam_greeting(
                request.language,
                "neutral"  # Default respect level
            )
        else:
            # Fallback greetings
            greetings = {
                "ml": "നമസ്കാരം, എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
                "manglish": "Namaskaram, engane sahayikkam?",
                "en": "Hello! How can I help you today?"
            }
            greeting = greetings.get(request.language, greetings["ml"])

        response = {
            "session_id": session_id,
            "message": greeting,
            "audio_data": "",  # Mock audio data
            "status": "ready",
            "language": request.language,
            "dialect": request.dialect
        }

        logger.info(
            f"Started new Malayalam call session: {session_id} for "
            f"{request.phone_number} (lang: {request.language}, "
            f"dialect: {request.dialect})"
        )
        return response

    except Exception as e:
        logger.error(f"Error starting Malayalam call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/process")
async def process_voice(data: VoiceData):
    """Process voice input and return response with Malayalam/Manglish support"""
    try:
        session = active_sessions.get(data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Mock processing for deployment with Malayalam context
        language = session.get("language", "ml")
        dialect = session.get("dialect", "standard")

        mock_intents = {
            "ml": "help",
            "manglish": "help",
            "en": "help"
        }

        mock_responses = {
            "ml": "ഞാൻ സഹായിക്കാൻ തയ്യാറാണ്. എന്താണ് ആവശ്യം?",
            "manglish": "Njan sahayikan thayarayam. enthanu avashyam?",
            "en": "I'm here to help! What do you need?"
        }

        intent = mock_intents.get(language, "help")
        mock_response = mock_responses.get(language, mock_responses["ml"])
        session["last_activity"] = datetime.now().isoformat()
        session["transcript_count"] = session.get("transcript_count", 0) + 1
        session["last_intent"] = intent

        return TextResponse(
            text=mock_response,
            session_id=data.session_id,
            intent=intent,
            confidence=0.95,
            language=language,
            dialect=dialect
        )

    except Exception as e:
        logger.error(f"Error processing Malayalam voice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sessions")
async def get_sessions():
    """Get all active sessions"""
    return {
        "sessions": [
            {
                "session_id": session_id,
                "phone_number": session["phone_number"],
                "status": session["status"],
                "start_time": session["start_time"],
                "duration": (
                    datetime.now() -
                    datetime.fromisoformat(session["start_time"])
                ).total_seconds(),
                "language": session.get("language", "ml"),
                "dialect": session.get("dialect", "standard")
            }
            for session_id, session in active_sessions.items()
        ]
    }


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get specific session details"""
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session["session_id"],
        "phone_number": session["phone_number"],
        "language": session["language"],
        "dialect": session["dialect"],
        "status": session["status"],
        "start_time": session["start_time"],
        "transcript_count": session.get("transcript_count", 0),
        "last_intent": session.get("last_intent")
    }


@app.post("/api/sessions/{session_id}/end")
async def end_session(session_id: str):
    """End a call session"""
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["status"] = "completed"
    session["end_time"] = datetime.now().isoformat()

    # Malayalam goodbye message
    language = session.get("language", "ml")
    goodbyes = {
        "ml": "വിളിച്ചതിന് നന്ദി. വീണ്ടും കാണാം!",
        "manglish": "Vilichathu nandi. vittu kanam!",
        "en": "Thank you for calling. Goodbye!"
    }

    return {
        "message": "Session ended successfully",
        "goodbye_message": goodbyes.get(language, goodbyes["ml"])
    }

# Malayalam-specific endpoints


@app.get("/api/languages")
async def get_supported_languages():
    """Get supported languages and dialects"""
    return {
        "languages": [
            {
                "code": "ml",
                "name": "മലയാളം",
                "english_name": "Malayalam",
                "flag": "🇮🇳",
                "dialects": [
                    {"code": "standard", "name": "സ്റ്റാൻഡേർഡ്",
                     "english_name": "Standard"},
                    {"code": "travancore", "name": "തിരുവിതാംകൂർ",
                     "english_name": "Travancore"},
                    {"code": "malabar", "name": "മലബാർ",
                     "english_name": "Malabar"},
                    {"code": "cochin", "name": "കൊച്ചി",
                     "english_name": "Cochin"}
                ]
            },
            {
                "code": "manglish",
                "name": "മംഗ്ലീഷ്",
                "english_name": "Manglish",
                "flag": "🇮🇳",
                "dialects": [
                    {"code": "standard", "name": "സ്റ്റാൻഡേർഡ്",
                     "english_name": "Standard"},
                    {"code": "casual", "name": "കാഷ്വൽ",
                     "english_name": "Casual"},
                    {"code": "formal", "name": "ഫോർമൽ",
                     "english_name": "Formal"}
                ]
            },
            {
                "code": "en",
                "name": "English",
                "english_name": "English",
                "flag": "🇬🇧",
                "dialects": [
                    {"code": "standard", "name": "Standard",
                     "english_name": "Standard"},
                    {"code": "us", "name": "US English",
                     "english_name": "US English"},
                    {"code": "uk", "name": "UK English",
                     "english_name": "UK English"}
                ]
            }
        ]
    }


@app.get("/api/malayalam/phrases")
async def get_malayalam_phrases():
    """Get common Malayalam phrases for testing"""
    if not stt_service:
        return {"error": "Speech service not available"}

    return await stt_service.get_malayalam_audio_samples()


@app.get("/api/manglish/validate")
async def validate_manglish(text: str):
    """Validate and provide feedback on Manglish input"""
    if not manglish_service:
        return {"error": "Manglish service not available"}

    return manglish_service.validate_manglish_input(text)

# Production server startup
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main-ml:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
