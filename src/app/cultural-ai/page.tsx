'use client';

import React from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Globe,
    Globe as Languages,
    Star as Heart,
    Users,
    TrendingUp,
    Brain,
    Mic,
    MessageSquare,
    Settings,
    Activity,
    CheckCircle
} from 'lucide-react';

export default function CulturalAIPage() {
    return (
        <ManagementLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cultural AI</h1>
                        <p className="text-gray-600 mt-2">
                            AI-powered cultural intelligence and localization system
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                        </Button>
                        <Button size="sm">
                            <Brain className="mr-2 h-4 w-4" />
                            Train Model
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Languages</CardTitle>
                            <Languages className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                +2 new this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cultural Accuracy</CardTitle>
                            <Globe className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">94.8%</div>
                            <p className="text-xs text-muted-foreground">
                                +3.2% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4.7/5</div>
                            <p className="text-xs text-muted-foreground">
                                +0.3 from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8,542</div>
                            <p className="text-xs text-muted-foreground">
                                +15% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cultural Context Models</CardTitle>
                            <CardDescription>
                                Manage and train cultural understanding models
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Malayalam', 'Hindi', 'Tamil', 'Bengali'].map((lang) => (
                                    <div key={lang} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{lang}</span>
                                            <Badge variant="outline">Active</Badge>
                                        </div>
                                        <Progress value={Math.random() * 100} className="w-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Real-time Translation</CardTitle>
                            <CardDescription>
                                Monitor live translation and cultural adaptation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Translation Quality</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">Excellent</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Processing Speed</span>
                                        <span>0.8s avg</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Cultural Adaptation Rate</span>
                                        <span>92.3%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Context Accuracy</span>
                                        <span>94.8%</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Cultural Interactions</CardTitle>
                        <CardDescription>
                            Latest AI cultural understanding activities
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { lang: 'Malayalam', context: 'Festival greetings', accuracy: 95.2 },
                                { lang: 'Hindi', context: 'Business etiquette', accuracy: 87.8 },
                                { lang: 'Tamil', context: 'Family conversation', accuracy: 92.1 },
                                { lang: 'Bengali', context: 'Cultural celebration', accuracy: 89.4 }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium">{item.lang} - {item.context}</p>
                                            <p className="text-xs text-gray-500">2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">Success</Badge>
                                        <span className="text-sm text-gray-500">{item.accuracy}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ManagementLayout>
    );
}