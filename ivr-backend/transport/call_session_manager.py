"""
Unified Transport Abstraction Layer - Master Call Session Manager

This module provides a transport-agnostic call session management system
that normalizes all incoming connections into a standardized format.
"""

import logging
import uuid
from datetime import datetime
from typing import Dict, Optional, Any, Protocol
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


class TransportType(Enum):
    """Supported transport types"""
    TWILIO = "twilio"
    EXOTEL = "exotel"
    WEBRTC = "webrtc"
    FREESWITCH = "freeswitch"


class CallStatus(Enum):
    """Call session status"""
    INITIALIZING = "initializing"
    CONNECTED = "connected"
    ACTIVE = "active"
    HOLD = "hold"
    TRANSFERRED = "transferred"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


@dataclass
class TransportMetadata:
    """Metadata about the transport connection"""
    transport_type: TransportType
    provider_id: str
    connection_id: str
    raw_data: Dict[str, Any] = field(default_factory=dict)
    headers: Dict[str, str] = field(default_factory=dict)


@dataclass
class CallSession:
    """Unified call session representation"""
    session_id: str
    phone_number: str
    direction: str = "inbound"  # inbound/outbound
    status: CallStatus = CallStatus.INITIALIZING
    language: str = "en"
    dialect: str = "standard"
    transport_metadata: TransportMetadata = None

    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    connected_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Call data
    transcript_count: int = 0
    last_intent: Optional[str] = None
    last_activity: Optional[datetime] = None

    # Transport-specific data
    transport_data: Dict[str, Any] = field(default_factory=dict)

    # AI processing data
    ai_context: Dict[str, Any] = field(default_factory=dict)


class TransportConnector(Protocol):
    """Protocol for transport connectors"""

    @property
    def transport_type(self) -> TransportType:
        """Return the transport type this connector handles"""
        ...

    async def validate_request(self, request_data: Dict[str, Any]) -> bool:
        """Validate incoming request data"""
        ...

    async def extract_call_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract call data from transport-specific format"""
        ...

    async def send_response(self, session: CallSession, response_data: Dict[str, Any]) -> bool:
        """Send response back through the transport"""
        ...

    async def end_call(self, session: CallSession) -> bool:
        """End the call through the transport"""
        ...


class CallSessionManager:
    """Master call session manager - transport-agnostic"""

    def __init__(self):
        self.active_sessions: Dict[str, CallSession] = {}
        self.transport_connectors: Dict[TransportType, TransportConnector] = {}

    def register_connector(self, connector: TransportConnector):
        """Register a transport connector"""
        self.transport_connectors[connector.transport_type] = connector
        logger.info(f"Registered {connector.transport_type.value} connector")

    async def create_session(self,
                           phone_number: str,
                           transport_metadata: TransportMetadata,
                           language: str = "en",
                           dialect: str = "standard") -> CallSession:
        """Create a new unified call session"""
        session_id = str(uuid.uuid4())

        session = CallSession(
            session_id=session_id,
            phone_number=phone_number,
            language=language,
            dialect=dialect,
            transport_metadata=transport_metadata,
            status=CallStatus.INITIALIZING
        )

        self.active_sessions[session_id] = session
        logger.info(f"Created session {session_id} for {phone_number} via {transport_metadata.transport_type.value}")

        return session

    async def get_session(self, session_id: str) -> Optional[CallSession]:
        """Get a call session by ID"""
        return self.active_sessions.get(session_id)

    async def update_session_status(self, session_id: str, status: CallStatus):
        """Update session status"""
        session = self.active_sessions.get(session_id)
        if session:
            session.status = status
            session.last_activity = datetime.now()

            if status == CallStatus.CONNECTED and not session.connected_at:
                session.connected_at = datetime.now()
            elif status in [CallStatus.COMPLETED, CallStatus.FAILED, CallStatus.TIMEOUT]:
                session.completed_at = datetime.now()

            logger.info(f"Session {session_id} status updated to {status.value}")

    async def end_session(self, session_id: str):
        """End a call session"""
        session = self.active_sessions.get(session_id)
        if session:
            session.status = CallStatus.COMPLETED
            session.completed_at = datetime.now()

            # Notify transport connector to clean up
            connector = self.transport_connectors.get(session.transport_metadata.transport_type)
            if connector:
                await connector.end_call(session)

            logger.info(f"Ended session {session_id}")

    async def get_active_sessions(self) -> Dict[str, CallSession]:
        """Get all active sessions"""
        return {
            sid: session for sid, session in self.active_sessions.items()
            if session.status not in [CallStatus.COMPLETED, CallStatus.FAILED, CallStatus.TIMEOUT]
        }

    async def cleanup_expired_sessions(self, max_age_minutes: int = 30):
        """Clean up expired sessions"""
        now = datetime.now()
        expired_sessions = []

        for session_id, session in self.active_sessions.items():
            if session.last_activity:
                age_minutes = (now - session.last_activity).total_seconds() / 60
                if age_minutes > max_age_minutes:
                    expired_sessions.append(session_id)

        for session_id in expired_sessions:
            await self.end_session(session_id)
            del self.active_sessions[session_id]

    async def get_session_by_connection_id(self, connection_id: str) -> Optional[CallSession]:
        """Get a call session by transport connection ID"""
        for session in self.active_sessions.values():
            if session.transport_metadata.connection_id == connection_id:
                return session
        return None

    async def end_session_by_connection_id(self, connection_id: str):
        """End a call session by transport connection ID"""
        session = await self.get_session_by_connection_id(connection_id)
        if session:
            await self.end_session(session.session_id)