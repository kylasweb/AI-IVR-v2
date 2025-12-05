'use client';

import React, { useState } from 'react';
import ManagementLayout from '@/components/layout/management-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Plus, BarChart3, Search, Filter } from 'lucide-react';

// Modular components
import {
    TestSuiteCard,
    TestMetricsDashboard,
    TestResultsTable,
    CreateSuiteDialog
} from '@/components/voice/testing-suite';

// Custom hook for state management
import { useTestSuite, TestSuite } from '@/hooks/useTestSuite';

/**
 * Voice Testing Suite Page
 * Comprehensive testing framework for voice AI models and pipelines.
 * 
 * Refactored from 1148 lines to ~150 lines using modular components.
 */
export default function VoiceTestingSuitePage() {
    const {
        testSuites,
        selectedSuite,
        setSelectedSuite,
        loading,
        metrics,
        createSuite,
        runSuite,
        pauseSuite,
        deleteSuite,
        refreshSuites
    } = useTestSuite();

    const [showCreateSuiteDialog, setShowCreateSuiteDialog] = useState(false);
    const [showTestDetails, setShowTestDetails] = useState(false);
    const [selectedTab, setSelectedTab] = useState('suites');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter test suites based on search and filters
    const filteredSuites = testSuites.filter(suite => {
        const matchesSearch = suite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            suite.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || suite.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || suite.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleCreateSuite = (name: string, description: string, type: TestSuite['type']) => {
        createSuite(name, description, type);
    };

    const handleRunSuite = (suite: TestSuite) => {
        runSuite(suite.id);
    };

    const handlePauseSuite = (suite: TestSuite) => {
        pauseSuite(suite.id);
    };

    const handleViewDetails = (suite: TestSuite) => {
        setSelectedSuite(suite);
        setShowTestDetails(true);
    };

    return (
        <ManagementLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <TestTube className="h-8 w-8 text-purple-600" />
                            Voice Testing Suite
                        </h1>
                        <p className="text-muted-foreground">
                            Comprehensive testing framework for voice AI models and pipelines
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                        </Button>
                        <Button size="sm" onClick={() => setShowCreateSuiteDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Test Suite
                        </Button>
                    </div>
                </div>

                {/* Metrics Dashboard */}
                <TestMetricsDashboard metrics={metrics} />

                {/* Main Content Tabs */}
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="suites">Test Suites</TabsTrigger>
                        <TabsTrigger value="results">Test Results</TabsTrigger>
                        <TabsTrigger value="configurations">Configurations</TabsTrigger>
                        <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    </TabsList>

                    <TabsContent value="suites" className="space-y-6">
                        {/* Search and Filters */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search test suites..."
                                                className="pl-10"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="quality">Quality</SelectItem>
                                            <SelectItem value="accuracy">Accuracy</SelectItem>
                                            <SelectItem value="latency">Latency</SelectItem>
                                            <SelectItem value="performance">Performance</SelectItem>
                                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="running">Running</SelectItem>
                                            <SelectItem value="idle">Idle</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Test Suites List */}
                        <div className="grid grid-cols-1 gap-4">
                            {filteredSuites.map((suite) => (
                                <TestSuiteCard
                                    key={suite.id}
                                    suite={suite}
                                    onRun={handleRunSuite}
                                    onPause={handlePauseSuite}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}

                            {filteredSuites.length === 0 && (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No Test Suites Found</h3>
                                        <p className="text-muted-foreground mb-4">
                                            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                                                ? 'No test suites match your filters.'
                                                : 'Create your first test suite to get started.'}
                                        </p>
                                        <Button onClick={() => setShowCreateSuiteDialog(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Test Suite
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="results">
                        <TestResultsTable testSuites={testSuites} metrics={metrics} />
                    </TabsContent>

                    <TabsContent value="configurations">
                        <Card>
                            <CardHeader>
                                <CardTitle>Test Configurations</CardTitle>
                                <CardDescription>
                                    Configure test parameters and settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-12">
                                <p className="text-muted-foreground">
                                    Configuration management coming soon...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="monitoring">
                        <Card>
                            <CardHeader>
                                <CardTitle>Real-time Monitoring</CardTitle>
                                <CardDescription>
                                    Monitor test execution in real-time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center py-12">
                                <p className="text-muted-foreground">
                                    Real-time monitoring coming soon...
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Create Suite Dialog */}
                <CreateSuiteDialog
                    open={showCreateSuiteDialog}
                    onOpenChange={setShowCreateSuiteDialog}
                    onCreate={handleCreateSuite}
                />
            </div>
        </ManagementLayout>
    );
}