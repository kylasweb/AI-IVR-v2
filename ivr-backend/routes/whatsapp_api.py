"""
WhatsApp Business API Routes for FastAPI Backend
Provides messaging, templates, and automation support
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import random
import uuid
import logging
import httpx

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


# ============================================================
# Pydantic Models
# ============================================================

class TextMessageRequest(BaseModel):
    to: str
    text: str
    preview_url: bool = False


class TemplateMessageRequest(BaseModel):
    to: str
    template_name: str
    language: str = "en"
    components: Optional[List[Dict]] = None


class InteractiveMessageRequest(BaseModel):
    to: str
    interactive_type: str  # 'button', 'list', 'product', 'product_list'
    body: str
    header: Optional[Dict] = None
    footer: Optional[str] = None
    buttons: Optional[List[Dict]] = None
    sections: Optional[List[Dict]] = None


class MediaMessageRequest(BaseModel):
    to: str
    media_type: str  # 'image', 'video', 'audio', 'document'
    media_url: str
    caption: Optional[str] = None


class BroadcastRequest(BaseModel):
    recipients: List[str]
    message_type: str = "text"
    content: Dict[str, Any]


# ============================================================
# Mock Data
# ============================================================

TEMPLATES = [
    {
        "id": "template_1",
        "name": "appointment_reminder",
        "language": "en",
        "status": "approved",
        "category": "UTILITY",
        "content": "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}.",
        "variables": ["customer_name", "date", "time"]
    },
    {
        "id": "template_2",
        "name": "booking_confirmation_ml",
        "language": "ml",
        "status": "approved",
        "category": "UTILITY",
        "content": "നന്ദി {{1}}! നിങ്ങളുടെ ബുക്കിംഗ് സ്ഥിരീകരിച്ചു. ID: {{2}}",
        "variables": ["customer_name", "booking_id"]
    },
    {
        "id": "template_3",
        "name": "payment_receipt",
        "language": "en",
        "status": "approved",
        "category": "TRANSACTIONAL",
        "content": "Payment received! Amount: ₹{{1}}. Transaction ID: {{2}}.",
        "variables": ["amount", "transaction_id"]
    },
    {
        "id": "template_4",
        "name": "otp_verification",
        "language": "en",
        "status": "approved",
        "category": "AUTHENTICATION",
        "content": "Your OTP is {{1}}. Valid for 10 minutes.",
        "variables": ["otp_code"]
    }
]

# In-memory conversation storage (use Redis/DB in production)
conversations: Dict[str, List[Dict]] = {}


# ============================================================
# Helper Functions
# ============================================================

def generate_message_id() -> str:
    return f"wamid_{uuid.uuid4().hex[:16]}"


def store_message(phone: str, message: Dict):
    if phone not in conversations:
        conversations[phone] = []
    conversations[phone].append(message)


async def trigger_automation(event_type: str, data: Dict):
    """Trigger task automation based on WhatsApp events"""
    logger.info(f"WhatsApp automation trigger: {event_type} - {data}")
    # In production, this would query task database and execute matching automations


# ============================================================
# Endpoints
# ============================================================

@router.get("/config")
async def get_whatsapp_config():
    """Get WhatsApp Business API configuration and status"""
    return {
        "success": True,
        "config": {
            "business_account_id": "WABA_123456789",
            "phone_number_id": "PN_987654321",
            "display_phone": "+91 98765 43210",
            "business_name": "FairGo IVR",
            "status": "connected",
            "webhook_url": "/api/whatsapp/webhook"
        },
        "features": {
            "templates": True,
            "interactive": True,
            "media": True,
            "catalog": True,
            "broadcast": True
        },
        "rate_limits": {
            "messages_per_second": 80,
            "messages_per_day": 100000,
            "templates_per_day": 250000
        },
        "health": {
            "api_status": "healthy",
            "last_message_sent": datetime.now().isoformat(),
            "pending_queue": random.randint(0, 10)
        }
    }


@router.get("/templates")
async def get_templates(
    category: Optional[str] = None,
    language: Optional[str] = None,
    status: Optional[str] = None
):
    """Get available WhatsApp message templates"""
    templates = TEMPLATES.copy()
    
    if category:
        templates = [t for t in templates if t["category"] == category]
    if language:
        templates = [t for t in templates if t["language"] == language]
    if status:
        templates = [t for t in templates if t["status"] == status]
    
    return {
        "success": True,
        "templates": templates,
        "total": len(templates)
    }


@router.get("/conversation/{phone}")
async def get_conversation(phone: str, limit: int = 50):
    """Get conversation history for a phone number"""
    history = conversations.get(phone, [])
    return {
        "success": True,
        "phone": phone,
        "messages": history[-limit:],
        "total": len(history)
    }


@router.post("/send/text")
async def send_text_message(request: TextMessageRequest, background_tasks: BackgroundTasks):
    """Send a text message via WhatsApp"""
    message_id = generate_message_id()
    
    message = {
        "id": message_id,
        "type": "text",
        "direction": "outbound",
        "text": {"body": request.text},
        "timestamp": datetime.now().isoformat(),
        "status": "sent"
    }
    
    store_message(request.to, message)
    
    # Trigger automation in background
    background_tasks.add_task(trigger_automation, "whatsapp_message_sent", {
        "message_id": message_id,
        "to": request.to,
        "type": "text"
    })
    
    return {
        "success": True,
        "message_id": message_id,
        "to": request.to,
        "type": "text",
        "status": "sent",
        "timestamp": datetime.now().isoformat()
    }


@router.post("/send/template")
async def send_template_message(request: TemplateMessageRequest, background_tasks: BackgroundTasks):
    """Send a template message via WhatsApp"""
    template = next((t for t in TEMPLATES if t["name"] == request.template_name), None)
    
    if not template:
        raise HTTPException(status_code=404, detail=f"Template '{request.template_name}' not found")
    
    message_id = generate_message_id()
    
    message = {
        "id": message_id,
        "type": "template",
        "direction": "outbound",
        "template": {
            "name": request.template_name,
            "language": request.language,
            "components": request.components
        },
        "timestamp": datetime.now().isoformat(),
        "status": "sent"
    }
    
    store_message(request.to, message)
    
    background_tasks.add_task(trigger_automation, "whatsapp_template_sent", {
        "message_id": message_id,
        "to": request.to,
        "template": request.template_name
    })
    
    return {
        "success": True,
        "message_id": message_id,
        "to": request.to,
        "type": "template",
        "template": {
            "name": request.template_name,
            "language": request.language,
            "status": template["status"]
        },
        "status": "sent",
        "timestamp": datetime.now().isoformat()
    }


@router.post("/send/interactive")
async def send_interactive_message(request: InteractiveMessageRequest, background_tasks: BackgroundTasks):
    """Send an interactive message (buttons or list menu)"""
    message_id = generate_message_id()
    
    interactive = {
        "type": request.interactive_type,
        "body": {"text": request.body}
    }
    
    if request.header:
        interactive["header"] = request.header
    if request.footer:
        interactive["footer"] = {"text": request.footer}
    
    if request.interactive_type == "button" and request.buttons:
        interactive["action"] = {
            "buttons": [
                {"type": "reply", "reply": {"id": f"btn_{i}", "title": b.get("title", str(b))}}
                for i, b in enumerate(request.buttons)
            ]
        }
    elif request.interactive_type == "list" and request.sections:
        interactive["action"] = {"sections": request.sections}
    
    message = {
        "id": message_id,
        "type": "interactive",
        "direction": "outbound",
        "interactive": interactive,
        "timestamp": datetime.now().isoformat(),
        "status": "sent"
    }
    
    store_message(request.to, message)
    
    background_tasks.add_task(trigger_automation, "whatsapp_interactive_sent", {
        "message_id": message_id,
        "to": request.to,
        "interactive_type": request.interactive_type
    })
    
    return {
        "success": True,
        "message_id": message_id,
        "to": request.to,
        "type": "interactive",
        "interactive_type": request.interactive_type,
        "status": "sent",
        "timestamp": datetime.now().isoformat()
    }


@router.post("/send/media")
async def send_media_message(request: MediaMessageRequest, background_tasks: BackgroundTasks):
    """Send a media message (image, video, audio, document)"""
    message_id = generate_message_id()
    
    message = {
        "id": message_id,
        "type": request.media_type,
        "direction": "outbound",
        request.media_type: {
            "link": request.media_url,
            "caption": request.caption
        },
        "timestamp": datetime.now().isoformat(),
        "status": "sent"
    }
    
    store_message(request.to, message)
    
    background_tasks.add_task(trigger_automation, "whatsapp_media_sent", {
        "message_id": message_id,
        "to": request.to,
        "media_type": request.media_type
    })
    
    return {
        "success": True,
        "message_id": message_id,
        "to": request.to,
        "type": request.media_type,
        "media_url": request.media_url,
        "status": "sent",
        "timestamp": datetime.now().isoformat()
    }


@router.post("/broadcast")
async def broadcast_message(request: BroadcastRequest, background_tasks: BackgroundTasks):
    """Send a message to multiple recipients"""
    if not request.recipients:
        raise HTTPException(status_code=400, detail="No recipients provided")
    
    broadcast_id = f"bc_{uuid.uuid4().hex[:12]}"
    results = []
    
    for phone in request.recipients:
        message_id = generate_message_id()
        success = random.random() > 0.05  # 95% success rate
        
        message = {
            "id": message_id,
            "type": request.message_type,
            "direction": "outbound",
            "content": request.content,
            "broadcast_id": broadcast_id,
            "timestamp": datetime.now().isoformat(),
            "status": "sent" if success else "failed"
        }
        
        store_message(phone, message)
        results.append({
            "phone": phone,
            "message_id": message_id,
            "status": "sent" if success else "failed"
        })
    
    successful = len([r for r in results if r["status"] == "sent"])
    failed = len([r for r in results if r["status"] == "failed"])
    
    background_tasks.add_task(trigger_automation, "whatsapp_broadcast_complete", {
        "broadcast_id": broadcast_id,
        "total": len(request.recipients),
        "successful": successful,
        "failed": failed
    })
    
    return {
        "success": True,
        "broadcast_id": broadcast_id,
        "total_recipients": len(request.recipients),
        "successful": successful,
        "failed": failed,
        "results": results,
        "timestamp": datetime.now().isoformat()
    }


@router.post("/webhook")
async def handle_webhook(payload: Dict[str, Any], background_tasks: BackgroundTasks):
    """Handle incoming WhatsApp webhook events"""
    try:
        entry = payload.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        
        events_processed = 0
        
        # Process incoming messages
        for message in value.get("messages", []):
            event_type = "whatsapp_message_received"
            
            # Determine specific event type
            if message.get("type") == "interactive":
                interactive = message.get("interactive", {})
                if interactive.get("type") == "button_reply":
                    event_type = "whatsapp_button_click"
                elif interactive.get("type") == "list_reply":
                    event_type = "whatsapp_list_selection"
            elif message.get("type") in ["image", "video", "audio", "document"]:
                event_type = "whatsapp_media_received"
            
            # Store incoming message
            store_message(message.get("from"), {
                "id": message.get("id"),
                "type": message.get("type"),
                "direction": "inbound",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Trigger automation
            background_tasks.add_task(trigger_automation, event_type, {
                "message_id": message.get("id"),
                "from": message.get("from"),
                "type": message.get("type"),
                "content": message
            })
            
            events_processed += 1
        
        # Process status updates
        for status in value.get("statuses", []):
            background_tasks.add_task(trigger_automation, "whatsapp_status_update", {
                "message_id": status.get("id"),
                "recipient": status.get("recipient_id"),
                "status": status.get("status")
            })
            events_processed += 1
        
        return {
            "success": True,
            "events_processed": events_processed
        }
        
    except Exception as e:
        logger.error(f"Webhook processing error: {e}")
        return {"success": False, "error": str(e)}


# Function to include router in main app
def include_whatsapp_routes(app):
    """Include WhatsApp routes in FastAPI app"""
    app.include_router(router)
    logger.info("✅ WhatsApp API routes registered")
