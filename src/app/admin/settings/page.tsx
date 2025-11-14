'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, BellRing, Database, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-500" />
                    System Settings
                </h1>
                <p className="text-muted-foreground">General system configuration and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BellRing className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Configure system-wide notification preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Email Notifications</Label>
                                <p className="text-xs text-muted-foreground">Send email alerts for system events</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>SMS Notifications</Label>
                                <p className="text-xs text-muted-foreground">Send SMS alerts for critical events</p>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">Browser push notifications</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            System Preferences
                        </CardTitle>
                        <CardDescription>
                            General system behavior settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Auto-save</Label>
                                <p className="text-xs text-muted-foreground">Automatically save changes</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Dark Mode</Label>
                                <p className="text-xs text-muted-foreground">Enable dark theme by default</p>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Debug Mode</Label>
                                <p className="text-xs text-muted-foreground">Show debug information</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                        Advanced system configuration options
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Security Settings
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Database className="h-4 w-4 mr-2" />
                            Database Configuration
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Performance Tuning
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}