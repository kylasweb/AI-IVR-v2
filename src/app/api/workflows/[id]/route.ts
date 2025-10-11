import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflow = await db.workflow.findUnique({
      where: { id: params.id },
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

    // Parse config back to objects for response
    const responseWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => ({
        ...node,
        config: JSON.parse(node.config),
      })),
    };

    return NextResponse.json(responseWorkflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, category, isActive } = body;

    const workflow = await db.workflow.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json(responseWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.workflow.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
}