'use client';

/**
 * BPO Custom Workflow Nodes
 * Smart Triage, Transactional Resolver, and Outbound Campaign nodes
 */

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    Brain,
    Zap,
    Phone,
    Shield,
    MessageSquare,
    GitBranch,
    AlertTriangle,
    CheckCircle,
    Database,
    Fingerprint
} from 'lucide-react';

interface BPONodeData {
    label: string;
    type: string;
    config: Record<string, any>;
    executionStatus?: 'success' | 'error' | 'running' | 'idle';
}

// Shared node wrapper
const NodeWrapper: React.FC<{
    children: React.ReactNode;
    selected: boolean;
    color: string;
    status?: string;
}> = ({ children, selected, color, status }) => (
    <div className={`
    min-w-[200px] rounded-xl border-2 transition-all
    ${selected ? 'border-blue-400 shadow-lg shadow-blue-500/20' : 'border-gray-600'}
    ${status === 'running' ? 'animate-pulse' : ''}
    ${status === 'error' ? 'border-red-500' : ''}
    ${status === 'success' ? 'border-green-500' : ''}
    bg-gray-800
  `}>
        {children}
    </div>
);

// Smart Triage Node - NLU + Sentiment
export const SmartTriageNode = memo(({ data, selected }: NodeProps<BPONodeData>) => {
    const sentimentThreshold = data.config?.sentimentThreshold || 0.35;

    return (
        <NodeWrapper selected={selected} color="blue" status={data.executionStatus}>
            <Handle type="target" position={Position.Top} className="!bg-blue-500" />

            <div className="p-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{data.label}</div>
                        <div className="text-xs text-gray-400">Smart Triage</div>
                    </div>
                </div>

                {/* Config Preview */}
                <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between p-1.5 bg-gray-700/50 rounded">
                        <span className="text-gray-400">Intent Analysis</span>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-gray-700/50 rounded">
                        <span className="text-gray-400">Sentiment Threshold</span>
                        <span className="text-blue-400">{Math.round(sentimentThreshold * 100)}%</span>
                    </div>
                </div>
            </div>

            {/* Multiple outputs for routing */}
            <div className="flex justify-around pb-2 px-2">
                <div className="text-center">
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="low-sentiment"
                        className="!bg-red-500 !left-[25%]"
                    />
                    <span className="text-[10px] text-red-400">Low</span>
                </div>
                <div className="text-center">
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="normal"
                        className="!bg-green-500 !left-[75%]"
                    />
                    <span className="text-[10px] text-green-400">Normal</span>
                </div>
            </div>
        </NodeWrapper>
    );
});
SmartTriageNode.displayName = 'SmartTriageNode';

