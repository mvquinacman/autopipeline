import type { Lead } from '../types/crm';
import { formatPeso } from '../data/seed';
import { StatusPill } from './StatusPill';
import { ChevronRight, Car } from 'lucide-react';

interface KanbanCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onAdvanceLead?: (leadId: string) => void;
}

export function KanbanCard({ lead, onSelectLead, onAdvanceLead }: KanbanCardProps) {
  return (
    <div
      onClick={() => onSelectLead(lead)}
      className="bg-card border border-line rounded-control p-3 space-y-2 hover:border-cobalt transition-colors cursor-pointer shadow-sm group"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold text-xs text-ink group-hover:text-cobalt transition-colors line-clamp-1">
          {lead.customerName}
        </span>
        {lead.urgency !== 'none' && <StatusPill status={lead.urgency} />}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-sub">
        <Car className="size-3 text-sub shrink-0" />
        <span className="truncate">{lead.modelInterest}</span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-line/60 text-xs">
        <span className="font-display font-bold text-ink tabular-nums">
          {formatPeso(lead.estValue, true)}
        </span>
        {lead.stage !== 'released' && onAdvanceLead && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceLead(lead.id);
            }}
            title="Advance to next stage"
            className="p-1 rounded-control bg-wash hover:bg-line text-ink hover:text-cobalt transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
