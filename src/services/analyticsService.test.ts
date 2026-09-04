import { describe, it, expect } from 'vitest';
import { analyticsService } from './analyticsService';
import { SEED_LEADS } from '../data/seed';

describe('analyticsService - Funnel & Loss Analytics', () => {
  it('calculates funnel steps across the 7 stages', () => {
    const summary = analyticsService.calculateFunnelAnalytics(SEED_LEADS);

    expect(summary.funnelSteps).toHaveLength(7);
    expect(summary.totalLeads).toBe(SEED_LEADS.length);
    expect(summary.funnelSteps[0].stage).toBe('new');
    expect(summary.funnelSteps[6].stage).toBe('released');

    // Stage 0 conversion from previous is 100%
    expect(summary.funnelSteps[0].conversionFromPrev).toBe(100);
  });

  it('aggregates lost reasons accurately', () => {
    const summary = analyticsService.calculateFunnelAnalytics(SEED_LEADS);

    expect(summary.totalLost).toBeGreaterThan(0);
    expect(summary.lostReasons.length).toBeGreaterThan(0);

    const firstReason = summary.lostReasons[0];
    expect(firstReason.count).toBeGreaterThan(0);
    expect(firstReason.totalLostValue).toBeGreaterThan(0);
    expect(firstReason.label).toBeDefined();
  });

  it('ranks top vehicle models by lead count', () => {
    const summary = analyticsService.calculateFunnelAnalytics(SEED_LEADS);

    expect(summary.topModels.length).toBeGreaterThan(0);
    expect(summary.topModels[0].count).toBeGreaterThanOrEqual(summary.topModels[1]?.count || 0);
  });
});
