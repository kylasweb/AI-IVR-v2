import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface DataPipeline {
    id: string;
    name: string;
    description: string;
    type: 'ingestion' | 'processing' | 'training' | 'deployment';
    status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
    progress: number;
    stages: PipelineStage[];
    createdAt: string;
    updatedAt: string;
    metrics: {
        totalSamples: number;
        processedSamples: number;
        successRate: number;
        avgProcessingTime: number;
    };
}

interface PipelineStage {
    id: string;
    name: string;
    type: 'extract' | 'transform' | 'load' | 'validate' | 'train' | 'deploy';
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    duration?: number;
    error?: string;
    config: Record<string, any>;
}

interface DataSource {
    id: string;
    name: string;
    type: 'file' | 'api' | 'database' | 'stream';
    format: string;
    location: string;
    status: 'active' | 'inactive' | 'error';
    lastSync: string;
    totalRecords: number;
    schema: Record<string, string>;
}

interface ProcessingJob {
    id: string;
    pipelineId: string;
    stageId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    inputCount: number;
    outputCount: number;
    error?: string;
    logs: string[];
}

interface FoundryMetrics {
    totalPipelines: number;
    activePipelines: number;
    totalSamples: number;
    processedSamples: number;
    avgProcessingTime: number;
    successRate: number;
    storageUsed: number;
    storageCapacity: number;
}

// In-memory storage for demo purposes
// In production, this would be replaced with a database
let pipelines: DataPipeline[] = [
    {
        id: 'pipeline-1',
        name: 'Voice Data Ingestion Pipeline',
        description: 'Automated ingestion and preprocessing of voice samples',
        type: 'ingestion',
        status: 'running',
        progress: 65,
        stages: [
            {
                id: 'stage-1',
                name: 'Data Extraction',
                type: 'extract',
                status: 'completed',
                progress: 100,
                duration: 45,
                config: { source: 'file_system', format: 'wav' }
            },
            {
                id: 'stage-2',
                name: 'Audio Preprocessing',
                type: 'transform',
                status: 'running',
                progress: 75,
                config: { normalization: true, noise_reduction: true }
            },
            {
                id: 'stage-3',
                name: 'Quality Validation',
                type: 'validate',
                status: 'pending',
                progress: 0,
                config: { min_quality: 80, max_noise: 10 }
            }
        ],
        createdAt: '2024-11-01T09:00:00Z',
        updatedAt: '2024-11-08T14:30:00Z',
        metrics: {
            totalSamples: 1250,
            processedSamples: 812,
            successRate: 94.2,
            avgProcessingTime: 2.3
        }
    },
    {
        id: 'pipeline-2',
        name: 'Voice Model Training Pipeline',
        description: 'End-to-end voice model training and validation',
        type: 'training',
        status: 'idle',
        progress: 0,
        stages: [
            {
                id: 'stage-4',
                name: 'Data Preparation',
                type: 'transform',
                status: 'pending',
                progress: 0,
                config: { batch_size: 32, shuffle: true }
            },
            {
                id: 'stage-5',
                name: 'Model Training',
                type: 'train',
                status: 'pending',
                progress: 0,
                config: { epochs: 100, learning_rate: 0.001 }
            },
            {
                id: 'stage-6',
                name: 'Model Validation',
                type: 'validate',
                status: 'pending',
                progress: 0,
                config: { test_split: 0.2 }
            }
        ],
        createdAt: '2024-11-02T11:15:00Z',
        updatedAt: '2024-11-08T16:45:00Z',
        metrics: {
            totalSamples: 0,
            processedSamples: 0,
            successRate: 0,
            avgProcessingTime: 0
        }
    }
];

let dataSources: DataSource[] = [
    {
        id: 'source-1',
        name: 'Voice Samples S3 Bucket',
        type: 'file',
        format: 'wav,flac',
        location: 's3://voice-data-bucket/samples/',
        status: 'active',
        lastSync: '2024-11-08T15:30:00Z',
        totalRecords: 5420,
        schema: {
            filename: 'string',
            duration: 'float',
            sample_rate: 'integer',
            language: 'string'
        }
    },
    {
        id: 'source-2',
        name: 'Voice API Endpoint',
        type: 'api',
        format: 'json',
        location: 'https://api.voice-data.com/samples',
        status: 'active',
        lastSync: '2024-11-08T14:00:00Z',
        totalRecords: 1250,
        schema: {
            id: 'string',
            audio_url: 'string',
            transcription: 'string',
            metadata: 'object'
        }
    }
];

