import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rideId = params.id;
    const { driverId } = await request.json();

    // Update ride with driver
    const ride = await db.ride.update({
      where: { id: rideId },
      data: {
        driverId,
        status: 'accepted',
      },
      include: {
        rider: true,
        driver: true,
      },
    });

    // Update driver availability
    await db.driver.update({
      where: { id: driverId },
      data: {
        isAvailable: false,
        totalRides: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ ride });
  } catch (error) {
    console.error('Error matching ride:', error);
    return NextResponse.json(
      { error: 'Failed to match ride' },
      { status: 500 }
    );
  }
}