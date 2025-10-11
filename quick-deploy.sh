#!/bin/bash

# Quick Deployment Script for Render.com
# This script helps trigger deployment of the latest changes

echo "🚀 Deploying Malayalam AI IVR Platform to Render.com..."
echo "=================================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Found uncommitted changes. Committing them..."
    git add .
    read -p "Enter commit message (or press Enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        commit_msg="Update: Deploy latest frontend changes to Render.com"
    fi
    git commit -m "$commit_msg"
else
    echo "✅ No uncommitted changes found"
fi

# Push to main branch
echo "⬆️ Pushing changes to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔄 Render.com should automatically deploy the changes."
    echo "📱 Check your deployment at:"
    echo "   • Frontend: https://fairgo-imos-frontend.onrender.com"
    echo "   • Backend: https://fairgo-imos-backend.onrender.com/health"
    echo ""
    echo "⏱️ Deployment usually takes 3-5 minutes."
    echo "🔧 If auto-deploy doesn't work:"
    echo "   1. Go to Render.com Dashboard"
    echo "   2. Find 'fairgo-imos-frontend' service"
    echo "   3. Click 'Manual Deploy' → 'Deploy Latest Commit'"
else
    echo "❌ Failed to push to GitHub. Please check your connection."
    exit 1
fi