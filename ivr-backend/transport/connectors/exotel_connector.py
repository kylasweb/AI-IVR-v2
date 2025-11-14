"""
Exotel Transport Connector

Handles incoming webhooks from Exotel numbers and provides redundancy
for the IMOS Communications Engine.
"""

import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime

from ..call_session_manager import TransportConnector, TransportType, TransportMetadata, CallSession

logger = logging.getLogger(__name__)


class ExotelConnector(TransportConnector):
    """Exotel transport connector for PSTN calls"""

    @property
    def transport_type(self) -> TransportType:
        return TransportType.EXOTEL

    async def validate_request(self, request_data: Dict[str, Any]) -> bool:
        """Validate Exotel webhook request"""
        try:
            # Exotel sends specific headers and data format
            required_fields = ['CallSid', 'From', 'To', 'CallStatus']

            # Check if all required fields are present
            for field in required_fields:
                if field not in request_data:
                    logger.warning(f"Missing required field: {field}")
                    return False

            # Validate call SID format (Exotel SIDs start with 'CA')
            call_sid = request_data.get('CallSid', '')
            if not call_sid.startswith('CA'):
                logger.warning(f"Invalid CallSid format: {call_sid}")
                return False

            return True

        except Exception as e:
            logger.error(f"Error validating Exotel request: {e}")
            return False

    async def extract_call_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract call data from Exotel webhook format"""
        try:
            # Exotel webhook data structure
            call_data = {
                'session_id': request_data.get('CallSid'),
                'phone_number': request_data.get('From'),
                'direction': request_data.get('Direction', 'inbound'),
                'status': self._map_exotel_status(request_data.get('CallStatus', 'unknown')),
                'language': self._detect_language(request_data),
                'dialect': self._detect_dialect(request_data),
                'transport_metadata': {
                    'transport_type': TransportType.EXOTEL,
                    'provider_id': 'exotel',
                    'connection_id': request_data.get('CallSid'),
                    'raw_data': request_data,
                    'headers': {}  # Will be filled by caller
                }
            }

            # Add additional Exotel-specific data
            call_data['transport_data'] = {
                'exotel_sid': request_data.get('CallSid'),
                'to_number': request_data.get('To'),
                'dial_call_duration': request_data.get('DialCallDuration'),
                'recording_url': request_data.get('RecordingUrl'),
                'digits': request_data.get('Digits'),  # DTMF input
                'flow_id': request_data.get('FlowId'),
                'agent_id': request_data.get('AgentId')
            }

            return call_data

        except Exception as e:
            logger.error(f"Error extracting Exotel call data: {e}")
            raise

    async def send_response(self, session: CallSession, response_data: Dict[str, Any]) -> bool:
        """Send response back through Exotel"""
        try:
            # For Exotel, responses are typically sent via webhook callbacks
            # or through their API for ongoing calls

            response_type = response_data.get('type', 'text')

            if response_type == 'text':
                # Send text response (will be converted to speech)
                text = response_data.get('text', '')
                logger.info(f"Sending text response to Exotel: {text[:50]}...")

            elif response_type == 'audio':
                # Send audio URL
                audio_url = response_data.get('audio_url', '')
                logger.info(f"Sending audio response to Exotel: {audio_url}")

            elif response_type == 'hangup':
                # End the call
                logger.info("Sending hangup command to Exotel")
                return await self.end_call(session)

            # In a real implementation, this would make API calls to Exotel
            # For now, we just log the action
            return True

        except Exception as e:
            logger.error(f"Error sending response via Exotel: {e}")
            return False

    async def end_call(self, session: CallSession) -> bool:
        """End the call through Exotel"""
        try:
            # In a real implementation, this would call Exotel's API to hang up
            logger.info(f"Ending Exotel call for session {session.session_id}")
            return True

        except Exception as e:
            logger.error(f"Error ending Exotel call: {e}")
            return False

    def _map_exotel_status(self, exotel_status: str) -> str:
        """Map Exotel status to our internal status"""
        status_mapping = {
            'ringing': 'initializing',
            'in-progress': 'connected',
            'completed': 'completed',
            'busy': 'failed',
            'no-answer': 'timeout',
            'failed': 'failed',
            'canceled': 'completed'
        }
        return status_mapping.get(exotel_status.lower(), 'unknown')

    def _detect_language(self, request_data: Dict[str, Any]) -> str:
        """Detect language from Exotel data"""
        # Check for language hints in the request
        # This could be based on the 'To' number, custom parameters, etc.

        to_number = request_data.get('To', '')

        # Simple mapping based on number patterns (customize as needed)
        if '044' in to_number:  # Chennai
            return 'ta'  # Tamil
        elif '080' in to_number:  # Bangalore (Kannada region)
            return 'kn'  # Kannada
        elif '040' in to_number:  # Hyderabad (Telugu region)
            return 'te'  # Telugu
        elif '011' in to_number:  # Delhi (Hindi region)
            return 'hi'  # Hindi
        else:
            # Default to Malayalam for Kerala numbers
            return 'ml'

    def _detect_dialect(self, request_data: Dict[str, Any]) -> str:
        """Detect dialect from Exotel data"""
        # Basic dialect detection based on region
        to_number = request_data.get('To', '')

        # Kerala STD codes
        kerala_codes = ['0471', '0470', '0474', '0478', '0479', '0484', '0487', '0495', '0497']

        for code in kerala_codes:
            if code in to_number:
                if code in ['0471', '0470']:  # Trivandrum region
                    return 'travancore'
                elif code in ['0495', '0497']:  # Kozhikode region
                    return 'malabar'
                elif code in ['0484', '0487']:  # Kochi region
                    return 'cochin'
                else:
                    return 'standard'

        return 'standard'
