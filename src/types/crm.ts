export type Stage =
  | 'new'
  | 'contacted'
  | 'showroom'
  | 'test_drive'
  | 'application'
  | 'approved'
  | 'released';

export type LeadStatus = 'active' | 'won' | 'lost';

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
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  actorId: string;
  actorName: string;
  type: 'stage_change' | 'call' | 'note' | 'test_drive' | 'quote';
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
