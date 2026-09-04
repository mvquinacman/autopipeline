import { useState, useMemo } from 'react';
import { calculateKpis, SEED_LEADS } from './data/seed';
import type { Lead, Stage, Profile } from './types/crm';
import { KpiStrip } from './components/KpiStrip';
import { StageRail } from './components/StageRail';
import { LeadsList } from './components/LeadsList';
import { RoleSwitcher } from './components/RoleSwitcher';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { AddLeadModal } from './components/AddLeadModal';
import { ManagerPerformanceCard } from './components/ManagerPerformanceCard';
import { leadService } from './services/leadService';
import { Plus } from 'lucide-react';

export default function App() {
  const profiles = useMemo(() => leadService.getProfiles(), []);
  const [currentProfile, setCurrentProfile] = useState<Profile>(profiles[0]);
  const [allLeads, setAllLeads] = useState<Lead[]>(SEED_LEADS);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // Scoped to active role (Simulating RLS)
  const scopedLeads = useMemo(
    () => leadService.filterLeadsForRole(allLeads, currentProfile),
    [allLeads, currentProfile]
  );

  const kpis = useMemo(
    () => calculateKpis(scopedLeads, currentProfile.targetValue || 15_000_000),
    [scopedLeads, currentProfile]
  );

  const filteredLeads = useMemo(() => {
    if (!selectedStage) return scopedLeads;
    return scopedLeads.filter((l) => l.stage === selectedStage);
  }, [scopedLeads, selectedStage]);

  const handleAdvance = async (leadId: string) => {
    try {
      const updated = await leadService.advanceStage(
        leadId,
        'Advanced via quick action',
        currentProfile.id,
        currentProfile.fullName
      );
      setAllLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) setSelectedLead(updated);
    } catch (err) {
      console.error('Failed to advance stage:', err);
    }
  };

  const handleLeadUpdated = (updated: Lead) => {
    setAllLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const handleLeadCreated = (newLead: Lead) => {
    setAllLeads((prev) => [newLead, ...prev]);
  };

  return (
    <main className="min-h-screen bg-paper text-ink p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-control bg-cobalt text-white flex items-center justify-center font-display font-bold text-xl tracking-wider shrink-0">
              AP
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink">AutoPipeline</h1>
              <p className="text-xs text-sub font-medium">Metro Manila Motors — BGC Showroom</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <RoleSwitcher
              currentProfile={currentProfile}
              profiles={profiles}
              onSelectProfile={setCurrentProfile}
            />
            <button
              type="button"
              onClick={() => setIsAddLeadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors"
            >
              <Plus className="size-4" /> Add Lead
            </button>
          </div>
        </header>

        <KpiStrip kpis={kpis} />

        {currentProfile.role !== 'agent' && (
          <ManagerPerformanceCard
            currentProfile={currentProfile}
            profiles={profiles}
            leads={allLeads}
          />
        )}

        <section aria-label="Pipeline Chevron Stages" className="space-y-2">
          <StageRail
            leads={scopedLeads}
            activeStage={selectedStage}
            onSelectStage={setSelectedStage}
          />
        </section>

        <section aria-label="Pipeline Leads List" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sub">
              {selectedStage ? `${selectedStage.replace('_', ' ')} Leads` : 'All Scoped Leads'}
              <span className="ml-2 tabular-nums text-xs font-semibold text-sub">
                ({filteredLeads.length})
              </span>
            </h2>
          </div>
          <LeadsList
            leads={filteredLeads}
            onClearFilter={() => setSelectedStage(null)}
            onAdvanceStage={handleAdvance}
            onSelectLead={(l) => setSelectedLead(l)}
          />
        </section>
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        currentProfile={currentProfile}
        profiles={profiles}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={handleLeadUpdated}
      />

      <AddLeadModal
        isOpen={isAddLeadOpen}
        currentProfile={currentProfile}
        onClose={() => setIsAddLeadOpen(false)}
        onLeadCreated={handleLeadCreated}
      />
    </main>
  );
}
