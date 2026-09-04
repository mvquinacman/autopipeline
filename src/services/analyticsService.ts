import { Lead, LostReason, Stage } from '../types/crm';
import { STAGES } from '../data/seed';

export interface StageFunnelStep {
  stage: Stage;
  label: string;
  color: string;
  count: number;
  conversionFromPrev: number; // percentage (0-100)
  overallConversion: number; // percentage from stage 1
}

export interface LostReasonMetric {
  reason: LostReason;
  label: string;
  count: number;
  totalLostValue: number;
  percentage: number;
}

export interface ModelDemandMetric {
  model: string;
  count: number;
  totalValue: number;
}

export interface FunnelAnalyticsSummary {
  funnelSteps: StageFunnelStep[];
  totalLeads: number;
  totalWon: number;
  totalLost: number;
  overallWinRate: number;
  lostReasons: LostReasonMetric[];
  topModels: ModelDemandMetric[];
}

const LOST_REASON_LABELS: Record<LostReason, string> = {
  bought_elsewhere: 'Bought Elsewhere (Competitor)',
  financing_declined: 'Bank Financing Declined',
  unresponsive: 'Unresponsive / Ghosted',
  budget: 'Budget / Price Constraint',
  other: 'Other Dealership Reason',
};

export const analyticsService = {
  /**
   * Computes comprehensive funnel drop-off and conversion rates
   */
  calculateFunnelAnalytics(leads: Lead[]): FunnelAnalyticsSummary {
    const totalLeads = leads.length;
    const wonLeads = leads.filter((l) => l.status === 'won' || l.stage === 'released');
    const lostLeads = leads.filter((l) => l.status === 'lost');

    const stageOrder: Stage[] = STAGES.map((s) => s.id);

    // Calculate stage reach: A lead currently at stage S had to pass all previous stages
    const funnelSteps: StageFunnelStep[] = STAGES.map((cfg, idx) => {
      // Leads currently in this stage or any subsequent stage, or won (which reached released)
      const count = leads.filter((l) => {
        const leadIdx = stageOrder.indexOf(l.stage);
        if (l.status === 'won' || l.stage === 'released') return true;
        return leadIdx >= idx;
      }).length;

      const prevCount = idx === 0 ? totalLeads : leads.filter((l) => {
        const leadIdx = stageOrder.indexOf(l.stage);
        if (l.status === 'won' || l.stage === 'released') return true;
        return leadIdx >= idx - 1;
      }).length;

      const conversionFromPrev = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
      const overallConversion = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

      return {
        stage: cfg.id,
        label: cfg.label,
        color: cfg.color,
        count,
        conversionFromPrev: idx === 0 ? 100 : conversionFromPrev,
        overallConversion,
      };
    });

    // Calculate lost reasons breakdown
    const lostReasonCounts = new Map<LostReason, { count: number; value: number }>();
    for (const lead of lostLeads) {
      const reason = lead.lostReason || 'other';
      const existing = lostReasonCounts.get(reason) || { count: 0, value: 0 };
      lostReasonCounts.set(reason, {
        count: existing.count + 1,
        value: existing.value + lead.estValue,
      });
    }

    const lostReasons: LostReasonMetric[] = Array.from(lostReasonCounts.entries())
      .map(([reason, data]) => ({
        reason,
        label: LOST_REASON_LABELS[reason] || reason,
        count: data.count,
        totalLostValue: data.value,
        percentage: lostLeads.length > 0 ? Math.round((data.count / lostLeads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Top models
    const modelCounts = new Map<string, { count: number; value: number }>();
    for (const lead of leads) {
      const existing = modelCounts.get(lead.modelInterest) || { count: 0, value: 0 };
      modelCounts.set(lead.modelInterest, {
        count: existing.count + 1,
        value: existing.value + lead.estValue,
      });
    }

    const topModels: ModelDemandMetric[] = Array.from(modelCounts.entries())
      .map(([model, data]) => ({
        model,
        count: data.count,
        totalValue: data.value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const overallWinRate =
      totalLeads > 0 ? Math.round((wonLeads.length / totalLeads) * 100) : 0;

    return {
      funnelSteps,
      totalLeads,
      totalWon: wonLeads.length,
      totalLost: lostLeads.length,
      overallWinRate,
      lostReasons,
      topModels,
    };
  },
};
