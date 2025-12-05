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
import ManagementLayout from '@/components/layout/management-layout';
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
import { useRealTimeWorkflowData } from '@/hooks/use-realtime-workflows';

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

// Enhanced Node type definitions with comprehensive categories and detailed explanations
const nodeTypes = {
  // Input/Trigger Nodes - Entry points for workflows
  trigger: {
    icon: Zap,
    label: 'Call Trigger',
    color: 'bg-green-500',
    category: 'Input',
    description: 'Workflow entry point - triggers on incoming phone calls, scheduled events, or webhook calls',
    usage: 'Place at start of workflow. Configure trigger conditions like phone numbers, time schedules, or event types.',
    examples: ['Incoming call from customer', 'Daily 9AM reminder', 'Emergency hotline activation']
  },
  webhook: {
    icon: Database,
    label: 'Webhook Receiver',
    color: 'bg-green-600',
    category: 'Input',
    description: 'Receives HTTP POST/GET requests from external systems and CRM platforms',
    usage: 'Configure endpoint URL and authentication. Parse incoming JSON data for workflow variables.',
    examples: ['CRM lead notification', 'Payment confirmation', 'Form submission trigger']
  },
  dtmf: {
    icon: MessageSquare,
    label: 'DTMF Input',
    color: 'bg-green-700',
    category: 'Input',
    description: 'Captures dual-tone multi-frequency (keypad) input from callers',
    usage: 'Set timeout duration, valid digits, and minimum/maximum input length. Handle menu selections.',
    examples: ['Press 1 for English, 2 for Malayalam', 'Enter account number', 'Menu selection']
  },

  // Advanced AI Processing Nodes
  stt: {
    icon: Mic,
    label: 'Speech to Text',
    color: 'bg-blue-500',
    category: 'AI Processing',
    description: 'Converts audio speech to text with Malayalam and English support using advanced AI models',
    usage: 'Configure language detection, noise reduction, and confidence thresholds. Supports real-time streaming.',
    examples: ['Customer query transcription', 'Voice command processing', 'Meeting audio conversion']
  },
  nlu: {
    icon: Bot,
    label: 'NLU Analysis',
    color: 'bg-purple-500',
    category: 'AI Processing',
    description: 'Natural Language Understanding - extracts intents, entities, and sentiment with cultural awareness',
    usage: 'Train with Malayalam phrases, configure confidence thresholds, map intents to actions.',
    examples: ['Intent: book_appointment', 'Entity: date, time', 'Sentiment: frustrated customer']
  },
  agent: {
    icon: Bot,
    label: 'AI Conversation Agent',
    color: 'bg-indigo-500',
    category: 'AI Processing',
    description: 'Intelligent conversational agent with Kerala cultural awareness and multilingual capabilities',
    usage: 'Configure personality, knowledge base, conversation flow, and cultural context parameters.',
    examples: ['Customer support chat', 'Appointment booking', 'Product recommendation']
  },
  malayalam_cultural: {
    icon: Bot,
    label: 'Cultural Intelligence',
    color: 'bg-indigo-700',
    category: 'AI Processing',
    description: 'Specialized AI for Malayalam cultural context, festivals, traditions, and regional dialects',
    usage: 'Automatically detects cultural references, adjusts responses for festivals, handles regional variations.',
    examples: ['Onam greetings adaptation', 'Regional dialect detection', 'Festival-aware responses']
  },
  amd_detection: {
    icon: AlertCircle,
    label: 'AMD Detection',
    color: 'bg-purple-700',
    category: 'AI Processing',
    description: 'Answering Machine Detection with Malayalam greeting pattern recognition',
    usage: 'Analyzes initial audio for human vs machine patterns. Configurable sensitivity and cultural patterns.',
    examples: ['Outbound call screening', 'Voicemail detection', 'Human verification']
  },
  sentiment_analysis: {
    icon: BarChart3,
    label: 'Sentiment Analysis',
    color: 'bg-purple-600',
    category: 'AI Processing',
    description: 'Real-time emotion and sentiment detection from voice and text with cultural sensitivity',
    usage: 'Configure emotion thresholds, cultural context, and escalation triggers for negative sentiment.',
    examples: ['Angry customer detection', 'Satisfaction scoring', 'Escalation triggers']
  },

  // Data Processing & Storage Nodes
  variable: {
    icon: Database,
    label: 'Variable Store',
    color: 'bg-teal-500',
    category: 'Data',
    description: 'Store, retrieve, and manipulate variables during workflow execution with persistence',
    usage: 'Define variable names, types, default values, and persistence scope (session/global/permanent).',
    examples: ['Customer name storage', 'Session preferences', 'Call history tracking']
  },
  data: {
    icon: Database,
    label: 'Database Query',
    color: 'bg-cyan-500',
    category: 'Data',
    description: 'Execute SQL queries against databases with connection pooling and caching',
    usage: 'Configure database connection, write SQL queries, handle results and errors gracefully.',
    examples: ['Customer lookup', 'Inventory check', 'Order status query']
  },
  transform: {
    icon: Database,
    label: 'Data Transform',
    color: 'bg-cyan-600',
    category: 'Data',
    description: 'Transform, filter, and manipulate data using expressions and built-in functions',
    usage: 'Use JavaScript expressions, built-in functions, and data mapping to transform variables.',
    examples: ['Format phone numbers', 'Calculate totals', 'Parse JSON responses']
  },
  cache: {
    icon: Database,
    label: 'Cache Manager',
    color: 'bg-cyan-700',
    category: 'Data',
    description: 'High-performance caching for frequently accessed data with TTL and invalidation',
    usage: 'Set cache keys, expiration times, and invalidation patterns. Improves response times.',
    examples: ['Customer profile cache', 'Product catalog cache', 'API response cache']
  },

  // Advanced Logic & Control Flow
  condition: {
    icon: GitBranch,
    label: 'Smart Condition',
    color: 'bg-yellow-500',
    category: 'Logic',
    description: 'Advanced conditional branching with complex expressions, AI-powered decisions, and fuzzy logic',
    usage: 'Write complex conditions using variables, AI confidence scores, and business rules.',
    examples: ['if (confidence > 0.8 && language === "malayalam")', 'Customer tier routing', 'Time-based logic']
  },
  loop: {
    icon: GitBranch,
    label: 'Smart Loop',
    color: 'bg-yellow-600',
    category: 'Logic',
    description: 'Intelligent iteration with break conditions, timeout protection, and performance monitoring',
    usage: 'Configure loop conditions, maximum iterations, timeout values, and break conditions.',
    examples: ['Retry failed API calls', 'Process customer list', 'Multi-attempt verification']
  },
  switch: {
    icon: GitBranch,
    label: 'Multi-Path Switch',
    color: 'bg-amber-500',
    category: 'Logic',
    description: 'Multi-way intelligent routing based on AI predictions, variables, or complex conditions',
    usage: 'Define multiple output paths with conditions. Supports default fallback and priority routing.',
    examples: ['Department routing', 'Language selection', 'Priority level routing']
  },
  parallel: {
    icon: GitBranch,
    label: 'Parallel Processing',
    color: 'bg-yellow-700',
    category: 'Logic',
    description: 'Execute multiple workflow branches simultaneously and synchronize results',
    usage: 'Split workflow into parallel branches, set synchronization points, handle partial failures.',
    examples: ['Multi-API calls', 'Concurrent validations', 'Background processing']
  },

  // External Integrations
  api: {
    icon: Zap,
    label: 'REST API Call',
    color: 'bg-pink-500',
    category: 'External',
    description: 'Advanced HTTP client with retry logic, authentication, and response caching',
    usage: 'Configure endpoints, authentication, headers, retry policies, and response handling.',
    examples: ['CRM integration', 'Payment processing', 'External validation']
  },
  soap: {
    icon: Zap,
    label: 'SOAP Service',
    color: 'bg-pink-600',
    category: 'External',
    description: 'SOAP web service client for legacy system integration with WSDL parsing',
    usage: 'Import WSDL, configure service endpoints, handle complex types and fault responses.',
    examples: ['Legacy banking systems', 'Government portals', 'Enterprise integrations']
  },
  graphql: {
    icon: Zap,
    label: 'GraphQL Query',
    color: 'bg-pink-700',
    category: 'External',
    description: 'GraphQL client with query optimization and subscription support',
    usage: 'Write GraphQL queries, manage variables, handle real-time subscriptions.',
    examples: ['Modern API queries', 'Real-time updates', 'Flexible data fetching']
  },

  // Communication & Output Nodes
  tts: {
    icon: Volume2,
    label: 'Neural TTS',
    color: 'bg-orange-500',
    category: 'Output',
    description: 'Neural text-to-speech with natural Malayalam voices, emotion control, and SSML support',
    usage: 'Select voice models, adjust speed/pitch, use SSML for emphasis, configure cultural pronunciation.',
    examples: ['Natural Malayalam speech', 'Emotional responses', 'SSML-enhanced audio']
  },
  sms: {
    icon: MessageSquare,
    label: 'SMS Gateway',
    color: 'bg-orange-600',
    category: 'Output',
    description: 'Multi-carrier SMS with delivery tracking, Unicode support, and template management',
    usage: 'Configure SMS gateways, create templates, handle delivery receipts, support Malayalam text.',
    examples: ['OTP delivery', 'Appointment reminders', 'Marketing messages']
  },
  email: {
    icon: Mail,
    label: 'Email Service',
    color: 'bg-orange-700',
    category: 'Output',
    description: 'Rich email with templates, attachments, tracking, and multilingual content',
    usage: 'Design email templates, manage attachments, track opens/clicks, support Malayalam content.',
    examples: ['Confirmation emails', 'Report delivery', 'Newsletter campaigns']
  },
  whatsapp: {
    icon: MessageSquare,
    label: 'WhatsApp Business',
    color: 'bg-green-400',
    category: 'Output',
    description: 'WhatsApp Business API integration with rich media, templates, and interactive buttons',
    usage: 'Configure business account, create message templates, handle interactive responses.',
    examples: ['Order confirmations', 'Customer support', 'Interactive menus']
  },

  // Analytics & Monitoring
  analytics: {
    icon: BarChart3,
    label: 'Advanced Analytics',
    color: 'bg-gray-500',
    category: 'Analytics',
    description: 'Comprehensive workflow analytics with custom metrics, KPIs, and real-time dashboards',
    usage: 'Define custom events, set up KPI tracking, configure real-time alerts and dashboards.',
    examples: ['Call success rates', 'Customer satisfaction', 'Performance metrics']
  },
  log: {
    icon: FileText,
    label: 'Smart Logging',
    color: 'bg-gray-600',
    category: 'Analytics',
    description: 'Structured logging with levels, filtering, and integration with monitoring systems',
    usage: 'Set log levels, configure structured data, integrate with monitoring tools.',
    examples: ['Debug information', 'Audit trails', 'Error tracking']
  },
  metrics: {
    icon: BarChart3,
    label: 'Custom Metrics',
    color: 'bg-gray-700',
    category: 'Analytics',
    description: 'Custom business metrics collection with aggregation and real-time monitoring',
    usage: 'Define business metrics, set aggregation rules, configure alerting thresholds.',
    examples: ['Revenue tracking', 'Customer metrics', 'Performance KPIs']
  },

  // Security & Compliance
  auth: {
    icon: AlertCircle,
    label: 'Authentication',
    color: 'bg-red-400',
    category: 'Security',
    description: 'Multi-factor authentication with OTP, biometrics, and identity verification',
    usage: 'Configure auth methods, set verification levels, handle failed attempts.',
    examples: ['Phone verification', 'Identity confirmation', 'Access control']
  },
  encryption: {
    icon: AlertCircle,
    label: 'Data Encryption',
    color: 'bg-red-500',
    category: 'Security',
    description: 'End-to-end encryption for sensitive data with key management and compliance',
    usage: 'Configure encryption algorithms, manage keys, ensure compliance requirements.',
    examples: ['PII protection', 'Payment data', 'Medical records']
  },

  // System Control
  delay: {
    icon: Clock,
    label: 'Smart Delay',
    color: 'bg-slate-500',
    category: 'Control',
    description: 'Intelligent delays with jitter, business hours awareness, and dynamic timing',
    usage: 'Set delay duration, add randomization, configure business hours respect.',
    examples: ['Rate limiting', 'Natural pauses', 'Retry delays']
  },
  end: {
    icon: X,
    label: 'Workflow End',
    color: 'bg-red-500',
    category: 'Control',
    description: 'Graceful workflow termination with status codes, cleanup, and final actions',
    usage: 'Set exit status, configure cleanup actions, define success/failure conditions.',
    examples: ['Successful completion', 'Error termination', 'User hangup']
  },
  error_handler: {
    icon: AlertTriangle,
    label: 'Error Handler',
    color: 'bg-red-600',
    category: 'Control',
    description: 'Comprehensive error handling with recovery strategies and notification systems',
    usage: 'Define error types, set recovery actions, configure notification channels.',
    examples: ['API failures', 'Timeout handling', 'System errors']
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

      case 'dtmf':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                max="60"
                value={config.timeout || 10}
                onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="valid-digits">Valid Digits</Label>
              <Input
                id="valid-digits"
                value={config.validDigits || '0123456789*#'}
                onChange={(e) => setConfig({ ...config, validDigits: e.target.value })}
                placeholder="0123456789*#"
              />
            </div>
            <div>
              <Label htmlFor="min-length">Minimum Length</Label>
              <Input
                id="min-length"
                type="number"
                min="1"
                value={config.minLength || 1}
                onChange={(e) => setConfig({ ...config, minLength: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="max-length">Maximum Length</Label>
              <Input
                id="max-length"
                type="number"
                min="1"
                value={config.maxLength || 10}
                onChange={(e) => setConfig({ ...config, maxLength: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );

      case 'stt':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Primary Language</Label>
              <Select
                value={config.language || 'malayalam'}
                onValueChange={(value) => setConfig({ ...config, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malayalam">Malayalam</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
              <Input
                id="confidence-threshold"
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={config.confidenceThreshold || 0.7}
                onChange={(e) => setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="noise-reduction">Noise Reduction</Label>
              <Select
                value={config.noiseReduction || 'medium'}
                onValueChange={(value) => setConfig({ ...config, noiseReduction: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'malayalam_cultural':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dialect-region">Dialect Region</Label>
              <Select
                value={config.dialectRegion || 'auto'}
                onValueChange={(value) => setConfig({ ...config, dialectRegion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="northern">Northern Kerala</SelectItem>
                  <SelectItem value="central">Central Kerala</SelectItem>
                  <SelectItem value="southern">Southern Kerala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cultural-sensitivity">Cultural Sensitivity</Label>
              <Select
                value={config.culturalSensitivity || 'high'}
                onValueChange={(value) => setConfig({ ...config, culturalSensitivity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="festival-awareness">Festival Awareness</Label>
              <Select
                value={config.festivalAwareness ? 'enabled' : 'disabled'}
                onValueChange={(value) => setConfig({ ...config, festivalAwareness: value === 'enabled' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'amd_detection':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="sensitivity">Detection Sensitivity</Label>
              <Input
                id="sensitivity"
                type="number"
                min="0.1"
                max="1"
                step="0.1"
                value={config.sensitivity || 0.8}
                onChange={(e) => setConfig({ ...config, sensitivity: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="max-detection-time">Max Detection Time (ms)</Label>
              <Input
                id="max-detection-time"
                type="number"
                min="1000"
                max="10000"
                value={config.maxDetectionTime || 3000}
                onChange={(e) => setConfig({ ...config, maxDetectionTime: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="malayalam-patterns">Malayalam Pattern Detection</Label>
              <Select
                value={config.malayalamPatterns ? 'enabled' : 'disabled'}
                onValueChange={(value) => setConfig({ ...config, malayalamPatterns: value === 'enabled' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-number">Business Phone Number</Label>
              <Input
                id="business-number"
                value={config.businessNumber || ''}
                onChange={(e) => setConfig({ ...config, businessNumber: e.target.value })}
                placeholder="+91XXXXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="template-id">Message Template ID</Label>
              <Input
                id="template-id"
                value={config.templateId || ''}
                onChange={(e) => setConfig({ ...config, templateId: e.target.value })}
                placeholder="template_name"
              />
            </div>
            <div>
              <Label htmlFor="interactive-type">Interactive Type</Label>
              <Select
                value={config.interactiveType || 'button'}
                onValueChange={(value) => setConfig({ ...config, interactiveType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="button">Button</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="reply">Quick Reply</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'auth':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="auth-method">Authentication Method</Label>
              <Select
                value={config.authMethod || 'otp'}
                onValueChange={(value) => setConfig({ ...config, authMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="otp">OTP (SMS/Voice)</SelectItem>
                  <SelectItem value="pin">PIN Verification</SelectItem>
                  <SelectItem value="biometric">Biometric</SelectItem>
                  <SelectItem value="token">Token-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="max-attempts">Maximum Attempts</Label>
              <Input
                id="max-attempts"
                type="number"
                min="1"
                max="10"
                value={config.maxAttempts || 3}
                onChange={(e) => setConfig({ ...config, maxAttempts: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="timeout-minutes">Timeout (minutes)</Label>
              <Input
                id="timeout-minutes"
                type="number"
                min="1"
                max="60"
                value={config.timeoutMinutes || 5}
                onChange={(e) => setConfig({ ...config, timeoutMinutes: parseInt(e.target.value) })}
              />
            </div>
          </div>
        );

      case 'parallel':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="branch-count">Number of Branches</Label>
              <Input
                id="branch-count"
                type="number"
                min="2"
                max="10"
                value={config.branchCount || 2}
                onChange={(e) => setConfig({ ...config, branchCount: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="sync-strategy">Synchronization Strategy</Label>
              <Select
                value={config.syncStrategy || 'wait_all'}
                onValueChange={(value) => setConfig({ ...config, syncStrategy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wait_all">Wait for All</SelectItem>
                  <SelectItem value="wait_any">Wait for Any</SelectItem>
                  <SelectItem value="wait_majority">Wait for Majority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeout-strategy">Timeout Strategy</Label>
              <Select
                value={config.timeoutStrategy || 'fail_slow'}
                onValueChange={(value) => setConfig({ ...config, timeoutStrategy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fail_slow">Fail Slow Branches</SelectItem>
                  <SelectItem value="partial_success">Allow Partial Success</SelectItem>
                  <SelectItem value="fail_all">Fail All on Timeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'error_handler':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="error-types">Handle Error Types</Label>
              <Textarea
                id="error-types"
                value={config.errorTypes?.join('\n') || 'timeout\napi_error\nvalidation_error'}
                onChange={(e) => setConfig({ ...config, errorTypes: e.target.value.split('\n').filter(t => t.trim()) })}
                placeholder="timeout&#10;api_error&#10;validation_error"
              />
            </div>
            <div>
              <Label htmlFor="retry-attempts">Retry Attempts</Label>
              <Input
                id="retry-attempts"
                type="number"
                min="0"
                max="10"
                value={config.retryAttempts || 3}
                onChange={(e) => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="fallback-action">Fallback Action</Label>
              <Select
                value={config.fallbackAction || 'continue'}
                onValueChange={(value) => setConfig({ ...config, fallbackAction: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">Continue Workflow</SelectItem>
                  <SelectItem value="terminate">Terminate Workflow</SelectItem>
                  <SelectItem value="escalate">Escalate to Human</SelectItem>
                  <SelectItem value="retry">Retry Operation</SelectItem>
                </SelectContent>
              </Select>
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

        {/* Usage Guide Section */}
        {nodeType && (
          <div className="pt-4 border-t">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">Configuration</TabsTrigger>
                <TabsTrigger value="guide">Usage Guide</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-4">
                {renderConfigFields()}
              </TabsContent>

              <TabsContent value="guide" className="mt-4 space-y-3">
                <div>
                  <h5 className="font-medium text-sm mb-2">Description</h5>
                  <p className="text-xs text-gray-600">{nodeType.description}</p>
                </div>

                {nodeType.usage && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">How to Use</h5>
                    <p className="text-xs text-gray-600">{nodeType.usage}</p>
                  </div>
                )}

                {nodeType.examples && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Examples</h5>
                    <ul className="space-y-1">
                      {nodeType.examples.map((example, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-blue-800">Best Practices</h5>
                  <div className="space-y-1 text-xs text-blue-700">
                    {selectedNode?.data?.type === 'agent' && (
                      <>
                        <p>• Always provide clear, specific prompts</p>
                        <p>• Test with various cultural contexts</p>
                        <p>• Set appropriate temperature for creativity</p>
                        <p>• Include fallback responses</p>
                      </>
                    )}
                    {selectedNode?.data?.type === 'condition' && (
                      <>
                        <p>• Use clear, testable conditions</p>
                        <p>• Handle edge cases</p>
                        <p>• Test with sample data</p>
                        <p>• Provide meaningful path labels</p>
                      </>
                    )}
                    {selectedNode?.data?.type === 'api' && (
                      <>
                        <p>• Always set timeout values</p>
                        <p>• Implement retry logic</p>
                        <p>• Handle error responses</p>
                        <p>• Use proper authentication</p>
                      </>
                    )}
                    {selectedNode?.data?.type === 'tts' && (
                      <>
                        <p>• Choose appropriate voice for audience</p>
                        <p>• Test pronunciation of technical terms</p>
                        <p>• Consider cultural preferences</p>
                        <p>• Use SSML for better control</p>
                      </>
                    )}
                    {(selectedNode?.data?.type && !['agent', 'condition', 'api', 'tts'].includes(selectedNode.data.type)) && (
                      <>
                        <p>• Configure appropriate timeouts</p>
                        <p>• Test error scenarios</p>
                        <p>• Monitor performance</p>
                        <p>• Document configuration</p>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

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
  // Real-time data integration (temporarily disabled to test for infinite loop)
  /*
  const {
    data: liveData,
    isConnected,
    error: wsError,
    executeWorkflow,
    getNodeStatus
  } = useRealTimeWorkflowData();
  */

  // Real-time data integration
  const {
    data: liveData,
    isConnected,
    error: wsError,
    executeWorkflow,
    getNodeStatus
  } = useRealTimeWorkflowData();

  // Initialize with mock data to prevent transparent skeleton
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'demo-1',
      name: 'Customer Support IVR',
      description: 'Automated customer support workflow with AI routing',
      category: 'customer-service',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: []
    },
    {
      id: 'demo-2',
      name: 'Sales Inquiry Handler',
      description: 'Process sales inquiries and route to appropriate agents',
      category: 'sales',
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: []
    }
  ]);
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

  // Load workflows on component mount and sync with live data
  useEffect(() => {
    loadWorkflows();
  }, []);

  // Sync workflows with real-time data
  useEffect(() => {
    if (liveData.workflows.length > 0 && JSON.stringify(liveData.workflows) !== JSON.stringify(workflows)) {
      setWorkflows(liveData.workflows);
    }
    // Don't replace initial mock data if real-time data is empty
  }, [liveData.workflows, workflows]);

  // Update node statuses with real-time data
  useEffect(() => {
    setNodes(currentNodes => {
      const updatedNodes = currentNodes.map(node => {
        const liveStatus = getNodeStatus(node.id);
        const newData = {
          ...node.data,
          executionStatus: liveStatus.status === 'idle' ? undefined : liveStatus.status,
          lastExecuted: liveStatus.lastExecuted,
          executionCount: liveStatus.executionCount,
          averageTime: liveStatus.averageTime,
        };

        // Only update if data actually changed
        if (JSON.stringify(newData) !== JSON.stringify(node.data)) {
          return {
            ...node,
            data: newData
          };
        }
        return node;
      });

      // Only update state if nodes actually changed
      return updatedNodes.some((node, index) => node !== currentNodes[index]) ? updatedNodes : currentNodes;
    });
  }, [liveData.nodeStatuses, getNodeStatus]);

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
        // Only replace mock data if we have real data
        if (data && data.length > 0) {
          setWorkflows(data);
        }
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      // Keep mock data on error
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

  const executeWorkflowRealtime = async () => {
    if (!selectedWorkflow) return;

    if (!isConnected) {
      alert('Not connected to real-time server. Please check your connection.');
      return;
    }

    setIsExecuting(true);
    try {
      // Use real-time WebSocket execution
      await executeWorkflow(selectedWorkflow.id, {
        input: { text: "Test customer input", language: "malayalam" },
        context: {
          test: true,
          culturalContext: "kerala",
          timestamp: new Date().toISOString()
        },
      });

      // The execution results will come through WebSocket events
      // and be automatically reflected in the UI through the live data updates
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow: ' + (error as Error).message);
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
    <ManagementLayout>
      <div className="h-full flex flex-col p-6 gap-4">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold">AI Workflow Builder</h1>
            <p className="text-muted-foreground">
              Design and automate IVR workflows with chained AI agents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 overflow-auto">
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
                      className={`p-2 border rounded cursor-pointer ${selectedWorkflow?.id === workflow.id
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
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
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
          <div className="lg:col-span-3 flex flex-col h-full min-h-0">
            {isBuilding ? (
              <div className="flex gap-4 flex-1 min-h-0">
                {/* Workflow Canvas */}
                <div className="flex-1 flex flex-col min-h-0">
                  <Card className="flex-1 flex flex-col min-h-0">
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
                            onClick={executeWorkflowRealtime}
                            disabled={isExecuting}
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {isExecuting ? 'Executing...' : 'Test Run'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0">
                      <div className="flex-1 min-h-[400px] border rounded-lg overflow-hidden" ref={reactFlowWrapper}>
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

                      {/* Real-time Status Panel */}
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                            Real-time Status
                          </h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Connection:</span>
                              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Active Workflows:</span>
                              <span className="text-blue-600">{liveData.systemMetrics.activeWorkflows}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Queue:</span>
                              <span className="text-orange-600">{liveData.systemMetrics.queuedExecutions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>System Load:</span>
                              <span className="text-purple-600">{liveData.systemMetrics.systemLoad.toFixed(1)}%</span>
                            </div>
                          </div>
                          {wsError && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                              {wsError}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border rounded-lg p-3">
                          <h4 className="font-semibold text-sm mb-2">Workflow Statistics</h4>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Total Nodes:</span>
                              <span className="text-blue-600">{nodes.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Connections:</span>
                              <span className="text-green-600">{edges.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valid Nodes:</span>
                              <span className="text-emerald-600">{nodes.filter(n => validateNode(n.data)).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Active Executions:</span>
                              <span className="text-orange-600">
                                {liveData.executions.filter(e => e.status === 'running').length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Current Execution Status */}
                      {liveData.executions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold text-sm mb-2">Recent Executions</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {liveData.executions.slice(0, 3).map((execution) => (
                              <div
                                key={execution.workflowId}
                                className="bg-gray-50 p-2 rounded text-xs"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">Workflow: {execution.workflowId}</span>
                                  <Badge
                                    variant={
                                      execution.status === 'running' ? 'default' :
                                        execution.status === 'completed' ? 'secondary' :
                                          'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {execution.status}
                                  </Badge>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Progress: {execution.progress.toFixed(0)}%</span>
                                  <span>
                                    {execution.currentNodeId && `Current: ${execution.currentNodeId}`}
                                  </span>
                                </div>
                                {execution.executionLog.length > 0 && (
                                  <div className="mt-1 text-gray-500 truncate">
                                    Last: {execution.executionLog[execution.executionLog.length - 1].message}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
              <Card className="flex-1 h-full">
                <CardContent className="flex items-center justify-center h-full min-h-[400px]">
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
    </ManagementLayout>
  );
};

export default WorkflowBuilder;