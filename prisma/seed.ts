import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create default system health records
    const systemHealth = await prisma.systemHealth.upsert({
        where: { component: 'database' },
        update: {},
        create: {
            component: 'database',
            status: 'healthy',
            responseTime: 10,
            uptime: 0,
        },
    });

    // Create default IVR workflow templates
    const defaultWorkflow = await prisma.iVRWorkflow.upsert({
        where: { id: 'default-fairgo-workflow' },
        update: {},
        create: {
            id: 'default-fairgo-workflow',
            name: 'FairGo Default Workflow',
            description: 'Default IVR workflow for FairGo ride booking',
            isActive: true,
            isMalayalam: true,
            version: '1.0.0',
            workflowData: {
                nodes: [
                    {
                        id: 'start',
                        type: 'start',
                        data: { label: 'Start Call' },
                        position: { x: 0, y: 0 }
                    },
                    {
                        id: 'greeting',
                        type: 'speech',
                        data: {
                            text: 'Welcome to FairGo! Malayalam AI-powered ride booking service.',
                            malayalamText: 'ഫെയർഗോയിലേക്ക് സ്വാഗതം! മലയാളം AI സഹായിത റൈഡ് ബുക്കിംഗ് സേവനം.'
                        },
                        position: { x: 0, y: 100 }
                    }
                ],
                edges: [
                    { id: 'e1', source: 'start', target: 'greeting' }
                ]
            }
        },
    });

    // Create default cultural contexts
    const keralaCulture = await prisma.culturalContext.upsert({
        where: { id: 'kerala-culture' },
        update: {},
        create: {
            id: 'kerala-culture',
            name: 'Kerala Culture',
            language: 'ml',
            region: 'Kerala',
            culturalNorms: {
                greetings: ['Namaste', 'Adaab', 'Vanakkam'],
                courtesyLevel: 'high',
                formalityLevel: 'medium',
                timeOrientation: 'flexible',
                communicationStyle: 'indirect',
                familyImportance: 'high'
            },
            customPhrases: {
                greeting: 'നമസ്കാരം',
                goodbye: 'വിടവാങ്ങൽ',
                thankyou: 'നന്ദി',
                sorry: 'ക്ഷമിക്കണം'
            },
            isActive: true
        },
    });

    console.log('✅ Seed completed successfully!');
    console.log(`Created system health record: ${systemHealth.component}`);
    console.log(`Created default workflow: ${defaultWorkflow.name}`);
    console.log(`Created cultural context: ${keralaCulture.name}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });