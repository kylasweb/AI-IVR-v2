# FastAPI TTS Backend - README

## 🎤 Enterprise Text-to-Speech Service

FastAPI backend providing multi-provider TTS capabilities with automatic failover.

## Features

- ✅ **Google Cloud TTS** - Primary provider (Neural/WaveNet voices)
- ✅ **HuggingFace TTS** - Fallback provider (Free tier)
- ✅ **Svara TTS** - Indian languages specialist
- ✅ **Automatic Failover** - Seamless provider switching
- ✅ **Google Cloud Storage** - Audio file storage/caching
- ✅ **50+ Languages** - Comprehensive language support
- ✅ **Real-time Synthesis** - Low latency generation
- ✅ **Batch Processing** - Multiple texts concurrently

## Quick Start

### Windows
```bash
# Run startup script
start-backend.bat
```

### Manual Start
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Configuration

Create `backend/.env`:
```env
GOOGLE_CLOUD_TTS_API_KEY=your_key
GOOGLE_CLOUD_PROJECT_ID=your_project
GCS_BUCKET_NAME=your_bucket
HUGGINGFACE_API_KEY=your_hf_key
```

## API Endpoints

### Synthesize Speech
```
POST /api/v1/tts/synthesize
```

### List Voices
```
GET /api/v1/tts/voices?language=en-US
```

### Provider Status
```
GET /api/v1/tts/providers/status
```

### Batch Processing
```
POST /api/v1/tts/batch
```

## Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Tech Stack

- **Framework**: FastAPI 0.109+
- **TTS Providers**: Google Cloud, HuggingFace, Svara
- **Storage**: Google Cloud Storage
- **Python**: 3.11+

## Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── schemas/tts.py          # Pydantic models
│   ├── services/tts/           # TTS providers
│   ├── api/routes/tts.py       # API endpoints
│   └── core/config.py          # Configuration
├── requirements.txt
└── .env
```

## Support

For issues, see: `backend_setup_guide.md`
