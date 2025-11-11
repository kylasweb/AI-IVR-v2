#!/usr/bin/env python3
"""
Open Models Configuration for Malayalam AI
Immediate deployment with publicly available models
"""

import asyncio
import logging
from malayalam_models import MalayalamModelManager, ModelConfig
from human_conversation_system import HumanLikeConversationSystem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_open_models():
    """Test with open models that don't require authentication"""
    
    logger.info("🌐 Testing with Open Models Configuration")
    
    # Configure open models
    config = ModelConfig()
    config.stt_model_large = "facebook/wav2vec2-large-xlsr-53"  # Multilingual STT
    config.stt_model_multilingual = "facebook/wav2vec2-base"  # Smaller fallback
    config.nlu_model = "bert-base-multilingual-cased"  # Open multilingual BERT
    config.translation_model = "Helsinki-NLP/opus-mt-mul-en"  # Open translation
    config.sentiment_model = "cardiffnlp/twitter-roberta-base-sentiment-latest"  # Open
    config.tts_model = "microsoft/speecht5_tts"  # Open TTS
    
    logger.info("📋 Open Models Configuration:")
    logger.info(f"   STT: {config.stt_model_large}")
    logger.info(f"   NLU: {config.nlu_model}")
    logger.info(f"   Translation: {config.translation_model}")
    logger.info(f"   Sentiment: {config.sentiment_model}")
    logger.info(f"   TTS: {config.tts_model}")
    
    # Initialize model manager
    manager = MalayalamModelManager(config)
    conversation_system = HumanLikeConversationSystem()
    
    # Initialize models
    logger.info("🔄 Loading open models...")
    results = await manager.initialize_models()
    
    # Display results
    success_count = sum(results.values())
    total_count = len(results)
    
    logger.info("📊 Open Models Results:")
    for model, status in results.items():
        emoji = "✅" if status else "❌"
        logger.info(f"   {emoji} {model}: {'Loaded' if status else 'Failed'}")
    
    logger.info(f"🎯 Success Rate: {success_count}/{total_count} ({(success_count/total_count)*100:.1f}%)")
    
    if success_count > 0:
        logger.info("🎉 Open models working! Basic Malayalam AI functionality available.")
        
        # Test basic functionality
        test_texts = [
            "Hello, I need help",  # English for testing
            "എനിക്ക് സഹായം വേണം"  # Malayalam 
        ]
        
        for text in test_texts:
            try:
                if 'nlu' in manager.models and results['nlu']:
                    intent = await manager.understand_malayalam_intent(text)
                    logger.info(f"   Intent for '{text}': {intent.get('intent', 'unknown')}")
                    
                if 'sentiment' in manager.models and results['sentiment']:
                    sentiment = await manager.analyze_sentiment(text)
                    logger.info(f"   Sentiment for '{text}': {sentiment.get('sentiment', 'unknown')}")
                    
            except Exception as e:
                logger.warning(f"   Test failed for '{text}': {e}")
    else:
        logger.warning("⚠️ No models loaded successfully")
    
    return success_count > 0

async def start_open_api():
    """Start API with open models"""
    
    logger.info("🚀 Starting Malayalam AI with Open Models...")
    
    # Test first
    success = await test_open_models()
    
    if success:
        logger.info("✅ Open models ready - you can now start the API:")
        logger.info("   python malayalam_api.py")
        logger.info("")
        logger.info("🌐 Available endpoints:")
        logger.info("   http://localhost:8000/docs - API documentation")
        logger.info("   http://localhost:8000/health - Health check")
        logger.info("   http://localhost:8000/conversation - Human-like conversation")
        logger.info("")
        logger.info("📈 Upgrade path:")
        logger.info("   1. Install: pip install sentencepiece protobuf")
        logger.info("   2. Authenticate: hf auth login") 
        logger.info("   3. Request AI4Bharat model access")
        logger.info("   4. Run: python test_ai4bharat_deployment.py")
        
    else:
        logger.error("❌ Open models failed - check network connectivity")
        logger.info("💡 Try installing missing dependencies:")
        logger.info("   pip install -r requirements-ai4bharat.txt")

if __name__ == "__main__":
    asyncio.run(start_open_api())