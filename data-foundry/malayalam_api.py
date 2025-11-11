#!/usr/bin/env python3
"""
AI4Bharat Malayalam Conversational AI API
Production-ready FastAPI service with human-like conversation features
Enhanced for natural, empathetic, and culturally-aware interactions
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import logging
import tempfile
import os
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel

from malayalam_models import MalayalamModelManager, ModelConfig
from human_conversation_system import HumanLikeConversationSystem

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for API
class TranscriptionRequest(BaseModel):
    audio_url: Optional[str] = None
    language: str = "malayalam"

class TranscriptionResponse(BaseModel):
    transcription: str
    confidence: float
    language: str
    success: bool
    duration: Optional[float] = None

class IntentRequest(BaseModel):
    text: str
    language: str = "malayalam"

class IntentResponse(BaseModel):
    intent: str
    confidence: float
    text: str
    success: bool
    recommended_action: str

class TranslationRequest(BaseModel):
    text: str
    source_language: str = "malayalam"
    target_language: str = "english"

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    success: bool

class ConversationRequest(BaseModel):
    user_id: str
    text: str
    language: str = "malayalam"
    context: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    user_id: str
    original_input: str
    enhanced_response: str
    emotion_analysis: Dict[str, Any]
    prosody_config: Dict[str, Any]
    conversation_flow: Dict[str, Any]
    human_like_score: float
    success: bool

class CallProcessingResponse(BaseModel):
    transcription: Dict[str, Any]
    intent: Dict[str, Any]
    translation: Dict[str, Any]
    sentiment: Dict[str, Any]
    recommended_action: str
    processing_success: bool

# Initialize FastAPI app
app = FastAPI(
    title="Malayalam AI IVR Service",
    description="Advanced Malayalam language processing for AI IVR systems",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
model_manager: Optional[MalayalamModelManager] = None
conversation_system: Optional[HumanLikeConversationSystem] = None

@app.on_event("startup")
async def startup_event():
    """Initialize models and conversation system on startup"""
    global model_manager, conversation_system
    
    logger.info("🚀 Starting AI4Bharat Malayalam Conversational AI Service...")
    
    try:
        config = ModelConfig()
        model_manager = MalayalamModelManager(config)
        conversation_system = HumanLikeConversationSystem()
        
        initialization_results = await model_manager.initialize_models()
        
        success_count = sum(initialization_results.values())
        total_count = len(initialization_results)
        
        logger.info(f"✅ Model initialization complete: {success_count}/{total_count} models ready")
        logger.info("🤖 Human-like conversation system initialized")
        
        if success_count == 0:
            logger.error("❌ No models loaded successfully - service may not function properly")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize models: {e}")
        model_manager = None

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Malayalam AI IVR Service",
        "version": "1.0.0",
        "status": "active" if model_manager else "initializing",
        "capabilities": [
            "Malayalam Speech Recognition",
            "Intent Classification", 
            "Malayalam-English Translation",
            "Sentiment Analysis",
            "Complete Call Processing"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    if not model_manager:
        raise HTTPException(status_code=503, detail="Models not initialized")
    
    model_status = model_manager.get_model_status()
    healthy_models = sum(model_status.values())
    total_models = len(model_status)
    
    return {
        "status": "healthy" if healthy_models > 0 else "unhealthy",
        "models_loaded": f"{healthy_models}/{total_models}",
        "model_status": model_status,
        "timestamp": "2025-11-10T00:00:00Z"
    }

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """
    Transcribe Malayalam audio to text
    
    Upload an audio file and receive Malayalam transcription
    """
    if not model_manager:
        raise HTTPException(status_code=503, detail="Models not initialized")
    
    if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be audio format")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            
        # Process transcription
        result = await model_manager.transcribe_malayalam_audio(temp_file_path)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'Transcription failed'))
            
        return TranscriptionResponse(
            transcription=result['transcription'],
            confidence=result['confidence'],
            language=result['language'],
            success=result['success'],
            duration=result.get('audio_duration')
        )
        
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/intent", response_model=IntentResponse)
async def analyze_intent(request: IntentRequest):
    """
    Analyze intent of Malayalam text
    
    Classify the intent and recommend appropriate actions
    """
    if not model_manager:
        raise HTTPException(status_code=503, detail="Models not initialized")
    
    try:
        result = await model_manager.understand_malayalam_intent(request.text)
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'Intent analysis failed'))
        
        # Get recommended action
        sentiment_result = await model_manager.analyze_sentiment(request.text)
        recommended_action = model_manager._get_recommended_action(result, sentiment_result)
        
        return IntentResponse(
            intent=result['intent'],
            confidence=result['confidence'],
            text=result['text'],
            success=result['success'],
            recommended_action=recommended_action
        )
        
    except Exception as e:
        logger.error(f"Intent analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    """
    Translate Malayalam text to English
    
    Supports bidirectional Malayalam-English translation
    """
    if not model_manager:
        raise HTTPException(status_code=503, detail="Models not initialized")
    
    try:
        if request.source_language == "malayalam" and request.target_language == "english":
            result = await model_manager.translate_to_english(request.text)
        else:
            raise HTTPException(status_code=400, detail="Currently supports Malayalam to English translation only")
        
        if not result.get('success'):
            raise HTTPException(status_code=500, detail=result.get('error', 'Translation failed'))
            
        return TranslationResponse(
            original_text=result['original_text'],
            translated_text=result['translated_text'],
            source_language=result['source_language'],
            target_language=result['target_language'],
            success=result['success']
        )
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-call", response_model=CallProcessingResponse)
async def process_complete_call(audio_file: UploadFile = File(...)):
    """
    Complete Malayalam call processing pipeline
    
    Upload audio file and receive complete analysis including:
    - Speech transcription
    - Intent classification
    - English translation
    - Sentiment analysis
    - Recommended actions
    """
    if not model_manager:
        raise HTTPException(status_code=503, detail="Models not initialized")
    
    if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be audio format")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
            
        # Process complete call
        result = await model_manager.process_malayalam_call(temp_file_path)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if not result.get('processing_success'):
            raise HTTPException(status_code=500, detail="Call processing failed")
            
        return CallProcessingResponse(
            transcription=result['transcription'],
            intent=result['intent'], 
            translation=result['translation'],
            sentiment=result['sentiment'],
            recommended_action=result['recommended_action'],
            processing_success=result['processing_success']
        )
        
    except Exception as e:
        logger.error(f"Call processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/status")
async def get_model_status():
    """Get detailed status of all loaded models"""
    if not model_manager:
        raise HTTPException(status_code=503, detail="Models not initialized")
    
    status = model_manager.get_model_status()
    
    return {
        "models": status,
        "total_models": len(status),
        "loaded_models": sum(status.values()),
        "model_details": {
            "stt": "Malayalam Speech-to-Text (AI4Bharat/Local Models)",
            "nlu": "Language Understanding (IndicBERT)",
            "translation": "Malayalam-English Translation (IndicTrans2)",
            "sentiment": "Sentiment Analysis",
            "tts": "Text-to-Speech (Placeholder)",
            "vertex_ai": "Google Vertex AI STT (Cloud API)",
            "assemblyai": "AssemblyAI STT (Cloud API)"
        },
        "cloud_apis_enabled": model_manager.config.use_cloud_apis_first,
        "transcription_priority": "Cloud APIs → Local Models" if model_manager.config.use_cloud_apis_first else "Local Models Only"
    }

@app.post("/reload-models")
async def reload_models():
    """Reload all models (admin endpoint)"""
    global model_manager
    
    try:
        if model_manager:
            # Clear existing models
            model_manager.models.clear()
            
        # Reinitialize
        config = ModelConfig()
        model_manager = MalayalamModelManager(config)
        initialization_results = await model_manager.initialize_models()
        
        success_count = sum(initialization_results.values())
        total_count = len(initialization_results)
        
        return {
            "message": "Models reloaded successfully",
            "models_loaded": f"{success_count}/{total_count}",
            "initialization_results": initialization_results
        }
        
    except Exception as e:
        logger.error(f"Model reload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add API versioning
@app.get("/v1/info")
async def api_info():
    """API version and capability information"""
    return {
        "api_version": "1.0",
        "supported_languages": ["malayalam"],
        "supported_operations": [
            "speech_recognition",
            "intent_classification",
            "translation",
            "sentiment_analysis",
            "complete_call_processing"
        ],
        "model_providers": [
            "AI4Bharat",
            "L3Cube Research",
            "Microsoft",
            "Cardiff NLP"
        ]
    }

@app.post("/conversation", response_model=ConversationResponse)
async def enhance_conversation(request: ConversationRequest):
    """
    Enhance Malayalam conversation with human-like intelligence
    
    Provides emotion analysis, cultural adaptation, natural prosody,
    and empathetic responses for truly human-like conversation.
    """
    if not model_manager or not conversation_system:
        raise HTTPException(status_code=503, detail="Services not initialized")
    
    try:
        # Process individual components first
        intent_result = await model_manager.understand_malayalam_intent(request.text)
        sentiment_result = await model_manager.analyze_sentiment(request.text)
        
        # Enhance with human-like conversation intelligence
        enhancement_result = await conversation_system.enhance_conversation(
            user_id=request.user_id,
            malayalam_text=request.text,
            transcription_result={"transcription": request.text, "success": True},
            intent_result=intent_result,
            sentiment_result=sentiment_result
        )
        
        return ConversationResponse(
            user_id=request.user_id,
            original_input=request.text,
            enhanced_response=enhancement_result['response_text'],
            emotion_analysis=enhancement_result['enhanced_analysis']['emotion_analysis'],
            prosody_config=enhancement_result['tts_config'],
            conversation_flow=enhancement_result['enhanced_analysis']['conversation_flow'],
            human_like_score=enhancement_result['human_like_score'],
            success=True
        )
        
    except Exception as e:
        logger.error(f"❌ Conversation enhancement failed: {e}")
        raise HTTPException(status_code=500, detail=f"Conversation enhancement failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "malayalam_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )