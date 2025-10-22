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
  equipmentId: string | null;
  size: string | null;
  manufacturer: string | null;
  materialOfConstruction: string | null;
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

  // FDA 21 CFR Part 211 Requirements
  casNumber: string | null;
  lotNumber: string | null;
  supplierName: string | null;
  supplierLotNumber: string | null;
  receivedDate: Date | string | null;
  expirationDate: Date | string | null;
  storageLocation: string | null;
  storageConditions: string | null;

  // OSHA HazCom & GHS Requirements
  ghsClassification: string | null;
  hazardCategory: string | null;
  signalWord: string | null;
  hazardStatements: string | null;
  precautionaryStatements: string | null;
  pictograms: string | null;
  sdsFileName: string | null;
  sdsLastUpdated: Date | string | null;

  // Additional Safety Information
  isHazardous: boolean;
  requiresPPE: string | null;
  firstAidMeasures: string | null;
  disposalProcedure: string | null;

  // Quality Control
  qcStatus: string | null;
  qcApprovedBy: string | null;
  qcApprovedDate: Date | string | null;

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
  reactionStepId: string | null;
  reactionStepName: string | null;
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

// Color mapping for batch statuses (teal-themed)
export const statusColors: Record<BatchStatus, string> = {
  PLANNED: 'bg-teal-500',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-emerald-500',
  DELAYED: 'bg-rose-500',
  ON_HOLD: 'bg-slate-500',
  CANCELLED: 'bg-gray-400',
};

export const statusBorderColors: Record<BatchStatus, string> = {
  PLANNED: 'border-teal-600',
  IN_PROGRESS: 'border-amber-600',
  COMPLETED: 'border-emerald-600',
  DELAYED: 'border-rose-600',
  ON_HOLD: 'border-slate-600',
  CANCELLED: 'border-gray-500',
};

export const statusTextColors: Record<BatchStatus, string> = {
  PLANNED: 'text-teal-700',
  IN_PROGRESS: 'text-amber-700',
  COMPLETED: 'text-emerald-700',
  DELAYED: 'text-rose-700',
  ON_HOLD: 'text-slate-700',
  CANCELLED: 'text-gray-700',
};
