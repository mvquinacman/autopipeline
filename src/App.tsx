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
import { ToastProvider, useToast } from './context/ToastContext';
import { LeadFilterSortStrip, type LeadFilter, type LeadSort } from './components/LeadFilterSortStrip';
import { PermissionGate } from './components/auth/PermissionGate';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/auth/LandingPage';
import { FloorBoardView } from './components/FloorBoardView';
import { InventoryMatrixView } from './components/InventoryMatrixView';
import { FiBoardView } from './components/FiBoardView';
import { MultiBankMatrixModal } from './components/MultiBankMatrixModal';
import { ServiceDriveView } from './components/ServiceDriveView';
import { DeliveryBayView } from './components/DeliveryBayView';
import { CommissionsView } from './components/CommissionsView';
import { SocialIntakeView } from './components/SocialIntakeView';
import { TopNav } from './components/navigation/TopNav';
import type { ViewMode } from './components/navigation/navItems';
import {
  Plus,
  Kanban,
  CalendarCheck,
  BarChart3,
  LayoutGrid,
  Download,
  Users,
  Boxes,
  Building2,
  Wrench,
  Truck,
  Wallet,
  Globe,
  LogOut,
} from 'lucide-react';

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
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<ViewMode>('pipeline');
  const [allLeads, setAllLeads] = useState<Lead[]>(SEED_LEADS);
  const [followUps, setFollowUps] = useState<FollowUpWithLead[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [activeFilter, setActiveFilter] = useState<LeadFilter>('all');
  const [activeSort, setActiveSort] = useState<LeadSort>('default');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [matrixLead, setMatrixLead] = useState<Lead | null>(null);
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
    let list = scopedLeads;
    if (selectedStage) {
      list = list.filter((l) => l.stage === selectedStage);
    }
    if (activeFilter === 'overdue') {
      list = list.filter((l) => l.urgency === 'overdue');
    } else if (activeFilter === 'high_value') {
      list = list.filter((l) => l.estValue >= 2_000_000);
    } else if (activeFilter === 'test_drive') {
      list = list.filter((l) => l.stage === 'test_drive');
    } else if (activeFilter === 'financing') {
      list = list.filter((l) => l.stage === 'application' || l.stage === 'approved');
    }

    if (activeSort === 'default') {
      return list;
    }

    return [...list].sort((a, b) => {
      if (activeSort === 'value_desc') return b.estValue - a.estValue;
      if (activeSort === 'value_asc') return a.estValue - b.estValue;
      if (activeSort === 'name_asc') return a.customerName.localeCompare(b.customerName);
      if (activeSort === 'updated_desc') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      const urgencyWeight: Record<string, number> = { overdue: 0, due_today: 1, upcoming: 2, none: 3 };
      return (urgencyWeight[a.urgency] ?? 3) - (urgencyWeight[b.urgency] ?? 3);
    });
  }, [scopedLeads, selectedStage, activeFilter, activeSort]);

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
    const currentLead = allLeads.find((l) => l.id === leadId);
    if (!currentLead) return;
    const prevStage = currentLead.stage;
    const prevStatus = currentLead.status;
    const prevProbability = currentLead.probability;

    try {
      const updated = await leadService.advanceStage(
        leadId,
        'Advanced via quick action',
        currentProfile.id,
        currentProfile.fullName
      );
      setAllLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) setSelectedLead(updated);

      showToast({
        message: `${currentLead.customerName} advanced to ${updated.stage.replace('_', ' ')}`,
        type: 'success',
        actionLabel: 'Undo',
        undoAction: async () => {
          const rolledBack = await leadService.updateLead(leadId, {
            stage: prevStage,
            status: prevStatus,
            probability: prevProbability,
          });
          await leadService.addActivity(
            leadId,
            currentProfile.id,
            currentProfile.fullName,
            'stage_change',
            `Reverted stage advancement back to ${prevStage.replace('_', ' ')}`
          );
          setAllLeads((prev) => prev.map((l) => (l.id === leadId ? rolledBack : l)));
          if (selectedLead?.id === leadId) setSelectedLead(rolledBack);
          showToast({
            message: `Restored ${currentLead.customerName} back to ${prevStage.replace('_', ' ')}`,
            type: 'info',
          });
        },
      });
    } catch (err) {
      console.error('Failed to advance stage:', err);
      showToast({
        message: 'Failed to advance stage',
        type: 'error',
      });
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
    const targetFollowUp = followUps.find((f) => f.id === id);
    await leadService.completeFollowUp(id, currentProfile.id, currentProfile.fullName);
    await loadFollowUps();
    const refreshed = await leadService.getLeads();
    setAllLeads(refreshed);

    showToast({
      message: 'Follow-up marked as completed',
      type: 'success',
      actionLabel: 'Undo',
      undoAction: async () => {
        if (targetFollowUp) {
          await leadService.rescheduleFollowUp(
            id,
            targetFollowUp.dueDate,
            currentProfile.id,
            currentProfile.fullName,
            'Undo completed status'
          );
          await loadFollowUps();
          const refreshedAfterUndo = await leadService.getLeads();
          setAllLeads(refreshedAfterUndo);
          showToast({
            message: 'Follow-up restored to pending',
            type: 'info',
          });
        }
      },
    });
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
    <div className="min-h-screen bg-paper text-ink p-4 sm:p-6 pb-24 md:pb-8 font-sans max-w-7xl mx-auto space-y-6">
      {/* Dealership Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 border-b border-line pb-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="size-10 rounded-control bg-cobalt text-white flex items-center justify-center font-display font-bold text-xl tracking-wider shrink-0 shadow-sm">
            AP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink leading-tight">
                AutoPipeline
              </h1>
              <span className="text-sub/40 hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-wash text-sub border border-line capitalize">
                {currentView.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-sub font-medium">Metro Manila Motors — BGC Showroom</p>
          </div>
        </div>

        <div className="w-full md:flex-1 md:max-w-md md:mx-auto">
          <QuickSearchBar
            leads={scopedLeads}
            onSelectLead={(l) => setSelectedLead(l)}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 justify-end flex-wrap sm:flex-nowrap">
          <PermissionGate permission="lead:export">
            <button
              type="button"
              onClick={() => exportLeadsToCsv(filteredLeads, `autopipeline-leads-${currentProfile.role}.csv`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors min-h-[36px]"
              title="Export filtered pipeline leads to CSV"
            >
              <Download className="size-3.5 text-sub" />
              <span className="hidden xl:inline">Export CSV</span>
            </button>
          </PermissionGate>
          <button
            type="button"
            onClick={() => setIsAddLeadOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[36px]"
          >
            <Plus className="size-4" />
            <span>Add Lead</span>
          </button>
          <div className="hidden sm:block h-6 w-px bg-line mx-0.5" />
          <RoleSwitcher
            currentProfile={currentProfile}
            profiles={profiles}
            onSelectProfile={(p) => switchProfile(p.id)}
            onOpenAuthModal={openAuthModal}
          />
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

      {/* Main Top Navigation (Deal Desks Dropdown & Segmented Switcher) */}
      <TopNav
        currentView={currentView}
        onSelectView={setCurrentView}
        overdueCount={kpis.overdueFollowUpsCount}
      />

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

              <LeadFilterSortStrip
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
                activeSort={activeSort}
                onSelectSort={setActiveSort}
                totalCount={scopedLeads.length}
                filteredCount={filteredLeads.length}
                onReset={() => {
                  setActiveFilter('all');
                  setActiveSort('default');
                  setSelectedStage(null);
                }}
              />

              <LeadsList
                leads={filteredLeads}
                onClearFilter={() => {
                  setSelectedStage(null);
                  setActiveFilter('all');
                }}
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

        {currentView === 'fi_desk' && (
          <FiBoardView
            leads={scopedLeads}
            onOpenLead={(l) => setSelectedLead(l)}
            onOpenMatrix={(l) => setMatrixLead(l)}
          />
        )}

        {currentView === 'service_drive' && (
          <ServiceDriveView
            currentProfile={currentProfile}
            onOpenLead={(leadId) => {
              const target = allLeads.find((l) => l.id === leadId);
              if (target) setSelectedLead(target);
            }}
            onLeadConverted={(newLead) => {
              setAllLeads((prev) => [newLead, ...prev]);
              setSelectedLead(newLead);
              loadFollowUps();
            }}
          />
        )}

        {currentView === 'delivery' && (
          <DeliveryBayView
            currentProfile={currentProfile}
            onOpenLead={(leadId) => {
              const target = allLeads.find((l) => l.id === leadId);
              if (target) setSelectedLead(target);
            }}
            onDeliveryCompleted={() => {
              leadService.getLeads().then((refreshed) => setAllLeads(refreshed));
              loadFollowUps();
            }}
          />
        )}

        {currentView === 'commissions' && (
          <CommissionsView currentProfile={currentProfile} />
        )}

        {currentView === 'social_intake' && (
          <SocialIntakeView
            currentProfile={currentProfile}
            onLeadConverted={(newLead) => {
              setAllLeads((prev) => [newLead, ...prev]);
              setSelectedLead(newLead);
              loadFollowUps();
            }}
          />
        )}

        {currentView === 'analytics' && (
          <FunnelAnalytics leads={scopedLeads} />
        )}

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
        className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-line z-30 flex items-center justify-around h-16 safe-bottom shadow-lg overflow-x-auto"
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
          onClick={() => setCurrentView('fi_desk')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[54px] ${
            currentView === 'fi_desk' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Building2 className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">F&amp;I</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('service_drive')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[54px] ${
            currentView === 'service_drive' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Wrench className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Service</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('delivery')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[54px] ${
            currentView === 'delivery' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Truck className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Delivery</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('commissions')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[54px] ${
            currentView === 'commissions' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Wallet className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Earn</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('social_intake')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[54px] ${
            currentView === 'social_intake' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Globe className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Social</span>
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('analytics')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors min-w-[54px] ${
            currentView === 'analytics' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <BarChart3 className="size-5" />
          <span className="text-[10px] uppercase font-bold mt-1">Analytics</span>
        </button>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      {matrixLead && (
        <MultiBankMatrixModal
          isOpen={true}
          lead={matrixLead}
          onClose={() => setMatrixLead(null)}
          onOfferAccepted={() => {
            leadService.getLeads().then((refreshed) => setAllLeads(refreshed));
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
