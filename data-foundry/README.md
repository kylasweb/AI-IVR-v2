# Data Foundry Pipeline

## Strategic Malayalam Dataset Integration for AI IVR

The **Data Foundry** is a comprehensive 4-phase pipeline designed to integrate 9 strategic Malayalam datasets from Hugging Face into your AI IVR's training infrastructure. This isn't a direct data feed—it's an intelligent offline processing system that transforms raw datasets into production-ready AI model improvements.

### 🎯 The Strategic Vision

Instead of overwhelming your live IVR with raw data, the Data Foundry creates a **controlled pipeline** that:
- ✅ **Securely ingests** Malayalam datasets from Hugging Face
- ✅ **Standardizes formats** for optimal AI training  
- ✅ **Routes data strategically** to specific AI engines
- ✅ **Fine-tunes models** using efficient LoRA adapters
- ✅ **Deploys safely** with shadow testing and monitoring

### 📊 Target Datasets Integration

| Dataset | Target Engine | Strategic Value | Priority |
|---------|---------------|-----------------|----------|
| `Be-win/IndicST-malayalam-only` | **STT Engine** | Core Malayalam speech recognition | 🔴 High |
| `ayush-shunyalabs/malayalam-speech-dataset` | **STT Engine** | Enhanced vocabulary coverage | 🔴 High |
| `CXDuncan/Malayalam-IndicVoices` | **STT Engine** | Voice diversity and natural speech | 🟡 Medium |
| `Aby003/Malayalam_Dialects` | **Dialect Engine** | Travancore/Malabar/Cochin recognition | 🔴 **Critical** |
| `Praha-Labs/rasa-malayalam-nano-codec` | **NLU Engine** | Intent classification | 🔴 High |
| `Sakshamrzt/IndicNLP-Malayalam` | **NLU Engine** | Deep linguistic understanding | 🔴 High |
| `wlkla/Malayalam_first_ready_for_sentiment` | **Sentiment Engine** | Emotion detection | 🔴 High |
| `Be-win/malayalam-speech-with-english-translation` | **Translation Engine** | Malayalam-English parallel corpus | 🟡 Medium |
| `Praha-Labs/imasc_slr_Malayalam-nano-codec` | **TTS Engine** | High-quality speech synthesis | 🟡 Medium |

## 🚀 Quick Start

### Prerequisites

1. **Python 3.8+** with virtual environment
2. **Hugging Face Token** (optional, for private datasets)
3. **GPU recommended** (for Phase 4 training)

### Installation

```bash
# Clone or navigate to the data-foundry directory
cd data-foundry

# Install dependencies
pip install -r requirements.txt

# Set up Hugging Face token (optional)
export HUGGINGFACE_TOKEN="your_hf_token_here"
```

### Execute Complete Pipeline

```bash
# Run all 4 phases
python run_data_foundry.py

# Run specific phases
python run_data_foundry.py --phases phase1 phase2

# Dry run to preview execution
python run_data_foundry.py --dry-run
```

## 📋 The 4-Phase Architecture

### 🔧 Phase 1: Automated Ingestion
**Goal:** Pull all 9 datasets from Hugging Face into secure, private infrastructure.

```bash
python phase1-ingestion/ingest_hf_data.py
```

**What it does:**
- ✅ Downloads 9 target Malayalam datasets from Hugging Face
- ✅ Validates data quality and Malayalam content ratio
- ✅ Stores in organized Raw Data Lake structure
- ✅ Creates comprehensive metadata for each dataset
- ✅ Handles authentication and error recovery

**Output:** Raw datasets stored in `./storage/raw/` with quality metrics

---

### 🎛️ Phase 2: Data Standardization
**Goal:** Convert disparate dataset formats into unified standards for AI model training.

```bash
python phase2-preprocessing/standardize_data.py
```

