#!/bin/bash

# AI IVR Platform - Render.com Deployment Script
# This script helps deploy the AI IVR platform to Render.com

set -e

echo "🚀 AI IVR Platform - Render.com Deployment Script"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Render CLI is installed
check_render_cli() {
    if ! command -v render &> /dev/null; then
        print_error "Render CLI is not installed. Please install it first:"
        echo "npm install -g @render/cli"
        exit 1
    fi
    print_success "Render CLI is installed"
}

# Check if user is logged in to Render
check_render_login() {
    if ! render whoami &> /dev/null; then
        print_error "You are not logged in to Render. Please run:"
        echo "render login"
        exit 1
    fi
    print_success "Logged in to Render"
}

# Validate environment files
validate_env_files() {
    print_status "Validating environment files..."
    
    if [ ! -f ".env.production.example" ]; then
        print_error ".env.production.example not found"
        exit 1
    fi
    
    if [ ! -f "ivr-backend/.env.example" ]; then
        print_error "ivr-backend/.env.example not found"
        exit 1
    fi
    
    print_success "Environment files validated"
}

# Check if render.yaml exists
check_render_config() {
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found"
        exit 1
    fi
    print_success "render.yaml found"
}

# Deploy to Render
deploy_to_render() {
    print_status "Deploying to Render.com..."
    
    # Deploy the services
    render deploy
    
    if [ $? -eq 0 ]; then
        print_success "Deployment initiated successfully!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Show deployment status
show_deployment_status() {
    print_status "Checking deployment status..."
    
    echo ""
    print_status "Your services are being deployed. You can check the status at:"
    echo "https://dashboard.render.com"
    echo ""
    print_status "After deployment, you will need to:"
    echo "1. Set the NEXT_PUBLIC_API_URL environment variable on your frontend service"
    echo "2. Set the ALLOWED_ORIGINS environment variable on your backend service"
    echo "3. Update the environment variables with your actual service URLs"
    echo ""
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    check_render_cli
    check_render_login
    validate_env_files
    check_render_config
    
    echo ""
    print_warning "Before deploying, make sure you have:"
    echo "1. A Render.com account"
    echo "2. Connected your GitHub repository to Render"
    echo "3. Updated the render.yaml file with your service names"
    echo ""
    
    read -p "Do you want to continue with deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_to_render
        show_deployment_status
    else
        print_status "Deployment cancelled"
        exit 0
    fi
}

# Run the main function
main "$@"