export type Stage =
  | 'new'
  | 'attempting_contact'
  | 'contacted'
  | 'interested'
  | 'quotation_sent'
  | 'application'
  | 'processing'
  | 'released'
  | 'showroom'
  | 'test_drive'
  | 'approved';

export type LeadStatus = 'active' | 'won' | 'lost' | 'nurture';

export type LostReason =
  | 'bought_elsewhere'
  | 'unresponsive'
  | 'financing_declined'
  | 'budget'
  | 'other';

export type Urgency = 'overdue' | 'due_today' | 'upcoming' | 'none';

export type Role = 'agent' | 'manager' | 'dealer_principal';

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  orgId: string;
  teamId?: string;
  targetValue?: number;
  avatarUrl?: string;
}

export interface Lead {
  id: string;
  orgId: string;
  teamId?: string;
  agentId: string;
  agentName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  modelInterest: string;
  source?: string;
  estValue: number;
  probability: number;
  stage: Stage;
  status: LeadStatus;
  lostReason?: LostReason;
  notes?: string;
  followUpDue?: string;
  urgency: Urgency;
  contactAttempts?: number;
  lastActivity?: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  transactionType?: 'cash' | 'financing';
  processingStatus?: 'bank_processing' | 'bank_approved' | 'bank_denied' | 'reservation_paid';
  milestones?: {
    showroomVisited?: boolean;
    testDriveCompleted?: boolean;
  };
  tradeInId?: string;
  netTradeInEquity?: number;
  allocatedVehicleId?: string;
  allocatedVin?: string;
  reservationDeposit?: number;
  reservationExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  actorId: string;
  actorName: string;
  type: 'stage_change' | 'call' | 'note' | 'test_drive' | 'quote' | 'trade_in' | 'viber' | 'milestone';
  detail: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  agentId: string;
  dueDate: string;
  status: 'pending' | 'done' | 'missed';
  note: string;
}

export interface FollowUpWithLead extends FollowUp {
  customerName: string;
  customerPhone: string;
  modelInterest: string;
  leadStage: Stage;
  agentName: string;
  isEscalated?: boolean;
}

export interface KpiSummary {
  totalActiveLeads: number;
  closedThisMonthValue: number;
  closedThisMonthCount: number;
  monthlyTarget: number;
  achievementPct: number;
  weightedPipelineValue: number;
  overdueFollowUpsCount: number;
  dueTodayCount: number;
}

export interface StageConfig {
  id: Stage;
  label: string;
  color: string;
  order: number;
}

export interface AgentMatrixRow {
  agentId: string;
  agentName: string;
  avatarUrl?: string;
  newCount: number;
  notContactedCount: number;
  dueTodayCount: number;
  overdueCount: number;
  interestedCount: number;
  applicationsCount: number;
  releasedCount: number;
}