let processingJobs: ProcessingJob[] = [];

// GET /api/data-foundry-management - Get all pipelines and metrics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'pipelines':
                return NextResponse.json({
                    success: true,
                    data: pipelines
                });

            case 'sources':
                return NextResponse.json({
                    success: true,
                    data: dataSources
                });

            case 'jobs':
                return NextResponse.json({
                    success: true,
                    data: processingJobs
                });

            case 'metrics':
                const metrics: FoundryMetrics = {
                    totalPipelines: pipelines.length,
                    activePipelines: pipelines.filter(p => p.status === 'running').length,
                    totalSamples: pipelines.reduce((sum, p) => sum + p.metrics.totalSamples, 0),
                    processedSamples: pipelines.reduce((sum, p) => sum + p.metrics.processedSamples, 0),
                    avgProcessingTime: pipelines.length > 0
                        ? pipelines.reduce((sum, p) => sum + p.metrics.avgProcessingTime, 0) / pipelines.length
                        : 0,
                    successRate: pipelines.length > 0
                        ? pipelines.reduce((sum, p) => sum + p.metrics.successRate, 0) / pipelines.length
                        : 0,
                    storageUsed: 245.6,
                    storageCapacity: 1000
                };
                return NextResponse.json({
                    success: true,
                    data: metrics
                });

            case 'pipeline':
                const pipelineId = searchParams.get('id');
                if (!pipelineId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline ID is required'
                    }, { status: 400 });
                }
                const pipeline = pipelines.find(p => p.id === pipelineId);
                if (!pipeline) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline not found'
                    }, { status: 404 });
                }
                return NextResponse.json({
                    success: true,
                    data: pipeline
                });

            default:
                return NextResponse.json({
                    success: true,
                    data: {
                        pipelines,
                        dataSources,
                        processingJobs,
                        metrics: {
                            totalPipelines: pipelines.length,
                            activePipelines: pipelines.filter(p => p.status === 'running').length,
                            totalSamples: pipelines.reduce((sum, p) => sum + p.metrics.totalSamples, 0),
                            processedSamples: pipelines.reduce((sum, p) => sum + p.metrics.processedSamples, 0),
                            avgProcessingTime: pipelines.length > 0
                                ? pipelines.reduce((sum, p) => sum + p.metrics.avgProcessingTime, 0) / pipelines.length
                                : 0,
                            successRate: pipelines.length > 0
                                ? pipelines.reduce((sum, p) => sum + p.metrics.successRate, 0) / pipelines.length
                                : 0,
                            storageUsed: 245.6,
                            storageCapacity: 1000
                        }
                    }
                });
        }
    } catch (error) {
        console.error('Error in data-foundry-management GET:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// POST /api/data-foundry-management - Create or update resources
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'create_pipeline':
                if (!data.name || !data.type) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline name and type are required'
                    }, { status: 400 });
                }

                const newPipeline: DataPipeline = {
                    id: `pipeline-${Date.now()}`,
                    name: data.name,
                    description: data.description || '',
                    type: data.type,
                    status: 'idle',
                    progress: 0,
                    stages: data.stages || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    metrics: {
                        totalSamples: 0,
                        processedSamples: 0,
                        successRate: 0,
                        avgProcessingTime: 0
                    }
                };

                pipelines.push(newPipeline);
                return NextResponse.json({
                    success: true,
                    data: newPipeline
                });

            case 'run_pipeline':
                const pipelineId = data.id;
                const pipeline = pipelines.find(p => p.id === pipelineId);
                if (!pipeline) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline not found'
                    }, { status: 404 });
                }

                // Update pipeline status
                pipeline.status = 'running';
                pipeline.updatedAt = new Date().toISOString();

                // Create processing job
                const job: ProcessingJob = {
                    id: `job-${Date.now()}`,
                    pipelineId,
                    stageId: pipeline.stages[0]?.id || '',
                    status: 'running',
                    startedAt: new Date().toISOString(),
                    inputCount: pipeline.metrics.totalSamples,
                    outputCount: 0,
                    logs: ['Pipeline execution started']
                };
                processingJobs.push(job);

                // Simulate pipeline execution
                simulatePipelineExecution(pipeline, job);

                return NextResponse.json({
                    success: true,
                    data: { pipeline, job }
                });

            case 'pause_pipeline':
                const pausePipelineId = data.id;
                const pausePipeline = pipelines.find(p => p.id === pausePipelineId);
                if (!pausePipeline) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline not found'
                    }, { status: 404 });
                }

                pausePipeline.status = 'paused';
                pausePipeline.updatedAt = new Date().toISOString();

                return NextResponse.json({
                    success: true,
                    data: pausePipeline
                });

            case 'stop_pipeline':
                const stopPipelineId = data.id;
                const stopPipeline = pipelines.find(p => p.id === stopPipelineId);
                if (!stopPipeline) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline not found'
                    }, { status: 404 });
                }

                stopPipeline.status = 'idle';
                stopPipeline.updatedAt = new Date().toISOString();

                return NextResponse.json({
                    success: true,
                    data: stopPipeline
                });

            case 'sync_source':
                const sourceId = data.id;
                const source = dataSources.find(s => s.id === sourceId);
                if (!source) {
                    return NextResponse.json({
                        success: false,
                        error: 'Data source not found'
                    }, { status: 404 });
                }

                source.lastSync = new Date().toISOString();
                source.status = 'active';

                return NextResponse.json({
                    success: true,
                    data: source
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in data-foundry-management POST:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// PUT /api/data-foundry-management - Update resources
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'update_pipeline':
                const pipelineId = data.id;
                const pipelineIndex = pipelines.findIndex(p => p.id === pipelineId);
                if (pipelineIndex === -1) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline not found'
                    }, { status: 404 });
                }

                pipelines[pipelineIndex] = {
                    ...pipelines[pipelineIndex],
                    ...data,
                    updatedAt: new Date().toISOString()
                };

                return NextResponse.json({
                    success: true,
                    data: pipelines[pipelineIndex]
                });

            case 'update_source':
                const sourceId = data.id;
                const sourceIndex = dataSources.findIndex(s => s.id === sourceId);
                if (sourceIndex === -1) {
                    return NextResponse.json({
                        success: false,
                        error: 'Data source not found'
                    }, { status: 404 });
                }

                dataSources[sourceIndex] = {
                    ...dataSources[sourceIndex],
                    ...data,
                    lastSync: new Date().toISOString()
                };

                return NextResponse.json({
                    success: true,
                    data: dataSources[sourceIndex]
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in data-foundry-management PUT:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// DELETE /api/data-foundry-management - Delete resources
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID is required'
            }, { status: 400 });
        }

        switch (action) {
            case 'delete_pipeline':
                const pipelineIndex = pipelines.findIndex(p => p.id === id);
                if (pipelineIndex === -1) {
                    return NextResponse.json({
                        success: false,
                        error: 'Pipeline not found'
                    }, { status: 404 });
                }

                const deletedPipeline = pipelines.splice(pipelineIndex, 1)[0];
                return NextResponse.json({
                    success: true,
                    data: deletedPipeline
                });

            case 'delete_source':
                const sourceIndex = dataSources.findIndex(s => s.id === id);
                if (sourceIndex === -1) {
                    return NextResponse.json({
                        success: false,
                        error: 'Data source not found'
                    }, { status: 404 });
                }

                const deletedSource = dataSources.splice(sourceIndex, 1)[0];
                return NextResponse.json({
                    success: true,
                    data: deletedSource
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in data-foundry-management DELETE:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// Helper function to simulate pipeline execution
function simulatePipelineExecution(pipeline: DataPipeline, job: ProcessingJob) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Update pipeline
            pipeline.status = 'completed';
            pipeline.progress = 100;
            pipeline.updatedAt = new Date().toISOString();
            pipeline.metrics.processedSamples = pipeline.metrics.totalSamples;
            pipeline.metrics.successRate = 96.5;

            // Update job
            job.status = 'completed';
            job.completedAt = new Date().toISOString();
            job.duration = Date.now() - new Date(job.startedAt!).getTime();
            job.outputCount = pipeline.metrics.totalSamples;
            job.logs.push('Pipeline execution completed successfully');
        } else {
            pipeline.progress = Math.round(progress);
        }
    }, 2000);
}