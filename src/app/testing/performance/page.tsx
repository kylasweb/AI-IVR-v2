'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

export default function PerformancePage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Activity className="h-6 w-6 text-red-500" />
                    Performance Testing
                </h1>
                <p className="text-muted-foreground">Load testing and performance benchmarks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Response Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">245ms</div>
                        <p className="text-xs text-muted-foreground">Average response time</p>
                        <Progress value={75} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Throughput
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2K</div>
                        <p className="text-xs text-muted-foreground">Requests per second</p>
                        <Progress value={85} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Uptime
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.9%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                        <Progress value={99} className="mt-2" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Load Testing Scenarios</CardTitle>
                    <CardDescription>
                        Run performance tests under various load conditions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Light Load Test</h3>
                                <p className="text-sm text-muted-foreground">50 concurrent users, 5 minutes</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Ready</Badge>
                                <Button>
                                    <Activity className="h-4 w-4 mr-2" />
                                    Run Test
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Medium Load Test</h3>
                                <p className="text-sm text-muted-foreground">200 concurrent users, 10 minutes</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Ready</Badge>
                                <Button>
                                    <Activity className="h-4 w-4 mr-2" />
                                    Run Test
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Heavy Load Test</h3>
                                <p className="text-sm text-muted-foreground">500 concurrent users, 15 minutes</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Ready</Badge>
                                <Button>
                                    <Activity className="h-4 w-4 mr-2" />
                                    Run Test
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <h3 className="font-medium">Stress Test</h3>
                                <p className="text-sm text-muted-foreground">1000+ concurrent users, until failure</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Advanced</Badge>
                                <Button variant="outline">
                                    <Activity className="h-4 w-4 mr-2" />
                                    Run Test
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}