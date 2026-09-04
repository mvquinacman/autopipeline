import React from 'react';
import { NAV_GROUPS, type ViewMode } from './navItems';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  overdueCount?: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  overdueCount = 0,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      aria-label="Sidebar Navigation Rail"
      className={`hidden md:flex flex-col border-r border-line bg-card shrink-0 transition-all duration-200 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-56'
      }`}
    >
      {/* Brand Anchor */}
      <div className={`h-16 flex items-center border-b border-line px-4 gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="size-9 rounded-control bg-cobalt text-white flex items-center justify-center font-display font-bold text-lg tracking-wider shrink-0 shadow-sm">
          AP
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <div className="font-display text-sm font-bold tracking-tight text-ink leading-none truncate">Toyota BGC</div>
            <p className="text-[10px] text-sub font-medium truncate mt-0.5">Dealer Management</p>
          </div>
        )}
      </div>

      {/* Nav Items List */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h2 className="px-2.5 text-[9.5px] font-bold uppercase tracking-wider text-sub/70">
                {group.title}
              </h2>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                const hasOverdue = item.badgeKey === 'overdue' && overdueCount > 0;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    title={item.label}
                    className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-cobalt text-white shadow-sm font-bold'
                        : 'text-sub hover:text-ink hover:bg-wash'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {!isCollapsed && hasOverdue && (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full bg-overdue text-white text-[10px] font-bold">
                        {overdueCount}
                      </span>
                    )}

                    {isCollapsed && hasOverdue && (
                      <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-overdue ring-2 ring-card" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-line">
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
          className={`w-full flex items-center gap-2 p-2 rounded-control text-xs font-semibold text-sub hover:text-ink hover:bg-wash transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
