#!/bin/bash

# AI IVR Platform - Docker Deployment Script
# This script helps deploy the AI IVR platform using Docker

set -e

echo "🐳 AI IVR Platform - Docker Deployment Script"
echo "=============================================="

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t ai-ivr-frontend .
    
    # Build backend
    print_status "Building backend image..."
    docker build -t ai-ivr-backend ./ivr-backend
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting services with Docker Compose..."
    
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully!"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Show logs
show_logs() {
    print_status "Showing logs..."
    docker-compose logs -f
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Check frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend might not be ready yet"
    fi
    
    # Check backend
    if curl -f http://localhost:10000/health &> /dev/null; then
        print_success "Backend is healthy"
    else
        print_warning "Backend might not be ready yet"
    fi
}

# Clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed"
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build Docker images"
    echo "  start     Start services"
    echo "  stop      Stop services"
    echo "  restart   Restart services"
    echo "  logs      Show logs"
    echo "  health    Check service health"
    echo "  cleanup   Clean up Docker resources"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build    # Build images"
    echo "  $0 start    # Start services"
    echo "  $0 logs     # View logs"
}

# Main function
main() {
    case "${1:-help}" in
        "build")
            check_docker
            check_docker_compose
            build_images
            ;;
        "start")
            check_docker
            check_docker_compose
            start_services
            sleep 10
            check_health
            ;;
        "stop")
            check_docker
            check_docker_compose
            stop_services
            ;;
        "restart")
            check_docker
            check_docker_compose
            stop_services
            sleep 5
            start_services
            sleep 10
            check_health
            ;;
        "logs")
            check_docker
            check_docker_compose
            show_logs
            ;;
        "health")
            check_docker
            check_health
            ;;
        "cleanup")
            check_docker
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run the main function
main "$@"