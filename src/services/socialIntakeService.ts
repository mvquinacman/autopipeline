import { SEED_SOCIAL_LEADS } from '../data/seedSocialIntake';
import type { SocialLead, SocialIntakeKpiSummary } from '../types/socialIntake';
import { upSystemService } from './upSystemService';
import { leadService } from './leadService';
import type { Lead } from '../types/crm';

let socialLeadsStore: SocialLead[] = JSON.parse(JSON.stringify(SEED_SOCIAL_LEADS));

export const socialIntakeService = {
  async getSocialLeads(): Promise<SocialLead[]> {
    return [...socialLeadsStore];
  },

  async simulateIncomingLead(custom?: Partial<SocialLead>): Promise<SocialLead> {
    const nextAgent = upSystemService.getNextUpAgent();
    const now = Date.now();
    const slaDeadline = new Date(now + 15 * 60 * 1000).toISOString();

    const newLead: SocialLead = {
      id: `soc-${now}`,
      channel: custom?.channel || 'meta_lead_ad',
      campaignName: custom?.campaignName || 'Meta Ad: Hilux Zero Downpayment Promo',
      customerName: custom?.customerName || 'Marco Antonio Solis',
      customerPhone: custom?.customerPhone || '+63 917 654 3210',
      customerEmail: custom?.customerEmail || 'marco.solis@gmail.com',
      modelInterest: custom?.modelInterest || 'Toyota Hilux GR-S',
      preferredFinancing: custom?.preferredFinancing || 'financing',
      downpaymentBudget: custom?.downpaymentBudget || '20% Downpayment',
      customerMessage: custom?.customerMessage || 'Interested in bank PO approval and trade-in evaluation.',
      intakeTimestamp: new Date(now).toISOString(),
      slaDeadline,
      slaStatus: 'sla_active',
      assignedAgentId: custom?.assignedAgentId || nextAgent?.agentId || 'user-agent-1',
      assignedAgentName: custom?.assignedAgentName || nextAgent?.agentName || 'Paolo Morales',
      status: 'unclaimed',
    };

    socialLeadsStore = [newLead, ...socialLeadsStore];
    return newLead;
  },

  async claimSocialLead(id: string, agentId: string, agentName: string): Promise<SocialLead> {
    const index = socialLeadsStore.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Social lead not found');

    const updated: SocialLead = {
      ...socialLeadsStore[index],
      assignedAgentId: agentId,
      assignedAgentName: agentName,
    };
    socialLeadsStore[index] = updated;
    return updated;
  },

  async reassignSocialLead(id: string, agentId: string, agentName: string): Promise<SocialLead> {
    return this.claimSocialLead(id, agentId, agentName);
  },

  async logFirstContact(
    id: string,
    channel: 'call' | 'viber' | 'sms',
    _note: string,
    agentId: string,
    agentName: string
  ): Promise<SocialLead> {
    const index = socialLeadsStore.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Social lead not found');

    const current = socialLeadsStore[index];
    const now = Date.now();
    const isWithinSla = now <= new Date(current.slaDeadline).getTime();

    const updated: SocialLead = {
      ...current,
      assignedAgentId: agentId,
      assignedAgentName: agentName,
      firstContactTimestamp: new Date(now).toISOString(),
      firstContactChannel: channel,
      slaStatus: isWithinSla ? 'sla_met' : 'sla_breached',
      status: 'contacted',
    };

    socialLeadsStore[index] = updated;
    return updated;
  },

  async convertSocialLeadToPipeline(
    id: string,
    agentId: string,
    agentName: string
  ): Promise<{ socialLead: SocialLead; pipelineLead: Lead }> {
    const index = socialLeadsStore.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Social lead not found');

    const item = socialLeadsStore[index];

    // Create lead in CRM
    const pipelineLead = await leadService.createLead(
      {
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        customerEmail: item.customerEmail,
        modelInterest: item.modelInterest,
        estValue: 2_000_000,
        source: item.channel,
        notes: `Converted from ${item.channel} (${item.campaignName || 'Organic'}). Inquiry: ${item.customerMessage || 'N/A'}`,
      },
      agentId,
      agentName
    );

    const updatedSocial: SocialLead = {
      ...item,
      status: 'converted',
      convertedLeadId: pipelineLead.id,
      assignedAgentId: agentId,
      assignedAgentName: agentName,
    };

    socialLeadsStore[index] = updatedSocial;
    return { socialLead: updatedSocial, pipelineLead };
  },

  getKpis(leads: SocialLead[]): SocialIntakeKpiSummary {
    const totalInquiriesToday = leads.length;
    const metCount = leads.filter((l) => l.slaStatus === 'sla_met').length;
    const breachedCount = leads.filter((l) => {
      if (l.slaStatus === 'sla_breached') return true;
      if (l.slaStatus === 'sla_active' && Date.now() > new Date(l.slaDeadline).getTime()) return true;
      return false;
    }).length;

    const resolvedTotal = metCount + breachedCount;
    const slaMetPercentage = resolvedTotal > 0 ? Math.round((metCount / resolvedTotal) * 100) : 100;

    const pendingResponseCount = leads.filter((l) => l.status === 'unclaimed').length;

    return {
      totalInquiriesToday,
      slaMetPercentage,
      slaBreachedCount: breachedCount,
      averageResponseMinutes: 6.4,
      pendingResponseCount,
    };
  },

  resetStore(): void {
    socialLeadsStore = JSON.parse(JSON.stringify(SEED_SOCIAL_LEADS));
  },
};
