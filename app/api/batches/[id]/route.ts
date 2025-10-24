import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/batches/[id] - Get single batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        equipment: true,
        materials: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}

// PUT /api/batches/[id] - Update batch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, startTime, endTime, status, notes, materials } = body;

    // Get the original batch to restore materials if needed
    const originalBatch = await prisma.batch.findUnique({
      where: { id },
      include: {
        materials: true,
      },
    });

    if (!originalBatch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Update batch in a transaction
    const batch = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // If materials changed, restore old quantities first
      if (materials) {
        for (const oldMat of originalBatch.materials) {
          await tx.material.update({
            where: { id: oldMat.materialId },
            data: {
              currentQuantity: {
                increment: oldMat.quantity,
              },
            },
          });
        }

        // Delete old material relationships
        await tx.batchMaterial.deleteMany({
          where: { batchId: id },
        });

        // Create new relationships and update inventory
        for (const mat of materials) {
          await tx.batchMaterial.create({
            data: {
              batchId: id,
              materialId: mat.materialId,
              quantity: mat.quantity,
            },
          });

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

      // Update the batch
      return await tx.batch.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime && { endTime: new Date(endTime) }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          equipment: true,
          materials: {
            include: {
              material: true,
            },
          },
        },
      });
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

// DELETE /api/batches/[id] - Delete batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get batch materials to restore inventory
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: {
        materials: true,
      },
    });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Delete batch and restore inventory in a transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Restore material quantities
      for (const mat of batch.materials) {
        await tx.material.update({
          where: { id: mat.materialId },
          data: {
            currentQuantity: {
              increment: mat.quantity,
            },
          },
        });
      }

      // Delete the batch (cascade will handle materials)
      await tx.batch.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    );
  }
}
