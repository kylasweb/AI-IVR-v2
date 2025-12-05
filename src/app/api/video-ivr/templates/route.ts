import { NextRequest, NextResponse } from 'next/server'

// Video IVR Workflow Templates
const VIDEO_WORKFLOW_TEMPLATES = [
    {
        id: 'customer-support',
        name: 'Customer Support Video IVR',
        description: 'Comprehensive video-based customer support with AI assistance and screen sharing',
        category: 'support',
        icon: 'headphones',
        status: 'active',
        triggers: ['support', 'help', 'assistance', 'customer-service'],
        steps: [
            {
                id: 'step-1',
                type: 'greeting',
                title: 'Welcome Message',
                content: 'Welcome to our Video Support Center! How can we assist you today?',
                aiEnabled: true,
                nextStep: 'step-2'
            },
            {
                id: 'step-2',
                type: 'menu',
                title: 'Support Options',
                content: 'Please select from the following options:',
                options: ['Technical Support', 'Billing Inquiry', 'Account Management', 'General Information'],
                aiEnabled: true,
                nextStep: 'step-3'
            },
            {
                id: 'step-3',
                type: 'ai_response',
                title: 'AI-Powered Assistance',
                content: 'Our AI assistant will help you with your query.',
                aiEnabled: true,
                nextStep: 'step-4'
            },
            {
                id: 'step-4',
                type: 'transfer',
                title: 'Agent Transfer',
                content: 'Connecting you to a live agent if needed.',
                aiEnabled: true,
                nextStep: 'step-5'
            },
            {
                id: 'step-5',
                type: 'end',
                title: 'Session End',
                content: 'Thank you for contacting us. Have a great day!',
                aiEnabled: false
            }
        ],
        features: ['Screen Sharing', 'AI Assistance', 'Recording', 'File Transfer', 'Live Chat'],
        analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
    },
    {
        id: 'product-demo',
        name: 'Product Demo Video Flow',
        description: 'Interactive product demonstration with real-time guidance and screen sharing',
        category: 'sales',
        icon: 'presentation',
        status: 'active',
        triggers: ['demo', 'product', 'showcase', 'tour'],
        steps: [
            {
                id: 'step-1',
                type: 'greeting',
                title: 'Demo Introduction',
                content: 'Welcome to our interactive product demo! I\'ll guide you through our features.',
                aiEnabled: true,
                nextStep: 'step-2'
            },
            {
                id: 'step-2',
                type: 'menu',
                title: 'Feature Selection',
                content: 'Which product area would you like to explore?',
                options: ['Dashboard Overview', 'Core Features', 'Integrations', 'Pricing'],
                aiEnabled: true,
                nextStep: 'step-3'
            },
            {
                id: 'step-3',
                type: 'ai_response',
                title: 'Feature Walkthrough',
                content: 'Our AI will demonstrate the selected feature.',
                aiEnabled: true,
                nextStep: 'step-4'
            },
            {
                id: 'step-4',
                type: 'form',
                title: 'Follow-up Details',
                content: 'Would you like to schedule a personalized demo?',
                fields: ['name', 'email', 'company', 'preferredDate'],
                aiEnabled: true,
                nextStep: 'step-5'
            },
            {
                id: 'step-5',
                type: 'end',
                title: 'Thank You',
                content: 'Thank you for your interest! We\'ll be in touch shortly.',
                aiEnabled: false
            }
        ],
        features: ['Screen Sharing', 'Interactive Demo', 'Recording', 'Lead Capture'],
        analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
    },
    {
        id: 'onboarding',
        name: 'Customer Onboarding',
        description: 'Step-by-step video onboarding for new customers',
        category: 'onboarding',
        icon: 'user-plus',
        status: 'active',
        triggers: ['onboarding', 'new-customer', 'setup', 'start'],
        steps: [
            {
                id: 'step-1',
                type: 'greeting',
                title: 'Welcome New Customer',
                content: 'Welcome aboard! Let\'s get you set up with everything you need.',
                aiEnabled: true,
                nextStep: 'step-2'
            },
            {
                id: 'step-2',
                type: 'form',
                title: 'Account Setup',
                content: 'Please provide your account details.',
                fields: ['businessName', 'contactPerson', 'email', 'phone'],
                aiEnabled: true,
                nextStep: 'step-3'
            },
            {
                id: 'step-3',
                type: 'ai_response',
                title: 'Platform Tour',
                content: 'Let me show you around the platform.',
                aiEnabled: true,
                nextStep: 'step-4'
            },
            {
                id: 'step-4',
                type: 'menu',
                title: 'Training Options',
                content: 'Would you like additional training?',
                options: ['Self-guided tutorials', 'Live training session', 'Documentation only'],
                aiEnabled: true,
                nextStep: 'step-5'
            },
            {
                id: 'step-5',
                type: 'end',
                title: 'Setup Complete',
                content: 'You\'re all set! Your dedicated support agent will reach out within 24 hours.',
                aiEnabled: false
            }
        ],
        features: ['Screen Sharing', 'Document Review', 'Recording', 'Scheduling'],
        analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
    },
    {
        id: 'video-kyc',
        name: 'Video KYC Verification',
        description: 'Identity verification through video call with document verification',
        category: 'verification',
        icon: 'shield-check',
        status: 'active',
        triggers: ['kyc', 'verification', 'identity', 'id-check'],
        steps: [
            {
                id: 'step-1',
                type: 'greeting',
                title: 'KYC Introduction',
                content: 'Welcome to our Video KYC process. This will take about 5-10 minutes.',
                aiEnabled: true,
                nextStep: 'step-2'
            },
            {
                id: 'step-2',
                type: 'form',
                title: 'Personal Information',
                content: 'Please confirm your personal details.',
                fields: ['fullName', 'dateOfBirth', 'address', 'nationalId'],
                aiEnabled: true,
                nextStep: 'step-3'
            },
            {
                id: 'step-3',
                type: 'ai_response',
                title: 'Document Capture',
                content: 'Please hold your ID document in front of the camera.',
                aiEnabled: true,
                nextStep: 'step-4'
            },
            {
                id: 'step-4',
                type: 'ai_response',
                title: 'Face Verification',
                content: 'Let\'s verify your face matches your document.',
                aiEnabled: true,
                nextStep: 'step-5'
            },
            {
                id: 'step-5',
                type: 'end',
                title: 'Verification Complete',
                content: 'Your identity has been verified. You\'ll receive confirmation via email.',
                aiEnabled: false
            }
        ],
        features: ['Face Detection', 'Document OCR', 'Liveness Check', 'Recording', 'Compliance'],
        analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
    },
    {
        id: 'telemedicine',
        name: 'Telemedicine Consultation',
        description: 'Video consultation workflow for healthcare providers',
        category: 'healthcare',
        icon: 'heart-pulse',
        status: 'active',
        triggers: ['medical', 'consultation', 'doctor', 'health'],
        steps: [
            {
                id: 'step-1',
                type: 'greeting',
                title: 'Welcome',
                content: 'Welcome to your telemedicine consultation.',
                aiEnabled: true,
                nextStep: 'step-2'
            },
            {
                id: 'step-2',
                type: 'form',
                title: 'Patient Information',
                content: 'Please confirm your details and reason for visit.',
                fields: ['patientId', 'symptoms', 'medications', 'allergies'],
                aiEnabled: true,
                nextStep: 'step-3'
            },
            {
                id: 'step-3',
                type: 'ai_response',
                title: 'Initial Screening',
                content: 'Our AI will collect preliminary information.',
                aiEnabled: true,
                nextStep: 'step-4'
            },
            {
                id: 'step-4',
                type: 'transfer',
                title: 'Doctor Connection',
                content: 'Connecting you to your healthcare provider.',
                aiEnabled: false,
                nextStep: 'step-5'
            },
            {
                id: 'step-5',
                type: 'end',
                title: 'Session Complete',
                content: 'Thank you. Your prescription will be sent to your pharmacy.',
                aiEnabled: false
            }
        ],
        features: ['Secure Video', 'Recording (with consent)', 'Prescription', 'Document Sharing', 'HIPAA Compliant'],
        analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
    },
    {
        id: 'interview',
        name: 'Video Interview',
        description: 'Automated video interview workflow for recruitment',
        category: 'hr',
        icon: 'users',
        status: 'active',
        triggers: ['interview', 'recruitment', 'hiring', 'job'],
        steps: [
            {
                id: 'step-1',
                type: 'greeting',
                title: 'Interview Welcome',
                content: 'Welcome to your video interview. Please ensure good lighting and a quiet environment.',
                aiEnabled: true,
                nextStep: 'step-2'
            },
            {
                id: 'step-2',
                type: 'form',
                title: 'Candidate Verification',
                content: 'Please confirm your details.',
                fields: ['fullName', 'email', 'position', 'experience'],
                aiEnabled: true,
                nextStep: 'step-3'
            },
            {
                id: 'step-3',
                type: 'ai_response',
                title: 'Interview Questions',
                content: 'The AI will present interview questions.',
                aiEnabled: true,
                nextStep: 'step-4'
            },
            {
                id: 'step-4',
                type: 'menu',
                title: 'Next Steps',
                content: 'Would you like to proceed with a live interview?',
                options: ['Schedule live interview', 'Submit additional documents', 'Complete later'],
                aiEnabled: true,
                nextStep: 'step-5'
            },
            {
                id: 'step-5',
                type: 'end',
                title: 'Interview Complete',
                content: 'Thank you for completing your interview. We will contact you soon.',
                aiEnabled: false
            }
        ],
        features: ['Recording', 'AI Analysis', 'Sentiment Detection', 'Scheduling', 'ATS Integration'],
        analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
    }
];

