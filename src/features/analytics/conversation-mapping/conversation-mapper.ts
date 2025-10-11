export interface ConversationNode {
  id: string;
  type: 'start' | 'intent' | 'action' | 'response' | 'end' | 'branch';
  label: string;
  intent?: string;
  entities?: any;
  response?: string;
  nextNodes: string[];
  metadata: {
    position: { x: number; y: number };
    visitCount: number;
    averageTime: number;
    successRate: number;
    dropOffRate: number;
  };
}

export interface ConversationEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  probability: number;
  traversals: number;
}

export interface ConversationFlow {
  id: string;
  name: string;
  description: string;
  nodes: Map<string, ConversationNode>;
  edges: Map<string, ConversationEdge>;
  startNode: string;
  endNodes: string[];
  metadata: {
    totalConversations: number;
    averageDuration: number;
    successRate: number;
    dropOffPoints: string[];
    popularPaths: string[][];
  };
}

export interface ConversationPath {
  id: string;
  nodes: string[];
  duration: number;
  success: boolean;
  timestamp: Date;
  userId?: string;
}

export class ConversationMapper {
  private flows: Map<string, ConversationFlow> = new Map();
  private conversationPaths: ConversationPath[] = [];
  private nodeCounter: number = 0;
  private edgeCounter: number = 0;

  constructor() {
    this.initializeDefaultFlow();
  }

  private initializeDefaultFlow(): void {
    const defaultFlow: ConversationFlow = {
      id: 'default-ivr-flow',
      name: 'Default IVR Flow',
      description: 'Standard IVR conversation flow',
      nodes: new Map(),
      edges: new Map(),
      startNode: 'start',
      endNodes: ['end_success', 'end_failure'],
      metadata: {
        totalConversations: 0,
        averageDuration: 0,
        successRate: 0,
        dropOffPoints: [],
        popularPaths: []
      }
    };

    // Create default nodes
    this.createDefaultNodes(defaultFlow);
    this.createDefaultEdges(defaultFlow);
    
    this.flows.set(defaultFlow.id, defaultFlow);
  }

  private createDefaultNodes(flow: ConversationFlow): void {
    const nodes: ConversationNode[] = [
      {
        id: 'start',
        type: 'start',
        label: 'Call Start',
        nextNodes: ['greeting'],
        metadata: {
          position: { x: 100, y: 100 },
          visitCount: 0,
          averageTime: 0,
          successRate: 1.0,
          dropOffRate: 0
        }
      },
      {
        id: 'greeting',
        type: 'response',
        label: 'Greeting',
        response: 'Welcome! How can I help you today?',
        nextNodes: ['intent_recognition'],
        metadata: {
          position: { x: 250, y: 100 },
          visitCount: 0,
          averageTime: 2,
          successRate: 0.95,
          dropOffRate: 0.05
        }
      },
      {
        id: 'intent_recognition',
        type: 'intent',
        label: 'Intent Recognition',
        nextNodes: ['book_ride', 'ride_status', 'help', 'emergency'],
        metadata: {
          position: { x: 400, y: 100 },
          visitCount: 0,
          averageTime: 3,
          successRate: 0.85,
          dropOffRate: 0.15
        }
      },
      {
        id: 'book_ride',
        type: 'action',
        label: 'Book Ride',
        intent: 'book_ride',
        nextNodes: ['collect_location', 'end_success'],
        metadata: {
          position: { x: 550, y: 50 },
          visitCount: 0,
          averageTime: 30,
          successRate: 0.8,
          dropOffRate: 0.2
        }
      },
      {
        id: 'ride_status',
        type: 'action',
        label: 'Check Ride Status',
        intent: 'ride_status',
        nextNodes: ['end_success'],
        metadata: {
          position: { x: 550, y: 150 },
          visitCount: 0,
          averageTime: 15,
          successRate: 0.9,
          dropOffRate: 0.1
        }
      },
      {
        id: 'help',
        type: 'action',
        label: 'Help',
        intent: 'help',
        nextNodes: ['provide_help', 'end_success'],
        metadata: {
          position: { x: 550, y: 250 },
          visitCount: 0,
          averageTime: 20,
          successRate: 0.85,
          dropOffRate: 0.15
        }
      },
      {
        id: 'emergency',
        type: 'action',
        label: 'Emergency',
        intent: 'emergency',
        nextNodes: ['emergency_response', 'end_success'],
        metadata: {
          position: { x: 550, y: 350 },
          visitCount: 0,
          averageTime: 10,
          successRate: 0.95,
          dropOffRate: 0.05
        }
      },
      {
        id: 'collect_location',
        type: 'branch',
        label: 'Collect Location',
        nextNodes: ['confirm_booking', 'end_failure'],
        metadata: {
          position: { x: 700, y: 50 },
          visitCount: 0,
          averageTime: 25,
          successRate: 0.75,
          dropOffRate: 0.25
        }
      },
      {
        id: 'confirm_booking',
        type: 'response',
        label: 'Confirm Booking',
        nextNodes: ['end_success'],
        metadata: {
          position: { x: 850, y: 50 },
          visitCount: 0,
          averageTime: 5,
          successRate: 0.9,
          dropOffRate: 0.1
        }
      },
      {
        id: 'provide_help',
        type: 'response',
        label: 'Provide Help',
        nextNodes: ['end_success'],
        metadata: {
          position: { x: 700, y: 250 },
          visitCount: 0,
          averageTime: 10,
          successRate: 0.8,
          dropOffRate: 0.2
        }
      },
      {
        id: 'emergency_response',
        type: 'response',
        label: 'Emergency Response',
        nextNodes: ['end_success'],
        metadata: {
          position: { x: 700, y: 350 },
          visitCount: 0,
          averageTime: 8,
          successRate: 0.95,
          dropOffRate: 0.05
        }
      },
      {
        id: 'end_success',
        type: 'end',
        label: 'Success',
        nextNodes: [],
        metadata: {
          position: { x: 1000, y: 200 },
          visitCount: 0,
          averageTime: 0,
          successRate: 1.0,
          dropOffRate: 0
        }
      },
      {
        id: 'end_failure',
        type: 'end',
        label: 'Failure',
        nextNodes: [],
        metadata: {
          position: { x: 1000, y: 350 },
          visitCount: 0,
          averageTime: 0,
          successRate: 0,
          dropOffRate: 1.0
        }
      }
    ];

    nodes.forEach(node => flow.nodes.set(node.id, node));
  }

