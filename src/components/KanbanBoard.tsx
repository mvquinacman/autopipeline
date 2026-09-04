import { useMemo } from 'react';
import type { Lead, Stage } from '../types/crm';
import { STAGES, formatPeso } from '../data/seed';
import { KanbanCard } from './KanbanCard';

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onAdvanceLead: (leadId: string) => void;
}

export function KanbanBoard({ leads, onSelectLead, onAdvanceLead }: KanbanBoardProps) {
  const stageGroups = useMemo(() => {
    const grouped: Record<Stage, { leads: Lead[]; totalValue: number }> = {
      new: { leads: [], totalValue: 0 },
      contacted: { leads: [], totalValue: 0 },
      showroom: { leads: [], totalValue: 0 },
      test_drive: { leads: [], totalValue: 0 },
      application: { leads: [], totalValue: 0 },
      approved: { leads: [], totalValue: 0 },
      released: { leads: [], totalValue: 0 },
    };

    for (const lead of leads) {
      if (grouped[lead.stage]) {
        grouped[lead.stage].leads.push(lead);
        grouped[lead.stage].totalValue += lead.estValue;
      }
    }
    return grouped;
  }, [leads]);

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-none">
      <div className="flex gap-3 min-w-[1100px] items-start">
        {STAGES.map((cfg) => {
          const group = stageGroups[cfg.id];
          return (
            <div
              key={cfg.id}
              className="w-72 shrink-0 bg-wash/50 border border-line rounded-card flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div
                className="p-3 border-b border-line bg-card rounded-t-card flex items-center justify-between"
                style={{ borderTop: `3px solid ${cfg.color}` }}
              >
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                    {cfg.label}
                  </h3>
                  <p className="text-[11px] text-sub font-display font-semibold tabular-nums">
                    {formatPeso(group.totalValue, true)}
                  </p>
                </div>
                <span className="size-5 rounded-full bg-wash text-ink font-display font-bold text-xs flex items-center justify-center tabular-nums">
                  {group.leads.length}
                </span>
              </div>

              {/* Card List */}
              <div className="p-2.5 space-y-2 overflow-y-auto flex-1 min-h-[140px]">
                {group.leads.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-line rounded-control text-xs text-sub">
                    Empty stage
                  </div>
                ) : (
                  group.leads.map((lead) => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      onSelectLead={onSelectLead}
                      onAdvanceLead={onAdvanceLead}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
