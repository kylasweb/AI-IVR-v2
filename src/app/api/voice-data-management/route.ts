import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface VoiceSample {
    id: string;
    name: string;
    description: string;
    duration: number;
    sampleRate: number;
    bitDepth: number;
    channels: number;
    fileSize: number;
    format: string;
    language: string;
    speaker: {
        id: string;
        name: string;
        age: number;
        gender: 'male' | 'female' | 'other';
        accent: string;
        nativeLanguage: string;
    };
    quality: {
        overall: number;
        clarity: number;
        noise: number;
        consistency: number;
    };
    metadata: {
        emotion: string;
        context: string;
        environment: string;
        recordingDevice: string;
        processingHistory: string[];
    };
    tags: string[];
    transcription?: string;
    status: 'processing' | 'ready' | 'rejected' | 'archived';
    uploadedAt: string;
    processedAt?: string;
    url: string;
    waveform?: number[];
}

interface Dataset {
    id: string;
    name: string;
    description: string;
    category: 'training' | 'validation' | 'test' | 'production';
    language: string;
    totalSamples: number;
    totalDuration: number;
    avgQuality: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'archived';
    samples: string[];
}

interface UploadRequest {
    language: string;
    speakerName: string;
    speakerAge: string;
    speakerGender: 'male' | 'female' | 'other';
    speakerAccent: string;
    emotion: string;
    context: string;
    environment: string;
    recordingDevice: string;
    tags: string;
}

interface CreateDatasetRequest {
    name: string;
    description: string;
    category: 'training' | 'validation' | 'test' | 'production';
    language: string;
    tags: string;
    sampleIds: string[];
}

// In-memory storage (in production, use a database)
let voiceSamples: VoiceSample[] = [];
let datasets: Dataset[] = [];

// Initialize with mock data
if (voiceSamples.length === 0) {
    voiceSamples = [
        {
            id: 'sample-1',
            name: 'Malayalam Greeting',
            description: 'Professional greeting in Malayalam',
            duration: 3.2,
            sampleRate: 44100,
            bitDepth: 16,
            channels: 1,
            fileSize: 141120,
            format: 'wav',
            language: 'ml',
            speaker: {
                id: 'speaker-1',
                name: 'Arun Kumar',
                age: 35,
                gender: 'male',
                accent: 'Kerala',
                nativeLanguage: 'ml'
            },
            quality: {
                overall: 95,
                clarity: 98,
                noise: 2,
                consistency: 96
            },
            metadata: {
                emotion: 'neutral',
                context: 'business greeting',
                environment: 'studio',
                recordingDevice: 'AKG C414',
                processingHistory: ['noise reduction', 'normalization']
            },
            tags: ['greeting', 'professional', 'male'],
            transcription: 'Namaste, എങ്ങനെ സഹായിക്കാം?',
            status: 'ready',
            uploadedAt: '2024-11-01T10:00:00Z',
            processedAt: '2024-11-01T10:05:00Z',
            url: '/audio/sample-1.wav',
            waveform: [0.1, 0.3, 0.2, 0.8, 0.5, 0.9, 0.4, 0.6]
        }
    ];
}

