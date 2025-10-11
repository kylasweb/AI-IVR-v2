# AI IVR Platform with Voice AI Agents

A comprehensive Interactive Voice Response (IVR) platform powered by AI agents, built with Python FastAPI backend and Next.js frontend dashboard.

## Features

### Core Functionality
- **Speech-to-Text**: Convert voice input to text using multiple recognition engines
- **Text-to-Speech**: Generate natural-sounding speech responses
- **Natural Language Processing**: Intent recognition and entity extraction
- **Conversation Management**: Intelligent dialogue flow handling
- **Real-time Communication**: WebSocket support for live interactions
- **Multi-language Support**: Support for multiple languages and accents

### Dashboard Features
- **Real-time Monitoring**: Live call session tracking
- **Call Analytics**: Detailed metrics and insights
- **Session Management**: View and manage active calls
- **Transcript Viewing**: Real-time conversation transcripts
- **Configuration**: IVR flow and voice settings

## Architecture

### Backend (Python/FastAPI)
- **FastAPI**: Modern, fast web framework for building APIs
- **WebSockets**: Real-time bidirectional communication
- **SpeechRecognition**: Multiple speech recognition engines
- **pyttsx3**: Text-to-speech synthesis
- **Custom NLP**: Intent recognition and entity extraction

### Frontend (Next.js/React)
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern styling
- **shadcn/ui**: Beautiful UI components
- **Real-time Updates**: Live dashboard with WebSocket integration

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the IVR backend directory:
```bash
cd ivr-backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Python backend server:
```bash
python start.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the project root directory (if not already there)

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the Next.js development server:
```bash
npm run dev
```

The frontend dashboard will be available at `http://localhost:3000`

## API Endpoints

### Core Endpoints

#### Health Check
```
GET /health
```
Returns the health status of all services.

#### Start Call Session
```
POST /api/call/start
Content-Type: application/json

{
  "phone_number": "+1234567890",
  "language": "en",
  "ivr_flow_id": "customer_service"
}
```

#### Process Voice Input
```
POST /api/voice/process
Content-Type: application/json

{
  "audio_data": "base64_encoded_audio",
  "session_id": "session_uuid"
}
```

#### Get Active Sessions
```
GET /api/sessions
```

#### Get Session Details
```
GET /api/sessions/{session_id}
```

#### End Session
```
POST /api/sessions/{session_id}/end
```

### WebSocket Endpoint

#### Real-time Communication
```
WS /ws/call/{session_id}
```

WebSocket messages format:
```json
{
  "type": "audio",
  "audio_data": "base64_encoded_audio"
}
```

Response format:
```json
{
  "type": "response",
  "text": "Response text",
  "audio_data": "base64_encoded_audio",
  "transcript": "User transcript",
  "intent": "detected_intent",
  "confidence": 0.95
}
```

## Configuration

### IVR Flows

The system supports configurable IVR flows. Default flows include:

- **Customer Service**: General inquiries, billing, technical support
- **Appointment Booking**: Schedule, reschedule, cancel appointments
- **Information**: Provide information and answer questions

### Voice Settings

Configure voice parameters:
- Voice gender (male/female)
- Speech speed
- Volume
- Language preferences

### Business Hours

Set business hours for automated responses:
```json
{
  "monday": {"open": "09:00", "close": "17:00"},
  "tuesday": {"open": "09:00", "close": "17:00"},
  "weekend": {"open": false}
}
```

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)

## Intent Recognition

The system recognizes various intents:

- **greeting**: Hello, hi, good morning
- **goodbye**: Bye, farewell, see you
- **help**: Request for assistance
- **yes/no**: Affirmation or negation
- **transfer**: Request to speak with human
- **appointment**: Scheduling related
- **billing**: Payment and invoice inquiries
- **technical_support**: Technical issues
- **information**: General information requests
- **complaint**: Expressing dissatisfaction
- **sales**: Purchase and product inquiries

## Entity Extraction

Automatically extracts:
- Phone numbers
- Email addresses
- Dates and times
- Monetary amounts
- Percentages
- Custom entities based on context

## Dashboard Usage

### Main Features

1. **Real-time Monitoring**: View active calls and their status
2. **Session Details**: Click on any session to see detailed information
3. **Transcript Viewing**: View real-time conversation transcripts
4. **Call Control**: End sessions or transfer to human agents
5. **Analytics**: View call metrics and trends
6. **Configuration**: Adjust IVR settings and flows

### Simulating Calls

Use the "Simulate Call" button to test the system with a mock call session.

## Development

### Project Structure

```
ivr-backend/
├── main.py                 # FastAPI application
├── start.py               # Startup script
├── requirements.txt       # Python dependencies
├── services/              # Core services
│   ├── speech_to_text.py
│   ├── text_to_speech.py
│   ├── nlp_service.py
│   ├── conversation_manager.py
│   └── voice_agent.py
└── models/                # Data models
    ├── call_session.py
    └── ivr_config.py

src/
├── app/
│   ├── api/ivr/          # API routes
│   └── page.tsx          # Main dashboard
└── components/ui/        # UI components
```

### Adding New Intents

1. Update intent patterns in `services/nlp_service.py`
2. Add response templates in `services/conversation_manager.py`
3. Update conversation flows as needed

### Adding New Languages

1. Add language mappings in speech services
2. Update response templates for the new language
3. Test speech recognition and synthesis

## Troubleshooting

### Common Issues

1. **Backend not connecting**: Ensure Python backend is running on port 8000
2. **Speech recognition errors**: Check microphone permissions and audio input
3. **Text-to-speech issues**: Verify system audio output and voice settings
4. **WebSocket connection**: Check firewall settings and port availability

### Logs

- Backend logs: Console output from Python server
- Frontend logs: Browser developer console
- API errors: Network tab in browser dev tools

## Production Deployment

### Backend Deployment

1. Use a production ASGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

2. Set up reverse proxy with Nginx
3. Configure SSL certificates
4. Set up monitoring and logging

### Frontend Deployment

1. Build the production version:
```bash
npm run build
```

2. Deploy to Vercel, Netlify, or your preferred hosting platform
3. Configure environment variables
4. Set up CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

**Note**: This is a demonstration platform. For production use, ensure proper security measures, compliance with regulations (such as GDPR for voice data), and appropriate infrastructure scaling.