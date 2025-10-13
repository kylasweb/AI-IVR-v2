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
    const workflow1 = await prisma.workflow.create({
        data: {
            name: 'Customer Support Malayalam',
            description: 'Malayalam customer support workflow with cultural intelligence',
            category: 'CUSTOMER_SUPPORT',
            isActive: true,
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
            category: 'HEALTHCARE',
            isActive: true,
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

    // Create sample driver
    const driver1 = await prisma.driver.create({
        data: {
            userId: user1.id,
            name: 'Rajesh Kumar',
            phone: '+919876543210',
            vehicleType: 'auto',
            vehicleNo: 'KL-07-AB-1234',
            licenseNo: 'KL1234567890',
            currentLat: 9.9312,
            currentLng: 76.2673,
            rating: 4.8,
            totalRides: 156
        }
    });

    // Create sample rider
    const rider1 = await prisma.rider.create({
        data: {
            userId: user1.id,
            name: 'Priya Nair',
            phone: '+919876543211',
            rating: 4.9,
            totalRides: 89
        }
    });

    // Create sample ride
    const ride1 = await prisma.ride.create({
        data: {
            riderId: rider1.id,
            driverId: driver1.id,
            pickupLocation: 'Kakkanad, Kochi',
            dropoffLocation: 'Marine Drive, Ernakulam',
            pickupLat: 10.0261,
            pickupLng: 76.3417,
            dropoffLat: 9.9736,
            dropoffLng: 76.2797,
            fare: 180.50,
            status: 'completed',
            distance: 12.5,
            duration: 25
        }
    });

    console.log('✅ Database seeded successfully!');
    console.log(`Created workflows: ${workflow1.name}, ${workflow2.name}`);
    console.log(`Created user: ${user1.name}`);
    console.log(`Created driver: ${driver1.name}`);
    console.log(`Created rider: ${rider1.name}`);
    console.log(`Created ride: ${ride1.id}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });