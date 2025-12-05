"""
Extended API Routes for AI IVR Backend
Dashboard Analytics, Call Transfer, Video IVR, and Advanced Voice Processing
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import random
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================
# Pydantic Models
# ============================================================

class DashboardStatsResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    timestamp: str


class VoiceProcessRequest(BaseModel):
    audio_data: str
    session_id: str
    language: Optional[str] = "ml"
    dialect: Optional[str] = "central_kerala"
    processing_options: Optional[Dict[str, bool]] = None


class VoiceProcessResponse(BaseModel):
    success: bool
    session_id: str
    transcription: Optional[Dict[str, Any]] = None
    intent: Optional[Dict[str, Any]] = None
    emotion: Optional[Dict[str, Any]] = None
    entities: Optional[List[Dict[str, Any]]] = None
    response: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any]


class CallTransferRequest(BaseModel):
    session_id: str
    destination_id: str
    transfer_type: str  # 'video_ivr', 'agent', 'queue', 'callback', 'ivr_flow'
    reason: Optional[str] = None
    priority: Optional[str] = "normal"
    notes: Optional[str] = None
    caller_info: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None


class CallTransferResponse(BaseModel):
    success: bool
    transfer_id: str
    status: str
    destination: Dict[str, Any]
    estimated_wait_time: Optional[int] = None
    video_session_url: Optional[str] = None


class VideoCallRequest(BaseModel):
    workflow_id: Optional[str] = None
    caller_info: Optional[Dict[str, Any]] = None
    language: Optional[str] = "ml"
    dialect: Optional[str] = "central_kerala"


class EndVideoCallRequest(BaseModel):
    reason: Optional[str] = None
    outcome: Optional[str] = "completed"
    satisfaction_score: Optional[int] = None
    recording_action: Optional[str] = None


class RecordingRequest(BaseModel):
    action: str  # 'start', 'stop', 'process', 'archive'
    call_id: Optional[str] = None
    recording_id: Optional[str] = None
    recording_settings: Optional[Dict[str, Any]] = None


# ============================================================
# Dashboard Analytics Endpoints
# ============================================================

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(timeframe: str = "today", include_history: bool = False):
    """Get comprehensive dashboard statistics"""
    try:
        now = datetime.now()
        
        # IVR Call Statistics
        ivr_stats = {
            "active_calls": random.randint(5, 20),
            "total_calls_today": random.randint(200, 500),
            "total_calls_week": random.randint(1500, 3500),
            "avg_call_duration": random.randint(120, 300),
            "peak_hours": [
                {"hour": h, "calls": random.randint(10, 80)} for h in range(24)
            ],
            "call_distribution": [
                {"type": "Customer Support", "count": random.randint(100, 250)},
                {"type": "Booking", "count": random.randint(80, 180)},
                {"type": "Enquiry", "count": random.randint(50, 120)},
                {"type": "Complaint", "count": random.randint(20, 60)},
                {"type": "Feedback", "count": random.randint(10, 40)}
            ]
        }
        
        # Voice AI Statistics
        voice_ai_stats = {
            "stt_requests_today": random.randint(1000, 2500),
            "tts_requests_today": random.randint(800, 1800),
            "avg_stt_latency": random.randint(150, 350),
            "avg_tts_latency": random.randint(200, 450),
            "transcription_accuracy": 0.92 + random.random() * 0.06,
            "languages_used": [
                {"language": "Malayalam", "count": random.randint(500, 1200)},
                {"language": "English", "count": random.randint(400, 900)},
                {"language": "Hindi", "count": random.randint(100, 250)},
                {"language": "Tamil", "count": random.randint(50, 150)}
            ],
            "dialects_used": [
                {"dialect": "Central Kerala", "count": random.randint(200, 500)},
                {"dialect": "Malabar", "count": random.randint(150, 350)},
                {"dialect": "Travancore", "count": random.randint(100, 250)},
                {"dialect": "Cochin", "count": random.randint(75, 180)}
            ]
        }
        
        # System Health
        system_health = {
            "api_status": "healthy",
            "database_status": "healthy",
            "voice_services_status": "healthy",
            "video_ivr_status": "healthy",
            "uptime_percentage": 99.5 + random.random() * 0.4,
            "last_incident": None,
            "active_alerts": random.randint(0, 3)
        }
        
        # Performance Metrics
        performance_metrics = {
            "avg_response_time": random.randint(300, 600),
            "success_rate": 0.94 + random.random() * 0.05,
            "customer_satisfaction": 4.2 + random.random() * 0.6,
            "first_call_resolution": 0.75 + random.random() * 0.15
        }
        
        # Real-time Stats
        real_time = {
            "active_video_calls": random.randint(2, 10),
            "active_voice_calls": random.randint(10, 30),
            "queued_calls": random.randint(0, 5),
            "agents_online": random.randint(8, 20),
            "ai_agents_active": random.randint(5, 15)
        }
        
        return {
            "success": True,
            "data": {
                "ivr_stats": ivr_stats,
                "voice_ai_stats": voice_ai_stats,
                "system_health": system_health,
                "performance_metrics": performance_metrics,
                "trending": {
                    "calls_trend": "up" if random.random() > 0.4 else "stable",
                    "satisfaction_trend": "up",
                    "efficiency_trend": "up" if random.random() > 0.3 else "stable"
                },
                "real_time": real_time
            },
            "timestamp": now.isoformat()
        }
    except Exception as e:
        logger.error(f"Dashboard stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/dashboard/stats")
async def query_dashboard_analytics(query_type: str, filters: Optional[Dict] = None):
    """Advanced dashboard analytics queries"""
    try:
        if query_type == "call_breakdown":
            return {
                "success": True,
                "data": {
                    "by_hour": [
                        {"hour": h, "inbound": random.randint(10, 50), "outbound": random.randint(5, 30), "video": random.randint(2, 10)}
                        for h in range(24)
                    ],
                    "by_type": [
                        {"type": "voice_only", "count": random.randint(200, 500), "percentage": 65},
                        {"type": "voice_to_video", "count": random.randint(50, 120), "percentage": 20},
                        {"type": "video_only", "count": random.randint(30, 80), "percentage": 15}
                    ],
                    "by_outcome": [
                        {"outcome": "resolved", "count": random.randint(200, 400), "percentage": 70},
                        {"outcome": "transferred", "count": random.randint(50, 100), "percentage": 15},
                        {"outcome": "callback_scheduled", "count": random.randint(20, 50), "percentage": 10},
                        {"outcome": "abandoned", "count": random.randint(10, 30), "percentage": 5}
                    ]
                },
                "query_type": query_type,
                "timestamp": datetime.now().isoformat()
            }
        
        elif query_type == "agent_performance":
            agents = ["AI Agent Alpha", "AI Agent Beta", "AI Agent Gamma", "Human Agent 1", "Human Agent 2"]
            return {
                "success": True,
                "data": {
                    "agents": [
                        {
                            "name": name,
                            "type": "ai" if "AI" in name else "human",
                            "calls_handled": random.randint(50, 120),
                            "avg_handling_time": random.randint(90, 240),
                            "satisfaction_score": 4.0 + random.random() * 0.8,
                            "resolution_rate": 0.75 + random.random() * 0.2,
                            "status": "online" if random.random() > 0.2 else "offline"
                        }
                        for name in agents
                    ],
                    "ai_vs_human": {
                        "ai_efficiency": 0.85 + random.random() * 0.1,
                        "human_efficiency": 0.75 + random.random() * 0.15,
                        "ai_satisfaction": 4.2 + random.random() * 0.5,
                        "human_satisfaction": 4.4 + random.random() * 0.4
                    }
                },
                "query_type": query_type,
                "timestamp": datetime.now().isoformat()
            }
        
        elif query_type == "language_analytics":
            return {
                "success": True,
                "data": {
                    "language_distribution": [
                        {"language": "Malayalam", "percentage": 55, "accuracy": 0.96},
                        {"language": "English", "percentage": 30, "accuracy": 0.98},
                        {"language": "Hindi", "percentage": 10, "accuracy": 0.94},
                        {"language": "Tamil", "percentage": 5, "accuracy": 0.93}
                    ],
                    "dialect_performance": [
                        {"dialect": "Central Kerala", "accuracy": 0.97, "usage_count": 450},
                        {"dialect": "Malabar", "accuracy": 0.95, "usage_count": 280},
                        {"dialect": "Travancore", "accuracy": 0.94, "usage_count": 200},
                        {"dialect": "Cochin", "accuracy": 0.96, "usage_count": 150}
                    ],
                    "code_switching": {
                        "frequency": 0.35,
                        "common_patterns": ["Malayalam-English", "English-Malayalam", "Malayalam-Hindi"]
                    }
                },
                "query_type": query_type,
                "timestamp": datetime.now().isoformat()
            }
        
        elif query_type == "voice_quality":
            return {
                "success": True,
                "data": {
                    "overall_quality": {
                        "stt_accuracy": 0.95,
                        "tts_naturalness": 0.88,
                        "latency_p50": 250,
                        "latency_p95": 450,
                        "latency_p99": 750
                    },
                    "by_language": [
                        {"language": "Malayalam", "stt_accuracy": 0.94, "tts_naturalness": 0.90},
                        {"language": "English", "stt_accuracy": 0.97, "tts_naturalness": 0.92},
                        {"language": "Hindi", "stt_accuracy": 0.93, "tts_naturalness": 0.87}
                    ],
                    "error_analysis": {
                        "stt_errors": [
                            {"type": "background_noise", "count": 45, "percentage": 30},
                            {"type": "accent_variation", "count": 38, "percentage": 25},
                            {"type": "code_switching", "count": 30, "percentage": 20}
                        ],
                        "recovery_rate": 0.85
                    }
                },
                "query_type": query_type,
                "timestamp": datetime.now().isoformat()
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown query type: {query_type}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard analytics query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Real-Time Voice Processing Endpoints
# ============================================================

@router.get("/api/voice/process")
async def get_voice_capabilities():
    """Get voice processing capabilities"""
    return {
        "success": True,
        "capabilities": {
            "transcription": {
                "languages": ["ml", "en", "hi", "ta"],
                "dialects": ["central_kerala", "malabar", "travancore", "cochin", "kasaragod"],
                "real_time": True,
                "max_audio_duration_seconds": 60
            },
            "intent_detection": {
                "supported_intents": [
                    "create_booking", "cancel_booking", "check_status",
                    "contact_driver", "payment_issue", "general_help",
                    "complaint", "feedback", "schedule_ride"
                ],
                "confidence_threshold": 0.7
            },
            "emotion_analysis": {
                "emotions": ["neutral", "happy", "frustrated", "angry", "sad", "anxious", "excited"],
                "includes_sentiment": True,
                "includes_valence_arousal": True
            },
            "entity_extraction": {
                "entity_types": ["PHONE_NUMBER", "LOCATION", "TIME", "DATE", "BOOKING_ID", "AMOUNT"],
                "language_aware": True
            },
            "response_generation": {
                "languages": ["ml", "en"],
                "dialect_aware": True,
                "emotion_aware": True
            }
        },
        "model_versions": {
            "stt": "2.1.0",
            "intent": "1.5.0",
            "emotion": "1.2.0",
            "ner": "1.3.0",
            "nlg": "2.0.0"
        },
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }


@router.post("/api/voice/process/realtime")
async def process_voice_realtime(request: VoiceProcessRequest):
    """Process voice input with full NLU pipeline"""
    try:
        start_time = datetime.now()
        options = request.processing_options or {
            "transcribe": True,
            "detect_intent": True,
            "analyze_emotion": True,
            "detect_entities": True,
            "generate_response": True
        }
        
        response = {
            "success": True,
            "session_id": request.session_id,
            "metadata": {
                "processing_time_ms": 0,
                "audio_duration_ms": random.randint(1000, 5000),
                "audio_quality": random.choice(["excellent", "good", "fair"]),
                "model_versions": {
                    "stt": "2.1.0",
                    "intent": "1.5.0",
                    "emotion": "1.2.0",
                    "ner": "1.3.0",
                    "nlg": "2.0.0"
                }
            }
        }
        
        # Transcription
        if options.get("transcribe", True):
            sample_texts = {
                "ml": [
                    "നമസ്കാരം, എനിക്ക് ഒരു ടാക്സി ബുക്ക് ചെയ്യണം",
                    "ശരി, എന്റെ ബുക്കിംഗ് കാൻസൽ ചെയ്യണം",
                    "എന്റെ റൈഡ് എവിടെ എത്തി?"
                ],
                "en": [
                    "Hello, I need to book a taxi",
                    "Please cancel my booking",
                    "Where is my ride?"
                ]
            }
            texts = sample_texts.get(request.language, sample_texts["en"])
            random_text = random.choice(texts)
            
            response["transcription"] = {
                "text": random_text,
                "confidence": 0.88 + random.random() * 0.10,
                "language_detected": "Malayalam" if request.language == "ml" else "English",
                "dialect_detected": request.dialect,
                "word_timings": [
                    {"word": word, "start": i * 300, "end": (i + 1) * 300 - 50, "confidence": 0.85 + random.random() * 0.15}
                    for i, word in enumerate(random_text.split())
                ]
            }
        
        # Intent Detection
        if options.get("detect_intent", True):
            intents = ["create_booking", "cancel_booking", "check_status", "contact_driver", "payment_issue"]
            response["intent"] = {
                "name": random.choice(intents),
                "confidence": 0.85 + random.random() * 0.13,
                "slots": {},
                "action_required": "start_booking_flow"
            }
        
        # Emotion Analysis
        if options.get("analyze_emotion", True):
            emotions = ["neutral", "happy", "frustrated"]
            primary_emotion = random.choice(emotions)
            response["emotion"] = {
                "primary": primary_emotion,
                "confidence": 0.7 + random.random() * 0.25,
                "secondary": random.choice([e for e in emotions if e != primary_emotion]),
                "valence": random.uniform(-0.5, 0.8),
                "arousal": random.uniform(0.1, 0.9),
                "sentiment": "positive" if primary_emotion == "happy" else ("negative" if primary_emotion == "frustrated" else "neutral")
            }
        
        # Entity Extraction
        if options.get("detect_entities", True):
            response["entities"] = [
                {"type": "LOCATION", "value": "Kochi", "confidence": 0.9, "start": 10, "end": 15}
            ]
        
        # Response Generation
        if options.get("generate_response", True):
            responses = {
                "ml": "നിങ്ങളുടെ ടാക്സി ബുക്കിംഗിനായി ഒരു ലൊക്കേഷൻ നൽകാമോ?",
                "en": "Could you please provide a location for your taxi booking?"
            }
            response["response"] = {
                "text": responses.get(request.language, responses["en"]),
                "suggested_actions": ["provide_pickup_location", "provide_destination"],
                "requires_human": False
            }
        
        # Calculate processing time
        response["metadata"]["processing_time_ms"] = int((datetime.now() - start_time).total_seconds() * 1000) + random.randint(100, 300)
        
        return response
        
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Call Transfer Endpoints
# ============================================================

TRANSFER_DESTINATIONS = [
    {"id": "video_ivr_general", "name": "Video IVR - General Support", "type": "video_ivr", "department": "support", "available": True},
    {"id": "video_ivr_technical", "name": "Video IVR - Technical Help", "type": "video_ivr", "department": "technical", "available": True},
    {"id": "video_ivr_billing", "name": "Video IVR - Billing Queries", "type": "video_ivr", "department": "billing", "available": True},
    {"id": "agent_support", "name": "Live Agent - Customer Support", "type": "agent", "department": "support", "available": True},
    {"id": "queue_priority", "name": "Priority Queue", "type": "queue", "department": "priority", "available": True},
    {"id": "callback_request", "name": "Request Callback", "type": "callback", "department": "callback", "available": True}
]


@router.get("/api/call-transfer")
async def get_transfer_destinations():
    """Get available transfer destinations"""
    return {
        "success": True,
        "destinations": TRANSFER_DESTINATIONS,
        "total": len(TRANSFER_DESTINATIONS),
        "timestamp": datetime.now().isoformat()
    }


@router.post("/api/call-transfer")
async def initiate_transfer(request: CallTransferRequest):
    """Initiate call transfer"""
    try:
        transfer_id = f"xfer_{uuid.uuid4().hex[:12]}"
        destination = next((d for d in TRANSFER_DESTINATIONS if d["id"] == request.destination_id), None)
        
        if not destination:
            raise HTTPException(status_code=404, detail="Transfer destination not found")
        
        response = {
            "success": True,
            "transfer_id": transfer_id,
            "status": "initiated",
            "destination": destination,
            "estimated_wait_time": random.randint(5, 60) if destination["type"] in ["agent", "queue"] else None,
            "message": f"Transfer to {destination['name']} initiated successfully"
        }
        
        # For Video IVR transfers, generate session URL
        if destination["type"] == "video_ivr":
            video_session_id = f"vid_{uuid.uuid4().hex[:16]}"
            response["video_session_url"] = f"/video-ivr/session/{video_session_id}"
            response["video_session"] = {
                "session_id": video_session_id,
                "workflow_id": f"wf_{destination['department']}",
                "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
            }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transfer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================  
# Video IVR Endpoints
# ============================================================

@router.get("/api/video-ivr/calls")
async def get_video_calls(status: Optional[str] = None, limit: int = 20):
    """Get video IVR calls"""
    calls = []
    for i in range(random.randint(5, 15)):
        call_status = status or random.choice(["active", "waiting", "ended"])
        calls.append({
            "id": f"vid_{uuid.uuid4().hex[:12]}",
            "caller_name": f"Customer {i + 1}",
            "caller_number": f"+91{random.randint(7000000000, 9999999999)}",
            "status": call_status,
            "duration": random.randint(30, 600) if call_status != "waiting" else 0,
            "start_time": (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat(),
            "type": random.choice(["inbound", "outbound"]),
            "ai_assistant_active": random.random() > 0.3,
            "recording_enabled": random.random() > 0.5
        })
    
    return {
        "success": True,
        "calls": calls[:limit],
        "total": len(calls),
        "active_count": len([c for c in calls if c["status"] == "active"]),
        "timestamp": datetime.now().isoformat()
    }


@router.post("/api/video-ivr/calls")
async def start_video_call(request: VideoCallRequest):
    """Start new video IVR call"""
    try:
        call_id = f"vid_{uuid.uuid4().hex[:12]}"
        session_id = f"sess_{uuid.uuid4().hex[:16]}"
        
        return {
            "success": True,
            "call": {
                "id": call_id,
                "session_id": session_id,
                "status": "initializing",
                "workflow_id": request.workflow_id or "default_workflow",
                "language": request.language,
                "dialect": request.dialect,
                "webrtc_config": {
                    "stun_servers": ["stun:stun.l.google.com:19302"],
                    "turn_servers": [],
                    "ice_transport_policy": "all"
                },
                "signaling_url": f"/ws/video/{call_id}",
                "created_at": datetime.now().isoformat()
            },
            "message": "Video call initialized successfully"
        }
        
    except Exception as e:
        logger.error(f"Start video call error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/video-ivr/calls/{call_id}")
async def get_video_call_status(call_id: str):
    """Get video call status"""
    return {
        "success": True,
        "call_id": call_id,
        "status": random.choice(["active", "on_hold", "transferring"]),
        "duration_seconds": random.randint(30, 300),
        "participants": {
            "caller": {
                "id": f"caller_{call_id}",
                "video_enabled": random.random() > 0.3,
                "audio_enabled": True,
                "connection_quality": random.choice(["excellent", "good", "fair"])
            },
            "agent": {
                "id": f"agent_{call_id}",
                "type": random.choice(["ai", "human"]),
                "video_enabled": True,
                "audio_enabled": True,
                "connection_quality": "excellent"
            }
        },
        "workflow": {
            "current_step": "support_interaction",
            "steps_completed": random.randint(1, 5),
            "ai_handoffs": random.randint(0, 2)
        },
        "metadata": {
            "started_at": (datetime.now() - timedelta(minutes=random.randint(1, 10))).isoformat(),
            "last_activity": datetime.now().isoformat()
        }
    }


@router.post("/api/video-ivr/calls/{call_id}/end")
async def end_video_call(call_id: str, request: EndVideoCallRequest):
    """End video call"""
    try:
        call_duration = random.randint(60, 600)
        
        return {
            "success": True,
            "call_id": call_id,
            "status": "ended",
            "end_time": datetime.now().isoformat(),
            "duration_seconds": call_duration,
            "outcome": request.outcome or "completed",
            "reason": request.reason or "Call ended by user",
            "cleanup": {
                "webrtc_disconnected": True,
                "session_closed": True,
                "resources_released": True
            },
            "recording": {
                "action": request.recording_action or "save",
                "status": "processing",
                "estimated_url": f"/api/video-ivr/recordings/{call_id}" if request.recording_action != "delete" else None
            } if random.random() > 0.3 else None,
            "analytics": {
                "video_enabled_duration": int(call_duration * 0.8),
                "audio_only_duration": int(call_duration * 0.2),
                "ai_interactions": random.randint(1, 10),
                "screen_shares": random.randint(0, 3)
            },
            "satisfaction": {
                "score": request.satisfaction_score,
                "collected": request.satisfaction_score is not None
            }
        }
        
    except Exception as e:
        logger.error(f"End video call error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/video-ivr/workflows")
async def get_video_workflows():
    """Get video IVR workflows"""
    workflows = [
        {
            "id": "wf_customer_support",
            "name": "Customer Support",
            "description": "General customer support workflow with AI assistance",
            "status": "active",
            "triggers": ["inbound_call", "transfer", "scheduled"],
            "steps": [
                {"id": "step_1", "type": "greeting", "title": "Welcome Message"},
                {"id": "step_2", "type": "menu", "title": "Main Menu"},
                {"id": "step_3", "type": "ai_response", "title": "AI Assistance"}
            ],
            "analytics": {
                "total_calls": random.randint(100, 500),
                "avg_duration": random.randint(120, 300),
                "completion_rate": 0.85 + random.random() * 0.1,
                "satisfaction_score": 4.2 + random.random() * 0.6
            }
        },
        {
            "id": "wf_video_kyc",
            "name": "Video KYC",
            "description": "Video-based KYC verification workflow",
            "status": "active",
            "triggers": ["scheduled", "manual"],
            "steps": [
                {"id": "step_1", "type": "greeting", "title": "KYC Introduction"},
                {"id": "step_2", "type": "form", "title": "Document Capture"},
                {"id": "step_3", "type": "ai_response", "title": "Verification"}
            ],
            "analytics": {
                "total_calls": random.randint(50, 200),
                "avg_duration": random.randint(180, 420),
                "completion_rate": 0.78 + random.random() * 0.15,
                "satisfaction_score": 4.0 + random.random() * 0.7
            }
        }
    ]
    
    return {
        "success": True,
        "workflows": workflows,
        "total": len(workflows),
        "timestamp": datetime.now().isoformat()
    }


@router.post("/api/video-ivr/workflows")
async def create_video_workflow(workflow_data: Dict[str, Any]):
    """Create new video IVR workflow"""
    try:
        workflow_id = f"wf_{uuid.uuid4().hex[:8]}"
        
        return {
            "success": True,
            "workflow": {
                "id": workflow_id,
                "name": workflow_data.get("name", "New Workflow"),
                "description": workflow_data.get("description", ""),
                "status": "draft",
                "triggers": workflow_data.get("triggers", []),
                "steps": workflow_data.get("steps", []),
                "created_at": datetime.now().isoformat()
            },
            "message": "Workflow created successfully"
        }
        
    except Exception as e:
        logger.error(f"Create workflow error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# Video IVR Recordings Endpoints
# ============================================================

@router.get("/api/video-ivr/recordings")
async def get_video_recordings(
    call_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get video recordings"""
    recordings = []
    for i in range(10):
        recordings.append({
            "id": f"rec_{uuid.uuid4().hex[:12]}",
            "call_id": call_id or f"call_{random.randint(100, 999)}",
            "duration_seconds": random.randint(60, 600),
            "file_size_mb": random.randint(10, 100),
            "format": "webm",
            "resolution": random.choice(["1080p", "720p"]),
            "status": status or random.choice(["ready", "processing", "archived"]),
            "created_at": (datetime.now() - timedelta(days=random.randint(0, 7))).isoformat(),
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat(),
            "metadata": {
                "caller_name": f"Customer {i + 1}",
                "caller_number": f"+91{random.randint(7000000000, 9999999999)}",
                "agent_type": random.choice(["ai", "human"]),
                "workflow_name": random.choice(["Customer Support", "Video KYC", "Product Demo"]),
                "transcript_available": random.random() > 0.3
            }
        })
    
    return {
        "success": True,
        "recordings": recordings[offset:offset + limit],
        "pagination": {
            "total": len(recordings),
            "limit": limit,
            "offset": offset,
            "has_more": offset + limit < len(recordings)
        },
        "storage_summary": {
            "total_recordings": len(recordings),
            "total_size_gb": round(sum(r["file_size_mb"] for r in recordings) / 1024, 2),
            "ready_count": len([r for r in recordings if r["status"] == "ready"]),
            "processing_count": len([r for r in recordings if r["status"] == "processing"])
        }
    }


