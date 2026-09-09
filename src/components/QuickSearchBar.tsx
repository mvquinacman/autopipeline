import { useState, useEffect, useRef, useMemo } from 'react';
import type { Lead } from '../types/crm';
import { formatPeso } from '../data/seed';
import { Search, X, Car, Phone } from 'lucide-react';

interface QuickSearchBarProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export function QuickSearchBar({ leads, onSelectLead }: QuickSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return leads
      .filter(
        (l) =>
          l.customerName.toLowerCase().includes(q) ||
          l.customerPhone.includes(q) ||
          l.modelInterest.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [leads, query]);

  const handleSelect = (lead: Lead) => {
    onSelectLead(lead);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-3.5 text-sub pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search customer, phone, model..."
          className="w-full h-9 pl-9 pr-8 sm:pr-12 rounded-control border border-line bg-card text-xs text-ink placeholder:text-sub focus:border-cobalt focus:outline-none transition-all shadow-sm"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2 text-sub hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[9px] font-semibold text-sub bg-wash border border-line rounded">
            Ctrl K
          </kbd>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-line rounded-control shadow-lg z-50 overflow-hidden py-1 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-sub text-center">No leads found</div>
          ) : (
            results.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => handleSelect(lead)}
                className="w-full text-left px-3 py-2 hover:bg-wash transition-colors flex items-center justify-between gap-2 border-b border-line/40 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink truncate">{lead.customerName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-sub">
                    <span className="flex items-center gap-0.5">
                      <Car className="size-2.5" /> {lead.modelInterest}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 tabular-nums">
                      <Phone className="size-2.5" /> {lead.customerPhone}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-ink tabular-nums">
                    {formatPeso(lead.estValue, true)}
                  </p>
                  <span className="text-[10px] uppercase font-bold text-cobalt tracking-wider">
                    {lead.stage.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
