import React from 'react';
import { AlertCircle, Flame, Car, Building2, X, Clock, Calendar, Archive } from 'lucide-react';
import { SortDropdown, SORT_OPTIONS } from './SortDropdown';

export type LeadFilter =
  | 'all'
  | 'not_contacted'
  | 'due_today'
  | 'overdue'
  | 'nurture'
  | 'high_value'
  | 'test_drive'
  | 'financing';
export type LeadSort = 'default' | 'urgency' | 'value_desc' | 'value_asc' | 'name_asc' | 'updated_desc';

interface LeadFilterSortStripProps {
  activeFilter: LeadFilter;
  onSelectFilter: (filter: LeadFilter) => void;
  activeSort: LeadSort;
  onSelectSort: (sort: LeadSort) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

const FILTER_CHIPS: { id: LeadFilter; label: string; icon?: React.ElementType }[] = [
  { id: 'all', label: 'All Leads' },
  { id: 'not_contacted', label: 'Pending Outreach', icon: Clock },
  { id: 'due_today', label: 'Due Today', icon: Calendar },
  { id: 'overdue', label: 'Overdue Tasks', icon: AlertCircle },
  { id: 'nurture', label: 'Nurture / Old Leads', icon: Archive },
  { id: 'high_value', label: 'High Value (≥₱2M)', icon: Flame },
  { id: 'test_drive', label: 'Test Drive', icon: Car },
  { id: 'financing', label: 'In Financing', icon: Building2 },
];

export { SORT_OPTIONS };

export const LeadFilterSortStrip: React.FC<LeadFilterSortStripProps> = ({
  activeFilter,
  onSelectFilter,
  activeSort,
  onSelectSort,
  totalCount,
  filteredCount,
  onReset,
}) => {
  const isFiltered = activeFilter !== 'all' || activeSort !== 'default';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 pb-1">
      {/* Quick Filter Chips (flex-wrap eliminates horizontal scrolling) */}
      <div className="flex flex-wrap items-center gap-1.5 scrollbar-none" role="group" aria-label="Lead Quick Filters">
        {FILTER_CHIPS.map(({ id, label, icon: Icon }) => {
          const isActive = activeFilter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectFilter(id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-cobalt text-white border-cobalt shadow-xs'
                  : 'bg-wash text-sub border-line hover:text-ink hover:bg-line/60'
              }`}
            >
              {Icon && <Icon className={`size-3 shrink-0 ${isActive ? 'text-white' : id === 'overdue' ? 'text-overdue' : id === 'high_value' ? 'text-due' : 'text-sub'}`} />}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Sort Selector & Results Count */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
        <div className="flex items-center gap-1 text-xs text-sub font-medium">
          <span>Showing</span>
          <span className="font-bold text-ink tabular-nums">{filteredCount}</span>
          <span>of</span>
          <span className="font-bold text-ink tabular-nums">{totalCount}</span>
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-0.5 ml-1 text-[11px] font-semibold text-cobalt hover:underline"
              title="Reset all filters and sort"
            >
              <X className="size-3" /> Reset
            </button>
          )}
        </div>

        <SortDropdown activeSort={activeSort} onSelectSort={onSelectSort} />
      </div>
    </div>
  );
};
