'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, Globe, Database, CheckCircle, AlertCircle, Code } from 'lucide-react';

export default function AdminIntegrationsPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-500" />
                    Integrations
                </h1>
                <p className="text-muted-foreground">Manage third-party integrations and API connections</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Stripe Payment Gateway
                        </CardTitle>
                        <CardDescription>
                            Payment processing and billing integration
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Connected
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                            Configure
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            Webhook Endpoints
                        </CardTitle>
                        <CardDescription>
                            Real-time event notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                5 Active
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                            Manage Webhooks
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-green-500" />
                            External Databases
                        </CardTitle>
                        <CardDescription>
                            Connect to external data sources
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                2 Pending
                            </Badge>
                        </div>
                        <Button size="sm" className="w-full">
                            Setup Connection
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-orange-500" />
                            API Gateway
                        </CardTitle>
                        <CardDescription>
                            Third-party API management
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Active
                            </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                            API Settings
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-purple-500" />
                            Cloud Services
                        </CardTitle>
                        <CardDescription>
                            AWS, Azure, and GCP integrations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Setup Required
                            </Badge>
                        </div>
                        <Button size="sm" className="w-full">
                            Configure Cloud
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-red-500" />
                            Custom Integrations
                        </CardTitle>
                        <CardDescription>
                            Build and manage custom API integrations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-4">
                            <Badge variant="secondary">3 Active</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                            Custom APIs
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Integration Logs</CardTitle>
                    <CardDescription>
                        Recent integration activity and error logs
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Stripe webhook received</p>
                                <p className="text-xs text-muted-foreground">Payment processed successfully</p>
                            </div>
                            <Badge variant="secondary">2 min ago</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Database sync completed</p>
                                <p className="text-xs text-muted-foreground">External data synchronized</p>
                            </div>
                            <Badge variant="secondary">5 min ago</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="text-sm font-medium">API rate limit exceeded</p>
                                <p className="text-xs text-muted-foreground">Third-party API call failed</p>
                            </div>
                            <Badge variant="destructive">10 min ago</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}