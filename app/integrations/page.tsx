'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Settings, Trash2, CheckCircle, XCircle, AlertTriangle, Network } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  vendor: string;
  systemType: string;
  connectionType: string;
  syncEnabled: boolean;
  syncStatus: string;
  lastSyncTime: string | null;
  isActive: boolean;
  networkZone: string | null;
  tagCount: number;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchIntegrations(); // Refresh to show updated status
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration? All associated tags will be removed.')) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Integration deleted');
        fetchIntegrations();
      } else {
        toast.error('Failed to delete integration');
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast.error('Failed to delete integration');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'SYNCING':
        return <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getVendorColor = (vendor: string) => {
    const colors: Record<string, string> = {
      YOKOGAWA: 'bg-blue-100 text-blue-800',
      SIEMENS: 'bg-cyan-100 text-cyan-800',
      HONEYWELL: 'bg-amber-100 text-amber-800',
      ABB: 'bg-rose-100 text-rose-800',
      EMERSON: 'bg-purple-100 text-purple-800',
    };
    return colors[vendor] || 'bg-gray-100 text-gray-800';
  };

  const getConnectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      OPC_UA: 'OPC UA',
      OPC_DA: 'OPC DA',
      REST_API: 'REST API',
      DATABASE: 'Database',
      PROPRIETARY: 'Proprietary SDK',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-black">DCS Integrations</h1>
          <p className="mt-2 text-slate-600">
            Manage connections to your Distributed Control Systems
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-medium shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </button>
      </div>

      {/* Integration Cards */}
      {integrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Network className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">No DCS Integrations</h3>
          <p className="text-slate-600 mb-6">
            Connect to your DCS systems to enable real-time data synchronization
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Integration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white rounded-lg border border-slate-200 hover:border-teal-200 transition-all"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black mb-1">
                      {integration.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getVendorColor(integration.vendor)}`}>
                        {integration.vendor}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                        {getConnectionTypeLabel(integration.connectionType)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(integration.syncStatus)}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-slate-600">System:</span>{' '}
                    <span className="text-black font-medium">{integration.systemType}</span>
                  </div>
                  {integration.networkZone && (
                    <div className="text-sm">
                      <span className="text-slate-600">Zone:</span>{' '}
                      <span className="text-black font-medium">{integration.networkZone}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-slate-600">Tags:</span>{' '}
                    <span className="text-black font-medium">{integration.tagCount}</span>
                  </div>
                  {integration.lastSyncTime && (
                    <div className="text-sm text-slate-600">
                      Last sync: {new Date(integration.lastSyncTime).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  {integration.syncEnabled ? (
                    <span className="inline-flex items-center text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
                      Sync Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                      <span className="w-2 h-2 bg-slate-400 rounded-full mr-1.5"></span>
                      Sync Disabled
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={testingId === integration.id}
                    className="flex-1 px-3 py-2 text-sm font-medium text-teal-600 border border-teal-500 rounded-lg hover:bg-teal-50 disabled:opacity-50 transition-colors"
                  >
                    {testingId === integration.id ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={() => {/* TODO: Open edit modal */}}
                    className="px-3 py-2 text-slate-400 hover:text-teal-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(integration.id)}
                    className="px-3 py-2 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-teal-900 mb-2">
          📚 Integration Documentation
        </h3>
        <p className="text-sm text-teal-800 mb-3">
          For detailed setup instructions, supported vendors, and troubleshooting guides, see:
        </p>
        <a
          href="/docs/DCS_INTEGRATION_GUIDE.md"
          download
          className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
        >
          Download DCS Integration Guide →
        </a>
      </div>

      {/* TODO: Add IntegrationForm modal */}
      {showModal && (
        <>
          {/* Minimal overlay */}
          <div className="fixed inset-0 bg-slate-900/10 z-40" onClick={() => setShowModal(false)}></div>

          {/* Slide-in panel from right */}
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-black">Add New Integration</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <p className="text-slate-600 mb-4">Integration form coming next...</p>
            </div>
            <div className="flex justify-end gap-3 px-8 py-6 border-t border-slate-100 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
