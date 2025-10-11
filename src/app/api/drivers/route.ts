import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get('available');
    const vehicleType = searchParams.get('vehicleType');
    
    const drivers = await db.driver.findMany({
      where: {
        ...(available && { isAvailable: available === 'true' }),
        ...(vehicleType && { vehicleType }),
      },
      include: {
        user: true,
        rides: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        rating: 'desc',
      },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      phone,
      vehicleType,
      vehicleNo,
      licenseNo,
    } = body;

    const driver = await db.driver.create({
      data: {
        userId,
        name,
        phone,
        vehicleType,
        vehicleNo,
        licenseNo,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ driver });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json(
      { error: 'Failed to create driver' },
      { status: 500 }
    );
  }
}