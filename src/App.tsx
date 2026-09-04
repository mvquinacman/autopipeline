import { useState, useMemo } from 'react';
import { calculateKpis, SEED_LEADS } from './data/seed';
import type { Lead, Stage } from './types/crm';
import { KpiStrip } from './components/KpiStrip';
import { StageRail } from './components/StageRail';
import { LeadsList } from './components/LeadsList';
import { leadService } from './services/leadService';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  const kpis = useMemo(() => calculateKpis(leads), [leads]);

  const filteredLeads = useMemo(() => {
    if (!selectedStage) return leads;
    return leads.filter((lead) => lead.stage === selectedStage);
  }, [leads, selectedStage]);

  const handleAdvanceStage = async (leadId: string) => {
    try {
      const updated = await leadService.advanceStage(leadId);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
    } catch (err) {
      console.error('Failed to advance stage:', err);
    }
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
