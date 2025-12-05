import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { SAMPLE_PHRASES } from '../constants';

interface SamplePhrasesProps {
    onSelectPhrase: (phrase: string) => void;
}

export function SamplePhrases({ onSelectPhrase }: SamplePhrasesProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Sample Phrases</CardTitle>
                <CardDescription>Click to try common Malayalam phrases</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={SAMPLE_PHRASES[0].category}>
                    <TabsList className="grid w-full grid-cols-3">
                        {SAMPLE_PHRASES.map((category) => (
                            <TabsTrigger key={category.category} value={category.category}>
                                {category.category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {SAMPLE_PHRASES.map((category) => (
                        <TabsContent key={category.category} value={category.category} className="space-y-2">
                            {category.phrases.map((phrase, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="w-full justify-start text-left h-auto py-3"
                                    onClick={() => onSelectPhrase(phrase)}
                                >
                                    <Play className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="font-malayalam">{phrase}</span>
                                </Button>
                            ))}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
