import { describe, it, expect, beforeEach } from 'vitest';
import { socialIntakeService } from './socialIntakeService';

describe('socialIntakeService', () => {
  beforeEach(() => {
    socialIntakeService.resetStore();
  });

  it('fetches pre-seeded social leads with realistic channels', async () => {
    const leads = await socialIntakeService.getSocialLeads();
    expect(leads.length).toBeGreaterThanOrEqual(4);
    expect(leads.some((l) => l.channel === 'meta_lead_ad')).toBe(true);
    expect(leads.some((l) => l.channel === 'viber_inquiry')).toBe(true);
  });

  it('simulates an incoming Meta Lead Ad and calculates 15-minute SLA deadline', async () => {
    const simulated = await socialIntakeService.simulateIncomingLead({
      customerName: 'Test Sim Customer',
      modelInterest: 'Toyota Fortuner 2.8 LTD',
    });

    expect(simulated.customerName).toBe('Test Sim Customer');
    expect(simulated.channel).toBe('meta_lead_ad');
    expect(simulated.slaStatus).toBe('sla_active');

    const deadlineMs = new Date(simulated.slaDeadline).getTime();
    const intakeMs = new Date(simulated.intakeTimestamp).getTime();
    expect(deadlineMs - intakeMs).toBe(15 * 60 * 1000);
  });

  it('evaluates SLA status as met when first contact occurs within 15 minutes', async () => {
    const freshLead = await socialIntakeService.simulateIncomingLead();
    const updated = await socialIntakeService.logFirstContact(
      freshLead.id,
      'viber',
      'Sent Viber brochure and amortization quotation',
      'user-agent-1',
      'Paolo Morales'
    );

    expect(updated.status).toBe('contacted');
    expect(updated.slaStatus).toBe('sla_met');
    expect(updated.firstContactChannel).toBe('viber');
  });

  it('converts an omnichannel social lead directly into a CRM pipeline lead', async () => {
    const freshLead = await socialIntakeService.simulateIncomingLead({
      customerName: 'Direct Pipeline Prospect',
      customerPhone: '+63 917 999 8888',
      modelInterest: 'Toyota Hilux GR-S',
    });

    const result = await socialIntakeService.convertSocialLeadToPipeline(
      freshLead.id,
      'user-agent-1',
      'Paolo Morales'
    );

    expect(result.socialLead.status).toBe('converted');
    expect(result.socialLead.convertedLeadId).toBe(result.pipelineLead.id);
    expect(result.pipelineLead.customerName).toBe('Direct Pipeline Prospect');
    expect(result.pipelineLead.stage).toBe('new');
  });
});
