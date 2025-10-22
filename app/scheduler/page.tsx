'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import toast from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { Batch, CalendarEvent, Equipment } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import BatchForm from '@/components/BatchForm';
import TimelineView from '@/components/TimelineView';

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
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('timeline');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

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
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batch Scheduler</h1>
          <p className="mt-2 text-gray-600">
            Schedule and manage batch operations across your equipment
          </p>
        </div>
        <button
          onClick={() => setShowBatchForm(true)}
          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-medium shadow-sm flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Batch
        </button>
      </div>

      {/* View Toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-md font-medium ${
            viewMode === 'timeline'
              ? 'bg-teal-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Timeline View
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-md font-medium ${
            viewMode === 'calendar'
              ? 'bg-teal-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Calendar View
        </button>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'timeline' ? (
        <TimelineView
          batches={batches}
          equipment={equipment}
          onBatchClick={setSelectedBatch}
          viewDate={currentDate}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {/* Calendar View Selector */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                calendarView === 'month'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                calendarView === 'week'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                calendarView === 'day'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCalendarView('agenda')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                calendarView === 'agenda'
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Agenda
            </button>
          </div>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={calendarView}
            onView={(view) => setCalendarView(view as any)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedBatch(event.resource)}
            onNavigate={(date) => setCurrentDate(date)}
          />
        </div>
      )}

      {selectedBatch && !showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedBatch.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowBatchForm(true);
                  }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 font-medium text-sm"
                >
                  Edit Batch
                </button>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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

      {showBatchForm && (
        <BatchForm
          onClose={() => {
            setShowBatchForm(false);
            setSelectedBatch(null);
          }}
          onSuccess={() => {
            fetchData();
            setShowBatchForm(false);
            setSelectedBatch(null);
          }}
          existingBatch={selectedBatch || undefined}
        />
      )}
    </div>
  );
}
