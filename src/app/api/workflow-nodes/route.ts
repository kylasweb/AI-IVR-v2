import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const nodes = await db.workflowNode.findMany({
      include: {
        sourceConnections: true,
        targetConnections: true,
      },
      orderBy: {
        position: 'asc',
      },
    });

    // Parse config back to objects for response
    const responseNodes = nodes.map(node => ({
      ...node,
      config: JSON.parse(node.config),
    }));

    return NextResponse.json(responseNodes);
  } catch (error) {
    console.error('Error fetching workflow nodes:', error);
    return NextResponse.json({ error: 'Failed to fetch workflow nodes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      workflowId, 
      type, 
      config, 
      position, 
      label,
      description 
    } = body;

    if (!workflowId || !type) {
      return NextResponse.json({ 
        error: 'Workflow ID and node type are required' 
      }, { status: 400 });
    }

    const node = await db.workflowNode.create({
      data: {
        workflowId,
        type,
        config: JSON.stringify(config || {}),
        position: position || 0,
        label: label || type,
        description,
      },
      include: {
        sourceConnections: true,
        targetConnections: true,
      },
    });

    // Parse config back to object for response
    const responseNode = {
      ...node,
      config: JSON.parse(node.config),
    };

    return NextResponse.json(responseNode, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow node:', error);
    return NextResponse.json({ error: 'Failed to create workflow node' }, { status: 500 });
  }
}