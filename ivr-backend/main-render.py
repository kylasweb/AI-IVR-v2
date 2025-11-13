import uuid
from datetime import datetime
from typing import Optional
import os
import logging
import uvicorn
from contextlib import asynccontextmanager

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
    logger.info("Starting AI IVR Backend...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Port: {os.getenv('PORT', 8000)}")
    yield
    # Shutdown
    logger.info("Shutting down AI IVR Backend...")

# Create FastAPI app
app = FastAPI(
    title="AI IVR Platform",
    description="Interactive Voice Response platform with AI agents",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for production
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import services with error handling
try:
    from services.voice_agent import VoiceAgent
    from services.speech_to_text_cloud import SpeechToTextService  # Cloud-compatible version
    from services.text_to_speech import TextToSpeechService
    from services.nlp_service import NLPService
    from services.conversation_manager import ConversationManager

    # Initialize services
    voice_agent = VoiceAgent()
    stt_service = SpeechToTextService()
    tts_service = TextToSpeechService()
    nlp_service = NLPService()
    conversation_manager = ConversationManager()

    logger.info("All services initialized successfully")

except ImportError as e:
    logger.error(f"Failed to import services: {e}")
    # Set dummy services for deployment
    voice_agent = None
    stt_service = None
    tts_service = None
    nlp_service = None
    conversation_manager = None

# In-memory storage for sessions (for production, use Redis or database)
active_sessions = {}

# Pydantic models


class CallRequest(BaseModel):
    phone_number: str
    language: str = "en"
    ivr_flow_id: Optional[str] = None


class VoiceData(BaseModel):
    audio_data: str
    session_id: str


class TextResponse(BaseModel):
    text: str
    session_id: str
    intent: Optional[str] = None
    confidence: Optional[float] = None

# Health check endpoint


@app.get("/health")
async def health_check():
    """Health check endpoint for Render.com"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    return {
        "message": "AI IVR Platform API",
        "status": "active",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.post("/api/call/start")
async def start_call(request: CallRequest):
    """Initialize a new IVR call session"""
    try:
        session_id = str(uuid.uuid4())

        # Create session with mock data for deployment
        session_data = {
            "session_id": session_id,
            "phone_number": request.phone_number,
            "language": request.language,
            "ivr_flow_id": request.ivr_flow_id,
            "status": "initialized",
            "start_time": datetime.now().isoformat()
        }

        active_sessions[session_id] = session_data

        # Mock response for deployment
        response = {
            "session_id": session_id,
            "message": "Welcome to our AI IVR system. How can I help you today?",
            "audio_data": "",  # Mock audio data
            "status": "ready"
        }

        logger.info(
            f"Started new call session: {session_id} for {
                request.phone_number}")
        return response

    except Exception as e:
        logger.error(f"Error starting call: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/voice/process")
async def process_voice(data: VoiceData):
    """Process voice input and return response"""
    try:
        session = active_sessions.get(data.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Mock processing for deployment
        mock_intent = "help"
        mock_confidence = 0.95
        mock_response = "I'm here to help! What do you need assistance with?"

        # Update session
        session["last_activity"] = datetime.now().isoformat()
        session["transcript_count"] = session.get("transcript_count", 0) + 1

        return TextResponse(
            text=mock_response,
            session_id=data.session_id,
            intent=mock_intent,
            confidence=mock_confidence
        )

    except Exception as e:
        logger.error(f"Error processing voice: {str(e)}")
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
                "duration": (datetime.now() -
                           datetime.fromisoformat(session["start_time"])
                           ).total_seconds()
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
        "status": session["status"],
        "start_time": session["start_time"],
        "transcript_count": session.get("transcript_count", 0)
    }


@app.post("/api/sessions/{session_id}/end")
async def end_session(session_id: str):
    """End a call session"""
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["status"] = "completed"
    session["end_time"] = datetime.now().isoformat()

    return {"message": "Session ended successfully"}

# Production server startup
if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(
        "main-render:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
