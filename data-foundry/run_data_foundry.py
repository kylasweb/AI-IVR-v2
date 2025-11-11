#!/usr/bin/env python3
"""
Data Foundry Master Orchestrator
Complete pipeline to integrate 9 Hugging Face Malayalam datasets into AI IVR training infrastructure.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from datetime import datetime
import argparse
import json

# Add phase directories to Python path
sys.path.append(str(Path(__file__).parent / "phase1-ingestion"))
sys.path.append(str(Path(__file__).parent / "phase2-preprocessing"))
sys.path.append(str(Path(__file__).parent / "phase3-allocation"))
sys.path.append(str(Path(__file__).parent / "phase4-finetuning"))

# Import phase modules
from ingest_hf_data import HuggingFaceDataIngester
from standardize_data import DataFoundryPreprocessor
from allocate_datasets import DatasetAllocator
from train_deploy_models import DataFoundryOrchestrator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_foundry_master.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataFoundryMaster:
    """
    Master orchestrator for the complete Data Foundry pipeline.
    Coordinates all phases of the Malayalam dataset integration process.
    """
    
    def __init__(self, config: dict):
        self.config = config
        self.base_path = Path(config.get("base_path", "./data-foundry"))
        
        # Initialize storage paths
        self.storage_paths = {
            "raw": self.base_path / "storage" / "raw",
            "silver": self.base_path / "storage" / "silver", 
            "gold": self.base_path / "storage" / "gold"
        }
        
        # Create directories
        for path in self.storage_paths.values():
            path.mkdir(parents=True, exist_ok=True)
        
        # Initialize pipeline statistics
        self.pipeline_stats = {
            "started_at": datetime.now().isoformat(),
            "phases_completed": [],
            "total_datasets_processed": 0,
            "total_models_trained": 0,
            "pipeline_status": "initializing"
        }

    async def run_complete_pipeline(self, phases: list = None) -> dict:
        """
        Execute the complete 4-phase Data Foundry pipeline.
        
        Args:
            phases: List of phases to run (default: all phases)
            
        Returns:
            dict: Complete pipeline execution report
        """
        if phases is None:
            phases = ["phase1", "phase2", "phase3", "phase4"]
        
        logger.info("🏭 Starting Data Foundry Master Pipeline")
        logger.info(f"📋 Phases to execute: {', '.join(phases)}")
        
        pipeline_report = {
            "execution_id": f"datafoundry_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "phases_requested": phases,
            "phase_reports": {},
            "overall_statistics": {},
            "recommendations": []
        }
        
        try:
            self.pipeline_stats["pipeline_status"] = "running"
            
            # Phase 1: Data Ingestion
            if "phase1" in phases:
                logger.info("🚀 Executing Phase 1: Automated Ingestion")
                phase1_report = await self._execute_phase1()
                pipeline_report["phase_reports"]["phase1"] = phase1_report
                self.pipeline_stats["phases_completed"].append("phase1")
            
            # Phase 2: Data Standardization
            if "phase2" in phases:
                logger.info("🔧 Executing Phase 2: Data Standardization")
                phase2_report = await self._execute_phase2()
                pipeline_report["phase_reports"]["phase2"] = phase2_report
                self.pipeline_stats["phases_completed"].append("phase2")
            
            # Phase 3: Strategic Allocation
            if "phase3" in phases:
                logger.info("🎯 Executing Phase 3: Strategic Allocation")
                phase3_report = await self._execute_phase3()
                pipeline_report["phase_reports"]["phase3"] = phase3_report
                self.pipeline_stats["phases_completed"].append("phase3")
            
            # Phase 4: Fine-tuning & Deployment
            if "phase4" in phases:
                logger.info("🚀 Executing Phase 4: Fine-tuning & Deployment")
                phase4_report = await self._execute_phase4()
                pipeline_report["phase_reports"]["phase4"] = phase4_report
                self.pipeline_stats["phases_completed"].append("phase4")
            
            # Compile overall statistics
            pipeline_report["overall_statistics"] = self._compile_overall_statistics(pipeline_report)
            
            # Generate recommendations
            pipeline_report["recommendations"] = self._generate_recommendations(pipeline_report)
            
            self.pipeline_stats["pipeline_status"] = "completed"
            self.pipeline_stats["completed_at"] = datetime.now().isoformat()
            
            # Save complete report
            await self._save_pipeline_report(pipeline_report)
            
            logger.info("✅ Data Foundry Master Pipeline Completed Successfully!")
            self._print_pipeline_summary(pipeline_report)
            
        except Exception as e:
            logger.error(f"💥 Pipeline execution failed: {str(e)}")
            self.pipeline_stats["pipeline_status"] = "failed"
            self.pipeline_stats["error"] = str(e)
            pipeline_report["error"] = str(e)
            raise e
        
        return pipeline_report

    async def _execute_phase1(self) -> dict:
        """Execute Phase 1: Automated Ingestion from Hugging Face."""
        logger.info("📥 Phase 1: Ingesting 9 Malayalam datasets from Hugging Face...")
        
        # Configure storage for Phase 1
        storage_config = {
            "type": "local",
            "base_path": str(self.storage_paths["raw"]),
            "backup_enabled": True
        }
        
        # Initialize ingester
        ingester = HuggingFaceDataIngester(storage_config=storage_config)
        
        # Execute ingestion
        ingestion_report = await ingester.ingest_all_datasets()
        
        # Update pipeline statistics
        self.pipeline_stats["total_datasets_processed"] = ingestion_report["dataset_summary"]["successfully_ingested"]
        
        logger.info(f"✅ Phase 1 Complete - {ingestion_report['dataset_summary']['successfully_ingested']} datasets ingested")
        
        return ingestion_report

    async def _execute_phase2(self) -> dict:
        """Execute Phase 2: Data Standardization and Preprocessing."""
        logger.info("🔧 Phase 2: Standardizing data formats...")
        
        # Initialize preprocessor
        preprocessor = DataFoundryPreprocessor(
            str(self.storage_paths["raw"]),
            str(self.storage_paths["silver"])
        )
        
        # Execute standardization
        standardization_report = await preprocessor.standardize_all_datasets()
        
        logger.info(f"✅ Phase 2 Complete - {standardization_report['processing_summary']['total_datasets_processed']} datasets standardized")
        
        return standardization_report

    async def _execute_phase3(self) -> dict:
        """Execute Phase 3: Strategic Allocation to AI Engines."""
        logger.info("🎯 Phase 3: Allocating datasets to AI engines...")
        
        # Initialize allocator
        allocator = DatasetAllocator(
            str(self.storage_paths["silver"]),
            str(self.storage_paths["gold"])
        )
        
        # Execute allocation
        allocation_report = await allocator.allocate_all_datasets()
        
        logger.info(f"✅ Phase 3 Complete - {allocation_report['allocation_summary']['total_datasets_allocated']} datasets allocated")
        
        return allocation_report

    async def _execute_phase4(self) -> dict:
        """Execute Phase 4: Fine-tuning and Deployment."""
        logger.info("🚀 Phase 4: Training models and deploying...")
        
        # Initialize orchestrator
        orchestrator = DataFoundryOrchestrator(str(self.base_path))
        
        # Execute training and deployment
        training_report = await orchestrator._execute_phase4_pipeline()
        
        # Update pipeline statistics
        self.pipeline_stats["total_models_trained"] = training_report.get("models_trained", 0)
        
        logger.info(f"✅ Phase 4 Complete - {training_report.get('models_trained', 0)} models in training")
        
        return training_report

    def _compile_overall_statistics(self, pipeline_report: dict) -> dict:
        """Compile overall pipeline statistics."""
        stats = {
            "pipeline_duration": self._calculate_duration(),
            "phases_completed": len(self.pipeline_stats["phases_completed"]),
            "total_datasets_processed": 0,
            "total_models_trained": 0,
            "success_rate": 0.0
        }
        
        # Aggregate statistics from phase reports
        for phase_name, phase_report in pipeline_report["phase_reports"].items():
            if phase_name == "phase1" and "dataset_summary" in phase_report:
                stats["total_datasets_processed"] = phase_report["dataset_summary"]["successfully_ingested"]
            elif phase_name == "phase4" and "models_trained" in phase_report:
                stats["total_models_trained"] = phase_report["models_trained"]
        
        # Calculate success rate
        phases_attempted = len(pipeline_report["phases_requested"])
        phases_successful = len(self.pipeline_stats["phases_completed"])
        stats["success_rate"] = (phases_successful / phases_attempted) * 100 if phases_attempted > 0 else 0
        
        return stats

    def _generate_recommendations(self, pipeline_report: dict) -> list:
        """Generate strategic recommendations based on pipeline results."""
        recommendations = []
        
        # Check Phase 1 results
        if "phase1" in pipeline_report["phase_reports"]:
            phase1 = pipeline_report["phase_reports"]["phase1"]
            success_rate = phase1.get("dataset_summary", {}).get("success_rate", 0)
            
            if success_rate < 100:
                recommendations.append(
                    "Review failed dataset ingestions - consider authentication or dataset availability issues"
                )
            else:
                recommendations.append(
                    "Excellent ingestion success rate - all target datasets successfully acquired"
                )
        
        # Check Phase 4 results
        if "phase4" in pipeline_report["phase_reports"]:
            phase4 = pipeline_report["phase_reports"]["phase4"]
            models_trained = phase4.get("models_trained", 0)
            
            if models_trained > 0:
                recommendations.extend([
                    "Monitor shadow deployments for model performance validation",
                    "Prepare production deployment approval workflows",
                    "Set up continuous monitoring for deployed models"
                ])
            else:
                recommendations.append(
                    "No models trained - ensure allocated datasets are available for Phase 4"
                )
        
        # General recommendations
        recommendations.extend([
            "Implement automated retraining pipeline for continuous improvement",
            "Set up data drift monitoring for incoming Malayalam conversations",
            "Create feedback loop from production performance to training data curation"
        ])
        
        return recommendations

    def _calculate_duration(self) -> str:
        """Calculate pipeline execution duration."""
        start_time = datetime.fromisoformat(self.pipeline_stats["started_at"])
        current_time = datetime.now()
        duration = current_time - start_time
        
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

    async def _save_pipeline_report(self, report: dict):
        """Save comprehensive pipeline report."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = self.base_path / f"pipeline_report_{timestamp}.json"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Also save a summary for quick reference
        summary_path = self.base_path / "latest_pipeline_summary.json"
        summary = {
            "execution_id": report["execution_id"],
            "completed_at": self.pipeline_stats.get("completed_at", datetime.now().isoformat()),
            "status": self.pipeline_stats["pipeline_status"],
            "phases_completed": self.pipeline_stats["phases_completed"],
            "datasets_processed": report["overall_statistics"]["total_datasets_processed"],
            "models_trained": report["overall_statistics"]["total_models_trained"],
            "success_rate": report["overall_statistics"]["success_rate"]
        }
        
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)

    def _print_pipeline_summary(self, report: dict):
        """Print comprehensive pipeline execution summary."""
        print("\n" + "="*80)
        print("🏭 DATA FOUNDRY MASTER PIPELINE COMPLETE")
        print("="*80)
        
        stats = report["overall_statistics"]
        print(f"📊 Execution ID: {report['execution_id']}")
        print(f"⏱️  Duration: {stats['pipeline_duration']}")
        print(f"✅ Success Rate: {stats['success_rate']:.1f}%")
        print(f"📦 Datasets Processed: {stats['total_datasets_processed']}")
        print(f"🤖 Models Trained: {stats['total_models_trained']}")
        
        print(f"\n🔄 Phases Completed:")
        for i, phase in enumerate(self.pipeline_stats["phases_completed"], 1):
            print(f"   {i}. {phase.upper()}")
        
        if report.get("recommendations"):
            print(f"\n💡 Strategic Recommendations:")
            for i, rec in enumerate(report["recommendations"][:5], 1):  # Show top 5
                print(f"   {i}. {rec}")
        
        print(f"\n📁 Data Storage:")
        for storage_type, path in self.storage_paths.items():
            print(f"   {storage_type.upper()}: {path}")
        
        print(f"\n📋 Full Report: {self.base_path}/pipeline_report_*.json")
        print("="*80)


