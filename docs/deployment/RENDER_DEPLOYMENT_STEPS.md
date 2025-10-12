# 🚀 FairGo IMOS - Complete Render.com Deployment Guide

## STEP-BY-STEP DEPLOYMENT INSTRUCTIONS

### 📧 Account: kailaspnair@yahoo.com

### 🔗 Repository: https://github.com/kylasweb/AI-IVR-v2

---

## STEP 1: SETUP REDIS (EXTERNAL)

**Note**: Render.com doesn't provide Redis. We'll use Redis Cloud (free tier):

1. **Go to Redis Cloud**: https://redis.com/try-free/
2. **Sign up** with a free account
3. **Create Database**:
   ```
   Name: fairgo-imos-cache
   Cloud Provider: AWS
   Region: US-East-1
   Plan: Free (30MB)
   ```
4. **Get Connection Details**:
   - Click on your database
   - Copy the **Redis connection string** (looks like: redis://default:password@redis-xxxxx.c1.us-east-1-2.ec2.cloud.redislabs.com:12345)
5. **IMPORTANT**: Save this connection string for Step 2

**Alternative**: Skip Redis for now by using memory cache (not recommended for production)

---

## STEP 2: CREATE BACKEND SERVICE

1. **Login to Render.com** with kailaspnair@yahoo.com
2. Click **"New"** → **"Web Service"**
3. **Connect GitHub**: Click "Connect account" if needed
4. Select repository: **kylasweb/AI-IVR-v2**
5. Configure:

   ```
   Name: fairgo-imos-backend
   Runtime: Python
   Branch: main
   Root Directory: ivr-backend
   Build Command: pip install -r requirements-render.txt
   Start Command: python main-render.py
   Instance Type: Starter ($7/month)
   ```

6. **Environment Variables**: Click "Advanced" → Add these variables:

   **COPY FROM backend-env-vars.txt FILE**

   **PLUS ADD**:

   ```
   REDIS_URL=[Paste Redis connection string from Step 1]
   ```

   **OR if skipping Redis**:

   ```
   REDIS_URL=redis://localhost:6379
   CACHE_TYPE=memory
   ```

7. Click **"Create Web Service"**
8. **IMPORTANT**: Copy the **Service URL** (e.g., https://fairgo-imos-backend.onrender.com)

---

## STEP 3: CREATE FRONTEND SERVICE

1. Click **"New"** → **"Web Service"**
2. Select **SAME repository**: **kylasweb/AI-IVR-v2**
3. Configure:

   ```
   Name: fairgo-imos-frontend
   Runtime: Node
   Branch: main
   Root Directory: (leave empty)
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Starter ($7/month)
   ```

4. **Environment Variables**: Add these:

   **COPY FROM frontend-env-vars.txt FILE**

   **PLUS ADD**:

   ```
   NEXT_PUBLIC_API_URL=[Backend Service URL from Step 2]
   NEXT_PUBLIC_WS_URL=[Backend Service URL from Step 2 but change https:// to wss://]
   NEXTAUTH_URL=[Will be auto-set to your frontend URL]
   ```

5. Click **"Create Web Service"**

---

## STEP 4: UPDATE BACKEND CORS (IMPORTANT!)

1. Go to **fairgo-imos-backend** service
2. Go to **Environment** tab
3. Update **ALLOWED_ORIGINS** to include your frontend URL:
   ```
   ALLOWED_ORIGINS=https://fairgo-imos-frontend.onrender.com
   ```
4. Click **"Save Changes"**

---

## STEP 5: INITIALIZE DATABASE

1. Go to **fairgo-imos-backend** service
2. Click **"Shell"** tab (wait for service to be running)
3. Run these commands:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

---

## 🎉 DEPLOYMENT COMPLETE!

### Your FairGo IMOS URLs:

- **Frontend**: https://fairgo-imos-frontend.onrender.com
- **Backend**: https://fairgo-imos-backend.onrender.com
- **Health Check**: https://fairgo-imos-backend.onrender.com/health

### ✅ What's Deployed:

- ✅ Phase 1: Cloud Call Recording & Transcription
- ✅ Phase 2: Audio Conferencing & Live Transcription
- ✅ Phase 3: AMD (Answering Machine Detection)
- ✅ Phase 4: Live Translation R&D Partnership
- ✅ Malayalam Cultural Intelligence
- ✅ PostgreSQL Database Connected
- ✅ Redis Cache Connected
- ✅ Gemini AI Integrated

### 🔧 Cost Breakdown:

- **Redis**: Free (Redis Cloud free tier - 30MB)
- **Backend**: $7/month (Render Starter plan)
- **Frontend**: $7/month (Render Starter plan)
- **Database**: Already created (your existing DB)
- **Total**: ~$14/month

---

## 🛠️ TROUBLESHOOTING

### If Backend Build Fails:

1. Check Python version is 3.11
2. Verify `requirements-render.txt` exists in `ivr-backend/` folder
3. Check build logs for specific errors

### If Frontend Build Fails:

1. Verify Node.js version is 18+
2. Check that `package.json` is in root directory
3. Ensure all environment variables are set

### If Database Connection Fails:

1. Verify DATABASE_URL is correct
2. Check if database allows external connections
3. Run `npx prisma db push` in backend shell

---

**🎯 Need help? Your deployment is ready to go!**
