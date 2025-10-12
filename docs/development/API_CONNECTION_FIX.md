# 🔧 FRONTEND ENVIRONMENT VARIABLE FIX

## Problem: Frontend showing mock data instead of real API data

## Solution: Update Frontend Environment Variables

### 1. Go to Render.com → Your Frontend Service → Environment Tab

### 2. Add/Update these environment variables:

```
NEXT_PUBLIC_API_URL=https://fairgo-imos-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://fairgo-imos-backend.onrender.com
```

### 3. Verify Backend CORS Settings

Go to Backend Service → Environment Tab and check:

```
ALLOWED_ORIGINS=https://fairgo-imos-frontend.onrender.com
```

### 4. Manual Redeploy (if needed)

After updating environment variables:

1. Frontend Service → "Manual Deploy" → Deploy Latest Commit
2. Backend Service → "Manual Deploy" → Deploy Latest Commit

### 5. Test API Connection

After redeployment, test these URLs:

- Backend Health: `https://fairgo-imos-backend.onrender.com/health`
- Frontend Health: `https://fairgo-imos-frontend.onrender.com/api/health`

### 6. Check Browser Console

Open your frontend site → F12 → Console tab → Look for API errors

Common errors:

- `CORS error` = Backend CORS not configured
- `404 error` = Wrong API URL
- `Network error` = Backend not running
