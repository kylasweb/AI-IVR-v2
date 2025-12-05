@echo off
REM FastAPI TTS Backend Startup Script for Windows

echo ========================================
echo   FastAPI TTS Backend Starter
echo ========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet
echo.

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create backend\.env with your API keys
    echo See backend_setup_guide.md for instructions
    echo.
    pause
    exit /b 1
)

REM Start FastAPI server
echo Starting FastAPI TTS Backend...
echo Server will run on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