  private createDefaultEdges(flow: ConversationFlow): void {
    const edges: ConversationEdge[] = [
      { id: 'e1', source: 'start', target: 'greeting', probability: 1.0, traversals: 0 },
      { id: 'e2', source: 'greeting', target: 'intent_recognition', probability: 0.95, traversals: 0 },
      { id: 'e3', source: 'intent_recognition', target: 'book_ride', probability: 0.4, traversals: 0 },
      { id: 'e4', source: 'intent_recognition', target: 'ride_status', probability: 0.3, traversals: 0 },
      { id: 'e5', source: 'intent_recognition', target: 'help', probability: 0.2, traversals: 0 },
      { id: 'e6', source: 'intent_recognition', target: 'emergency', probability: 0.1, traversals: 0 },
      { id: 'e7', source: 'book_ride', target: 'collect_location', probability: 0.8, traversals: 0 },
      { id: 'e8', source: 'ride_status', target: 'end_success', probability: 0.9, traversals: 0 },
      { id: 'e9', source: 'help', target: 'provide_help', probability: 0.85, traversals: 0 },
      { id: 'e10', source: 'emergency', target: 'emergency_response', probability: 0.95, traversals: 0 },
      { id: 'e11', source: 'collect_location', target: 'confirm_booking', probability: 0.75, traversals: 0 },
      { id: 'e12', source: 'collect_location', target: 'end_failure', probability: 0.25, traversals: 0 },
      { id: 'e13', source: 'confirm_booking', target: 'end_success', probability: 0.9, traversals: 0 },
      { id: 'e14', source: 'provide_help', target: 'end_success', probability: 0.8, traversals: 0 },
      { id: 'e15', source: 'emergency_response', target: 'end_success', probability: 0.95, traversals: 0 }
    ];

    edges.forEach(edge => flow.edges.set(edge.id, edge));
  }

  async trackConversation(conversationData: any): Promise<void> {
    const path: ConversationPath = {
      id: crypto.randomUUID(),
      nodes: conversationData.nodes || [],
      duration: conversationData.duration || 0,
      success: conversationData.success || false,
      timestamp: new Date(),
      userId: conversationData.userId
    };

    this.conversationPaths.push(path);

    // Update flow metadata
    this.updateFlowMetadata(path);

    // Update node metrics
    this.updateNodeMetrics(path);

    // Update edge metrics
    this.updateEdgeMetrics(path);
  }

