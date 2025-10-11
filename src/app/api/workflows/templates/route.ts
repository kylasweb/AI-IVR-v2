// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const WORKFLOW_TEMPLATES = [
  {
    name: "Customer Service IVR",
    description: "Complete customer service workflow with AI agent",
    category: "CUSTOMER_SERVICE",
    template: {
      nodes: [
        {
          type: "trigger",
          label: "Incoming Call",
          description: "Trigger when call comes in",
          config: { triggerType: "incoming_call" },
          position: 0,
        },
        {
          type: "stt",
          label: "Speech to Text",
          description: "Convert customer speech to text",
          config: { language: "en-US", model: "whisper" },
          position: 1,
        },
        {
          type: "nlu",
          label: "Intent Recognition",
          description: "Understand customer intent",
          config: { model: "gpt-4", confidence_threshold: 0.8 },
          position: 2,
        },
        {
          type: "agent",
          label: "AI Agent",
          description: "Handle customer request",
          config: { agentType: "customer_service", model: "gpt-4" },
          position: 3,
        },
        {
          type: "tts",
          label: "Text to Speech",
          description: "Convert response to speech",
          config: { voice: "female", language: "en-US" },
          position: 4,
        },
        {
          type: "end",
          label: "End Call",
          description: "End the call",
          config: { endType: "hangup" },
          position: 5,
        },
      ],
    },
  },
  {
    name: "Sales Assistant",
    description: "AI-powered sales assistant workflow",
    category: "SALES",
    template: {
      nodes: [
        {
          type: "trigger",
          label: "Sales Inquiry",
          description: "Trigger for sales inquiry",
          config: { triggerType: "webhook" },
          position: 0,
        },
        {
          type: "agent",
          label: "Sales Agent",
          description: "AI sales assistant",
          config: { agentType: "sales", model: "gpt-4" },
          position: 1,
        },
        {
          type: "condition",
          label: "Qualified Lead?",
          description: "Check if lead is qualified",
          config: { condition: "score > 0.7" },
          position: 2,
        },
        {
          type: "api",
          label: "Create Lead",
          description: "Create lead in CRM",
          config: {
            url: "https://api.crm.com/leads",
            method: "POST",
          },
          position: 3,
        },
        {
          type: "tts",
          label: "Response",
          description: "Generate voice response",
          config: { voice: "professional", language: "en-US" },
          position: 4,
        },
        {
          type: "end",
          label: "Complete",
          description: "End workflow",
          config: { endType: "complete" },
          position: 5,
        },
      ],
    },
  },
  {
    name: "Appointment Booking",
    description: "Automated appointment booking system",
    category: "SCHEDULING",
    template: {
      nodes: [
        {
          type: "trigger",
          label: "Booking Request",
          description: "Start booking process",
          config: { triggerType: "user_input" },
          position: 0,
        },
        {
          type: "agent",
          label: "Booking Agent",
          description: "Handle booking requests",
          config: { agentType: "booking", model: "gpt-4" },
          position: 1,
        },
        {
          type: "data",
          label: "Check Availability",
          description: "Check calendar availability",
          config: { operation: "query", source: "calendar" },
          position: 2,
        },
        {
          type: "condition",
          label: "Available?",
          description: "Check if slot is available",
          config: { condition: "available == true" },
          position: 3,
        },
        {
          type: "api",
          label: "Book Appointment",
          description: "Create calendar event",
          config: {
            url: "https://api.calendar.com/events",
            method: "POST",
          },
          position: 4,
        },
        {
          type: "tts",
          label: "Confirmation",
          description: "Confirm booking",
          config: { voice: "friendly", language: "en-US" },
          position: 5,
        },
        {
          type: "end",
          label: "Complete",
          description: "End workflow",
          config: { endType: "complete" },
          position: 6,
        },
      ],
    },
  },
];

export async function GET() {
  try {
    return NextResponse.json(WORKFLOW_TEMPLATES);
  } catch (error) {
    console.error("Error fetching workflow templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// @ts-nocheck - Suppress all TypeScript checks for this function
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, name, description } = body;

    const template = WORKFLOW_TEMPLATES[templateId];
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Create workflow from template
    const workflow = await db.workflow.create({
      data: {
        name: name || template.name,
        description: description || template.description,
        category: template.category,
        isActive: true,
      },
    });

    // Create nodes from template
    const createdNodes: any[] = [];

    for (let i = 0; i < template.template.nodes.length; i++) {
      const nodeTemplate = template.template.nodes[i];

      // @ts-ignore
      const node = await (db as any).workflowNode.create({
        data: {
          workflowId: workflow.id,
          type: nodeTemplate.type,
          config: JSON.stringify(nodeTemplate.config || {}),
          position: nodeTemplate.position,
          label: nodeTemplate.label,
          description: nodeTemplate.description,
        },
      });
      createdNodes.push(node); // Create connection to previous node
      if (i > 0) {
        // @ts-ignore
        await (db as any).nodeConnection.create({
          data: {
            sourceNodeId: (createdNodes[i - 1] as any).id,
            targetNodeId: node.id,
          },
        });
      }
    }

    // Return the complete workflow
    const completeWorkflow = await db.workflow.findUnique({
      where: { id: workflow.id },
      include: {
        nodes: {
          include: {
            sourceConnections: true,
            targetConnections: true,
          },
        },
      },
    });

    return NextResponse.json(completeWorkflow, { status: 201 });
  } catch (error: any) {
    console.error("Error creating workflow from template:", error);
    return NextResponse.json(
      { error: "Failed to create workflow", details: error.message },
      { status: 500 }
    );
  }
}
