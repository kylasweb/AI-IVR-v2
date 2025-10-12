# AI IVR Platform - Render.com Deployment Guide

This guide will help you deploy the AI IVR Platform to Render.com, a modern cloud platform for deploying web applications.

## 🚀 Quick Start

### Prerequisites

1. **Render.com Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to a GitHub repository
3. **Render CLI**: Install the Render CLI
   ```bash
   npm install -g @render/cli
   ```
4. **Login to Render**:
   ```bash
   render login
   ```

### One-Click Deployment

1. **Use the deployment script**:
   ```bash
   chmod +x scripts/deploy-render.sh
   ./scripts/deploy-render.sh
   ```

2. **Or deploy manually** using the Render dashboard

## 📋 Manual Deployment Steps

### 1. Prepare Your Repository

Make sure your repository contains:
- `render.yaml` configuration file
- `ivr-backend/` directory with Python backend
- `src/` directory with Next.js frontend
- Environment files (`.env.production.example`, `ivr-backend/.env.example`)

### 2. Create Render Services

#### Frontend Service (Next.js)

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `ai-ivr-frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `.` (leave empty)

#### Backend Service (Python FastAPI)

1. Create another Web Service
2. Configure the service:
   - **Name**: `ai-ivr-backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r ivr-backend/requirements-render.txt`
   - **Start Command**: `python ivr-backend/main-render.py`
   - **Root Directory**: `ivr-backend`

### 3. Configure Environment Variables

#### Frontend Environment Variables

In your frontend service settings, add:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://ai-ivr-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://ai-ivr-backend.onrender.com
NEXT_PUBLIC_APP_NAME=AI IVR Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Backend Environment Variables

In your backend service settings, add:

```env
PORT=10000
ENVIRONMENT=production
ALLOWED_ORIGINS=https://ai-ivr-frontend.onrender.com
PYTHON_VERSION=3.9.0
```

### 4. Deploy the Services

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Render will automatically deploy** your services when you push to GitHub

### 5. Verify Deployment

1. **Check the Render Dashboard** for deployment status
2. **Test your frontend** at `https://ai-ivr-frontend.onrender.com`
3. **Test your backend** at `https://ai-ivr-backend.onrender.com/health`

## 🔧 Configuration Files

### render.yaml

This file defines your Render services:

```yaml
services:
  - type: web
    name: ai-ivr-frontend
    runtime: node
    plan: free
    buildCommand: npm run build
    startCommand: npm start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        sync: false  # Set manually in dashboard

  - type: web
    name: ai-ivr-backend
    runtime: python
    plan: free
    rootDir: ivr-backend
    buildCommand: pip install -r requirements-render.txt
    startCommand: python main-render.py
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 10000
      - key: ENVIRONMENT
        value: production
```

### Environment Variables

#### Frontend (.env.production.example)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-backend-name.onrender.com
NEXT_PUBLIC_APP_NAME=AI IVR Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Backend (ivr-backend/.env.example)

```env
PORT=10000
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
PYTHON_VERSION=3.9.0
```

## 🌐 Custom Domains (Optional)

### 1. Add Custom Domain

1. Go to your service settings in Render Dashboard
2. Click "Add Custom Domain"
3. Enter your domain name (e.g., `ivr.yourdomain.com`)
4. Update your DNS records as instructed by Render

### 2. Update Environment Variables

After your custom domains are active, update your environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🔒 Security Considerations

### 1. Environment Variables

- Never commit sensitive data to your repository
- Use Render's environment variable management
- Rotate secrets regularly

### 2. CORS Configuration

- Set `ALLOWED_ORIGINS` to your specific frontend domain
- Avoid using wildcards (`*`) in production

### 3. Health Checks

- Both services have health check endpoints
- Monitor service health in Render Dashboard

## 📊 Monitoring and Logging

### 1. Render Dashboard

- Monitor service status
- View deployment logs
- Check resource usage

### 2. Application Logs

- Frontend logs: Available in Render Dashboard
- Backend logs: Available in Render Dashboard
- Use structured logging for better debugging

## 🚀 Scaling

### 1. Vertical Scaling

- Upgrade your service plan in Render Dashboard
- Add more RAM/CPU as needed

### 2. Horizontal Scaling

- Render supports multiple instances
- Configure load balancing in service settings

### 3. Database Scaling

- Consider adding PostgreSQL for production
- Use Render's managed database services

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Render Dashboard
   - Verify all dependencies are in requirements files
   - Ensure Node.js and Python versions are compatible

2. **Runtime Errors**:
   - Check service logs
   - Verify environment variables
   - Test health endpoints

3. **CORS Issues**:
   - Verify `ALLOWED_ORIGINS` configuration
   - Check frontend API URL settings

4. **Connection Issues**:
   - Ensure both services are running
   - Check network connectivity
   - Verify port configurations

### Debug Commands

```bash
# Check service health
curl https://your-backend.onrender.com/health

# Check frontend
curl https://your-frontend.onrender.com

# View logs (in Render Dashboard)
# Go to Service → Logs
```

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render CLI Documentation](https://github.com/render-oss/render-cli)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

## 🆘 Support

If you encounter issues:

1. Check the [Render Status Page](https://status.render.com)
2. Review [Render Documentation](https://render.com/docs)
3. Check your service logs in the Render Dashboard
4. Create an issue in your repository

---

**Note**: This deployment guide is for the free tier of Render.com. For production use, consider upgrading to paid plans for better performance and reliability.