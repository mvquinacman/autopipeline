import React from 'react';
import type { PdiChecklistItem, PdiItemStatus } from '../../types/delivery';
import { CheckCircle2, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

interface PdiChecklistCardProps {
  checklist: PdiChecklistItem[];
  qcInspectorName: string;
  qcSignedAt?: string;
  onUpdateItem: (itemId: string, status: PdiItemStatus) => void;
}

export const PdiChecklistCard: React.FC<PdiChecklistCardProps> = ({
  checklist,
  qcInspectorName,
  qcSignedAt,
  onUpdateItem,
}) => {
  const passedCount = checklist.filter((i) => i.status === 'passed').length;
  const isFullyPassed = passedCount === checklist.length;

  return (
    <div className="bg-card border border-line rounded-control p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-cobalt" />
          <h4 className="font-bold text-xs text-ink uppercase tracking-wider">
            10-Point Technical PDI Certification
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-sub">QC Inspector: {qcInspectorName}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
            isFullyPassed ? 'bg-won/10 text-won' : 'bg-due/10 text-due'
          }`}>
            {passedCount}/{checklist.length} Passed
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-control bg-wash/40 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          >
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-wash border border-line text-sub">
                  {item.category}
                </span>
                <span className="font-bold text-ink">{item.label}</span>
              </div>
              <p className="text-[11px] text-sub">{item.description}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onUpdateItem(item.id, 'passed')}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  item.status === 'passed'
                    ? 'bg-won text-white'
                    : 'bg-wash text-sub hover:text-won hover:bg-line'
                }`}
              >
                <CheckCircle2 className="size-3" /> Pass
              </button>
              <button
                type="button"
                onClick={() => onUpdateItem(item.id, 'rectify')}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  item.status === 'rectify'
                    ? 'bg-overdue text-white'
                    : 'bg-wash text-sub hover:text-overdue hover:bg-line'
                }`}
              >
                <AlertTriangle className="size-3" /> Rectify
              </button>
              <button
                type="button"
                onClick={() => onUpdateItem(item.id, 'pending')}
                className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  item.status === 'pending'
                    ? 'bg-due text-white'
                    : 'bg-wash text-sub hover:text-due hover:bg-line'
                }`}
              >
                <Clock className="size-3" /> Hold
              </button>
            </div>
          </div>
        ))}
      </div>

      {qcSignedAt && (
        <div className="pt-2 border-t border-line text-[11px] text-sub flex justify-between">
          <span>Official QC Sign-Off Verified</span>
          <span className="tabular-nums font-mono">{new Date(qcSignedAt).toLocaleTimeString('en-PH')}</span>
        </div>
      )}
    </div>
  );
};