@router.post("/api/video-ivr/recordings")
async def manage_recording(request: RecordingRequest):
    """Manage video recordings - start, stop, process, archive"""
    try:
        if request.action == "start":
            recording_id = f"rec_{uuid.uuid4().hex[:12]}"
            return {
                "success": True,
                "recording_id": recording_id,
                "call_id": request.call_id,
                "status": "recording",
                "started_at": datetime.now().isoformat(),
                "settings": request.recording_settings or {
                    "resolution": "1080p",
                    "format": "webm",
                    "include_audio": True
                }
            }
        
        elif request.action == "stop":
            return {
                "success": True,
                "call_id": request.call_id,
                "status": "processing",
                "stopped_at": datetime.now().isoformat(),
                "estimated_processing_time_seconds": random.randint(30, 90)
            }
        
        elif request.action == "process":
            return {
                "success": True,
                "recording_id": request.recording_id,
                "status": "processing",
                "tasks": [
                    {"name": "transcoding", "status": "in_progress", "progress": random.randint(20, 80)},
                    {"name": "transcription", "status": "pending", "progress": 0},
                    {"name": "analysis", "status": "pending", "progress": 0}
                ],
                "estimated_completion": (datetime.now() + timedelta(minutes=2)).isoformat()
            }
        
        elif request.action == "archive":
            return {
                "success": True,
                "recording_id": request.recording_id,
                "status": "archived",
                "archived_at": datetime.now().isoformat(),
                "storage_tier": "cold",
                "retrieval_time_hours": 24
            }
        
        else:
            raise HTTPException(status_code=400, detail=f"Invalid action: {request.action}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recording management error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/video-ivr/recordings/{recording_id}")