  private updateFlowMetadata(path: ConversationPath): void {
    const flow = this.flows.get('default-ivr-flow');
    if (!flow) return;

    flow.metadata.totalConversations++;
    
    // Update average duration
    const totalDuration = flow.metadata.averageDuration * (flow.metadata.totalConversations - 1) + path.duration;
    flow.metadata.averageDuration = totalDuration / flow.metadata.totalConversations;
    
    // Update success rate
    const successfulConversations = this.conversationPaths.filter(p => p.success).length;
    flow.metadata.successRate = successfulConversations / this.conversationPaths.length;
    
    // Update popular paths
    this.updatePopularPaths(flow);
    
    // Update drop-off points
    this.updateDropOffPoints(flow);
  }

  private updateNodeMetrics(path: ConversationPath): void {
    const flow = this.flows.get('default-ivr-flow');
    if (!flow) return;

    path.nodes.forEach(nodeId => {
      const node = flow.nodes.get(nodeId);
      if (node) {
        node.metadata.visitCount++;
      }
    });
  }

  private updateEdgeMetrics(path: ConversationPath): void {
    const flow = this.flows.get('default-ivr-flow');
    if (!flow) return;

    for (let i = 0; i < path.nodes.length - 1; i++) {
      const sourceId = path.nodes[i];
      const targetId = path.nodes[i + 1];
      
      const edge = Array.from(flow.edges.values())
        .find(e => e.source === sourceId && e.target === targetId);
      
      if (edge) {
        edge.traversals++;
      }
    }
  }

