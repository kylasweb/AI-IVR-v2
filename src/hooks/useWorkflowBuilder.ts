'use client';

import { useState, useCallback } from 'react';
import { Node, Edge, addEdge, Connection, useNodesState, useEdgesState } from 'reactflow';
import { WorkflowNodeData, Workflow } from '../workflow/types';
import { nodeTypes } from '../workflow/node-types';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for managing workflow builder state and operations.
 * Centralizes all workflow logic for the ReactFlow canvas.
 */
export function useWorkflowBuilder() {
    // ReactFlow state
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // UI state
    const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
    const [showPropertyPanel, setShowPropertyPanel] = useState(false);
    const [paletteSearchQuery, setPaletteSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Input', 'AI Processing']));

    // Workflow metadata
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [isModified, setIsModified] = useState(false);

    /**
     * Handle new edge connections
     */
    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 2 }
        }, eds));
        setIsModified(true);
    }, [setEdges]);

    /**
     * Handle node selection
     */
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
        setSelectedNode(node);
        setShowPropertyPanel(true);
    }, []);

    /**
     * Update a node's data
     */
    const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNodeData>) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: { ...node.data, ...updates }
                };
            }
            return node;
        }));
        setIsModified(true);
        toast({
            title: "Node Updated",
            description: "Node configuration saved successfully.",
        });
    }, [setNodes]);

    /**
     * Add a new node from the palette
     */
    const addNode = useCallback((type: string, position: { x: number; y: number }) => {
        const nodeType = nodeTypes[type as keyof typeof nodeTypes];
        if (!nodeType) return;

        const newNode: Node<WorkflowNodeData> = {
            id: `node-${Date.now()}`,
            type: 'custom',
            position,
            data: {
                type,
                label: nodeType.label,
                config: {},
                description: nodeType.description
            }
        };

        setNodes((nds) => [...nds, newNode]);
        setIsModified(true);
    }, [setNodes]);

    /**
     * Delete selected node
     */
    const deleteNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNode(null);
        setShowPropertyPanel(false);
        setIsModified(true);
    }, [setNodes, setEdges]);

    /**
     * Handle drag start from palette
     */
    const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    /**
     * Handle drop on canvas
     */
    const onDrop = useCallback((event: React.DragEvent, reactFlowWrapper: React.RefObject<HTMLDivElement>, reactFlowInstance: any) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type || !reactFlowWrapper.current || !reactFlowInstance) return;

        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
        });

        addNode(type, position);
    }, [addNode]);

    /**
     * Toggle category expansion in palette
     */
    const toggleCategory = useCallback((category: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    }, []);

    /**
     * Clear the canvas
     */
    const clearCanvas = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        setShowPropertyPanel(false);
        setIsModified(false);
    }, [setNodes, setEdges]);

    /**
     * Save workflow (mock)
     */
    const saveWorkflow = useCallback(() => {
        // In a real app, this would POST to an API
        const workflow: Partial<Workflow> = {
            name: workflowName,
            description: workflowDescription,
            nodes: nodes.map(n => ({
                id: n.id,
                workflowId: '',
                type: n.data.type,
                config: n.data.config,
                position: 0,
                label: n.data.label,
                description: n.data.description,
                sourceConnections: [],
                targetConnections: []
            })),
            isActive: false,
            category: 'custom',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('Saving workflow:', workflow);
        setIsModified(false);
        toast({
            title: "Workflow Saved",
            description: `"${workflowName}" has been saved successfully.`,
        });
    }, [nodes, workflowName, workflowDescription]);

    return {
        // ReactFlow state
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,

        // Node operations
        updateNode,
        addNode,
        deleteNode,

        // Drag and drop
        onDragStart,
        onDrop,

        // UI state
        selectedNode,
        setSelectedNode,
        showPropertyPanel,
        setShowPropertyPanel,
        paletteSearchQuery,
        setPaletteSearchQuery,
        expandedCategories,
        toggleCategory,

        // Workflow metadata
        workflowName,
        setWorkflowName,
        workflowDescription,
        setWorkflowDescription,
        isModified,

        // Actions
        clearCanvas,
        saveWorkflow,
    };
}

export default useWorkflowBuilder;
