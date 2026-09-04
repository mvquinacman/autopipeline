import React, { useState, useRef, useEffect } from 'react';
import type { ViewMode } from './navItems';
import {
  Kanban, LayoutGrid, CalendarCheck, Users, Boxes, Building2,
  Wrench, Truck, Wallet, Globe, BarChart3, Layers, ChevronDown,
} from 'lucide-react';

interface TopNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  overdueCount?: number;
}

const DEAL_DESKS = [
  { id: 'fi_desk' as ViewMode, label: 'F&I Desk', icon: Building2 },
  { id: 'service_drive' as ViewMode, label: 'Service Drive', icon: Wrench },
  { id: 'delivery' as ViewMode, label: 'Delivery Bay', icon: Truck },
  { id: 'social_intake' as ViewMode, label: 'Social Hub', icon: Globe },
];

export const TopNav: React.FC<TopNavProps> = ({ currentView, onSelectView, overdueCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDeskActive = DEAL_DESKS.some((d) => d.id === currentView);
  const activeDesk = DEAL_DESKS.find((d) => d.id === currentView);
  const isVisible = isOpen || isHovered;

  const handleMouseEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsHovered(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setIsHovered(false), 180); };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false); setIsHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const btnStyle = (active: boolean) =>
    `px-3 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${active ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'}`;

  return (
    <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1.5 border-b border-line pb-2 flex-wrap">
      {/* Segmented Pipeline / Board View Toggle */}
      <div className="inline-flex items-center p-0.5 rounded-control bg-wash border border-line">
        <button type="button" onClick={() => onSelectView('pipeline')} className={`px-2.5 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${currentView === 'pipeline' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:text-ink'}`}>
          <Kanban className="size-3.5" /> Pipeline
        </button>
        <button type="button" onClick={() => onSelectView('board')} className={`px-2.5 py-1.5 rounded-control text-xs font-bold transition-colors flex items-center gap-1.5 ${currentView === 'board' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:text-ink'}`}>
          <LayoutGrid className="size-3.5" /> Kanban Board
        </button>
      </div>

      <button type="button" onClick={() => onSelectView('follow_ups')} className={btnStyle(currentView === 'follow_ups')}>
        <CalendarCheck className="size-3.5" /> Follow-ups
        {overdueCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-overdue text-white text-[10px] font-bold">{overdueCount}</span>}
      </button>

      <button type="button" onClick={() => onSelectView('floor')} className={btnStyle(currentView === 'floor')}>
        <Users className="size-3.5" /> Floor Board
      </button>

      <button type="button" onClick={() => onSelectView('inventory')} className={btnStyle(currentView === 'inventory')}>
        <Boxes className="size-3.5" /> Stock Matrix
      </button>

      {/* Deal Desks Dropdown (Interactive Click + Hover) */}
      <div ref={dropdownRef} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button type="button" onClick={() => setIsOpen((p) => !p)} aria-haspopup="menu" aria-expanded={isVisible} className={btnStyle(isDeskActive)}>
          <Layers className="size-3.5" />
          <span>{isDeskActive && activeDesk ? `Desk: ${activeDesk.label}` : 'Deal Desks'}</span>
          <ChevronDown className={`size-3 transition-transform duration-150 ${isVisible ? 'rotate-180' : ''}`} />
        </button>
        <div className={`absolute left-0 top-full pt-1 z-30 transition-all duration-150 ${
          isVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          <div className="w-48 bg-card border border-line rounded-card shadow-lg p-1.5 space-y-0.5">
            {DEAL_DESKS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { onSelectView(id); setIsOpen(false); setIsHovered(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
                  currentView === id ? 'bg-cobalt text-white shadow-xs' : 'text-sub hover:text-ink hover:bg-wash'
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" onClick={() => onSelectView('commissions')} className={btnStyle(currentView === 'commissions')}>
        <Wallet className="size-3.5" /> Commissions
      </button>

      <button type="button" onClick={() => onSelectView('analytics')} className={btnStyle(currentView === 'analytics')}>
        <BarChart3 className="size-3.5" /> Analytics
      </button>
    </nav>
  );
};
