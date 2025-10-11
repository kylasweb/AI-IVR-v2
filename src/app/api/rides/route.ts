import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const rides = await db.ride.findMany({
      where: status ? { status } : {},
      include: {
        rider: true,
        driver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ rides });
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      riderId,
      pickupLocation,
      pickupLat,
      pickupLng,
      dropLocation,
      dropLat,
      dropLng,
      vehicleType,
      fare,
      scheduledFor,
    } = body;

    const ride = await db.ride.create({
      data: {
        riderId,
        pickupLocation,
        pickupLat,
        pickupLng,
        dropLocation,
        dropLat,
        dropLng,
        vehicleType,
        fare,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
      include: {
        rider: true,
      },
    });

    return NextResponse.json({ ride });
  } catch (error) {
    console.error('Error creating ride:', error);
    return NextResponse.json(
      { error: 'Failed to create ride' },
      { status: 500 }
    );
  }
}