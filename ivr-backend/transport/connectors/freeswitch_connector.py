"""
FreeSWITCH Transport Connector

Handles SIP trunk connections through FreeSWITCH for the IMOS Communications Engine,
providing enterprise-grade telephony capabilities.
"""

import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime

from ..call_session_manager import TransportConnector, TransportType, TransportMetadata, CallSession

logger = logging.getLogger(__name__)


class FreeSWITCHConnector(TransportConnector):
    """FreeSWITCH transport connector for SIP trunk calls"""

    def __init__(self):
        self.active_channels: Dict[str, Dict[str, Any]] = {}

    @property
    def transport_type(self) -> TransportType:
        return TransportType.FREESWITCH

    async def validate_request(self, request_data: Dict[str, Any]) -> bool:
        """Validate FreeSWITCH ESL event"""
        try:
            # FreeSWITCH ESL events have specific structure
            required_fields = ['Event-Name', 'Channel-State', 'Unique-ID']

            # Check if all required fields are present
            for field in required_fields:
                if field not in request_data:
                    logger.warning(f"Missing required field: {field}")
                    return False

            # Validate event type
            event_name = request_data.get('Event-Name', '')
            valid_events = ['CHANNEL_CREATE', 'CHANNEL_ANSWER', 'CHANNEL_HANGUP', 'DTMF']
            if event_name not in valid_events:
                logger.warning(f"Unsupported event type: {event_name}")
                return False

            return True

        except Exception as e:
            logger.error(f"Error validating FreeSWITCH request: {e}")
            return False

    async def extract_call_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract call data from FreeSWITCH ESL event"""
        try:
            # FreeSWITCH ESL event data structure
            unique_id = request_data.get('Unique-ID', '')
            event_name = request_data.get('Event-Name', '')

            call_data = {
                'session_id': unique_id,
                'phone_number': request_data.get('Caller-Caller-ID-Number', ''),
                'direction': self._get_direction(request_data),
                'status': self._map_freeswitch_status(request_data.get('Channel-State', 'unknown'), event_name),
                'language': self._detect_language(request_data),
                'dialect': self._detect_dialect(request_data),
                'transport_metadata': {
                    'transport_type': TransportType.FREESWITCH,
                    'provider_id': 'freeswitch',
                    'connection_id': unique_id,
                    'raw_data': request_data,
                    'headers': {}  # Will be filled by caller
                }
            }

            # Add FreeSWITCH-specific data
            call_data['transport_data'] = {
                'unique_id': unique_id,
                'channel_state': request_data.get('Channel-State'),
                'event_name': event_name,
                'caller_id_number': request_data.get('Caller-Caller-ID-Number'),
                'caller_id_name': request_data.get('Caller-Caller-ID-Name'),
                'destination_number': request_data.get('Caller-Destination-Number'),
                'context': request_data.get('Caller-Context'),
                'dialplan': request_data.get('Caller-Dialplan'),
                'dtmf_digit': request_data.get('DTMF-Digit'),  # For DTMF events
                'answer_state': request_data.get('Answer-State'),
                'hangup_cause': request_data.get('Hangup-Cause'),
                'sip_call_id': request_data.get('variable_sip_call_id'),
                'sip_from_user': request_data.get('variable_sip_from_user'),
                'sip_to_user': request_data.get('variable_sip_to_user')
            }

            # Store channel information for tracking
            self.active_channels[unique_id] = call_data['transport_data']

            return call_data

        except Exception as e:
            logger.error(f"Error extracting FreeSWITCH call data: {e}")
            raise

    async def send_response(self, session: CallSession, response_data: Dict[str, Any]) -> bool:
        """Send response back through FreeSWITCH"""
        try:
            response_type = response_data.get('type', 'text')

            if response_type == 'text':
                # Send text response (will be converted to speech via TTS)
                text = response_data.get('text', '')
                logger.info(f"Sending text response to FreeSWITCH: {text[:50]}...")

            elif response_type == 'audio':
                # Send audio file to play
                audio_url = response_data.get('audio_url', '')
                logger.info(f"Sending audio playback to FreeSWITCH: {audio_url}")

            elif response_type == 'dtmf':
                # Send DTMF tones
                digits = response_data.get('digits', '')
                logger.info(f"Sending DTMF tones to FreeSWITCH: {digits}")

            elif response_type == 'hangup':
                # End the call
                logger.info("Sending hangup command to FreeSWITCH")
                return await self.end_call(session)

            # In a real implementation, this would send ESL commands to FreeSWITCH
            # For now, we just log the action
            return True

        except Exception as e:
            logger.error(f"Error sending response via FreeSWITCH: {e}")
            return False

    async def end_call(self, session: CallSession) -> bool:
        """End the call through FreeSWITCH"""
        try:
            session_id = session.session_id

            # Clean up channel data
            if session_id in self.active_channels:
                del self.active_channels[session_id]

            logger.info(f"Ending FreeSWITCH call for session {session_id}")

            # In a real implementation, this would send a hangup command via ESL
            return True

        except Exception as e:
            logger.error(f"Error ending FreeSWITCH call: {e}")
            return False

    def _get_direction(self, request_data: Dict[str, Any]) -> str:
        """Determine call direction from FreeSWITCH data"""
        # FreeSWITCH direction can be determined from context or other variables
        context = request_data.get('Caller-Context', '')
        if 'inbound' in context.lower():
            return 'inbound'
        elif 'outbound' in context.lower():
            return 'outbound'
        else:
            # Default to inbound for most IVR scenarios
            return 'inbound'

    def _map_freeswitch_status(self, channel_state: str, event_name: str) -> str:
        """Map FreeSWITCH status to our internal status"""
        # Map based on channel state and event
        if event_name == 'CHANNEL_CREATE':
            return 'initializing'
        elif event_name == 'CHANNEL_ANSWER':
            return 'connected'
        elif event_name == 'CHANNEL_HANGUP':
            return 'completed'
        elif channel_state == 'CS_EXECUTE':
            return 'connected'
        elif channel_state == 'CS_HANGUP':
            return 'completed'
        else:
            return 'unknown'

    def _detect_language(self, request_data: Dict[str, Any]) -> str:
        """Detect language from FreeSWITCH data"""
        # Check for language variables set in FreeSWITCH
        language = request_data.get('variable_language', '')

        if language:
            return language.lower()

        # Fallback to number-based detection
        destination = request_data.get('Caller-Destination-Number', '')

        # Simple mapping based on number patterns
        if destination.startswith('044'):  # Chennai
            return 'ta'  # Tamil
        elif destination.startswith('080'):  # Bangalore
            return 'kn'  # Kannada
        elif destination.startswith('040'):  # Hyderabad
            return 'te'  # Telugu
        elif destination.startswith('011'):  # Delhi
            return 'hi'  # Hindi
        else:
            # Default to Malayalam for Kerala numbers
            return 'ml'

    def _detect_dialect(self, request_data: Dict[str, Any]) -> str:
        """Detect dialect from FreeSWITCH data"""
        # Check for dialect variables
        dialect = request_data.get('variable_dialect', '')

        if dialect:
            return dialect.lower()

        # Fallback to region-based detection
        destination = request_data.get('Caller-Destination-Number', '')

        # Kerala STD codes
        kerala_codes = ['0471', '0470', '0474', '0478', '0479', '0484', '0487', '0495', '0497']

        for code in kerala_codes:
            if destination.startswith(code):
                if code in ['0471', '0470']:  # Trivandrum region
                    return 'travancore'
                elif code in ['0495', '0497']:  # Kozhikode region
                    return 'malabar'
                elif code in ['0484', '0487']:  # Kochi region
                    return 'cochin'
                else:
                    return 'standard'

        return 'standard'