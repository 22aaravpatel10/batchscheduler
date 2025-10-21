// Type definitions for the application

export type BatchStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'ON_HOLD'
  | 'CANCELLED';

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  batches?: Batch[];
}

export interface Material {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BatchMaterial {
  id: string;
  batchId: string;
  materialId: string;
  quantity: number;
  material?: Material;
}

export interface Batch {
  id: string;
  name: string;
  equipmentId: string;
  equipment?: Equipment;
  startTime: Date | string;
  endTime: Date | string;
  status: BatchStatus;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  materials?: BatchMaterial[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Batch;
}

// Color mapping for batch statuses
export const statusColors: Record<BatchStatus, string> = {
  PLANNED: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  COMPLETED: 'bg-green-500',
  DELAYED: 'bg-red-500',
  ON_HOLD: 'bg-gray-500',
  CANCELLED: 'bg-slate-400',
};

export const statusBorderColors: Record<BatchStatus, string> = {
  PLANNED: 'border-blue-600',
  IN_PROGRESS: 'border-yellow-600',
  COMPLETED: 'border-green-600',
  DELAYED: 'border-red-600',
  ON_HOLD: 'border-gray-600',
  CANCELLED: 'border-slate-500',
};

export const statusTextColors: Record<BatchStatus, string> = {
  PLANNED: 'text-blue-700',
  IN_PROGRESS: 'text-yellow-700',
  COMPLETED: 'text-green-700',
  DELAYED: 'text-red-700',
  ON_HOLD: 'text-gray-700',
  CANCELLED: 'text-slate-700',
};
