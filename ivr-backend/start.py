#!/usr/bin/env python3
"""
Startup script for the AI IVR Platform Python Backend
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'websockets',
        'pydantic',
        'speechrecognition',
        'pyttsx3'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing packages: {missing_packages}")
        logger.info("Please install dependencies with: pip install -r requirements.txt")
        return False
    
    return True

def install_dependencies():
    """Install required dependencies"""
    logger.info("Installing dependencies...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        logger.info("Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    logger.info("Starting AI IVR Platform Backend...")
    logger.info("Server will be available at http://localhost:8000")
    
    try:
        import uvicorn
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    logger.info("AI IVR Platform Backend Startup")
    logger.info("=" * 40)
    
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check dependencies
    if not check_dependencies():
        logger.info("Attempting to install missing dependencies...")
        if not install_dependencies():
            logger.error("Failed to install dependencies. Please install manually.")
            sys.exit(1)
        
        # Check again after installation
        if not check_dependencies():
            logger.error("Dependencies still missing after installation attempt.")
            sys.exit(1)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()