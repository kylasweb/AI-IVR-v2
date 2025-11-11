'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Play, CheckCircle } from 'lucide-react';

export default function AutomationPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Bot className="h-6 w-6 text-purple-500" />
                    Automation Tests
                </h1>
                <p className="text-muted-foreground">Automated testing workflows and scripts</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Automation Test Suite</CardTitle>
                    <CardDescription>
                        Run automated tests for system components and workflows
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">IVR Flow Tests</h3>
                                <p className="text-sm text-muted-foreground">Test complete IVR call flows</p>
                            </div>
                            <Button>
                                <Play className="h-4 w-4 mr-2" />
                                Run Tests
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">API Integration Tests</h3>
                                <p className="text-sm text-muted-foreground">Test API endpoints and integrations</p>
                            </div>
                            <Button>
                                <Play className="h-4 w-4 mr-2" />
                                Run Tests
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Database Tests</h3>
                                <p className="text-sm text-muted-foreground">Test database operations and migrations</p>
                            </div>
                            <Button>
                                <Play className="h-4 w-4 mr-2" />
                                Run Tests
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}