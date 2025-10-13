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

    // Create basic workflows
    const workflow1 = await prisma.workflow.upsert({
        where: { id: 'workflow-1' },
        update: {},
        create: {
            id: 'workflow-1',
            name: 'Customer Support Malayalam',
            description: 'Malayalam customer support workflow with cultural intelligence',
            category: 'CUSTOMER_SUPPORT',
            isActive: true
        }
    });

    const workflow2 = await prisma.workflow.upsert({
        where: { id: 'workflow-2' },
        update: {},
        create: {
            id: 'workflow-2',
            name: 'Healthcare Appointment',
            description: 'Healthcare appointment booking system',
            category: 'HEALTHCARE',
            isActive: true
        }
    });

    // Create workflow nodes
    await prisma.workflowNode.upsert({
        where: { id: 'node-1' },
        update: {},
        create: {
            id: 'node-1',
            workflowId: workflow1.id,
            type: 'start',
            label: 'Start Call',
            description: 'Malayalam greeting start node',
            config: JSON.stringify({
                greeting: 'നമസ്കാരം, സ്വാഗതം!',
                language: 'malayalam'
            }),
            position: 0
        }
    });

    await prisma.workflowNode.upsert({
        where: { id: 'node-2' },
        update: {},
        create: {
            id: 'node-2',
            workflowId: workflow1.id,
            type: 'gather',
            label: 'Language Selection',
            description: 'Language selection node',
            config: JSON.stringify({
                prompt: 'Press 1 for Malayalam, Press 2 for English',
                timeout: 5000
            }),
            position: 1
        }
    });

    // Create sample driver
    const driver1 = await prisma.driver.upsert({
        where: { id: 'driver-1' },
        update: {},
        create: {
            id: 'driver-1',
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
    const rider1 = await prisma.rider.upsert({
        where: { id: 'rider-1' },
        update: {},
        create: {
            id: 'rider-1',
            userId: user1.id,
            name: 'Priya Nair',
            phone: '+919876543211',
            rating: 4.9,
            totalRides: 89
        }
    });

    // Create sample ride
    await prisma.ride.upsert({
        where: { id: 'ride-1' },
        update: {},
        create: {
            id: 'ride-1',
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
    console.log(`✅ Created workflows: ${workflow1.name}, ${workflow2.name}`);
    console.log(`✅ Created user: ${user1.name}`);
    console.log(`✅ Created driver: ${driver1.name}`);
    console.log(`✅ Created rider: ${rider1.name}`);
    console.log('🚀 Database is ready for verification testing!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });