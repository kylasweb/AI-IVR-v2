'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';
import { VoiceStatusBadge } from '@/components/voice/common/VoiceStatusBadge';
import { TrainingJob } from '@/hooks/useVoiceModels';

interface TrainingJobsListProps {
    jobs: TrainingJob[];
}

/**
 * Component for displaying training jobs with progress.
 */
export function TrainingJobsList({ jobs }: TrainingJobsListProps) {
    if (jobs.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Training Jobs</CardTitle>
                    <CardDescription>
                        Monitor ongoing model training and fine-tuning jobs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Training Jobs</h3>
                        <p className="text-muted-foreground">
                            No models are currently being trained.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Training Jobs</CardTitle>
                <CardDescription>
                    Monitor ongoing model training and fine-tuning jobs
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Card key={job.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-medium">{job.modelName}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Started {new Date(job.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <VoiceStatusBadge status={job.status} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{job.progress}%</span>
                                    </div>
                                    <Progress value={job.progress} className="w-full" />
                                </div>

                                {job.currentEpoch && job.totalEpochs && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Epoch {job.currentEpoch} of {job.totalEpochs}
                                    </div>
                                )}

                                {job.loss !== undefined && (
                                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                        <div>Loss: {job.loss.toFixed(4)}</div>
                                        <div>Accuracy: {job.accuracy}%</div>
                                    </div>
                                )}

                                {job.estimatedCompletion && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Estimated completion: {new Date(job.estimatedCompletion).toLocaleString()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default TrainingJobsList;
