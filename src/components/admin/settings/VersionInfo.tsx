'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Tag, ExternalLink } from 'lucide-react';
import { GitCommit, GitRelease } from './types';

interface VersionInfoProps {
    commits: GitCommit[];
    releases: GitRelease[];
}

/**
 * Component to display version info, recent commits, and releases.
 */
export function VersionInfo({ commits, releases }: VersionInfoProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Commits */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Recent Commits
                    </CardTitle>
                    <CardDescription>Latest code changes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {commits.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No commits available</p>
                        ) : (
                            commits.slice(0, 5).map((commit) => (
                                <div key={commit.sha} className="flex items-start gap-3 text-sm">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {commit.sha.substring(0, 7)}
                                    </code>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate">{commit.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {commit.author} • {new Date(commit.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Releases */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Releases
                    </CardTitle>
                    <CardDescription>Published versions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {releases.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No releases available</p>
                        ) : (
                            releases.slice(0, 5).map((release) => (
                                <div key={release.tag} className="flex items-start gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={release.isPrerelease ? "secondary" : "default"}>
                                            {release.tag}
                                        </Badge>
                                        {release.isPrerelease && (
                                            <Badge variant="outline" className="text-xs">Pre-release</Badge>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{release.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(release.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <a href={release.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default VersionInfo;
