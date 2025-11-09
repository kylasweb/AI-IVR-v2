'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export default function TestingAIPage() {
    const [formData, setFormData] = useState({
        testName: '',
        testType: '',
        description: '',
        isActive: false,
        includeVoice: false
    });

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Testing Suite</h1>
                        <p className="text-muted-foreground">
                            Comprehensive testing tools for AI agents, voice systems, and automation
                        </p>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                        New Feature
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Test Configuration Form */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🧪 Test Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure your AI testing parameters and settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="testName" className="text-sm font-medium">
                                    Test Name *
                                </Label>
                                <Input
                                    id="testName"
                                    value={formData.testName}
                                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                                    placeholder="Enter test name..."
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="testType" className="text-sm font-medium">
                                    Test Type *
                                </Label>
                                <Select value={formData.testType} onValueChange={(value) => setFormData({ ...formData, testType: value })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select test type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ai_agent">AI Agent Testing</SelectItem>
                                        <SelectItem value="voice_recognition">Voice Recognition</SelectItem>
                                        <SelectItem value="conversation_flow">Conversation Flow</SelectItem>
                                        <SelectItem value="performance">Performance Testing</SelectItem>
                                        <SelectItem value="integration">Integration Testing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe what this test will validate..."
                                    rows={4}
                                    className="w-full resize-none"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                                    Run test immediately
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="includeVoice"
                                    checked={formData.includeVoice}
                                    onCheckedChange={(checked) => setFormData({ ...formData, includeVoice: Boolean(checked) })}
                                />
                                <Label htmlFor="includeVoice" className="text-sm font-medium cursor-pointer">
                                    Include voice analysis
                                </Label>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button className="flex-1">
                                    Create Test
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Save Draft
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Results Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📊 Test Results
                            </CardTitle>
                            <CardDescription>
                                Recent test executions and performance metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center py-8 text-muted-foreground">
                                    No test results available yet.
                                    Create and run a test to see results here.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Test Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Test Actions</CardTitle>
                        <CardDescription>Common testing scenarios for rapid validation</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                                🤖 <span>AI Agent Response Test</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                                🎤 <span>Voice Recognition Test</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                                📞 <span>IVR Flow Test</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ManagementLayout>
    );
}