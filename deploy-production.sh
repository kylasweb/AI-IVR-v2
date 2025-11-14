#!/bin/bash
# IMOS Communications Engine - Production Deployment Script
# Deploys the complete AI-powered communications platform

set -e  # Exit on any error

echo "🚀 IMOS Communications Engine - Production Deployment"
echo "=================================================="

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/ivr-backend"
CONFIG_FILE="$BACKEND_DIR/config/routing_config_prod.yaml"
LOG_DIR="$PROJECT_ROOT/logs"
PID_FILE="$PROJECT_ROOT/imos_engine.pid"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        exit 1
    fi

    # Check pip
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 is not installed"
        exit 1
    fi

    # Check if virtual environment exists
    if [ ! -d "$BACKEND_DIR/venv" ]; then
        log_error "Virtual environment not found. Run setup first."
        exit 1
    fi

    log_info "Dependencies check passed"
}

setup_environment() {
    log_info "Setting up environment..."

    # Create log directory
    mkdir -p "$LOG_DIR"

    # Activate virtual environment
    source "$BACKEND_DIR/venv/bin/activate"

    # Install/update dependencies
    pip install -r "$BACKEND_DIR/requirements.txt"

    # Check configuration file
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Production config file not found: $CONFIG_FILE"
        exit 1
    fi

    log_info "Environment setup complete"
}

validate_configuration() {
    log_info "Validating configuration..."

    # Check required environment variables
    required_vars=(
        "PROPRIETARY_ML_BASE_URL"
        "PROPRIETARY_ML_API_KEY"
        "AI4BHARAT_BASE_URL"
        "AI4BHARAT_API_KEY"
        "GENERIC_CLOUD_BASE_URL"
        "GENERIC_CLOUD_API_KEY"
        "TWILIO_ACCOUNT_SID"
        "TWILIO_AUTH_TOKEN"
        "TWILIO_PHONE_NUMBER"
        "EXOTEL_API_KEY"
        "EXOTEL_API_TOKEN"
        "EXOTEL_SUBDOMAIN"
        "EXOTEL_PHONE_NUMBER"
        "WEBHOOK_BASE_URL"
        "ALLOWED_ORIGINS"
    )

    missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        printf '  %s\n' "${missing_vars[@]}"
        log_error "Please set these variables or create a .env file"
        exit 1
    fi

    log_info "Configuration validation passed"
}

start_service() {
    log_info "Starting IMOS Communications Engine..."

    # Check if already running
    if [ -f "$PID_FILE" ]; then
        if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            log_warn "Service already running (PID: $(cat "$PID_FILE"))"
            exit 1
        else
            log_warn "Removing stale PID file"
            rm "$PID_FILE"
        fi
    fi

    # Start the service
    cd "$BACKEND_DIR"
    source venv/bin/activate

    export PYTHONPATH="$BACKEND_DIR"
    export IMOS_CONFIG_FILE="$CONFIG_FILE"

    nohup python api_server.py > "$LOG_DIR/imos_engine.log" 2>&1 &
    echo $! > "$PID_FILE"

    # Wait for service to start
    sleep 5

    # Check if process is still running
    if kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_info "✅ IMOS Communications Engine started successfully"
        log_info "   PID: $(cat "$PID_FILE")"
        log_info "   Logs: $LOG_DIR/imos_engine.log"
        log_info "   Health check: curl http://localhost:8000/health"
    else
        log_error "❌ Failed to start service"
        exit 1
    fi
}

stop_service() {
    log_info "Stopping IMOS Communications Engine..."

    if [ ! -f "$PID_FILE" ]; then
        log_warn "PID file not found. Service may not be running."
        return
    fi

    PID=$(cat "$PID_FILE")

    if kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        sleep 5

        if kill -0 "$PID" 2>/dev/null; then
            log_warn "Service didn't stop gracefully, force killing..."
            kill -9 "$PID"
        fi

        log_info "✅ Service stopped"
    else
        log_warn "Service was not running"
    fi

    rm -f "$PID_FILE"
}

status_service() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        log_info "✅ IMOS Communications Engine is running"
        log_info "   PID: $(cat "$PID_FILE")"
        log_info "   Health check: curl http://localhost:8000/health"
    else
        log_info "❌ IMOS Communications Engine is not running"
        [ -f "$PID_FILE" ] && rm "$PID_FILE"
    fi
}

health_check() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        # Try to curl health endpoint
        if command -v curl &> /dev/null; then
            if curl -s http://localhost:8000/health > /dev/null; then
                log_info "✅ Service is healthy"
                return 0
            else
                log_error "❌ Service health check failed"
                return 1
            fi
        else
            log_info "✅ Service process is running (curl not available for health check)"
            return 0
        fi
    else
        log_error "❌ Service is not running"
        return 1
    fi
}

show_usage() {
    echo "Usage: $0 {start|stop|restart|status|health|setup}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the IMOS Communications Engine"
    echo "  stop    - Stop the IMOS Communications Engine"
    echo "  restart - Restart the IMOS Communications Engine"
    echo "  status  - Show service status"
    echo "  health  - Perform health check"
    echo "  setup   - Initial setup (create venv, install deps)"
    echo ""
    echo "Environment Variables Required:"
    echo "  AI Provider Keys: PROPRIETARY_ML_*, AI4BHARAT_*, GENERIC_CLOUD_*"
    echo "  Transport Keys: TWILIO_*, EXOTEL_*"
    echo "  Webhook URL: WEBHOOK_BASE_URL"
    echo "  Security: ALLOWED_ORIGINS"
}

setup_initial() {
    log_info "Performing initial setup..."

    # Create virtual environment
    cd "$BACKEND_DIR"
    python3 -m venv venv

    # Activate and install dependencies
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt

    log_info "✅ Initial setup complete"
    log_info "   Virtual environment: $BACKEND_DIR/venv"
    log_info "   Run '$0 start' to start the service"
}

# Main script logic
case "${1:-}" in
    start)
        check_dependencies
        setup_environment
        validate_configuration
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        stop_service
        sleep 2
        check_dependencies
        setup_environment
        validate_configuration
        start_service
        ;;
    status)
        status_service
        ;;
    health)
        health_check
        ;;
    setup)
        setup_initial
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

echo ""
echo "🎉 Operation complete!"