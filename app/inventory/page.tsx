'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Material } from '@/lib/types';

export default function InventoryPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    currentQuantity: '',
    minimumQuantity: '',
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingMaterial
        ? `/api/materials/${editingMaterial.id}`
        : '/api/materials';
      const method = editingMaterial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingMaterial ? 'Inventory updated' : 'Inventory updated', {
          duration: Infinity,
          icon: '📦',
        });
        setShowModal(false);
        setFormData({
          name: '',
          description: '',
          unit: '',
          currentQuantity: '',
          minimumQuantity: '',
        });
        setEditingMaterial(null);
        fetchMaterials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save material', { duration: Infinity });
      }
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error('Failed to save material', { duration: Infinity });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Inventory updated', {
          duration: Infinity,
          icon: '🗑️',
        });
        fetchMaterials();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete material', { duration: Infinity });
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material', { duration: Infinity });
    }
  };

  const openModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        description: material.description || '',
        unit: material.unit,
        currentQuantity: material.currentQuantity.toString(),
        minimumQuantity: material.minimumQuantity.toString(),
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        description: '',
        unit: '',
        currentQuantity: '',
        minimumQuantity: '',
      });
    }
    setShowModal(true);
  };

  const isLowStock = (material: Material) => {
    return material.currentQuantity <= material.minimumQuantity;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-2 text-gray-600">
            Manage raw materials, chemicals, and supplies
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Material
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Minimum Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {materials.map((material) => (
              <tr key={material.id} className={isLowStock(material) ? 'bg-orange-50/50' : 'hover:bg-slate-50 transition-colors'}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-black">{material.name}</div>
                    {material.description && (
                      <div className="text-sm text-slate-600">{material.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">
                    {material.currentQuantity} {material.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">
                    {material.minimumQuantity} {material.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isLowStock(material) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openModal(material)}
                    className="text-slate-400 hover:text-teal-600 mr-4 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {materials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No materials yet. Add your first material to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingMaterial(null);
              setFormData({
                name: '',
                description: '',
                unit: '',
                currentQuantity: '',
                minimumQuantity: '',
              });
            }
          }}>
            {/* Centered Modal */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex overflow-hidden z-50" onClick={(e) => e.stopPropagation()}>
              {/* Left sidebar - Materials List */}
              <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="px-6 py-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-black">Added Materials</h3>
                  <p className="text-sm text-slate-600 mt-1">{materials.length} item(s)</p>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {materials.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      No materials added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {materials.map((mat) => (
                        <div
                          key={mat.id}
                          className="bg-white rounded-lg border border-slate-200 p-3 hover:border-teal-300 transition-all"
                        >
                          <div className="font-medium text-black text-sm">{mat.name}</div>
                          <div className="text-xs text-slate-600 mt-1">
                            {mat.currentQuantity} {mat.unit}
                          </div>
                          {isLowStock(mat) && (
                            <div className="text-xs text-orange-600 mt-1">⚠️ Low Stock</div>
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
                    {editingMaterial ? 'Edit Material' : 'Add Material'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMaterial(null);
                      setFormData({
                        name: '',
                        description: '',
                        unit: '',
                        currentQuantity: '',
                        minimumQuantity: '',
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
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., Hydrogen Peroxide"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., 30% solution"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., kg, L, units"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Current Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.currentQuantity}
                    onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Minimum Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumQuantity}
                    onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
                  {/* Action Buttons - Fixed at bottom */}
                  <div className="flex gap-3 justify-end px-8 py-6 border-t border-slate-200 bg-white shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingMaterial(null);
                        setFormData({
                          name: '',
                          description: '',
                          unit: '',
                          currentQuantity: '',
                          minimumQuantity: '',
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
                      {editingMaterial ? 'Update Material' : 'Save Material'}
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
