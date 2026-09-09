import React, { useState, useEffect } from 'react';
import type { SlaStatus } from '../../types/socialIntake';
import { Timer, CheckCheck, Clock } from 'lucide-react';

interface SlaCountdownTimerProps {
  deadline: string;
  slaStatus: SlaStatus;
  firstContactTimestamp?: string;
}

export const SlaCountdownTimer: React.FC<SlaCountdownTimerProps> = ({
  deadline,
  slaStatus,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.floor(diff / 1000);
  });

  useEffect(() => {
    if (slaStatus !== 'sla_active') return;

    const interval = setInterval(() => {
      const diff = new Date(deadline).getTime() - Date.now();
      const secs = Math.floor(diff / 1000);
      setSecondsLeft(secs);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline, slaStatus]);

  if (slaStatus === 'sla_met') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-won/10 text-won border border-won/20 whitespace-nowrap shrink-0">
        <CheckCheck className="size-3 shrink-0" /> SLA Met (&lt;15m)
      </span>
    );
  }

  if (slaStatus === 'sla_breached' || secondsLeft <= 0) {
    const overdueMins = Math.abs(Math.floor(secondsLeft / 60));
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-overdue/10 text-overdue border border-overdue/30 animate-pulse whitespace-nowrap shrink-0">
        <Clock className="size-3 shrink-0" /> SLA Breached ({overdueMins}m ago)
      </span>
    );
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = Math.abs(secondsLeft % 60);
  const isUrgent = mins < 5;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border tabular-nums whitespace-nowrap shrink-0 ${
      isUrgent
        ? 'bg-due/10 text-due border-due/30'
        : 'bg-cobalt-tint text-cobalt border-cobalt/20'
    }`}>
      <Timer className="size-3 shrink-0" /> {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} SLA left
    </span>
  );
};
