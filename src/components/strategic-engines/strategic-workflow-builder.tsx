// Strategic Engine Integration with React Flow
// Workflow Builder Integration for Project Saksham

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
} from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Settings, Zap, Brain, Target } from 'lucide-react';

import { 
  EngineType, 
  StrategyNode, 
  StrategyNodeData, 
  CulturalContext, 
  FallbackBehavior,
  StrategicEngineConfig,
  EngineStatus
} from '../../features/strategic-engines/types';
import { strategicEngineOrchestrator } from '../../features/strategic-engines/orchestrator';

// Strategic Engine Node Component
const StrategyEngineNode: React.FC<{ data: StrategyNodeData }> = ({ data }) => {
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.DEVELOPMENT);
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    // Load engine status
    strategicEngineOrchestrator.getEngineStatus(data.engineConfig.id || '')
      .then(setStatus)
      .catch(() => setStatus(EngineStatus.MAINTENANCE));
  }, [data.engineConfig.id]);

  const getEngineIcon = (engineType: EngineType) => {
    switch (engineType) {
      case EngineType.HYPER_PERSONALIZATION:
        return <Brain className="w-4 h-4" />;
      case EngineType.AUTONOMOUS_DISPATCH:
        return <Target className="w-4 h-4" />;
      case EngineType.AI_COPILOT:
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: EngineStatus) => {
    switch (status) {
      case EngineStatus.PRODUCTION:
        return 'bg-green-100 text-green-800';
      case EngineStatus.PILOT:
        return 'bg-blue-100 text-blue-800';
      case EngineStatus.TESTING:
        return 'bg-yellow-100 text-yellow-800';
      case EngineStatus.DEVELOPMENT:
        return 'bg-purple-100 text-purple-800';
      case EngineStatus.MAINTENANCE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: EngineStatus) => {
    switch (status) {
      case EngineStatus.PRODUCTION:
        return <CheckCircle className="w-3 h-3" />;
      case EngineStatus.PILOT:
      case EngineStatus.TESTING:
        return <Clock className="w-3 h-3" />;
      case EngineStatus.MAINTENANCE:
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Settings className="w-3 h-3" />;
    }
  };

  return (
    <Card className="w-64 shadow-lg border-2 border-dashed border-blue-300 bg-white">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getEngineIcon(data.engineType)}
            <CardTitle className="text-sm font-medium">
              {data.label}
            </CardTitle>
          </div>
          <Badge className={`text-xs px-2 py-1 ${getStatusColor(status)}`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(status)}
              <span>{status}</span>
            </div>
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mt-1">{data.description}</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Cultural Context Display */}
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {data.culturalContext.language.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.culturalContext.region}
            </Badge>
            {data.culturalContext.festivalAwareness && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                Festival Aware
              </Badge>
            )}
          </div>

          {/* Engine Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Accuracy:</span>
              <span className="ml-1 font-medium">
                {data.engineConfig.capabilities?.[0]?.accuracy || 85}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Latency:</span>
              <span className="ml-1 font-medium">
                {data.engineConfig.capabilities?.[0]?.latency || 200}ms
              </span>
            </div>
          </div>

          {/* Fallback Strategy */}
          {data.fallbackBehavior.enabled && (
            <div className="flex items-center space-x-1 text-xs">
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <span className="text-yellow-700">
                Fallback: {data.fallbackBehavior.strategy}
              </span>
            </div>
          )}

          {/* Configuration Button */}
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => setIsConfiguring(true)}
          >
            <Settings className="w-3 h-3 mr-1" />
            Configure
          </Button>
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </Card>
  );
};

// Engine Configuration Modal Component
interface EngineConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: StrategyNodeData;
  onSave: (updatedData: StrategyNodeData) => void;
}