if (datasets.length === 0) {
    datasets = [
        {
            id: 'dataset-1',
            name: 'Malayalam Professional Voice Dataset',
            description: 'High-quality Malayalam voice samples for professional contexts',
            category: 'training',
            language: 'ml',
            totalSamples: 1,
            totalDuration: 3.2,
            avgQuality: 95,
            tags: ['professional', 'malayalam', 'business'],
            createdAt: '2024-10-15T09:00:00Z',
            updatedAt: '2024-11-08T16:00:00Z',
            status: 'active',
            samples: ['sample-1']
        }
    ];
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'samples':
                const language = searchParams.get('language');
                const quality = searchParams.get('quality');
                const status = searchParams.get('status');
                const search = searchParams.get('search');

                let filteredSamples = voiceSamples;

                if (language && language !== 'all') {
                    filteredSamples = filteredSamples.filter(s => s.language === language);
                }

                if (quality && quality !== 'all') {
                    filteredSamples = filteredSamples.filter(s => {
                        if (quality === 'high') return s.quality.overall >= 90;
                        if (quality === 'medium') return s.quality.overall >= 70 && s.quality.overall < 90;
                        if (quality === 'low') return s.quality.overall < 70;
                        return true;
                    });
                }

                if (status && status !== 'all') {
                    filteredSamples = filteredSamples.filter(s => s.status === status);
                }

                if (search) {
                    const searchLower = search.toLowerCase();
                    filteredSamples = filteredSamples.filter(s =>
                        s.name.toLowerCase().includes(searchLower) ||
                        s.description.toLowerCase().includes(searchLower) ||
                        s.tags.some(tag => tag.toLowerCase().includes(searchLower))
                    );
                }

                return NextResponse.json(filteredSamples);

            case 'datasets':
                return NextResponse.json(datasets);

            case 'quality-metrics':
                const totalSamples = voiceSamples.length;
                const avgQuality = voiceSamples.reduce((sum, s) => sum + s.quality.overall, 0) / totalSamples || 0;
                const avgClarity = voiceSamples.reduce((sum, s) => sum + s.quality.clarity, 0) / totalSamples || 0;
                const avgNoise = voiceSamples.reduce((sum, s) => sum + s.quality.noise, 0) / totalSamples || 0;

                const languageDistribution: Record<string, number> = {};
                const speakerDistribution: Record<string, number> = {};
                const durationDistribution = { short: 0, medium: 0, long: 0 };

                voiceSamples.forEach(sample => {
                    languageDistribution[sample.language] = (languageDistribution[sample.language] || 0) + 1;
                    speakerDistribution[sample.speaker.id] = (speakerDistribution[sample.speaker.id] || 0) + 1;

                    if (sample.duration < 5) durationDistribution.short++;
                    else if (sample.duration <= 30) durationDistribution.medium++;
                    else durationDistribution.long++;
                });

                return NextResponse.json({
                    totalSamples,
                    avgQuality: Math.round(avgQuality * 10) / 10,
                    avgClarity: Math.round(avgClarity * 10) / 10,
                    avgNoise: Math.round(avgNoise * 10) / 10,
                    languageDistribution,
                    speakerDistribution,
                    durationDistribution
                });

            default:
                return NextResponse.json({
                    samples: voiceSamples,
                    datasets: datasets
                });
        }
    } catch (error) {
        console.error('Voice data management GET error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve voice data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'upload':
                const uploadData: UploadRequest = await request.json();

                // In a real implementation, handle file uploads
                // For now, simulate sample creation
                const newSample: VoiceSample = {
                    id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: `Uploaded Sample ${voiceSamples.length + 1}`,
                    description: 'Uploaded voice sample',
                    duration: 0, // Would be calculated from actual file
                    sampleRate: 44100,
                    bitDepth: 16,
                    channels: 1,
                    fileSize: 0, // Would be from actual file
                    format: 'wav',
                    language: uploadData.language,
                    speaker: {
                        id: `speaker-${Date.now()}`,
                        name: uploadData.speakerName || 'Unknown',
                        age: parseInt(uploadData.speakerAge) || 30,
                        gender: uploadData.speakerGender,
                        accent: uploadData.speakerAccent || 'neutral',
                        nativeLanguage: uploadData.language
                    },
                    quality: {
                        overall: 0,
                        clarity: 0,
                        noise: 0,
                        consistency: 0
                    },
                    metadata: {
                        emotion: uploadData.emotion,
                        context: uploadData.context,
                        environment: uploadData.environment,
                        recordingDevice: uploadData.recordingDevice,
                        processingHistory: []
                    },
                    tags: uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    status: 'processing',
                    uploadedAt: new Date().toISOString(),
                    url: `/audio/sample-${Date.now()}.wav`
                };

                voiceSamples.push(newSample);

                // Simulate processing
                setTimeout(() => {
                    const sampleIndex = voiceSamples.findIndex(s => s.id === newSample.id);
                    if (sampleIndex !== -1) {
                        voiceSamples[sampleIndex] = {
                            ...voiceSamples[sampleIndex],
                            status: 'ready',
                            processedAt: new Date().toISOString(),
                            quality: {
                                overall: Math.floor(Math.random() * 20) + 80, // 80-99
                                clarity: Math.floor(Math.random() * 20) + 80,
                                noise: Math.floor(Math.random() * 10), // 0-9
                                consistency: Math.floor(Math.random() * 20) + 80
                            },
                            waveform: Array.from({ length: 20 }, () => Math.random())
                        };
                    }
                }, 3000);

                return NextResponse.json(newSample);

            case 'create-dataset':
                const datasetData: CreateDatasetRequest = await request.json();

                if (!datasetData.name || !datasetData.sampleIds || datasetData.sampleIds.length === 0) {
                    return NextResponse.json(
                        { error: 'Dataset name and sample IDs are required' },
                        { status: 400 }
                    );
                }

                const selectedSamples = voiceSamples.filter(s => datasetData.sampleIds.includes(s.id));
                if (selectedSamples.length === 0) {
                    return NextResponse.json(
                        { error: 'No valid samples found' },
                        { status: 400 }
                    );
                }

                const newDataset: Dataset = {
                    id: `dataset-${Date.now()}`,
                    name: datasetData.name,
                    description: datasetData.description,
                    category: datasetData.category,
                    language: datasetData.language,
                    totalSamples: selectedSamples.length,
                    totalDuration: selectedSamples.reduce((sum, s) => sum + s.duration, 0),
                    avgQuality: selectedSamples.reduce((sum, s) => sum + s.quality.overall, 0) / selectedSamples.length,
                    tags: datasetData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'active',
                    samples: datasetData.sampleIds
                };

                datasets.push(newDataset);
                return NextResponse.json(newDataset);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Voice data management POST error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
        );
    }

    try {
        switch (action) {
            case 'update-sample':
                const updateData = await request.json();
                const sampleIndex = voiceSamples.findIndex(s => s.id === id);

                if (sampleIndex === -1) {
                    return NextResponse.json(
                        { error: 'Sample not found' },
                        { status: 404 }
                    );
                }

                voiceSamples[sampleIndex] = {
                    ...voiceSamples[sampleIndex],
                    ...updateData,
                    updatedAt: new Date().toISOString()
                };

                return NextResponse.json(voiceSamples[sampleIndex]);

            case 'update-dataset':
                const datasetUpdateData = await request.json();
                const datasetIndex = datasets.findIndex(d => d.id === id);

                if (datasetIndex === -1) {
                    return NextResponse.json(
                        { error: 'Dataset not found' },
                        { status: 404 }
                    );
                }

                datasets[datasetIndex] = {
                    ...datasets[datasetIndex],
                    ...datasetUpdateData,
                    updatedAt: new Date().toISOString()
                };

                return NextResponse.json(datasets[datasetIndex]);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Voice data management PUT error:', error);
        return NextResponse.json(
            { error: 'Failed to update data' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
        );
    }

    try {
        switch (action) {
            case 'delete-sample':
                const sampleIndex = voiceSamples.findIndex(s => s.id === id);
                if (sampleIndex === -1) {
                    return NextResponse.json(
                        { error: 'Sample not found' },
                        { status: 404 }
                    );
                }

                const deletedSample = voiceSamples.splice(sampleIndex, 1)[0];
                return NextResponse.json(deletedSample);

            case 'delete-dataset':
                const datasetIndex = datasets.findIndex(d => d.id === id);
                if (datasetIndex === -1) {
                    return NextResponse.json(
                        { error: 'Dataset not found' },
                        { status: 404 }
                    );
                }

                const deletedDataset = datasets.splice(datasetIndex, 1)[0];
                return NextResponse.json(deletedDataset);

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Voice data management DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to delete data' },
            { status: 500 }
        );
    }
}