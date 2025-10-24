import { prisma } from './prisma';
import crypto from 'crypto';

export interface AuditEntry {
  orgId?: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeJson?: any;
  afterJson?: any;
  reasonCode?: string;
  reasonText?: string;
  sourceIp?: string;
  userAgent?: string;
  sessionId?: string;
  tsClient?: Date;
}

/**
 * Compute SHA256 hash for audit chain
 */
function computeHash(
  hashPrev: string | null,
  tsServer: Date,
  orgId: string,
  userId: string | null,
  entityType: string,
  entityId: string,
  action: string,
  beforeJson: any,
  afterJson: any,
  reasonCode: string | null,
  reasonText: string | null
): string {
  const data = [
    hashPrev || '',
    tsServer.toISOString(),
    orgId,
    userId || '',
    entityType,
    entityId,
    action,
    JSON.stringify(beforeJson || {}),
    JSON.stringify(afterJson || {}),
    reasonCode || '',
    reasonText || '',
  ].join('|');

  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Get the last audit hash for chain continuity
 */
async function getLastAuditHash(orgId: string): Promise<string | null> {
  const lastAudit = await prisma.auditLog.findFirst({
    where: { orgId },
    orderBy: { id: 'desc' },
    select: { hash: true },
  });

  return lastAudit?.hash || null;
}

/**
 * Check if GxP is enabled and requires hash chain
 */
async function shouldUseHashChain(orgId: string): Promise<boolean> {
  const config = await prisma.gxPConfig.findUnique({
    where: { orgId },
    select: { hashChainEnabled: true },
  });

  return config?.hashChainEnabled || false;
}

/**
 * Check if reason code is required for this action
 */
async function isReasonRequired(
  orgId: string,
  entityType: string,
  action: string
): Promise<boolean> {
  const config = await prisma.gxPConfig.findUnique({
    where: { orgId },
    select: { requireReasonOnEdit: true, gxpMode: true },
  });

  if (!config || config.gxpMode === 'OFF') {
    return false;
  }

  const requireReason = config.requireReasonOnEdit;

  if (requireReason === 'OFF') return false;
  if (requireReason === 'ALL_GXP') return true;
  if (requireReason === 'INVENTORY_ONLY') {
    return entityType === 'inventory_txn' || entityType === 'inventory_lot';
  }

  return false;
}

/**
 * Main audit logging function
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  const orgId = entry.orgId || 'default';
  const tsServer = new Date();

  // Check if reason is required
  const reasonRequired = await isReasonRequired(
    orgId,
    entry.entityType,
    entry.action
  );

  if (reasonRequired && !entry.reasonCode && !entry.reasonText) {
    throw new Error(
      `Reason code or reason text is required for ${entry.entityType} ${entry.action} action`
    );
  }

  // Get hash chain if enabled
  const useHashChain = await shouldUseHashChain(orgId);
  let hash: string | null = null;
  let hashPrev: string | null = null;

  if (useHashChain) {
    hashPrev = await getLastAuditHash(orgId);
    hash = computeHash(
      hashPrev,
      tsServer,
      orgId,
      entry.userId || null,
      entry.entityType,
      entry.entityId,
      entry.action,
      entry.beforeJson,
      entry.afterJson,
      entry.reasonCode || null,
      entry.reasonText || null
    );
  }

  // Insert audit log
  await prisma.auditLog.create({
    data: {
      tsServer,
      tsClient: entry.tsClient,
      orgId,
      userId: entry.userId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      beforeJson: entry.beforeJson,
      afterJson: entry.afterJson,
      reasonCode: entry.reasonCode,
      reasonText: entry.reasonText,
      sourceIp: entry.sourceIp,
      userAgent: entry.userAgent,
      sessionId: entry.sessionId,
      hash,
      hashPrev,
    },
  });
}

/**
 * Verify audit chain integrity
 */
export async function verifyAuditChain(
  orgId: string,
  startId?: bigint,
  endId?: bigint
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  const where: any = { orgId };
  if (startId) where.id = { gte: startId };
  if (endId) where.id = { ...where.id, lte: endId };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { id: 'asc' },
  });

  let prevHash: string | null = null;

  for (const log of logs) {
    if (!log.hash) {
      errors.push(`Log ${log.id} is missing hash`);
      continue;
    }

    if (log.hashPrev !== prevHash) {
      errors.push(
        `Log ${log.id} hash chain broken: expected prev=${prevHash}, got=${log.hashPrev}`
      );
    }

    // Recompute hash to verify
    const computedHash = computeHash(
      log.hashPrev,
      log.tsServer,
      log.orgId,
      log.userId,
      log.entityType,
      log.entityId,
      log.action,
      log.beforeJson,
      log.afterJson,
      log.reasonCode,
      log.reasonText
    );

    if (computedHash !== log.hash) {
      errors.push(`Log ${log.id} hash mismatch: tampered or corrupted`);
    }

    prevHash = log.hash;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for late entry (entry made > X minutes after event)
 */
export function checkLateEntry(
  tsClient: Date | undefined,
  tsServer: Date,
  lateEntryMinutes: number
): boolean {
  if (!tsClient || lateEntryMinutes === 0) return false;

  const diffMs = tsServer.getTime() - tsClient.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return Math.abs(diffMinutes) > lateEntryMinutes;
}