const EngineConfigurationModal: React.FC<EngineConfigurationModalProps> = ({
  isOpen,
  onClose,
  nodeData,
  onSave
}) => {
  const [configData, setConfigData] = useState<StrategyNodeData>(nodeData);

  const handleSave = () => {
    onSave(configData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Configure Strategic Engine</CardTitle>
          <p className="text-sm text-gray-600">{configData.engineType}</p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="cultural">Cultural Context</TabsTrigger>
              <TabsTrigger value="fallback">Fallback Behavior</TabsTrigger>
              <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Engine Label</Label>
                  <Input
                    id="label"
                    value={configData.label}
                    onChange={(e) => setConfigData({
                      ...configData,
                      label: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={configData.description}
                    onChange={(e) => setConfigData({
                      ...configData,
                      description: e.target.value
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cultural" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={configData.culturalContext.language}
                    onValueChange={(value) => setConfigData({
                      ...configData,
                      culturalContext: {
                        ...configData.culturalContext,
                        language: value as 'ml' | 'en' | 'manglish'
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">Malayalam</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="manglish">Manglish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={configData.culturalContext.region}
                    onValueChange={(value) => setConfigData({
                      ...configData,
                      culturalContext: {
                        ...configData.culturalContext,
                        region: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kerala-north">Kerala North</SelectItem>
                      <SelectItem value="kerala-central">Kerala Central</SelectItem>
                      <SelectItem value="kerala-south">Kerala South</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="festivalAwareness"
                  checked={configData.culturalContext.festivalAwareness}
                  onChange={(e) => setConfigData({
                    ...configData,
                    culturalContext: {
                      ...configData.culturalContext,
                      festivalAwareness: e.target.checked
                    }
                  })}
                />
                <Label htmlFor="festivalAwareness">Enable Festival Awareness</Label>
              </div>
            </TabsContent>

            <TabsContent value="fallback" className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fallbackEnabled"
                  checked={configData.fallbackBehavior.enabled}
                  onChange={(e) => setConfigData({
                    ...configData,
                    fallbackBehavior: {
                      ...configData.fallbackBehavior,
                      enabled: e.target.checked
                    }
                  })}
                />
                <Label htmlFor="fallbackEnabled">Enable Fallback Behavior</Label>
              </div>
              
              {configData.fallbackBehavior.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fallbackStrategy">Fallback Strategy</Label>
                    <Select
                      value={configData.fallbackBehavior.strategy}
                      onValueChange={(value) => setConfigData({
                        ...configData,
                        fallbackBehavior: {
                          ...configData.fallbackBehavior,
                          strategy: value as 'retry' | 'skip' | 'default_response' | 'human_handoff'
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retry">Retry</SelectItem>
                        <SelectItem value="skip">Skip</SelectItem>
                        <SelectItem value="default_response">Default Response</SelectItem>
                        <SelectItem value="human_handoff">Human Handoff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={configData.fallbackBehavior.maxRetries || 3}
                      onChange={(e) => setConfigData({
                        ...configData,
                        fallbackBehavior: {
                          ...configData.fallbackBehavior,
                          maxRetries: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mapping" className="space-y-4">
              <div>
                <Label>Input Mapping</Label>
                <div className="space-y-2 mt-2">
                  {Object.entries(configData.inputMapping).map(([key, value], index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        placeholder="Input Field"
                        value={key}
                        onChange={(e) => {
                          const newMapping = { ...configData.inputMapping };
                          delete newMapping[key];
                          newMapping[e.target.value] = value;
                          setConfigData({
                            ...configData,
                            inputMapping: newMapping
                          });
                        }}
                      />
                      <Input
                        placeholder="Source Field"
                        value={value}
                        onChange={(e) => setConfigData({
                          ...configData,
                          inputMapping: {
                            ...configData.inputMapping,
                            [key]: e.target.value
                          }
                        })}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfigData({
                      ...configData,
                      inputMapping: {
                        ...configData.inputMapping,
                        '': ''
                      }
                    })}
                  >
                    Add Mapping
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Strategic Engine Palette Component
const EnginesPalette: React.FC<{
  onAddEngine: (engineType: EngineType) => void;
}> = ({ onAddEngine }) => {
  const availableEngines = [
    {
      type: EngineType.HYPER_PERSONALIZATION,
      name: 'Hyper Personalization',
      description: 'AI-driven customer experience customization',
      icon: <Brain className="w-5 h-5" />,
      status: 'Ready'
    },
    {
      type: EngineType.AUTONOMOUS_DISPATCH,
      name: 'Autonomous Dispatch',
      description: 'Self-managing dispatch optimization',
      icon: <Target className="w-5 h-5" />,
      status: 'Ready'
    },
    {
      type: EngineType.AI_COPILOT,
      name: 'AI Copilot',
      description: 'Intelligent agent assistance',
      icon: <Zap className="w-5 h-5" />,
      status: 'Coming Soon'
    }
  ];

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-lg">Strategic Engines</CardTitle>
        <p className="text-sm text-gray-600">Drag engines to build your workflow</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {availableEngines.map((engine) => (
          <div
            key={engine.type}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              engine.status === 'Ready'
                ? 'hover:bg-blue-50 border-blue-200'
                : 'opacity-50 cursor-not-allowed border-gray-200'
            }`}
            onClick={() => engine.status === 'Ready' && onAddEngine(engine.type)}
          >
            <div className="flex items-center space-x-3">
              {engine.icon}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{engine.name}</h4>
                <p className="text-xs text-gray-600">{engine.description}</p>
              </div>
              <Badge
                variant={engine.status === 'Ready' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {engine.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Main Strategic Workflow Builder Component
const StrategicWorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<StrategyNode | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [engineMetrics, setEngineMetrics] = useState<Map<string, any>>(new Map());

  const nodeTypes = {
    strategyEngine: StrategyEngineNode
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onAddEngine = useCallback((engineType: EngineType) => {
    const newNodeId = `${engineType}_${Date.now()}`;
    
    const newNode: StrategyNode = {
      id: newNodeId,
      type: 'strategy_engine',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        engineType,
        engineConfig: {
          id: newNodeId,
          name: engineType.replace('_', ' ').toUpperCase(),
          capabilities: []
        },
        inputMapping: {},
        outputMapping: {},
        culturalContext: {
          language: 'ml',
          region: 'kerala-central',
          culturalPreferences: {},
          festivalAwareness: true,
          localCustoms: {}
        },
        fallbackBehavior: {
          enabled: true,
          strategy: 'retry',
          maxRetries: 3
        },
        label: engineType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: getEngineDescription(engineType)
      }
    };

    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getEngineDescription = (engineType: EngineType): string => {
    switch (engineType) {
      case EngineType.HYPER_PERSONALIZATION:
        return '30% satisfaction increase through AI personalization';
      case EngineType.AUTONOMOUS_DISPATCH:
        return '25% wait time reduction via intelligent dispatch';
      case EngineType.AI_COPILOT:
        return 'Intelligent agent assistance and guidance';
      default:
        return 'Strategic engine for business intelligence';
    }
  };

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as StrategyNode);
    setShowConfig(true);
  }, []);

  const onConfigSave = useCallback((updatedData: StrategyNodeData) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: updatedData }
            : node
        )
      );
    }
  }, [selectedNode, setNodes]);

  // Load engine metrics periodically
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const engines = await strategicEngineOrchestrator.listEngines();
        const metricsMap = new Map();
        
        for (const engine of engines) {
          const metrics = await strategicEngineOrchestrator.getEngineMetrics(engine.id);
          metricsMap.set(engine.id, metrics);
        }
        
        setEngineMetrics(metricsMap);
      } catch (error) {
        console.error('Failed to load engine metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen">
      {/* Engine Palette */}
      <div className="w-80 p-4 bg-gray-50 border-r">
        <EnginesPalette onAddEngine={onAddEngine} />
        
        {/* Engine Metrics Panel */}
        {engineMetrics.size > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Engine Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.from(engineMetrics.entries()).map(([engineId, metrics]) => (
                <div key={engineId} className="mb-3 p-2 border rounded">
                  <h5 className="font-medium text-sm">{engineId}</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                    <div>Uptime: {metrics.uptime.toFixed(1)}%</div>
                    <div>Success: {metrics.successRate.toFixed(1)}%</div>
                    <div>Latency: {metrics.averageResponseTime}ms</div>
                    <div>Throughput: {metrics.throughput}/s</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Workflow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-100"
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Configuration Modal */}
        {selectedNode && (
          <EngineConfigurationModal
            isOpen={showConfig}
            onClose={() => setShowConfig(false)}
            nodeData={selectedNode.data}
            onSave={onConfigSave}
          />
        )}

        {/* Workflow Actions */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            onClick={() => {
              // Save workflow
              console.log('Saving workflow:', { nodes, edges });
            }}
          >
            Save Workflow
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Deploy workflow
              console.log('Deploying workflow:', { nodes, edges });
            }}
          >
            Deploy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StrategicWorkflowBuilder;