import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/integrations - List all DCS integrations
export async function GET() {
  try {
    const integrations = await prisma.dCSIntegration.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tags: {
          select: { id: true },
        },
      },
    });

    // Add tag count to each integration
    const integrationsWithCounts = integrations.map((integration) => ({
      ...integration,
      tagCount: integration.tags.length,
      tags: undefined, // Remove the tags array, keep only the count
    }));

    return NextResponse.json(integrationsWithCounts);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

// POST /api/integrations - Create new DCS integration
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.vendor || !data.systemType || !data.connectionType) {
      return NextResponse.json(
        { error: 'Missing required fields: name, vendor, systemType, connectionType' },
        { status: 400 }
      );
    }

    const integration = await prisma.dCSIntegration.create({
      data: {
        name: data.name,
        vendor: data.vendor,
        systemType: data.systemType,
        connectionType: data.connectionType,

        // OPC Configuration
        opcServerUrl: data.opcServerUrl || null,
        opcNamespace: data.opcNamespace || null,
        opcUsername: data.opcUsername || null,
        opcPassword: data.opcPassword || null, // TODO: Encrypt in production

        // REST API Configuration
        apiBaseUrl: data.apiBaseUrl || null,
        apiKey: data.apiKey || null, // TODO: Encrypt in production
        apiAuthType: data.apiAuthType || null,

        // Database Configuration
        dbConnectionString: data.dbConnectionString || null, // TODO: Encrypt in production
        dbType: data.dbType || null,

        // Security
        certificatePath: data.certificatePath || null,
        trustServerCert: data.trustServerCert || false,
        networkZone: data.networkZone || null,

        // Sync Configuration
        syncEnabled: data.syncEnabled || false,
        syncInterval: data.syncInterval || 60,

        isActive: true,
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}
