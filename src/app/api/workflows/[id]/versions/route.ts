import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await db.workflowVersion.findMany({
      where: { workflowId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(versions);
  } catch (error: any) {
    console.error('Error fetching workflow versions:', error);
    return NextResponse.json({ error: 'Failed to fetch versions', details: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { changeDescription } = body;

    // Get current workflow
    const workflow = await db.workflow.findUnique({
      where: { id: params.id },
      include: {
        nodes: {
          include: {
            sourceConnections: true,
            targetConnections: true,
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Get latest version number
    const latestVersion = await db.workflowVersion.findFirst({
      where: { workflowId: params.id },
      orderBy: { version: 'desc' },
    });

    // Create version snapshot
    const version = await db.workflowVersion.create({
      data: {
        workflowId: params.id,
        version: (latestVersion?.version || 0) + 1,
        changeDescription: changeDescription || 'Manual save',
        workflowData: JSON.stringify({
          name: workflow.name,
          description: workflow.description,
          category: workflow.category,
          isActive: workflow.isActive,
          nodes: workflow.nodes.map(node => ({
            ...node,
            config: JSON.parse(node.config),
          })),
        }),
        createdBy: 'system', // TODO: Get from auth
      },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (error: any) {
    console.error('Error creating workflow version:', error);
    return NextResponse.json({ error: 'Failed to create version', details: error.message }, { status: 500 });
  }
}