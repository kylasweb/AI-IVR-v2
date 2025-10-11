from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import asyncio
import logging
from datetime import datetime
import uuid

from services.voice_agent import VoiceAgent
from services.speech_to_text import SpeechToTextService
from services.text_to_speech import TextToSpeechService
from services.nlp_service import NLPService
from services.conversation_manager import ConversationManager
from models.call_session import CallSession
from models.ivr_config import IVRConfig

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI IVR Platform",
    description="Interactive Voice Response platform with AI agents",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services
voice_agent = VoiceAgent()
stt_service = SpeechToTextService()
tts_service = TextToSpeechService()
nlp_service = NLPService()
conversation_manager = ConversationManager()

# Active connections
active_connections: Dict[str, WebSocket] = {}
active_sessions: Dict[str, CallSession] = {}

class CallRequest(BaseModel):
    phone_number: str
    language: str = "en"
    ivr_flow_id: Optional[str] = None

class VoiceData(BaseModel):
    audio_data: str  # base64 encoded
    session_id: str

class TextResponse(BaseModel):
    text: str
    session_id: str
    intent: Optional[str] = None
    confidence: Optional[float] = None

@app.get("/")
async def root():
    return {"message": "AI IVR Platform API", "status": "active"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "voice_agent": voice_agent.is_healthy(),
            "stt_service": stt_service.is_healthy(),
            "tts_service": tts_service.is_healthy(),
            "nlp_service": nlp_service.is_healthy()
        }
    }

@app.post("/api/call/start")
async def start_call(request: CallRequest):
    """Initialize a new IVR call session"""
    try:
        session_id = str(uuid.uuid4())
        session = CallSession(
            session_id=session_id,
            phone_number=request.phone_number,
            language=request.language,
            ivr_flow_id=request.ivr_flow_id,
            status="initialized"
        )
        
        active_sessions[session_id] = session
        
        # Initialize conversation
        greeting = await conversation_manager.get_greeting(request.language)
        response = {
            "session_id": session_id,
            "message": greeting,
            "audio_data": await tts_service.synthesize(greeting, request.language),
            "status": "ready"
        }
        
        logger.info(f"Started new call session: {session_id} for {request.phone_number}")
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
        
        # Convert speech to text
        transcript = await stt_service.transcribe(data.audio_data, session.language)
        
        # Process with NLP
        intent, entities, confidence = await nlp_service.analyze_intent(transcript, session.language)
        
        # Generate response
        response_text = await conversation_manager.generate_response(
            transcript, intent, entities, session
        )
        
        # Convert response to speech
        audio_data = await tts_service.synthesize(response_text, session.language)
        
        # Update session
        session.add_transcript(transcript, response_text, intent, confidence)
        
        return TextResponse(
            text=response_text,
            session_id=data.session_id,
            intent=intent,
            confidence=confidence
        )
        
    except Exception as e:
        logger.error(f"Error processing voice: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/call/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time voice communication"""
    await websocket.accept()
    active_connections[session_id] = websocket
    
    try:
        session = active_sessions.get(session_id)
        if not session:
            await websocket.close(code=404, reason="Session not found")
            return
        
        session.status = "active"
        
        while True:
            # Receive audio data
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "audio":
                # Process audio
                transcript = await stt_service.transcribe(
                    message["audio_data"], session.language
                )
                
                # Process intent
                intent, entities, confidence = await nlp_service.analyze_intent(
                    transcript, session.language
                )
                
                # Generate response
                response_text = await conversation_manager.generate_response(
                    transcript, intent, entities, session
                )
                
                # Convert to speech
                audio_response = await tts_service.synthesize(
                    response_text, session.language
                )
                
                # Send response
                await websocket.send_text(json.dumps({
                    "type": "response",
                    "text": response_text,
                    "audio_data": audio_response,
                    "transcript": transcript,
                    "intent": intent,
                    "confidence": confidence
                }))
                
                # Update session
                session.add_transcript(transcript, response_text, intent, confidence)
                
            elif message["type"] == "end_call":
                session.status = "completed"
                session.end_time = datetime.now()
                break
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session: {session_id}")
        if session_id in active_sessions:
            active_sessions[session_id].status = "disconnected"
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close(code=500, reason=str(e))
    finally:
        if session_id in active_connections:
            del active_connections[session_id]

@app.get("/api/sessions")
async def get_sessions():
    """Get all active sessions"""
    return {
        "sessions": [
            {
                "session_id": session.session_id,
                "phone_number": session.phone_number,
                "status": session.status,
                "start_time": session.start_time.isoformat(),
                "duration": session.get_duration()
            }
            for session in active_sessions.values()
        ]
    }

@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    """Get specific session details"""
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "phone_number": session.phone_number,
        "language": session.language,
        "status": session.status,
        "start_time": session.start_time.isoformat(),
        "end_time": session.end_time.isoformat() if session.end_time else None,
        "transcript": session.transcript,
        "duration": session.get_duration()
    }

@app.post("/api/sessions/{session_id}/end")
async def end_session(session_id: str):
    """End a call session"""
    session = active_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = "completed"
    session.end_time = datetime.now()
    
    # Notify via WebSocket if still connected
    if session_id in active_connections:
        await active_connections[session_id].send_text(json.dumps({
            "type": "call_ended",
            "message": "Thank you for calling. Goodbye!"
        }))
    
    return {"message": "Session ended successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)