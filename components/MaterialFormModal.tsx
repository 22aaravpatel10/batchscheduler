'use client';

import { useState } from 'react';
import { Material } from '@/lib/types';
import { AlertTriangle, Shield, FileText, Package } from 'lucide-react';

interface MaterialFormModalProps {
  material: Material | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function MaterialFormModal({ material, onClose, onSubmit }: MaterialFormModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'fda' | 'osha' | 'safety'>('basic');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Basic
    name: material?.name || '',
    description: material?.description || '',
    unit: material?.unit || '',
    currentQuantity: material?.currentQuantity?.toString() || '',
    minimumQuantity: material?.minimumQuantity?.toString() || '',

    // FDA 21 CFR Part 211
    casNumber: material?.casNumber || '',
    lotNumber: material?.lotNumber || '',
    supplierName: material?.supplierName || '',
    supplierLotNumber: material?.supplierLotNumber || '',
    receivedDate: material?.receivedDate ? new Date(material.receivedDate).toISOString().split('T')[0] : '',
    expirationDate: material?.expirationDate ? new Date(material.expirationDate).toISOString().split('T')[0] : '',
    storageLocation: material?.storageLocation || '',
    storageConditions: material?.storageConditions || '',

    // OSHA HazCom & GHS
    ghsClassification: material?.ghsClassification || '',
    hazardCategory: material?.hazardCategory || '',
    signalWord: material?.signalWord || '',
    hazardStatements: material?.hazardStatements || '',
    precautionaryStatements: material?.precautionaryStatements || '',
    pictograms: material?.pictograms || '',
    sdsFileName: material?.sdsFileName || '',
    sdsLastUpdated: material?.sdsLastUpdated ? new Date(material.sdsLastUpdated).toISOString().split('T')[0] : '',

    // Safety
    isHazardous: material?.isHazardous || false,
    requiresPPE: material?.requiresPPE || '',
    firstAidMeasures: material?.firstAidMeasures || '',
    disposalProcedure: material?.disposalProcedure || '',

    // QC
    qcStatus: material?.qcStatus || 'PENDING',
    qcApprovedBy: material?.qcApprovedBy || '',
    qcApprovedDate: material?.qcApprovedDate ? new Date(material.qcApprovedDate).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'fda', label: 'FDA Compliance', icon: FileText },
    { id: 'osha', label: 'OSHA/GHS', icon: Shield },
    { id: 'safety', label: 'Safety & QC', icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-teal-100">
            <h2 className="text-2xl font-bold text-black">
              {material ? 'Edit Material' : 'Add New Material'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-teal-500 text-black'
                        : 'border-transparent text-slate-600 hover:text-black hover:border-teal-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Material Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., Hydrogen Peroxide, Sodium Hydroxide"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Additional details about the material"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Unit <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="kg, L, gal, units"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Storage Location</label>
                    <input
                      type="text"
                      value={formData.storageLocation}
                      onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., Building A, Room 101, Shelf 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Current Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.currentQuantity}
                      onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Minimum Quantity <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.minimumQuantity}
                      onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FDA Compliance Tab */}
            {activeTab === 'fda' && (
              <div className="space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-teal-900">
                    <strong>FDA 21 CFR Part 211</strong> - Current Good Manufacturing Practice requirements
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">CAS Number</label>
                    <input
                      type="text"
                      value={formData.casNumber}
                      onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., 7722-84-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Lot Number</label>
                    <input
                      type="text"
                      value={formData.lotNumber}
                      onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Current lot/batch number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Supplier Name</label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Manufacturer/supplier name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Supplier Lot Number</label>
                    <input
                      type="text"
                      value={formData.supplierLotNumber}
                      onChange={(e) => setFormData({ ...formData, supplierLotNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Received Date</label>
                    <input
                      type="date"
                      value={formData.receivedDate}
                      onChange={(e) => setFormData({ ...formData, receivedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Expiration/Retest Date</label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Storage Conditions</label>
                    <input
                      type="text"
                      value={formData.storageConditions}
                      onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., Store at 2-8°C, Keep refrigerated, Room temperature"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">QC Status</label>
                    <select
                      value={formData.qcStatus}
                      onChange={(e) => setFormData({ ...formData, qcStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="QUARANTINE">Quarantine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">QC Approved By</label>
                    <input
                      type="text"
                      value={formData.qcApprovedBy}
                      onChange={(e) => setFormData({ ...formData, qcApprovedBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="QC personnel name/ID"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">QC Approval Date</label>
                    <input
                      type="date"
                      value={formData.qcApprovedDate}
                      onChange={(e) => setFormData({ ...formData, qcApprovedDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OSHA/GHS Tab */}
            {activeTab === 'osha' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-amber-900">
                    <strong>OSHA HazCom Standard</strong> - GHS Rev. 7 aligned (Effective Jan 2026)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">GHS Classification</label>
                    <input
                      type="text"
                      value={formData.ghsClassification}
                      onChange={(e) => setFormData({ ...formData, ghsClassification: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., Oxidizing Liquid, Corrosive"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Hazard Category</label>
                    <input
                      type="text"
                      value={formData.hazardCategory}
                      onChange={(e) => setFormData({ ...formData, hazardCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., Category 2, Category 1A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Signal Word</label>
                    <select
                      value={formData.signalWord}
                      onChange={(e) => setFormData({ ...formData, signalWord: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">None</option>
                      <option value="Danger">Danger</option>
                      <option value="Warning">Warning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">GHS Pictograms</label>
                    <input
                      type="text"
                      value={formData.pictograms}
                      onChange={(e) => setFormData({ ...formData, pictograms: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., GHS02,GHS07 (comma-separated)"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Hazard Statements (H-codes)</label>
                    <input
                      type="text"
                      value={formData.hazardStatements}
                      onChange={(e) => setFormData({ ...formData, hazardStatements: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., H225, H319, H335"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">Precautionary Statements (P-codes)</label>
                    <input
                      type="text"
                      value={formData.precautionaryStatements}
                      onChange={(e) => setFormData({ ...formData, precautionaryStatements: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., P210, P280, P305+P351+P338"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">SDS Filename/Reference</label>
                    <input
                      type="text"
                      value={formData.sdsFileName}
                      onChange={(e) => setFormData({ ...formData, sdsFileName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., H2O2-SDS-2025.pdf"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">SDS Last Updated</label>
                    <input
                      type="date"
                      value={formData.sdsLastUpdated}
                      onChange={(e) => setFormData({ ...formData, sdsLastUpdated: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Safety & QC Tab */}
            {activeTab === 'safety' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-md">
                  <input
                    type="checkbox"
                    checked={formData.isHazardous}
                    onChange={(e) => setFormData({ ...formData, isHazardous: e.target.checked })}
                    className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                  />
                  <label className="text-sm font-medium text-rose-900">
                    This material is classified as hazardous
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Required PPE</label>
                  <input
                    type="text"
                    value={formData.requiresPPE}
                    onChange={(e) => setFormData({ ...formData, requiresPPE: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="e.g., Safety goggles, nitrile gloves, lab coat, respirator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">First Aid Measures</label>
                  <textarea
                    value={formData.firstAidMeasures}
                    onChange={(e) => setFormData({ ...formData, firstAidMeasures: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Eye contact: Rinse immediately with water for 15 minutes. Skin contact: Wash with soap and water..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Disposal Procedure</label>
                  <textarea
                    value={formData.disposalProcedure}
                    onChange={(e) => setFormData({ ...formData, disposalProcedure: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Disposal requirements per local, state, and federal regulations..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-md text-sm font-medium hover:bg-teal-600 disabled:bg-teal-300"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : material ? 'Update Material' : 'Create Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
