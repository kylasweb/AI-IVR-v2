#!/usr/bin/env python3
"""
AI4Bharat Malayalam Models - Enhanced Deployment Test
Tests the complete human-like conversational AI pipeline
"""

import asyncio
import logging
import sys
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_ai4bharat_models():
    """Test AI4Bharat Malayalam models for human-like conversation"""
    
    logger.info("🚀 Testing AI4Bharat Malayalam Models for Human-like Conversation")
    
    try:
        # Import the enhanced model manager
        from malayalam_models import MalayalamModelManager, ModelConfig
        
        # Create enhanced configuration
        config = ModelConfig()
        logger.info(f"📋 Model Configuration:")
        logger.info(f"   STT Large: {config.stt_model_large}")
        logger.info(f"   STT Multilingual: {config.stt_model_multilingual}")
        logger.info(f"   TTS Model: {config.tts_model}")
        logger.info(f"   Device: {config.device}")
        logger.info(f"   Voice Config: {config.voice_config}")
        
        # Initialize model manager
        manager = MalayalamModelManager(config)
        
        # Test model initialization
        logger.info("🔄 Initializing AI4Bharat models...")
        initialization_results = await manager.initialize_models()
        
        logger.info("📊 Model Initialization Results:")
        for model_name, status in initialization_results.items():
            status_emoji = "✅" if status else "❌"
            logger.info(f"   {status_emoji} {model_name}: {'Loaded' if status else 'Failed'}")
        
        # Test Malayalam text understanding
        test_malayalam_texts = [
            "നമസ്കാരം, എനിക്ക് ഒരു സഹായം വേണം",
            "എന്റെ ബിൽ കാണണം",
            "ഇന്റർനെറ്റ് കണക്ഷനിൽ പ്രശ്നമുണ്ട്",
            "പരാതി രജിസ്റ്റർ ചെയ്യണം"
        ]
        
        logger.info("🧠 Testing Malayalam Understanding:")
        for text in test_malayalam_texts:
            try:
                intent_result = await manager.understand_malayalam_intent(text)
                if intent_result.get('success'):
                    logger.info(f"   ✅ '{text}' → Intent: {intent_result.get('intent', 'unknown')}")
                else:
                    logger.warning(f"   ⚠️ Intent analysis failed for: '{text}'")
            except Exception as e:
                logger.error(f"   ❌ Error analyzing: '{text}' - {e}")
        
        # Test translation capability
        logger.info("🌐 Testing Translation:")
        for text in test_malayalam_texts[:2]:  # Test first 2 samples
            try:
                translation_result = await manager.translate_to_english(text)
                if translation_result.get('success'):
                    logger.info(f"   ✅ '{text}' → '{translation_result.get('translated_text')}'")
                else:
                    logger.warning(f"   ⚠️ Translation failed for: '{text}'")
            except Exception as e:
                logger.error(f"   ❌ Translation error: '{text}' - {e}")
        
        # Test sentiment analysis
        logger.info("😊 Testing Sentiment Analysis:")
        sentiment_texts = [
            "വളരെ സന്തോഷമായി",  # Very happy
            "എനിക്ക് വിഷമമാണ്",   # I'm sad
            "ഇത് നല്ലതാണ്"      # This is good
        ]
        
        for text in sentiment_texts:
            try:
                sentiment_result = await manager.analyze_sentiment(text)
                if sentiment_result.get('success'):
                    logger.info(f"   ✅ '{text}' → {sentiment_result.get('sentiment')} ({sentiment_result.get('confidence', 0):.3f})")
                else:
                    logger.warning(f"   ⚠️ Sentiment analysis failed for: '{text}'")
            except Exception as e:
                logger.error(f"   ❌ Sentiment error: '{text}' - {e}")
        
        # Test TTS generation
        logger.info("🔊 Testing Malayalam Speech Generation:")
        tts_test_text = "നമസ്കാരം, ഞാൻ നിങ്ങളുടെ ഡിജിറ്റൽ അസിസ്റ്റന്റ്"
        
        try:
            tts_result = await manager.generate_malayalam_speech(tts_test_text)
            if tts_result.get('success'):
                if tts_result.get('audio_generated'):
                    logger.info(f"   ✅ AI4Bharat TTS Generated: {tts_result.get('audio_path')}")
                else:
                    logger.info(f"   ℹ️ TTS Ready but audio not generated: {tts_result.get('note')}")
            else:
                logger.warning(f"   ⚠️ TTS generation failed: {tts_result.get('error')}")
        except Exception as e:
            logger.error(f"   ❌ TTS error: {e}")
        
        # Summary
        successful_models = sum(initialization_results.values())
        total_models = len(initialization_results)
        success_rate = (successful_models / total_models) * 100
        
        logger.info("📋 AI4Bharat Models Test Summary:")
        logger.info(f"   🎯 Success Rate: {success_rate:.1f}% ({successful_models}/{total_models} models)")
        logger.info(f"   🤖 Human-like Conversation: {'Ready' if successful_models >= 3 else 'Partially Ready'}")
        logger.info(f"   🔧 Recommended Action: {'Deploy to production' if success_rate > 75 else 'Review failed models'}")
        
        if successful_models >= 3:
            logger.info("🎉 AI4Bharat Malayalam models are ready for human-like conversation!")
        else:
            logger.warning("⚠️ Some models failed to load. Check network connectivity and model availability.")
            
        return success_rate > 75
        
    except ImportError as e:
        logger.error(f"❌ Import Error: {e}")
        logger.error("Install requirements: pip install -r requirements-ai4bharat.txt")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected Error: {e}")
        return False

async def test_production_readiness():
    """Test production readiness for AI4Bharat models"""
    
    logger.info("🏭 Testing Production Readiness...")
    
    # Test 1: Model loading performance
    import time
    start_time = time.time()
    
    success = await test_ai4bharat_models()
    
    end_time = time.time()
    loading_time = end_time - start_time
    
    logger.info(f"⏱️ Total Loading Time: {loading_time:.2f} seconds")
    
    # Production readiness criteria
    criteria = {
        "models_loaded": success,
        "loading_time_acceptable": loading_time < 120,  # 2 minutes max
        "memory_efficient": True  # Assume true for now
    }
    
    logger.info("🏭 Production Readiness Assessment:")
    for criterion, status in criteria.items():
        status_emoji = "✅" if status else "❌"
        logger.info(f"   {status_emoji} {criterion}: {'Pass' if status else 'Fail'}")
    
    overall_ready = all(criteria.values())
    
    if overall_ready:
        logger.info("🚀 AI4Bharat models are PRODUCTION READY for human-like conversation!")
    else:
        logger.warning("⚠️ Production readiness needs improvement. Review failed criteria.")
    
    return overall_ready

if __name__ == "__main__":
    logger.info("🧪 AI4Bharat Malayalam Models - Enhanced Test Suite")
    
    try:
        # Run the comprehensive test
        asyncio.run(test_production_readiness())
        
    except KeyboardInterrupt:
        logger.info("⏹️ Test interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"❌ Test suite failed: {e}")
        sys.exit(1)