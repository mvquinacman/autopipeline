import { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateKpis, SEED_LEADS } from './data/seed';
import type { Lead, Stage, FollowUpWithLead } from './types/crm';
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
import { exportLeadsToCsv } from './utils/csvExport';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionGate } from './components/auth/PermissionGate';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/auth/LandingPage';
import { FloorBoardView } from './components/FloorBoardView';
import { InventoryMatrixView } from './components/InventoryMatrixView';
import { Plus, Kanban, CalendarCheck, BarChart3, LayoutGrid, Download, Users, Boxes, LogOut } from 'lucide-react';

type ViewMode = 'pipeline' | 'board' | 'follow_ups' | 'floor' | 'inventory' | 'analytics';

function AppContent() {
  const {
    session,
    currentProfile,
    profiles,
    switchProfile,
    login,
    logout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('pipeline');
  const [allLeads, setAllLeads] = useState<Lead[]>(SEED_LEADS);
  const [followUps, setFollowUps] = useState<FollowUpWithLead[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // Scoped to active role (Simulating RLS)
  const scopedLeads = useMemo(
    () => (currentProfile ? leadService.filterLeadsForRole(allLeads, currentProfile) : []),
    [allLeads, currentProfile]
  );

  const kpis = useMemo(
    () =>
      currentProfile
        ? calculateKpis(scopedLeads, currentProfile.targetValue || 15_000_000)
        : calculateKpis([]),
    [scopedLeads, currentProfile]
  );

  const filteredLeads = useMemo(() => {
    if (!selectedStage) return scopedLeads;
    return scopedLeads.filter((l) => l.stage === selectedStage);
  }, [scopedLeads, selectedStage]);

  const loadFollowUps = useCallback(async () => {
    if (!currentProfile) return;
    const data = await leadService.getEnrichedFollowUps(currentProfile);
    setFollowUps(data);
  }, [currentProfile]);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  const handleAdvance = async (leadId: string) => {
    if (!currentProfile) return;
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
    if (!currentProfile) return;
    await leadService.completeFollowUp(id, currentProfile.id, currentProfile.fullName);
    await loadFollowUps();
    const refreshed = await leadService.getLeads();
    setAllLeads(refreshed);
  };

  const handleRescheduleFollowUp = async (id: string, newDate: string) => {
    if (!currentProfile) return;
    await leadService.rescheduleFollowUp(id, newDate, currentProfile.id, currentProfile.fullName);
    await loadFollowUps();
    const refreshed = await leadService.getLeads();
    setAllLeads(refreshed);
  };

  if (!session || !currentProfile) {
    return <LandingPage onLoginSuccess={(p) => login(p.id)} />;
  }

  return (
    <main className="min-h-screen bg-paper text-ink p-4 sm:p-6 pb-24 md:pb-6 font-sans">
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <QuickSearchBar
              leads={scopedLeads}
              onSelectLead={(l) => setSelectedLead(l)}
            />
            <RoleSwitcher
              currentProfile={currentProfile}
              profiles={profiles}
              onSelectProfile={(p) => switchProfile(p.id)}
              onOpenAuthModal={openAuthModal}
            />
            <PermissionGate permission="lead:export">
              <button
                type="button"
                onClick={() => exportLeadsToCsv(filteredLeads, `autopipeline-leads-${currentProfile.role}.csv`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors min-h-[36px]"
                title="Export filtered pipeline leads to CSV"
              >
                <Download className="size-3.5 text-sub" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </PermissionGate>
            <button
              type="button"
              onClick={() => setIsAddLeadOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[36px]"
            >
              <Plus className="size-4" /> Add Lead
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-sub hover:text-overdue border border-line transition-colors min-h-[36px]"
              title="Sign Out / Lock Terminal"
              aria-label="Sign Out / Lock Terminal"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* View Switcher Tabs (Desktop & Tablet) */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1.5 border-b border-line pb-2">
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
            onClick={() => setCurrentView('floor')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'floor' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
            }`}
          >
            <Users className="size-3.5" /> Floor Board
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('inventory')}
            className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${
              currentView === 'inventory' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
            }`}
          >
            <Boxes className="size-3.5" /> Stock Matrix
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

        {currentView === 'floor' && (
          <FloorBoardView />
        )}

        {currentView === 'inventory' && (
          <InventoryMatrixView />
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

      {/* Mobile Agent Chrome: Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsAddLeadOpen(true)}
        aria-label="Add new lead"
        className="md:hidden fixed bottom-20 right-4 size-14 rounded-full bg-cobalt hover:bg-cobalt-press text-white shadow-xl flex items-center justify-center z-30 transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none"
      >
        <Plus className="size-6" />
      </button>

      {/* Mobile Agent Chrome: Bottom Tab Navigation */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-line z-30 flex items-center justify-around h-16 safe-bottom shadow-lg"
      >
        <button
          type="button"
          onClick={() => setCurrentView('pipeline')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'pipeline' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Kanban className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Pipeline</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('board')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'board' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <LayoutGrid className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Board</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('follow_ups')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
            currentView === 'follow_ups' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <div className="relative">
            <CalendarCheck className="size-5" />
            {kpis.overdueFollowUpsCount > 0 && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-overdue ring-2 ring-card" />
            )}
          </div>
          <span className="text-[10px] uppercase font-bold mt-1">Follow-ups</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('floor')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'floor' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Users className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Floor</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('inventory')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'inventory' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Boxes className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Stock</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('analytics')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
            currentView === 'analytics' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <BarChart3 className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Analytics</span>
        </button>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
