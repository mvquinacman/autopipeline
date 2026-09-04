import { formatPeso } from '../data/seed';
import type { KpiSummary } from '../types/crm';

interface KpiStripProps {
  kpis: KpiSummary;
}

export function KpiStrip({ kpis }: KpiStripProps) {
  const items = [
    {
      label: 'Monthly Target',
      value: formatPeso(kpis.monthlyTarget, true),
      sub: 'Showroom quota',
      isOverdue: false,
    },
    {
      label: 'Closed MTD',
      value: formatPeso(kpis.closedThisMonthValue, true),
      sub: `${kpis.closedThisMonthCount} ${kpis.closedThisMonthCount === 1 ? 'unit' : 'units'} closed`,
      isOverdue: false,
    },
    {
      label: 'Achievement %',
      value: `${kpis.achievementPct}%`,
      sub: 'Of monthly target',
      isOverdue: false,
    },
    {
      label: 'Weighted Pipeline',
      value: formatPeso(kpis.weightedPipelineValue, true),
      sub: 'Probability-adjusted',
      isOverdue: false,
    },
    {
      label: 'Due Today',
      value: `${kpis.dueTodayCount}`,
      sub: `${kpis.dueTodayCount} follow-ups`,
      isOverdue: false,
    },
    {
      label: 'Overdue',
      value: `${kpis.overdueFollowUpsCount}`,
      sub: `${kpis.overdueFollowUpsCount} overdue`,
      isOverdue: kpis.overdueFollowUpsCount > 0,
    },
  ];

  return (
    <section aria-label="Key Performance Indicators">
      <div className="bg-card border border-line rounded-card divide-y md:divide-y-0 md:divide-x divide-line grid grid-cols-2 md:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="p-4 flex flex-col justify-between min-h-[90px]">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold">
              {item.label}
            </span>
            <div className="my-1">
              <span
                className={`font-display text-[30px] font-bold tabular-nums leading-tight ${
                  item.isOverdue ? 'text-overdue' : 'text-ink'
                }`}
              >
                {item.value}
              </span>
            </div>
            <span className="text-[11px] text-sub">
              {item.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
