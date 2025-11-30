from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
from typing import Optional, Tuple
import os
import requests

app = FastAPI(title="svara-tts-proxy")


class InferRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    format: Optional[str] = None


# Attempt to import a local inference function if the user has placed it in the repo.
local_infer = None
try:
    # The user's inference repo may expose an `infer(text, voice, format)` function
    # Adjust this import path as needed when integrating with Kenpath's inference repo.
    from inference import infer as local_infer
except Exception:
    local_infer = None


def proxy_to_hf(text: str, voice: Optional[str] = None, fmt: Optional[str] = None) -> Tuple[bytes, str]:
    HF_MODEL = os.getenv('HF_MODEL', 'kenpath/svara-tts-v1')
    HF_TOKEN = os.getenv('HF_API_TOKEN')
    if not HF_TOKEN:
        raise RuntimeError('HF_API_TOKEN not set')

    payload = {
        'inputs': text,
        'options': {'wait_for_model': True},
        'parameters': {}
    }
    headers = {
        'Authorization': f'Bearer {HF_TOKEN}',
        'Content-Type': 'application/json',
        'Accept': 'application/octet-stream'
    }
    resp = requests.post(f'https://api-inference.huggingface.co/models/{HF_MODEL}', json=payload, headers=headers, timeout=120)
    if not resp.ok:
        raise RuntimeError(f'Hugging Face inference failed: {resp.status_code} {resp.text}')
    content_type = resp.headers.get('content-type', 'audio/wav')
    return resp.content, content_type


@app.post('/infer')
async def infer(req: InferRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail='text is required')

    # Prefer a local inference function if available
    try:
        if local_infer:
            # local_infer may be sync; assume it returns (bytes, content_type) or bytes
            result = local_infer(text, req.voice, req.format)
            if isinstance(result, tuple) and len(result) == 2:
                audio_bytes, content_type = result
            else:
                audio_bytes = result
                content_type = 'audio/wav'
            if not isinstance(audio_bytes, (bytes, bytearray)):
                raise HTTPException(status_code=500, detail='local_infer did not return bytes')
            return Response(content=audio_bytes, media_type=content_type)
        else:
            audio_bytes, content_type = proxy_to_hf(text, req.voice, req.format)
            return Response(content=audio_bytes, media_type=content_type)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Provide a small health endpoint
@app.get('/health')
async def health():
    return {'status': 'ok'}
