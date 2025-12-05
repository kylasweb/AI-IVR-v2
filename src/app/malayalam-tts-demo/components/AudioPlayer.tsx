import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface AudioPlayerProps {
    lastResult: any;
    isPlaying: boolean;
    volume: number[];
    onPlayPause: () => void;
    onVolumeChange: (value: number[]) => void;
    onDownload: () => void;
    voiceName?: string;
}

export function AudioPlayer({
    lastResult,
    isPlaying,
    volume,
    onPlayPause,
    onVolumeChange,
    onDownload,
    voiceName
}: AudioPlayerProps) {
    if (!lastResult) return null;

    return (
        <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle>Audio Player</CardTitle>
                <CardDescription>Voice: {voiceName}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Waveform Visualization */}
                    <div className="h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <div className="flex items-end gap-1 h-16">
                            {[...Array(40)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-purple-600 rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 100}%`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={onPlayPause}
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>

                        <div className="flex-1 flex items-center gap-3">
                            <Volume2 className="h-5 w-5 text-gray-600" />
                            <Slider
                                value={volume}
                                onValueChange={onVolumeChange}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-sm text-gray-600 w-12">{volume[0]}%</span>
                        </div>

                        <Button onClick={onDownload} variant="outline" size="lg">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Audio Info */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <InfoItem label="Duration" value={`${lastResult.duration}s`} />
                        <InfoItem label="Quality" value={lastResult.quality} capitalize />
                        <InfoItem label="Engine" value={lastResult.ttsEngine?.replace('_', ' ')} capitalize />
                        <InfoItem label="Processing Time" value={`${Math.round(lastResult.processingTime)}ms`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function InfoItem({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-lg font-semibold ${capitalize ? 'capitalize' : ''}`}>{value}</p>
        </div>
    );
}
