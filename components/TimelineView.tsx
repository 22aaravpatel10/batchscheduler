'use client';

import { Batch, Equipment } from '@/lib/types';
import StatusBadge from './StatusBadge';
import { format, isSameDay, startOfDay, endOfDay, addDays, differenceInMinutes } from 'date-fns';
import { useState } from 'react';

interface TimelineViewProps {
  batches: Batch[];
  equipment: Equipment[];
  onBatchClick: (batch: Batch) => void;
  viewDate: Date;
}

export default function TimelineView({ batches, equipment, onBatchClick, viewDate }: TimelineViewProps) {
  const [daysToShow, setDaysToShow] = useState(7);

  // Generate days to show
  const days = Array.from({ length: daysToShow }, (_, i) => addDays(viewDate, i));

  // Calculate time range (show 24 hours)
  const dayStart = new Date(viewDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(viewDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Group batches by equipment
  const getBatchesForEquipment = (equipmentId: string) => {
    return batches.filter(b => b.equipmentId === equipmentId);
  };

  // Calculate position and width for batch in timeline
  const getBatchPosition = (batch: Batch, dayIndex: number) => {
    const batchStart = new Date(batch.startTime);
    const batchEnd = new Date(batch.endTime);
    const currentDay = days[dayIndex];
    const dayStart = new Date(currentDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDay);
    dayEnd.setHours(23, 59, 59, 999);

    // Check if batch overlaps with this day
    if (batchEnd < dayStart || batchStart > dayEnd) {
      return null;
    }

    // Calculate start position (0-100%)
    const effectiveStart = batchStart < dayStart ? dayStart : batchStart;
    const effectiveEnd = batchEnd > dayEnd ? dayEnd : batchEnd;

    const minutesFromDayStart = differenceInMinutes(effectiveStart, dayStart);
    const totalMinutesInDay = 24 * 60;
    const left = (minutesFromDayStart / totalMinutesInDay) * 100;

    // Calculate width
    const durationMinutes = differenceInMinutes(effectiveEnd, effectiveStart);
    const width = (durationMinutes / totalMinutesInDay) * 100;

    return { left, width };
  };

  if (equipment.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No equipment available. Please add equipment to see the timeline view.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header Controls */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setDaysToShow(1)}
            className={`px-3 py-1 text-sm rounded ${daysToShow === 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Day
          </button>
          <button
            onClick={() => setDaysToShow(3)}
            className={`px-3 py-1 text-sm rounded ${daysToShow === 3 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            3 Days
          </button>
          <button
            onClick={() => setDaysToShow(7)}
            className={`px-3 py-1 text-sm rounded ${daysToShow === 7 ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Week
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {format(days[0], 'MMM d')} - {format(days[days.length - 1], 'MMM d, yyyy')}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Day Headers */}
          <div className="grid border-b" style={{ gridTemplateColumns: '200px repeat(' + daysToShow + ', 1fr)' }}>
            <div className="p-3 font-semibold text-gray-700 border-r bg-gray-50">Equipment</div>
            {days.map((day, i) => (
              <div key={i} className="p-3 text-center font-medium text-gray-700 border-r bg-gray-50">
                <div>{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
                <div className="text-xs text-gray-500">{format(day, 'MMM')}</div>
              </div>
            ))}
          </div>

          {/* Equipment Rows */}
          {equipment.map((equip) => {
            const equipBatches = getBatchesForEquipment(equip.id);

            return (
              <div
                key={equip.id}
                className="grid border-b hover:bg-gray-50"
                style={{ gridTemplateColumns: '200px repeat(' + daysToShow + ', 1fr)' }}
              >
                {/* Equipment Name Column */}
                <div className="p-3 border-r bg-white sticky left-0">
                  <div className="font-medium text-gray-900">{equip.name}</div>
                  {equip.equipmentId && (
                    <div className="text-xs text-gray-500">{equip.equipmentId}</div>
                  )}
                  {equip.size && (
                    <div className="text-xs text-gray-500">{equip.size}</div>
                  )}
                </div>

                {/* Day Columns */}
                {days.map((day, dayIndex) => {
                  const dayBatches = equipBatches.filter(batch => {
                    const batchStart = new Date(batch.startTime);
                    const batchEnd = new Date(batch.endTime);
                    const dayStart = startOfDay(day);
                    const dayEnd = endOfDay(day);
                    return batchEnd >= dayStart && batchStart <= dayEnd;
                  });

                  return (
                    <div key={dayIndex} className="border-r relative min-h-[80px] p-1">
                      {dayBatches.map((batch) => {
                        const position = getBatchPosition(batch, dayIndex);
                        if (!position) return null;

                        const statusColors: Record<string, string> = {
                          PLANNED: 'bg-teal-500',
                          IN_PROGRESS: 'bg-yellow-500',
                          COMPLETED: 'bg-green-500',
                          DELAYED: 'bg-red-500',
                          ON_HOLD: 'bg-gray-500',
                          CANCELLED: 'bg-slate-400',
                        };

                        return (
                          <div
                            key={batch.id}
                            onClick={() => onBatchClick(batch)}
                            className={`absolute top-1 h-16 ${statusColors[batch.status]} text-white text-xs p-1 rounded cursor-pointer hover:opacity-90 overflow-hidden`}
                            style={{
                              left: `${position.left}%`,
                              width: `${position.width}%`,
                              minWidth: '40px'
                            }}
                            title={`${batch.name}\n${format(new Date(batch.startTime), 'HH:mm')} - ${format(new Date(batch.endTime), 'HH:mm')}`}
                          >
                            <div className="font-semibold truncate">{batch.name}</div>
                            {batch.reactionStepName && (
                              <div className="text-[10px] truncate opacity-90">{batch.reactionStepName}</div>
                            )}
                            <div className="text-[10px]">
                              {format(new Date(batch.startTime), 'HH:mm')} - {format(new Date(batch.endTime), 'HH:mm')}
                            </div>
                          </div>
                        );
                      })}

                      {/* Time grid lines (every 6 hours) */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[25, 50, 75].map((percent) => (
                          <div
                            key={percent}
                            className="absolute top-0 bottom-0 border-l border-gray-200"
                            style={{ left: `${percent}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-500 rounded"></div>
            <span>Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Delayed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span>On Hold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-400 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
