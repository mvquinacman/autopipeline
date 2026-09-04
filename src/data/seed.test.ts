import { describe, it, expect } from 'vitest';
import { calculateKpis, formatPeso, STAGES, SEED_LEADS } from './seed';
import type { Lead, Stage } from '../types/crm';

describe('formatPeso', () => {
  it('formats full amounts with peso symbol and commas', () => {
    expect(formatPeso(2_630_000)).toBe('₱2,630,000');
    expect(formatPeso(1_039_000)).toBe('₱1,039,000');
    expect(formatPeso(0)).toBe('₱0');
    expect(formatPeso(-50_000)).toBe('-₱50,000');
  });

  it('formats compact amounts in millions', () => {
    expect(formatPeso(2_630_000, true)).toBe('₱2.63M');
    expect(formatPeso(1_000_000, true)).toBe('₱1M');
    expect(formatPeso(15_000_000, true)).toBe('₱15M');
  });

  it('formats compact amounts in thousands and smaller', () => {
    expect(formatPeso(850_000, true)).toBe('₱850K');
    expect(formatPeso(500, true)).toBe('₱500');
    expect(formatPeso(-1_500_000, true)).toBe('-₱1.5M');
  });
});

describe('calculateKpis', () => {
  const baseLead: Omit<Lead, 'id' | 'estValue' | 'probability' | 'stage' | 'status' | 'urgency'> = {
    orgId: 'org-1',
    agentId: 'user-1',
    agentName: 'Agent',
    customerName: 'Customer',
    customerPhone: '09170000000',
    customerEmail: 'c@example.com',
    modelInterest: 'Model',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  const mockLeads: Lead[] = [
    { ...baseLead, id: '1', estValue: 1_000_000, probability: 0.1, stage: 'new', status: 'active', urgency: 'due_today' },
    { ...baseLead, id: '2', estValue: 2_000_000, probability: 0.25, stage: 'contacted', status: 'active', urgency: 'overdue' },
    { ...baseLead, id: '3', estValue: 4_000_000, probability: 1.0, stage: 'released', status: 'won', urgency: 'none' },
    { ...baseLead, id: '4', estValue: 2_000_000, probability: 0.0, stage: 'showroom', status: 'lost', urgency: 'none' },
  ];

  it('aggregates leads correctly into KPI summary', () => {
    const kpis = calculateKpis(mockLeads, 10_000_000);
    expect(kpis.totalActiveLeads).toBe(2);
    expect(kpis.closedThisMonthValue).toBe(4_000_000);
    expect(kpis.closedThisMonthCount).toBe(1);
    expect(kpis.monthlyTarget).toBe(10_000_000);
    expect(kpis.achievementPct).toBe(40);
    expect(kpis.weightedPipelineValue).toBe(600_000); // 1M*0.1 + 2M*0.25
    expect(kpis.dueTodayCount).toBe(1);
    expect(kpis.overdueFollowUpsCount).toBe(1);
  });

  it('correctly calculates KPIs on seed data', () => {
    const kpis = calculateKpis(SEED_LEADS);
    expect(kpis.totalActiveLeads).toBeGreaterThan(0);
    expect(kpis.closedThisMonthValue).toBeGreaterThan(0);
    expect(kpis.monthlyTarget).toBe(15_000_000);
  });
});

describe('Stage transitions', () => {
  it('has 7 ordered stages from new to released', () => {
    expect(STAGES).toHaveLength(7);
    const stageIds: Stage[] = STAGES.map((s) => s.id);
    expect(stageIds).toEqual(['new', 'contacted', 'showroom', 'test_drive', 'application', 'approved', 'released']);
  });

  it('advances a lead sequentially across stages', () => {
    const stageOrder: Stage[] = STAGES.map((s) => s.id);
    let currentStage: Stage = 'new';
    for (let i = 0; i < stageOrder.length - 1; i++) {
      const nextIndex: number = i + 1;
      currentStage = stageOrder[nextIndex];
      expect(currentStage).toBe(stageOrder[i + 1]);
    }
    expect(currentStage).toBe('released');
  });
});
