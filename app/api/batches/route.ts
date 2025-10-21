import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/batches - List all batches with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipmentId = searchParams.get('equipmentId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const batches = await prisma.batch.findMany({
      where: {
        ...(equipmentId && { equipmentId }),
        ...(status && { status: status as any }),
        ...(startDate && {
          startTime: {
            gte: new Date(startDate),
          },
        }),
        ...(endDate && {
          endTime: {
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        equipment: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// POST /api/batches - Create new batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, equipmentId, startTime, endTime, status, notes, materials } = body;

    if (!name || !equipmentId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Name, equipment, start time, and end time are required' },
        { status: 400 }
      );
    }

    // Check for overlapping batches on the same equipment
    const overlapping = await prisma.batch.findFirst({
      where: {
        equipmentId,
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'This time slot overlaps with an existing batch' },
        { status: 409 }
      );
    }

    // Create batch with materials in a transaction
    const batch = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newBatch = await tx.batch.create({
        data: {
          name,
          equipmentId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: status || 'PLANNED',
          notes: notes || null,
        },
        include: {
          equipment: true,
        },
      });

      // If materials are provided, create relationships and update inventory
      if (materials && materials.length > 0) {
        for (const mat of materials) {
          // Create batch-material relationship
          await tx.batchMaterial.create({
            data: {
              batchId: newBatch.id,
              materialId: mat.materialId,
              quantity: mat.quantity,
            },
          });

          // Update material inventory
          await tx.material.update({
            where: { id: mat.materialId },
            data: {
              currentQuantity: {
                decrement: mat.quantity,
              },
            },
          });
        }
      }

      return newBatch;
    });

    // Fetch the complete batch with materials
    const completeBatch = await prisma.batch.findUnique({
      where: { id: batch.id },
      include: {
        equipment: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(completeBatch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}
