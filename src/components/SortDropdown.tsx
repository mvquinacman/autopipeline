import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import type { LeadSort } from './LeadFilterSortStrip';

export interface SortOption {
  id: LeadSort;
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'default', label: 'Default Order' },
  { id: 'urgency', label: 'Urgency' },
  { id: 'value_desc', label: 'Value: High to Low' },
  { id: 'value_asc', label: 'Value: Low to High' },
  { id: 'name_asc', label: 'Customer Name (A-Z)' },
  { id: 'updated_desc', label: 'Recently Updated' },
];

interface SortDropdownProps {
  activeSort: LeadSort;
  onSelectSort: (sort: LeadSort) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  activeSort,
  onSelectSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = SORT_OPTIONS.find((o) => o.id === activeSort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden native select for screen reader & test accessibility */}
      <select
        id="lead-sort-select"
        aria-label="Sort leads by"
        value={activeSort}
        onChange={(e) => onSelectSort(e.target.value as LeadSort)}
        className="sr-only"
        tabIndex={-1}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Sort leads: ${activeOption.label}`}
        className="h-8 px-2.5 flex items-center gap-1.5 bg-card border border-line rounded-control text-xs font-semibold text-ink shadow-xs hover:border-cobalt/40 focus:outline-none focus:ring-1 focus:ring-cobalt transition-colors"
      >
        <ArrowUpDown className="size-3 text-sub shrink-0" />
        <span className="truncate max-w-[130px] text-left">{activeOption.label}</span>
        <ChevronDown
          className={`size-3 text-sub shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-cobalt' : ''
          }`}
        />
      </button>

      {/* Polished Custom Dropdown Popover */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Sort options"
          className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-line rounded-card shadow-lg p-1 z-30 animate-fade-in"
        >
          {SORT_OPTIONS.map((opt) => {
            const isSelected = activeSort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitem"
                aria-checked={isSelected}
                onClick={() => {
                  onSelectSort(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-control text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-cobalt-tint text-cobalt font-bold'
                    : 'text-sub hover:text-ink hover:bg-wash'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-3.5 text-cobalt shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
