from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid

@dataclass
class CallSession:
    """Represents a single call session"""
    
    session_id: str
    phone_number: str
    language: str = "en"
    ivr_flow_id: Optional[str] = None
    status: str = "initialized"
    start_time: datetime = field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    
    # Conversation tracking
    transcript: List[Dict[str, Any]] = field(default_factory=list)
    current_flow: str = "main_menu"
    attempts: int = 0
    last_intent: Optional[str] = None
    pending_action: Optional[str] = None
    
    # Call metadata
    caller_id: Optional[str] = None
    campaign_id: Optional[str] = None
    agent_id: Optional[str] = None
    queue_time: Optional[float] = None
    handle_time: Optional[float] = None
    
    # Quality metrics
    sentiment_score: Optional[float] = None
    satisfaction_score: Optional[int] = None
    resolution_status: str = "pending"
    
    def add_transcript(self, user_input: str, agent_response: str, 
                      intent: Optional[str] = None, confidence: Optional[float] = None):
        """Add transcript entry"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "user_input": user_input,
            "agent_response": agent_response,
            "intent": intent,
            "confidence": confidence
        }
        self.transcript.append(entry)
    
    def get_duration(self) -> Optional[float]:
        """Get call duration in seconds"""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (datetime.now() - self.start_time).total_seconds()
    
    def get_transcript_text(self) -> str:
        """Get formatted transcript"""
        if not self.transcript:
            return ""
        
        lines = []
        for entry in self.transcript:
            lines.append(f"User: {entry['user_input']}")
            lines.append(f"Agent: {entry['agent_response']}")
            lines.append("")
        
        return "\n".join(lines)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get session summary"""
        return {
            "session_id": self.session_id,
            "phone_number": self.phone_number,
            "language": self.language,
            "status": self.status,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration": self.get_duration(),
            "transcript_count": len(self.transcript),
            "current_flow": self.current_flow,
            "resolution_status": self.resolution_status,
            "sentiment_score": self.sentiment_score,
            "satisfaction_score": self.satisfaction_score
        }
    
    def end_session(self, resolution_status: str = "completed", 
                   satisfaction_score: Optional[int] = None):
        """End the call session"""
        self.end_time = datetime.now()
        self.status = "completed"
        self.resolution_status = resolution_status
        self.satisfaction_score = satisfaction_score
    
    def set_sentiment(self, score: float):
        """Set sentiment score (-1 to 1)"""
        self.sentiment_score = max(-1.0, min(1.0, score))
    
    def is_active(self) -> bool:
        """Check if session is active"""
        return self.status in ["initialized", "active"]
    
    def needs_transfer(self) -> bool:
        """Check if session needs human transfer"""
        return self.status == "needs_transfer" or self.pending_action == "transfer"
    
    def get_intent_distribution(self) -> Dict[str, int]:
        """Get distribution of intents in the session"""
        intent_counts = {}
        for entry in self.transcript:
            intent = entry.get("intent", "unknown")
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
        return intent_counts
    
    def get_confidence_average(self) -> Optional[float]:
        """Get average confidence score"""
        confidences = [entry.get("confidence", 0) for entry in self.transcript 
                      if entry.get("confidence") is not None]
        return sum(confidences) / len(confidences) if confidences else None