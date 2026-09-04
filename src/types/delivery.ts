export type PdiItemStatus = 'passed' | 'rectify' | 'pending';

export type PdiCategory = 'mechanical' | 'electrical' | 'exterior' | 'interior' | 'accessories';

export interface PdiChecklistItem {
  id: string;
  category: PdiCategory;
  label: string;
  description: string;
  status: PdiItemStatus;
  inspectedBy?: string;
}

export interface HandoverKitItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  verified: boolean;
}

export type DeliveryBayStatus =
  | 'scheduled'
  | 'pdi_in_progress'
  | 'pdi_ready'
  | 'ceremony_active'
  | 'released';

export interface GatePassRecord {
  passNumber: string;
  issuedAt: string;
  vehicleVin: string;
  engineNumber: string;
  conductionSticker: string;
  plateNumber?: string;
  modelDescription: string;
  customerName: string;
  escortConsultantName: string;
  securityGuardOnDuty: string;
  status: 'issued' | 'scanned_out' | 'cancelled';
  exitTimestamp?: string;
}

export interface DeliveryAppointment {
  id: string;
  bayNumber: 1 | 2 | 3;
  leadId: string;
  customerName: string;
  customerPhone: string;
  modelInterest: string;
  allocatedVehicleId?: string;
  vin: string;
  engineNumber: string;
  conductionSticker: string;
  color: string;
  salesConsultantName: string;
  scheduledTime: string;
  status: DeliveryBayStatus;
  pdiChecklist: PdiChecklistItem[];
  handoverKit: HandoverKitItem[];
  qcInspectorName: string;
  qcSignedAt?: string;
  ceremonyNotes?: string;
  ribbonColor?: 'red' | 'gold' | 'cobalt';
  gatePass?: GatePassRecord;
  csiRating?: number; // 1 to 5 stars
  csiFeedback?: string;
}

export interface DeliveryKpiSummary {
  scheduledTodayCount: number;
  pdiCompletedCount: number;
  handoverReadyCount: number;
  gatePassesIssuedCount: number;
  averageCsiScore: number;
}
