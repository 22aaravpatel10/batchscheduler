import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedGxP() {
  console.log('Seeding GxP data...');

  // Create default reason codes
  const reasonCodes = [
    {
      code: 'INV_ADJ_COUNT',
      description: 'Physical count adjustment',
      category: 'INVENTORY',
    },
    {
      code: 'INV_ADJ_DAMAGE',
      description: 'Material damaged or degraded',
      category: 'INVENTORY',
    },
    {
      code: 'INV_ADJ_EXPIRE',
      description: 'Material expired',
      category: 'INVENTORY',
    },
    {
      code: 'QUALITY_FAIL',
      description: 'Failed quality control test',
      category: 'QUALITY',
    },
    {
      code: 'QUALITY_RETEST',
      description: 'Retest required',
      category: 'QUALITY',
    },
    {
      code: 'QUALITY_RELEASE',
      description: 'Quality approved for release',
      category: 'QUALITY',
    },
    {
      code: 'MAINT_PREVENTIVE',
      description: 'Preventive maintenance',
      category: 'MAINTENANCE',
    },
    {
      code: 'MAINT_CORRECTIVE',
      description: 'Corrective maintenance',
      category: 'MAINTENANCE',
    },
    {
      code: 'CAL_SCHEDULED',
      description: 'Scheduled calibration',
      category: 'MAINTENANCE',
    },
    {
      code: 'DATA_CORRECTION',
      description: 'Data entry correction',
      category: 'OTHER',
    },
  ];

  for (const rc of reasonCodes) {
    await prisma.reasonCode.upsert({
      where: {
        orgId_code: {
          orgId: 'default',
          code: rc.code,
        },
      },
      update: {},
      create: {
        orgId: 'default',
        ...rc,
      },
    });
  }

  console.log(`Created ${reasonCodes.length} reason codes`);

  // Create default GxP config if it doesn't exist
  await prisma.gxPConfig.upsert({
    where: { orgId: 'default' },
    update: {},
    create: {
      orgId: 'default',
      gxpMode: 'OFF',
    },
  });

  console.log('GxP config initialized');

  // Create default organization
  await prisma.organization.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Default Organization',
      gxpMode: 'OFF',
    },
  });

  console.log('Organization initialized');
}

seedGxP()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
