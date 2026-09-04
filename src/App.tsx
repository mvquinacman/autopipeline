import { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateKpis, SEED_LEADS } from './data/seed';
import type { Lead, Stage, Profile, FollowUpWithLead } from './types/crm';
import { KpiStrip } from './components/KpiStrip';
import { StageRail } from './components/StageRail';
import { LeadsList } from './components/LeadsList';
import { RoleSwitcher } from './components/RoleSwitcher';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { AddLeadModal } from './components/AddLeadModal';
import { ManagerPerformanceCard } from './components/ManagerPerformanceCard';
import { FollowUpsHub } from './components/FollowUpsHub';
import { FunnelAnalytics } from './components/FunnelAnalytics';
import { QuickSearchBar } from './components/QuickSearchBar';
import { KanbanBoard } from './components/KanbanBoard';
import { leadService } from './services/leadService';
import { Plus, Kanban, CalendarCheck, BarChart3, LayoutGrid } from 'lucide-react';

type ViewMode = 'pipeline' | 'board' | 'follow_ups' | 'analytics';

export default function App() {
  const profiles = useMemo(() => leadService.getProfiles(), []);
  const [currentProfile, setCurrentProfile] = useState<Profile>(profiles[0]);
  const [currentView, setCurrentView] = useState<ViewMode>('pipeline');
  const [allLeads, setAllLeads] = useState<Lead[]>(SEED_LEADS);
  const [followUps, setFollowUps] = useState<FollowUpWithLead[]>([]);
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

  const loadFollowUps = useCallback(async () => {
    const data = await leadService.getEnrichedFollowUps(currentProfile);
    setFollowUps(data);
  }, [currentProfile]);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

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
    loadFollowUps();
  };

  const handleLeadCreated = (newLead: Lead) => {
    setAllLeads((prev) => [newLead, ...prev]);
    loadFollowUps();
  };

  const handleCompleteFollowUp = async (id: string) => {
    await leadService.completeFollowUp(id, currentProfile.id, currentProfile.fullName);
    await loadFollowUps();
    const refreshed = await leadService.getLeads();
    setAllLeads(refreshed);
  };

  const handleRescheduleFollowUp = async (id: string, newDate: string) => {
    await leadService.rescheduleFollowUp(id, newDate, currentProfile.id, currentProfile.fullName);
    await loadFollowUps();
    const refreshed = await leadService.getLeads();
    setAllLeads(refreshed);
  };

  return (
    <main className="min-h-screen bg-paper text-ink p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dealership Header */}
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
            <QuickSearchBar
              leads={scopedLeads}
              onSelectLead={(l) => setSelectedLead(l)}
            />
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

        {/* View Switcher Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1.5 border-b border-line pb-2">
          <button
            type="button"
            onClick={() => setCurrentView('pipeline')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'pipeline' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
            }`}
          >
            <Kanban className="size-3.5" /> Pipeline
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('board')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'board' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
            }`}
          >
            <LayoutGrid className="size-3.5" /> Kanban Board
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('follow_ups')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'follow_ups' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
            }`}
          >
            <CalendarCheck className="size-3.5" /> Follow-ups
            {kpis.overdueFollowUpsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-overdue text-white text-[10px] font-bold">
                {kpis.overdueFollowUpsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('analytics')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'analytics' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
            }`}
          >
            <BarChart3 className="size-3.5" /> Analytics
          </button>
        </nav>

        {/* KPI Strip */}
        <KpiStrip kpis={kpis} />

        {/* Manager Leaderboard (for Manager/Principal roles) */}
        {currentProfile.role !== 'agent' && (
          <ManagerPerformanceCard
            currentProfile={currentProfile}
            profiles={profiles}
            leads={allLeads}
          />
        )}

        {/* Dynamic View Panel */}
        {currentView === 'pipeline' && (
          <div className="space-y-6">
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
        )}

        {currentView === 'board' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-sub">
                Floor Standup Board ({scopedLeads.length} Leads)
              </h2>
            </div>
            <KanbanBoard
              leads={scopedLeads}
              onSelectLead={(l) => setSelectedLead(l)}
              onAdvanceLead={handleAdvance}
            />
          </div>
        )}

        {currentView === 'follow_ups' && (
          <FollowUpsHub
            followUps={followUps}
            currentProfile={currentProfile}
            onComplete={handleCompleteFollowUp}
            onReschedule={handleRescheduleFollowUp}
            onSelectLead={(leadId) => {
              const target = allLeads.find((l) => l.id === leadId);
              if (target) setSelectedLead(target);
            }}
          />
        )}

        {currentView === 'analytics' && (
          <FunnelAnalytics leads={scopedLeads} />
        )}
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
