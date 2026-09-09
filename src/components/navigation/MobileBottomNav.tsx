import React, { useState } from 'react';
import type { ViewMode } from './navItems';
import type { Role } from '../../types/crm';
import {
  Kanban,
  LayoutGrid,
  CalendarCheck,
  Users,
  Layers,
  Boxes,
  Building2,
  Wrench,
  Truck,
  Wallet,
  Globe,
  BarChart3,
  X,
  ChevronRight,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  overdueCount?: number;
  userRole?: Role;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  overdueCount = 0,
  userRole,
}) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const deskItems = [
    { id: 'inventory' as ViewMode, label: 'Stock Matrix', desc: 'Fleet VINs & 48h holds', icon: Boxes },
    { id: 'fi_desk' as ViewMode, label: 'F&I Financing', desc: 'Bank approval matrix & POs', icon: Building2 },
    { id: 'service_drive' as ViewMode, label: 'Service Drive', desc: 'Workshop bay trade-ins', icon: Wrench },
    { id: 'delivery' as ViewMode, label: 'Delivery Bay', desc: 'Turnover & gate passes', icon: Truck },
    { id: 'social_intake' as ViewMode, label: 'Social Hub', desc: 'Meta Lead Ads with SLA', icon: Globe },
    { id: 'commissions' as ViewMode, label: userRole === 'agent' ? 'My Commissions' : 'Commissions Ledger', desc: 'Payouts & reserve splits', icon: Wallet },
    ...(userRole !== 'agent' ? [{ id: 'analytics' as ViewMode, label: 'Analytics Funnel', desc: 'Deal leakage & models', icon: BarChart3 }] : []),
  ];

  const isDeskActive = deskItems.some((d) => d.id === currentView);
  const activeDesk = deskItems.find((d) => d.id === currentView);

  const handleSelectDesk = (view: ViewMode) => {
    onSelectView(view);
    setIsSheetOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-line z-30 grid grid-cols-5 items-center pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] h-[max(3.875rem,calc(3.5rem+env(safe-area-inset-bottom,0px)))] shadow-lg"
      >
        <button
          type="button"
          onClick={() => onSelectView('pipeline')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentView === 'pipeline' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Kanban className="size-5 shrink-0" />
          <span className="text-[10px] uppercase font-bold mt-0.5 tracking-tight">Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('board')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentView === 'board' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <LayoutGrid className="size-5 shrink-0" />
          <span className="text-[10px] uppercase font-bold mt-0.5 tracking-tight">Board</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('follow_ups')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] relative ${
            currentView === 'follow_ups' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <div className="relative">
            <CalendarCheck className="size-5 shrink-0" />
            {overdueCount > 0 && (
              <span className="absolute -top-1 -right-1.5 px-1 py-0.2 rounded-full bg-overdue text-white text-[9px] font-bold ring-2 ring-card">
                {overdueCount}
              </span>
            )}
          </div>
          <span className="text-[10px] uppercase font-bold mt-0.5 tracking-tight">Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('floor')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            currentView === 'floor' ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          <Users className="size-5 shrink-0" />
          <span className="text-[10px] uppercase font-bold mt-0.5 tracking-tight">Floor</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] relative ${
            isDeskActive ? 'text-cobalt font-bold' : 'text-sub hover:text-ink'
          }`}
        >
          {isDeskActive && activeDesk ? (
            <activeDesk.icon className="size-5 shrink-0" />
          ) : (
            <Layers className="size-5 shrink-0" />
          )}
          <span className="text-[10px] uppercase font-bold mt-0.5 tracking-tight truncate max-w-[56px]">
            {isDeskActive && activeDesk ? activeDesk.label.split(' ')[0] : 'Desks'}
          </span>
          {isDeskActive && (
            <span className="absolute top-1 right-3 size-1.5 rounded-full bg-cobalt" />
          )}
        </button>
      </nav>

      {/* Deal Desks Action Sheet for Mobile */}
      {isSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSheetOpen(false)}
          />
          <div className="relative bg-card rounded-t-2xl border-t border-line shadow-2xl p-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] max-h-[80vh] overflow-y-auto space-y-3 z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Dealership Desks & Tools</h3>
                <p className="text-[11px] text-sub">Select an operational showroom desk</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="size-8 rounded-full flex items-center justify-center bg-wash text-sub hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {deskItems.map((desk) => {
                const isSelected = currentView === desk.id;
                const Icon = desk.icon;
                return (
                  <button
                    key={desk.id}
                    type="button"
                    onClick={() => handleSelectDesk(desk.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-control border text-left transition-colors min-h-[48px] ${
                      isSelected
                        ? 'border-cobalt bg-cobalt-tint/30 text-cobalt font-bold'
                        : 'border-line bg-paper hover:bg-wash text-ink'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-control flex items-center justify-center ${
                        isSelected ? 'bg-cobalt text-white' : 'bg-wash text-sub'
                      }`}>
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{desk.label}</p>
                        <p className="text-[11px] text-sub font-normal leading-tight">{desk.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-sub/50" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
