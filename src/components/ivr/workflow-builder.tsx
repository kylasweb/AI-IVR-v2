import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, Bot, Mic, Volume2, GitBranch, Database, Zap, Settings, Play, Save, Trash2,
  Mail, MessageSquare, Clock, BarChart3, FileText, RotateCcw, Copy, Download, Upload,
  Eye, EyeOff, Maximize2, Minimize2, Grid3X3, Layers, Search, Filter, ChevronDown,
  Check, X, AlertTriangle, Info
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
interface WorkflowNodeData {
  label: string;
  type: string;
  config: Record<string, any>;
  executionStatus?: 'success' | 'error' | 'running' | 'idle';
  description?: string;
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  nodes: WorkflowNode[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
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

interface NodeConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
  condition?: string;
}

// Enhanced Node type definitions with categories
const nodeTypes = {
  // Input/Trigger Nodes
  trigger: { 
    icon: Zap, 
    label: 'Trigger', 
    color: 'bg-green-500',
    category: 'Input',
    description: 'Workflow entry point - triggers on phone calls, events, or schedules'
  },
  webhook: { 
    icon: Database, 
    label: 'Webhook', 
    color: 'bg-green-600',
    category: 'Input',
    description: 'Receives HTTP requests from external systems'
  },
  
  // Processing Nodes
  stt: { 
    icon: Mic, 
    label: 'Speech to Text', 
    color: 'bg-blue-500',
    category: 'Processing',
    description: 'Converts audio speech to text using AI transcription'
  },
  nlu: { 
    icon: Bot, 
    label: 'NLU Processing', 
    color: 'bg-purple-500',
    category: 'Processing',
    description: 'Natural Language Understanding - extracts intent and entities'
  },
  agent: { 
    icon: Bot, 
    label: 'AI Agent', 
    color: 'bg-indigo-500',
    category: 'Processing',
    description: 'Intelligent agent with cultural awareness and conversation skills'
  },
  variable: { 
    icon: Database, 
    label: 'Variable Store', 
    color: 'bg-teal-500',
    category: 'Processing',
    description: 'Store and retrieve variables during workflow execution'
  },
  
  // Logic Nodes
  condition: { 
    icon: GitBranch, 
    label: 'Condition', 
    color: 'bg-yellow-500',
    category: 'Logic',
    description: 'Conditional branching based on rules and expressions'
  },
  loop: { 
    icon: GitBranch, 
    label: 'Loop', 
    color: 'bg-yellow-600',
    category: 'Logic',
    description: 'Iterate through data or repeat actions with conditions'
  },
  switch: { 
    icon: GitBranch, 
    label: 'Switch', 
    color: 'bg-amber-500',
    category: 'Logic',
    description: 'Multi-way branching based on variable values'
  },
  
  // Data Nodes
  data: { 
    icon: Database, 
    label: 'Data Query', 
    color: 'bg-cyan-500',
    category: 'Data',
    description: 'Query databases, APIs, or external data sources'
  },
  transform: { 
    icon: Database, 
    label: 'Transform', 
    color: 'bg-cyan-600',
    category: 'Data',
    description: 'Transform and manipulate data using expressions'
  },
  
  // External Nodes
  api: { 
    icon: Zap, 
    label: 'API Call', 
    color: 'bg-pink-500',
    category: 'External',
    description: 'Make HTTP requests to external APIs and services'
  },
  
  // Output Nodes
  tts: { 
    icon: Volume2, 
    label: 'Text to Speech', 
    color: 'bg-orange-500',
    category: 'Output',
    description: 'Converts text to natural speech with cultural awareness'
  },
  sms: { 
    icon: Bot, 
    label: 'Send SMS', 
    color: 'bg-orange-600',
    category: 'Output',
    description: 'Send SMS messages to phone numbers'
  },
  email: { 
    icon: Bot, 
    label: 'Send Email', 
    color: 'bg-orange-700',
    category: 'Output',
    description: 'Send email notifications with templates'
  },
  
  // Analytics Nodes
  analytics: { 
    icon: Settings, 
    label: 'Analytics', 
    color: 'bg-gray-500',
    category: 'Analytics',
    description: 'Track metrics, events, and workflow performance'
  },
  log: { 
    icon: Settings, 
    label: 'Log Event', 
    color: 'bg-gray-600',
    category: 'Analytics',
    description: 'Log custom events and debug information'
  },
  
  // Control Nodes
  delay: { 
    icon: Settings, 
    label: 'Delay', 
    color: 'bg-slate-500',
    category: 'Control',
    description: 'Add delays or pauses in workflow execution'
  },
  end: { 
    icon: Settings, 
    label: 'End', 
    color: 'bg-red-500',
    category: 'Control',
    description: 'Workflow termination point with status codes'
  },
};

// Enhanced Custom Node Component
const CustomNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected, id }) => {
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
      className={`relative px-4 py-3 shadow-lg rounded-lg bg-white border-2 transition-all duration-200 ${
        selected ? 'border-blue-500 shadow-blue-200' : 'border-gray-200'
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
        <div className={`text-xs p-1 rounded ${
          data.executionStatus === 'success' ? 'bg-green-100 text-green-700' :
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

// Node validation functions
const validateNode = (data: WorkflowNodeData): boolean => {
  // Basic validation - check if required fields are present
  if (!data.type || !data.label) return false;
  
  // Type-specific validation
  switch (data.type) {
    case 'api':
      return !!(data.config.url && data.config.method);
    case 'condition':
      return !!(data.config.condition);
    case 'agent':
      return !!(data.config.prompt || data.config.model);
    case 'webhook':
      return !!(data.config.endpoint);
    default:
      return true;
  }
};

const checkNodeWarnings = (data: WorkflowNodeData): boolean => {
  // Check for potential issues that aren't errors
  switch (data.type) {
    case 'api':
      return !data.config.timeout || !data.config.retries;
    case 'agent':
      return !data.config.fallback;
    case 'tts':
      return !data.config.voice || !data.config.language;
    default:
      return false;
  }
};

// Node Property Panel Component
interface NodePropertyPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
}

function NodePropertyPanel({ selectedNode, onNodeUpdate, onClose }: NodePropertyPanelProps) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (selectedNode) {
    setConfig(selectedNode?.data?.config || {});
    setLabel(selectedNode?.data?.label || '');
    setDescription(selectedNode?.data?.description || '');
    }
  }, [selectedNode]);

  const handleSave = () => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        config,
        label,
        description,
      });
    }
  };

  const renderConfigFields = () => {
    if (!selectedNode) return null;

  const nodeType = selectedNode?.data?.type;
    
    switch (nodeType) {
      case 'agent':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                placeholder="Enter the AI agent's system prompt..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select
                value={config.model || 'gpt-3.5-turbo'}
                onValueChange={(value) => setConfig({ ...config, model: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature || 0.7}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="cultural-context">Cultural Context</Label>
              <Select
                value={config.culturalContext || 'malayalam'}
                onValueChange={(value) => setConfig({ ...config, culturalContext: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malayalam">Malayalam/Kerala</SelectItem>
                  <SelectItem value="english">English (Global)</SelectItem>
                  <SelectItem value="manglish">Manglish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">API URL</Label>
              <Input
                id="url"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={config.method || 'GET'}
                onValueChange={(value) => setConfig({ ...config, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea
                id="headers"
                value={config.headers ? JSON.stringify(config.headers, null, 2) : '{}'}
                onChange={(e) => {
                  try {
                    setConfig({ ...config, headers: JSON.parse(e.target.value) });
                  } catch (error) {
                    // Invalid JSON, keep the raw string for now
                  }
                }}
                placeholder='{"Authorization": "Bearer token"}'
              />
            </div>
          </div>
        );
      
      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Condition Expression</Label>
              <Input
                id="condition"
                value={config.condition || ''}
                onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                placeholder="e.g., intent === 'greeting' && confidence > 0.8"
              />
            </div>
            <div>
              <Label htmlFor="true-path">True Path Label</Label>
              <Input
                id="true-path"
                value={config.truePath || 'Yes'}
                onChange={(e) => setConfig({ ...config, truePath: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="false-path">False Path Label</Label>
              <Input
                id="false-path"
                value={config.falsePath || 'No'}
                onChange={(e) => setConfig({ ...config, falsePath: e.target.value })}
              />
            </div>
          </div>
        );
      
      case 'tts':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="voice">Voice</Label>
              <Select
                value={config.voice || 'malayalam-female'}
                onValueChange={(value) => setConfig({ ...config, voice: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malayalam-female">Malayalam Female</SelectItem>
                  <SelectItem value="malayalam-male">Malayalam Male</SelectItem>
                  <SelectItem value="english-female">English Female</SelectItem>
                  <SelectItem value="english-male">English Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="speed">Speech Speed</Label>
              <Input
                id="speed"
                type="number"
                min="0.5"
                max="2"
                step="0.1"
                value={config.speed || 1.0}
                onChange={(e) => setConfig({ ...config, speed: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="pitch">Pitch</Label>
              <Input
                id="pitch"
                type="number"
                min="0.5"
                max="2"
                step="0.1"
                value={config.pitch || 1.0}
                onChange={(e) => setConfig({ ...config, pitch: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-config">Configuration (JSON)</Label>
              <Textarea
                id="custom-config"
                value={JSON.stringify(config, null, 2)}
                onChange={(e) => {
                  try {
                    setConfig(JSON.parse(e.target.value));
                  } catch (error) {
                    // Invalid JSON, keep the raw string for now
                  }
                }}
                placeholder="{}"
                className="font-mono text-sm"
              />
            </div>
          </div>
        );
    }
  };

  if (!selectedNode) {
    return (
      <Card className="w-80">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Select a node to configure its properties</p>
        </CardContent>
      </Card>
    );
  }

  const nodeType = selectedNode ? nodeTypes[selectedNode.data?.type as keyof typeof nodeTypes] : undefined;

  return (
    <Card className="w-80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${nodeType?.color || 'bg-gray-500'}`}>
              {nodeType?.icon && <nodeType.icon className="w-4 h-4 text-white" />}
            </div>
            <CardTitle className="text-lg">Node Properties</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Properties */}
        <div>
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Node label"
          />
        </div>
        
        <div>
          <Label htmlFor="node-description">Description</Label>
          <Textarea
            id="node-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Node description"
            rows={2}
          />
        </div>
        
        <div className="pt-2 border-t">
          <h4 className="font-medium mb-3">Configuration</h4>
          {renderConfigFields()}
        </div>
        
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    category: 'CUSTOM',
  });

  const [selectedNodeType, setSelectedNodeType] = useState<string>('agent');
  const [nodeConfig, setNodeConfig] = useState<Record<string, any>>({});
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [nodeFilter, setNodeFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Load workflows on component mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  // Node selection handler
  const onNodeClick = useCallback((event: any, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
    setShowPropertyPanel(true);
  }, []);

  // Node update handler
  const onNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [setNodes]);

  // Filter nodes by category
  const getFilteredNodeTypes = () => {
    let filtered = Object.entries(nodeTypes);
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(([_, nodeType]) => nodeType.category === selectedCategory);
    }
    
    if (nodeFilter) {
      filtered = filtered.filter(([_, nodeType]) => 
        nodeType.label.toLowerCase().includes(nodeFilter.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get unique categories
  const getCategories = () => {
    const categories = new Set(Object.values(nodeTypes).map(nodeType => nodeType.category));
    return ['All', ...Array.from(categories)];
  };

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  const loadWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (response.ok) {
        const workflow = await response.json();
        setSelectedWorkflow(workflow);
        
        // Convert workflow nodes to ReactFlow format
        const flowNodes = workflow.nodes.map((node: WorkflowNode, index: number) => ({
          id: node.id,
          type: 'custom',
          position: { x: 100 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
          data: {
            label: node.label,
            type: node.type,
            config: node.config,
            description: node.description,
          },
        }));

        const flowEdges = workflow.nodes.flatMap((node: WorkflowNode) =>
          node.sourceConnections.map((conn: NodeConnection) => ({
            id: conn.id,
            source: conn.sourceNodeId,
            target: conn.targetNodeId,
            sourceHandle: conn.sourceHandle,
            targetHandle: conn.targetHandle,
            type: 'smoothstep',
          }))
        );

        setNodes(flowNodes);
        setEdges(flowEdges);
        setIsBuilding(true);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const onConnect = useCallback(
    async (params: Connection) => {
      if (selectedWorkflow && params.source && params.target) {
        try {
          const response = await fetch('/api/node-connections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceNodeId: params.source,
              targetNodeId: params.target,
              sourceHandle: params.sourceHandle,
              targetHandle: params.targetHandle,
            }),
          });

          if (response.ok) {
            const newEdge = {
              id: `edge-${Date.now()}`,
              source: params.source,
              target: params.target,
              sourceHandle: params.sourceHandle,
              targetHandle: params.targetHandle,
              type: 'smoothstep',
            };
            setEdges((eds) => addEdge(newEdge, eds));
          }
        } catch (error) {
          console.error('Error creating connection:', error);
        }
      }
    },
    [selectedWorkflow, setEdges]
  );

  const onInit = useCallback((rfi: any) => {
    setReactFlowInstance(rfi);
  }, []);

  const createWorkflow = async () => {
    if (!newWorkflow.name) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow),
      });

      if (response.ok) {
        const workflow = await response.json();
        setWorkflows((prev) => [workflow, ...prev]);
        setSelectedWorkflow(workflow);
        setNewWorkflow({ name: '', description: '', category: 'CUSTOM' });
        setIsBuilding(true);
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsSaving(true);
    try {
      // Save nodes
      for (const node of nodes) {
        const nodeData = {
          workflowId: selectedWorkflow.id,
          type: node.data.type,
          config: node.data.config,
          position: 0,
          label: node.data.label,
          description: node.data.description,
        };

        await fetch('/api/workflow-nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nodeData),
        });
      }

      await loadWorkflows();
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsExecuting(true);
    try {
      const response = await fetch(`/api/workflows/${selectedWorkflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: "Test customer input" },
          context: { test: true },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setTestResults(result);
      } else {
        alert('Workflow execution failed');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow');
    } finally {
      setIsExecuting(false);
    }
  };

  const addNode = () => {
    if (!selectedNodeType) return;

    const newNode: Node<WorkflowNodeData> = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        label: nodeTypes[selectedNodeType as keyof typeof nodeTypes].label,
        type: selectedNodeType,
        config: { ...nodeConfig },
        description: `New ${nodeTypes[selectedNodeType as keyof typeof nodeTypes].label} node`,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setNodeConfig({});
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<WorkflowNodeData> = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: nodeTypes[type as keyof typeof nodeTypes].label,
          type,
          config: {},
          description: `New ${nodeTypes[type as keyof typeof nodeTypes].label} node`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Workflow Builder</h1>
          <p className="text-muted-foreground">
            Design and automate IVR workflows with chained AI agents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Workflow Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflows</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Workflow name"
                  value={newWorkflow.name}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, name: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={newWorkflow.description}
                  onChange={(e) =>
                    setNewWorkflow({ ...newWorkflow, description: e.target.value })
                  }
                />
                <Select
                  value={newWorkflow.category}
                  onValueChange={(value) =>
                    setNewWorkflow({ ...newWorkflow, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                    <SelectItem value="CUSTOMER_SERVICE">Customer Service</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="SURVEY">Survey</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={createWorkflow}
                  disabled={!newWorkflow.name || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Creating...' : 'Create Workflow'}
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`p-2 border rounded cursor-pointer ${
                      selectedWorkflow?.id === workflow.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => loadWorkflow(workflow.id)}
                  >
                    <div className="font-medium text-sm">{workflow.name}</div>
                    <div className="text-xs text-gray-500">{workflow.category}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Node Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Node Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search nodes..."
                    value={nodeFilter}
                    onChange={(e) => setNodeFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Node List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {getFilteredNodeTypes().map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(event) => onDragStart(event, type)}
                      className="group flex items-center gap-2 p-3 border rounded-lg cursor-move hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
                      title={config.description}
                    >
                      <div className={`p-1.5 rounded-md ${config.color} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-800">{config.label}</div>
                        <div className="text-xs text-gray-500 truncate">{config.category}</div>
                      </div>
                      <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Drag
                      </div>
                    </div>
                  );
                })}
                {getFilteredNodeTypes().length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No nodes found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isBuilding ? (
            <div className="flex gap-4">
              {/* Workflow Canvas */}
              <div className="flex-1">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle>
                          {selectedWorkflow?.name || 'Untitled Workflow'}
                        </CardTitle>
                        <Badge variant="secondary">
                          {nodes.length} nodes
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowMiniMap(!showMiniMap)}
                          variant="outline"
                          size="sm"
                        >
                          {showMiniMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          onClick={() => reactFlowInstance?.fitView()}
                          variant="outline"
                          size="sm"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={saveWorkflow}
                          disabled={isSaving}
                          variant="outline"
                          size="sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={executeWorkflow}
                          disabled={isExecuting}
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {isExecuting ? 'Executing...' : 'Test Run'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[700px] border rounded-lg overflow-hidden" ref={reactFlowWrapper}>
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onInit={onInit}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={{ custom: CustomNode }}
                        fitView
                        attributionPosition="bottom-left"
                      >
                        <Controls 
                          position="top-left"
                          showFitView={true}
                          showInteractive={true}
                        />
                        {showMiniMap && (
                          <MiniMap 
                            position="bottom-right"
                            nodeColor={(node) => {
                              const nodeType = nodeTypes[node.data.type as keyof typeof nodeTypes];
                              return nodeType?.color?.replace('bg-', '').replace('-500', '') || 'gray';
                            }}
                          />
                        )}
                        <Background 
                          variant="dots" 
                          gap={20} 
                          size={1}
                          color="#e2e8f0"
                        />
                      </ReactFlow>
                    </div>

                    {/* Workflow Statistics */}
                    <div className="mt-4 flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Nodes: {nodes.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Connections: {edges.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Valid: {nodes.filter(n => validateNode(n.data)).length}
                      </div>
                    </div>

                    {testResults && (
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Test Results</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setTestResults(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(testResults, null, 2)}
                          </pre>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Property Panel */}
              {showPropertyPanel && (
                <div className="w-80 flex-shrink-0">
                  <NodePropertyPanel
                    selectedNode={selectedNode}
                    onNodeUpdate={onNodeUpdate}
                    onClose={() => {
                      setShowPropertyPanel(false);
                      setSelectedNode(null);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Create or Select a Workflow
                    </h3>
                    <p className="text-muted-foreground">
                      Get started by creating a new workflow or selecting an existing one to begin building your IVR flow
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;