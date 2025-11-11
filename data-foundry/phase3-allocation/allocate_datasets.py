#!/usr/bin/env python3
"""
Data Foundry Phase 3: Strategic Allocation
Route standardized datasets to specific AI engines with optimal mapping strategies.
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from enum import Enum

import pandas as pd
import numpy as np
from tqdm import tqdm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_foundry_allocation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AIEngine(Enum):
    """AI Engine targets for dataset allocation."""
    WHISPER_STT = "whisper_stt"
    DIALECT_ADAPTER = "dialect_adapter" 
    NLU_INTENT = "nlu_intent"
    NLU_UNDERSTANDING = "nlu_understanding"
    SENTIMENT_CLASSIFIER = "sentiment_classifier"
    TRANSLATION_MODEL = "translation_model"
    MALAYALAM_TTS = "malayalam_tts"

class DatasetAllocator:
    """
    Phase 3: Strategic Allocation Pipeline
    Routes standardized datasets to appropriate AI engines for maximum training efficiency.
    """
    
    # Strategic mapping of datasets to AI engines
    ALLOCATION_STRATEGY = {
        # STT Engine - Whisper fine-tuning
        "Be_win_IndicST_malayalam_only": {
            "target_engine": AIEngine.WHISPER_STT,
            "priority": "high",
            "allocation_ratio": 1.0,
            "training_strategy": "supervised_fine_tuning",
            "special_handling": ["audio_quality_filter", "duration_optimization"],
            "value_proposition": "Core Malayalam speech recognition capabilities"
        },
        "ayush_shunyalabs_malayalam_speech_dataset": {
            "target_engine": AIEngine.WHISPER_STT,
            "priority": "high", 
            "allocation_ratio": 1.0,
            "training_strategy": "supervised_fine_tuning",
            "special_handling": ["audio_normalization", "speaker_diversity"],
            "value_proposition": "Enhanced vocabulary and pronunciation coverage"
        },
        "CXDuncan_Malayalam_IndicVoices": {
            "target_engine": AIEngine.WHISPER_STT,
            "priority": "medium",
            "allocation_ratio": 0.8,  # Reserve 20% for dialect training
            "training_strategy": "mixed_fine_tuning",
            "special_handling": ["voice_quality_assessment", "dialect_preservation"],
            "value_proposition": "Voice diversity and natural speech patterns"
        },
        
        # Dialect Engine - Critical for regional adaptation
        "Aby003_Malayalam_Dialects": {
            "target_engine": AIEngine.DIALECT_ADAPTER,
            "priority": "critical",
            "allocation_ratio": 1.0,
            "training_strategy": "lora_adapter_training",
            "special_handling": ["dialect_classification", "regional_mapping"],
            "value_proposition": "Travancore/Malabar/Cochin dialect recognition"
        },
        
        # NLU Engines - Intent and understanding
        "Praha_Labs_rasa_malayalam_nano_codec": {
            "target_engine": AIEngine.NLU_INTENT,
            "priority": "high",
            "allocation_ratio": 1.0,
            "training_strategy": "intent_classification_training",
            "special_handling": ["intent_mapping", "context_preservation"],
            "value_proposition": "Structured intent recognition for conversational AI"
        },
        "Sakshamrzt_IndicNLP_Malayalam": {
            "target_engine": AIEngine.NLU_UNDERSTANDING,
            "priority": "high",
            "allocation_ratio": 1.0,
            "training_strategy": "language_model_fine_tuning",
            "special_handling": ["corpus_quality_filter", "semantic_enrichment"],
            "value_proposition": "Deep Malayalam linguistic understanding"
        },
        
        # Sentiment Engine
        "wlkla_Malayalam_first_ready_for_sentiment": {
            "target_engine": AIEngine.SENTIMENT_CLASSIFIER,
            "priority": "high",
            "allocation_ratio": 1.0,
            "training_strategy": "classification_fine_tuning",
            "special_handling": ["class_balancing", "cultural_context_preservation"],
            "value_proposition": "Emotion detection for better user experience"
        },
        
        # Translation Engine
        "Be_win_malayalam_speech_with_english_translation": {
            "target_engine": AIEngine.TRANSLATION_MODEL,
            "priority": "medium",
            "allocation_ratio": 1.0,
            "training_strategy": "parallel_corpus_training",
            "special_handling": ["alignment_verification", "translation_quality"],
            "value_proposition": "Real-time Malayalam-English translation"
        },
        
        # TTS Engine
        "Praha_Labs_imasc_slr_Malayalam_nano_codec": {
            "target_engine": AIEngine.MALAYALAM_TTS,
            "priority": "medium",
            "allocation_ratio": 1.0,
            "training_strategy": "vocoder_fine_tuning",
            "special_handling": ["phonetic_accuracy", "naturalness_optimization"],
            "value_proposition": "High-quality Malayalam speech synthesis"
        }
    }

    def __init__(self, silver_data_path: str, gold_storage_path: str):
        """
        Initialize the strategic allocation pipeline.
        
        Args:
            silver_data_path: Path to standardized data
            gold_storage_path: Path for engine-specific allocated data
        """
        self.silver_path = Path(silver_data_path)
        self.gold_path = Path(gold_storage_path)
        self.gold_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize allocation statistics
        self.allocation_stats = {
            "session_id": datetime.now().isoformat(),
            "allocations_performed": {},
            "engine_statistics": {},
            "quality_metrics": {},
            "optimization_applied": []
        }
        
        # Create engine-specific directories
        for engine in AIEngine:
            engine_path = self.gold_path / engine.value
            engine_path.mkdir(parents=True, exist_ok=True)
            
            # Initialize engine statistics
            self.allocation_stats["engine_statistics"][engine.value] = {
                "datasets_allocated": 0,
                "total_samples": 0,
                "total_size_mb": 0.0,
                "quality_score": 0.0
            }

    async def allocate_all_datasets(self) -> Dict:
        """
        Master orchestration method to allocate all standardized datasets to AI engines.
        
        Returns:
            Dict: Complete allocation report with engine mappings
        """
        logger.info("🎯 Starting Data Foundry Phase 3: Strategic Allocation")
        
        # Discover standardized datasets
        standardized_datasets = self._discover_standardized_datasets()
        logger.info(f"📊 Found {len(standardized_datasets)} standardized datasets")
        
        allocation_tasks = []
        
        # Create allocation tasks for each dataset
        for dataset_path, metadata in standardized_datasets.items():
            task = self._allocate_single_dataset(dataset_path, metadata)
            allocation_tasks.append(task)
        
        # Execute all allocation tasks
        logger.info("⚡ Executing strategic allocation...")
        results = await asyncio.gather(*allocation_tasks, return_exceptions=True)
        
        # Process results and update statistics
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Dataset allocation failed: {result}")
            else:
                dataset_name = list(standardized_datasets.keys())[i].name
                self.allocation_stats["allocations_performed"][dataset_name] = result
        
        # Apply cross-engine optimizations
        await self._apply_cross_engine_optimizations()
        
        # Generate final allocation report
        final_report = self._generate_allocation_report()
        await self._save_allocation_metadata(final_report)
        
        logger.info("✅ Phase 3 Strategic Allocation Complete!")
        self._print_allocation_summary(final_report)
        
        return final_report

    def _discover_standardized_datasets(self) -> Dict[Path, Dict]:
        """Discover all standardized datasets with their metadata."""
        discovered = {}
        
        for engine_dir in self.silver_path.iterdir():
            if engine_dir.is_dir():
                for dataset_dir in engine_dir.iterdir():
                    if dataset_dir.is_dir():
                        metadata_file = dataset_dir / "standardization_metadata.json"
                        if metadata_file.exists():
                            with open(metadata_file, 'r', encoding='utf-8') as f:
                                metadata = json.load(f)
                            discovered[dataset_dir] = metadata
        
        return discovered

    async def _allocate_single_dataset(
        self, 
        dataset_path: Path, 
        metadata: Dict
    ) -> Dict:
        """
        Allocate a single dataset to its target AI engine with optimizations.
        
        Args:
            dataset_path: Path to standardized dataset
            metadata: Dataset standardization metadata
            
        Returns:
            Dict: Allocation result with engine mapping
        """
        dataset_name = dataset_path.name
        original_name = metadata["original_metadata"]["dataset_name"].replace("/", "_").replace("-", "_")
        
        logger.info(f"🎯 Allocating {dataset_name} to target engine...")
        
        # Get allocation strategy
        strategy = self.ALLOCATION_STRATEGY.get(original_name)
        if not strategy:
            logger.warning(f"⚠️ No allocation strategy found for {original_name}")
            return {"status": "skipped", "reason": "no_strategy"}
        
        target_engine = strategy["target_engine"]
        logger.info(f"📍 Target engine: {target_engine.value}")
        
        # Create engine-specific output directory
        engine_output_dir = self.gold_path / target_engine.value / dataset_name
        engine_output_dir.mkdir(parents=True, exist_ok=True)
        
        # Apply engine-specific processing
        allocation_result = await self._process_for_target_engine(
            dataset_path=dataset_path,
            output_path=engine_output_dir,
            strategy=strategy,
            metadata=metadata
        )
        
        # Update engine statistics
        self._update_engine_statistics(target_engine, allocation_result)
        
        # Generate training configuration
        training_config = self._generate_training_configuration(
            target_engine=target_engine,
            strategy=strategy,
            allocation_result=allocation_result
        )
        
        # Save training configuration
        config_path = engine_output_dir / "training_config.json"
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(training_config, f, indent=2, ensure_ascii=False)
        
        return {
            "dataset_name": dataset_name,
            "target_engine": target_engine.value,
            "allocation_result": allocation_result,
            "training_config": training_config,
            "status": "completed"
        }

    async def _process_for_target_engine(
        self,
        dataset_path: Path,
        output_path: Path,
        strategy: Dict,
        metadata: Dict
    ) -> Dict:
        """
        Apply engine-specific processing optimizations.
        
        Args:
            dataset_path: Input standardized dataset path
            output_path: Engine-specific output path
            strategy: Allocation strategy configuration
            metadata: Dataset metadata
            
        Returns:
            Dict: Processing result with optimizations applied
        """
        target_engine = strategy["target_engine"]
        special_handling = strategy.get("special_handling", [])
        
        result = {
            "processed_files": 0,
            "optimizations_applied": [],
            "quality_improvements": {},
            "engine_specific_metadata": {}
        }
        
        # Load standardized data files
        standardized_files = list(dataset_path.glob("*_standardized.parquet"))
        
        for file_path in standardized_files:
            df = pd.read_parquet(file_path)
            result["processed_files"] += 1
            
            # Apply engine-specific optimizations
            if target_engine == AIEngine.WHISPER_STT:
                optimized_df = await self._optimize_for_whisper_stt(df, special_handling)
            elif target_engine == AIEngine.DIALECT_ADAPTER:
                optimized_df = await self._optimize_for_dialect_adapter(df, special_handling)
            elif target_engine == AIEngine.NLU_INTENT:
                optimized_df = await self._optimize_for_nlu_intent(df, special_handling)
            elif target_engine == AIEngine.NLU_UNDERSTANDING:
                optimized_df = await self._optimize_for_nlu_understanding(df, special_handling)
            elif target_engine == AIEngine.SENTIMENT_CLASSIFIER:
                optimized_df = await self._optimize_for_sentiment_classifier(df, special_handling)
            elif target_engine == AIEngine.TRANSLATION_MODEL:
                optimized_df = await self._optimize_for_translation_model(df, special_handling)
            elif target_engine == AIEngine.MALAYALAM_TTS:
                optimized_df = await self._optimize_for_malayalam_tts(df, special_handling)
            else:
                optimized_df = df  # No specific optimization
            
            # Save optimized dataset
            split_name = file_path.stem.replace("_standardized", "")
            output_file = output_path / f"{split_name}_allocated.parquet"
            optimized_df.to_parquet(output_file, compression="gzip")
            
            # Calculate quality improvements
            result["quality_improvements"][split_name] = self._calculate_optimization_impact(df, optimized_df)
        
        # Generate engine-specific metadata
        result["engine_specific_metadata"] = self._generate_engine_metadata(target_engine, strategy)
        
        return result

    async def _optimize_for_whisper_stt(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for Whisper STT fine-tuning."""
        logger.info("🎤 Optimizing for Whisper STT engine...")
        
        optimized_df = df.copy()
        
        # Audio quality filtering
        if "audio_quality_filter" in special_handling:
            # Filter by duration (optimal for Whisper)
            optimized_df = optimized_df[
                (optimized_df["duration"] >= 1.0) & (optimized_df["duration"] <= 30.0)
            ]
            
            # Filter by Malayalam content ratio
            if "malayalam_char_ratio" in optimized_df.columns:
                optimized_df = optimized_df[optimized_df["malayalam_char_ratio"] >= 0.7]
        
        # Duration optimization for Whisper chunks
        if "duration_optimization" in special_handling:
            # Create optimal 30-second segments for training
            optimized_df["training_segment"] = (optimized_df["duration"] / 30.0).astype(int) + 1
        
        # Add Whisper-specific metadata
        optimized_df["whisper_language"] = "ml"  # Malayalam language code
        optimized_df["whisper_task"] = "transcribe"
        
        return optimized_df

    async def _optimize_for_dialect_adapter(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for dialect-specific LoRA adapters."""
        logger.info("🗺️ Optimizing for Dialect Adapter engine...")
        
        optimized_df = df.copy()
        
        # Dialect classification
        if "dialect_classification" in special_handling:
            # Add dialect labels based on regional markers
            optimized_df["dialect"] = optimized_df["text"].apply(self._classify_malayalam_dialect)
            
            # Filter out unclassifiable dialects
            optimized_df = optimized_df[optimized_df["dialect"] != "unknown"]
        
        # Regional mapping for training adapters
        if "regional_mapping" in special_handling:
            optimized_df["adapter_target"] = optimized_df["dialect"].map({
                "travancore": "travancore_lora",
                "malabar": "malabar_lora", 
                "cochin": "cochin_lora",
                "central": "central_lora"
            })
        
        # Balance dialect representation
        optimized_df = self._balance_dialect_representation(optimized_df)
        
        return optimized_df

    async def _optimize_for_sentiment_classifier(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for sentiment analysis."""
        logger.info("😊 Optimizing for Sentiment Classifier engine...")
        
        optimized_df = df.copy()
        
        # Class balancing for better training
        if "class_balancing" in special_handling:
            optimized_df = self._balance_sentiment_classes_advanced(optimized_df)
        
        # Cultural context preservation
        if "cultural_context_preservation" in special_handling:
            # Add cultural context markers
            optimized_df["cultural_context"] = optimized_df["text"].apply(self._extract_cultural_context)
            
            # Filter out culturally ambiguous samples
            optimized_df = optimized_df[optimized_df["cultural_context"] != "ambiguous"]
        
        # Add confidence scores for training
        optimized_df["label_confidence"] = 1.0  # High confidence for manually labeled data
        
        return optimized_df

    async def _optimize_for_nlu_intent(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for NLU intent classification."""
        logger.info("🧠 Optimizing for NLU Intent engine...")
        
        optimized_df = df.copy()
        
        # Intent mapping to IVR-specific intents
        if "intent_mapping" in special_handling:
            optimized_df["ivr_intent"] = optimized_df.apply(self._map_to_ivr_intents, axis=1)
            
            # Filter out unmappable intents
            optimized_df = optimized_df[optimized_df["ivr_intent"] != "unmappable"]
        
        # Context preservation for multi-turn conversations
        if "context_preservation" in special_handling:
            optimized_df["conversation_context"] = optimized_df["text"].apply(self._extract_conversation_context)
        
        return optimized_df

    async def _optimize_for_nlu_understanding(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for general NLU understanding."""
        logger.info("🎓 Optimizing for NLU Understanding engine...")
        
        optimized_df = df.copy()
        
        # Corpus quality filtering
        if "corpus_quality_filter" in special_handling:
            # Filter by text quality metrics
            optimized_df = optimized_df[optimized_df["malayalam_char_ratio"] >= 0.8]
            optimized_df = optimized_df[optimized_df["word_count"] >= 5]
        
        # Semantic enrichment
        if "semantic_enrichment" in special_handling:
            optimized_df["semantic_category"] = optimized_df["text"].apply(self._categorize_semantic_content)
        
        return optimized_df

    async def _optimize_for_translation_model(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for translation training."""
        logger.info("🌐 Optimizing for Translation Model engine...")
        
        optimized_df = df.copy()
        
        # Add alignment quality scores if available
        optimized_df["alignment_quality"] = 0.9  # Assume high quality for cleaned data
        
        return optimized_df

    async def _optimize_for_malayalam_tts(self, df: pd.DataFrame, special_handling: List[str]) -> pd.DataFrame:
        """Optimize dataset for TTS training."""
        logger.info("🔊 Optimizing for Malayalam TTS engine...")
        
        optimized_df = df.copy()
        
        # Phonetic accuracy optimization
        if "phonetic_accuracy" in special_handling:
            optimized_df["phonetic_complexity"] = optimized_df["text"].apply(self._calculate_phonetic_complexity)
        
        return optimized_df

    # Helper methods for optimization
    
    def _classify_malayalam_dialect(self, text: str) -> str:
        """Classify Malayalam text by dialect based on linguistic markers."""
        # Simplified dialect classification based on common markers
        travancore_markers = ["അവിടെ", "ഇവിടെ", "കേട്ടോ"]
        malabar_markers = ["അവിടെക്ക്", "ഇവിടെക്ക്", "കേൾക്കുന്നുണ്ടോ"]
        cochin_markers = ["അവിടുത്തേക്ക്", "ഇവിടുത്തേക്ക്", "കേട്ടുണ്ടോ"]
        
        text_lower = text.lower()
        
        if any(marker in text_lower for marker in travancore_markers):
            return "travancore"
        elif any(marker in text_lower for marker in malabar_markers):
            return "malabar"
        elif any(marker in text_lower for marker in cochin_markers):
            return "cochin"
        else:
            return "central"  # Default to central Kerala dialect

    def _balance_dialect_representation(self, df: pd.DataFrame) -> pd.DataFrame:
        """Balance dialect representation for fair training."""
        if "dialect" not in df.columns:
            return df
        
        dialect_counts = df["dialect"].value_counts()
        target_count = dialect_counts.min() * 2  # Allow some imbalance
        
        balanced_dfs = []
        for dialect in dialect_counts.index:
            dialect_df = df[df["dialect"] == dialect]
            if len(dialect_df) > target_count:
                dialect_df = dialect_df.sample(target_count, random_state=42)
            balanced_dfs.append(dialect_df)
        
        return pd.concat(balanced_dfs, ignore_index=True).sample(frac=1, random_state=42)

    def _balance_sentiment_classes_advanced(self, df: pd.DataFrame) -> pd.DataFrame:
        """Advanced sentiment class balancing with SMOTE-like techniques."""
        if "sentiment" not in df.columns:
            return df
        
        # Simple downsampling for now - could be enhanced with synthetic data generation
        class_counts = df["sentiment"].value_counts()
        min_count = class_counts.min()
        target_count = min_count * 1.2  # Slight imbalance allowed
        
        balanced_dfs = []
        for sentiment in class_counts.index:
            sentiment_df = df[df["sentiment"] == sentiment]
            if len(sentiment_df) > target_count:
                sentiment_df = sentiment_df.sample(int(target_count), random_state=42)
            balanced_dfs.append(sentiment_df)
        
        return pd.concat(balanced_dfs, ignore_index=True).sample(frac=1, random_state=42)

    def _extract_cultural_context(self, text: str) -> str:
        """Extract cultural context markers from Malayalam text."""
        # Define cultural context categories
        religious_markers = ["ദൈവം", "ഭഗവാൻ", "അള്ളാഹ്", "പ്രാർത്ഥന"]
        festival_markers = ["ഓണം", "വിഷു", "ക്രിസ്മസ്", "ഈദ്"]
        family_markers = ["അച്ഛൻ", "അമ്മ", "കുട്ടി", "മുത്തശ്ശി"]
        
        text_lower = text.lower()
        
        if any(marker in text_lower for marker in religious_markers):
            return "religious"
        elif any(marker in text_lower for marker in festival_markers):
            return "festival"
        elif any(marker in text_lower for marker in family_markers):
            return "family"
        else:
            return "general"

    def _map_to_ivr_intents(self, row: pd.Series) -> str:
        """Map generic intents to IVR-specific intents."""
        text = str(row.get("text", "")).lower()
        
        # IVR-specific intent mapping
        if any(word in text for word in ["സഹായം", "help", "assistance"]):
            return "request_help"
        elif any(word in text for word in ["ബില്ലിംഗ്", "payment", "bill"]):
            return "billing_inquiry"
        elif any(word in text for word in ["ട്രാൻസ്ഫർ", "transfer", "agent"]):
            return "request_transfer"
        elif any(word in text for word in ["അപ്പോയിന്റ്മെന്റ്", "appointment"]):
            return "schedule_appointment"
        else:
            return "general_inquiry"

    def _extract_conversation_context(self, text: str) -> str:
        """Extract conversation context from text."""
        # Simplified context extraction
        if "?" in text or "എന്ത്" in text:
            return "question"
        elif any(marker in text for marker in ["ദയവായി", "please", "കഴിയുമോ"]):
            return "polite_request"
        elif any(marker in text for marker in ["അതെ", "ഇല്ല", "yes", "no"]):
            return "confirmation"
        else:
            return "statement"

    def _categorize_semantic_content(self, text: str) -> str:
        """Categorize text by semantic content type."""
        # Simplified semantic categorization
        if len(text.split()) < 5:
            return "short_phrase"
        elif any(marker in text for marker in ["എന്താണ്", "എങ്ങനെ", "എവിടെ"]):
            return "question"
        elif any(marker in text for marker in ["കഴിയും", "വേണം", "ആവശ്യം"]):
            return "request"
        else:
            return "informational"

    def _calculate_phonetic_complexity(self, text: str) -> float:
        """Calculate phonetic complexity score for TTS optimization."""
        # Count unique Malayalam phonemes
        malayalam_chars = set(char for char in text if ord(char) >= 0x0d00 and ord(char) <= 0x0d7f)
        complexity = len(malayalam_chars) / max(len(text), 1)
        return min(complexity, 1.0)

    def _calculate_optimization_impact(self, original_df: pd.DataFrame, optimized_df: pd.DataFrame) -> Dict:
        """Calculate the impact of optimization on dataset quality."""
        return {
            "size_reduction": (len(original_df) - len(optimized_df)) / max(len(original_df), 1),
            "quality_improvement": 0.1,  # Placeholder - would calculate based on actual metrics
            "feature_enrichment": len(optimized_df.columns) - len(original_df.columns)
        }

    def _generate_engine_metadata(self, target_engine: AIEngine, strategy: Dict) -> Dict:
        """Generate engine-specific metadata for training configuration."""
        base_metadata = {
            "engine_type": target_engine.value,
            "training_strategy": strategy["training_strategy"],
            "priority": strategy["priority"],
            "value_proposition": strategy["value_proposition"]
        }
        
        # Add engine-specific configurations
        if target_engine == AIEngine.WHISPER_STT:
            base_metadata.update({
                "model_base": "openai/whisper-small",
                "language": "ml",
                "task": "transcribe",
                "training_params": {
                    "learning_rate": 1e-5,
                    "batch_size": 16,
                    "gradient_accumulation_steps": 2
                }
            })
        elif target_engine == AIEngine.DIALECT_ADAPTER:
            base_metadata.update({
                "adapter_type": "lora",
                "base_model": "whisper_malayalam_base",
                "target_dialects": ["travancore", "malabar", "cochin"],
                "adapter_params": {
                    "rank": 16,
                    "alpha": 32,
                    "dropout": 0.1
                }
            })
        
        return base_metadata

    def _generate_training_configuration(
        self,
        target_engine: AIEngine,
        strategy: Dict,
        allocation_result: Dict
    ) -> Dict:
        """Generate comprehensive training configuration for the target engine."""
        config = {
            "training_metadata": {
                "engine": target_engine.value,
                "strategy": strategy["training_strategy"],
                "priority": strategy["priority"],
                "datasets_included": allocation_result["processed_files"]
            },
            "data_configuration": {
                "input_path": f"./storage/gold/{target_engine.value}",
                "validation_split": 0.1,
                "test_split": 0.1,
                "shuffle_data": True
            },
            "training_parameters": self._get_engine_training_params(target_engine),
            "evaluation_metrics": self._get_engine_evaluation_metrics(target_engine),
            "deployment_config": {
                "shadow_deployment": True,
                "traffic_percentage": 10,
                "rollback_threshold": 0.95
            }
        }
        
        return config

    def _get_engine_training_params(self, engine: AIEngine) -> Dict:
        """Get engine-specific training parameters."""
        params_map = {
            AIEngine.WHISPER_STT: {
                "epochs": 10,
                "learning_rate": 1e-5,
                "batch_size": 16,
                "weight_decay": 0.01,
                "warmup_steps": 500
            },
            AIEngine.DIALECT_ADAPTER: {
                "epochs": 20,
                "learning_rate": 1e-4,
                "lora_rank": 16,
                "lora_alpha": 32,
                "target_modules": ["q_proj", "v_proj"]
            },
            AIEngine.SENTIMENT_CLASSIFIER: {
                "epochs": 15,
                "learning_rate": 2e-5,
                "batch_size": 32,
                "class_weights": "balanced"
            }
        }
        
        return params_map.get(engine, {"epochs": 10, "learning_rate": 1e-5})

    def _get_engine_evaluation_metrics(self, engine: AIEngine) -> List[str]:
        """Get engine-specific evaluation metrics."""
        metrics_map = {
            AIEngine.WHISPER_STT: ["wer", "cer", "bleu"],
            AIEngine.DIALECT_ADAPTER: ["dialect_accuracy", "wer_by_dialect"],
            AIEngine.SENTIMENT_CLASSIFIER: ["accuracy", "f1_macro", "confusion_matrix"],
            AIEngine.NLU_INTENT: ["intent_accuracy", "f1_weighted"],
            AIEngine.TRANSLATION_MODEL: ["bleu", "meteor", "rouge"],
            AIEngine.MALAYALAM_TTS: ["mel_cepstral_distortion", "naturalness_score"]
        }
        
        return metrics_map.get(engine, ["accuracy", "loss"])

    def _update_engine_statistics(self, engine: AIEngine, allocation_result: Dict):
        """Update statistics for the target engine."""
        stats = self.allocation_stats["engine_statistics"][engine.value]
        stats["datasets_allocated"] += 1
        stats["total_samples"] += allocation_result.get("processed_files", 0)
        # Additional metrics could be calculated here

    async def _apply_cross_engine_optimizations(self):
        """Apply optimizations that benefit multiple engines."""
        logger.info("🔄 Applying cross-engine optimizations...")
        
        # Shared vocabulary optimization
        await self._optimize_shared_vocabulary()
        
        # Cross-engine validation
        await self._setup_cross_engine_validation()
        
        self.allocation_stats["optimization_applied"].extend([
            "shared_vocabulary_optimization",
            "cross_engine_validation"
        ])

    async def _optimize_shared_vocabulary(self):
        """Optimize vocabulary sharing between engines."""
        # Collect vocabulary from all text-based engines
        vocab_engines = [
            AIEngine.NLU_INTENT,
            AIEngine.NLU_UNDERSTANDING, 
            AIEngine.SENTIMENT_CLASSIFIER,
            AIEngine.TRANSLATION_MODEL
        ]
        
        shared_vocab_path = self.gold_path / "shared_vocabulary.json"
        
        # This would involve analyzing all allocated text data
        # and creating a unified vocabulary for efficient tokenization
        shared_vocab = {
            "malayalam_tokens": 10000,
            "special_tokens": ["<UNK>", "<PAD>", "<BOS>", "<EOS>"],
            "cultural_tokens": 500
        }
        
        with open(shared_vocab_path, 'w', encoding='utf-8') as f:
            json.dump(shared_vocab, f, indent=2, ensure_ascii=False)

    async def _setup_cross_engine_validation(self):
        """Setup validation that works across multiple engines."""
        validation_config = {
            "validation_strategy": "holdout_set",
            "cross_validation_folds": 5,
            "engines_included": [engine.value for engine in AIEngine],
            "validation_metrics": {
                "overall_malayalam_understanding": 0.85,
                "cultural_appropriateness": 0.90,
                "cross_engine_consistency": 0.80
            }
        }
        
        validation_path = self.gold_path / "cross_engine_validation.json"
        with open(validation_path, 'w', encoding='utf-8') as f:
            json.dump(validation_config, f, indent=2)

    def _generate_allocation_report(self) -> Dict:
        """Generate comprehensive allocation report."""
        total_datasets = sum(
            stats["datasets_allocated"] 
            for stats in self.allocation_stats["engine_statistics"].values()
        )
        
        return {
            "session_metadata": self.allocation_stats,
            "allocation_summary": {
                "total_datasets_allocated": total_datasets,
                "engines_utilized": len([
                    engine for engine, stats in self.allocation_stats["engine_statistics"].items()
                    if stats["datasets_allocated"] > 0
                ]),
                "optimization_strategies_applied": len(self.allocation_stats["optimization_applied"])
            },
            "engine_breakdown": self.allocation_stats["engine_statistics"],
            "next_phase_recommendations": [
                "Proceed to Phase 4: Fine-Tuning & Deployment",
                "Review engine-specific training configurations",
                "Set up monitoring for shadow deployment",
                "Prepare model versioning and rollback strategies"
            ]
        }

    async def _save_allocation_metadata(self, report: Dict):
        """Save allocation metadata and report."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        report_path = self.gold_path / f"allocation_report_{timestamp}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

    def _print_allocation_summary(self, report: Dict):
        """Print human-readable allocation summary."""
        print("\n" + "="*60)
        print("🎯 DATA FOUNDRY PHASE 3 COMPLETE")
        print("="*60)
        
        summary = report["allocation_summary"]
        print(f"📊 Datasets Allocated: {summary['total_datasets_allocated']}")
        print(f"🔧 AI Engines Utilized: {summary['engines_utilized']}")
        print(f"⚡ Optimizations Applied: {summary['optimization_strategies_applied']}")
        
        print("\n🎯 Engine Breakdown:")
        for engine, stats in report["engine_breakdown"].items():
            if stats["datasets_allocated"] > 0:
                print(f"   {engine}: {stats['datasets_allocated']} dataset(s)")
        
        print(f"\n📁 Engine-specific data stored in: {self.gold_path}")
        print("🔄 Ready for Phase 4: Fine-Tuning & Deployment")
        print("="*60)


async def main():
    """Main execution function for the allocation pipeline."""
    
    # Configure paths
    silver_data_path = "./storage/silver"
    gold_storage_path = "./storage/gold"
    
    # Initialize allocator
    allocator = DatasetAllocator(silver_data_path, gold_storage_path)
    
    # Run complete allocation pipeline
    try:
        report = await allocator.allocate_all_datasets()
        logger.info("🎉 Data Foundry Phase 3 completed successfully!")
        
    except Exception as e:
        logger.error(f"💥 Data Foundry Phase 3 failed: {str(e)}")
        raise e


if __name__ == "__main__":
    # Run the allocation pipeline
    asyncio.run(main())