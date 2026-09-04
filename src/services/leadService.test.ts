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

      // Verify audit activity was logged automatically
      const activities = await leadService.getActivities(newLead.id);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].type).toBe('stage_change');
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

  it('enforces the multi-role scoping ladder (Agent < Manager <= Owner)', async () => {
    const allLeads = await leadService.getLeads();
    const profiles = leadService.getProfiles();

    const agent = profiles.find((p) => p.role === 'agent')!;
    const manager = profiles.find((p) => p.role === 'manager')!;
    const owner = profiles.find((p) => p.role === 'dealer_principal')!;

    const agentLeads = leadService.filterLeadsForRole(allLeads, agent);
    const managerLeads = leadService.filterLeadsForRole(allLeads, manager);
    const ownerLeads = leadService.filterLeadsForRole(allLeads, owner);

    // Agent only sees leads where they are the assigned agent
    expect(agentLeads.every((l) => l.agentId === agent.id)).toBe(true);

    // Manager sees all team leads
    expect(managerLeads.every((l) => !l.teamId || l.teamId === manager.teamId)).toBe(true);

    // Scoping Ladder hierarchy verification
    expect(agentLeads.length).toBeLessThan(managerLeads.length);
    expect(managerLeads.length).toBeLessThanOrEqual(ownerLeads.length);
    expect(ownerLeads.length).toBe(allLeads.length);
  });

  it('logs user activities and allows reassigning leads', async () => {
    const leads = await leadService.getLeads();
    const lead = leads[0];

    // Add a custom note activity
    const activity = await leadService.addActivity(
      lead.id,
      'user-agent-1',
      'Paolo Morales',
      'call',
      'Client confirmed bank pre-approval'
    );
    expect(activity.detail).toContain('Client confirmed bank pre-approval');

    // Reassign lead to another agent
    const updated = await leadService.reassignLead(
      lead.id,
      'user-agent-2',
      'Camille Dizon',
      'user-mgr-1',
      'Rafael Alcantara'
    );
    expect(updated.agentId).toBe('user-agent-2');
    expect(updated.agentName).toBe('Camille Dizon');

    // Verify reassignment is recorded in activities
    const activities = await leadService.getActivities(lead.id);
    expect(activities.some((a) => a.detail.includes('Reassigned lead from'))).toBe(true);
  });
});
