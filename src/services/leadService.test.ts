import { describe, it, expect, beforeEach } from 'vitest';
import { leadService } from './leadService';

describe('LeadService Operations & State Machine', () => {
  beforeEach(() => {
    leadService.resetMockStore();
  });

  it('fetches initial active leads', async () => {
    const leads = await leadService.getLeads();
    expect(leads.length).toBeGreaterThan(0);
  });

  it('advances a lead stage sequentially and updates probability', async () => {
    const leads = await leadService.getLeads();
    const newLead = leads.find((l) => l.stage === 'new');
    expect(newLead).toBeDefined();

    if (newLead) {
      const initialProb = newLead.probability;
      const updated = await leadService.advanceStage(newLead.id, 'Customer scheduled showroom visit');

      expect(updated.stage).toBe('contacted');
      expect(updated.probability).toBeGreaterThan(initialProb);
    }
  });

  it('regresses a lead stage backward upon request', async () => {
    const leads = await leadService.getLeads();
    const showroomLead = leads.find((l) => l.stage === 'showroom');
    expect(showroomLead).toBeDefined();

    if (showroomLead) {
      const updated = await leadService.transitionLead({
        leadId: showroomLead.id,
        action: 'regress',
        note: 'Customer wants to revisit brochure specs first',
      });

      expect(updated.stage).toBe('contacted');
    }
  });

  it('marks a lead as lost with lostReason', async () => {
    const leads = await leadService.getLeads();
    const activeLead = leads.find((l) => l.status === 'active');
    expect(activeLead).toBeDefined();

    if (activeLead) {
      const updated = await leadService.transitionLead({
        leadId: activeLead.id,
        action: 'lost',
        lostReason: 'financing_declined',
        note: 'Bank disapproved financing application',
      });

      expect(updated.status).toBe('lost');
      expect(updated.lostReason).toBe('financing_declined');
    }
  });

  it('detects duplicate lead by phone number', async () => {
    const leads = await leadService.getLeads();
    const existing = leads[0];

    // Check with exact same phone
    const check1 = await leadService.checkDuplicate(existing.customerPhone);
    expect(check1.isDuplicate).toBe(true);
    expect(check1.existingLead?.customerName).toBe(existing.customerName);

    // Check with formatted variations of same digits
    const check2 = await leadService.checkDuplicate(
      existing.customerPhone.replace(/\s/g, '').replace('+', '')
    );
    expect(check2.isDuplicate).toBe(true);

    // Check with completely different number
    const check3 = await leadService.checkDuplicate('+63 999 000 9999');
    expect(check3.isDuplicate).toBe(false);
  });
});
