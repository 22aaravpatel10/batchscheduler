'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { Batch, CalendarEvent, Equipment } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Scheduler() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, equipmentRes] = await Promise.all([
        fetch('/api/batches'),
        fetch('/api/equipment'),
      ]);
      const batchesData = await batchesRes.json();
      const equipmentData = await equipmentRes.json();
      setBatches(batchesData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const events: CalendarEvent[] = batches.map((batch) => ({
    id: batch.id,
    title: `${batch.name} - ${batch.equipment?.name}`,
    start: new Date(batch.startTime),
    end: new Date(batch.endTime),
    resource: batch,
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const batch = event.resource;
    return {
      className: `batch-${batch.status}`,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading scheduler...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Batch Scheduler</h1>
        <p className="mt-2 text-gray-600">
          Schedule and manage batch operations across your equipment
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedBatch(event.resource)}
        />
      </div>

      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedBatch.name}</h2>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Equipment</label>
                <p className="mt-1 text-gray-900">{selectedBatch.equipment?.name}</p>
                {selectedBatch.equipment?.description && (
                  <p className="text-sm text-gray-500">{selectedBatch.equipment.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedBatch.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedBatch.endTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedBatch.status} />
                </div>
              </div>

              {selectedBatch.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-gray-900">{selectedBatch.notes}</p>
                </div>
              )}

              {selectedBatch.materials && selectedBatch.materials.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Materials</label>
                  <div className="space-y-2">
                    {selectedBatch.materials.map((bm) => (
                      <div key={bm.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium">{bm.material?.name}</span>
                        <span className="text-gray-600">
                          {bm.quantity} {bm.material?.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a view-only calendar in the MVP. To create new batches, use the Equipment page
          to add equipment, then use the Inventory page to add materials. Future updates will add drag-and-drop batch creation.
        </p>
      </div>
    </div>
  );
}
