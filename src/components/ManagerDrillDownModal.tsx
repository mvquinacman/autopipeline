import React from 'react';
import { Lead } from '../types/crm';
import { formatPeso } from '../data/seed';
import { X, ChevronRight, ArrowRight } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface ManagerDrillDownModalProps {
  isOpen: boolean;
  title: string;
  agentName: string;
  leads: Lead[];
  onClose: () => void;
  onSelectLead: (lead: Lead) => void;
}

export const ManagerDrillDownModal: React.FC<ManagerDrillDownModalProps> = ({
  isOpen,
  title,
  agentName,
  leads,
  onClose,
  onSelectLead,
}) => {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drilldown-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-lg bg-card border border-line rounded-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-paper border-b border-line flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-sub tracking-wider">
              Manager Drill-Down • {agentName}
            </span>
            <h3 id="drilldown-title" className="font-display text-base font-bold text-ink leading-tight">
              {title} ({leads.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-control text-sub hover:text-ink hover:bg-wash flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Lead List */}
        <div className="flex-1 modal-scroll-container overflow-y-auto p-4 divide-y divide-line/60">
          {leads.length === 0 ? (
            <p className="text-center py-8 text-xs text-sub">No leads in this category.</p>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => {
                  onSelectLead(lead);
                  onClose();
                }}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group cursor-pointer hover:bg-wash/50 px-2 rounded-control transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-ink truncate group-hover:text-cobalt">
                      {lead.customerName}
                    </h4>
                    <span className="text-[10px] uppercase font-semibold text-sub bg-wash px-1.5 py-0.5 rounded border border-line">
                      {lead.stage.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-sub flex items-center gap-1.5">
                    <span>{lead.modelInterest}</span> • <span className="font-semibold text-ink">{formatPeso(lead.estValue)}</span>
                  </p>
                  {lead.nextAction && (
                    <p className="text-[10.5px] text-cobalt flex items-center gap-1">
                      <ArrowRight className="size-2.5" /> Next: {lead.nextAction}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="size-8 rounded-control bg-wash text-sub group-hover:bg-cobalt group-hover:text-white flex items-center justify-center shrink-0 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
