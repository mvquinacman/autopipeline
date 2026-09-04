import React from 'react';
import type { SocialIntakeKpiSummary } from '../../types/socialIntake';

interface SocialKpiStripProps {
  kpis: SocialIntakeKpiSummary;
}

export const SocialKpiStrip: React.FC<SocialKpiStripProps> = ({ kpis }) => {
  return (
    <div className="bg-card border border-line rounded-card divide-y md:divide-y-0 md:divide-x divide-line grid grid-cols-2 md:grid-cols-4 shadow-sm">
      <div className="p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">Today's Inquiries</span>
        <span className="font-display text-2xl font-bold text-ink tabular-nums block">{kpis.totalInquiriesToday}</span>
        <span className="text-[10.5px] text-sub">{kpis.pendingResponseCount} pending outreach</span>
      </div>
      <div className="p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">15-Min SLA Compliance</span>
        <span className="font-display text-2xl font-bold text-won tabular-nums block">{kpis.slaMetPercentage}%</span>
        <span className="text-[10.5px] text-sub">Target: &gt;90% within SLA</span>
      </div>
      <div className="p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">SLA Breached</span>
        <span className={`font-display text-2xl font-bold tabular-nums block ${kpis.slaBreachedCount > 0 ? 'text-overdue' : 'text-ink'}`}>
          {kpis.slaBreachedCount}
        </span>
        <span className="text-[10.5px] text-sub">Elapsed &gt;15 mins</span>
      </div>
      <div className="p-4 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">Avg First Response</span>
        <span className="font-display text-2xl font-bold text-cobalt tabular-nums block">{kpis.averageResponseMinutes}m</span>
        <span className="text-[10.5px] text-won font-medium">BGC Dealership Floor SLA</span>
      </div>
    </div>
  );
};