def create_default_config() -> dict:
    """Create default configuration for Data Foundry pipeline."""
    return {
        "base_path": "./data-foundry",
        "huggingface": {
            "token": os.getenv("HUGGINGFACE_TOKEN"),
            "cache_dir": "./cache/huggingface"
        },
        "storage": {
            "type": "local",
            "backup_enabled": True,
            "compression": "gzip"
        },
        "training": {
            "use_wandb": False,
            "gpu_enabled": False,  # Will be detected at runtime
            "mixed_precision": True,
            "gradient_checkpointing": True
        },
        "deployment": {
            "shadow_testing": True,
            "rollback_enabled": True,
            "monitoring_enabled": True
        }
    }


async def main():
    """Main execution function with CLI argument parsing."""
    parser = argparse.ArgumentParser(description="Data Foundry Master Pipeline")
    parser.add_argument(
        "--phases", 
        nargs='+', 
        choices=["phase1", "phase2", "phase3", "phase4"],
        default=["phase1", "phase2", "phase3", "phase4"],
        help="Phases to execute"
    )
    parser.add_argument(
        "--config",
        type=str,
        help="Path to configuration file"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform a dry run without actual execution"
    )
    
    args = parser.parse_args()
    
    # Load configuration
    if args.config and Path(args.config).exists():
        with open(args.config, 'r') as f:
            config = json.load(f)
    else:
        config = create_default_config()
    
    # Dry run information
    if args.dry_run:
        print("🔍 DRY RUN MODE - No actual execution will occur")
        print(f"📋 Phases to execute: {', '.join(args.phases)}")
        print(f"📁 Base path: {config['base_path']}")
        return
    
    # Initialize and run pipeline
    try:
        master = DataFoundryMaster(config)
        
        # Execute pipeline
        report = await master.run_complete_pipeline(phases=args.phases)
        
        # Success
        logger.info("🎉 Data Foundry pipeline completed successfully!")
        return 0
        
    except Exception as e:
        logger.error(f"💥 Pipeline execution failed: {str(e)}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)