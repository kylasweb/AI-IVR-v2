import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create sample users
    const user1 = await prisma.user.upsert({
        where: { email: 'test@kerala.gov.in' },
        update: {},
        create: {
            email: 'test@kerala.gov.in',
            name: 'Test User Kerala'
        }
    });

    // Create default workflows with nodes
    const workflow1 = await prisma.workflow.upsert({
        where: { name: 'Customer Support Malayalam' },
        update: {},
        create: {
            name: 'Customer Support Malayalam',
            description: 'Malayalam customer support workflow with cultural intelligence',
            isActive: true,
            category: 'CUSTOM',
            nodes: {
                create: [
                    {
                        nodeId: 'start-1',
                        type: 'start',
                        name: 'Start Call',
                        x: 100,
                        y: 100,
                        config: { greeting: 'നമസ്കാരം, സ്വാഗതം!' }
                    },
                    {
                        nodeId: 'gather-1',
                        type: 'gather',
                        name: 'Language Selection',
                        x: 300,
                        y: 100,
                        config: {
                            prompt: 'Press 1 for Malayalam, Press 2 for English',
                            timeout: 5000
                        }
                    },
                    {
                        nodeId: 'ai-1',
                        type: 'ai_processing',
                        name: 'Cultural AI Assistant',
                        x: 500,
                        y: 100,
                        config: {
                            model: 'gpt-4',
                            systemPrompt: 'You are a Malayalam AI assistant with cultural knowledge',
                            culturalContext: 'kerala'
                        }
                    }
                ]
            }
        }
    });

    const workflow2 = await prisma.workflow.create({
        data: {
            name: 'Healthcare Appointment',
            description: 'Healthcare appointment booking system',
            status: 'active',
            version: '1.2',
            nodes: {
                create: [
                    {
                        nodeId: 'start-2',
                        type: 'start',
                        name: 'Healthcare Start',
                        x: 100,
                        y: 100,
                        config: { greeting: 'Welcome to Kerala Health Services' }
                    },
                    {
                        nodeId: 'amd-1',
                        type: 'amd_detection',
                        name: 'AMD Check',
                        x: 300,
                        y: 100,
                        config: {
                            sensitivity: 0.8,
                            culturalPatterns: true,
                            malayalamSupport: true
                        }
                    }
                ]
            }
        }
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
        }
    });

    console.log('✅ Seed completed successfully!');
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