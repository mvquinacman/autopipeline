import type { LoanTerm, DownPaymentPercent } from './financing';
export type { LoanTerm, DownPaymentPercent };

export type BankApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'conditionally_approved'
  | 'approved'
  | 'declined'
  | 'accepted';

export interface LoanOfficerContact {
  name: string;
  phone: string;
  email: string;
}

export interface PartnerBank {
  id: string;
  name: string;
  shortName: string;
  accentColor: string; // token reference or styling badge
  averageTurnaroundHours: number;
  approvalRatePct: number;
  defaultCommissionPct: number; // e.g. 2.0 = 2.0% of loan amount
  rates: Record<LoanTerm, number>; // annual rates, e.g. 60: 9.2
  promos: string[];
  loanOfficer: LoanOfficerContact;
}

export interface BankOffer {
  id: string;
  leadId: string;
  bankId: string;
  bankName: string;
  status: BankApplicationStatus;
  submittedAt: string;
  decidedAt?: string;
  vehiclePrice: number;
  loanAmount: number;
  downPaymentPercent: DownPaymentPercent;
  downPaymentAmount: number;
  termMonths: LoanTerm;
  interestRate: number;
  monthlyAmortization: number;
  dealerCommissionRate: number; // e.g. 2.0%
  dealerCommissionAmount: number; // calculated in PHP
  promos: string[];
  conditions?: string; // e.g. "Requires co-maker with ₱80k gross income"
  declineReason?: string; // e.g. "Adverse CMAP record"
  purchaseOrderNumber?: string; // e.g. "PO-BPI-2026-8912"
}

export interface SubmitApplicationInput {
  leadId: string;
  bankId: string;
  vehiclePrice: number;
  downPaymentPercent: DownPaymentPercent;
  termMonths: LoanTerm;
}

export interface FiKpiSummary {
  totalApplications: number;
  totalUnderwritingVolume: number;
  approvedCount: number;
  approvedValue: number;
  averageTurnaroundHours: number;
  projectedDealerCommission: number;
}
