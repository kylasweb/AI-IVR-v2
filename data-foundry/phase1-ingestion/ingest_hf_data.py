#!/usr/bin/env python3
"""
Data Foundry Phase 1: Automated Ingestion
Master script to pull all 9 Malayalam datasets from Hugging Face into secure storage.
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

import pandas as pd
from datasets import load_dataset, DatasetDict
from huggingface_hub import login, HfApi
from tqdm import tqdm
import boto3
from botocore.exceptions import ClientError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_foundry_ingestion.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class HuggingFaceDataIngester:
    """
    Master ingestion pipeline for Malayalam datasets from Hugging Face.
    Implements secure download, validation, and storage orchestration.
    """
    
    # The 9 strategic datasets identified for integration
    DATASET_REGISTRY = {
        "stt_engine": {
            "Be-win/IndicST-malayalam-only": {
                "type": "audio_text_pairs",
                "target": "whisper_stt",
                "priority": "high",
                "description": "Malayalam speech-to-text training data"
            },
            "ayush-shunyalabs/malayalam-speech-dataset": {
                "type": "audio_text_pairs", 
                "target": "whisper_stt",
                "priority": "high",
                "description": "General Malayalam speech recognition"
            },
            "CXDuncan/Malayalam-IndicVoices": {
                "type": "audio_text_pairs",
                "target": "whisper_stt", 
                "priority": "medium",
                "description": "Malayalam voice samples with transcriptions"
            }
        },
        "dialect_engine": {
            "Aby003/Malayalam_Dialects": {
                "type": "audio_dialect_pairs",
                "target": "dialect_adapter",
                "priority": "critical",
                "description": "Travancore/Malabar/Cochin dialect recognition"
            }
        },
        "nlu_engine": {
            "Praha-Labs/rasa-malayalam-nano-codec": {
                "type": "intent_text",
                "target": "nlu_intent",
                "priority": "high", 
                "description": "Malayalam intent classification for Rasa"
            },
            "Sakshamrzt/IndicNLP-Malayalam": {
                "type": "text_corpus",
                "target": "nlu_understanding",
                "priority": "high",
                "description": "General Malayalam NLP corpus"
            }
        },
        "sentiment_engine": {
            "wlkla/Malayalam_first_ready_for_sentiment": {
                "type": "sentiment_text",
                "target": "sentiment_classifier",
                "priority": "high",
                "description": "Malayalam sentiment analysis training data"
            }
        },
        "translation_engine": {
            "Be-win/malayalam-speech-with-english-translation": {
                "type": "parallel_text",
                "target": "translation_model",
                "priority": "medium",
                "description": "Malayalam-English parallel corpus"
            }
        },
        "tts_engine": {
            "Praha-Labs/imasc_slr_Malayalam-nano-codec": {
                "type": "tts_corpus",
                "target": "malayalam_tts",
                "priority": "medium", 
                "description": "Malayalam TTS vocoder training"
            }
        }
    }

    def __init__(self, storage_config: Optional[Dict] = None):
        """
        Initialize the Data Foundry ingestion pipeline.
        
        Args:
            storage_config: Configuration for storage backend (S3, local, etc.)
        """
        self.storage_config = storage_config or {
            "type": "local",
            "base_path": "./storage/raw",
            "backup_enabled": True
        }
        
        # Initialize storage paths
        self.raw_storage_path = Path(self.storage_config["base_path"])
        self.raw_storage_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize metadata tracking
        self.ingestion_metadata = {
            "session_id": datetime.now().isoformat(),
            "datasets_processed": {},
            "errors": [],
            "statistics": {
                "total_datasets": 0,
                "successful_downloads": 0,
                "failed_downloads": 0,
                "total_size_gb": 0.0
            }
        }
        
        # Authentication setup
        self.hf_token = os.getenv("HUGGINGFACE_TOKEN")
        if self.hf_token:
            login(token=self.hf_token)
            logger.info("🔐 Authenticated with Hugging Face")
        
        self.api = HfApi()

    async def ingest_all_datasets(self) -> Dict:
        """
        Master orchestration method to ingest all 9 datasets.
        
        Returns:
            Dict: Complete ingestion report with statistics and metadata
        """
        logger.info("🚀 Starting Data Foundry Phase 1: Automated Ingestion")
        logger.info(f"📊 Target datasets: {sum(len(engine.keys()) for engine in self.DATASET_REGISTRY.values())}")
        
        ingestion_tasks = []
        
        # Create ingestion tasks for all datasets
        for engine_type, datasets in self.DATASET_REGISTRY.items():
            for dataset_name, config in datasets.items():
                task = self._ingest_single_dataset(
                    dataset_name=dataset_name,
                    engine_type=engine_type, 
                    config=config
                )
                ingestion_tasks.append(task)
        
        # Execute all ingestion tasks concurrently
        logger.info("⚡ Executing concurrent downloads...")
        results = await asyncio.gather(*ingestion_tasks, return_exceptions=True)
        
        # Process results and update metadata
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Dataset ingestion failed: {result}")
                self.ingestion_metadata["errors"].append(str(result))
                self.ingestion_metadata["statistics"]["failed_downloads"] += 1
            else:
                self.ingestion_metadata["statistics"]["successful_downloads"] += 1
                self.ingestion_metadata["datasets_processed"].update(result)
        
        # Generate final report
        final_report = self._generate_ingestion_report()
        await self._save_ingestion_metadata(final_report)
        
        logger.info("✅ Phase 1 Ingestion Complete!")
        self._print_summary(final_report)
        
        return final_report

    async def _ingest_single_dataset(
        self, 
        dataset_name: str, 
        engine_type: str, 
        config: Dict
    ) -> Dict:
        """
        Ingest a single dataset from Hugging Face.
        
        Args:
            dataset_name: HF dataset identifier (e.g., "Be-win/IndicST-malayalam-only")
            engine_type: Target AI engine (stt_engine, nlu_engine, etc.)
            config: Dataset configuration metadata
            
        Returns:
            Dict: Ingestion result with metadata
        """
        logger.info(f"📥 Ingesting {dataset_name} for {engine_type}...")
        
        try:
            # Create engine-specific storage directory
            engine_storage = self.raw_storage_path / engine_type
            engine_storage.mkdir(parents=True, exist_ok=True)
            
            # Load dataset from Hugging Face
            dataset = await self._download_hf_dataset(dataset_name)
            
            # Save dataset to local storage with metadata
            storage_result = await self._save_dataset_with_metadata(
                dataset=dataset,
                dataset_name=dataset_name,
                engine_type=engine_type,
                config=config,
                storage_path=engine_storage
            )
            
            logger.info(f"✅ {dataset_name} ingestion complete")
            return {dataset_name: storage_result}
            
        except Exception as e:
            logger.error(f"❌ Failed to ingest {dataset_name}: {str(e)}")
            raise e

    async def _download_hf_dataset(self, dataset_name: str) -> DatasetDict:
        """
        Download dataset from Hugging Face with error handling and modern loading standards.
        
        Args:
            dataset_name: HF dataset identifier
            
        Returns:
            DatasetDict: Downloaded dataset
        """
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Check if dataset exists and is accessible
                dataset_info = self.api.dataset_info(dataset_name)
                logger.info(f"📊 Dataset {dataset_name} size: ~{dataset_info.downloads} downloads")
                
                # Load dataset with modern parameters (no trust_remote_code)
                # Use streaming=False to download complete dataset for processing
                logger.info(f"🔄 Downloading {dataset_name} (attempt {retry_count + 1}/{max_retries})...")
                
                # Try loading without trust_remote_code first (modern standard)
                try:
                    dataset = load_dataset(
                        dataset_name,
                        streaming=False
                    )
                    logger.info(f"✅ Successfully loaded {dataset_name} using modern format")
                    return dataset
                    
                except Exception as modern_error:
                    # If modern loading fails, check if it's a trust_remote_code issue
                    if "trust_remote_code" in str(modern_error).lower():
                        logger.warning(f"⚠️ {dataset_name} requires legacy loading format")
                        # For legacy datasets, try alternative approaches
                        try:
                            # Option 1: Try to load specific subset or configuration
                            dataset = load_dataset(
                                dataset_name,
                                streaming=False,
                                verification_mode='no_checks'  # Skip verification for legacy datasets
                            )
                            logger.info(f"✅ Successfully loaded {dataset_name} using legacy compatibility")
                            return dataset
                        except Exception as legacy_error:
                            logger.error(f"❌ Cannot load {dataset_name}: {legacy_error}")
                            # Skip this dataset but don't fail the entire pipeline
                            raise Exception(f"Dataset {dataset_name} uses unsupported loading format")
                    else:
                        # Re-raise if it's not a trust_remote_code issue
                        raise modern_error
                
            except Exception as e:
                retry_count += 1
                if "timeout" in str(e).lower() or "connection" in str(e).lower():
                    if retry_count < max_retries:
                        wait_time = retry_count * 30  # Progressive backoff: 30s, 60s, 90s
                        logger.warning(f"⏳ Network timeout for {dataset_name}. Retrying in {wait_time}s...")
                        await asyncio.sleep(wait_time)
                        continue
                
                if "does not exist" in str(e).lower():
                    logger.error(f"Dataset {dataset_name} not found - may be private or moved")
                elif "authentication" in str(e).lower():
                    logger.error(f"Authentication required for {dataset_name}")
                else:
                    logger.error(f"Unknown error downloading {dataset_name}: {e}")
                
                if retry_count >= max_retries:
                    raise e

    async def _save_dataset_with_metadata(
        self,
        dataset: DatasetDict,
        dataset_name: str, 
        engine_type: str,
        config: Dict,
        storage_path: Path
    ) -> Dict:
        """
        Save dataset to storage with comprehensive metadata.
        
        Args:
            dataset: The downloaded dataset
            dataset_name: Dataset identifier
            engine_type: Target AI engine
            config: Dataset configuration
            storage_path: Local storage path
            
        Returns:
            Dict: Storage operation result
        """
        # Sanitize dataset name for filesystem
        safe_name = dataset_name.replace("/", "_").replace("-", "_")
        dataset_dir = storage_path / safe_name
        dataset_dir.mkdir(parents=True, exist_ok=True)
        
        # Calculate dataset statistics
        statistics = self._calculate_dataset_statistics(dataset)
        
        # Save dataset splits
        saved_splits = {}
        for split_name, split_data in dataset.items():
            split_path = dataset_dir / f"{split_name}.parquet"
            split_df = split_data.to_pandas()
            split_df.to_parquet(split_path, compression="gzip")
            saved_splits[split_name] = {
                "path": str(split_path),
                "rows": len(split_df),
                "columns": list(split_df.columns),
                "size_mb": split_path.stat().st_size / (1024 * 1024)
            }
        
        # Create comprehensive metadata
        metadata = {
            "dataset_name": dataset_name,
            "ingestion_timestamp": datetime.now().isoformat(),
            "engine_type": engine_type,
            "dataset_config": config,
            "storage_location": str(dataset_dir),
            "splits": saved_splits,
            "statistics": statistics,
            "data_schema": self._analyze_data_schema(dataset),
            "quality_metrics": await self._run_quality_checks(dataset),
            "preprocessing_recommendations": self._generate_preprocessing_recommendations(dataset, config)
        }
        
        # Save metadata
        metadata_path = dataset_dir / "metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        return metadata

    def _calculate_dataset_statistics(self, dataset: DatasetDict) -> Dict:
        """Calculate comprehensive statistics for the dataset."""
        total_samples = sum(len(split) for split in dataset.values())
        
        statistics = {
            "total_samples": total_samples,
            "split_distribution": {
                split_name: len(split_data) for split_name, split_data in dataset.items()
            },
            "features": {}
        }
        
        # Analyze features from first available split
        if dataset:
            first_split = next(iter(dataset.values()))
            statistics["features"] = {
                feature_name: str(feature_type) 
                for feature_name, feature_type in first_split.features.items()
            }
        
        return statistics

    def _analyze_data_schema(self, dataset: DatasetDict) -> Dict:
        """Analyze the schema structure of the dataset."""
        if not dataset:
            return {}
        
        # Get schema from first split
        first_split = next(iter(dataset.values()))
        
        schema_analysis = {
            "has_audio": any("audio" in str(feature).lower() for feature in first_split.features.keys()),
            "has_text": any("text" in str(feature).lower() for feature in first_split.features.keys()),
            "has_labels": any("label" in str(feature).lower() for feature in first_split.features.keys()),
            "column_names": list(first_split.features.keys()),
            "suspected_language_columns": [
                col for col in first_split.features.keys() 
                if any(lang in col.lower() for lang in ["malayalam", "english", "ml", "en"])
            ]
        }
        
        return schema_analysis

    async def _run_quality_checks(self, dataset: DatasetDict) -> Dict:
        """Run basic quality checks on the dataset."""
        quality_metrics = {
            "completeness_score": 0.0,
            "consistency_score": 0.0,
            "malayalam_content_ratio": 0.0,
            "issues_found": []
        }
        
        if not dataset:
            return quality_metrics
        
        # Sample data for analysis
        first_split = next(iter(dataset.values()))
        sample_size = min(100, len(first_split))
        sample_data = first_split.select(range(sample_size))
        
        # Check for Malayalam content
        malayalam_chars = set('അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹം')
        
        text_columns = [col for col in sample_data.features.keys() if 'text' in col.lower()]
        
        if text_columns:
            malayalam_samples = 0
            total_text_samples = 0
            
            for example in sample_data:
                for col in text_columns:
                    text_content = str(example.get(col, ""))
                    if text_content.strip():
                        total_text_samples += 1
                        if any(char in malayalam_chars for char in text_content):
                            malayalam_samples += 1
            
            if total_text_samples > 0:
                quality_metrics["malayalam_content_ratio"] = malayalam_samples / total_text_samples
        
        # Completeness check
        null_ratio = 0.0
        total_fields = 0
        
        for example in sample_data:
            for value in example.values():
                total_fields += 1
                if value is None or (isinstance(value, str) and not value.strip()):
                    null_ratio += 1
        
        if total_fields > 0:
            quality_metrics["completeness_score"] = 1.0 - (null_ratio / total_fields)
        
        # Flag potential issues
        if quality_metrics["malayalam_content_ratio"] < 0.5:
            quality_metrics["issues_found"].append("Low Malayalam content detected")
        
        if quality_metrics["completeness_score"] < 0.8:
            quality_metrics["issues_found"].append("Significant missing data detected")
        
        return quality_metrics

    def _generate_preprocessing_recommendations(self, dataset: DatasetDict, config: Dict) -> List[str]:
        """Generate specific preprocessing recommendations based on dataset analysis."""
        recommendations = []
        
        # Get dataset type from config
        data_type = config.get("type", "unknown")
        target = config.get("target", "unknown")
        
        if "audio" in data_type:
            recommendations.extend([
                "Convert audio to 16kHz mono WAV format",
                "Normalize audio levels to prevent clipping",
                "Remove silence segments shorter than 0.1 seconds",
                "Validate audio-text alignment quality"
            ])
        
        if "text" in data_type:
            recommendations.extend([
                "Normalize Malayalam Unicode characters",
                "Remove non-standard punctuation",
                "Split long sentences for better training",
                "Validate Malayalam script consistency"
            ])
        
        if target == "whisper_stt":
            recommendations.extend([
                "Segment audio to 30-second chunks for Whisper",
                "Ensure text transcriptions are clean and accurate"
            ])
        
        if target == "sentiment_classifier":
            recommendations.extend([
                "Map sentiment labels to standard schema",
                "Balance positive/negative/neutral classes",
                "Remove ambiguous sentiment examples"
            ])
        
        return recommendations

    def _generate_ingestion_report(self) -> Dict:
        """Generate comprehensive ingestion report."""
        return {
            "session_metadata": self.ingestion_metadata,
            "dataset_summary": {
                "total_targeted": sum(len(engine.keys()) for engine in self.DATASET_REGISTRY.values()),
                "successfully_ingested": self.ingestion_metadata["statistics"]["successful_downloads"],
                "failed_ingestions": self.ingestion_metadata["statistics"]["failed_downloads"],
                "success_rate": (
                    self.ingestion_metadata["statistics"]["successful_downloads"] / 
                    sum(len(engine.keys()) for engine in self.DATASET_REGISTRY.values()) * 100
                    if sum(len(engine.keys()) for engine in self.DATASET_REGISTRY.values()) > 0 else 0
                )
            },
            "next_phase_recommendations": [
                "Proceed to Phase 2: Data Standardization",
                "Review quality metrics for datasets with low Malayalam content",
                "Address any authentication issues for failed downloads",
                "Prepare preprocessing pipelines based on recommendations"
            ]
        }

    async def _save_ingestion_metadata(self, report: Dict):
        """Save ingestion metadata and report."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save detailed report
        report_path = self.raw_storage_path / f"ingestion_report_{timestamp}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Save summary for quick reference
        summary_path = self.raw_storage_path / "latest_ingestion_summary.json"
        summary = {
            "timestamp": timestamp,
            "success_rate": report["dataset_summary"]["success_rate"],
            "datasets_ingested": report["dataset_summary"]["successfully_ingested"],
            "status": "completed"
        }
        
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)

    def _print_summary(self, report: Dict):
        """Print human-readable ingestion summary."""
        print("\n" + "="*60)
        print("🏭 DATA FOUNDRY PHASE 1 COMPLETE")
        print("="*60)
        
        summary = report["dataset_summary"]
        print(f"📊 Target Datasets: {summary['total_targeted']}")
        print(f"✅ Successfully Ingested: {summary['successfully_ingested']}")
        print(f"❌ Failed: {summary['failed_ingestions']}")
        print(f"📈 Success Rate: {summary['success_rate']:.1f}%")
        
        if self.ingestion_metadata["errors"]:
            print(f"\n⚠️  Errors encountered:")
            for error in self.ingestion_metadata["errors"][:3]:  # Show first 3 errors
                print(f"   - {error[:100]}...")
        
        print(f"\n📁 Raw data stored in: {self.raw_storage_path}")
        print("🔄 Ready for Phase 2: Data Standardization")
        print("="*60)


async def main():
    """Main execution function for the ingestion pipeline."""
    
    # Configure storage (local by default, can be extended to S3)
    storage_config = {
        "type": "local",
        "base_path": "./storage/raw",
        "backup_enabled": True
    }
    
    # Initialize ingester
    ingester = HuggingFaceDataIngester(storage_config=storage_config)
    
    # Run complete ingestion pipeline
    try:
        report = await ingester.ingest_all_datasets()
        
        # Optional: Upload to cloud storage if configured
        # await upload_to_cloud_storage(report)
        
        logger.info("🎉 Data Foundry Phase 1 completed successfully!")
        
    except Exception as e:
        logger.error(f"💥 Data Foundry Phase 1 failed: {str(e)}")
        raise e


if __name__ == "__main__":
    # Ensure required dependencies are installed
    try:
        import datasets
        import transformers
        import pandas as pd
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Install with: pip install datasets transformers pandas pyarrow")
        exit(1)
    
    # Run the ingestion pipeline
    asyncio.run(main())