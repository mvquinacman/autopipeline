export type ServiceBayStatus = 'checked_in' | 'in_bay' | 'inspection_complete' | 'ready_for_pickup';

export type EquityOpportunityType =
  | 'high_positive_equity'
  | 'warranty_expiring'
  | 'high_maintenance_cost'
  | 'equity_neutral';

export type PitchStatus =
  | 'uncontacted'
  | 'pitch_presented'
  | 'test_drive_scheduled'
  | 'converted_to_lead'
  | 'declined';

export interface ServiceAppointment {
  id: string;
  bayNumber: number; // e.g. Bay 1 to 6
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  currentVehicleYear: number;
  currentVehicleMake: string;
  currentVehicleModel: string;
  currentPlateNumber: string;
  mileageKm: number;
  serviceAdvisorName: string;
  serviceType: string; // e.g. "60,000 KM Major PMS + Brake Overhaul"
  estimatedRepairBill: number; // in PHP
  bayStatus: ServiceBayStatus;
  checkInTime: string;
  estimatedCompletionTime: string;

  // Buyback / Equity Analysis
  estimatedMarketValue: number; // What dealership used car desk will pay
  estimatedLoanPayoff: number; // Outstanding loan balance at bank
  netEquity: number; // Market Value - Loan Payoff
  opportunityType: EquityOpportunityType;
  warrantyStatus: 'active' | 'expiring_soon' | 'expired';

  // Upgrade Recommendation
  suggestedUpgradeModel: string;
  suggestedUpgradeMSRP: number;
  currentEstimatedMonthly: number;
  newEstimatedMonthly: number;
  monthlyDifference: number; // newEstimatedMonthly - currentEstimatedMonthly

  pitchStatus: PitchStatus;
  convertedLeadId?: string;
  pitchNotes?: string;
}

export interface ConvertServiceToLeadInput {
  appointmentId: string;
  assignedAgentId: string;
  assignedAgentName: string;
  initialNote?: string;
}

export interface ServiceDriveKpiSummary {
  activeVehiclesInService: number;
  highEquityProspectsCount: number;
  expiringWarrantyCount: number;
  totalPotentialTradeInValue: number;
  convertedLeadsCount: number;
}