  private updatePopularPaths(flow: ConversationFlow): void {
    const pathCounts: { [path: string]: number } = {};
    
    this.conversationPaths.forEach(path => {
      const pathKey = path.nodes.join('->');
      pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
    });

    flow.metadata.popularPaths = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path]) => path.split('->'));
  }

  private updateDropOffPoints(flow: ConversationFlow): void {
    const dropOffCounts: { [nodeId: string]: number } = {};
    
    this.conversationPaths.forEach(path => {
      if (!path.success && path.nodes.length > 0) {
        const lastNode = path.nodes[path.nodes.length - 1];
        dropOffCounts[lastNode] = (dropOffCounts[lastNode] || 0) + 1;
      }
    });

    flow.metadata.dropOffPoints = Object.entries(dropOffCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nodeId]) => nodeId);
  }

  getConversationFlow(flowId: string = 'default-ivr-flow'): ConversationFlow | null {
    return this.flows.get(flowId) || null;
  }

  getFlowVisualization(flowId: string = 'default-ivr-flow'): any {
    const flow = this.flows.get(flowId);
    if (!flow) return null;

    return {
      nodes: Array.from(flow.nodes.values()).map(node => ({
        id: node.id,
        type: node.type,
        label: node.label,
        position: node.metadata.position,
        data: {
          visitCount: node.metadata.visitCount,
          averageTime: node.metadata.averageTime,
          successRate: node.metadata.successRate,
          dropOffRate: node.metadata.dropOffRate,
          intent: node.intent,
          response: node.response
        }
      })),
      edges: Array.from(flow.edges.values()).map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: {
          probability: edge.probability,
          traversals: edge.traversals,
          condition: edge.condition
        }
      }))
    };
  }

  getConversationAnalytics(): any {
    const flow = this.flows.get('default-ivr-flow');
    if (!flow) return null;

    return {
      totalConversations: flow.metadata.totalConversations,
      averageDuration: flow.metadata.averageDuration,
      successRate: flow.metadata.successRate,
      dropOffPoints: flow.metadata.dropOffPoints.map(nodeId => {
        const node = flow.nodes.get(nodeId);
        return {
          nodeId,
          label: node?.label,
          dropOffCount: this.getDropOffCount(nodeId)
        };
      }),
      popularPaths: flow.metadata.popularPaths.map(path => ({
        path,
        count: this.getPathCount(path),
        description: this.getPathDescription(path)
      })),
      nodeAnalytics: Array.from(flow.nodes.values()).map(node => ({
        id: node.id,
        label: node.label,
        type: node.type,
        visitCount: node.metadata.visitCount,
        averageTime: node.metadata.averageTime,
        successRate: node.metadata.successRate,
        dropOffRate: node.metadata.dropOffRate
      })),
      edgeAnalytics: Array.from(flow.edges.values()).map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        traversals: edge.traversals,
        probability: edge.probability,
        actualProbability: edge.traversals / flow.metadata.totalConversations
      }))
    };
  }

  private getDropOffCount(nodeId: string): number {
    return this.conversationPaths.filter(path => 
      !path.success && path.nodes.includes(nodeId) && 
      path.nodes[path.nodes.length - 1] === nodeId
    ).length;
  }

  private getPathCount(path: string[]): number {
    const pathKey = path.join('->');
    return this.conversationPaths.filter(p => p.nodes.join('->') === pathKey).length;
  }

  private getPathDescription(path: string[]): string {
    const flow = this.flows.get('default-ivr-flow');
    if (!flow) return '';

    return path.map(nodeId => {
      const node = flow.nodes.get(nodeId);
      return node?.label || nodeId;
    }).join(' → ');
  }

  async addNode(flowId: string, nodeData: Partial<ConversationNode>): Promise<string> {
    const flow = this.flows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const nodeId = `node_${++this.nodeCounter}`;
    const node: ConversationNode = {
      id: nodeId,
      type: nodeData.type || 'action',
      label: nodeData.label || 'New Node',
      intent: nodeData.intent,
      entities: nodeData.entities,
      response: nodeData.response,
      nextNodes: nodeData.nextNodes || [],
      metadata: {
        position: nodeData.metadata?.position || { x: 100, y: 100 },
        visitCount: 0,
        averageTime: 0,
        successRate: 1.0,
        dropOffRate: 0
      }
    };

    flow.nodes.set(nodeId, node);
    return nodeId;
  }

  async addEdge(flowId: string, edgeData: Partial<ConversationEdge>): Promise<string> {
    const flow = this.flows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const edgeId = `edge_${++this.edgeCounter}`;
    const edge: ConversationEdge = {
      id: edgeId,
      source: edgeData.source || '',
      target: edgeData.target || '',
      condition: edgeData.condition,
      probability: edgeData.probability || 0.5,
      traversals: 0
    };

    flow.edges.set(edgeId, edge);
    return edgeId;
  }

  async updateNode(flowId: string, nodeId: string, updates: Partial<ConversationNode>): Promise<void> {
    const flow = this.flows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const node = flow.nodes.get(nodeId);
    if (!node) throw new Error('Node not found');

    Object.assign(node, updates);
  }

  async deleteNode(flowId: string, nodeId: string): Promise<void> {
    const flow = this.flows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    flow.nodes.delete(nodeId);
    
    // Remove connected edges
    const connectedEdges = Array.from(flow.edges.values())
      .filter(edge => edge.source === nodeId || edge.target === nodeId);
    
    connectedEdges.forEach(edge => {
      flow.edges.delete(edge.id);
    });
  }

  async optimizeFlow(flowId: string): Promise<any> {
    const flow = this.flows.get(flowId);
    if (!flow) throw new Error('Flow not found');

    const analytics = this.getConversationAnalytics();
    const optimizations: any[] = [];

    // Find high drop-off nodes
    const highDropOffNodes = analytics.nodeAnalytics
      .filter(node => node.dropOffRate > 0.3)
      .sort((a, b) => b.dropOffRate - a.dropOffRate);

    highDropOffNodes.forEach(node => {
      optimizations.push({
        type: 'high_drop_off',
        nodeId: node.id,
        label: node.label,
        dropOffRate: node.dropOffRate,
        suggestion: `Consider simplifying the ${node.label} step or adding more guidance`
      });
    });

    // Find low success rate edges
    const lowSuccessEdges = analytics.edgeAnalytics
      .filter(edge => edge.actualProbability < edge.probability * 0.5)
      .sort((a, b) => (a.probability - a.actualProbability) - (b.probability - b.actualProbability));

    lowSuccessEdges.forEach(edge => {
      optimizations.push({
        type: 'low_success_edge',
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        expectedProbability: edge.probability,
        actualProbability: edge.actualProbability,
        suggestion: `Review the transition from ${edge.source} to ${edge.target}`
      });
    });

    // Find bottlenecks (high average time nodes)
    const bottlenecks = analytics.nodeAnalytics
      .filter(node => node.averageTime > 30)
      .sort((a, b) => b.averageTime - a.averageTime);

    bottlenecks.forEach(node => {
      optimizations.push({
        type: 'bottleneck',
        nodeId: node.id,
        label: node.label,
        averageTime: node.averageTime,
        suggestion: `Consider optimizing the ${node.label} process to reduce time`
      });
    });

    return {
      optimizations,
      summary: {
        totalOptimizations: optimizations.length,
        highDropOffNodes: highDropOffNodes.length,
        lowSuccessEdges: lowSuccessEdges.length,
        bottlenecks: bottlenecks.length
      }
    };
  }
}