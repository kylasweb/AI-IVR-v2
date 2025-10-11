import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { config, position, label, description } = body;

    const node = await db.workflowNode.update({
      where: { id: params.id },
      data: {
        ...(config && { config: JSON.stringify(config) }),
        ...(position !== undefined && { position }),
        ...(label && { label }),
        ...(description !== undefined && { description }),
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

    return NextResponse.json(responseNode);
  } catch (error) {
    console.error('Error updating workflow node:', error);
    return NextResponse.json({ error: 'Failed to update workflow node' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete connections first
    await db.nodeConnection.deleteMany({
      where: {
        OR: [
          { sourceNodeId: params.id },
          { targetNodeId: params.id },
        ],
      },
    });

    // Delete the node
    await db.workflowNode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Workflow node deleted successfully' });
  } catch (error) {
    console.error('Error deleting workflow node:', error);
    return NextResponse.json({ error: 'Failed to delete workflow node' }, { status: 500 });
  }
}