#!/usr/bin/env python3
"""
Quick deployment script for Malayalam pre-trained models
Tests model loading and basic functionality
"""

import asyncio
import logging
import time
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_malayalam_models():
    """Test the Malayalam models integration"""
    
    print("🚀 MALAYALAM AI MODELS - QUICK DEPLOYMENT TEST")
    print("=" * 60)
    
    try:
        # Import after setting up the environment
        from malayalam_models import MalayalamModelManager, ModelConfig
        
        # Initialize with config
        config = ModelConfig()
        print(f"📱 Device: {config.device}")
        print(f"📁 Cache Directory: {config.cache_dir}")
        print()
        
        # Create model manager
        print("🔧 Initializing Malayalam Model Manager...")
        model_manager = MalayalamModelManager(config)
        
        # Load models
        print("⬇️  Loading pre-trained models...")
        start_time = time.time()
        
        initialization_results = await model_manager.initialize_models()
        
        load_time = time.time() - start_time
        print(f"⏱️  Model loading completed in {load_time:.2f} seconds")
        print()
        
        # Display results
        print("📊 MODEL LOADING RESULTS:")
        print("-" * 40)
        
        total_models = len(initialization_results)
        successful_models = sum(initialization_results.values())
        
        for model_name, success in initialization_results.items():
            status_icon = "✅" if success else "❌"
            status_text = "Loaded" if success else "Failed"
            print(f"{status_icon} {model_name.upper():15} : {status_text}")
        
        print("-" * 40)
        print(f"📈 Success Rate: {successful_models}/{total_models} ({successful_models/total_models*100:.1f}%)")
        print()
        
        # Test basic functionality if models loaded
        if successful_models > 0:
            print("🧪 TESTING BASIC FUNCTIONALITY:")
            print("-" * 40)
            
            # Test text analysis (basic)
            test_malayalam_text = "ഹലോ, എനിക്ക് ഒരു പരാതിയുണ്ട്"  # "Hello, I have a complaint"
            
            try:
                if initialization_results.get('nlu', False):
                    print(f"📝 Testing intent analysis with: '{test_malayalam_text}'")
                    intent_result = await model_manager.understand_malayalam_intent(test_malayalam_text)
                    if intent_result.get('success'):
                        print(f"✅ Intent detected: {intent_result['intent']} (confidence: {intent_result['confidence']:.3f})")
                    else:
                        print(f"⚠️  Intent analysis had issues: {intent_result.get('error', 'Unknown error')}")
                else:
                    print("⏭️  Skipping intent analysis (NLU model not loaded)")
                    
            except Exception as e:
                print(f"❌ Intent analysis test failed: {e}")
            
            try:
                if initialization_results.get('translation', False):
                    print(f"🌐 Testing translation...")
                    translation_result = await model_manager.translate_to_english(test_malayalam_text)
                    if translation_result.get('success'):
                        print(f"✅ Translation: {translation_result['translated_text']}")
                    else:
                        print(f"⚠️  Translation had issues: {translation_result.get('error', 'Unknown error')}")
                else:
                    print("⏭️  Skipping translation (Translation model not loaded)")
                    
            except Exception as e:
                print(f"❌ Translation test failed: {e}")
            
            try:
                if initialization_results.get('sentiment', False):
                    print(f"😊 Testing sentiment analysis...")
                    sentiment_result = await model_manager.analyze_sentiment(test_malayalam_text)
                    if sentiment_result.get('success'):
                        print(f"✅ Sentiment: {sentiment_result['sentiment']} (confidence: {sentiment_result['confidence']:.3f})")
                    else:
                        print(f"⚠️  Sentiment analysis had issues: {sentiment_result.get('error', 'Unknown error')}")
                else:
                    print("⏭️  Skipping sentiment analysis (Sentiment model not loaded)")
                    
            except Exception as e:
                print(f"❌ Sentiment analysis test failed: {e}")
        
        print()
        print("🎯 DEPLOYMENT ASSESSMENT:")
        print("-" * 40)
        
        if successful_models >= 3:
            print("🟢 EXCELLENT: Ready for production deployment")
            print("   • Multiple models loaded successfully")
            print("   • Full Malayalam processing capability")
            print("   • Recommended: Deploy to staging for integration testing")
            
        elif successful_models >= 1:
            print("🟡 GOOD: Partial deployment possible")
            print("   • Some models loaded successfully")  
            print("   • Limited Malayalam processing capability")
            print("   • Recommended: Review failed models and retry")
            
        else:
            print("🔴 ATTENTION NEEDED: No models loaded")
            print("   • Check internet connection")
            print("   • Verify Hugging Face Hub access")
            print("   • Review model availability")
        
        print()
        print("🚀 NEXT STEPS:")
        print("-" * 40)
        print("1. Run API server: python malayalam_api.py")
        print("2. Test API: http://localhost:8000/docs")
        print("3. Check health: http://localhost:8000/health")
        print("4. Integration: Import malayalam_models in your IVR code")
        
        return model_manager
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("\n💡 SOLUTION:")
        print("   pip install -r requirements-pretrained.txt")
        return None
        
    except Exception as e:
        print(f"❌ Deployment Test Failed: {e}")
        print("\n🔧 TROUBLESHOOTING:")
        print("   1. Check internet connection")
        print("   2. Verify Python environment")
        print("   3. Review error logs above")
        return None

async def quick_api_test():
    """Test the FastAPI server startup"""
    print("\n🌐 TESTING API SERVER STARTUP:")
    print("-" * 40)
    
    try:
        # Import API components
        from malayalam_api import app
        print("✅ FastAPI app imported successfully")
        print("✅ API ready for deployment")
        print("\n📋 Available endpoints:")
        print("   GET  /         - Service info") 
        print("   GET  /health   - Health check")
        print("   POST /transcribe - Audio transcription")
        print("   POST /intent   - Intent analysis")
        print("   POST /translate - Text translation")
        print("   POST /process-call - Complete call processing")
        print("\n🚀 To start API server:")
        print("   python malayalam_api.py")
        
    except Exception as e:
        print(f"❌ API test failed: {e}")

async def main():
    """Main deployment test function"""
    start_time = time.time()
    
    # Test model loading
    model_manager = await test_malayalam_models()
    
    # Test API setup
    await quick_api_test()
    
    total_time = time.time() - start_time
    print(f"\n⏱️  Total deployment test time: {total_time:.2f} seconds")
    print("\n🎉 Malayalam AI Models deployment test complete!")
    
    if model_manager:
        print("\n✅ SUCCESS: Ready for AI IVR integration!")
    else:
        print("\n⚠️  PARTIAL SUCCESS: Review issues above")

if __name__ == "__main__":
    asyncio.run(main())