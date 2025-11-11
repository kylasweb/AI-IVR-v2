'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, HardDrive, Activity, Folder, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminDatabasePage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Database className="h-6 w-6 text-green-500" />
                    Database Management
                </h1>
                <p className="text-muted-foreground">Monitor and manage database performance and operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Database Size
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.4 GB</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Active Connections
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">47</div>
                        <p className="text-xs text-muted-foreground">Max: 100 connections</p>
                        <Progress value={47} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Storage Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68%</div>
                        <p className="text-xs text-muted-foreground">4.2 GB of 6.0 GB</p>
                        <Progress value={68} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Query Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94ms</div>
                        <p className="text-xs text-muted-foreground">Average query time</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Database Tables
                        </CardTitle>
                        <CardDescription>
                            Overview of database tables and their status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Users</p>
                                    <p className="text-xs text-muted-foreground">1,247 records</p>
                                </div>
                                <Badge variant="secondary">Healthy</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Calls</p>
                                    <p className="text-xs text-muted-foreground">45,231 records</p>
                                </div>
                                <Badge variant="secondary">Healthy</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">Workflows</p>
                                    <p className="text-xs text-muted-foreground">156 records</p>
                                </div>
                                <Badge variant="secondary">Healthy</Badge>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <p className="text-sm font-medium">AI Agents</p>
                                    <p className="text-xs text-muted-foreground">89 records</p>
                                </div>
                                <Badge variant="destructive">Needs Optimization</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Folder className="h-5 w-5" />
                            Backup & Recovery
                        </CardTitle>
                        <CardDescription>
                            Database backup status and recovery options
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Last Backup</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                                <Badge variant="secondary">Success</Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Backup Size</p>
                                    <p className="text-xs text-muted-foreground">2.1 GB</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Button className="w-full">
                                    <Folder className="h-4 w-4 mr-2" />
                                    Create Backup Now
                                </Button>

                                <Button variant="outline" className="w-full">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Restore from Backup
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Database Health Alerts
                    </CardTitle>
                    <CardDescription>
                        Recent database issues and performance alerts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">High connection count</p>
                                    <p className="text-xs text-muted-foreground">47 active connections (47% of limit)</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Warning</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Index optimization completed</p>
                                    <p className="text-xs text-muted-foreground">AI Agents table indexes rebuilt</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Info</Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <HardDrive className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Storage cleanup completed</p>
                                    <p className="text-xs text-muted-foreground">Freed 234 MB of disk space</p>
                                </div>
                            </div>
                            <Badge variant="secondary">Success</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Database Operations</CardTitle>
                    <CardDescription>
                        Advanced database management tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <RefreshCw className="h-6 w-6" />
                            <span className="text-xs">Optimize Tables</span>
                        </Button>

                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Database className="h-6 w-6" />
                            <span className="text-xs">Run Diagnostics</span>
                        </Button>

                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <HardDrive className="h-6 w-6" />
                            <span className="text-xs">Clean Storage</span>
                        </Button>

                        <Button variant="outline" className="h-20 flex-col gap-2">
                            <Activity className="h-6 w-6" />
                            <span className="text-xs">Performance Report</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}