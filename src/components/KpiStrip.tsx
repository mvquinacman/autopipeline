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
      <div className="bg-line border border-line rounded-card overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px">
        {items.map((item) => (
          <div key={item.label} className="bg-card p-3 sm:p-4 flex flex-col justify-between min-h-[85px] sm:min-h-[90px]">
            <span className="text-[10.5px] sm:text-[11px] uppercase text-sub tracking-wider font-semibold truncate" title={item.label}>
              {item.label}
            </span>
            <div className="my-0.5 sm:my-1">
              <span
                className={`font-display text-2xl sm:text-[30px] font-bold tabular-nums leading-tight ${
                  item.isOverdue ? 'text-overdue' : 'text-ink'
                }`}
              >
                {item.value}
              </span>
            </div>
            <span className="text-[10.5px] sm:text-[11px] text-sub truncate">
              {item.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
