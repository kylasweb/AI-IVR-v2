# 🚀 SIMPLIFIED FairGo IMOS DEPLOYMENT (No Redis)

## QUICK START - 2 SERVICES ONLY

### 📧 Account: kailaspnair@yahoo.com

### 🔗 Repository: https://github.com/kylasweb/AI-IVR-v2

---

## OPTION 1: DEPLOY WITHOUT REDIS (RECOMMENDED FOR TESTING)

### STEP 1: CREATE BACKEND SERVICE

1. **Login to Render.com** → **New** → **Web Service**
2. **Connect GitHub** → Select: **kylasweb/AI-IVR-v2**
3. **Configure**:

   ```
   Name: fairgo-imos-backend
   Runtime: Python
   Branch: main
   Root Directory: ivr-backend
   Build Command: pip install -r requirements-render.txt
   Start Command: python main-render.py
   ```

4. **Environment Variables** (Click Advanced):

   ```
   PORT=10000
   ENVIRONMENT=production
   DEBUG=false

   # Database
   DATABASE_URL=postgresql://fairgo_imos_user:wMtYt7VsQ9WonvQEtYWpZvuSyObggSqB@dpg-d3krv0buibrs73c683o0-a/fairgo_imos_db

   # Security
   SECRET_KEY=59bdd240e8849a73c1934eba85157875ed099d4c2a33e485908068d3b4e72bdd
   JWT_SECRET=4ecc71ffd6fc196d97c9850347ee2cbb2d5909e5110e9a95afd1a3158ab41d8c

   # AI
   GOOGLE_API_KEY=AIzaSyBW5iYIIHl9x6ZYraRcWzu0TwTe-ihewo8
   GEMINI_API_KEY=AIzaSyBW5iYIIHl9x6ZYraRcWzu0TwTe-ihewo8

   # Cache (Memory instead of Redis)
   CACHE_TYPE=memory
   REDIS_URL=redis://localhost:6379

   # CORS
   ALLOWED_ORIGINS=https://fairgo-imos-frontend.onrender.com
   ```

5. **Create Service** → Wait for deployment → **Copy URL**

### STEP 2: CREATE FRONTEND SERVICE

1. **New** → **Web Service**
2. **Same Repository**: kylasweb/AI-IVR-v2
3. **Configure**:

   ```
   Name: fairgo-imos-frontend
   Runtime: Node
   Branch: main
   Root Directory: (empty)
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables**:

   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_NAME=FairGo IMOS

   # API URLs (use backend URL from Step 1)
   NEXT_PUBLIC_API_URL=https://fairgo-imos-backend.onrender.com
   NEXT_PUBLIC_WS_URL=wss://fairgo-imos-backend.onrender.com

   # Database
   DATABASE_URL=postgresql://fairgo_imos_user:wMtYt7VsQ9WonvQEtYWpZvuSyObggSqB@dpg-d3krv0buibrs73c683o0-a.oregon-postgres.render.com/fairgo_imos_db

   # Auth
   NEXTAUTH_SECRET=0ad7714cba537a618b99aad58c1e1990f7554c9482e5b0c70d3144c8ec74a74e
   JWT_SECRET=4ecc71ffd6fc196d97c9850347ee2cbb2d5909e5110e9a95afd1a3158ab41d8c

   # Features
   NEXT_PUBLIC_ENABLE_PHASE_1=true
   NEXT_PUBLIC_ENABLE_PHASE_2=true
   NEXT_PUBLIC_ENABLE_PHASE_3=true
   NEXT_PUBLIC_ENABLE_PHASE_4=true
   NEXT_PUBLIC_ENABLE_CULTURAL_AI=true
   NEXT_PUBLIC_ENABLE_MALAYALAM_UI=true
   ```

5. **Create Service**

### STEP 3: INITIALIZE DATABASE

1. **Backend Service** → **Shell** tab
2. Run:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

## 🎉 DONE!

**Your URLs**:

- Frontend: https://fairgo-imos-frontend.onrender.com
- Backend: https://fairgo-imos-backend.onrender.com
- Health: https://fairgo-imos-backend.onrender.com/health

**Cost**: $14/month (2 services × $7 each)

### 🔧 **ALL ISSUES FIXED** ✅

✅ **PyAudio Issue FIXED** - Cloud-compatible speech service (no microphone dependency)  
✅ **Tailwind CSS FIXED** - Downgraded to stable v3 and moved to production dependencies  
✅ **Autoprefixer FIXED** - Build dependencies available during deployment  
✅ **PostCSS Config FIXED** - Compatible with Render.com build system

**Latest commit**: `546b8b0` - All fixes pushed to GitHub ✅

---

## OPTION 2: WITH REDIS CLOUD (FOR PRODUCTION)

If you want Redis caching:

1. **Sign up**: https://redis.com/try-free/
2. **Create database** (free 30MB)
3. **Get connection string**
4. **Update backend REDIS_URL** to the Redis Cloud URL
5. **Remove CACHE_TYPE=memory**

---

**🚀 Start with Option 1 first - you can add Redis later!**
