'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Equipment } from '@/lib/types';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    equipmentId: '',
    size: '',
    manufacturer: '',
    materialOfConstruction: '',
    description: ''
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingEquipment
        ? `/api/equipment/${editingEquipment.id}`
        : '/api/equipment';
      const method = editingEquipment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingEquipment ? 'Equipment updated' : 'Equipment saved', {
          duration: Infinity,
          icon: '✅',
        });
        setShowModal(false);
        setFormData({
          name: '',
          equipmentId: '',
          size: '',
          manufacturer: '',
          materialOfConstruction: '',
          description: ''
        });
        setEditingEquipment(null);
        fetchEquipment();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save equipment', { duration: Infinity });
      }
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error('Failed to save equipment', { duration: Infinity });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Equipment deleted', {
          duration: Infinity,
          icon: '🗑️',
        });
        fetchEquipment();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete equipment', { duration: Infinity });
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Failed to delete equipment', { duration: Infinity });
    }
  };

  const openModal = (equip?: Equipment) => {
    if (equip) {
      setEditingEquipment(equip);
      setFormData({
        name: equip.name,
        equipmentId: equip.equipmentId || '',
        size: equip.size || '',
        manufacturer: equip.manufacturer || '',
        materialOfConstruction: equip.materialOfConstruction || '',
        description: equip.description || ''
      });
    } else {
      setEditingEquipment(null);
      setFormData({
        name: '',
        equipmentId: '',
        size: '',
        manufacturer: '',
        materialOfConstruction: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
          <p className="mt-2 text-gray-600">
            Manage your manufacturing equipment and reactors
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((equip) => (
          <div key={equip.id} className="bg-white rounded-lg border border-slate-200 hover:border-teal-200 transition-all p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-black">{equip.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(equip)}
                  className="text-slate-400 hover:text-teal-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(equip.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {equip.equipmentId && (
                <p className="text-slate-700"><span className="font-medium text-black">ID:</span> {equip.equipmentId}</p>
              )}
              {equip.size && (
                <p className="text-slate-700"><span className="font-medium text-black">Size:</span> {equip.size}</p>
              )}
              {equip.manufacturer && (
                <p className="text-slate-700"><span className="font-medium text-black">Manufacturer:</span> {equip.manufacturer}</p>
              )}
              {equip.materialOfConstruction && (
                <p className="text-slate-700"><span className="font-medium text-black">Material:</span> {equip.materialOfConstruction}</p>
              )}
              {equip.description && (
                <p className="text-slate-600 italic">{equip.description}</p>
              )}
            </div>
            <div className="text-sm text-slate-500 border-t border-slate-100 pt-3">
              {equip.batches?.length || 0} batch(es) scheduled
            </div>
          </div>
        ))}

        {equipment.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">No equipment yet. Add your first equipment to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingEquipment(null);
              setFormData({
                name: '',
                equipmentId: '',
                size: '',
                manufacturer: '',
                materialOfConstruction: '',
                description: ''
              });
            }
          }}>
            {/* Centered Modal */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex overflow-hidden z-50" onClick={(e) => e.stopPropagation()}>
              {/* Left sidebar - Equipment List */}
              <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="px-6 py-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-black">Added Equipment</h3>
                  <p className="text-sm text-slate-600 mt-1">{equipment.length} item(s)</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {equipment.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No equipment added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {equipment.map((equip) => (
                        <div
                          key={equip.id}
                          className="bg-white rounded-lg border border-slate-200 p-3 hover:border-teal-300 transition-all"
                        >
                          <div className="font-medium text-black text-sm">{equip.name}</div>
                          {equip.equipmentId && (
                            <div className="text-xs text-slate-600 mt-1">ID: {equip.equipmentId}</div>
                          )}
                          {equip.size && (
                            <div className="text-xs text-slate-600">Size: {equip.size}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Form */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-black">
                    {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEquipment(null);
                      setFormData({
                        name: '',
                        equipmentId: '',
                        size: '',
                        manufacturer: '',
                        materialOfConstruction: '',
                        description: ''
                      });
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                    <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Equipment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., Glass Liner 8kl Reactor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Equipment ID
                  </label>
                  <input
                    type="text"
                    value={formData.equipmentId}
                    onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., R-101, TANK-A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Size/Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., 8000L, 5000 gal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., De Dietrich, Pfaudler"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Material of Construction
                  </label>
                  <input
                    type="text"
                    value={formData.materialOfConstruction}
                    onChange={(e) => setFormData({ ...formData, materialOfConstruction: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., Glass-lined, SS 316L, Hastelloy C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="e.g., Abrasion resistant, jacketed, glass-lined reactor"
                  />
                </div>
                  </div>
                  {/* Action Buttons - Fixed at bottom */}
                  <div className="flex gap-3 justify-end px-8 py-6 border-t border-slate-200 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingEquipment(null);
                        setFormData({
                          name: '',
                          equipmentId: '',
                          size: '',
                          manufacturer: '',
                          materialOfConstruction: '',
                          description: ''
                        });
                      }}
                      className="px-8 py-3 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-lg text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all"
                    >
                      {editingEquipment ? 'Update Equipment' : 'Save Equipment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
