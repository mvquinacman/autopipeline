import { useMemo } from 'react';
import type { Lead } from '../types/crm';
import { analyticsService } from '../services/analyticsService';
import { formatPeso } from '../data/seed';
import { TrendingUp, AlertTriangle, ShieldCheck, Car } from 'lucide-react';

interface FunnelAnalyticsProps {
  leads: Lead[];
}

export function FunnelAnalytics({ leads }: FunnelAnalyticsProps) {
  const summary = useMemo(
    () => analyticsService.calculateFunnelAnalytics(leads),
    [leads]
  );

  return (
    <div className="space-y-6">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-line rounded-card p-3.5 space-y-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-sub">Total Intake</p>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">{summary.totalLeads}</p>
          <p className="text-[11px] text-sub">All showroom leads</p>
        </div>
        <div className="bg-card border border-line rounded-card p-3.5 space-y-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-sub">Units Released</p>
          <p className="font-display text-2xl font-bold text-won tabular-nums flex items-center gap-1.5">
            <ShieldCheck className="size-5" /> {summary.totalWon}
          </p>
          <p className="text-[11px] text-sub">Completed handovers</p>
        </div>
        <div className="bg-card border border-line rounded-card p-3.5 space-y-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-sub">Lost In Pipeline</p>
          <p className="font-display text-2xl font-bold text-overdue tabular-nums flex items-center gap-1.5">
            <AlertTriangle className="size-5" /> {summary.totalLost}
          </p>
          <p className="text-[11px] text-sub">Dropouts accounted</p>
        </div>
        <div className="bg-card border border-line rounded-card p-3.5 space-y-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-sub">Showroom Win Rate</p>
          <p className="font-display text-2xl font-bold text-cobalt tabular-nums flex items-center gap-1.5">
            <TrendingUp className="size-5" /> {summary.overallWinRate}%
          </p>
          <p className="text-[11px] text-sub">End-to-end conversion</p>
        </div>
      </div>

      {/* 7-Stage Funnel Progression */}
      <div className="bg-card border border-line rounded-card p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-ink uppercase tracking-wide">
            7-Stage Dealership Conversion Funnel
          </h3>
          <span className="text-xs text-sub font-medium">Stage-by-Stage Retention</span>
        </div>

        <div className="space-y-3">
          {summary.funnelSteps.map((step) => (
            <div key={step.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink">{step.label}</span>
                <div className="flex items-center gap-3 text-sub tabular-nums font-semibold">
                  <span>{step.count} leads</span>
                  <span className="text-ink">{step.conversionFromPrev}% pass-thru</span>
                </div>
              </div>
              <div className="h-2 w-full bg-wash rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.max(4, step.overallConversion)}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lost Reasons Breakdown */}
        <div className="bg-card border border-line rounded-card p-4 sm:p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-ink uppercase tracking-wide">
            Deal Loss Rationale &amp; Leakage
          </h3>
          {summary.lostReasons.length === 0 ? (
            <p className="text-xs text-sub">No deals marked lost.</p>
          ) : (
            <div className="space-y-2.5">
              {summary.lostReasons.map((lr) => (
                <div key={lr.reason} className="border-b border-line/60 pb-2 last:border-b-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{lr.label}</span>
                    <span className="font-bold text-overdue tabular-nums">
                      {lr.count} ({lr.percentage}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-sub tabular-nums">
                    <span>Lost Pipeline Value:</span>
                    <span className="font-semibold text-ink">{formatPeso(lr.totalLostValue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Models Demand */}
        <div className="bg-card border border-line rounded-card p-4 sm:p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-ink uppercase tracking-wide">
            Top Vehicle Model Demand
          </h3>
          <div className="space-y-2.5">
            {summary.topModels.map((m) => (
              <div key={m.model} className="border-b border-line/60 pb-2 last:border-b-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Car className="size-3.5 text-sub" /> {m.model}
                  </span>
                  <span className="font-bold text-ink tabular-nums">{m.count} inquiries</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-sub tabular-nums">
                  <span>Gross Inquiry Value:</span>
                  <span className="font-semibold text-cobalt">{formatPeso(m.totalValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
