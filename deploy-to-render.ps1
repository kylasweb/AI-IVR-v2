# FairGo IMOS - Render.com Deployment Script (PowerShell)
# Generated for kailaspnair@yahoo.com
# Repository: https://github.com/kylasweb/AI-IVR-v2

Write-Host "🚀 FairGo IMOS - Render.com Deployment Preparation" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Set version
$VERSION = "2.0.0"

Write-Host "📋 Deployment Information:" -ForegroundColor Blue
Write-Host "- Account: kailaspnair@yahoo.com"
Write-Host "- Repository: https://github.com/kylasweb/AI-IVR-v2"
Write-Host "- Database: fairgo_imos_db (PostgreSQL)"
Write-Host "- Version: $VERSION"
Write-Host ""

Write-Host "🔍 Checking deployment readiness..." -ForegroundColor Blue

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if render-deploy.yaml exists
if (-not (Test-Path "render-deploy.yaml")) {
    Write-Host "❌ Error: render-deploy.yaml not found." -ForegroundColor Red
    exit 1
}

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ Error: .env.production not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ All deployment files ready" -ForegroundColor Green

# Verify Node.js dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed." -ForegroundColor Red
    exit 1
}

# Verify TypeScript compilation
Write-Host "🔧 Checking TypeScript compilation..." -ForegroundColor Blue
npx tsc --noEmit

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript compilation failed. Please fix errors before deployment." -ForegroundColor Red
    exit 1
}

Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green

# Build the application
Write-Host "🏗️ Building application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix build errors before deployment." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful" -ForegroundColor Green

# Check git status
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 Committing changes..." -ForegroundColor Blue
    git add .
    git commit -m "Prepare for Render.com deployment - FairGo IMOS v$VERSION

- Updated project name from Saksham to FairGo IMOS
- Configured PostgreSQL database connection  
- Added Gemini AI API configuration
- Updated render-deploy.yaml for production deployment
- Generated secure environment variables
- All 4 phases ready for deployment"
}

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Blue
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed. Please check your repository access." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code pushed to GitHub successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 DEPLOYMENT READY!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to https://render.com and log in as kailaspnair@yahoo.com"
Write-Host "2. Connect your GitHub repository: https://github.com/kylasweb/AI-IVR-v2"
Write-Host "3. Use the render-deploy.yaml file for automated deployment"
Write-Host "4. Monitor the deployment logs"
Write-Host ""
Write-Host "📋 Services that will be created:" -ForegroundColor Blue
Write-Host "- fairgo-imos-backend (Python FastAPI)"
Write-Host "- fairgo-imos-frontend (Next.js)"
Write-Host "- fairgo-imos-redis (Redis Cache)"
Write-Host "- fairgo-imos-worker (Background Jobs)"
Write-Host ""
Write-Host "🔗 Expected URLs after deployment:" -ForegroundColor Blue
Write-Host "- Frontend: https://fairgo-imos-frontend.onrender.com"
Write-Host "- Backend API: https://fairgo-imos-backend.onrender.com"
Write-Host "- Health Check: https://fairgo-imos-backend.onrender.com/health"
Write-Host ""
Write-Host "📊 Database Migration:" -ForegroundColor Blue
Write-Host "After deployment, run database migrations:"
Write-Host "1. Go to Render service shell (fairgo-imos-backend)"
Write-Host "2. Run: npx prisma db push"
Write-Host "3. Run: npx prisma generate"
Write-Host ""
Write-Host "✨ FairGo IMOS is ready for production deployment! ✨" -ForegroundColor Green

# Open Render.com in browser
Write-Host ""
Write-Host "🌐 Opening Render.com dashboard..." -ForegroundColor Blue
Start-Process "https://render.com/dashboard"

Write-Host ""
Write-Host "📖 Deployment Guide:" -ForegroundColor Yellow
Write-Host "For detailed instructions, refer to DEPLOYMENT_COMPLETE_RENDER.md"