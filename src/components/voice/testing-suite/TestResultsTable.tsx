'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VoiceStatusBadge } from '@/components/voice/common/VoiceStatusBadge';
import { TestSuite, TestCase, SuiteMetrics } from '@/hooks/useTestSuite';

interface TestResultsTableProps {
    testSuites: TestSuite[];
    metrics: SuiteMetrics;
}

/**
 * Component for displaying detailed test results in table format
 * with summary metrics and analysis.
 */
export function TestResultsTable({ testSuites, metrics }: TestResultsTableProps) {
    const allTestCases = testSuites.flatMap(suite => suite.testCases);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{metrics.passedTests}</div>
                            <div className="text-sm text-muted-foreground">Tests Passed</div>
                            <div className="mt-2">
                                <Progress
                                    value={metrics.totalTests > 0 ? (metrics.passedTests / metrics.totalTests) * 100 : 0}
                                    className="h-2"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{metrics.avgAccuracy}%</div>
                            <div className="text-sm text-muted-foreground">Average Accuracy</div>
                            <div className="mt-2">
                                <Progress value={metrics.avgAccuracy} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">{metrics.avgQuality}%</div>
                            <div className="text-sm text-muted-foreground">Average Quality</div>
                            <div className="mt-2">
                                <Progress value={metrics.avgQuality} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Test Results</CardTitle>
                    <CardDescription>Detailed results from all test suites</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Test Case</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Accuracy</TableHead>
                                <TableHead>Latency</TableHead>
                                <TableHead>Quality</TableHead>
                                <TableHead>Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allTestCases.map(testCase => (
                                <TableRow key={testCase.id}>
                                    <TableCell className="font-medium">{testCase.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{testCase.type.toUpperCase()}</Badge>
                                    </TableCell>
                                    <TableCell>{testCase.modelId}</TableCell>
                                    <TableCell>
                                        <VoiceStatusBadge status={testCase.status} />
                                    </TableCell>
                                    <TableCell>{testCase.metrics.accuracy || 0}%</TableCell>
                                    <TableCell>{testCase.metrics.latency || 0}s</TableCell>
                                    <TableCell>{testCase.metrics.quality || 0}%</TableCell>
                                    <TableCell>{testCase.duration || 0}s</TableCell>
                                </TableRow>
                            ))}
                            {allTestCases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                        No test results available
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default TestResultsTable;
