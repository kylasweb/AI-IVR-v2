"""
IMOS Communications Engine - FastAPI Integration Server
Connects transport webhooks to AI engine for real-time processing
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from transport.call_session_manager import CallSessionManager, TransportType, TransportMetadata
from ai import AIEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
session_manager: Optional[CallSessionManager] = None
ai_engine: Optional[AIEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown"""
    global session_manager, ai_engine

    # Startup
    logger.info("🚀 Starting IMOS Communications Engine")

    # Initialize transport layer
    session_manager = CallSessionManager()
    logger.info("✅ Transport layer initialized")

    # Initialize AI layer
    ai_engine = AIEngine()
    success = await ai_engine.initialize()
    if not success:
        logger.error("❌ Failed to initialize AI engine")
        raise RuntimeError("AI engine initialization failed")

    logger.info("✅ AI layer initialized")
    logger.info("🎉 IMOS Communications Engine ready!")

    yield

    # Shutdown
    logger.info("🛑 Shutting down IMOS Communications Engine")
    if ai_engine:
        await ai_engine.cleanup()
    logger.info("✅ Cleanup complete")

# Create FastAPI app
app = FastAPI(
    title="IMOS Communications Engine",
    description="Transport-agnostic AI-powered communications platform",
    version="2.0.0",
    lifespan=lifespan
)

# Request/Response models
class WebhookRequest(BaseModel):
    """Generic webhook request model"""
    event_type: str
    data: Dict[str, Any]
    provider: str

class AIResponse(BaseModel):
    """AI processing response"""
    response_text: str
    actions: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    transport_layer: bool
    ai_layer: bool
    version: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        transport_layer=session_manager is not None,
        ai_layer=ai_engine is not None and ai_engine.router is not None,
        version="2.0.0"
    )

@app.post("/webhook/twilio")
async def twilio_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Twilio webhooks"""
    try:
        form_data = await request.form()
        data = dict(form_data)

        logger.info(f"📞 Twilio webhook: {data.get('CallSid', 'unknown')}")

        # Extract call information
        call_sid = data.get("CallSid")
        from_number = data.get("From")
        to_number = data.get("To")
        call_status = data.get("CallStatus")

        if not call_sid or not from_number:
            raise HTTPException(status_code=400, detail="Missing required call data")

        # Create transport metadata
        transport_metadata = TransportMetadata(
            transport_type=TransportType.TWILIO,
            provider_id="twilio",
            connection_id=call_sid
        )

        # Handle different call events
        if call_status == "ringing":
            # New call - create session
            session = await session_manager.create_session(
                phone_number=from_number,
                transport_metadata=transport_metadata,
                language="ml",  # Default to Malayalam for Kerala
                dialect="travancore"
            )
            logger.info(f"📞 Created session: {session.session_id}")

            # Return TwiML for initial greeting
            twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="ml-IN" voice="Polly.Aditi">നമസ്കാരം! ഇത് ഐഎംഒഎസ് കമ്മ്യൂണിക്കേഷൻസ് എഞ്ചിൻ ആണ്. എങ്ങനെ സഹായിക്കാം?</Say>
    <Gather input="speech" language="ml-IN" timeout="5" action="/webhook/twilio/voice" method="POST">
        <Say>ദയവായി സംസാരിക്കുക</Say>
    </Gather>
</Response>"""

            return JSONResponse(content={"twiml": twiml_response}, media_type="application/xml")

        elif call_status in ["completed", "failed", "busy", "no-answer"]:
            # Call ended - cleanup session
            await session_manager.end_session_by_connection_id(call_sid)
            logger.info(f"📞 Ended session for call: {call_sid}")
            return {"status": "call_ended"}

        return {"status": "processed"}

    except Exception as e:
        logger.error(f"❌ Twilio webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/twilio/voice")
async def twilio_voice_processing(request: Request, background_tasks: BackgroundTasks):
    """Process voice input from Twilio"""
    try:
        form_data = await request.form()
        data = dict(form_data)

        call_sid = data.get("CallSid")
        speech_result = data.get("SpeechResult")

        if not call_sid:
            raise HTTPException(status_code=400, detail="Missing CallSid")

        logger.info(f"🎤 Processing voice for call: {call_sid}")

        # Get session
        session = await session_manager.get_session_by_connection_id(call_sid)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        # Process with AI engine
        if speech_result and ai_engine:
            # Route to appropriate AI model
            from ai.models.ai_model_router import AIModelType

            routing_decision = await ai_engine.router.route_request(
                language=session.language,
                dialect=session.dialect,
                model_type=AIModelType.CONVERSATIONAL_AI
            )

            # Process the speech input
            ai_response = await ai_engine.process_conversation(
                session_id=session.session_id,
                user_input=speech_result,
                language=session.language,
                dialect=session.dialect
            )

            # Generate TwiML response
            twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="ml-IN" voice="Polly.Aditi">{ai_response.response_text}</Say>
    <Gather input="speech" language="ml-IN" timeout="5" action="/webhook/twilio/voice" method="POST">
        <Say>മറ്റെന്താണ് സഹായം ആവശ്യമുള്ളത്?</Say>
    </Gather>