// Authentication Node - OTP/Voice Biometric
export const AuthenticationNode = memo(({ data, selected }: NodeProps<BPONodeData>) => {
    const method = data.config?.method || 'otp';

    return (
        <NodeWrapper selected={selected} color="purple" status={data.executionStatus}>
            <Handle type="target" position={Position.Top} className="!bg-purple-500" />

            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        {method === 'voice_biometric' ? (
                            <Fingerprint className="w-4 h-4 text-white" />
                        ) : (
                            <Shield className="w-4 h-4 text-white" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{data.label}</div>
                        <div className="text-xs text-gray-400 capitalize">{method.replace('_', ' ')}</div>
                    </div>
                </div>

                <div className="space-y-1 text-xs">
                    {method === 'otp' && (
                        <>
                            <div className="flex justify-between p-1.5 bg-gray-700/50 rounded">
                                <span className="text-gray-400">OTP Length</span>
                                <span className="text-purple-400">{data.config?.otpLength || 6} digits</span>
                            </div>
                            <div className="flex justify-between p-1.5 bg-gray-700/50 rounded">
                                <span className="text-gray-400">Delivery</span>
                                <span className="text-purple-400 uppercase">{data.config?.deliveryChannel || 'sms'}</span>
                            </div>
                        </>
                    )}
                    {method === 'voice_biometric' && (
                        <div className="flex justify-between p-1.5 bg-gray-700/50 rounded">
                            <span className="text-gray-400">Confidence</span>
                            <span className="text-purple-400">{Math.round((data.config?.confidenceThreshold || 0.85) * 100)}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-around pb-2 px-2">
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="success" className="!bg-green-500 !left-[25%]" />
                    <span className="text-[10px] text-green-400">Pass</span>
                </div>
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="failure" className="!bg-red-500 !left-[75%]" />
                    <span className="text-[10px] text-red-400">Fail</span>
                </div>
            </div>
        </NodeWrapper>
    );
});
AuthenticationNode.displayName = 'AuthenticationNode';

// API Fetch Node - CRM/External API
export const APIFetchNode = memo(({ data, selected }: NodeProps<BPONodeData>) => {
    const endpoint = data.config?.endpoint || '/api/data';

    return (
        <NodeWrapper selected={selected} color="emerald" status={data.executionStatus}>
            <Handle type="target" position={Position.Top} className="!bg-emerald-500" />

            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{data.label}</div>
                        <div className="text-xs text-gray-400">API Fetch</div>
                    </div>
                </div>

                <div className="space-y-1 text-xs">
                    <div className="p-1.5 bg-gray-700/50 rounded">
                        <span className="text-gray-400">Endpoint: </span>
                        <span className="text-emerald-400 truncate block">{endpoint.slice(0, 30)}...</span>
                    </div>
                    <div className="flex justify-between p-1.5 bg-gray-700/50 rounded">
                        <span className="text-gray-400">Timeout</span>
                        <span className="text-emerald-400">{data.config?.timeout || 5000}ms</span>
                    </div>
                    {data.config?.retryOnFail && (
                        <div className="flex items-center gap-1 p-1.5 bg-emerald-500/10 rounded">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Retry on fail</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-around pb-2 px-2">
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="success" className="!bg-green-500 !left-[25%]" />
                    <span className="text-[10px] text-green-400">OK</span>
                </div>
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="error" className="!bg-red-500 !left-[75%]" />
                    <span className="text-[10px] text-red-400">Error</span>
                </div>
            </div>
        </NodeWrapper>
    );
});
APIFetchNode.displayName = 'APIFetchNode';

// AMD Detection Node
export const AMDNode = memo(({ data, selected }: NodeProps<BPONodeData>) => {
    return (
        <NodeWrapper selected={selected} color="orange" status={data.executionStatus}>
            <Handle type="target" position={Position.Top} className="!bg-orange-500" />

            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{data.label}</div>
                        <div className="text-xs text-gray-400">Answer Detection</div>
                    </div>
                </div>

                <div className="space-y-1 text-xs">
                    <div className="flex justify-between p-1.5 bg-gray-700/50 rounded">
                        <span className="text-gray-400">Detection Time</span>
                        <span className="text-orange-400">{data.config?.detectionTime || 4000}ms</span>
                    </div>
                    <div className="flex items-center gap-1 p-1.5 bg-gray-700/50 rounded">
                        {data.config?.beepDetection ? (
                            <CheckCircle className="w-3 h-3 text-orange-400" />
                        ) : (
                            <AlertTriangle className="w-3 h-3 text-gray-400" />
                        )}
                        <span className="text-gray-400">Beep Detection</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-around pb-2 px-2">
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="human" className="!bg-green-500 !left-[25%]" />
                    <span className="text-[10px] text-green-400">Human</span>
                </div>
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="machine" className="!bg-yellow-500 !left-[75%]" />
                    <span className="text-[10px] text-yellow-400">Machine</span>
                </div>
            </div>
        </NodeWrapper>
    );
});
AMDNode.displayName = 'AMDNode';

// Boolean Logic Node - Yes/No branching
export const BooleanLogicNode = memo(({ data, selected }: NodeProps<BPONodeData>) => {
    const field = data.config?.field || 'response';

    return (
        <NodeWrapper selected={selected} color="cyan" status={data.executionStatus}>
            <Handle type="target" position={Position.Top} className="!bg-cyan-500" />

            <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{data.label}</div>
                        <div className="text-xs text-gray-400">Yes/No Logic</div>
                    </div>
                </div>

                <div className="p-1.5 bg-gray-700/50 rounded text-xs">
                    <span className="text-gray-400">Field: </span>
                    <span className="text-cyan-400">{field}</span>
                </div>
            </div>

            <div className="flex justify-around pb-2 px-2">
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="yes" className="!bg-green-500 !left-[25%]" />
                    <span className="text-[10px] text-green-400">Yes</span>
                </div>
                <div className="text-center">
                    <Handle type="source" position={Position.Bottom} id="no" className="!bg-red-500 !left-[75%]" />
                    <span className="text-[10px] text-red-400">No</span>
                </div>
            </div>
        </NodeWrapper>
    );
});
BooleanLogicNode.displayName = 'BooleanLogicNode';

// Export all BPO custom nodes
export const bpoNodeTypes = {
    smart_triage: SmartTriageNode,
    authentication: AuthenticationNode,
    api_fetch: APIFetchNode,
    amd: AMDNode,
    boolean_logic: BooleanLogicNode,
};

export default bpoNodeTypes;
