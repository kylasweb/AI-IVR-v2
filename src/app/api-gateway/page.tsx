'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Activity,
    Plus,
    Settings,
    Shield,
    Globe,
    Zap,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    Clock,
    Database,
    Users,
    Trash2,
    Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface APIEndpoint {
    id: string;
    name: string;
    path: string;
    method: string;
    status: 'active' | 'inactive' | 'maintenance';
    requests: number;
    latency: number;
    uptime: number;
}

export default function APIGatewayPage() {
    const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
        {
            id: '1',
            name: 'IVR Configuration API',
            path: '/api/ivr/configurations',
            method: 'GET',
            status: 'active',
            requests: 1245,
            latency: 45,
            uptime: 99.9
        },
        {
            id: '2',
            name: 'AI Agents API',
            path: '/api/ai-agents',
            method: 'POST',
            status: 'active',
            requests: 892,
            latency: 120,
            uptime: 98.7
        },
        {
            id: '3',
            name: 'Voice Processing API',
            path: '/api/voice/process',
            method: 'POST',
            status: 'maintenance',
            requests: 2156,
            latency: 78,
            uptime: 97.3
        }
    ]);

    // Add Endpoint Dialog State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newEndpoint, setNewEndpoint] = useState({
        name: '',
        path: '',
        method: 'GET',
        description: '',
        authentication: true,
        rateLimit: 100
    });

    const handleAddEndpoint = () => {
        if (!newEndpoint.name || !newEndpoint.path) {
            toast({
                title: "Error",
                description: "Name and path are required",
                variant: "destructive"
            });
            return;
        }

        const endpoint: APIEndpoint = {
            id: Date.now().toString(),
            name: newEndpoint.name,
            path: newEndpoint.path,
            method: newEndpoint.method,
            status: 'active',
            requests: 0,
            latency: 0,
            uptime: 100
        };

        setEndpoints(prev => [...prev, endpoint]);
        setNewEndpoint({
            name: '',
            path: '',
            method: 'GET',
            description: '',
            authentication: true,
            rateLimit: 100
        });
        setIsAddDialogOpen(false);

        toast({
            title: "Success",
            description: "Endpoint added successfully",
        });
    };

    const handleDeleteEndpoint = (id: string) => {
        setEndpoints(prev => prev.filter(ep => ep.id !== id));
        toast({
            title: "Success",
            description: "Endpoint deleted successfully",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-800';
            case 'POST': return 'bg-green-100 text-green-800';
            case 'PUT': return 'bg-orange-100 text-orange-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">API Gateway</h1>
                        <p className="text-muted-foreground">
                            Centralized API management for frontend-backend integration
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge variant="secondary">New Feature</Badge>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Endpoint
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New API Endpoint</DialogTitle>
                                    <DialogDescription>
                                        Configure a new API endpoint for your application
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="endpoint-name">Endpoint Name *</Label>
                                            <Input
                                                id="endpoint-name"
                                                value={newEndpoint.name}
                                                onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
                                                placeholder="e.g., User Management API"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endpoint-method">HTTP Method *</Label>
                                            <Select
                                                value={newEndpoint.method}
                                                onValueChange={(value) => setNewEndpoint({ ...newEndpoint, method: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GET">GET</SelectItem>
                                                    <SelectItem value="POST">POST</SelectItem>
                                                    <SelectItem value="PUT">PUT</SelectItem>
                                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endpoint-path">API Path *</Label>
                                        <Input
                                            id="endpoint-path"
                                            value={newEndpoint.path}
                                            onChange={(e) => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
                                            placeholder="e.g., /api/users"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endpoint-description">Description</Label>
                                        <Textarea
                                            id="endpoint-description"
                                            value={newEndpoint.description}
                                            onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
                                            placeholder="Brief description of what this endpoint does..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <Label className="text-sm font-medium">Authentication Required</Label>
                                                <p className="text-xs text-muted-foreground">Require API key or token</p>
                                            </div>
                                            <Switch
                                                checked={newEndpoint.authentication}
                                                onCheckedChange={(checked) => setNewEndpoint({ ...newEndpoint, authentication: checked })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="rate-limit">Rate Limit (req/min)</Label>
                                            <Input
                                                id="rate-limit"
                                                type="number"
                                                value={newEndpoint.rateLimit}
                                                onChange={(e) => setNewEndpoint({ ...newEndpoint, rateLimit: parseInt(e.target.value) || 100 })}
                                                placeholder="100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddEndpoint}>
                                        Add Endpoint
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-2xl font-bold">{endpoints.length}</p>
                                <p className="text-sm text-muted-foreground">Total Endpoints</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {endpoints.filter(e => e.status === 'active').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Active</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <BarChart3 className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {endpoints.reduce((acc, e) => acc + e.requests, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Total Requests</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center gap-2 p-6">
                            <Clock className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {(endpoints.reduce((acc, e) => acc + e.latency, 0) / endpoints.length).toFixed(0)}ms
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Latency</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="endpoints" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="routing">Routing</TabsTrigger>
                        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    </TabsList>

                    <TabsContent value="endpoints" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>API Endpoints</CardTitle>
                                <CardDescription>
                                    Manage and monitor all API endpoints
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {endpoints.map((endpoint) => (
                                        <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <Badge className={getMethodColor(endpoint.method)} variant="secondary">
                                                        {endpoint.method}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{endpoint.name}</p>
                                                    <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{endpoint.requests} requests</p>
                                                    <p className="text-sm text-muted-foreground">{endpoint.latency}ms avg</p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{endpoint.uptime}% uptime</p>
                                                    <Badge className={getStatusColor(endpoint.status)} variant="secondary">
                                                        {endpoint.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteEndpoint(endpoint.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Security Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure authentication, rate limiting, and security policies
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="text-base font-medium">API Key Authentication</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Require API keys for all endpoints
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="text-base font-medium">Rate Limiting</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Limit requests per minute per client
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="text-base font-medium">CORS Protection</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Enable Cross-Origin Resource Sharing protection
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <Label className="text-base font-medium">Request Logging</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Log all API requests for security monitoring
                                            </p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="routing" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Request Routing
                                </CardTitle>
                                <CardDescription>
                                    Configure how requests are routed to backend services
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="text-center py-8">
                                        <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Routing Configuration</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Advanced routing features coming soon. Configure load balancing,
                                            path rewriting, and service discovery.
                                        </p>
                                        <Button>Configure Routing Rules</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    API Monitoring & Analytics
                                </CardTitle>
                                <CardDescription>
                                    Monitor API performance and usage analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="text-center py-8">
                                        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Detailed API analytics including request patterns, error rates,
                                            and performance metrics will be available here.
                                        </p>
                                        <Button>View Full Analytics</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common API management tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                                <Zap className="h-6 w-6" />
                                <span>Performance Test</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                                <Shield className="h-6 w-6" />
                                <span>Security Scan</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-2">
                                <Database className="h-6 w-6" />
                                <span>Export Logs</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ManagementLayout>
    );
}