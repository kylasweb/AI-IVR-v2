'use client';

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Settings, Check, X, AlertTriangle } from 'lucide-react';
import { WorkflowNodeData } from './types';
import { nodeTypes } from './node-types';
import { validateNode, checkNodeWarnings } from './node-validation';

/**
 * Custom ReactFlow node component for the workflow builder.
 * Displays node icon, label, category, configuration preview, and status.
 */
export const CustomNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected, id }) => {
    const nodeType = nodeTypes[data.type as keyof typeof nodeTypes];
    const Icon = nodeType?.icon || Settings;

    // Validation status
    const isValid = validateNode(data);
    const hasWarning = checkNodeWarnings(data);

    // Status indicator
    const StatusIcon = isValid ?
        (hasWarning ? AlertTriangle : Check) :
        (X);
    const statusColor = isValid ?
        (hasWarning ? 'text-yellow-500' : 'text-green-500') :
        'text-red-500';

    return (
        <div
            className={`relative px-4 py-3 shadow-lg rounded-lg bg-white border-2 transition-all duration-200 ${selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200'
                } hover:shadow-xl min-w-[160px] max-w-[250px]`}
        >
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-gray-500 hover:bg-blue-500 transition-colors"
                id={`${id}-input`}
            />

            {/* Status Indicator */}
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border shadow-sm">
                <StatusIcon className={`w-3 h-3 ${statusColor}`} />
            </div>

            {/* Node Header */}
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${nodeType?.color || 'bg-gray-500'} shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <span className="font-semibold text-sm text-gray-800">{data.label}</span>
                    {nodeType?.category && (
                        <div className="text-xs text-gray-500">{nodeType.category}</div>
                    )}
                </div>
            </div>

            {/* Node Description */}
            {data.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>
            )}

            {/* Configuration Preview */}
            {Object.keys(data.config).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {Object.entries(data.config).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="secondary" className="text-xs truncate max-w-[80px]">
                            {key}: {String(value).substring(0, 10)}
                            {String(value).length > 10 && '...'}
                        </Badge>
                    ))}
                    {Object.keys(data.config).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{Object.keys(data.config).length - 3} more
                        </Badge>
                    )}
                </div>
            )}

            {/* Execution Status (if available) */}
            {data.executionStatus && (
                <div className={`text-xs p-1 rounded ${data.executionStatus === 'success' ? 'bg-green-100 text-green-700' :
                    data.executionStatus === 'error' ? 'bg-red-100 text-red-700' :
                        data.executionStatus === 'running' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                    }`}>
                    Status: {data.executionStatus}
                </div>
            )}

            {/* Output Handles */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-gray-500 hover:bg-blue-500 transition-colors"
                id={`${id}-success`}
            />

            {/* Conditional output handles for branching nodes */}
            {(data.type === 'condition' || data.type === 'switch') && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="w-3 h-3 bg-green-500 hover:bg-green-600 transition-colors"
                        id={`${id}-true`}
                        style={{ top: '60%' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Left}
                        className="w-3 h-3 bg-red-500 hover:bg-red-600 transition-colors"
                        id={`${id}-false`}
                        style={{ top: '60%' }}
                    />
                </>
            )}
        </div>
    );
};

export default CustomNode;
