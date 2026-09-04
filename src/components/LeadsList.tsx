import { Car, AlertCircle } from 'lucide-react';
import type { Lead } from '../types/crm';
import { LeadCard } from './LeadCard';

interface LeadsListProps {
  leads: Lead[];
  isLoading?: boolean;
  error?: string | null;
  onClearFilter?: () => void;
  onAdvanceStage?: (leadId: string) => void;
  onSelectLead?: (lead: Lead) => void;
  onRetry?: () => void;
}

export function LeadsList({
  leads,
  isLoading = false,
  error = null,
  onClearFilter,
  onAdvanceStage,
  onSelectLead,
  onRetry,
}: LeadsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="h-28 rounded-card bg-wash animate-pulse border border-line" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-card border border-overdue/20 bg-overdue/5 p-6 text-center">
        <AlertCircle className="size-6 text-overdue mx-auto mb-2" />
        <p className="text-sm text-ink mb-3">{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-semibold rounded-control bg-wash hover:bg-line text-ink transition-colors focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-card border border-line bg-card p-12 text-center flex flex-col items-center justify-center">
        <Car className="size-10 text-sub mb-3 stroke-[1.5]" />
        <p className="text-sm font-medium text-ink mb-1">No leads match the selected stage filter.</p>
        <p className="text-xs text-sub mb-4">Try selecting another stage or clearing the current filter.</p>
        {onClearFilter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="px-4 py-2 text-xs font-semibold rounded-control bg-cobalt hover:bg-cobalt-press text-white transition-colors focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none min-h-[44px] md:min-h-0"
          >
            Clear stage filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onAdvanceStage={onAdvanceStage}
          onSelectLead={onSelectLead}
        />
      ))}
    </div>
  );
}
