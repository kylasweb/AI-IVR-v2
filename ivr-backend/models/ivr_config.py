from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
import uuid

@dataclass
class IVRConfig:
    """IVR Configuration for different flows"""
    
    id: str
    name: str
    description: str
    language: str = "en"
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    # Flow configuration
    welcome_message: str = ""
    main_menu_options: List[Dict[str, Any]] = field(default_factory=list)
    timeout_message: str = ""
    max_attempts: int = 3
    timeout_seconds: int = 10
    
    # Voice settings
    voice_gender: str = "female"
    voice_speed: float = 1.0
    voice_volume: float = 0.9
    
    # Transfer settings
    transfer_numbers: Dict[str, str] = field(default_factory=dict)
    transfer_enabled: bool = True
    
    # Business hours
    business_hours: Dict[str, Any] = field(default_factory=dict)
    after_hours_message: str = ""
    
    # Advanced settings
    enable_sentiment_analysis: bool = False
    enable_recording: bool = True
    enable_transcription: bool = True
    confidence_threshold: float = 0.7
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "language": self.language,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "welcome_message": self.welcome_message,
            "main_menu_options": self.main_menu_options,
            "timeout_message": self.timeout_message,
            "max_attempts": self.max_attempts,
            "timeout_seconds": self.timeout_seconds,
            "voice_gender": self.voice_gender,
            "voice_speed": self.voice_speed,
            "voice_volume": self.voice_volume,
            "transfer_numbers": self.transfer_numbers,
            "transfer_enabled": self.transfer_enabled,
            "business_hours": self.business_hours,
            "after_hours_message": self.after_hours_message,
            "enable_sentiment_analysis": self.enable_sentiment_analysis,
            "enable_recording": self.enable_recording,
            "enable_transcription": self.enable_transcription,
            "confidence_threshold": self.confidence_threshold
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'IVRConfig':
        """Create from dictionary"""
        # Convert string dates back to datetime objects
        if isinstance(data.get("created_at"), str):
            data["created_at"] = datetime.fromisoformat(data["created_at"])
        if isinstance(data.get("updated_at"), str):
            data["updated_at"] = datetime.fromisoformat(data["updated_at"])
        
        return cls(**data)
    
    def update(self, **kwargs):
        """Update configuration"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.now()
    
    def is_business_hours(self) -> bool:
        """Check if current time is within business hours"""
        if not self.business_hours:
            return True
        
        now = datetime.now()
        day_of_week = now.strftime("%A").lower()
        
        if day_of_week not in self.business_hours:
            return False
        
        hours = self.business_hours[day_of_week]
        if not hours.get("open", False):
            return False
        
        current_time = now.time()
        open_time = datetime.strptime(hours["open"], "%H:%M").time()
        close_time = datetime.strptime(hours["close"], "%H:%M").time()
        
        return open_time <= current_time <= close_time
    
    def get_transfer_number(self, department: str) -> Optional[str]:
        """Get transfer number for department"""
        return self.transfer_numbers.get(department)
    
    def add_menu_option(self, option: Dict[str, Any]):
        """Add main menu option"""
        required_keys = ["key", "description", "action"]
        if all(key in option for key in required_keys):
            self.main_menu_options.append(option)
            self.updated_at = datetime.now()
    
    def remove_menu_option(self, key: str) -> bool:
        """Remove main menu option by key"""
        for i, option in enumerate(self.main_menu_options):
            if option.get("key") == key:
                del self.main_menu_options[i]
                self.updated_at = datetime.now()
                return True
        return False
    
    def validate(self) -> List[str]:
        """Validate configuration and return list of errors"""
        errors = []
        
        if not self.name:
            errors.append("Name is required")
        
        if not self.welcome_message:
            errors.append("Welcome message is required")
        
        if not self.main_menu_options:
            errors.append("At least one menu option is required")
        
        if self.max_attempts < 1:
            errors.append("Max attempts must be at least 1")
        
        if self.timeout_seconds < 1:
            errors.append("Timeout seconds must be at least 1")
        
        if not 0.0 <= self.voice_speed <= 2.0:
            errors.append("Voice speed must be between 0.0 and 2.0")
        
        if not 0.0 <= self.voice_volume <= 1.0:
            errors.append("Voice volume must be between 0.0 and 1.0")
        
        if not 0.0 <= self.confidence_threshold <= 1.0:
            errors.append("Confidence threshold must be between 0.0 and 1.0")
        
        return errors

# Default IVR configurations
DEFAULT_CONFIGS = {
    "customer_service": IVRConfig(
        id="customer_service_default",
        name="Customer Service IVR",
        description="Standard customer service IVR flow",
        welcome_message="Thank you for calling. How can I help you today?",
        main_menu_options=[
            {"key": "1", "description": "Billing inquiries", "action": "billing"},
            {"key": "2", "description": "Technical support", "action": "technical_support"},
            {"key": "3", "description": "Schedule appointment", "action": "appointment"},
            {"key": "0", "description": "Speak with agent", "action": "transfer"}
        ],
        timeout_message="I'm sorry, I didn't understand. Please choose from the available options.",
        transfer_numbers={
            "billing": "+1234567890",
            "technical": "+1234567891",
            "general": "+1234567892"
        },
        business_hours={
            "monday": {"open": "09:00", "close": "17:00"},
            "tuesday": {"open": "09:00", "close": "17:00"},
            "wednesday": {"open": "09:00", "close": "17:00"},
            "thursday": {"open": "09:00", "close": "17:00"},
            "friday": {"open": "09:00", "close": "17:00"},
            "saturday": {"open": False},
            "sunday": {"open": False}
        },
        after_hours_message="Our business hours are Monday through Friday, 9 AM to 5 PM. Please call back during business hours or leave a message."
    ),
    "appointment_booking": IVRConfig(
        id="appointment_booking_default",
        name="Appointment Booking IVR",
        description="IVR for scheduling appointments",
        welcome_message="Welcome to our appointment scheduling service. How can I help you?",
        main_menu_options=[
            {"key": "1", "description": "Book new appointment", "action": "book_appointment"},
            {"key": "2", "description": "Reschedule existing", "action": "reschedule"},
            {"key": "3", "description": "Cancel appointment", "action": "cancel"},
            {"key": "0", "description": "Speak with scheduler", "action": "transfer"}
        ],
        timeout_message="I can help you book, reschedule, or cancel appointments. What would you like to do?",
        transfer_numbers={
            "scheduler": "+1234567893"
        }
    )
}