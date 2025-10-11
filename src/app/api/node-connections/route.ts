import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sourceNodeId, 
      targetNodeId, 
      sourceHandle, 
      targetHandle,
      condition 
    } = body;

    if (!sourceNodeId || !targetNodeId) {
      return NextResponse.json({ 
        error: 'Source node ID and target node ID are required' 
      }, { status: 400 });
    }

    const connection = await db.nodeConnection.create({
      data: {
        sourceNodeId,
        targetNodeId,
        sourceHandle: sourceHandle || 'source',
        targetHandle: targetHandle || 'target',
        condition,
      },
    });

    return NextResponse.json(connection, { status: 201 });
  } catch (error) {
    console.error('Error creating node connection:', error);
    return NextResponse.json({ error: 'Failed to create node connection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceNodeId = searchParams.get('sourceNodeId');
    const targetNodeId = searchParams.get('targetNodeId');

    if (!sourceNodeId || !targetNodeId) {
      return NextResponse.json({ 
        error: 'Source node ID and target node ID are required' 
      }, { status: 400 });
    }

    await db.nodeConnection.deleteMany({
      where: {
        sourceNodeId,
        targetNodeId,
      },
    });

    return NextResponse.json({ message: 'Node connection deleted successfully' });
  } catch (error) {
    console.error('Error deleting node connection:', error);
    return NextResponse.json({ error: 'Failed to delete node connection' }, { status: 500 });
  }
}