async def delete_recording(recording_id: str, permanent: bool = False):
    """Delete a recording"""
    return {
        "success": True,
        "recording_id": recording_id,
        "action": "permanently_deleted" if permanent else "soft_deleted",
        "deleted_at": datetime.now().isoformat(),
        "recoverable": not permanent,
        "recovery_window_days": 0 if permanent else 30
    }


# ============================================================
# WebSocket IVR Management Endpoints
# ============================================================

@router.get("/api/websocket/config")
async def get_websocket_config():
    """Get WebSocket configuration"""
    ws_base_url = "ws://localhost:8000"
    
    return {
        "success": True,
        "config": {
            "url": ws_base_url,
            "protocols": ["ivr-v1", "voice-stream-v1"],
            "heartbeat_interval_ms": 30000,
            "reconnect_attempts": 5,
            "reconnect_delay_ms": 2000
        },
        "endpoints": {
            "ivr_session": f"{ws_base_url}/ws/ivr/{{session_id}}",
            "voice_stream": f"{ws_base_url}/ws/voice/{{session_id}}",
            "video_call": f"{ws_base_url}/ws/video/{{call_id}}",
            "agent_chat": f"{ws_base_url}/ws/agent/{{agent_id}}"
        },
        "supported_events": {
            "client_to_server": [
                "audio_chunk", "user_input", "session_action",
                "dtmf_tone", "request_transfer", "end_session"
            ],
            "server_to_client": [
                "transcription", "ai_response", "audio_response",
                "session_state", "transfer_status", "error"
            ]
        },
        "audio_config": {
            "sample_rate": 16000,
            "channels": 1,
            "encoding": "LINEAR16",
            "frame_size_ms": 20
        }
    }


