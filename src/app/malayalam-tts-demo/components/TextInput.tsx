import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Play } from 'lucide-react';

interface TextInputProps {
    text: string;
    onChange: (text: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

export function TextInput({ text, onChange, onGenerate, isLoading }: TextInputProps) {
    return (
        <Card className="shadow-lg border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle>Text Input</CardTitle>
                <CardDescription>Enter Malayalam, Manglish, or English text</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Textarea
                    value={text}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="നിങ്ങളുടെ ടെക്സ്റ്റ് ഇവിടെ ടൈപ്പ് ചെയ്യുക..."
                    className="min-h-[150px] text-lg font-malayalam"
                    dir="auto"
                />
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">{text.length} characters</span>
                    <Button
                        onClick={onGenerate}
                        disabled={isLoading || !text.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" />
                                Generate Speech
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
