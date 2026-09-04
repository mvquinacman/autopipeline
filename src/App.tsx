import { useState, useMemo } from 'react';
import { calculateKpis, SEED_LEADS } from './data/seed';
import type { Lead, Stage } from './types/crm';
import { KpiStrip } from './components/KpiStrip';
import { StageRail } from './components/StageRail';
import { LeadsList } from './components/LeadsList';

const STAGE_ORDER: Stage[] = [
  'new',
  'contacted',
  'showroom',
  'test_drive',
  'application',
  'approved',
  'released',
];

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const kpis = useMemo(() => calculateKpis(leads), [leads]);

  const filteredLeads = useMemo(() => {
    if (!selectedStage) return leads;
    return leads.filter((lead) => lead.stage === selectedStage);
  }, [leads, selectedStage]);

  const handleAdvanceStage = (leadId: string) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== leadId) return lead;
        const idx = STAGE_ORDER.indexOf(lead.stage);
        if (idx < 0 || idx >= STAGE_ORDER.length - 1) return lead;
        const nextStage = STAGE_ORDER[idx + 1];
        const isReleased = nextStage === 'released';
        return {
          ...lead,
          stage: nextStage,
          status: isReleased ? 'won' : lead.status,
          probability: isReleased ? 1.0 : Math.min(1.0, lead.probability + 0.15),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  return (
    <main className="min-h-screen bg-paper text-ink p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-control bg-cobalt text-white flex items-center justify-center font-display font-bold text-xl tracking-wider shrink-0">
              AP
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">AutoPipeline</h1>
              <p className="text-xs text-sub font-medium">Metro Manila Motors — BGC Showroom</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cobalt/10 text-cobalt border border-cobalt/20">
              Sales Agent: Maria Santos
            </span>
          </div>
        </header>

        <KpiStrip kpis={kpis} />

        <section aria-label="Pipeline Chevron Stages" className="space-y-2">
          <StageRail
            leads={leads}
            activeStage={selectedStage}
            onSelectStage={setSelectedStage}
          />
        </section>

        <section aria-label="Pipeline Leads List" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sub">
              {selectedStage ? `Filtered Leads` : 'All Active Leads'}
              <span className="ml-2 tabular-nums text-xs font-semibold text-sub">
                ({filteredLeads.length})
              </span>
            </h2>
          </div>
          <LeadsList
            leads={filteredLeads}
            onClearFilter={() => setSelectedStage(null)}
            onAdvanceStage={handleAdvanceStage}
          />
        </section>
      </div>
    </main>
  );
}
