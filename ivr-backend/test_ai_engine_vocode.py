#!/usr/bin/env python3
"""
Quick test to validate Vocode integration in AI Engine
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai.ai_engine import AIEngine

async def test_ai_engine():
    """Test AI engine initialization with Vocode"""
    try:
        print("🔧 Initializing AI Engine with Vocode support...")

        engine = AIEngine()
        success = await engine.initialize()

        if success:
            print("✅ AI Engine initialized successfully!")
            print(f"📊 Available providers: {list(engine.connectors.keys())}")

            # Check if Vocode is available
            from ai.models.ai_model_router import AIProvider
            if AIProvider.VOCODE in engine.connectors:
                print("🎯 Vocode connector is active!")
            else:
                print("⚠️  Vocode connector not found in active connectors")

        else:
            print("❌ AI Engine initialization failed")

    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_engine())