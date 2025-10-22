'use client';

import { useState, useEffect } from 'react';
import { Equipment, Material, BatchStatus } from '@/lib/types';
import toast from 'react-hot-toast';

interface MaterialSelection {
  materialId: string;
  quantity: number;
}

interface BatchFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialStartTime?: Date;
  initialEndTime?: Date;
  existingBatch?: Batch;
}

export default function BatchForm({ onClose, onSuccess, initialStartTime, initialEndTime, existingBatch }: BatchFormProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: existingBatch?.name || '',
    reactionStepId: existingBatch?.reactionStepId || '',
    reactionStepName: existingBatch?.reactionStepName || '',
    equipmentId: existingBatch?.equipmentId || '',
    startTime: existingBatch
      ? formatDateTimeLocal(new Date(existingBatch.startTime))
      : initialStartTime
      ? formatDateTimeLocal(initialStartTime)
      : '',
    endTime: existingBatch
      ? formatDateTimeLocal(new Date(existingBatch.endTime))
      : initialEndTime
      ? formatDateTimeLocal(initialEndTime)
      : '',
    status: existingBatch?.status || ('PLANNED' as BatchStatus),
    notes: existingBatch?.notes || '',
  });

  const [selectedMaterials, setSelectedMaterials] = useState<MaterialSelection[]>(
    existingBatch?.materials?.map(bm => ({
      materialId: bm.materialId,
      quantity: bm.quantity
    })) || []
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, materialsRes] = await Promise.all([
        fetch('/api/equipment'),
        fetch('/api/materials'),
      ]);
      const equipmentData = await equipmentRes.json();
      const materialsData = await materialsRes.json();
      setEquipment(equipmentData);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a batch name');
      return;
    }
    if (!formData.equipmentId) {
      toast.error('Please select equipment');
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error('Please select start and end times');
      return;
    }
    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error('End time must be after start time');
      return;
    }

    setSubmitting(true);

    try {
      const url = existingBatch ? `/api/batches/${existingBatch.id}` : '/api/batches';
      const method = existingBatch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          reactionStepId: formData.reactionStepId || null,
          reactionStepName: formData.reactionStepName || null,
          equipmentId: formData.equipmentId,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          status: formData.status,
          notes: formData.notes || null,
          materials: selectedMaterials.filter(m => m.materialId && m.quantity > 0),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${existingBatch ? 'update' : 'create'} batch`);
      }

      toast.success(existingBatch ? 'Batch updated successfully' : 'Batch created successfully', {
        duration: Infinity,
        icon: existingBatch ? '✅' : '🎉',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${existingBatch ? 'updating' : 'creating'} batch:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${existingBatch ? 'update' : 'create'} batch`, {
        duration: Infinity,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { materialId: '', quantity: 0 }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof MaterialSelection, value: string | number) => {
    const updated = [...selectedMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMaterials(updated);
  };

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-slate-900/10 z-40" onClick={onClose}></div>
        <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex items-center justify-center">
          <div className="text-center text-slate-600">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Minimal overlay */}
      <div className="fixed inset-0 bg-slate-900/10 z-40" onClick={onClose}></div>

      {/* Slide-in panel from right */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-black">{existingBatch ? 'Edit Batch' : 'Create New Batch'}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="e.g., Batch #2024-001"
                required
              />
            </div>

            {/* Reaction/Step Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Reaction/Step ID
                </label>
                <input
                  type="text"
                  value={formData.reactionStepId}
                  onChange={(e) => setFormData({ ...formData, reactionStepId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., STEP-001, RXN-A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Reaction/Step Name
                </label>
                <input
                  type="text"
                  value={formData.reactionStepName}
                  onChange={(e) => setFormData({ ...formData, reactionStepName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="e.g., Hydrogenation, Crystallization"
                />
              </div>
            </div>

            {/* Equipment Selection */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Equipment <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select equipment...</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}{eq.equipmentId ? ` (${eq.equipmentId})` : ''}{eq.size ? ` - ${eq.size}` : ''}
                  </option>
                ))}
              </select>
              {equipment.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  No equipment available. Please add equipment first.
                </p>
              )}

              {/* Display selected equipment details */}
              {formData.equipmentId && equipment.find(e => e.id === formData.equipmentId) && (
                <div className="mt-3 p-4 bg-teal-50/50 border border-teal-100 rounded-lg">
                  {(() => {
                    const selectedEq = equipment.find(e => e.id === formData.equipmentId);
                    return selectedEq && (
                      <div className="space-y-1.5 text-sm">
                        <p className="font-semibold text-teal-900 mb-2">Equipment Details:</p>
                        {selectedEq.equipmentId && (
                          <p className="text-slate-700"><span className="font-medium text-black">Equipment ID:</span> {selectedEq.equipmentId}</p>
                        )}
                        {selectedEq.size && (
                          <p className="text-slate-700"><span className="font-medium text-black">Size:</span> {selectedEq.size}</p>
                        )}
                        {selectedEq.manufacturer && (
                          <p className="text-slate-700"><span className="font-medium text-black">Manufacturer:</span> {selectedEq.manufacturer}</p>
                        )}
                        {selectedEq.materialOfConstruction && (
                          <p className="text-slate-700"><span className="font-medium text-black">Material of Construction:</span> {selectedEq.materialOfConstruction}</p>
                        )}
                        {selectedEq.description && (
                          <p className="text-slate-700"><span className="font-medium text-black">Description:</span> {selectedEq.description}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BatchStatus })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Materials Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-black">
                  Materials (Optional)
                </label>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  + Add Material
                </button>
              </div>

              {selectedMaterials.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  No materials added. Click "Add Material" to assign materials to this batch.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedMaterials.map((selected, index) => {
                    const material = materials.find(m => m.id === selected.materialId);
                    return (
                      <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex-1">
                          <select
                            value={selected.materialId}
                            onChange={(e) => updateMaterial(index, 'materialId', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all mb-2"
                          >
                            <option value="">Select material...</option>
                            {materials.map((mat) => (
                              <option key={mat.id} value={mat.id}>
                                {mat.name} ({mat.currentQuantity} {mat.unit} available)
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2 items-center">
                            <input
                              type="number"
                              value={selected.quantity || ''}
                              onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                              placeholder="Quantity"
                              min="0"
                              step="0.01"
                              className="w-32 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                            {material && (
                              <span className="text-sm text-slate-600">{material.unit}</span>
                            )}
                            {material && selected.quantity > material.currentQuantity && (
                              <span className="text-sm text-red-600 font-medium">
                                Insufficient stock!
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMaterial(index)}
                          className="text-slate-400 hover:text-red-600 mt-2 transition-colors"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                placeholder="Add any additional notes or instructions..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-8 py-6 border-t border-slate-100 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 transition-colors"
              disabled={submitting || equipment.length === 0}
            >
              {submitting
                ? (existingBatch ? 'Updating...' : 'Creating...')
                : (existingBatch ? 'Update Batch' : 'Create Batch')
              }
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// Helper function to format date for datetime-local input
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
