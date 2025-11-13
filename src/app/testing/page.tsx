'use client';

import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Bot, Mic, Activity } from 'lucide-react';
import Link from 'next/link';

export default function TestingPage() {
    return (
        <ManagementLayout title="Testing & QA" subtitle="Quality assurance and testing tools">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <TestTube className="h-6 w-6 text-green-500" />
                        Testing & QA
                    </h1>
                    <p className="text-muted-foreground">Quality assurance and testing tools</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-blue-500" />
                                AI Testing Suite
                            </CardTitle>
                            <CardDescription>
                                Comprehensive AI model and agent testing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/testing/ai">
                                <Button className="w-full">
                                    Run AI Tests
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-purple-500" />
                                Automation Tests
                            </CardTitle>
                            <CardDescription>
                                Automated testing workflows and scripts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/testing/automation">
                                <Button className="w-full">
                                    Run Automation Tests
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mic className="h-5 w-5 text-orange-500" />
                                Voice AI Agent Tests
                            </CardTitle>
                            <CardDescription>
                                Voice AI agent performance and accuracy testing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/testing/voice-ai">
                                <Button className="w-full">
                                    Test Voice AI
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-500" />
                                Performance Testing
                            </CardTitle>
                            <CardDescription>
                                Load testing and performance benchmarks
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/testing/performance">
                                <Button className="w-full">
                                    Run Performance Tests
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ManagementLayout>
    );
}