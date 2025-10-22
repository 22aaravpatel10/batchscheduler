import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_ORG_ID = 'default';

// GET /api/gxp/config - Get GxP configuration
export async function GET() {
  try {
    let config = await prisma.gxPConfig.findUnique({
      where: { orgId: DEFAULT_ORG_ID },
    });

    // Create default config if it doesn't exist
    if (!config) {
      config = await prisma.gxPConfig.create({
        data: {
          orgId: DEFAULT_ORG_ID,
          gxpMode: 'OFF',
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching GxP config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GxP configuration' },
      { status: 500 }
    );
  }
}

// POST /api/gxp/config - Update GxP configuration
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Apply mode-based defaults
    if (data.gxpMode === 'LITE') {
      data.immutableAudit = true;
      data.requireReasonOnEdit = 'INVENTORY_ONLY';
      data.maxClockDrift = 300; // 5 minutes
      data.clockDriftAction = 'WARN';
      data.versioningEnabled = true;
      data.calibrationOverdueAction = 'WARN';
      data.logPrintExport = true;
    } else if (data.gxpMode === 'FULL') {
      data.immutableAudit = true;
      data.requireReasonOnEdit = 'ALL_GXP';
      data.maxClockDrift = 120; // 2 minutes
      data.clockDriftAction = 'BLOCK';
      data.hashChainEnabled = true;
      data.versioningEnabled = true;
      data.approvedOnlyEnforcement = 'BLOCK';
      data.effectiveDatingAllowed = false;
      data.changeReasonRequired = true;
      data.coaRequirement = 'BLOCK';
      data.calibrationOverdueAction = 'BLOCK';
      data.incompatibleSequenceAction = 'BLOCK';
      data.storageClass = 'WORM';
      data.logPrintExport = true;
    }

    const config = await prisma.gxPConfig.upsert({
      where: { orgId: DEFAULT_ORG_ID },
      update: data,
      create: {
        ...data,
        orgId: DEFAULT_ORG_ID,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating GxP config:', error);
    return NextResponse.json(
      { error: 'Failed to update GxP configuration' },
      { status: 500 }
    );
  }
}
