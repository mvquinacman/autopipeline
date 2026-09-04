import { useState } from 'react';
import type { FollowUpWithLead } from '../types/crm';
import { Check, Calendar, AlertTriangle, Phone, Car } from 'lucide-react';

interface FollowUpCardProps {
  followUp: FollowUpWithLead;
  onComplete: (id: string) => void;
  onReschedule: (id: string, newDate: string) => void;
  onSelectLead?: (leadId: string) => void;
}

export function FollowUpCard({
  followUp,
  onComplete,
  onReschedule,
  onSelectLead,
}: FollowUpCardProps) {
  const [showReschedule, setShowReschedule] = useState(false);
  const isDone = followUp.status === 'done';

  const handleQuickReschedule = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(10, 0, 0, 0);
    onReschedule(followUp.id, d.toISOString());
    setShowReschedule(false);
  };

  return (
    <div className="bg-card border border-line rounded-card p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cobalt transition-colors">
      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectLead?.(followUp.leadId)}
            className="font-bold text-sm text-ink hover:text-cobalt transition-colors truncate text-left"
          >
            {followUp.customerName}
          </button>
          <span className="inline-flex items-center gap-1 text-xs text-sub font-medium">
            <Car className="size-3 text-sub" /> {followUp.modelInterest}
          </span>
          {followUp.isEscalated && !isDone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-overdue/10 text-overdue">
              <AlertTriangle className="size-3" /> Escalated (&gt;24h)
            </span>
          )}
        </div>

        <p className="text-xs text-ink/80 font-normal line-clamp-1">{followUp.note}</p>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-sub">
          <span className="tabular-nums">Due: {new Date(followUp.dueDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>Rep: {followUp.agentName}</span>
          {followUp.customerPhone && (
            <>
              <span>•</span>
              <a
                href={`tel:${followUp.customerPhone}`}
                className="inline-flex items-center gap-1 text-cobalt hover:underline tabular-nums"
              >
                <Phone className="size-2.5" /> {followUp.customerPhone}
              </a>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {!isDone ? (
          <>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReschedule(!showReschedule)}
                className="px-2.5 py-1 text-xs font-semibold rounded-control border border-line bg-wash hover:bg-line text-ink transition-colors flex items-center gap-1"
              >
                <Calendar className="size-3" /> Reschedule
              </button>
              {showReschedule && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-line rounded-control shadow-lg z-20 py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickReschedule(1)}
                    className="w-full text-left px-3 py-1 hover:bg-wash text-ink"
                  >
                    +1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReschedule(3)}
                    className="w-full text-left px-3 py-1 hover:bg-wash text-ink"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickReschedule(7)}
                    className="w-full text-left px-3 py-1 hover:bg-wash text-ink"
                  >
                    +1 Week
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onComplete(followUp.id)}
              className="px-3 py-1 text-xs font-bold rounded-control bg-won hover:bg-won/90 text-white transition-colors flex items-center gap-1 shadow-sm"
            >
              <Check className="size-3.5" /> Done
            </button>
          </>
        ) : (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-won/10 text-won">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
