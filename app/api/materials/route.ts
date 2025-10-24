import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/materials - List all materials
export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      include: {
        batches: {
          include: {
            batch: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

// POST /api/materials - Create new material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, unit, currentQuantity, minimumQuantity } = body;

    if (!name || !unit || currentQuantity === undefined) {
      return NextResponse.json(
        { error: 'Name, unit, and current quantity are required' },
        { status: 400 }
      );
    }

    // Check if material with this name already exists
    const existing = await prisma.material.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Material with this name already exists' },
        { status: 409 }
      );
    }

    const material = await prisma.material.create({
      data: {
        name,
        description: description || null,
        unit,
        currentQuantity: parseFloat(currentQuantity),
        minimumQuantity: minimumQuantity ? parseFloat(minimumQuantity) : 0,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    );
  }
}
