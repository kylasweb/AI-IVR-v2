Self-hosting guide for svara-tts-v1

This folder contains scaffolding and instructions to self-host the `kenpath/svara-tts-v1` model for production or high-volume use.

Goals
- Run a local inference service for `svara-tts-v1` (usable by `http://localhost:5000/api/tts` or similar).
- Provide a Docker-based deployment for GPU/CPU environments.
- Keep Next.js integration unchanged: point `HF_API_TOKEN` to local endpoint or update `src/app/api/tts/route.ts` to call a local URL.

Overview
1. Clone the model's inference repo (Kenpath's `svara-tts-inference`), or use the official inference scripts if available.
2. Build a Docker image with the required Python runtime (PyTorch or relevant runtime) and model weights (GGUF or safetensors). For GPU, use CUDA base images.
3. Run the container and expose a simple HTTP endpoint that accepts text and returns audio bytes.

Quick start (recommended for testing)

Prerequisites
- Docker (19+) and docker-compose
- GPU + NVIDIA drivers (optional for GPU inference)
- Adequate disk space and memory (model ~3B parameters; CPU inference is possible but slower)

Steps
1. Clone Kenpath inference repo (recommended):

   git clone https://github.com/Kenpath/svara-tts-inference.git /opt/svara-tts-inference

2. Inspect the repo for a `requirements.txt` or `pyproject.toml`. The inference repo usually includes example server scripts (FastAPI / Flask) and model loading helpers.

3. Use the provided `Dockerfile.template` in this folder as a starting point. Copy it into the inference repo and build the image:

   cp Dockerfile.template /opt/svara-tts-inference/Dockerfile
   cd /opt/svara-tts-inference
   docker build -t svara-tts:local .

4. Run with docker-compose (example provided):

   docker-compose up -d

5. The service should expose an endpoint like `http://localhost:5000/infer` or similar. Update your Next.js TTS route to call this local endpoint instead of Hugging Face's API.

Dockerfile.template (CPU example)
- Uses Python 3.11, installs requirements, exposes port 5000, and starts a simple FastAPI/uvicorn server. For GPU, swap the base image with CUDA/PyTorch GPU image and ensure drivers are available.

Scaling and production notes
- For high throughput, use a GPU-backed node or multiple replicas behind a load balancer.
- Use persistent storage for model files or bake them into the image.
- Add health checks and monitoring (Prometheus/metrics) and autoscaling if running in Kubernetes.
- Consider batching and streaming inference for long texts.

Security
- Protect the inference endpoint behind an internal network or auth (API keys) so it is not publicly exposed.

If you want, I can:
- Create a concrete Dockerfile (CPU and GPU variants) and a `docker-compose.yml` that builds and runs the model container (requires knowing the inference repo layout).
- Implement a small Python FastAPI wrapper that accepts POST /infer { text } and returns audio bytes, using the Kenpath inference code.

Choose whether you want the generic scaffolding (what's here) or that concrete implementation and I will proceed.
