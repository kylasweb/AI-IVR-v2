#!/bin/bash

# FairGo IMOS - Render.com Deployment Script
# Generated for kailaspnair@yahoo.com
# Repository: https://github.com/kylasweb/AI-IVR-v2

echo "🚀 FairGo IMOS - Render.com Deployment Preparation"
echo "=================================================="

# Set version
VERSION="2.0.0"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Deployment Information:${NC}"
echo "- Account: kailaspnair@yahoo.com"
echo "- Repository: https://github.com/kylasweb/AI-IVR-v2"
echo "- Database: fairgo_imos_db (PostgreSQL)"
echo "- Version: $VERSION"
echo ""

echo -e "${BLUE}🔍 Checking deployment readiness...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if render-deploy.yaml exists
if [ ! -f "render-deploy.yaml" ]; then
    echo -e "${RED}❌ Error: render-deploy.yaml not found.${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All deployment files ready${NC}"

# Verify Node.js dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Verify TypeScript compilation
echo -e "${BLUE}🔧 Checking TypeScript compilation...${NC}"
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript compilation failed. Please fix errors before deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ TypeScript compilation successful${NC}"

# Build the application
echo -e "${BLUE}🏗️ Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix build errors before deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Check if git repo is clean
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${BLUE}📝 Committing changes...${NC}"
    git add .
    git commit -m "Prepare for Render.com deployment - FairGo IMOS v$VERSION

    - Updated project name from Saksham to FairGo IMOS
    - Configured PostgreSQL database connection
    - Added Gemini AI API configuration
    - Updated render-deploy.yaml for production deployment
    - Generated secure environment variables
    - All 4 phases ready for deployment"
fi

# Push to GitHub
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git push failed. Please check your repository access.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code pushed to GitHub successfully${NC}"

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT READY!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to https://render.com and log in as kailaspnair@yahoo.com"
echo "2. Connect your GitHub repository: https://github.com/kylasweb/AI-IVR-v2"
echo "3. Use the render-deploy.yaml file for automated deployment"
echo "4. Monitor the deployment logs"
echo ""
echo -e "${BLUE}📋 Services that will be created:${NC}"
echo "- fairgo-imos-backend (Python FastAPI)"
echo "- fairgo-imos-frontend (Next.js)"
echo "- fairgo-imos-redis (Redis Cache)"
echo "- fairgo-imos-worker (Background Jobs)"
echo ""
echo -e "${BLUE}🔗 Expected URLs after deployment:${NC}"
echo "- Frontend: https://fairgo-imos-frontend.onrender.com"
echo "- Backend API: https://fairgo-imos-backend.onrender.com"
echo "- Health Check: https://fairgo-imos-backend.onrender.com/health"
echo ""
echo -e "${BLUE}📊 Database Migration:${NC}"
echo "After deployment, run database migrations:"
echo "1. Go to Render service shell (fairgo-imos-backend)"
echo "2. Run: npx prisma db push"
echo "3. Run: npx prisma generate"
echo ""
echo -e "${GREEN}✨ FairGo IMOS is ready for production deployment! ✨${NC}"