"""
IndicF5 TTS Connector

Connects to AI4Bharat's IndicF5 model for high-quality Malayalam text-to-speech.
Supports zero-shot voice cloning with reference audio for 14 Kerala dialects.
Designed as a FALLBACK to Google Cloud TTS with automatic CPU/GPU detection.

Repository: https://github.com/AI4Bharat/IndicF5
Model: ai4bharat/IndicF5 on Hugging Face
"""

import logging
import base64
import asyncio
import os
import tempfile
from typing import Dict, Any, Optional, List
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

logger = logging.getLogger(__name__)


class IndicF5Connector:
    """
    Connector for AI4Bharat's IndicF5 TTS model.
    
    Features:
    - Near-human quality Malayalam TTS
    - Zero-shot voice cloning with reference audio
    - Support for all 14 Kerala dialects
    - Automatic CPU/GPU device selection
    - Fallback mode for environments without CUDA
    """
    
    # Supported languages by IndicF5
    SUPPORTED_LANGUAGES = ['ml', 'ta', 'te', 'kn', 'hi', 'bn', 'gu', 'mr', 'or', 'pa', 'as']
    
    # Kerala dialect mappings
    KERALA_DIALECTS = {
        'thiruvananthapuram': 'Thiruvananthapuram',
        'kollam': 'Kollam',
        'pathanamthitta': 'Pathanamthitta',
        'alappuzha': 'Alappuzha',
        'kottayam': 'Kottayam',
        'idukki': 'Idukki',
        'ernakulam': 'Ernakulam',
        'thrissur': 'Thrissur',
        'palakkad': 'Palakkad',
        'malappuram': 'Malappuram',
        'kozhikode': 'Kozhikode',
        'wayanad': 'Wayanad',
        'kannur': 'Kannur',
        'kasaragod': 'Kasaragod',
        # Dialect region aliases
        'travancore': 'Thiruvananthapuram',
        'malabar': 'Kozhikode',
        'cochin': 'Ernakulam',
        'central_kerala': 'Ernakulam'
    }
    
    # Default reference text (Malayalam greeting)
    DEFAULT_REF_TEXT = "നമസ്കാരം, എന്റെ പേര് മലയാളം ആണ്. ഞാൻ കേരളത്തിൽ നിന്നാണ്."
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize IndicF5 connector.
        
        Args:
            config: Configuration dictionary with keys:
                - enabled: Whether IndicF5 is enabled (default: True)
                - device: 'cuda', 'cpu', or 'auto' (default: 'auto')
                - reference_audio_dir: Path to reference audio files
                - cache_dir: Path for model cache
                - sample_rate: Output sample rate (default: 24000)
        """
        self.enabled = config.get('enabled', True)
        self.device_preference = config.get('device', 'auto')
        self.reference_audio_dir = config.get(
            'reference_audio_dir', 
            'models/reference_audios'
        )
        self.cache_dir = config.get('cache_dir', './models/indicf5_cache')
        self.sample_rate = config.get('sample_rate', 24000)
        
        # State
        self.model = None
        self.device = None
        self.initialized = False
        self.reference_audios: Dict[str, str] = {}
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # Performance tracking
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.total_processing_time_ms = 0
    
    async def initialize(self) -> bool:
        """
        Initialize the IndicF5 model and load reference audios.
        
        Returns:
            True if initialization successful, False otherwise
        """
        if not self.enabled:
            logger.info("IndicF5 connector is disabled")
            return False
        
        try:
            # Detect available device
            self.device = self._detect_device()
            logger.info(f"IndicF5 will use device: {self.device}")
            
            # Load model in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            success = await loop.run_in_executor(
                self.executor,
                self._load_model
            )
            
            if success:
                # Load reference audios
                self._load_reference_audios()
                self.initialized = True
                logger.info("IndicF5 connector initialized successfully")
                return True
            else:
                logger.warning("IndicF5 model loading failed, connector will be disabled")
                return False
                
        except Exception as e:
            logger.error(f"Failed to initialize IndicF5 connector: {e}")
            self.initialized = False
            return False
    
    def _detect_device(self) -> str:
        """Detect best available device for inference"""
        if self.device_preference == 'cpu':
            return 'cpu'
        
        try:
            import torch
            if torch.cuda.is_available():
                if self.device_preference == 'cuda' or self.device_preference == 'auto':
                    return 'cuda'
            return 'cpu'
        except ImportError:
            logger.warning("PyTorch not installed, using CPU")
            return 'cpu'
    
    def _load_model(self) -> bool:
        """Load IndicF5 model from Hugging Face (synchronous)"""
        try:
            from transformers import AutoModel
            
            logger.info("Loading IndicF5 model from Hugging Face...")
            self.model = AutoModel.from_pretrained(
                "ai4bharat/IndicF5",
                trust_remote_code=True,
                cache_dir=self.cache_dir
            )
            
            # Move to device if CUDA available
            if self.device == 'cuda':
                import torch
                self.model = self.model.to('cuda')
            
            logger.info("IndicF5 model loaded successfully")
            return True
            
        except ImportError as e:
            logger.error(f"Missing dependencies for IndicF5: {e}")
            logger.info("Install with: pip install transformers torch torchaudio soundfile")
            return False
        except Exception as e:
            logger.error(f"Failed to load IndicF5 model: {e}")
            return False
    
    def _load_reference_audios(self) -> None:
        """Load reference audio paths for each dialect"""
        ref_dir = Path(self.reference_audio_dir)
        
        if not ref_dir.exists():
            logger.warning(f"Reference audio directory not found: {ref_dir}")
            logger.info("Creating reference audio directory structure...")
            ref_dir.mkdir(parents=True, exist_ok=True)
            return
        
        for dialect_key, dialect_name in self.KERALA_DIALECTS.items():
            # Look for audio file with dialect name
            possible_files = [
                ref_dir / f"{dialect_key}.wav",
                ref_dir / f"{dialect_name.lower()}.wav",
                ref_dir / f"{dialect_key}.mp3",
            ]
            
            for audio_file in possible_files:
                if audio_file.exists():
                    self.reference_audios[dialect_key] = str(audio_file)
                    logger.debug(f"Loaded reference audio for {dialect_key}: {audio_file}")
                    break
        
        logger.info(f"Loaded {len(self.reference_audios)} reference audio files")
    
    async def synthesize(
        self,
        text: str,
        language: str = 'ml',
        dialect: Optional[str] = None,
        voice_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Synthesize text to speech using IndicF5.
        
        Args:
            text: Text to synthesize (Malayalam script or other supported language)
            language: Language code (default: 'ml' for Malayalam)
            dialect: Kerala dialect for voice selection (e.g., 'ernakulam', 'malabar')
            voice_config: Optional voice configuration overrides
            
        Returns:
            Dictionary with:
                - audio_data: Base64 encoded WAV audio
                - sample_rate: Audio sample rate (24000)
                - language: Language code
                - dialect: Dialect used
                - processing_time_ms: Processing time
                - provider: 'indicf5'
        """
        if not self.initialized or not self.model:
            raise RuntimeError("IndicF5 connector not initialized")
        
        if language not in self.SUPPORTED_LANGUAGES:
            raise ValueError(f"Language {language} not supported. Supported: {self.SUPPORTED_LANGUAGES}")
        
        start_time = datetime.now()
        self.total_requests += 1
        
        try:
            # Normalize dialect
            dialect_key = (dialect or 'ernakulam').lower().replace(' ', '_')
            if dialect_key not in self.KERALA_DIALECTS:
                dialect_key = 'ernakulam'  # Default to Ernakulam/Central Kerala
            
            # Get reference audio path
            ref_audio_path = self.reference_audios.get(dialect_key)
            ref_text = voice_config.get('ref_text', self.DEFAULT_REF_TEXT) if voice_config else self.DEFAULT_REF_TEXT
            
            # Run synthesis in thread pool
            loop = asyncio.get_event_loop()
            audio_data = await loop.run_in_executor(
                self.executor,
                self._synthesize_sync,
                text,
                ref_audio_path,
                ref_text
            )
            
            processing_time_ms = (datetime.now() - start_time).total_seconds() * 1000
            self.successful_requests += 1
            self.total_processing_time_ms += processing_time_ms
            
            return {
                'provider': 'indicf5',
                'model': 'ai4bharat/IndicF5',
                'audio_data': audio_data,
                'audio_format': 'wav',
                'sample_rate': self.sample_rate,
                'language': language,
                'dialect': dialect_key,
                'processing_time_ms': processing_time_ms,
                'success': True
            }
            
        except Exception as e:
            self.failed_requests += 1
            logger.error(f"IndicF5 synthesis failed: {e}")
            raise
    
    def _synthesize_sync(
        self,
        text: str,
        ref_audio_path: Optional[str],
        ref_text: str
    ) -> str:
        """Synchronous synthesis method for thread pool execution"""
        try:
            import numpy as np
            import soundfile as sf
            
            # Generate audio using IndicF5
            if ref_audio_path and os.path.exists(ref_audio_path):
                audio = self.model(
                    text,
                    ref_audio_path=ref_audio_path,
                    ref_text=ref_text
                )
            else:
                # Use default voice (no voice cloning)
                audio = self.model(text)
            
            # Normalize audio
            if audio.dtype == np.int16:
                audio = audio.astype(np.float32) / 32768.0
            
            # Save to temporary file and encode
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
            
            sf.write(temp_path, audio, samplerate=self.sample_rate)
            
            with open(temp_path, 'rb') as f:
                audio_bytes = f.read()
            
            os.unlink(temp_path)
            
            return base64.b64encode(audio_bytes).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Sync synthesis failed: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform health check on IndicF5 connector.
        
        Returns:
            Health status dictionary
        """
        try:
            status = 'healthy' if self.initialized and self.model else 'unhealthy'
            
            avg_processing_time = (
                self.total_processing_time_ms / self.successful_requests
                if self.successful_requests > 0 else 0
            )
            
            return {
                'provider': 'indicf5',
                'status': status,
                'enabled': self.enabled,
                'initialized': self.initialized,
                'device': self.device or 'not set',
                'reference_audios_loaded': len(self.reference_audios),
                'supported_dialects': list(self.KERALA_DIALECTS.keys()),
                'statistics': {
                    'total_requests': self.total_requests,
                    'successful_requests': self.successful_requests,
                    'failed_requests': self.failed_requests,
                    'avg_processing_time_ms': round(avg_processing_time, 2)
                },
                'last_check': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'provider': 'indicf5',
                'status': 'error',
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }
    
    async def close(self) -> None:
        """Clean up resources"""
        if self.executor:
            self.executor.shutdown(wait=False)
        
        if self.model:
            del self.model
            self.model = None
        
        self.initialized = False
        logger.info("IndicF5 connector closed")
    
    def get_supported_dialects(self) -> List[str]:
        """Get list of supported Kerala dialects"""
        return list(self.KERALA_DIALECTS.keys())
    
    def has_reference_audio(self, dialect: str) -> bool:
        """Check if reference audio exists for a dialect"""
        dialect_key = dialect.lower().replace(' ', '_')
        return dialect_key in self.reference_audios
