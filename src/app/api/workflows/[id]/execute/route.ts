import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const workflow = await db.workflow.findUnique({
      where: { id },
      include: {
        nodes: {
          include: {
            sourceConnections: true,
            targetConnections: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    if (!workflow.isActive) {
      return NextResponse.json({ error: 'Workflow is not active' }, { status: 400 });
    }

    const body = await request.json();
    const { input, context } = body;

    // Execute workflow
    const result = await executeWorkflow(workflow, input || {}, context || {});

    // Log execution
    await db.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        input: JSON.stringify(input || {}),
        output: JSON.stringify(result),
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      result,
      executionId: result.executionId,
    });
  } catch (error: any) {
    console.error('Error executing workflow:', error);

    // Log failed execution
    try {
      await db.workflowExecution.create({
        data: {
          workflowId: id,
          input: JSON.stringify(await request.json()),
          output: JSON.stringify({ error: error.message }),
          status: 'FAILED',
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });
    } catch (logError) {
      console.error('Error logging failed execution:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to execute workflow', details: error.message },
      { status: 500 }
    );
  }
}

async function executeWorkflow(workflow: any, input: any, context: any) {
  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const executionContext = {
    ...context,
    executionId,
    workflowId: workflow.id,
    startTime: new Date().toISOString(),
  };

  // Find start node
  const startNode = workflow.nodes.find(node => node.type === 'trigger');
  if (!startNode) {
    throw new Error('No trigger node found in workflow');
  }

  // Build node graph
  const nodeMap = new Map();
  workflow.nodes.forEach(node => {
    nodeMap.set(node.id, {
      ...node,
      config: typeof node.config === 'string' ? JSON.parse(node.config) : node.config,
    });
  });

  // Execute nodes in order
  const visitedNodes = new Set<string>();
  const results = {};

  await executeNode(startNode, input, executionContext, nodeMap, visitedNodes, results);

  return {
    executionId,
    results,
    completedAt: new Date().toISOString(),
  };
}

async function executeNode(
  node: any,
  inputData: any,
  context: any,
  nodeMap: Map<string, any>,
  visitedNodes: Set<string>,
  results: any
) {
  if (visitedNodes.has(node.id)) {
    return; // Avoid infinite loops
  }

  visitedNodes.add(node.id);

  try {
    let nodeResult;

    switch (node.type) {
      case 'trigger':
        nodeResult = { triggered: true, data: inputData };
        break;

      case 'stt':
        nodeResult = await executeSTTNode(node, inputData, context);
        break;

      case 'nlu':
        nodeResult = await executeNLUNode(node, inputData, context);
        break;

      case 'tts':
        nodeResult = await executeTTSNode(node, inputData, context);
        break;

      case 'agent':
        nodeResult = await executeAgentNode(node, inputData, context);
        break;

      case 'condition':
        nodeResult = await executeConditionNode(node, inputData, context);
        break;

      case 'data':
        nodeResult = await executeDataNode(node, inputData, context);
        break;

      case 'api':
        nodeResult = await executeAPINode(node, inputData, context);
        break;

      case 'end':
        nodeResult = { completed: true, finalData: inputData };
        break;

      default:
        nodeResult = { processed: true, data: inputData };
    }

    results[node.id] = nodeResult;

    // Find connected nodes and execute them
    const connectedNodes = node.sourceConnections.map(conn => nodeMap.get(conn.targetNodeId));
    for (const nextNode of connectedNodes) {
      if (nextNode) {
        await executeNode(nextNode, nodeResult, context, nodeMap, visitedNodes, results);
      }
    }

  } catch (error: any) {
    console.error(`Error executing node ${node.id}:`, error);
    results[node.id] = { error: error.message };
  }
}

async function executeSTTNode(node: any, inputData: any, context: any) {
  const config = node.config;
  // Simulate STT processing
  return {
    transcription: "Customer said: " + (inputData.text || "Hello, I need help"),
    confidence: 0.95,
    language: config.language || "en-US",
  };
}

async function executeNLUNode(node: any, inputData: any, context: any) {
  const config = node.config;
  // Simulate NLU processing
  return {
    intent: "customer_support",
    entities: [{ type: "category", value: "billing" }],
    sentiment: "neutral",
    confidence: 0.87,
  };
}

async function executeTTSNode(node: any, inputData: any, context: any) {
  const config = node.config;
  const text = inputData.text || "Thank you for calling. How can I help you today?";

  // Simulate TTS processing
  return {
    audioUrl: `https://example.com/audio/${Date.now()}.mp3`,
    text,
    voice: config.voice || "default",
    duration: text.length * 0.1, // Estimate duration
  };
}

async function executeAgentNode(node: any, inputData: any, context: any) {
  const config = node.config;
  const agentType = config.agentType || "customer_service";

  try {
    const zai = await ZAI.create();

    const systemPrompt = `You are an AI ${agentType} agent. Handle the customer request professionally and helpfully.`;
    const userPrompt = inputData.text || "Customer needs assistance";

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || "I'm here to help you.";

    return {
      response,
      agentType,
      confidence: 0.92,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      response: "I'm sorry, I'm having trouble processing your request right now.",
      agentType,
      error: error.message,
    };
  }
}

async function executeConditionNode(node: any, inputData: any, context: any) {
  const config = node.config;
  const condition = config.condition || "true";

  // Simple condition evaluation (in production, use a proper expression evaluator)
  let result = false;
  try {
    // This is a simplified evaluation
    result = eval(condition.replace(/\b(\w+)\b/g, 'inputData.$1'));
  } catch (error) {
    console.error('Condition evaluation error:', error);
    result = false;
  }

  return {
    condition,
    result,
    branch: result ? "true" : "false",
  };
}

async function executeDataNode(node: any, inputData: any, context: any) {
  const config = node.config;
  const operation = config.operation || "transform";

  switch (operation) {
    case "transform":
      return {
        transformedData: JSON.stringify(inputData, null, 2),
        originalData: inputData,
      };
    case "validate":
      return {
        isValid: true,
        validationErrors: [],
        data: inputData,
      };
    case "enrich":
      return {
        ...inputData,
        enriched: true,
        timestamp: new Date().toISOString(),
      };
    default:
      return { data: inputData };
  }
}

async function executeAPINode(node: any, inputData: any, context: any) {
  const config = node.config;
  const url = config.url;
  const method = config.method || "GET";

  // Simulate API call
  return {
    url,
    method,
    status: 200,
    response: { success: true, data: inputData },
    timestamp: new Date().toISOString(),
  };
}