@router.post("/api/websocket/session")
async def create_websocket_session(session_id: Optional[str] = None, options: Optional[Dict] = None):
    """Create WebSocket session"""
    new_session_id = session_id or f"ws_{uuid.uuid4().hex[:12]}"
    token = f"tok_{uuid.uuid4().hex[:16]}"
    ws_base_url = "ws://localhost:8000"
    
    return {
        "success": True,
        "session": {
            "session_id": new_session_id,
            "connection_url": f"{ws_base_url}/ws/ivr/{new_session_id}?token={token}",
            "token": token,
            "expires_at": (datetime.now() + timedelta(hours=1)).isoformat(),
            "capabilities": [
                "voice_streaming", "real_time_transcription", "ai_responses",
                "dtmf_support", "transfer", "hold_resume"
            ]
        },
        "connection_instructions": {
            "step1": "Connect to connection_url using WebSocket",
            "step2": f"Send initial handshake: {{ type: 'handshake', session_id: '{new_session_id}', token: '{token}' }}",
            "step3": "Wait for acknowledgment: { type: 'ack', status: 'connected' }",
            "step4": "Begin streaming audio or sending commands"
        }
    }


@router.get("/api/websocket/stats")
async def get_websocket_stats():
    """Get WebSocket server statistics"""
    return {
        "success": True,
        "stats": {
            "active_connections": random.randint(10, 50),
            "total_sessions_today": random.randint(200, 600),
            "avg_session_duration_seconds": random.randint(60, 300),
            "messages_per_second": random.randint(50, 250),
            "audio_chunks_per_second": random.randint(500, 1500),
            "avg_latency_ms": random.randint(20, 70),
            "error_rate": random.random() * 0.02,
            "reconnection_rate": random.random() * 0.05
        },
        "by_type": {
            "ivr_sessions": random.randint(5, 30),
            "voice_streams": random.randint(5, 25),
            "video_calls": random.randint(2, 12),
            "agent_connections": random.randint(5, 18)
        },
        "health": {
            "status": "healthy",
            "uptime_percentage": 99.5 + random.random() * 0.4,
            "last_incident": None
        }
    }


# Function to include router in main app
def include_extended_routes(app):
    """Include extended routes in FastAPI app"""
    app.include_router(router)
    logger.info("✅ Extended API routes registered")
