'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2, MessageSquare, CheckCircle } from 'lucide-react';

export default function VoiceAIPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Mic className="h-6 w-6 text-orange-500" />
                    Voice AI Agent Tests
                </h1>
                <p className="text-muted-foreground">Voice AI agent performance and accuracy testing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Volume2 className="h-5 w-5" />
                            Speech Recognition Tests
                        </CardTitle>
                        <CardDescription>
                            Test accuracy of speech-to-text conversion
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Accuracy Rate</span>
                                <Badge variant="secondary">94.2%</Badge>
                            </div>
                            <Button className="w-full">
                                Run Recognition Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Response Generation Tests
                        </CardTitle>
                        <CardDescription>
                            Test AI response quality and relevance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Response Quality</span>
                                <Badge variant="secondary">87.5%</Badge>
                            </div>
                            <Button className="w-full">
                                Run Response Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Test Scenarios</CardTitle>
                    <CardDescription>
                        Predefined test scenarios for voice AI evaluation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Customer Service Scenario</h4>
                                <p className="text-sm text-muted-foreground">Test common customer service interactions</p>
                            </div>
                            <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Run Test
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Technical Support Scenario</h4>
                                <p className="text-sm text-muted-foreground">Test technical issue resolution</p>
                            </div>
                            <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Run Test
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Sales Inquiry Scenario</h4>
                                <p className="text-sm text-muted-foreground">Test sales and product information</p>
                            </div>
                            <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Run Test
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}