// Workflow Builder Types
import { LucideIcon } from 'lucide-react';

export interface WorkflowNodeData {
    label: string;
    type: string;
    config: Record<string, any>;
    executionStatus?: 'success' | 'error' | 'running' | 'idle';
    description?: string;
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    category: string;
    isActive: boolean;
    nodes: WorkflowNode[];
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowNode {
    id: string;
    workflowId: string;
    type: string;
    config: Record<string, any>;
    position: number;
    label: string;
    description?: string;
    sourceConnections: NodeConnection[];
    targetConnections: NodeConnection[];
}

export interface NodeConnection {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle: string;
    targetHandle: string;
    condition?: string;
}

export interface NodeTypeDefinition {
    icon: LucideIcon;
    label: string;
    color: string;
    category: string;
    description: string;
    usage: string;
    examples: string[];
}

export interface NodeCategory {
    name: string;
    color: string;
    types: string[];
}