</Response>"""

            return JSONResponse(content={"twiml": twiml_response}, media_type="application/xml")

        # No speech result - reprompt
        twiml_response = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say language="ml-IN" voice="Polly.Aditi">ക്ഷമിക്കണം, ഞാൻ കേൾക്കുന്നില്ല. ദയവായി വീണ്ടും പറയുക.</Say>
    <Gather input="speech" language="ml-IN" timeout="5" action="/webhook/twilio/voice" method="POST">
        <Say>സംസാരിക്കുക</Say>
    </Gather>
</Response>"""

        return JSONResponse(content={"twiml": twiml_response}, media_type="application/xml")

    except Exception as e:
        logger.error(f"❌ Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/exotel")
async def exotel_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Exotel webhooks"""
    try:
        data = await request.json()
        logger.info(f"📞 Exotel webhook: {data}")

        # Extract call information
        call_sid = data.get("CallSid")
        from_number = data.get("From")
        call_status = data.get("Status")

        if not call_sid or not from_number:
            raise HTTPException(status_code=400, detail="Missing required call data")

        # Create transport metadata
        transport_metadata = TransportMetadata(
            transport_type=TransportType.EXOTEL,
            provider_id="exotel",
            connection_id=call_sid
        )

        if call_status == "ringing":
            # New call - create session
            session = await session_manager.create_session(
                phone_number=from_number,
                transport_metadata=transport_metadata,
                language="ml",
                dialect="malabar"  # Northern Kerala dialect
            )
            logger.info(f"📞 Created Exotel session: {session.session_id}")

        elif call_status in ["completed", "failed"]:
            # Call ended - cleanup
            await session_manager.end_session_by_connection_id(call_sid)
            logger.info(f"📞 Ended Exotel session for call: {call_sid}")

        return {"status": "processed"}

    except Exception as e:
        logger.error(f"❌ Exotel webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{session_id}")
async def get_session_info(session_id: str):
    """Get session information"""
    try:
        session = await session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "session_id": session.session_id,
            "phone_number": session.phone_number,
            "language": session.language,
            "dialect": session.dialect,
            "transport_type": session.transport_metadata.transport_type.value,
            "status": session.status.value,
            "created_at": session.created_at.isoformat(),
            "last_activity": session.last_activity.isoformat()
        }

    except Exception as e:
        logger.error(f"❌ Session info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/process")
async def process_ai_request(request: Request):
    """Direct AI processing endpoint for testing"""
    try:
        data = await request.json()
        session_id = data.get("session_id")
        user_input = data.get("user_input")
        language = data.get("language", "en")
        dialect = data.get("dialect")

        if not user_input:
            raise HTTPException(status_code=400, detail="Missing user_input")

        # Process with AI engine
        ai_response = await ai_engine.process_conversation(
            session_id=session_id,
            user_input=user_input,
            language=language,
            dialect=dialect
        )

        return {
            "response": ai_response.response_text,
            "actions": ai_response.actions,
            "metadata": ai_response.metadata
        }

    except Exception as e:
        logger.error(f"❌ AI processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/settings")
async def get_settings():
    """Get current API settings"""
    try:
        return {
            "integration": {
                "vocode": {
                    "api_key": os.getenv('VOCODE_API_KEY', ''),
                    "base_url": os.getenv('VOCODE_BASE_URL', 'api.vocode.dev'),
                    "organization_id": os.getenv('VOCODE_ORGANIZATION_ID', '')
                },
                "openai": {
                    "api_key": os.getenv('OPENAI_API_KEY', '')
                },
                "azure": {
                    "speech_key": os.getenv('AZURE_SPEECH_KEY', ''),
                    "speech_region": os.getenv('AZURE_SPEECH_REGION', 'eastus')
                },
                "deepgram": {
                    "api_key": os.getenv('DEEPGRAM_API_KEY', '')
                }
            }
        }
    except Exception as e:
        logger.error(f"❌ Settings retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/settings")
async def update_settings(request: Request):
    """Update API settings and environment variables"""
    try:
        data = await request.json()
        settings = data.get("settings", {})

        # Update environment variables
        integration = settings.get("integration", {})

        if integration.get("vocode", {}).get("api_key"):
            os.environ['VOCODE_API_KEY'] = integration["vocode"]["api_key"]
        if integration.get("vocode", {}).get("base_url"):
            os.environ['VOCODE_BASE_URL'] = integration["vocode"]["base_url"]
        if integration.get("vocode", {}).get("organization_id"):
            os.environ['VOCODE_ORGANIZATION_ID'] = integration["vocode"]["organization_id"]

        if integration.get("openai", {}).get("api_key"):
            os.environ['OPENAI_API_KEY'] = integration["openai"]["api_key"]

        if integration.get("azure", {}).get("speech_key"):
            os.environ['AZURE_SPEECH_KEY'] = integration["azure"]["speech_key"]
        if integration.get("azure", {}).get("speech_region"):
            os.environ['AZURE_SPEECH_REGION'] = integration["azure"]["speech_region"]

        if integration.get("deepgram", {}).get("api_key"):
            os.environ['DEEPGRAM_API_KEY'] = integration["deepgram"]["api_key"]

        # Re-initialize AI engine with new settings (if needed)
        if ai_engine:
            logger.info("🔄 Re-initializing AI engine with new settings...")
            success = await ai_engine.initialize()
            if not success:
                logger.warning("⚠️ AI engine re-initialization failed, but settings updated")

        logger.info("✅ API settings updated successfully")
        return {
            "success": True,
            "message": "Settings updated successfully",
            "ai_engine_reinitialized": ai_engine is not None
        }

    except Exception as e:
        logger.error(f"❌ Settings update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)