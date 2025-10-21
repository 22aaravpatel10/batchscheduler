'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Batch, Material } from '@/lib/types';

interface DashboardData {
  upcomingBatches: Batch[];
  lateBatches: Batch[];
  inProgressBatches: Batch[];
  lowInventoryMaterials: Material[];
  batchStats: { status: string; _count: number }[];
  totalEquipment: number;
  totalMaterials: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your batch operations and inventory status
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Equipment</p>
              <p className="text-2xl font-semibold text-gray-900">{data?.totalEquipment || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.inProgressBatches.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Late Batches</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.lateBatches.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Materials</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data?.totalMaterials || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Batches */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Batches</h2>
            <p className="text-sm text-gray-500">Next 7 days</p>
          </div>
          <div className="p-6">
            {data?.upcomingBatches && data.upcomingBatches.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingBatches.map((batch) => (
                  <div key={batch.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{batch.name}</h3>
                        <p className="text-sm text-gray-500">
                          {batch.equipment?.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(batch.startTime).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={batch.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming batches</p>
            )}
          </div>
        </div>

        {/* Late Batches */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Late Batches</h2>
            <p className="text-sm text-gray-500">Requires attention</p>
          </div>
          <div className="p-6">
            {data?.lateBatches && data.lateBatches.length > 0 ? (
              <div className="space-y-4">
                {data.lateBatches.map((batch) => (
                  <div key={batch.id} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{batch.name}</h3>
                        <p className="text-sm text-gray-500">
                          {batch.equipment?.name}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Due: {new Date(batch.endTime).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={batch.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No late batches</p>
            )}
          </div>
        </div>

        {/* Low Inventory */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Inventory Alert</h2>
            <p className="text-sm text-gray-500">Materials below minimum quantity</p>
          </div>
          <div className="p-6">
            {data?.lowInventoryMaterials && data.lowInventoryMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.lowInventoryMaterials.map((material) => (
                  <div key={material.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{material.name}</h3>
                        <p className="text-sm text-gray-500">{material.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-600">
                          {material.currentQuantity} {material.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {material.minimumQuantity} {material.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">All materials are well stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/scheduler"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Go to Scheduler
        </Link>
        <Link
          href="/inventory"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          View Inventory
        </Link>
      </div>
    </div>
  );
}
