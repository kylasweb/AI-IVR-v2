# Quick Deployment Script for Render.com (PowerShell)
# This script helps trigger deployment of the latest changes

Write-Host "🚀 Deploying Malayalam AI IVR Platform to Render.com..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if we're in a git repository
if (!(Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Found uncommitted changes. Committing them..." -ForegroundColor Yellow
    git add .
    $commit_msg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrEmpty($commit_msg)) {
        $commit_msg = "Update: Deploy latest frontend changes to Render.com"
    }
    git commit -m $commit_msg
} else {
    Write-Host "✅ No uncommitted changes found" -ForegroundColor Green
}

# Push to main branch
Write-Host "⬆️ Pushing changes to GitHub..." -ForegroundColor Blue
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Render.com should automatically deploy the changes." -ForegroundColor Cyan
    Write-Host "📱 Check your deployment at:" -ForegroundColor Yellow
    Write-Host "   • Frontend: https://fairgo-imos-frontend.onrender.com" -ForegroundColor White
    Write-Host "   • Backend: https://fairgo-imos-backend.onrender.com/health" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️ Deployment usually takes 3-5 minutes." -ForegroundColor Cyan
    Write-Host "🔧 If auto-deploy doesn't work:" -ForegroundColor Yellow
    Write-Host "   1. Go to Render.com Dashboard" -ForegroundColor White
    Write-Host "   2. Find 'fairgo-imos-frontend' service" -ForegroundColor White
    Write-Host "   3. Click 'Manual Deploy' → 'Deploy Latest Commit'" -ForegroundColor White
} else {
    Write-Host "❌ Failed to push to GitHub. Please check your connection." -ForegroundColor Red
    exit 1
}