'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Globe, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ConfigPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-500" />
                    Configuration
                </h1>
                <p className="text-muted-foreground">System configuration and settings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-500" />
                            Language Settings
                        </CardTitle>
                        <CardDescription>
                            Configure language and localization settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/config/languages">
                            <Button className="w-full">
                                Configure Languages
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-purple-500" />
                            System Settings
                        </CardTitle>
                        <CardDescription>
                            General system configuration options
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>
                            Coming Soon
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-orange-500" />
                            Regional Settings
                        </CardTitle>
                        <CardDescription>
                            Configure regional and cultural preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>
                            Coming Soon
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}