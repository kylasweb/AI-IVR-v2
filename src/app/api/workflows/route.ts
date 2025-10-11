import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const workflows = await db.workflow.findMany({
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Parse config back to objects for response
    const responseWorkflows = workflows.map(workflow => ({
      ...workflow,
      nodes: workflow.nodes.map(node => ({
        ...node,
        config: JSON.parse(node.config),
      })),
    }));

    return NextResponse.json(responseWorkflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
    }

    const workflow = await db.workflow.create({
      data: {
        name,
        description,
        category: category || 'CUSTOM',
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        nodes: {
          include: {
            sourceConnections: true,
            targetConnections: true,
          },
        },
      },
    });

    // Parse config back to objects for response
    const responseWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => ({
        ...node,
        config: JSON.parse(node.config),
      })),
    };

    return NextResponse.json(responseWorkflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}