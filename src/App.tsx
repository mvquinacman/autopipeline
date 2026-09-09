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
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';
import type { ViewMode } from './components/navigation/navItems';
import {
  Plus,
  Download,
  LogOut,
} from 'lucide-react';

function AppContent() {
  const {
    session,
    currentProfile,
    profiles,
    login,
    logout,
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

  // Guard against agents accessing managerial analytics view
  useEffect(() => {
    if (currentProfile?.role === 'agent' && currentView === 'analytics') {
      setCurrentView('pipeline');
    }
  }, [currentProfile, currentView]);

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
    <div className="min-h-screen bg-paper text-ink font-sans">
      <div className="px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] md:pb-8 max-w-7xl mx-auto space-y-5 sm:space-y-6">
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
          <RoleSwitcher currentProfile={currentProfile} />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-sub hover:text-overdue border border-line transition-colors min-h-[36px]"
            title="Sign Out of Dealership Session"
            aria-label="Sign Out"
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
        userRole={currentProfile.role}
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
        className="md:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-4 size-14 rounded-full bg-cobalt hover:bg-cobalt-press text-white shadow-xl flex items-center justify-center z-20 transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none"
      >
        <Plus className="size-6" />
      </button>

      {/* Mobile Agent Chrome: Bottom Tab Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onSelectView={setCurrentView}
        overdueCount={kpis.overdueFollowUpsCount}
        userRole={currentProfile.role}
      />

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
        <PwaInstallPrompt />
      </ToastProvider>
    </AuthProvider>
  );
}
