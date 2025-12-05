import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MALAYALAM_VOICES, DIALECTS, EMOTIONS, type VoiceId, type DialectId, type EmotionId } from '../constants';

interface SettingsPanelProps {
    selectedVoice: VoiceId;
    onVoiceChange: (voice: VoiceId) => void;
    dialect: DialectId;
    onDialectChange: (dialect: DialectId) => void;
    emotion: EmotionId;
    onEmotionChange: (emotion: EmotionId) => void;
}

export function SettingsPanel({
    selectedVoice,
    onVoiceChange,
    dialect,
    onDialectChange,
    emotion,
    onEmotionChange
}: SettingsPanelProps) {
    return (
        <div className="space-y-6">
            {/* Voice Selection */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Voice Selection</CardTitle>
                    <CardDescription>Choose your preferred voice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {MALAYALAM_VOICES.map((voice) => (
                        <Button
                            key={voice.id}
                            variant={selectedVoice === voice.id ? 'default' : 'outline'}
                            className={`w-full justify-start h-auto py-4 ${selectedVoice === voice.id ? 'bg-purple-600 hover:bg-purple-700' : ''
                                }`}
                            onClick={() => onVoiceChange(voice.id)}
                        >
                            <div className="text-left w-full">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{voice.name}</p>
                                    {voice.recommended && (
                                        <Badge variant="secondary" className="text-xs">
                                            Recommended
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs opacity-80">{voice.description}</p>
                            </div>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            {/* Dialect Selection */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Dialect</CardTitle>
                    <CardDescription>Regional variation</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={dialect} onValueChange={onDialectChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DIALECTS.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Emotion/Style */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Emotion Style</CardTitle>
                    <CardDescription>Voice tone and style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {EMOTIONS.map((e) => (
                        <Button
                            key={e.id}
                            variant={emotion === e.id ? 'default' : 'outline'}
                            className={`w-full justify-start ${emotion === e.id ? 'bg-purple-600 hover:bg-purple-700' : ''
                                }`}
                            onClick={() => onEmotionChange(e.id)}
                        >
                            <span className="mr-2 text-xl">{e.icon}</span>
                            {e.name}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
