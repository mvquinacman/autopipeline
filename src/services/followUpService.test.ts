import { describe, it, expect, beforeEach } from 'vitest';
import { leadService } from './leadService';
import { SEED_PROFILES } from '../data/seed';

describe('leadService - Follow-up Operations', () => {
  beforeEach(() => {
    leadService.resetMockStore();
  });

  it('fetches all initial follow-ups', async () => {
    const followUps = await leadService.getFollowUps();
    expect(followUps.length).toBeGreaterThan(0);
    expect(followUps[0]).toHaveProperty('status');
  });

  it('enriches follow-ups with lead metadata and escalation flags', async () => {
    const enriched = await leadService.getEnrichedFollowUps();
    expect(enriched.length).toBeGreaterThan(0);

    const first = enriched[0];
    expect(first).toHaveProperty('customerName');
    expect(first).toHaveProperty('modelInterest');
    expect(first).toHaveProperty('isEscalated');
    expect(typeof first.isEscalated).toBe('boolean');
  });

  it('scopes follow-ups to an agent role', async () => {
    const agentProfile = SEED_PROFILES.find((p) => p.role === 'agent')!;
    const agentFollowUps = await leadService.getEnrichedFollowUps(agentProfile);

    for (const fu of agentFollowUps) {
      expect(fu.agentId).toBe(agentProfile.id);
    }
  });

  it('completes a follow-up and logs an activity event', async () => {
    const followUps = await leadService.getFollowUps();
    const target = followUps[0];

    const completed = await leadService.completeFollowUp(
      target.id,
      'user-agent-1',
      'Paolo Morales',
      'Client confirmed bank pre-approval'
    );

    expect(completed.status).toBe('done');

    const activities = await leadService.getActivities(target.leadId);
    expect(activities.some((a) => a.detail.includes('Completed follow-up'))).toBe(true);
  });

  it('reschedules a follow-up to a future date', async () => {
    const followUps = await leadService.getFollowUps();
    const target = followUps[0];
    const newDate = '2026-09-10T10:00:00Z';

    const rescheduled = await leadService.rescheduleFollowUp(
      target.id,
      newDate,
      'user-agent-1',
      'Paolo Morales',
      'Customer requested weekend callback'
    );

    expect(rescheduled.dueDate).toBe(newDate);
    expect(rescheduled.status).toBe('pending');

    const activities = await leadService.getActivities(target.leadId);
    expect(activities.some((a) => a.detail.includes('Rescheduled follow-up'))).toBe(true);
  });

  it('creates a new follow-up for a lead', async () => {
    const newFu = await leadService.createFollowUp(
      'lead-01',
      '2026-09-08T14:00:00Z',
      'Send color brochure options',
      'user-agent-1',
      'Paolo Morales'
    );

    expect(newFu.id).toBeDefined();
    expect(newFu.note).toBe('Send color brochure options');

    const all = await leadService.getFollowUps();
    expect(all.some((f) => f.id === newFu.id)).toBe(true);
  });
});
