'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Clock, KeyIcon, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminSecurityPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="h-6 w-6 text-red-500" />
                    Security & Permissions
                </h1>
                <p className="text-muted-foreground">Manage system security settings and user permissions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Authentication Settings
                        </CardTitle>
                        <CardDescription>
                            Configure login and authentication policies
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Two-Factor Authentication</label>
                                <p className="text-xs text-muted-foreground">Require 2FA for all users</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Password Complexity</label>
                                <p className="text-xs text-muted-foreground">Enforce strong passwords</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Session Timeout</label>
                                <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyIcon className="h-5 w-5" />
                            Access Control
                        </CardTitle>
                        <CardDescription>
                            Manage role-based access permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Role-Based Access</label>
                                <p className="text-xs text-muted-foreground">Enable RBAC system</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Audit Logging</label>
                                <p className="text-xs text-muted-foreground">Log all access attempts</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">IP Whitelisting</label>
                                <p className="text-xs text-muted-foreground">Restrict access by IP</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Security Monitoring
                    </CardTitle>
                    <CardDescription>
                        Real-time security monitoring and alerts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <p className="text-sm text-muted-foreground">Active Threats</p>
                        </div>

                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">1,247</div>
                            <p className="text-sm text-muted-foreground">Failed Login Attempts</p>
                        </div>

                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">23</div>
                            <p className="text-sm text-muted-foreground">Suspicious Activities</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">Multiple failed login attempts</p>
                                    <p className="text-xs text-muted-foreground">IP: 192.168.1.100 - 5 attempts in 10 minutes</p>
                                </div>
                            </div>
                            <Badge variant="secondary">High</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Security scan completed</p>
                                    <p className="text-xs text-muted-foreground">No vulnerabilities found</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Info</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Firewall rules updated</p>
                                    <p className="text-xs text-muted-foreground">New rules applied successfully</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Info</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security Policies</CardTitle>
                    <CardDescription>
                        Configure security policies and compliance settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Password Policies
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Encryption Settings
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <KeyIcon className="h-4 w-4 mr-2" />
                            API Key Management
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Eye className="h-4 w-4 mr-2" />
                            Privacy & Compliance
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}