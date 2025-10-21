import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard - Get dashboard overview
export async function GET() {
  try {
    const now = new Date();

    // Get upcoming batches (next 7 days)
    const upcomingBatches = await prisma.batch.findMany({
      where: {
        startTime: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: {
          in: ['PLANNED', 'IN_PROGRESS'],
        },
      },
      include: {
        equipment: true,
      },
      orderBy: { startTime: 'asc' },
      take: 10,
    });

    // Get late batches (end time passed but not completed)
    const lateBatches = await prisma.batch.findMany({
      where: {
        endTime: {
          lt: now,
        },
        status: {
          in: ['PLANNED', 'IN_PROGRESS', 'DELAYED'],
        },
      },
      include: {
        equipment: true,
      },
      orderBy: { endTime: 'asc' },
    });

    // Get batches in progress
    const inProgressBatches = await prisma.batch.findMany({
      where: {
        status: 'IN_PROGRESS',
      },
      include: {
        equipment: true,
      },
      orderBy: { startTime: 'asc' },
    });

    // Get low inventory materials
    const lowInventoryMaterials = await prisma.material.findMany({
      where: {
        currentQuantity: {
          lte: prisma.material.fields.minimumQuantity,
        },
      },
      orderBy: { currentQuantity: 'asc' },
    });

    // Get batch statistics
    const batchStats = await prisma.batch.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      upcomingBatches,
      lateBatches,
      inProgressBatches,
      lowInventoryMaterials,
      batchStats,
      totalEquipment: await prisma.equipment.count(),
      totalMaterials: await prisma.material.count(),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
