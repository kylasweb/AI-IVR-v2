# AI IVR Platform - Docker Deployment Guide

This guide will help you deploy the AI IVR Platform using Docker and Docker Compose for local development and testing.

## 🐳 Prerequisites

1. **Docker**: Install Docker from [docker.com](https://docker.com)
2. **Docker Compose**: Usually included with Docker Desktop
3. **Git**: For cloning the repository

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai-ivr-platform
```

### 2. Use the Deployment Script

```bash
# Make the script executable (on Unix systems)
chmod +x scripts/docker-deploy.sh

# Build and start all services
./scripts/docker-deploy.sh build
./scripts/docker-deploy.sh start
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:10000
- **Backend Health**: http://localhost:10000/health

## 📋 Manual Deployment Steps

### 1. Build Docker Images

```bash
# Build frontend image
docker build -t ai-ivr-frontend .

# Build backend image
docker build -t ai-ivr-backend ./ivr-backend
```

### 2. Start Services with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Verify Deployment

```bash
# Check frontend
curl http://localhost:3000

# Check backend health
curl http://localhost:10000/health
```

## 🔧 Configuration

### docker-compose.yml

The Docker Compose configuration defines two services:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:10000
    depends_on:
      - backend

  backend:
    build: ./ivr-backend
    ports:
      - "10000:10000"
    environment:
      - PORT=10000
      - ENVIRONMENT=production
```

### Dockerfile (Frontend)

Multi-stage build for Next.js:

```dockerfile
FROM node:18-alpine AS base
FROM base AS deps
# ... dependencies installation
FROM base AS builder
# ... build process
FROM base AS runner
# ... production runtime
```

### Dockerfile (Backend)

Python FastAPI backend:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
# Install system dependencies
COPY requirements-render.txt .
RUN pip install -r requirements-render.txt
COPY . .
CMD ["python", "main-render.py"]
```

## 🛠️ Development Workflow

### 1. Local Development

```bash
# Start services in development mode
docker-compose up --build

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 2. Making Changes

```bash
# Rebuild and restart after changes
docker-compose down
docker-compose up --build
```

### 3. Debugging

```bash
# Access container shell
docker-compose exec frontend sh
docker-compose exec backend sh

# View container logs
docker-compose logs frontend
docker-compose logs backend
```

## 📊 Service Management

### Using the Deployment Script

The `scripts/docker-deploy.sh` script provides easy commands:

```bash
./scripts/docker-deploy.sh build    # Build images
./scripts/docker-deploy.sh start    # Start services
./scripts/docker-deploy.sh stop     # Stop services
./scripts/docker-deploy.sh restart  # Restart services
./scripts/docker-deploy.sh logs     # View logs
./scripts/docker-deploy.sh health   # Check health
./scripts/docker-deploy.sh cleanup  # Clean up resources
```

### Manual Docker Commands

```bash
# List running containers
docker-compose ps

# Stop specific service
docker-compose stop frontend

# Restart specific service
docker-compose restart backend

# Remove all containers and networks
docker-compose down -v
```

## 🔒 Security Considerations

### 1. Container Security

- Use non-root users in containers
- Minimal base images (Alpine)
- Regular security updates

### 2. Network Security

- Services communicate within Docker network
- Only expose necessary ports
- Use environment variables for sensitive data

### 3. Data Persistence

```yaml
# Add volumes for data persistence
volumes:
  - ./data:/app/data
  - ./logs:/app/logs
```

## 📈 Production Considerations

### 1. Environment Variables

Create `.env` file:

```env
# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com

# Backend
PORT=10000
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-domain.com
```

### 2. Resource Limits

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

### 3. Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:10000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :10000
   
   # Kill processes if needed
   kill -9 <PID>
   ```

2. **Build Failures**:
   ```bash
   # Clean build cache
   docker builder prune -f
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Container Won't Start**:
   ```bash
   # Check logs
   docker-compose logs service-name
   
   # Inspect container
   docker-compose exec service-name sh
   ```

4. **Network Issues**:
   ```bash
   # Check network connectivity
   docker-compose exec frontend curl backend:10000/health
   ```

### Debug Commands

```bash
# View container details
docker-compose ps

# Inspect container
docker inspect <container-name>

# Access container shell
docker-compose exec <service> sh

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

## 🚀 Advanced Configuration

### 1. Custom Networks

```yaml
networks:
  ai-ivr-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 2. External Services

```yaml
services:
  backend:
    external_links:
      - redis:redis
      - postgres:postgres
```

### 3. Logging Configuration

```yaml
services:
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Deployment](https://fastapi.tiangolo.com/deployment/docker/)

## 🆘 Support

If you encounter issues:

1. Check Docker and Docker Compose versions
2. Verify system resources (memory, disk space)
3. Review container logs
4. Check network connectivity
5. Ensure ports are not blocked by firewall

---

**Note**: This Docker setup is ideal for development and testing. For production deployment, consider using cloud platforms like Render.com, AWS, or Google Cloud.