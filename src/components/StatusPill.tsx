import type { Urgency, LeadStatus } from '../types/crm';

export type StatusPillType = Urgency | LeadStatus;

interface StatusPillProps {
  status: StatusPillType;
  label?: string;
}

interface StatusConfig {
  bg: string;
  text: string;
  defaultLabel: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  overdue: { bg: 'bg-overdue/10', text: 'text-overdue', defaultLabel: 'Overdue' },
  due_today: { bg: 'bg-due/10', text: 'text-due', defaultLabel: 'Due Today' },
  won: { bg: 'bg-won/10', text: 'text-won', defaultLabel: 'Won' },
  lost: { bg: 'bg-lost/10', text: 'text-lost', defaultLabel: 'Lost' },
  upcoming: { bg: 'bg-sub/10', text: 'text-sub', defaultLabel: 'Upcoming' },
  active: { bg: 'bg-cobalt/10', text: 'text-cobalt', defaultLabel: 'Active' },
  none: { bg: 'bg-sub/10', text: 'text-sub', defaultLabel: 'Normal' },
};

export function StatusPill({ status, label }: StatusPillProps) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.upcoming;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${config.bg} ${config.text}`}
    >
      {label ?? config.defaultLabel}
    </span>
  );
}
