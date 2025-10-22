'use client';

import { useEffect, useState } from 'react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface GxPConfig {
  id: string;
  gxpMode: string;
  immutableAudit: boolean;
  requireReasonOnEdit: string;
  lateEntryMinutes: number;
  hashChainEnabled: boolean;
  maxClockDrift: number;
  clockDriftAction: string;
  versioningEnabled: boolean;
  approvedOnlyEnforcement: string;
  calibrationOverdueAction: string;
  coaRequirement: string;
  incompatibleSequenceAction: string;
}

export default function GxPConfigPage() {
  const [config, setConfig] = useState<GxPConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/gxp/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching GxP config:', error);
      toast.error('Failed to load GxP configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async (newMode: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/gxp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gxpMode: newMode }),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        toast.success(`GxP mode set to ${newMode}`);
      } else {
        toast.error('Failed to update GxP mode');
      }
    } catch (error) {
      console.error('Error updating mode:', error);
      toast.error('Failed to update GxP mode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-slate-600">Loading GxP configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Failed to load configuration</div>
      </div>
    );
  }

  const getModeBadge = () => {
    const modes: Record<string, { color: string; text: string }> = {
      OFF: { color: 'bg-slate-100 text-slate-700', text: 'OFF' },
      LITE: { color: 'bg-blue-100 text-blue-700', text: 'LITE' },
      FULL: { color: 'bg-emerald-100 text-emerald-700', text: 'FULL' },
    };

    const mode = modes[config.gxpMode] || modes.OFF;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${mode.color}`}>
        GxP: {mode.text}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-black">GxP Compliance Configuration</h1>
          </div>
          <p className="text-slate-600">
            Configure regulatory compliance settings (FDA 21 CFR Part 11, 210/211, EU Annex 11)
          </p>
        </div>
        <div>{getModeBadge()}</div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">GxP Mode</h2>
        <p className="text-sm text-slate-600 mb-4">
          Select the compliance level for your organization. Each mode automatically configures appropriate settings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleModeChange('OFF')}
            disabled={saving}
            className={`p-4 rounded-lg border-2 transition-all ${
              config.gxpMode === 'OFF'
                ? 'border-slate-400 bg-slate-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-black mb-2">OFF</div>
            <div className="text-sm text-slate-600">
              No GxP compliance. Standard operations with basic audit logging.
            </div>
          </button>

          <button
            onClick={() => handleModeChange('LITE')}
            disabled={saving}
            className={`p-4 rounded-lg border-2 transition-all ${
              config.gxpMode === 'LITE'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="font-semibold text-black mb-2">LITE</div>
            <div className="text-sm text-slate-600">
              Basic GxP compliance with immutable audit trails, reason codes for inventory, and warnings for key events.
            </div>
          </button>

          <button
            onClick={() => handleModeChange('FULL')}
            disabled={saving}
            className={`p-4 rounded-lg border-2 transition-all ${
              config.gxpMode === 'FULL'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="font-semibold text-black mb-2">FULL</div>
            <div className="text-sm text-slate-600">
              Full GxP compliance with hash-chain audit, versioned master data, approved-only enforcement, and blocking controls.
            </div>
          </button>
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audit & Data Integrity */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Audit & Data Integrity</h3>
          <div className="space-y-3">
            <SettingRow
              label="Immutable Audit Trail"
              value={config.immutableAudit}
              mode={config.gxpMode}
            />
            <SettingRow
              label="Hash Chain Protection"
              value={config.hashChainEnabled}
              mode={config.gxpMode}
            />
            <SettingRow
              label="Reason Codes"
              value={config.requireReasonOnEdit}
              mode={config.gxpMode}
            />
            <SettingRow
              label="Late Entry Detection"
              value={`${config.lateEntryMinutes} minutes`}
              mode={config.gxpMode}
            />
          </div>
        </div>

        {/* Master Data Governance */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Master Data Governance</h3>
          <div className="space-y-3">
            <SettingRow
              label="Versioning Enabled"
              value={config.versioningEnabled}
              mode={config.gxpMode}
            />
            <SettingRow
              label="Approved-Only Enforcement"
              value={config.approvedOnlyEnforcement}
              mode={config.gxpMode}
            />
          </div>
        </div>

        {/* Equipment & Operations */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Equipment & Operations</h3>
          <div className="space-y-3">
            <SettingRow
              label="Calibration Overdue"
              value={config.calibrationOverdueAction}
              mode={config.gxpMode}
            />
            <SettingRow
              label="Incompatible Sequence"
              value={config.incompatibleSequenceAction}
              mode={config.gxpMode}
            />
          </div>
        </div>

        {/* Inventory & Quality */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Inventory & Quality</h3>
          <div className="space-y-3">
            <SettingRow
              label="CoA Requirement"
              value={config.coaRequirement}
              mode={config.gxpMode}
            />
            <SettingRow
              label="Clock Drift"
              value={`${config.clockDriftAction} @ ${config.maxClockDrift / 60}min`}
              mode={config.gxpMode}
            />
          </div>
        </div>
      </div>

      {/* Regulatory Information */}
      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-teal-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Regulatory Compliance Coverage
        </h3>
        <div className="text-sm text-teal-800 space-y-2">
          <p>
            <strong>FDA 21 CFR Part 11:</strong> System validation, audit trails, record protection, operational checks, authority checks, time sync
          </p>
          <p>
            <strong>FDA 21 CFR 210/211:</strong> Master & batch records, equipment maintenance, laboratory controls, documentation (ALCOA+)
          </p>
          <p>
            <strong>EU Annex 11:</strong> Data integrity, audit trails, backup/restore, change control, versioning
          </p>
          <p className="mt-3 italic">
            Note: Electronic signatures (21 CFR Part 11 §11.50-§11.300) will be added in v2. Current version provides the audit trail foundation.
          </p>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, value, mode }: { label: string; value: any; mode: string }) {
  const isBoolean = typeof value === 'boolean';
  const displayValue = isBoolean ? (value ? 'Enabled' : 'Disabled') : value;
  const isActive = isBoolean ? value : value !== 'OFF' && value !== 'NONE';

  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`text-sm font-medium ${
          isActive ? 'text-emerald-600' : 'text-slate-500'
        }`}
      >
        {displayValue}
      </span>
    </div>
  );
}