// GET - List all workflow templates
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let templates = VIDEO_WORKFLOW_TEMPLATES;

        if (category) {
            templates = templates.filter(t => t.category === category);
        }

        return NextResponse.json({
            success: true,
            data: {
                templates,
                categories: ['support', 'sales', 'onboarding', 'verification', 'healthcare', 'hr'],
                total: templates.length
            }
        });
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch templates'
        }, { status: 500 });
    }
}

// POST - Create workflow from template
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { templateId, customizations } = body;

        const template = VIDEO_WORKFLOW_TEMPLATES.find(t => t.id === templateId);

        if (!template) {
            return NextResponse.json({
                success: false,
                error: 'Template not found'
            }, { status: 404 });
        }

        // Create new workflow based on template
        const newWorkflow = {
            ...template,
            id: `wf-${Date.now()}`,
            name: customizations?.name || `${template.name} (Copy)`,
            description: customizations?.description || template.description,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            analytics: { totalCalls: 0, avgDuration: 0, completionRate: 0, satisfactionScore: 0 }
        };

        return NextResponse.json({
            success: true,
            data: newWorkflow,
            message: 'Workflow created from template'
        });
    } catch (error) {
        console.error('Error creating from template:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create workflow from template'
        }, { status: 500 });
    }
}
