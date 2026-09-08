import React from 'react';
import { AlertCircle, Flame, Car, Building2, ArrowUpDown, X, ChevronDown } from 'lucide-react';

export type LeadFilter = 'all' | 'overdue' | 'high_value' | 'test_drive' | 'financing';
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
  { id: 'overdue', label: 'Overdue Tasks', icon: AlertCircle },
  { id: 'high_value', label: 'High Value (≥₱2M)', icon: Flame },
  { id: 'test_drive', label: 'Test Drive', icon: Car },
  { id: 'financing', label: 'In Financing', icon: Building2 },
];

const SORT_OPTIONS: { id: LeadSort; label: string }[] = [
  { id: 'default', label: 'Default Order' },
  { id: 'urgency', label: 'Urgency' },
  { id: 'value_desc', label: 'Value: High to Low' },
  { id: 'value_asc', label: 'Value: Low to High' },
  { id: 'name_asc', label: 'Customer Name (A-Z)' },
  { id: 'updated_desc', label: 'Recently Updated' },
];

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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 pb-1">
      {/* Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" role="group" aria-label="Lead Quick Filters">
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
      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
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

        <div className="relative flex items-center gap-1.5 bg-card border border-line rounded-control pl-2 pr-6 py-1 shadow-xs">
          <ArrowUpDown className="size-3 text-sub shrink-0" />
          <label htmlFor="lead-sort-select" className="sr-only">Sort leads by</label>
          <select
            id="lead-sort-select"
            value={activeSort}
            onChange={(e) => onSelectSort(e.target.value as LeadSort)}
            className="text-xs font-semibold bg-transparent text-ink border-none focus:outline-none cursor-pointer appearance-none pr-1"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-card text-ink">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-sub pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
