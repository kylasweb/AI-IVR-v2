# IMOS Communications Engine

## Transport-Agnostic AI-Powered Communications Platform

The IMOS Communications Engine is a next-generation communications platform designed for national-scale deployment in India, with special optimization for Kerala. It provides a unified abstraction layer over multiple communication providers (Twilio, Exotel, WebRTC, FreeSWITCH) and intelligent AI model routing with multi-language support.

## 🏗️ Architecture Overview

### Core Components

#### 1. Transport Abstraction Layer
- **CallSessionManager**: Unified session management across all transport types
- **Transport Connectors**: Protocol-specific implementations for each provider
- **Session Lifecycle**: Normalized call state management

#### 2. AI Language Abstraction Layer
- **AIModelRouter**: Intelligent model selection based on language, dialect, and performance
- **AI Connectors**: Provider-specific AI service integrations
- **AIEngine**: Main orchestrator for conversational AI processing

#### 3. FastAPI Integration Server
- **Webhook Handlers**: Real-time processing of transport webhooks
- **Health Monitoring**: System status and performance metrics
- **Session APIs**: REST endpoints for session management

## 🌟 Key Features

### Multi-Transport Support
- **Twilio**: Global CPaaS with advanced features
- **Exotel**: India-focused communications platform
- **WebRTC**: Browser-based real-time communications
- **FreeSWITCH**: Open-source telephony engine

### Intelligent AI Routing
- **Language Detection**: Automatic language identification
- **Dialect Support**: Kerala dialects (Travancore, Malabar, Cochin)
- **Provider Fallback**: Automatic failover between AI providers
- **Cost Optimization**: Performance/cost balancing

### Kerala Optimization
- **Regional Focus**: Special tuning for Kerala demographics
- **Multi-Language**: Malayalam, Tamil, Hindi, English
- **Cultural Context**: Localized responses and understanding

## 🚀 Quick Start

### Prerequisites
```bash
# Python 3.8+
python3 --version

# Required packages
pip install fastapi uvicorn aiohttp pyyaml
```

### Environment Setup
```bash
# Clone and setup
cd ivr-backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration
Create environment variables or `.env` file:
```bash
# AI Providers
export PROPRIETARY_ML_BASE_URL="https://api.kerala-ml.example.com"
export PROPRIETARY_ML_API_KEY="your-key"
export AI4BHARAT_BASE_URL="https://api.ai4bharat.org"
export AI4BHARAT_API_KEY="your-key"
export GENERIC_CLOUD_BASE_URL="https://api.openai.com"
export GENERIC_CLOUD_API_KEY="your-key"

# Transport Providers
export TWILIO_ACCOUNT_SID="your-twilio-sid"
export TWILIO_AUTH_TOKEN="your-twilio-token"
export TWILIO_PHONE_NUMBER="+919876543210"
export EXOTEL_API_KEY="your-exotel-key"
export EXOTEL_API_TOKEN="your-exotel-token"
export EXOTEL_SUBDOMAIN="your-subdomain"
export EXOTEL_PHONE_NUMBER="+919876543211"

# Webhooks
export WEBHOOK_BASE_URL="https://your-domain.com"
export ALLOWED_ORIGINS="https://your-frontend.com"
```

### Deployment
```bash
# Initial setup
./deploy-production.sh setup

# Start service
./deploy-production.sh start

# Check status
./deploy-production.sh status

# Health check
curl http://localhost:8000/health
```

## 📡 API Endpoints

### Health & Monitoring
```http
GET /health
# Returns system status and component health
```

### Webhook Handlers
```http
POST /webhook/twilio
# Handle Twilio voice/webhook events

POST /webhook/exotel
# Handle Exotel call events
```

### Session Management
```http
GET /sessions/{session_id}
# Get session information

POST /ai/process
# Direct AI processing for testing
```

## 🔧 Configuration

### Routing Configuration (`config/routing_config_prod.yaml`)

```yaml
languages:
  ml:  # Malayalam
    dialects:
      travancore:
        priority_providers: ["proprietary_ml", "ai4bharat", "generic_cloud"]
      malabar:
        priority_providers: ["proprietary_ml", "ai4bharat", "generic_cloud"]

providers:
  proprietary_ml:
    models:
      malayalam_v1:
        capabilities: ["conversational_ai", "stt", "tts"]
        languages: ["ml"]
        cost_per_minute: 0.02
        accuracy_score: 0.92

routing_rules:
  kerala_priority:
    condition: "region == 'kerala' and language == 'ml'"
    priority_providers: ["proprietary_ml", "ai4bharat"]
    min_confidence: 0.80
```

## 🧪 Testing

### Integration Tests
```bash
cd ivr-backend
python -c "
import asyncio
from transport.call_session_manager import CallSessionManager
from ai import AIEngine

async def test():
    session_manager = CallSessionManager()
    ai_engine = AIEngine()
    success = await ai_engine.initialize()
    print('✅ Integration test passed' if success else '❌ Test failed')

asyncio.run(test())
"
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Direct AI processing
curl -X POST http://localhost:8000/ai/process \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Hello", "language": "en"}'
```

## 📊 Monitoring & Observability

### Health Checks
- Component status monitoring
- AI provider connectivity checks
- Transport provider validation

### Metrics
- Call success rates
- AI response latency
- Cost per conversation
- Language detection accuracy

### Logging
- Structured logging with rotation
- Error tracking and alerting
- Performance monitoring

## 🔒 Security

### Authentication
- API key-based authentication
- Transport provider validation
- Request rate limiting

### Data Protection
- End-to-end encryption for sensitive data
- Secure webhook validation
- GDPR compliance for user data

## 🚢 Deployment Options

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "api_server.py"]
```

### Cloud Deployment
- **Azure**: App Service, AKS, Functions
- **AWS**: ECS, Lambda, API Gateway
- **GCP**: Cloud Run, GKE
- **Render**: Web Service deployment

## 🤝 Contributing

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-org/imos-engine.git
cd imos-engine

# Setup development environment
make setup-dev
make test
make lint
```

### Code Standards
- Type hints required
- Async/await patterns
- Comprehensive error handling
- Unit test coverage > 80%

## 📈 Performance Benchmarks

### Latency Targets
- AI Response: < 200ms
- Session Creation: < 50ms
- Webhook Processing: < 100ms

### Scalability
- 1000+ concurrent sessions
- 99.9% uptime target
- Auto-scaling based on load

## 📞 Support

### Documentation
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Discord/Slack for community support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Kerala Government for regional requirements
- AI4Bharat for Indic language models
- Open source community for transport libraries

---

**Built with ❤️ for India's digital transformation**