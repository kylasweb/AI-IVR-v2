// Enhanced Custom Node Components
// React components for Chain of Thought, Team Orchestration, and Polyglot Expansion nodes

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Brain,
    Users,
    Globe,
    Zap,
    Heart,
    Star,
    Shield,
    CheckCircle,
    AlertTriangle,
    X,
    Settings,
    Eye,
    EyeOff,
    Info,
    Clock,
    TrendingUp,
    Languages,
    Target,
    Network
} from 'lucide-react';

interface EnhancedNodeData {
    label: string;
    type: string;
    config: Record<string, any>;
    executionStatus?: 'success' | 'error' | 'running' | 'idle';
    description?: string;
    phase?: number;
    culturalIntelligence?: boolean;
    malayalamSpecific?: boolean;
    autonomyLevel?: 'low' | 'medium' | 'high' | 'maximum';
    supportedLanguages?: string[];
    performance?: {
        averageTime?: number;
        successRate?: number;
        culturalAccuracy?: number;
    };
}

// Chain of Thought Reasoning Node
export const CoTReasoningNode: React.FC<NodeProps<EnhancedNodeData>> = ({ data, selected, id }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusColor = () => {
        switch (data.executionStatus) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'running': return 'bg-blue-500 animate-pulse';
            default: return 'bg-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (data.executionStatus) {
            case 'success': return <CheckCircle className="w-3 h-3 text-white" />;
            case 'error': return <X className="w-3 h-3 text-white" />;
            case 'running': return <Clock className="w-3 h-3 text-white animate-spin" />;
            default: return <Brain className="w-3 h-3 text-white" />;
        }
    };

    return (
        <div
            className={`relative bg-white border-2 rounded-xl shadow-lg transition-all duration-300 ${selected ? 'border-purple-500 shadow-purple-200' : 'border-purple-200'
                } hover:shadow-xl min-w-[280px] max-w-[320px]`}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-purple-500 hover:bg-purple-600 transition-colors"
                id={`${id}-input`}
            />

            {/* Status Indicator */}
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${getStatusColor()} flex items-center justify-center border-2 border-white shadow-sm`}>
                {getStatusIcon()}
            </div>

            {/* Phase 4 Badge */}
            <div className="absolute -top-1 -left-1">
                <Badge variant="secondary" className="bg-purple-600 text-white text-xs px-2 py-1 font-bold">
                    Phase 4
                </Badge>
            </div>

            {/* Header */}
            <div className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-purple-600 shadow-sm">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Reasoning</Badge>
                            {data.malayalamSpecific && (
                                <Badge variant="outline" className="text-xs bg-orange-50">മലയാളം</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {data.description || 'Advanced reasoning with cultural intelligence'}
                </p>

                {/* Configuration Preview */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Reasoning Depth:</span>
                        <Badge variant="secondary" className="text-xs">
                            {data.config.reasoningDepth || 'deep'}
                        </Badge>
                    </div>

                    {data.config.culturalValidation && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <Heart className="w-3 h-3" />
                            <span>Cultural Validation Active</span>
                        </div>
                    )}

                    {data.performance && (
                        <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Cultural Accuracy:</span>
                                <span className="font-medium">{(data.performance.culturalAccuracy * 100 || 0).toFixed(0)}%</span>
                            </div>
                            <Progress value={data.performance.culturalAccuracy * 100 || 0} className="h-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Template:</span>
                            <span className="font-mono">{data.config.templateId || 'custom'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Malayalam Support:</span>
                            <span className={data.config.malayalamSupport ? 'text-green-600' : 'text-gray-400'}>
                                {data.config.malayalamSupport ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Output Format:</span>
                            <span>{data.config.outputFormat || 'structured'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="p-3 pt-0 flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-6 px-2"
                >
                    {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isExpanded ? 'Less' : 'More'}
                </Button>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Info className="w-3 h-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs text-xs">
                                Chain of Thought reasoning with Malayalam cultural intelligence.
                                Provides step-by-step logical reasoning with cultural validation.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-purple-500 hover:bg-purple-600 transition-colors"
                id={`${id}-output`}
            />
        </div>
    );
};

// Team Orchestration Node
export const TeamOrchestrationNode: React.FC<NodeProps<EnhancedNodeData>> = ({ data, selected, id }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`relative bg-white border-2 rounded-xl shadow-lg transition-all duration-300 ${selected ? 'border-blue-500 shadow-blue-200' : 'border-blue-200'
                } hover:shadow-xl min-w-[280px] max-w-[320px]`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-blue-500 hover:bg-blue-600 transition-colors"
                id={`${id}-input`}
            />

            {/* Phase 4 Badge */}
            <div className="absolute -top-1 -left-1">
                <Badge variant="secondary" className="bg-blue-600 text-white text-xs px-2 py-1 font-bold">
                    Phase 4
                </Badge>
            </div>

            <div className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-blue-600 shadow-sm">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Collaboration</Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50">
                                {data.config.maxAgents || 5} Agents
                            </Badge>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {data.description || 'Multi-agent collaboration with cultural awareness'}
                </p>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Mode:</span>
                        <Badge variant="secondary" className="text-xs">
                            {data.config.collaborationMode || 'hybrid'}
                        </Badge>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Cultural Sensitivity:</span>
                        <Badge variant="secondary" className="text-xs">
                            {data.config.culturalSensitivity || 'high'}
                        </Badge>
                    </div>

                    {data.config.malayalamCoordination && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Heart className="w-3 h-3" />
                            <span>Malayalam Coordination</span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Decision Threshold:</span>
                            <span className="font-mono">{(data.config.decisionThreshold * 100 || 80).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Load Balancing:</span>
                            <span className={data.config.loadBalancing ? 'text-green-600' : 'text-gray-400'}>
                                {data.config.loadBalancing ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 pt-0 flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-6 px-2"
                >
                    {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isExpanded ? 'Less' : 'More'}
                </Button>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>{data.performance?.successRate ? (data.performance.successRate * 100).toFixed(0) : '95'}% Success</span>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-blue-500 hover:bg-blue-600 transition-colors"
                id={`${id}-output`}
            />
        </div>
    );
};

// Polyglot Translation Node
export const PolyglotTranslationNode: React.FC<NodeProps<EnhancedNodeData>> = ({ data, selected, id }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`relative bg-white border-2 rounded-xl shadow-lg transition-all duration-300 ${selected ? 'border-emerald-500 shadow-emerald-200' : 'border-emerald-200'
                } hover:shadow-xl min-w-[280px] max-w-[320px]`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-emerald-500 hover:bg-emerald-600 transition-colors"
                id={`${id}-input`}
            />

            {/* Phase 4 Badge */}
            <div className="absolute -top-1 -left-1">
                <Badge variant="secondary" className="bg-emerald-600 text-white text-xs px-2 py-1 font-bold">
                    Phase 4
                </Badge>
            </div>

            <div className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-600 shadow-sm">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Translation</Badge>
                            <Badge variant="outline" className="text-xs bg-emerald-50">
                                <Languages className="w-3 h-3 mr-1" />
                                100+ Lang
                            </Badge>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {data.description || 'Global translation with cultural intelligence'}
                </p>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Source:</span>
                        <Badge variant="secondary" className="text-xs">
                            {data.config.sourceLanguage || 'auto'}
                        </Badge>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Targets:</span>
                        <Badge variant="secondary" className="text-xs">
                            {Array.isArray(data.config.targetLanguages) ?
                                data.config.targetLanguages.length : 3} languages
                        </Badge>
                    </div>

                    {data.config.culturalAdaptation && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <Shield className="w-3 h-3" />
                            <span>Cultural Adaptation</span>
                        </div>
                    )}

                    {data.performance && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span>Quality Score:</span>
                                <span className="font-medium">{(data.performance.culturalAccuracy * 100 || 0).toFixed(0)}%</span>
                            </div>
                            <Progress value={data.performance.culturalAccuracy * 100 || 0} className="h-1" />
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Quality Threshold:</span>
                            <span className="font-mono">{(data.config.qualityThreshold * 100 || 80).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Alternatives:</span>
                            <span>{data.config.alternativeTranslations || 3}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Taboo Avoidance:</span>
                            <span className={data.config.tabooAvoidance ? 'text-green-600' : 'text-gray-400'}>
                                {data.config.tabooAvoidance ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 pt-0 flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-6 px-2"
                >
                    {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isExpanded ? 'Less' : 'More'}
                </Button>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Target className="w-3 h-3" />
                    <span>Cultural AI</span>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-emerald-500 hover:bg-emerald-600 transition-colors"
                id={`${id}-output`}
            />
        </div>
    );
};

// Autonomous Intelligence Node
export const AutonomousIntelligenceNode: React.FC<NodeProps<EnhancedNodeData>> = ({ data, selected, id }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getAutonomyColor = () => {
        switch (data.autonomyLevel) {
            case 'maximum': return 'bg-red-600';
            case 'high': return 'bg-orange-600';
            case 'medium': return 'bg-yellow-600';
            default: return 'bg-gray-600';
        }
    };

    return (
        <div
            className={`relative bg-white border-2 rounded-xl shadow-lg transition-all duration-300 ${selected ? 'border-orange-500 shadow-orange-200' : 'border-orange-200'
                } hover:shadow-xl min-w-[280px] max-w-[320px]`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-orange-500 hover:bg-orange-600 transition-colors"
                id={`${id}-input`}
            />

            {/* Phase 4 Badge */}
            <div className="absolute -top-1 -left-1">
                <Badge variant="secondary" className="bg-orange-600 text-white text-xs px-2 py-1 font-bold">
                    Phase 4
                </Badge>
            </div>

            {/* Autonomy Level Badge */}
            <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className={`${getAutonomyColor()} text-white text-xs px-2 py-1`}>
                    {data.autonomyLevel?.toUpperCase() || 'HIGH'}
                </Badge>
            </div>

            <div className="p-4 pb-2 pt-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-orange-600 shadow-sm">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Autonomous</Badge>
                            {data.malayalamSpecific && (
                                <Badge variant="outline" className="text-xs bg-orange-50">സ്വതന്ത്ര</Badge>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {data.description || 'Fully autonomous operations with cultural intelligence'}
                </p>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Decision Threshold:</span>
                        <Badge variant="secondary" className="text-xs">
                            {(data.config.decisionThreshold * 100 || 90).toFixed(0)}%
                        </Badge>
                    </div>

                    {data.config.culturalValidation && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Heart className="w-3 h-3" />
                            <span>Cultural Validation</span>
                        </div>
                    )}

                    {data.config.malayalamFirst && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                            <Star className="w-3 h-3" />
                            <span>Malayalam Priority</span>
                        </div>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Self-Learning:</span>
                            <span className="text-green-600">Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Predictive Intel:</span>
                            <span className="text-blue-600">30-day horizon</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cultural Evolution:</span>
                            <span className="text-purple-600">Monitoring</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 pt-0 flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-6 px-2"
                >
                    {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isExpanded ? 'Less' : 'More'}
                </Button>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Network className="w-3 h-3" />
                    <span>Swatantrata</span>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-orange-500 hover:bg-orange-600 transition-colors"
                id={`${id}-output`}
            />
        </div>
    );
};

// Platform Integration Node
export const PlatformIntegrationNode: React.FC<NodeProps<EnhancedNodeData>> = ({ data, selected, id }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`relative bg-white border-2 rounded-xl shadow-lg transition-all duration-300 ${selected ? 'border-violet-500 shadow-violet-200' : 'border-violet-200'
                } hover:shadow-xl min-w-[300px] max-w-[340px]`}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-violet-500 hover:bg-violet-600 transition-colors"
                id={`${id}-input`}
            />

            {/* Phase 4 Badge */}
            <div className="absolute -top-1 -left-1">
                <Badge variant="secondary" className="bg-violet-600 text-white text-xs px-2 py-1 font-bold">
                    Phase 4
                </Badge>
            </div>

            {/* Integration Badge */}
            <div className="absolute -top-1 -right-1">
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1">
                    UNIFIED
                </Badge>
            </div>

            <div className="p-4 pb-2 pt-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 shadow-sm">
                        <Network className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{data.label}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">Integration</Badge>
                            <Badge variant="outline" className="text-xs bg-violet-50">
                                All Systems
                            </Badge>
                        </div>
                    </div>
                </div>

                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    {data.description || 'Unified coordination of all Phase 4 systems'}
                </p>

                <div className="space-y-2">
                    <div className="text-xs">
                        <span className="text-gray-500 mb-1 block">Enabled Systems:</span>
                        <div className="flex flex-wrap gap-1">
                            {data.config.enabledSystems?.map((system: string) => (
                                <Badge key={system} variant="secondary" className="text-xs">
                                    {system.toUpperCase()}
                                </Badge>
                            )) || (
                                    <>
                                        <Badge variant="secondary" className="text-xs">CoT</Badge>
                                        <Badge variant="secondary" className="text-xs">TEAM</Badge>
                                        <Badge variant="secondary" className="text-xs">POLYGLOT</Badge>
                                        <Badge variant="secondary" className="text-xs">AUTO</Badge>
                                    </>
                                )}
                        </div>
                    </div>

                    <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Mode:</span>
                        <Badge variant="secondary" className="text-xs">
                            {data.config.orchestrationMode || 'intelligent'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-violet-600">
                        <Heart className="w-3 h-3" />
                        <span>Malayalam Cultural Priority</span>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Performance Optimization:</span>
                            <span className={data.config.performanceOptimization ? 'text-green-600' : 'text-gray-400'}>
                                {data.config.performanceOptimization ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Cultural Priority:</span>
                            <span className="text-orange-600">{data.config.culturalPriority || 'malayalam'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>System Load:</span>
                            <span className="font-mono">65%</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-3 pt-0 flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs h-6 px-2"
                >
                    {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {isExpanded ? 'Less' : 'More'}
                </Button>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3" />
                    <span>Swatantrata Core</span>
                </div>
            </div>

            {/* Multiple Output Handles */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-violet-500 hover:bg-violet-600 transition-colors"
                id={`${id}-output-main`}
                style={{ left: '50%' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-2 h-2 bg-purple-500 hover:bg-purple-600 transition-colors"
                id={`${id}-output-reasoning`}
                style={{ left: '25%' }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-2 h-2 bg-blue-500 hover:bg-blue-600 transition-colors"
                id={`${id}-output-collaboration`}
                style={{ left: '75%' }}
            />
        </div>
    );
};

// Export all custom node components
export const customNodeComponents = {
    cot_reasoning: CoTReasoningNode,
    team_coordinator: TeamOrchestrationNode,
    polyglot_translator: PolyglotTranslationNode,
    autonomous_ops: AutonomousIntelligenceNode,
    platform_integration: PlatformIntegrationNode,
    // Add more as needed
    cot_validation: CoTReasoningNode,
    cultural_reasoning: CoTReasoningNode,
    agent_assignment: TeamOrchestrationNode,
    collective_decision: TeamOrchestrationNode,
    cultural_adapter: PolyglotTranslationNode,
    language_detector: PolyglotTranslationNode,
    self_learning: AutonomousIntelligenceNode,
    predictive_intel: AutonomousIntelligenceNode,
    cultural_evolution: AutonomousIntelligenceNode,
    strategic_orchestrator: PlatformIntegrationNode
};

export default customNodeComponents;