**What it does:**
- ✅ **Audio Standardization:** 16kHz mono WAV format for all speech data
- ✅ **Text Normalization:** UTF-8 Malayalam with proper Unicode handling
- ✅ **Quality Filtering:** Remove low-quality or inappropriate samples
- ✅ **Format Unification:** Consistent schema across all dataset types
- ✅ **Cultural Validation:** Preserve Malayalam cultural context

**Output:** Standardized datasets in `./storage/silver/` ready for allocation

---

### 🎯 Phase 3: Strategic Allocation  
**Goal:** Route each dataset to its optimal AI engine target with intelligent mapping.

```bash
python phase3-allocation/allocate_datasets.py
```

**Strategic Routing:**
- 🎤 **STT Engine:** `IndicST-malayalam-only` + `malayalam-speech-dataset` + `Malayalam-IndicVoices`
- 🗺️ **Dialect Engine:** `Malayalam_Dialects` → Creates LoRA adapters for regional dialects
- 🧠 **NLU Engine:** `rasa-malayalam-nano-codec` + `IndicNLP-Malayalam`
- 😊 **Sentiment Engine:** `Malayalam_first_ready_for_sentiment`
- 🌐 **Translation Engine:** `malayalam-speech-with-english-translation`
- 🔊 **TTS Engine:** `imasc_slr_Malayalam-nano-codec`

**Output:** Engine-specific optimized datasets in `./storage/gold/`

---

### 🚀 Phase 4: Fine-Tuning & Deployment
**Goal:** Update live models with new intelligence using safe deployment practices.

```bash
python phase4-finetuning/train_deploy_models.py
```

**What it does:**
- ✅ **LoRA Fine-tuning:** Efficient adaptation without full retraining
- ✅ **Continuous Integration:** Automated training, validation, and deployment
- ✅ **Shadow Deployment:** Test new models on 10% of traffic silently
- ✅ **Performance Monitoring:** Real-time metrics and automatic rollback
- ✅ **Model Registry:** Version control and deployment tracking

**Output:** Production-ready models deployed to your AI IVR system

## 📁 Directory Structure

```
data-foundry/
├── phase1-ingestion/
│   └── ingest_hf_data.py           # HuggingFace dataset ingestion
├── phase2-preprocessing/ 
│   └── standardize_data.py         # Audio/text standardization
├── phase3-allocation/
│   └── allocate_datasets.py        # Engine-specific routing
├── phase4-finetuning/
│   └── train_deploy_models.py      # LoRA training & deployment
├── storage/
│   ├── raw/                        # Raw ingested datasets
│   ├── silver/                     # Standardized datasets  
│   └── gold/                       # Engine-allocated datasets
├── models/                         # Trained model storage
├── config/                         # Configuration files
├── run_data_foundry.py            # Master orchestrator
├── requirements.txt               # Dependencies
└── README.md                      # This file
```

## 🔧 Configuration

### Environment Variables
```bash
export HUGGINGFACE_TOKEN="your_hf_token"     # For private datasets
export WANDB_API_KEY="your_wandb_key"        # For training monitoring  
export DATA_FOUNDRY_BASE_PATH="./data-foundry"  # Custom base path
```

### Custom Configuration
Create `config/data_foundry_config.json`:
```json
{
  "base_path": "./data-foundry",
  "storage": {
    "type": "local",
    "backup_enabled": true
  },
  "training": {
    "use_wandb": true,
    "gpu_enabled": true,
    "mixed_precision": true
  },
  "deployment": {
    "shadow_testing": true,
    "rollback_enabled": true
  }
}
```

## 📊 Monitoring & Reports

### Pipeline Reports
Each execution generates comprehensive reports:
- `pipeline_report_YYYYMMDD_HHMMSS.json` - Detailed execution log
- `latest_pipeline_summary.json` - Quick status overview

### Key Metrics Tracked
- **Dataset Quality:** Malayalam content ratio, completeness scores
- **Training Performance:** Loss curves, validation metrics, convergence
- **Deployment Health:** Success rates, latency, error rates
- **Cultural Appropriateness:** Malayalam cultural context preservation

## 🛡️ Safety & Quality Assurance

