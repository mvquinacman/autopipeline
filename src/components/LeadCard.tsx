import { ChevronRight } from 'lucide-react';
import { formatPeso, STAGES } from '../data/seed';
import type { Lead } from '../types/crm';
import { StatusPill } from './StatusPill';

interface LeadCardProps {
  lead: Lead;
  onAdvanceStage?: (leadId: string) => void;
  onSelectLead?: (lead: Lead) => void;
}

export function LeadCard({ lead, onAdvanceStage, onSelectLead }: LeadCardProps) {
  const stageConfig = STAGES.find((s) => s.id === lead.stage);
  const isFinalStage = lead.stage === 'released' || lead.status !== 'active';

  const pillStatus =
    lead.status === 'won'
      ? 'won'
      : lead.status === 'lost'
      ? 'lost'
      : lead.urgency !== 'none'
      ? lead.urgency
      : 'active';

  return (
    <article
      onClick={() => onSelectLead?.(lead)}
      className="bg-card border border-line rounded-card p-4 hover:border-cobalt transition-colors flex flex-col justify-between gap-3 focus-within:border-cobalt cursor-pointer group"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-[15px] text-ink truncate flex-1" title={lead.modelInterest}>
            {lead.modelInterest}
          </h3>
          <StatusPill status={pillStatus} />
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <p className="text-sub truncate" title={lead.customerName}>
            {lead.customerName}
          </p>
          <span className="tabular-nums font-semibold text-ink shrink-0 ml-2">
            {formatPeso(lead.estValue)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-wash text-sub truncate">
          {stageConfig?.label ?? lead.stage}
        </span>

        {!isFinalStage ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdvanceStage?.(lead.id);
            }}
            aria-label={`Advance ${lead.customerName}'s lead to next stage`}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-control bg-wash hover:bg-cobalt-tint hover:text-cobalt text-ink transition-colors min-h-[44px] md:min-h-0 focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none"
          >
            <span>Advance Stage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-sub">
            {lead.status === 'won' ? 'Completed' : 'Closed'}
          </span>
        )}
      </div>
    </article>
  );
}
