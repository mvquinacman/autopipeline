export type SocialChannel = 'meta_lead_ad' | 'viber_inquiry' | 'website_form';

export type SlaStatus = 'sla_active' | 'sla_breached' | 'sla_met';

export interface SocialLead {
  id: string;
  channel: SocialChannel;
  campaignName?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  modelInterest: string;
  preferredFinancing: 'financing' | 'cash';
  downpaymentBudget?: string;
  customerMessage?: string;
  intakeTimestamp: string;
  slaDeadline: string;
  slaStatus: SlaStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  firstContactTimestamp?: string;
  firstContactChannel?: 'call' | 'viber' | 'sms';
  convertedLeadId?: string;
  status: 'unclaimed' | 'contacted' | 'converted' | 'dismissed';
}

export interface SocialIntakeKpiSummary {
  totalInquiriesToday: number;
  slaMetPercentage: number;
  slaBreachedCount: number;
  averageResponseMinutes: number;
  pendingResponseCount: number;
}
