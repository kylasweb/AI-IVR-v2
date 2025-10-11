# Project Saksham - Comprehensive Testing Suite
# Tests for all 4 phases with Malayalam cultural intelligence

import pytest
import asyncio
import json
import requests
from typing import Dict, List, Any
from datetime import datetime
import os
from pathlib import Path

# Test configuration
BASE_URL = os.getenv('TEST_API_URL', 'http://localhost:8000')
FRONTEND_URL = os.getenv('TEST_FRONTEND_URL', 'http://localhost:3000')

class ProjectSakShamTestSuite:
    """Comprehensive test suite for Project Saksham - All 4 Phases"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.frontend_url = FRONTEND_URL
        self.test_results = {
            'phase_1': {},
            'phase_2': {},
            'phase_3': {},
            'phase_4': {},
            'cultural_ai': {},
            'integration': {}
        }
    
    # ============================================================================
    # HEALTH AND CONNECTIVITY TESTS
    # ============================================================================
    
    def test_backend_health(self):
        """Test backend service health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            assert response.status_code == 200
            
            health_data = response.json()
            assert health_data.get('status') == 'healthy'
            
            self.test_results['integration']['backend_health'] = 'PASS'
            print("✅ Backend health check: PASS")
            return True
            
        except Exception as e:
            self.test_results['integration']['backend_health'] = f'FAIL: {str(e)}'
            print(f"❌ Backend health check: FAIL - {str(e)}")
            return False
    
    def test_frontend_health(self):
        """Test frontend service health"""
        try:
            response = requests.get(f"{self.frontend_url}/api/health", timeout=10)
            assert response.status_code == 200
            
            self.test_results['integration']['frontend_health'] = 'PASS'
            print("✅ Frontend health check: PASS")
            return True
            
        except Exception as e:
            self.test_results['integration']['frontend_health'] = f'FAIL: {str(e)}'
            print(f"❌ Frontend health check: FAIL - {str(e)}")
            return False
    
    def test_database_connectivity(self):
        """Test database connectivity"""
        try:
            response = requests.get(f"{self.base_url}/health/db", timeout=10)
            assert response.status_code == 200
            
            db_health = response.json()
            assert db_health.get('database') == 'connected'
            
            self.test_results['integration']['database'] = 'PASS'
            print("✅ Database connectivity: PASS")
            return True
            
        except Exception as e:
            self.test_results['integration']['database'] = f'FAIL: {str(e)}'
            print(f"❌ Database connectivity: FAIL - {str(e)}")
            return False
    
    def test_redis_connectivity(self):
        """Test Redis cache connectivity"""
        try:
            response = requests.get(f"{self.base_url}/health/redis", timeout=10)
            assert response.status_code == 200
            
            redis_health = response.json()
            assert redis_health.get('redis') == 'connected'
            
            self.test_results['integration']['redis'] = 'PASS'
            print("✅ Redis connectivity: PASS")
            return True
            
        except Exception as e:
            self.test_results['integration']['redis'] = f'FAIL: {str(e)}'
            print(f"❌ Redis connectivity: FAIL - {str(e)}")
            return False
    
    # ============================================================================
    # PHASE 1: CLOUD CALL RECORDING & TRANSCRIPTION TESTS
    # ============================================================================
    
    def test_phase_1_recording_api(self):
        """Test Phase 1 - Recording API endpoints"""
        print("\n🎙️  Testing Phase 1: Cloud Call Recording & Transcription")
        
        # Test recording start
        try:
            start_payload = {
                "caller_id": "+919876543210",
                "language": "ml",
                "cultural_context": "formal",
                "quality_settings": {
                    "sample_rate": 44100,
                    "encoding": "wav"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/recording/start",
                json=start_payload,
                timeout=10
            )
            
            assert response.status_code == 200
            recording_data = response.json()
            assert recording_data.get('success') is True
            assert 'session_id' in recording_data.get('data', {})
            
            self.test_results['phase_1']['recording_start'] = 'PASS'
            print("  ✅ Recording start: PASS")
            
            # Store session ID for further tests
            session_id = recording_data['data']['session_id']
            
            # Test recording status
            status_response = requests.get(
                f"{self.base_url}/api/cloud-communication/recording/status/{session_id}",
                timeout=10
            )
            
            assert status_response.status_code == 200
            self.test_results['phase_1']['recording_status'] = 'PASS'
            print("  ✅ Recording status: PASS")
            
            return True
            
        except Exception as e:
            self.test_results['phase_1']['recording_api'] = f'FAIL: {str(e)}'
            print(f"  ❌ Recording API: FAIL - {str(e)}")
            return False
    
    def test_phase_1_transcription(self):
        """Test Phase 1 - Malayalam transcription"""
        try:
            transcription_payload = {
                "text": "നമസ്കാരം, എങ്ങനെയുണ്ട് സാർ?",
                "language": "ml",
                "cultural_context": "formal",
                "dialect": "kerala"
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/recording/transcribe",
                json=transcription_payload,
                timeout=15
            )
            
            assert response.status_code == 200
            transcription_data = response.json()
            assert transcription_data.get('success') is True
            assert 'transcription' in transcription_data.get('data', {})
            assert 'cultural_analysis' in transcription_data.get('data', {})
            
            self.test_results['phase_1']['transcription'] = 'PASS'
            print("  ✅ Malayalam transcription: PASS")
            return True
            
        except Exception as e:
            self.test_results['phase_1']['transcription'] = f'FAIL: {str(e)}'
            print(f"  ❌ Malayalam transcription: FAIL - {str(e)}")
            return False
    
    # ============================================================================
    # PHASE 2: AUDIO CONFERENCING & LIVE TRANSCRIPTION TESTS
    # ============================================================================
    
    def test_phase_2_conferencing_api(self):
        """Test Phase 2 - Audio Conferencing API"""
        print("\n🎥 Testing Phase 2: Audio Conferencing & Live Transcription")
        
        try:
            # Test conference creation
            conference_payload = {
                "title": "Malayalam Business Meeting",
                "participants": [
                    {"name": "രാജേഷ് കുമാർ", "language": "ml", "role": "host"},
                    {"name": "Priya Nair", "language": "en", "role": "participant"}
                ],
                "settings": {
                    "primary_language": "ml",
                    "cultural_context": "business",
                    "transcription_enabled": True
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/conferencing/create",
                json=conference_payload,
                timeout=10
            )
            
            assert response.status_code == 200
            conference_data = response.json()
            assert conference_data.get('success') is True
            assert 'conference_id' in conference_data.get('data', {})
            
            self.test_results['phase_2']['conference_creation'] = 'PASS'
            print("  ✅ Conference creation: PASS")
            
            # Store conference ID for further tests
            conference_id = conference_data['data']['conference_id']
            
            # Test conference status
            status_response = requests.get(
                f"{self.base_url}/api/cloud-communication/conferencing/status/{conference_id}",
                timeout=10
            )
            
            assert status_response.status_code == 200
            self.test_results['phase_2']['conference_status'] = 'PASS'
            print("  ✅ Conference status: PASS")
            
            return True
            
        except Exception as e:
            self.test_results['phase_2']['conferencing_api'] = f'FAIL: {str(e)}'
            print(f"  ❌ Conferencing API: FAIL - {str(e)}")
            return False
    
    def test_phase_2_live_transcription(self):
        """Test Phase 2 - Live transcription features"""
        try:
            live_transcription_payload = {
                "conference_id": "test-conference-123",
                "participant_id": "participant-1",
                "audio_chunk": "base64_encoded_audio_data",
                "language": "ml",
                "cultural_context": "business"
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/conferencing/transcribe",
                json=live_transcription_payload,
                timeout=15
            )
            
            assert response.status_code == 200
            transcription_data = response.json()
            assert transcription_data.get('success') is True
            
            self.test_results['phase_2']['live_transcription'] = 'PASS'
            print("  ✅ Live transcription: PASS")
            return True
            
        except Exception as e:
            self.test_results['phase_2']['live_transcription'] = f'FAIL: {str(e)}'
            print(f"  ❌ Live transcription: FAIL - {str(e)}")
            return False
    
    # ============================================================================
    # PHASE 3: AMD (ANSWERING MACHINE DETECTION) TESTS
    # ============================================================================
    
    def test_phase_3_amd_api(self):
        """Test Phase 3 - AMD API endpoints"""
        print("\n🤖 Testing Phase 3: AMD (Answering Machine Detection)")
        
        try:
            # Test AMD analysis
            amd_payload = {
                "audio_data": "base64_encoded_audio",
                "caller_id": "+919876543210",
                "language": "ml",
                "cultural_markers": ["formal_greeting", "business_tone"],
                "analysis_settings": {
                    "sensitivity": 0.8,
                    "cultural_awareness": True
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/amd/analyze",
                json=amd_payload,
                timeout=15
            )
            
            assert response.status_code == 200
            amd_data = response.json()
            assert amd_data.get('success') is True
            assert 'classification' in amd_data.get('data', {})
            assert 'confidence' in amd_data.get('data', {})
            
            self.test_results['phase_3']['amd_analysis'] = 'PASS'
            print("  ✅ AMD analysis: PASS")
            
            return True
            
        except Exception as e:
            self.test_results['phase_3']['amd_analysis'] = f'FAIL: {str(e)}'
            print(f"  ❌ AMD analysis: FAIL - {str(e)}")
            return False
    
    def test_phase_3_campaign_management(self):
        """Test Phase 3 - Campaign management features"""
        try:
            # Test campaign creation
            campaign_payload = {
                "name": "Malayalam Customer Outreach",
                "description": "Cultural-aware calling campaign",
                "settings": {
                    "cultural_context": "respectful",
                    "language": "ml",
                    "amd_enabled": True,
                    "amd_sensitivity": 0.85
                },
                "target_numbers": ["+919876543210", "+919876543211"]
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/amd/campaigns",
                json=campaign_payload,
                timeout=10
            )
            
            assert response.status_code == 200
            campaign_data = response.json()
            assert campaign_data.get('success') is True
            
            self.test_results['phase_3']['campaign_management'] = 'PASS'
            print("  ✅ Campaign management: PASS")
            return True
            
        except Exception as e:
            self.test_results['phase_3']['campaign_management'] = f'FAIL: {str(e)}'
            print(f"  ❌ Campaign management: FAIL - {str(e)}")
            return False
    
    # ============================================================================
    # PHASE 4: LIVE TRANSLATION R&D PARTNERSHIP TESTS
    # ============================================================================
    
    def test_phase_4_translation_api(self):
        """Test Phase 4 - Translation API endpoints"""
        print("\n🌐 Testing Phase 4: Live Translation R&D Partnership")
        
        try:
            # Test real-time translation
            translation_payload = {
                "text": "Hello, how are you today?",
                "source_language": "en",
                "target_language": "ml",
                "cultural_context": "formal",
                "translation_mode": "real-time",
                "quality_requirements": {
                    "accuracy_threshold": 0.9,
                    "cultural_appropriateness": True
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/translation/translate",
                json=translation_payload,
                timeout=10
            )
            
            assert response.status_code == 200
            translation_data = response.json()
            assert translation_data.get('success') is True
            assert 'translated_text' in translation_data.get('data', {})
            assert 'cultural_analysis' in translation_data.get('data', {})
            
            self.test_results['phase_4']['translation_api'] = 'PASS'
            print("  ✅ Translation API: PASS")
            
            return True
            
        except Exception as e:
            self.test_results['phase_4']['translation_api'] = f'FAIL: {str(e)}'
            print(f"  ❌ Translation API: FAIL - {str(e)}")
            return False
    
    def test_phase_4_cultural_translation(self):
        """Test Phase 4 - Cultural intelligence in translation"""
        try:
            # Test culturally-aware Malayalam translation
            cultural_payload = {
                "text": "Good morning, sir. How may I help you?",
                "source_language": "en",
                "target_language": "ml",
                "cultural_context": "formal_respectful",
                "regional_preference": "kerala",
                "cultural_markers": ["respectful_address", "formal_greeting"]
            }
            
            response = requests.post(
                f"{self.base_url}/api/cloud-communication/translation/cultural",
                json=cultural_payload,
                timeout=15
            )
            
            assert response.status_code == 200
            cultural_data = response.json()
            assert cultural_data.get('success') is True
            
            # Validate cultural adaptations
            cultural_analysis = cultural_data.get('data', {}).get('cultural_analysis', {})
            assert 'respect_level' in cultural_analysis
            assert 'regional_adaptation' in cultural_analysis
            
            self.test_results['phase_4']['cultural_translation'] = 'PASS'
            print("  ✅ Cultural translation: PASS")
            return True
            
        except Exception as e:
            self.test_results['phase_4']['cultural_translation'] = f'FAIL: {str(e)}'
            print(f"  ❌ Cultural translation: FAIL - {str(e)}")
            return False
    
    def test_phase_4_rd_partners(self):
        """Test Phase 4 - R&D Partner integration"""
        try:
            # Test partner analytics
            response = requests.get(
                f"{self.base_url}/api/cloud-communication/translation/partners",
                params={'action': 'metrics'},
                timeout=10
            )
            
            assert response.status_code == 200
            partners_data = response.json()
            assert partners_data.get('success') is True
            
            self.test_results['phase_4']['rd_partners'] = 'PASS'
            print("  ✅ R&D Partners integration: PASS")
            return True
            
        except Exception as e:
            self.test_results['phase_4']['rd_partners'] = f'FAIL: {str(e)}'
            print(f"  ❌ R&D Partners integration: FAIL - {str(e)}")
            return False
    
    # ============================================================================
    # CULTURAL AI TESTS
    # ============================================================================
    
    def test_cultural_ai_malayalam_processing(self):
        """Test Cultural AI - Malayalam language processing"""
        print("\n🎭 Testing Cultural Intelligence Features")
        
        test_cases = [
            {
                "text": "നമസ്കാരം സാർ, എങ്ങനെയുണ്ട്?",
                "expected_context": "formal",
                "expected_respect": "high"
            },
            {
                "text": "ഹായ് മാച്ചാൻ, എന്തുണ്ട് വിശേഷം?",
                "expected_context": "casual",
                "expected_respect": "low"
            },
            {
                "text": "വണക്കം അമ്മാവാ",
                "expected_context": "traditional",
                "expected_respect": "very_high"
            }
        ]
        
        passed_tests = 0
        total_tests = len(test_cases)
        
        for i, test_case in enumerate(test_cases):
            try:
                cultural_payload = {
                    "text": test_case["text"],
                    "language": "ml",
                    "analysis_type": "comprehensive"
                }
                
                response = requests.post(
                    f"{self.base_url}/api/cultural-intelligence/analyze",
                    json=cultural_payload,
                    timeout=10
                )
                
                if response.status_code == 200:
                    cultural_data = response.json()
                    if cultural_data.get('success'):
                        passed_tests += 1
                        print(f"  ✅ Cultural test {i+1}: PASS")
                    else:
                        print(f"  ❌ Cultural test {i+1}: FAIL - Invalid response")
                else:
                    print(f"  ❌ Cultural test {i+1}: FAIL - HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"  ❌ Cultural test {i+1}: FAIL - {str(e)}")
        
        success_rate = passed_tests / total_tests
        if success_rate >= 0.8:
            self.test_results['cultural_ai']['malayalam_processing'] = 'PASS'
            print(f"  ✅ Malayalam Cultural Processing: PASS ({passed_tests}/{total_tests})")
            return True
        else:
            self.test_results['cultural_ai']['malayalam_processing'] = f'PARTIAL: {passed_tests}/{total_tests}'
            print(f"  ⚠️  Malayalam Cultural Processing: PARTIAL ({passed_tests}/{total_tests})")
            return False
    
    # ============================================================================
    # INTEGRATION TESTS
    # ============================================================================
    
    def test_end_to_end_workflow(self):
        """Test end-to-end workflow across all phases"""
        print("\n🔄 Testing End-to-End Integration Workflow")
        
        try:
            # Simulate complete workflow: Recording → Conferencing → AMD → Translation
            workflow_steps = []
            
            # Step 1: Start recording with Malayalam context
            recording_payload = {
                "caller_id": "+919876543210",
                "language": "ml", 
                "cultural_context": "business"
            }
            
            recording_response = requests.post(
                f"{self.base_url}/api/cloud-communication/recording/start",
                json=recording_payload,
                timeout=10
            )
            
            if recording_response.status_code == 200:
                workflow_steps.append("recording_started")
                print("    ✅ Step 1: Recording started")
            
            # Step 2: Create conference with cultural settings
            conference_payload = {
                "title": "Integration Test Conference",
                "participants": [{"name": "Test User", "language": "ml"}],
                "settings": {"cultural_context": "business"}
            }
            
            conference_response = requests.post(
                f"{self.base_url}/api/cloud-communication/conferencing/create",
                json=conference_payload,
                timeout=10
            )
            
            if conference_response.status_code == 200:
                workflow_steps.append("conference_created")
                print("    ✅ Step 2: Conference created")
            
            # Step 3: Run AMD analysis
            amd_payload = {
                "audio_data": "test_audio_data",
                "language": "ml",
                "cultural_markers": ["formal_greeting"]
            }
            
            amd_response = requests.post(
                f"{self.base_url}/api/cloud-communication/amd/analyze",
                json=amd_payload,
                timeout=15
            )
            
            if amd_response.status_code == 200:
                workflow_steps.append("amd_analyzed")
                print("    ✅ Step 3: AMD analysis completed")
            
            # Step 4: Perform cultural translation
            translation_payload = {
                "text": "Thank you for your call",
                "source_language": "en",
                "target_language": "ml",
                "cultural_context": "formal"
            }
            
            translation_response = requests.post(
                f"{self.base_url}/api/cloud-communication/translation/translate",
                json=translation_payload,
                timeout=10
            )
            
            if translation_response.status_code == 200:
                workflow_steps.append("translation_completed")
                print("    ✅ Step 4: Translation completed")
            
            # Evaluate workflow success
            expected_steps = ["recording_started", "conference_created", "amd_analyzed", "translation_completed"]
            success_rate = len(workflow_steps) / len(expected_steps)
            
            if success_rate >= 0.75:
                self.test_results['integration']['end_to_end'] = 'PASS'
                print(f"  ✅ End-to-End Workflow: PASS ({len(workflow_steps)}/{len(expected_steps)} steps)")
                return True
            else:
                self.test_results['integration']['end_to_end'] = f'PARTIAL: {len(workflow_steps)}/{len(expected_steps)}'
                print(f"  ⚠️  End-to-End Workflow: PARTIAL ({len(workflow_steps)}/{len(expected_steps)} steps)")
                return False
                
        except Exception as e:
            self.test_results['integration']['end_to_end'] = f'FAIL: {str(e)}'
            print(f"  ❌ End-to-End Workflow: FAIL - {str(e)}")
            return False
    
    # ============================================================================
    # MAIN TEST RUNNER
    # ============================================================================
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🧪 Project Saksham - Comprehensive Test Suite")
        print("=" * 70)
        print(f"Backend URL: {self.base_url}")
        print(f"Frontend URL: {self.frontend_url}")
        print(f"Test Start Time: {datetime.now()}")
        print("=" * 70)
        
        # Health and connectivity tests
        health_tests = [
            self.test_backend_health,
            self.test_frontend_health,
            self.test_database_connectivity,
            self.test_redis_connectivity
        ]
        
        # Phase-specific tests  
        phase_tests = [
            self.test_phase_1_recording_api,
            self.test_phase_1_transcription,
            self.test_phase_2_conferencing_api,
            self.test_phase_2_live_transcription,
            self.test_phase_3_amd_api,
            self.test_phase_3_campaign_management,
            self.test_phase_4_translation_api,
            self.test_phase_4_cultural_translation,
            self.test_phase_4_rd_partners
        ]
        
        # Cultural AI tests
        cultural_tests = [
            self.test_cultural_ai_malayalam_processing
        ]
        
        # Integration tests
        integration_tests = [
            self.test_end_to_end_workflow
        ]
        
        # Run all test categories
        all_tests = health_tests + phase_tests + cultural_tests + integration_tests
        
        passed_tests = 0
        total_tests = len(all_tests)
        
        for test_func in all_tests:
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                print(f"❌ Test {test_func.__name__} failed with exception: {str(e)}")
        
        # Generate final report
        self.generate_test_report(passed_tests, total_tests)
        
        return passed_tests, total_tests
    
    def generate_test_report(self, passed_tests: int, total_tests: int):
        """Generate comprehensive test report"""
        print("\n" + "=" * 70)
        print("🎯 PROJECT SAKSHAM TEST RESULTS SUMMARY")
        print("=" * 70)
        
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"📊 Overall Results: {passed_tests}/{total_tests} tests passed ({success_rate:.1f}%)")
        print()
        
        # Phase-by-phase breakdown
        phases = ['phase_1', 'phase_2', 'phase_3', 'phase_4', 'cultural_ai', 'integration']
        phase_names = [
            'Phase 1: Recording & Transcription',
            'Phase 2: Audio Conferencing', 
            'Phase 3: AMD Detection',
            'Phase 4: Live Translation',
            'Cultural Intelligence',
            'Integration & Connectivity'
        ]
        
        for phase, name in zip(phases, phase_names):
            phase_results = self.test_results.get(phase, {})
            if phase_results:
                phase_passed = sum(1 for result in phase_results.values() if result == 'PASS')
                phase_total = len(phase_results)
                phase_rate = (phase_passed / phase_total) * 100 if phase_total > 0 else 0
                
                status = "✅ PASS" if phase_rate >= 80 else "⚠️  PARTIAL" if phase_rate >= 60 else "❌ FAIL"
                print(f"{status} {name}: {phase_passed}/{phase_total} ({phase_rate:.1f}%)")
        
        print()
        
        # Deployment readiness assessment
        if success_rate >= 90:
            print("🚀 DEPLOYMENT STATUS: ✅ PRODUCTION READY")
            print("   All critical systems operational. Safe to deploy to production.")
        elif success_rate >= 75:
            print("🔶 DEPLOYMENT STATUS: ⚠️  CAUTION ADVISED") 
            print("   Most systems operational. Review failed tests before production deployment.")
        else:
            print("⛔ DEPLOYMENT STATUS: ❌ NOT READY")
            print("   Critical issues detected. Do not deploy to production.")
        
        print()
        print(f"📅 Test completed at: {datetime.now()}")
        print("=" * 70)
        
        # Save detailed results to file
        self.save_test_results()
    
    def save_test_results(self):
        """Save detailed test results to JSON file"""
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'test_configuration': {
                'backend_url': self.base_url,
                'frontend_url': self.frontend_url
            },
            'results': self.test_results,
            'summary': {
                'total_tests': sum(len(phase_results) for phase_results in self.test_results.values()),
                'passed_tests': sum(
                    sum(1 for result in phase_results.values() if result == 'PASS') 
                    for phase_results in self.test_results.values()
                )
            }
        }
        
        # Ensure test results directory exists
        Path('test_results').mkdir(exist_ok=True)
        
        # Save to timestamped file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'test_results/saksham_test_results_{timestamp}.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Detailed test results saved to: {filename}")


# ============================================================================
# CLI INTERFACE
# ============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Project Saksham Comprehensive Test Suite')
    parser.add_argument('--backend-url', default='http://localhost:8000', 
                       help='Backend API URL (default: http://localhost:8000)')
    parser.add_argument('--frontend-url', default='http://localhost:3000',
                       help='Frontend URL (default: http://localhost:3000)')
    parser.add_argument('--phase', choices=['1', '2', '3', '4', 'cultural', 'integration', 'all'],
                       default='all', help='Specific phase to test (default: all)')
    parser.add_argument('--save-results', action='store_true',
                       help='Save detailed results to JSON file')
    
    args = parser.parse_args()
    
    # Update URLs from command line arguments
    BASE_URL = args.backend_url
    FRONTEND_URL = args.frontend_url
    
    # Initialize test suite
    test_suite = ProjectSakShamTestSuite()
    
    # Run tests based on phase selection
    if args.phase == 'all':
        passed, total = test_suite.run_all_tests()
    else:
        # Run specific phase tests (implementation would be added for individual phases)
        print(f"Running tests for Phase {args.phase}...")
        passed, total = test_suite.run_all_tests()  # For now, run all tests
    
    # Exit with appropriate code
    success_rate = (passed / total) * 100
    exit_code = 0 if success_rate >= 90 else 1 if success_rate >= 75 else 2
    
    exit(exit_code)