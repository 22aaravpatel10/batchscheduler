import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/integrations/[id] - Get single integration
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const integration = await prisma.dCSIntegration.findUnique({
      where: { id: params.id },
      include: {
        tags: {
          orderBy: { tagName: 'asc' },
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error fetching integration:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}

// PUT /api/integrations/[id] - Update integration
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const integration = await prisma.dCSIntegration.update({
      where: { id: params.id },
      data: {
        name: data.name,
        vendor: data.vendor,
        systemType: data.systemType,
        connectionType: data.connectionType,

        opcServerUrl: data.opcServerUrl || null,
        opcNamespace: data.opcNamespace || null,
        opcUsername: data.opcUsername || null,
        opcPassword: data.opcPassword || null,

        apiBaseUrl: data.apiBaseUrl || null,
        apiKey: data.apiKey || null,
        apiAuthType: data.apiAuthType || null,

        dbConnectionString: data.dbConnectionString || null,
        dbType: data.dbType || null,

        certificatePath: data.certificatePath || null,
        trustServerCert: data.trustServerCert,
        networkZone: data.networkZone || null,

        syncEnabled: data.syncEnabled,
        syncInterval: data.syncInterval,

        isActive: data.isActive,
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/[id] - Delete integration
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.dCSIntegration.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}
