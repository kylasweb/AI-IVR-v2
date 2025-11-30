# Google Cloud Text-to-Speech Setup Guide

## Overview
This implementation integrates Google Cloud Text-to-Speech API to provide high-quality, natural-sounding Malayalam voices with support for multiple dialects and emotional tones.

## Features
- ✅ Neural Malayalam voices (Wavenet quality)
- ✅ Male and female voice options
- ✅ Dialect support (Standard, Travancore, Malabar, Cochin)
- ✅ Emotion-based speech synthesis
- ✅ Automatic fallback to local TTS
- ✅ Audio caching for performance
- ✅ SSML support for advanced control

## Prerequisites
- Google Cloud account
- Cloud Text-to-Speech API enabled
- Service account credentials (JSON key file)

## Setup Instructions

### 1. Google Cloud Setup

1. **Create/Select Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Text-to-Speech API**:
   ```
   Navigation: APIs & Services > Library
   Search: "Cloud Text-to-Speech API"
   Click: Enable
   ```

3. **Create Service Account**:
   ```
   Navigation: IAM & Admin > Service Accounts
   Click: Create Service Account
   Name: tts-service-account
   Role: Cloud Text-to-Speech API User
   ```

4. **Download Credentials**:
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose JSON format
   - Download and save securely

### 2. Backend Configuration

1. **Install Dependencies**:
   ```bash
   cd ivr-backend
   pip install -r requirements-tts.txt
   ```

2. **Set Environment Variable**:
   
   **Windows (PowerShell)**:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account-key.json"
   $env:GOOGLE_CLOUD_TTS_ENABLED="true"
   ```

   **Linux/Mac**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
   export GOOGLE_CLOUD_TTS_ENABLED="true"
   ```

   **Or add to .env file**:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   GOOGLE_CLOUD_TTS_ENABLED=true
   TTS_DEFAULT_VOICE=ml-IN-Wavenet-A
   TTS_FALLBACK_TO_LOCAL=true
   ```

3. **Test Backend**:
   ```bash
   python main-ml.py
   ```

### 3. Frontend Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Demo**:
   - Open browser: `http://localhost:3000/malayalam-tts-demo`

## Available Malayalam Voices

| Voice ID | Description | Quality | Gender | Recommended |
|----------|-------------|---------|--------|-------------|
| `ml-IN-Wavenet-A` | Neural Female Voice | High | Female | ✅ Yes |
| `ml-IN-Wavenet-B` | Neural Male Voice | High | Male | ✅ Yes |
| `ml-IN-Standard-A` | Standard Female Voice | Standard | Female | - |
| `ml-IN-Standard-B` | Standard Male Voice | Standard | Male | - |

## Usage Examples

### Python Backend

```python
from services.text_to_speech_ml import MalayalamTextToSpeechService

tts_service = MalayalamTextToSpeechService()

# Basic synthesis
audio_data = await tts_service.synthesize(
    text="നമസ്കാരം! എങ്ങനെയുണ്ട്?",
    language="ml",
    emotion="happy",
    voice_name="ml-IN-Wavenet-A"
)

# With dialect
audio_data = await tts_service.synthesize_with_dialect(
    text="സുഖമാണോ?",
    dialect="travancore",
    emotion="professional"
)

# Check service status
status = tts_service.get_service_status()
print(f"Cloud TTS: {status['cloud_tts_enabled']}")
print(f"Primary Service: {status['primary_service']}")
```

### Frontend API

```typescript
// Generate speech
const response = await fetch('/api/speech/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        text: 'നമസ്കാരം',
        language: 'ml-IN',
        voiceName: 'ml-IN-Wavenet-A',
        emotion: 'neutral',
        dialect: 'standard'
    })
});

const data = await response.json();
console.log('Audio URL:', data.result.audioUrl);

// Get available voices
const voicesResponse = await fetch('/api/speech/tts');
const voices = await voicesResponse.json();
```

## Pricing

Google Cloud TTS pricing (as of 2024):
- **Wavenet voices**: $16 per 1 million characters
- **Standard voices**: $4 per 1 million characters
- **First 1 million characters/month**: Free

For typical usage:
- 1000 calls/day × 100 characters = 100K chars/day = ~3M chars/month
- Cost: ~$48/month for Wavenet voices

## Fallback System

The implementation includes intelligent fallback:

1. **Primary**: Google Cloud TTS (if configured and available)
2. **Fallback**: Local pyttsx3 engine (always available)

The system automatically falls back if:
- Google credentials not configured
- API quota exceeded
- Network connectivity issues
- Service unavailable

## Troubleshooting

### "Google Cloud TTS SDK not available"
```bash
pip install google-cloud-texttospeech google-auth
```

### "Could not initialize Google Cloud TTS"
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify JSON key file exists and is valid
- Ensure Text-to-Speech API is enabled
- Check service account has correct permissions

### "Using local TTS engine"
- This is normal if Google Cloud TTS is not configured
- System will use pyttsx3 as fallback
- To use cloud TTS, complete setup steps above

### Audio Quality Issues
- Use Wavenet voices for best quality
- Check internet connection for cloud TTS
- Verify correct language code (ml-IN)
- Test with different voices

## Demo Page Features

Access the demo at `/malayalam-tts-demo`:

1. **Text Input**: Support for Malayalam, Manglish, and English
2. **Voice Selection**: Choose from 4 Malayalam voices
3. **Dialect Options**: Standard, Travancore, Malabar, Cochin
4. **Emotion Styles**: Neutral, Happy, Professional, Sad
5. **Sample Phrases**: Pre-loaded common phrases
6. **Audio Player**: Play, pause, volume control
7. **Download**: Save generated audio

## Testing

Test Malayalam text samples:
- Pure Malayalam: `നമസ്കാരം! എങ്ങനെയുണ്ട്?`
- Manglish: `Namaskaram! Engane und?`
- Mixed: `Hello! നിങ്ങൾക്ക് സഹായം വേണോ?`

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Verify Google Cloud console for API status
3. Test with simple text first
4. Check network connectivity

## Next Steps

1. Test the demo page with various Malayalam text
2. Compare voice quality between cloud and local TTS
3. Test different dialects and emotions
4. Monitor usage and costs in Google Cloud Console
5. Implement audio caching for frequently used phrases
