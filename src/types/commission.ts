export type CommissionTier = 'entry' | 'crossover' | 'suv_mid' | 'premium';

export type CommissionStatus = 'pending_release' | 'ready_for_payout' | 'gsm_approved' | 'paid';

export interface BankReserveSplit {
  totalReserve: number;
  agentShare: number;      // 20%
  fiShare: number;         // 30%
  dealershipShare: number; // 50%
}

export interface CommissionRecord {
  id: string;
  leadId: string;
  customerName: string;
  vehicleModel: string;
  variant: string;
  vin: string;
  salesConsultantId: string;
  salesConsultantName: string;
  fiSpecialistId?: string;
  fiSpecialistName?: string;
  dealValue: number;
  baseUnitCommission: number;
  bankFinancingReserveTotal: number;
  bankReserveSplit: BankReserveSplit;
  accessoriesCommission: number;
  serviceDriveSpotterBounty: number;
  totalAgentPayout: number;
  gsmOverrideAmount: number;
  status: CommissionStatus;
  payoutDueDate: string;
  approvedAt?: string;
  approvedBy?: string;
  paidAt?: string;
  createdAt: string;
}

export interface CommissionKpiSummary {
  mtdEarnedAgent: number;
  pendingReleaseValue: number;
  approvedPayoutValue: number;
  totalDealershipPayroll: number;
  dealsCount: number;
}
