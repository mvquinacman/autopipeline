export type VehicleStockStatus = 'in_stock' | 'in_transit' | 'reserved' | 'released';

export interface VehicleStock {
  id: string;
  vin: string;
  engineNumber: string;
  model: string;
  variant: string;
  color: string;
  interiorColor: string;
  year: number;
  msrp: number;
  status: VehicleStockStatus;
  lotLocation: string;
  daysInStock: number;
  allocatedLeadId?: string;
  allocatedCustomerName?: string;
  allocatedAgentId?: string;
  allocatedAgentName?: string;
  reservationDeposit?: number;
  reservationExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryKpiSummary {
  totalUnits: number;
  inStockCount: number;
  reservedCount: number;
  inTransitCount: number;
  agedUnitsCount: number; // > 60 days on lot
  totalInventoryValue: number;
}

export interface ReserveVehicleInput {
  vehicleId: string;
  leadId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  depositAmount?: number;
  durationHours?: number;
}

export interface InventoryFilter {
  status?: VehicleStockStatus | 'all' | 'aged';
  model?: string;
  search?: string;
}