### Data Quality Gates
- ✅ Minimum 70% Malayalam content requirement
- ✅ Cultural appropriateness validation
- ✅ Audio quality filtering (16kHz, noise levels)
- ✅ Text normalization validation

### Model Safety
- ✅ Validation threshold requirements (85% minimum)
- ✅ Shadow deployment with 10% traffic
- ✅ Automatic rollback on performance degradation
- ✅ Cultural bias monitoring

### Deployment Safety
- ✅ Staged rollout (Shadow → Staging → Production)
- ✅ Real-time performance monitoring
- ✅ Automatic rollback triggers
- ✅ Manual approval gates for production

## 🔄 Integration with Existing AI IVR

The Data Foundry integrates seamlessly with your existing AI IVR infrastructure:

### Current Services Enhanced
- **`MalayalamSpeechToTextService`** ← Enhanced by STT + Dialect datasets
- **`MalayalamNLPService`** ← Enhanced by NLU + Sentiment datasets  
- **`MalayalamTextToSpeechService`** ← Enhanced by TTS datasets

### New Capabilities Added
- **Regional Dialect Recognition** (Travancore/Malabar/Cochin)
- **Advanced Sentiment Detection** for user frustration/satisfaction
- **Real-time Malayalam-English Translation**
- **Improved Cultural Context Understanding**

## 📈 Expected Results

### Phase 1-2 (Data Pipeline)
- ✅ **9 datasets successfully ingested** with quality validation
- ✅ **Standardized format compliance** across all data types
- ✅ **Cultural content preservation** with 90%+ Malayalam fidelity

### Phase 3-4 (AI Enhancement)
- ✅ **25-40% improvement** in Malayalam speech recognition accuracy
- ✅ **Regional dialect support** for Travancore/Malabar/Cochin users
- ✅ **Enhanced sentiment detection** for better user experience
- ✅ **Zero-downtime deployment** with shadow testing validation

## 🚨 Troubleshooting

### Common Issues

**Dataset Download Failures:**
```bash
# Check Hugging Face token
python -c "from huggingface_hub import login; login()"

# Test dataset access
python -c "from datasets import load_dataset; print(load_dataset('Be-win/IndicST-malayalam-only', split='train[:5]'))"
```

**GPU/Training Issues:**
```bash
# Check GPU availability
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, Devices: {torch.cuda.device_count()}')"

# Monitor training
pip install wandb
wandb login your_wandb_key
```

**Storage Space:**
```bash
# Check storage requirements
du -h storage/  # ~5-15GB for raw datasets
df -h          # Ensure sufficient disk space
```

### Performance Optimization

**For Limited Resources:**
- Run phases sequentially rather than parallel
- Use smaller batch sizes in training configuration  
- Enable gradient checkpointing for memory efficiency

**For High Performance:**
- Use multiple GPUs with `accelerate` configuration
- Enable mixed precision training
- Optimize data loading with multi-processing

## 🤝 Contributing

### Adding New Datasets
1. Add dataset configuration to `DATASET_REGISTRY` in Phase 1
2. Create corresponding allocation strategy in Phase 3
3. Update training configuration for target engine in Phase 4

### Custom AI Engines
1. Extend `AIEngine` enum in Phase 3
2. Implement engine-specific optimization in `_process_for_target_engine`
3. Add training configuration in Phase 4

## 📞 Support

For technical support or questions about the Data Foundry pipeline:
- **Technical Issues:** Check logs in `data_foundry_*.log` files
- **Dataset Issues:** Verify Hugging Face access and token permissions
- **Training Issues:** Monitor training logs and GPU utilization
- **Deployment Issues:** Check shadow deployment metrics and rollback logs

---

**🎯 Ready to Transform Your AI IVR?**

Execute the complete pipeline:
```bash
python run_data_foundry.py
```

Watch as your AI IVR gains deep Malayalam understanding with regional dialect support, enhanced sentiment detection, and cultural appropriateness—all while maintaining production safety through intelligent shadow deployment! 🚀