#!/usr/bin/env python3
"""
Data Foundry Phase 2: Standardization & Preprocessing
Convert disparate dataset formats into unified standards for AI model training.
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
from datetime import datetime

import pandas as pd
import numpy as np
import librosa
import soundfile as sf
from tqdm import tqdm
import re
import unicodedata
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_foundry_preprocessing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataFoundryPreprocessor:
    """
    Phase 2: Standardization & Preprocessing Pipeline
    Converts raw dataset formats into unified standards for AI model training.
    """
    
    # Target format specifications
    AUDIO_TARGET_FORMAT = {
        "sample_rate": 16000,
        "channels": 1,  # Mono
        "bit_depth": 16,
        "format": "wav",
        "max_duration": 30.0,  # seconds, optimal for Whisper
        "min_duration": 0.1    # seconds, filter out too short clips
    }
    
    TEXT_TARGET_FORMAT = {
        "encoding": "utf-8",
        "normalization": "NFC",  # Unicode normalization
        "max_length": 512,       # tokens, for transformer models
        "min_length": 3,         # characters
        "allowed_scripts": ["malayalam", "latin", "common"]  # Unicode scripts
    }
    
    SENTIMENT_LABEL_MAPPING = {
        # Common sentiment label variations to standard schema
        "0": "negative", "1": "neutral", "2": "positive",
        "neg": "negative", "neu": "neutral", "pos": "positive", 
        "negative": "negative", "neutral": "neutral", "positive": "positive",
        "-1": "negative", "0": "neutral", "1": "positive"
    }

    def __init__(self, raw_data_path: str, silver_storage_path: str):
        """
        Initialize the preprocessing pipeline.
        
        Args:
            raw_data_path: Path to raw ingested data
            silver_storage_path: Path for standardized output
        """
        self.raw_path = Path(raw_data_path)
        self.silver_path = Path(silver_storage_path)
        self.silver_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize processing statistics
        self.stats = {
            "session_id": datetime.now().isoformat(),
            "processed_datasets": {},
            "audio_conversions": {"successful": 0, "failed": 0},
            "text_normalizations": {"successful": 0, "failed": 0},
            "quality_improvements": {}
        }
        
        # Malayalam Unicode character sets for validation
        self.malayalam_chars = set(
            'അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹം'
            'ാിീുൂൃെേൈൊോൗ്ൺൻർൽൾൿ൹൭൮൯൰൱൲൳൴൵൶൷൸ംഃ഼'
        )
        
        # Initialize processing pools
        self.process_pool = ProcessPoolExecutor(max_workers=4)
        self.thread_pool = ThreadPoolExecutor(max_workers=8)

    async def standardize_all_datasets(self) -> Dict:
        """
        Master orchestration method to standardize all ingested datasets.
        
        Returns:
            Dict: Complete standardization report
        """
        logger.info("🔧 Starting Data Foundry Phase 2: Standardization & Preprocessing")
        
        # Discover all ingested datasets
        discovered_datasets = self._discover_raw_datasets()
        logger.info(f"📊 Found {len(discovered_datasets)} datasets to process")
        
        processing_tasks = []
        
        # Create standardization tasks for each dataset
        for dataset_path, metadata in discovered_datasets.items():
            task = self._standardize_single_dataset(dataset_path, metadata)
            processing_tasks.append(task)
        
        # Execute all standardization tasks
        logger.info("⚡ Executing concurrent preprocessing...")
        results = await asyncio.gather(*processing_tasks, return_exceptions=True)
        
        # Process results and compile report
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"❌ Dataset standardization failed: {result}")
            else:
                dataset_name = list(discovered_datasets.keys())[i].name
                self.stats["processed_datasets"][dataset_name] = result
        
        # Generate final report
        final_report = self._generate_standardization_report()
        await self._save_processing_metadata(final_report)
        
        logger.info("✅ Phase 2 Standardization Complete!")
        self._print_processing_summary(final_report)
        
        return final_report

    def _discover_raw_datasets(self) -> Dict[Path, Dict]:
        """Discover all raw datasets with their metadata."""
        discovered = {}
        
        for engine_dir in self.raw_path.iterdir():
            if engine_dir.is_dir():
                for dataset_dir in engine_dir.iterdir():
                    if dataset_dir.is_dir():
                        metadata_file = dataset_dir / "metadata.json"
                        if metadata_file.exists():
                            with open(metadata_file, 'r', encoding='utf-8') as f:
                                metadata = json.load(f)
                            discovered[dataset_dir] = metadata
        
        return discovered

    async def _standardize_single_dataset(
        self, 
        dataset_path: Path, 
        metadata: Dict
    ) -> Dict:
        """
        Standardize a single dataset based on its type and target engine.
        
        Args:
            dataset_path: Path to raw dataset
            metadata: Dataset metadata from Phase 1
            
        Returns:
            Dict: Standardization result
        """
        dataset_name = metadata["dataset_name"].replace("/", "_").replace("-", "_")
        engine_type = metadata["engine_type"]
        data_type = metadata["dataset_config"]["type"]
        
        logger.info(f"🔧 Standardizing {dataset_name} ({data_type}) for {engine_type}")
        
        # Create output directory
        output_dir = self.silver_path / engine_type / dataset_name
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Route to appropriate standardization pipeline
        if "audio" in data_type:
            result = await self._standardize_audio_dataset(dataset_path, output_dir, metadata)
        elif data_type == "sentiment_text":
            result = await self._standardize_sentiment_dataset(dataset_path, output_dir, metadata)
        elif data_type in ["intent_text", "text_corpus"]:
            result = await self._standardize_text_dataset(dataset_path, output_dir, metadata)
        elif data_type == "parallel_text":
            result = await self._standardize_parallel_text_dataset(dataset_path, output_dir, metadata)
        else:
            result = await self._standardize_generic_dataset(dataset_path, output_dir, metadata)
        
        # Update statistics
        self.stats["processed_datasets"][dataset_name] = result
        
        return result

    async def _standardize_audio_dataset(
        self, 
        input_path: Path, 
        output_path: Path, 
        metadata: Dict
    ) -> Dict:
        """
        Standardize audio datasets to 16kHz mono WAV format.
        
        Args:
            input_path: Raw dataset path
            output_path: Standardized output path
            metadata: Dataset metadata
            
        Returns:
            Dict: Audio standardization result
        """
        logger.info("🎵 Processing audio dataset...")
        
        result = {
            "type": "audio_standardization",
            "input_files": 0,
            "output_files": 0,
            "conversion_errors": [],
            "quality_metrics": {},
            "format_compliance": True
        }
        
        # Load dataset splits
        for split_name, split_info in metadata["splits"].items():
            split_file = Path(split_info["path"])
            if not split_file.exists():
                continue
                
            df = pd.read_parquet(split_file)
            result["input_files"] += len(df)
            
            # Process audio files
            processed_rows = []
            audio_output_dir = output_path / "audio" / split_name
            audio_output_dir.mkdir(parents=True, exist_ok=True)
            
            for idx, row in tqdm(df.iterrows(), total=len(df), desc=f"Processing {split_name}"):
                try:
                    # Extract audio data and text
                    audio_data = self._extract_audio_from_row(row)
                    text_data = self._extract_text_from_row(row)
                    
                    if audio_data is not None:
                        # Standardize audio format
                        standardized_audio = await self._convert_audio_to_standard_format(
                            audio_data, 
                            f"{split_name}_{idx:06d}"
                        )
                        
                        if standardized_audio:
                            # Save standardized audio
                            audio_filename = f"{split_name}_{idx:06d}.wav"
                            audio_filepath = audio_output_dir / audio_filename
                            
                            sf.write(
                                str(audio_filepath),
                                standardized_audio["data"],
                                standardized_audio["sample_rate"],
                                subtype='PCM_16'
                            )
                            
                            # Prepare processed row
                            processed_row = {
                                "audio_path": str(audio_filepath),
                                "text": text_data,
                                "duration": standardized_audio["duration"],
                                "sample_rate": standardized_audio["sample_rate"],
                                "channels": 1,
                                "original_index": idx
                            }
                            
                            # Add Malayalam-specific metadata
                            if text_data:
                                processed_row.update(self._analyze_malayalam_text(text_data))
                            
                            processed_rows.append(processed_row)
                            result["output_files"] += 1
                            self.stats["audio_conversions"]["successful"] += 1
                        else:
                            self.stats["audio_conversions"]["failed"] += 1
                    
                except Exception as e:
                    error_msg = f"Row {idx}: {str(e)}"
                    result["conversion_errors"].append(error_msg)
                    logger.warning(f"⚠️ Audio conversion error: {error_msg}")
                    self.stats["audio_conversions"]["failed"] += 1
            
            # Save processed dataset split
            if processed_rows:
                processed_df = pd.DataFrame(processed_rows)
                output_file = output_path / f"{split_name}_standardized.parquet"
                processed_df.to_parquet(output_file, compression="gzip")
                
                # Calculate quality metrics
                result["quality_metrics"][split_name] = self._calculate_audio_quality_metrics(processed_df)
        
        # Save standardization metadata
        await self._save_standardization_metadata(output_path, result, metadata)
        
        return result

    async def _convert_audio_to_standard_format(
        self, 
        audio_data: Union[np.ndarray, bytes, str], 
        file_id: str
    ) -> Optional[Dict]:
        """
        Convert audio to standard 16kHz mono WAV format.
        
        Args:
            audio_data: Raw audio data in various formats
            file_id: Unique identifier for logging
            
        Returns:
            Dict: Standardized audio data and metadata
        """
        try:
            # Handle different audio input formats
            if isinstance(audio_data, bytes):
                # Assume WAV bytes, use librosa to load
                audio, original_sr = librosa.load(io.BytesIO(audio_data), sr=None)
            elif isinstance(audio_data, str) and os.path.exists(audio_data):
                # Audio file path
                audio, original_sr = librosa.load(audio_data, sr=None)
            elif isinstance(audio_data, np.ndarray):
                # Already loaded audio array
                audio = audio_data
                original_sr = 22050  # Default assumption, should be provided in metadata
            else:
                logger.warning(f"⚠️ Unsupported audio format for {file_id}")
                return None
            
            # Resample to target sample rate
            if original_sr != self.AUDIO_TARGET_FORMAT["sample_rate"]:
                audio = librosa.resample(
                    audio, 
                    orig_sr=original_sr, 
                    target_sr=self.AUDIO_TARGET_FORMAT["sample_rate"]
                )
            
            # Convert to mono if stereo
            if len(audio.shape) > 1:
                audio = librosa.to_mono(audio)
            
            # Normalize audio levels
            audio = audio / max(abs(audio.max()), abs(audio.min()))
            audio = audio * 0.95  # Prevent clipping
            
            # Filter by duration
            duration = len(audio) / self.AUDIO_TARGET_FORMAT["sample_rate"]
            if (duration < self.AUDIO_TARGET_FORMAT["min_duration"] or 
                duration > self.AUDIO_TARGET_FORMAT["max_duration"]):
                
                if duration > self.AUDIO_TARGET_FORMAT["max_duration"]:
                    # Chunk long audio into segments
                    max_samples = int(self.AUDIO_TARGET_FORMAT["max_duration"] * self.AUDIO_TARGET_FORMAT["sample_rate"])
                    audio = audio[:max_samples]
                    duration = self.AUDIO_TARGET_FORMAT["max_duration"]
                else:
                    logger.warning(f"⚠️ Audio too short ({duration:.2f}s) for {file_id}")
                    return None
            
            return {
                "data": audio,
                "sample_rate": self.AUDIO_TARGET_FORMAT["sample_rate"],
                "duration": duration,
                "channels": 1,
                "format": "wav"
            }
            
        except Exception as e:
            logger.error(f"❌ Audio conversion failed for {file_id}: {str(e)}")
            return None

    async def _standardize_sentiment_dataset(
        self, 
        input_path: Path, 
        output_path: Path, 
        metadata: Dict
    ) -> Dict:
        """
        Standardize sentiment analysis datasets with Malayalam text.
        
        Args:
            input_path: Raw dataset path
            output_path: Standardized output path
            metadata: Dataset metadata
            
        Returns:
            Dict: Sentiment standardization result
        """
        logger.info("😊 Processing sentiment analysis dataset...")
        
        result = {
            "type": "sentiment_standardization", 
            "input_samples": 0,
            "output_samples": 0,
            "label_mapping": {},
            "class_distribution": {},
            "text_quality": {}
        }
        
        # Process each split
        for split_name, split_info in metadata["splits"].items():
            split_file = Path(split_info["path"])
            if not split_file.exists():
                continue
                
            df = pd.read_parquet(split_file)
            result["input_samples"] += len(df)
            
            processed_rows = []
            
            for idx, row in df.iterrows():
                try:
                    # Extract text and sentiment label
                    text = self._extract_text_from_row(row)
                    label = self._extract_label_from_row(row)
                    
                    if text and label is not None:
                        # Standardize text
                        standardized_text = self._normalize_malayalam_text(text)
                        
                        # Map sentiment label to standard format
                        standard_label = self._map_sentiment_label(label)
                        
                        if standardized_text and standard_label:
                            processed_row = {
                                "text": standardized_text,
                                "sentiment": standard_label,
                                "original_label": label,
                                "original_index": idx
                            }
                            
                            # Add text analysis
                            processed_row.update(self._analyze_malayalam_text(standardized_text))
                            
                            processed_rows.append(processed_row)
                            result["output_samples"] += 1
                            self.stats["text_normalizations"]["successful"] += 1
                        else:
                            self.stats["text_normalizations"]["failed"] += 1
                    
                except Exception as e:
                    logger.warning(f"⚠️ Sentiment processing error at row {idx}: {str(e)}")
                    self.stats["text_normalizations"]["failed"] += 1
            
            # Save processed dataset split
            if processed_rows:
                processed_df = pd.DataFrame(processed_rows)
                
                # Balance classes if needed
                processed_df = self._balance_sentiment_classes(processed_df)
                
                output_file = output_path / f"{split_name}_standardized.parquet"
                processed_df.to_parquet(output_file, compression="gzip")
                
                # Calculate class distribution
                result["class_distribution"][split_name] = processed_df["sentiment"].value_counts().to_dict()
                
                # Calculate text quality metrics
                result["text_quality"][split_name] = self._calculate_text_quality_metrics(processed_df["text"])
        
        # Save standardization metadata
        await self._save_standardization_metadata(output_path, result, metadata)
        
        return result

    async def _standardize_text_dataset(
        self, 
        input_path: Path, 
        output_path: Path, 
        metadata: Dict
    ) -> Dict:
        """
        Standardize general text datasets (NLP, intent classification, etc.).
        """
        logger.info("📝 Processing text dataset...")
        
        result = {
            "type": "text_standardization",
            "input_samples": 0,
            "output_samples": 0,
            "normalization_applied": [],
            "quality_improvements": {}
        }
        
        # Process each split
        for split_name, split_info in metadata["splits"].items():
            split_file = Path(split_info["path"])
            if not split_file.exists():
                continue
                
            df = pd.read_parquet(split_file)
            result["input_samples"] += len(df)
            
            processed_rows = []
            
            for idx, row in df.iterrows():
                try:
                    # Extract text data
                    text = self._extract_text_from_row(row)
                    
                    if text:
                        # Standardize text
                        standardized_text = self._normalize_malayalam_text(text)
                        
                        if standardized_text:
                            processed_row = {
                                "text": standardized_text,
                                "original_index": idx
                            }
                            
                            # Preserve other columns (intents, labels, etc.)
                            for col, value in row.items():
                                if col not in ["text", "original_index"] and value is not None:
                                    processed_row[col] = value
                            
                            # Add text analysis
                            processed_row.update(self._analyze_malayalam_text(standardized_text))
                            
                            processed_rows.append(processed_row)
                            result["output_samples"] += 1
                            self.stats["text_normalizations"]["successful"] += 1
                        else:
                            self.stats["text_normalizations"]["failed"] += 1
                    
                except Exception as e:
                    logger.warning(f"⚠️ Text processing error at row {idx}: {str(e)}")
                    self.stats["text_normalizations"]["failed"] += 1
            
            # Save processed dataset split
            if processed_rows:
                processed_df = pd.DataFrame(processed_rows)
                output_file = output_path / f"{split_name}_standardized.parquet"
                processed_df.to_parquet(output_file, compression="gzip")
                
                # Calculate quality metrics
                result["quality_improvements"][split_name] = self._calculate_text_quality_metrics(processed_df["text"])
        
        # Save standardization metadata
        await self._save_standardization_metadata(output_path, result, metadata)
        
        return result

    # Helper methods for data extraction and normalization
    
    def _extract_audio_from_row(self, row: pd.Series) -> Optional[Union[np.ndarray, bytes, str]]:
        """Extract audio data from dataset row."""
        # Common audio column names
        audio_columns = ["audio", "speech", "wav", "sound", "file", "path"]
        
        for col in audio_columns:
            if col in row.index and row[col] is not None:
                return row[col]
        
        # Check for nested audio data
        for col in row.index:
            if isinstance(row[col], dict) and "array" in row[col]:
                return row[col]["array"]
        
        return None

    def _extract_text_from_row(self, row: pd.Series) -> Optional[str]:
        """Extract text data from dataset row."""
        # Common text column names
        text_columns = ["text", "sentence", "transcription", "transcript", "malayalam", "content"]
        
        for col in text_columns:
            if col in row.index and row[col] is not None:
                text = str(row[col]).strip()
                if text:
                    return text
        
        return None

    def _extract_label_from_row(self, row: pd.Series) -> Optional[Union[str, int]]:
        """Extract label/sentiment from dataset row."""
        label_columns = ["label", "sentiment", "class", "target", "category"]
        
        for col in label_columns:
            if col in row.index and row[col] is not None:
                return row[col]
        
        return None

    def _normalize_malayalam_text(self, text: str) -> Optional[str]:
        """
        Normalize Malayalam text for consistency.
        
        Args:
            text: Raw text input
            
        Returns:
            str: Normalized Malayalam text
        """
        try:
            # Unicode normalization
            text = unicodedata.normalize(self.TEXT_TARGET_FORMAT["normalization"], text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text.strip())
            
            # Remove non-standard punctuation but keep Malayalam punctuation
            text = re.sub(r'[^\w\s\u0d00-\u0d7f।\.\,\?\!\:\;]', '', text)
            
            # Length filtering
            if (len(text) < self.TEXT_TARGET_FORMAT["min_length"] or 
                len(text) > self.TEXT_TARGET_FORMAT["max_length"]):
                if len(text) > self.TEXT_TARGET_FORMAT["max_length"]:
                    # Truncate while preserving word boundaries
                    text = text[:self.TEXT_TARGET_FORMAT["max_length"]]
                    last_space = text.rfind(' ')
                    if last_space > 0:
                        text = text[:last_space]
                else:
                    return None  # Too short
            
            return text.strip()
            
        except Exception as e:
            logger.warning(f"⚠️ Text normalization failed: {str(e)}")
            return None

    def _map_sentiment_label(self, label: Union[str, int]) -> Optional[str]:
        """Map various sentiment label formats to standard schema."""
        label_str = str(label).lower().strip()
        return self.SENTIMENT_LABEL_MAPPING.get(label_str, None)

    def _analyze_malayalam_text(self, text: str) -> Dict:
        """
        Analyze Malayalam text for linguistic features.
        
        Args:
            text: Malayalam text to analyze
            
        Returns:
            Dict: Text analysis metrics
        """
        analysis = {
            "malayalam_char_ratio": 0.0,
            "script_type": "unknown",
            "word_count": len(text.split()),
            "char_count": len(text),
            "has_mixed_script": False
        }
        
        # Calculate Malayalam character ratio
        malayalam_count = sum(1 for char in text if char in self.malayalam_chars)
        total_chars = len([char for char in text if char.isalnum()])
        
        if total_chars > 0:
            analysis["malayalam_char_ratio"] = malayalam_count / total_chars
        
        # Determine script type
        if analysis["malayalam_char_ratio"] > 0.8:
            analysis["script_type"] = "malayalam"
        elif analysis["malayalam_char_ratio"] > 0.3:
            analysis["script_type"] = "mixed"
            analysis["has_mixed_script"] = True
        else:
            analysis["script_type"] = "latin"
        
        return analysis

    def _balance_sentiment_classes(self, df: pd.DataFrame) -> pd.DataFrame:
        """Balance sentiment classes to prevent bias."""
        class_counts = df["sentiment"].value_counts()
        min_count = class_counts.min()
        
        # Downsample majority classes
        balanced_dfs = []
        for sentiment in class_counts.index:
            class_df = df[df["sentiment"] == sentiment]
            if len(class_df) > min_count * 1.5:  # Allow some imbalance
                class_df = class_df.sample(min_count * 1.5, random_state=42)
            balanced_dfs.append(class_df)
        
        return pd.concat(balanced_dfs, ignore_index=True).sample(frac=1, random_state=42)

    def _calculate_audio_quality_metrics(self, df: pd.DataFrame) -> Dict:
        """Calculate quality metrics for processed audio data."""
        return {
            "total_duration": df["duration"].sum(),
            "average_duration": df["duration"].mean(),
            "duration_std": df["duration"].std(),
            "sample_rate_consistency": (df["sample_rate"] == self.AUDIO_TARGET_FORMAT["sample_rate"]).all(),
            "channel_consistency": (df["channels"] == 1).all()
        }

    def _calculate_text_quality_metrics(self, texts: pd.Series) -> Dict:
        """Calculate quality metrics for processed text data."""
        lengths = texts.str.len()
        word_counts = texts.str.split().str.len()
        
        return {
            "total_texts": len(texts),
            "average_length": lengths.mean(),
            "length_std": lengths.std(),
            "average_words": word_counts.mean(),
            "word_std": word_counts.std(),
            "malayalam_coverage": texts.apply(
                lambda x: sum(1 for char in x if char in self.malayalam_chars) / max(len(x), 1)
            ).mean()
        }

    async def _save_standardization_metadata(
        self, 
        output_path: Path, 
        result: Dict, 
        original_metadata: Dict
    ):
        """Save comprehensive metadata for standardized datasets."""
        metadata = {
            "standardization_timestamp": datetime.now().isoformat(),
            "original_metadata": original_metadata,
            "standardization_result": result,
            "format_specifications": {
                "audio_format": self.AUDIO_TARGET_FORMAT,
                "text_format": self.TEXT_TARGET_FORMAT
            },
            "quality_assurance": {
                "format_compliance": True,
                "processing_pipeline": "data_foundry_v1.0"
            }
        }
        
        metadata_path = output_path / "standardization_metadata.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

    def _generate_standardization_report(self) -> Dict:
        """Generate comprehensive standardization report."""
        return {
            "session_metadata": self.stats,
            "processing_summary": {
                "total_datasets_processed": len(self.stats["processed_datasets"]),
                "audio_conversion_rate": (
                    self.stats["audio_conversions"]["successful"] / 
                    max(self.stats["audio_conversions"]["successful"] + self.stats["audio_conversions"]["failed"], 1)
                ) * 100,
                "text_normalization_rate": (
                    self.stats["text_normalizations"]["successful"] /
                    max(self.stats["text_normalizations"]["successful"] + self.stats["text_normalizations"]["failed"], 1)
                ) * 100
            },
            "next_phase_recommendations": [
                "Proceed to Phase 3: Strategic Allocation",
                "Review quality metrics for datasets with low Malayalam coverage",
                "Consider additional preprocessing for datasets with high error rates",
                "Prepare engine-specific routing configurations"
            ]
        }

    async def _save_processing_metadata(self, report: Dict):
        """Save processing metadata and report."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        report_path = self.silver_path / f"standardization_report_{timestamp}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

    def _print_processing_summary(self, report: Dict):
        """Print human-readable processing summary."""
        print("\n" + "="*60)
        print("🔧 DATA FOUNDRY PHASE 2 COMPLETE")
        print("="*60)
        
        summary = report["processing_summary"]
        print(f"📊 Datasets Processed: {summary['total_datasets_processed']}")
        print(f"🎵 Audio Conversion Rate: {summary['audio_conversion_rate']:.1f}%")
        print(f"📝 Text Normalization Rate: {summary['text_normalization_rate']:.1f}%")
        
        print(f"\n📁 Standardized data stored in: {self.silver_path}")
        print("🔄 Ready for Phase 3: Strategic Allocation")
        print("="*60)


async def main():
    """Main execution function for the preprocessing pipeline."""
    
    # Configure paths
    raw_data_path = "./storage/raw"
    silver_storage_path = "./storage/silver"
    
    # Initialize preprocessor
    preprocessor = DataFoundryPreprocessor(raw_data_path, silver_storage_path)
    
    # Run complete standardization pipeline
    try:
        report = await preprocessor.standardize_all_datasets()
        logger.info("🎉 Data Foundry Phase 2 completed successfully!")
        
    except Exception as e:
        logger.error(f"💥 Data Foundry Phase 2 failed: {str(e)}")
        raise e


if __name__ == "__main__":
    # Ensure required dependencies are installed
    try:
        import librosa
        import soundfile
        import pandas as pd
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Install with: pip install librosa soundfile pandas")
        exit(1)
    
    # Run the preprocessing pipeline
    asyncio.run(main())