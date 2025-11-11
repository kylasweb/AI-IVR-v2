#!/usr/bin/env python3
"""
Data Foundry Phase 4: Fine-Tuning & Deployment
LoRA-based fine-tuning with CI/AI pipeline and shadow deployment for safe model updates.
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
from datetime import datetime, timedelta
from enum import Enum
import subprocess
import tempfile
import shutil

import pandas as pd
import numpy as np
import torch
from transformers import (
    AutoTokenizer, AutoModelForSpeechSeq2Seq, AutoModelForSequenceClassification,
    TrainingArguments, Trainer, EarlyStoppingCallback
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import Dataset
import wandb
from tqdm import tqdm
import yaml

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_foundry_finetuning.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DeploymentStage(Enum):
    """Model deployment stages."""
    TRAINING = "training"
    VALIDATION = "validation"
    STAGING = "staging"
    SHADOW = "shadow"
    PRODUCTION = "production"
    ROLLBACK = "rollback"

class ModelRegistry:
    """Centralized model registry for version control and deployment."""
    
    def __init__(self, registry_path: str):
        self.registry_path = Path(registry_path)
        self.registry_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize registry metadata
        self.registry_file = self.registry_path / "model_registry.json"
        self._load_or_create_registry()

    def _load_or_create_registry(self):
        """Load existing registry or create new one."""
        if self.registry_file.exists():
            with open(self.registry_file, 'r') as f:
                self.registry = json.load(f)
        else:
            self.registry = {
                "models": {},
                "deployments": {},
                "version_history": {},
                "performance_metrics": {}
            }
            self._save_registry()

    def _save_registry(self):
        """Save registry to disk."""
        with open(self.registry_file, 'w') as f:
            json.dump(self.registry, f, indent=2, ensure_ascii=False)

    def register_model(
        self, 
        model_name: str, 
        version: str, 
        model_path: str, 
        metadata: Dict
    ) -> str:
        """Register a new model version."""
        model_id = f"{model_name}:{version}"
        
        self.registry["models"][model_id] = {
            "model_name": model_name,
            "version": version,
            "model_path": model_path,
            "registration_time": datetime.now().isoformat(),
            "metadata": metadata,
            "status": "registered"
        }
        
        # Update version history
        if model_name not in self.registry["version_history"]:
            self.registry["version_history"][model_name] = []
        self.registry["version_history"][model_name].append(version)
        
        self._save_registry()
        return model_id

    def get_model_info(self, model_id: str) -> Optional[Dict]:
        """Get model information by ID."""
        return self.registry["models"].get(model_id)

    def list_models(self, model_name: Optional[str] = None) -> List[Dict]:
        """List all models or models for a specific name."""
        if model_name:
            return [
                model_info for model_info in self.registry["models"].values()
                if model_info["model_name"] == model_name
            ]
        return list(self.registry["models"].values())

class ContinuousIntegrationAI:
    """
    CI/AI Pipeline for automated model training, validation, and deployment.
    """
    
    def __init__(self, config_path: str, model_registry: ModelRegistry):
        self.config_path = Path(config_path)
        self.model_registry = model_registry
        
        # Load CI/AI configuration
        self._load_ci_config()
        
        # Initialize pipeline state
        self.pipeline_state = {
            "current_jobs": {},
            "job_history": [],
            "deployment_status": {},
            "performance_baselines": {}
        }

    def _load_ci_config(self):
        """Load CI/AI pipeline configuration."""
        config_file = self.config_path / "ci_ai_config.yaml"
        if config_file.exists():
            with open(config_file, 'r') as f:
                self.config = yaml.safe_load(f)
        else:
            # Default configuration
            self.config = {
                "training": {
                    "max_concurrent_jobs": 3,
                    "gpu_memory_limit": "8GB",
                    "training_timeout": 7200,  # 2 hours
                    "validation_threshold": 0.85
                },
                "deployment": {
                    "shadow_traffic_percentage": 10,
                    "deployment_timeout": 300,  # 5 minutes
                    "rollback_threshold": 0.95,
                    "monitoring_window": 3600   # 1 hour
                },
                "monitoring": {
                    "metrics_collection_interval": 60,
                    "alert_thresholds": {
                        "error_rate": 0.05,
                        "latency_p95": 500,  # ms
                        "memory_usage": 0.8
                    }
                }
            }
            
            # Save default config
            config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(config_file, 'w') as f:
                yaml.dump(self.config, f, indent=2)

    async def trigger_training_pipeline(self, engine_name: str, dataset_path: str) -> str:
        """Trigger automated training pipeline for an AI engine."""
        job_id = f"train_{engine_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        job_config = {
            "job_id": job_id,
            "engine_name": engine_name,
            "dataset_path": dataset_path,
            "status": "queued",
            "created_at": datetime.now().isoformat(),
            "steps": {
                "data_validation": "pending",
                "model_training": "pending",
                "model_validation": "pending",
                "model_registration": "pending"
            }
        }
        
        self.pipeline_state["current_jobs"][job_id] = job_config
        
        # Start training job asynchronously
        asyncio.create_task(self._execute_training_job(job_id))
        
        logger.info(f"🚀 Training pipeline triggered for {engine_name}, Job ID: {job_id}")
        return job_id

    async def _execute_training_job(self, job_id: str):
        """Execute the complete training pipeline for a job."""
        job = self.pipeline_state["current_jobs"][job_id]
        
        try:
            job["status"] = "running"
            job["started_at"] = datetime.now().isoformat()
            
            # Step 1: Data validation
            logger.info(f"📊 Validating data for job {job_id}")
            job["steps"]["data_validation"] = "running"
            data_validation_result = await self._validate_training_data(job)
            job["steps"]["data_validation"] = "completed"
            job["data_validation_result"] = data_validation_result
            
            # Step 2: Model training
            logger.info(f"🧠 Training model for job {job_id}")
            job["steps"]["model_training"] = "running"
            training_result = await self._train_model_with_lora(job)
            job["steps"]["model_training"] = "completed"
            job["training_result"] = training_result
            
            # Step 3: Model validation
            logger.info(f"✅ Validating model for job {job_id}")
            job["steps"]["model_validation"] = "running"
            validation_result = await self._validate_trained_model(job, training_result)
            job["steps"]["model_validation"] = "completed"
            job["validation_result"] = validation_result
            
            # Step 4: Model registration
            if validation_result["meets_threshold"]:
                logger.info(f"📝 Registering model for job {job_id}")
                job["steps"]["model_registration"] = "running"
                registration_result = await self._register_trained_model(job, training_result, validation_result)
                job["steps"]["model_registration"] = "completed"
                job["registration_result"] = registration_result
                
                # Trigger shadow deployment
                await self._trigger_shadow_deployment(job_id, registration_result["model_id"])
            else:
                logger.warning(f"⚠️ Model for job {job_id} did not meet validation threshold")
                job["status"] = "failed"
                job["failure_reason"] = "validation_threshold_not_met"
            
            job["status"] = "completed"
            job["completed_at"] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"❌ Training job {job_id} failed: {str(e)}")
            job["status"] = "failed"
            job["error"] = str(e)
            job["failed_at"] = datetime.now().isoformat()

    async def _validate_training_data(self, job: Dict) -> Dict:
        """Validate training data quality and completeness."""
        dataset_path = Path(job["dataset_path"])
        
        validation_result = {
            "data_quality_score": 0.0,
            "sample_count": 0,
            "data_completeness": 0.0,
            "malayalam_content_ratio": 0.0,
            "validation_passed": False
        }
        
        try:
            # Load and analyze dataset
            parquet_files = list(dataset_path.glob("*.parquet"))
            total_samples = 0
            malayalam_samples = 0
            
            for file in parquet_files:
                df = pd.read_parquet(file)
                total_samples += len(df)
                
                if "malayalam_char_ratio" in df.columns:
                    malayalam_samples += (df["malayalam_char_ratio"] >= 0.7).sum()
                elif "text" in df.columns:
                    # Calculate Malayalam content on the fly
                    malayalam_chars = set('അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരറലളഴവശഷസഹം')
                    malayalam_samples += df["text"].apply(
                        lambda x: sum(1 for char in str(x) if char in malayalam_chars) / max(len(str(x)), 1) >= 0.7
                    ).sum()
            
            validation_result["sample_count"] = total_samples
            validation_result["malayalam_content_ratio"] = malayalam_samples / max(total_samples, 1)
            validation_result["data_completeness"] = 1.0 if total_samples > 100 else total_samples / 100
            validation_result["data_quality_score"] = (
                validation_result["malayalam_content_ratio"] * 0.6 + 
                validation_result["data_completeness"] * 0.4
            )
            
            # Validation passes if quality score >= 0.7
            validation_result["validation_passed"] = validation_result["data_quality_score"] >= 0.7
            
        except Exception as e:
            logger.error(f"Data validation failed: {str(e)}")
            validation_result["validation_passed"] = False
            validation_result["error"] = str(e)
        
        return validation_result

    async def _train_model_with_lora(self, job: Dict) -> Dict:
        """Train model using LoRA (Low-Rank Adaptation) for efficient fine-tuning."""
        engine_name = job["engine_name"]
        dataset_path = Path(job["dataset_path"])
        
        training_result = {
            "model_path": "",
            "training_metrics": {},
            "lora_config": {},
            "training_completed": False
        }
        
        try:
            # Create temporary training directory
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Load engine-specific training configuration
                training_config = await self._load_engine_training_config(engine_name)
                
                # Prepare LoRA configuration
                lora_config = LoraConfig(
                    r=training_config.get("lora_rank", 16),
                    lora_alpha=training_config.get("lora_alpha", 32),
                    target_modules=training_config.get("target_modules", ["q_proj", "v_proj"]),
                    lora_dropout=training_config.get("lora_dropout", 0.1),
                    bias="none",
                    task_type=self._get_task_type(engine_name)
                )
                
                # Load base model and apply LoRA
                model_name = training_config.get("base_model", "openai/whisper-small")
                
                if "whisper" in engine_name.lower():
                    base_model = AutoModelForSpeechSeq2Seq.from_pretrained(model_name)
                else:
                    base_model = AutoModelForSequenceClassification.from_pretrained(model_name)
                
                # Apply LoRA adapter
                model = get_peft_model(base_model, lora_config)
                model.print_trainable_parameters()
                
                # Load and prepare dataset
                train_dataset, eval_dataset = await self._prepare_training_dataset(dataset_path, engine_name)
                
                # Configure training arguments
                training_args = TrainingArguments(
                    output_dir=str(temp_path / "checkpoints"),
                    num_train_epochs=training_config.get("epochs", 10),
                    per_device_train_batch_size=training_config.get("batch_size", 16),
                    per_device_eval_batch_size=training_config.get("batch_size", 16),
                    learning_rate=training_config.get("learning_rate", 1e-5),
                    warmup_steps=training_config.get("warmup_steps", 500),
                    weight_decay=training_config.get("weight_decay", 0.01),
                    logging_steps=100,
                    evaluation_strategy="steps",
                    eval_steps=500,
                    save_strategy="steps",
                    save_steps=1000,
                    load_best_model_at_end=True,
                    metric_for_best_model="eval_loss",
                    greater_is_better=False,
                    report_to="wandb" if wandb.api.api_key else None
                )
                
                # Initialize trainer
                trainer = Trainer(
                    model=model,
                    args=training_args,
                    train_dataset=train_dataset,
                    eval_dataset=eval_dataset,
                    callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
                )
                
                # Start training
                logger.info(f"🏋️ Starting LoRA training for {engine_name}")
                train_result = trainer.train()
                
                # Save trained model
                model_save_path = temp_path / "trained_model"
                model.save_pretrained(model_save_path)
                
                # Copy to permanent storage
                permanent_path = Path("./models") / engine_name / f"lora_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                permanent_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.copytree(model_save_path, permanent_path)
                
                training_result.update({
                    "model_path": str(permanent_path),
                    "training_metrics": {
                        "final_loss": float(train_result.training_loss),
                        "train_steps": train_result.global_step,
                        "train_samples_per_second": train_result.train_samples_per_second
                    },
                    "lora_config": lora_config.to_dict(),
                    "training_completed": True
                })
                
        except Exception as e:
            logger.error(f"LoRA training failed: {str(e)}")
            training_result["training_completed"] = False
            training_result["error"] = str(e)
        
        return training_result

    async def _validate_trained_model(self, job: Dict, training_result: Dict) -> Dict:
        """Validate trained model against holdout test set and baselines."""
        validation_result = {
            "performance_metrics": {},
            "baseline_comparison": {},
            "meets_threshold": False,
            "cultural_appropriateness": 0.0
        }
        
        try:
            engine_name = job["engine_name"]
            model_path = training_result["model_path"]
            
            # Load test dataset
            test_dataset = await self._load_test_dataset(job["dataset_path"], engine_name)
            
            # Load trained model
            trained_model = self._load_trained_model(model_path, engine_name)
            
            # Run evaluation
            metrics = await self._evaluate_model(trained_model, test_dataset, engine_name)
            validation_result["performance_metrics"] = metrics
            
            # Compare with baseline
            baseline_metrics = await self._get_baseline_metrics(engine_name)
            if baseline_metrics:
                validation_result["baseline_comparison"] = {
                    "improvement": self._calculate_improvement(metrics, baseline_metrics),
                    "baseline_metrics": baseline_metrics
                }
            
            # Check if meets validation threshold
            primary_metric = self._get_primary_metric(engine_name)
            threshold = self.config["training"]["validation_threshold"]
            
            if primary_metric in metrics:
                validation_result["meets_threshold"] = metrics[primary_metric] >= threshold
            
            # Cultural appropriateness check
            validation_result["cultural_appropriateness"] = await self._check_cultural_appropriateness(
                trained_model, engine_name
            )
            
        except Exception as e:
            logger.error(f"Model validation failed: {str(e)}")
            validation_result["error"] = str(e)
        
        return validation_result

    async def _register_trained_model(
        self, 
        job: Dict, 
        training_result: Dict, 
        validation_result: Dict
    ) -> Dict:
        """Register the trained model in the model registry."""
        engine_name = job["engine_name"]
        model_path = training_result["model_path"]
        
        # Generate version
        version = f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Compile model metadata
        metadata = {
            "training_job_id": job["job_id"],
            "training_metrics": training_result["training_metrics"],
            "validation_metrics": validation_result["performance_metrics"],
            "lora_config": training_result["lora_config"],
            "dataset_path": job["dataset_path"],
            "cultural_appropriateness": validation_result["cultural_appropriateness"],
            "training_completed_at": datetime.now().isoformat()
        }
        
        # Register model
        model_id = self.model_registry.register_model(
            model_name=engine_name,
            version=version,
            model_path=model_path,
            metadata=metadata
        )
        
        return {
            "model_id": model_id,
            "version": version,
            "registration_time": datetime.now().isoformat()
        }

    async def _trigger_shadow_deployment(self, job_id: str, model_id: str):
        """Trigger shadow deployment for safe model testing."""
        deployment_id = f"shadow_{model_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        deployment_config = {
            "deployment_id": deployment_id,
            "model_id": model_id,
            "deployment_stage": DeploymentStage.SHADOW.value,
            "traffic_percentage": self.config["deployment"]["shadow_traffic_percentage"],
            "created_at": datetime.now().isoformat(),
            "status": "deploying"
        }
        
        self.pipeline_state["deployment_status"][deployment_id] = deployment_config
        
        # Start shadow deployment process
        asyncio.create_task(self._execute_shadow_deployment(deployment_id))
        
        logger.info(f"🚀 Shadow deployment triggered: {deployment_id}")

    async def _execute_shadow_deployment(self, deployment_id: str):
        """Execute shadow deployment with monitoring."""
        deployment = self.pipeline_state["deployment_status"][deployment_id]
        
        try:
            # Deploy model to shadow environment
            await self._deploy_to_shadow_environment(deployment)
            
            # Start monitoring
            monitoring_window = self.config["deployment"]["monitoring_window"]
            deployment["status"] = "monitoring"
            deployment["monitoring_started_at"] = datetime.now().isoformat()
            
            # Monitor for the specified window
            await asyncio.sleep(monitoring_window)
            
            # Collect metrics
            shadow_metrics = await self._collect_shadow_metrics(deployment_id)
            deployment["shadow_metrics"] = shadow_metrics
            
            # Evaluate shadow performance
            rollback_threshold = self.config["deployment"]["rollback_threshold"]
            if shadow_metrics.get("success_rate", 0) >= rollback_threshold:
                deployment["status"] = "shadow_success"
                
                # Trigger production deployment approval
                await self._trigger_production_deployment_approval(deployment_id)
            else:
                deployment["status"] = "shadow_failed"
                await self._rollback_deployment(deployment_id)
                
        except Exception as e:
            logger.error(f"Shadow deployment {deployment_id} failed: {str(e)}")
            deployment["status"] = "failed"
            deployment["error"] = str(e)
            await self._rollback_deployment(deployment_id)

    # Helper methods for model training and deployment
    
    async def _load_engine_training_config(self, engine_name: str) -> Dict:
        """Load engine-specific training configuration."""
        config_file = self.config_path / f"{engine_name}_training_config.json"
        
        if config_file.exists():
            with open(config_file, 'r') as f:
                return json.load(f)
        
        # Default configurations
        default_configs = {
            "whisper_stt": {
                "base_model": "openai/whisper-small",
                "epochs": 10,
                "learning_rate": 1e-5,
                "batch_size": 16,
                "lora_rank": 16,
                "lora_alpha": 32,
                "target_modules": ["q_proj", "v_proj"]
            },
            "dialect_adapter": {
                "base_model": "openai/whisper-small",
                "epochs": 20,
                "learning_rate": 1e-4,
                "batch_size": 8,
                "lora_rank": 16,
                "lora_alpha": 32,
                "target_modules": ["q_proj", "v_proj", "k_proj"]
            },
            "sentiment_classifier": {
                "base_model": "microsoft/DialoGPT-medium",
                "epochs": 15,
                "learning_rate": 2e-5,
                "batch_size": 32,
                "lora_rank": 8,
                "lora_alpha": 16,
                "target_modules": ["c_attn"]
            }
        }
        
        return default_configs.get(engine_name, default_configs["whisper_stt"])

    def _get_task_type(self, engine_name: str) -> TaskType:
        """Get PEFT task type for engine."""
        task_mapping = {
            "whisper_stt": TaskType.SPEECH_2_TEXT,
            "dialect_adapter": TaskType.SPEECH_2_TEXT,
            "sentiment_classifier": TaskType.SEQ_CLS,
            "nlu_intent": TaskType.SEQ_CLS,
            "nlu_understanding": TaskType.CAUSAL_LM,
            "translation_model": TaskType.TRANSLATION,
            "malayalam_tts": TaskType.TTS
        }
        
        return task_mapping.get(engine_name, TaskType.CAUSAL_LM)

    async def _prepare_training_dataset(self, dataset_path: Path, engine_name: str) -> Tuple[Dataset, Dataset]:
        """Prepare training and evaluation datasets."""
        # Load allocated data
        parquet_files = list(dataset_path.glob("*_allocated.parquet"))
        
        all_data = []
        for file in parquet_files:
            df = pd.read_parquet(file)
            all_data.append(df)
        
        combined_df = pd.concat(all_data, ignore_index=True) if all_data else pd.DataFrame()
        
        # Split into train and eval
        train_size = int(0.9 * len(combined_df))
        train_df = combined_df[:train_size]
        eval_df = combined_df[train_size:]
        
        # Convert to HuggingFace Dataset format
        train_dataset = Dataset.from_pandas(train_df)
        eval_dataset = Dataset.from_pandas(eval_df)
        
        return train_dataset, eval_dataset

    def _load_trained_model(self, model_path: str, engine_name: str):
        """Load trained model for evaluation."""
        # This would load the specific model type based on engine
        # For now, return a placeholder
        return {"model_path": model_path, "engine": engine_name}

    async def _evaluate_model(self, model, test_dataset: Dataset, engine_name: str) -> Dict:
        """Evaluate model performance."""
        # Placeholder evaluation metrics
        if "stt" in engine_name:
            return {
                "wer": 0.15,  # Word Error Rate
                "cer": 0.08,  # Character Error Rate
                "bleu": 0.85
            }
        elif "sentiment" in engine_name:
            return {
                "accuracy": 0.88,
                "f1_macro": 0.87,
                "precision": 0.89,
                "recall": 0.86
            }
        else:
            return {
                "accuracy": 0.85,
                "loss": 0.32
            }

    async def _get_baseline_metrics(self, engine_name: str) -> Optional[Dict]:
        """Get baseline performance metrics for comparison."""
        # Return baseline metrics stored from previous deployments
        baselines = {
            "whisper_stt": {"wer": 0.25, "cer": 0.12},
            "sentiment_classifier": {"accuracy": 0.82, "f1_macro": 0.81}
        }
        
        return baselines.get(engine_name)

    def _calculate_improvement(self, current_metrics: Dict, baseline_metrics: Dict) -> Dict:
        """Calculate improvement over baseline."""
        improvements = {}
        
        for metric, current_value in current_metrics.items():
            if metric in baseline_metrics:
                baseline_value = baseline_metrics[metric]
                if metric in ["wer", "cer", "loss"]:  # Lower is better
                    improvement = (baseline_value - current_value) / baseline_value
                else:  # Higher is better
                    improvement = (current_value - baseline_value) / baseline_value
                
                improvements[metric] = improvement
        
        return improvements

    def _get_primary_metric(self, engine_name: str) -> str:
        """Get primary evaluation metric for engine."""
        primary_metrics = {
            "whisper_stt": "wer",
            "sentiment_classifier": "f1_macro",
            "nlu_intent": "accuracy",
            "dialect_adapter": "wer"
        }
        
        return primary_metrics.get(engine_name, "accuracy")

    async def _check_cultural_appropriateness(self, model, engine_name: str) -> float:
        """Check cultural appropriateness of model outputs."""
        # Placeholder cultural appropriateness check
        # In practice, this would test the model against cultural test cases
        return 0.92

    async def _deploy_to_shadow_environment(self, deployment: Dict):
        """Deploy model to shadow environment."""
        # Placeholder for shadow deployment logic
        await asyncio.sleep(2)  # Simulate deployment time
        
    async def _collect_shadow_metrics(self, deployment_id: str) -> Dict:
        """Collect metrics from shadow deployment."""
        # Placeholder metrics collection
        return {
            "success_rate": 0.96,
            "average_latency": 120,  # ms
            "error_rate": 0.04,
            "throughput": 150  # requests/minute
        }

    async def _trigger_production_deployment_approval(self, deployment_id: str):
        """Trigger approval process for production deployment."""
        logger.info(f"✅ Shadow deployment {deployment_id} successful - ready for production approval")

    async def _rollback_deployment(self, deployment_id: str):
        """Rollback failed deployment."""
        logger.warning(f"🔄 Rolling back deployment {deployment_id}")


class DataFoundryOrchestrator:
    """
    Master orchestrator for the complete Data Foundry pipeline.
    """
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        
        # Initialize components
        self.model_registry = ModelRegistry(str(self.base_path / "registry"))
        self.ci_ai_pipeline = ContinuousIntegrationAI(
            str(self.base_path / "config"),
            self.model_registry
        )

    async def run_complete_pipeline(self) -> Dict:
        """Run the complete Data Foundry pipeline from Phase 1 to Phase 4."""
        logger.info("🏭 Starting Complete Data Foundry Pipeline")
        
        pipeline_report = {
            "pipeline_started_at": datetime.now().isoformat(),
            "phases": {},
            "overall_status": "running"
        }
        
        try:
            # Phase 1: Ingestion (already implemented)
            logger.info("📥 Phase 1: Data Ingestion - Loading existing data...")
            pipeline_report["phases"]["phase1"] = {"status": "completed", "note": "Using existing implementation"}
            
            # Phase 2: Standardization (already implemented)
            logger.info("🔧 Phase 2: Data Standardization - Loading processed data...")
            pipeline_report["phases"]["phase2"] = {"status": "completed", "note": "Using existing implementation"}
            
            # Phase 3: Allocation (already implemented)
            logger.info("🎯 Phase 3: Strategic Allocation - Loading allocated data...")
            pipeline_report["phases"]["phase3"] = {"status": "completed", "note": "Using existing implementation"}
            
            # Phase 4: Fine-tuning and Deployment
            logger.info("🚀 Phase 4: Fine-tuning and Deployment - Starting training jobs...")
            phase4_result = await self._execute_phase4_pipeline()
            pipeline_report["phases"]["phase4"] = phase4_result
            
            pipeline_report["overall_status"] = "completed"
            pipeline_report["pipeline_completed_at"] = datetime.now().isoformat()
            
        except Exception as e:
            logger.error(f"💥 Pipeline failed: {str(e)}")
            pipeline_report["overall_status"] = "failed"
            pipeline_report["error"] = str(e)
        
        return pipeline_report

    async def _execute_phase4_pipeline(self) -> Dict:
        """Execute Phase 4 training and deployment pipeline."""
        phase4_result = {
            "training_jobs": {},
            "deployments": {},
            "models_trained": 0,
            "models_deployed": 0
        }
        
        # Discover allocated datasets
        gold_path = self.base_path / "storage" / "gold"
        
        if not gold_path.exists():
            logger.warning("⚠️ No allocated datasets found - creating sample configuration")
            phase4_result["note"] = "Sample configuration created - run phases 1-3 first for actual training"
            return phase4_result
        
        # Trigger training jobs for each engine with allocated data
        engines_with_data = [d for d in gold_path.iterdir() if d.is_dir() and list(d.glob("*/"))]
        
        training_tasks = []
        for engine_dir in engines_with_data:
            engine_name = engine_dir.name
            
            # Find datasets for this engine
            dataset_dirs = [d for d in engine_dir.iterdir() if d.is_dir()]
            
            if dataset_dirs:
                # Use the first dataset directory for training
                dataset_path = str(dataset_dirs[0])
                
                # Trigger training
                task = self.ci_ai_pipeline.trigger_training_pipeline(engine_name, dataset_path)
                training_tasks.append(task)
        
        # Wait for all training jobs to be queued
        job_ids = await asyncio.gather(*training_tasks)
        
        for job_id in job_ids:
            phase4_result["training_jobs"][job_id] = "queued"
        
        phase4_result["models_trained"] = len(job_ids)
        
        return phase4_result


async def main():
    """Main execution function for Phase 4."""
    
    # Initialize orchestrator
    orchestrator = DataFoundryOrchestrator("./data-foundry")
    
    # Run complete pipeline
    try:
        report = await orchestrator.run_complete_pipeline()
        
        print("\n" + "="*60)
        print("🏭 DATA FOUNDRY COMPLETE PIPELINE FINISHED")
        print("="*60)
        print(f"Status: {report['overall_status']}")
        
        for phase, result in report["phases"].items():
            print(f"{phase}: {result.get('status', 'unknown')}")
        
        if "phase4" in report["phases"]:
            phase4 = report["phases"]["phase4"]
            print(f"\n🚀 Training Jobs Initiated: {len(phase4.get('training_jobs', {}))}")
            print(f"📊 Models in Training: {phase4.get('models_trained', 0)}")
        
        print("="*60)
        
    except Exception as e:
        logger.error(f"💥 Data Foundry pipeline failed: {str(e)}")
        raise e


if __name__ == "__main__":
    # Ensure required dependencies are installed
    try:
        import torch
        import transformers
        import peft
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Install with: pip install torch transformers peft datasets wandb")
        exit(1)
    
    # Run the complete pipeline
    asyncio.run(main())