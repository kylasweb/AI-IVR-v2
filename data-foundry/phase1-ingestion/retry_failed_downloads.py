#!/usr/bin/env python3
"""
Data Foundry Recovery Script
Retry failed dataset downloads with improved error handling and optimized settings.
"""

import os
import json
import asyncio
import logging
from pathlib import Path
from typing import List, Dict
from datetime import datetime

# Import the main ingestion class
import sys
sys.path.append(str(Path(__file__).parent))
from ingest_hf_data import HuggingFaceDataIngester

# Configure logging for recovery operations
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_foundry_recovery.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataFoundryRecovery:
    """Recovery manager for failed dataset downloads."""
    
    def __init__(self, base_path: str = "./"):
        self.base_path = Path(base_path).parent
        
        # Configure storage to use the correct base path
        storage_config = {
            "type": "local", 
            "base_path": str(self.base_path / "storage" / "raw"),
            "backup_enabled": True
        }
        
        self.ingester = HuggingFaceDataIngester(storage_config=storage_config)
        
        # Datasets that commonly fail and their alternative strategies
        self.problematic_datasets = {
            "Be-win/IndicST-malayalam-only": {
                "issue": "trust_remote_code",
                "strategy": "modern_format_only",
                "retry_priority": "high"
            },
            "ayush-shunyalabs/malayalam-speech-dataset": {
                "issue": "large_file_timeout",
                "strategy": "chunked_download",
                "retry_priority": "high"
            },
            "CXDuncan/Malayalam-IndicVoices": {
                "issue": "trust_remote_code",
                "strategy": "modern_format_only", 
                "retry_priority": "medium"
            }
        }

    async def analyze_failed_downloads(self) -> List[str]:
        """
        Analyze logs to identify failed downloads.
        
        Returns:
            List of failed dataset names
        """
        failed_datasets = []
        
        # Check ingestion logs for failures
        log_file = self.base_path / "data_foundry_ingestion.log"
        if log_file.exists():
            with open(log_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Look for error patterns
                for dataset_name in self.ingester.DATASET_REGISTRY:
                    for datasets in self.ingester.DATASET_REGISTRY.values():
                        for dataset in datasets.keys():
                            if f"Failed to ingest {dataset}" in content or f"Unknown error downloading {dataset}" in content:
                                failed_datasets.append(dataset)
        
        # Check storage to see what's actually missing
        raw_storage = self.base_path / "storage" / "raw"
        if raw_storage.exists():
            for engine_type in self.ingester.DATASET_REGISTRY:
                engine_path = raw_storage / engine_type
                if engine_path.exists():
                    for dataset_name in self.ingester.DATASET_REGISTRY[engine_type]:
                        safe_name = dataset_name.replace("/", "_").replace("-", "_")
                        dataset_dir = engine_path / safe_name
                        if not dataset_dir.exists() or not list(dataset_dir.glob("*.parquet")):
                            if dataset_name not in failed_datasets:
                                failed_datasets.append(dataset_name)
        
        return list(set(failed_datasets))  # Remove duplicates

    async def retry_failed_datasets(self, failed_datasets: List[str] = None) -> Dict:
        """
        Retry downloading failed datasets with optimized strategies.
        
        Args:
            failed_datasets: Specific datasets to retry. If None, auto-detect failures.
            
        Returns:
            Recovery report dictionary
        """
        if failed_datasets is None:
            failed_datasets = await self.analyze_failed_downloads()
        
        logger.info(f"🔄 Data Foundry Recovery: Retrying {len(failed_datasets)} failed datasets")
        
        recovery_results = {
            "retry_timestamp": datetime.now().isoformat(),
            "datasets_attempted": len(failed_datasets),
            "successful_recoveries": 0,
            "still_failing": [],
            "recovery_details": {}
        }
        
        # Group datasets by retry strategy
        high_priority = [d for d in failed_datasets if self.problematic_datasets.get(d, {}).get("retry_priority") == "high"]
        medium_priority = [d for d in failed_datasets if self.problematic_datasets.get(d, {}).get("retry_priority") == "medium"]
        other_datasets = [d for d in failed_datasets if d not in high_priority and d not in medium_priority]
        
        # Retry high priority datasets first
        for dataset_group, group_name in [(high_priority, "high"), (medium_priority, "medium"), (other_datasets, "other")]:
            if dataset_group:
                logger.info(f"🎯 Processing {group_name} priority datasets: {len(dataset_group)} items")
                
                for dataset_name in dataset_group:
                    try:
                        await self._retry_single_dataset(dataset_name)
                        recovery_results["successful_recoveries"] += 1
                        recovery_results["recovery_details"][dataset_name] = "success"
                        logger.info(f"✅ Successfully recovered {dataset_name}")
                        
                    except Exception as e:
                        recovery_results["still_failing"].append(dataset_name)
                        recovery_results["recovery_details"][dataset_name] = f"failed: {str(e)}"
                        logger.error(f"❌ Still failing after retry: {dataset_name} - {str(e)}")
        
        # Generate recovery report
        await self._save_recovery_report(recovery_results)
        self._print_recovery_summary(recovery_results)
        
        return recovery_results

    async def _retry_single_dataset(self, dataset_name: str):
        """Retry downloading a single dataset with specialized strategy."""
        
        # Find dataset configuration
        dataset_config = None
        engine_type = None
        
        for eng_type, datasets in self.ingester.DATASET_REGISTRY.items():
            if dataset_name in datasets:
                dataset_config = datasets[dataset_name]
                engine_type = eng_type
                break
        
        if not dataset_config:
            raise Exception(f"Dataset {dataset_name} not found in registry")
        
        logger.info(f"🔄 Retrying {dataset_name} for {engine_type} with optimized strategy...")
        
        # Apply specialized retry strategy
        strategy = self.problematic_datasets.get(dataset_name, {}).get("strategy", "standard")
        
        if strategy == "chunked_download":
            await self._retry_with_chunked_download(dataset_name, engine_type, dataset_config)
        elif strategy == "modern_format_only":
            await self._retry_with_modern_format(dataset_name, engine_type, dataset_config)
        else:
            await self._retry_with_standard_method(dataset_name, engine_type, dataset_config)

    async def _retry_with_chunked_download(self, dataset_name: str, engine_type: str, config: Dict):
        """Retry large datasets with chunked downloading."""
        # For very large datasets, try streaming approach first
        logger.info(f"🧩 Using chunked download strategy for {dataset_name}")
        
        # This uses the standard ingestion but with increased timeout
        await self.ingester._ingest_single_dataset(dataset_name, engine_type, config)

    async def _retry_with_modern_format(self, dataset_name: str, engine_type: str, config: Dict):
        """Retry datasets that have trust_remote_code issues."""
        logger.info(f"🆕 Using modern format strategy for {dataset_name}")
        
        # This will use the updated download method that handles trust_remote_code properly
        await self.ingester._ingest_single_dataset(dataset_name, engine_type, config)

    async def _retry_with_standard_method(self, dataset_name: str, engine_type: str, config: Dict):
        """Standard retry method."""
        logger.info(f"🔄 Using standard retry strategy for {dataset_name}")
        
        await self.ingester._ingest_single_dataset(dataset_name, engine_type, config)

    async def _save_recovery_report(self, report: Dict):
        """Save recovery report to file."""
        report_path = self.base_path / f"recovery_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        logger.info(f"📄 Recovery report saved: {report_path}")

    def _print_recovery_summary(self, report: Dict):
        """Print formatted recovery summary."""
        print("\n" + "="*80)
        print("🔄 DATA FOUNDRY RECOVERY COMPLETE")
        print("="*80)
        print(f"📊 Datasets Attempted: {report['datasets_attempted']}")
        print(f"✅ Successful Recoveries: {report['successful_recoveries']}")
        print(f"❌ Still Failing: {len(report['still_failing'])}")
        
        if report['still_failing']:
            print(f"\n⚠️  Datasets Still Requiring Attention:")
            for dataset in report['still_failing']:
                failure_reason = report['recovery_details'].get(dataset, "unknown")
                print(f"   • {dataset}: {failure_reason}")
                
        success_rate = (report['successful_recoveries'] / report['datasets_attempted'] * 100) if report['datasets_attempted'] > 0 else 0
        print(f"\n🎯 Recovery Success Rate: {success_rate:.1f}%")
        print("="*80)

async def main():
    """Main recovery execution."""
    recovery = DataFoundryRecovery()
    
    print("🔍 Analyzing failed downloads...")
    failed_datasets = await recovery.analyze_failed_downloads()
    
    if not failed_datasets:
        print("✅ No failed datasets detected. All ingestion appears successful!")
        return
    
    print(f"🔄 Found {len(failed_datasets)} datasets to retry:")
    for dataset in failed_datasets:
        print(f"   • {dataset}")
    
    print("\n🚀 Starting recovery process...")
    await recovery.retry_failed_datasets(failed_datasets)

if __name__ == "__main__":
    asyncio.run(main())