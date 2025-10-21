import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/materials/[id] - Get single material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        batches: {
          include: {
            batch: {
              include: {
                equipment: true,
              },
            },
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material' },
      { status: 500 }
    );
  }
}

// PUT /api/materials/[id] - Update material
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, unit, currentQuantity, minimumQuantity } = body;

    // If name is being changed, check for duplicates
    if (name) {
      const existing = await prisma.material.findFirst({
        where: {
          name,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Material with this name already exists' },
          { status: 409 }
        );
      }
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(unit && { unit }),
        ...(currentQuantity !== undefined && { currentQuantity: parseFloat(currentQuantity) }),
        ...(minimumQuantity !== undefined && { minimumQuantity: parseFloat(minimumQuantity) }),
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json(
      { error: 'Failed to update material' },
      { status: 500 }
    );
  }
}

// DELETE /api/materials/[id] - Delete material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if material is used in any active batches
    const activeBatches = await prisma.batchMaterial.findFirst({
      where: {
        materialId: id,
        batch: {
          status: {
            in: ['PLANNED', 'IN_PROGRESS'],
          },
        },
      },
    });

    if (activeBatches) {
      return NextResponse.json(
        { error: 'Cannot delete material that is assigned to active batches' },
        { status: 409 }
      );
    }

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    );
  }
}
