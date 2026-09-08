import React, { useState } from 'react';
import { LostReason } from '../types/crm';
import { AlertTriangle, X, ChevronDown } from 'lucide-react';

interface MarkLostDialogProps {
  isOpen: boolean;
  leadTitle: string;
  onClose: () => void;
  onConfirm: (lostReason: LostReason, note?: string) => void;
}

const LOST_REASONS: { id: LostReason; label: string }[] = [
  { id: 'bought_elsewhere', label: 'Bought from competitor dealership' },
  { id: 'financing_declined', label: 'Bank financing / loan disapproved' },
  { id: 'unresponsive', label: 'Customer stopped responding (ghosted)' },
  { id: 'budget', label: 'Budget constraints / postponed purchase' },
  { id: 'other', label: 'Other reason' },
];

export const MarkLostDialog: React.FC<MarkLostDialogProps> = ({
  isOpen,
  leadTitle,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState<LostReason>('bought_elsewhere');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-md w-full p-6 shadow-lg space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-overdue">
            <AlertTriangle className="size-5 shrink-0" />
            <h3 className="font-display text-lg font-bold text-ink">Mark Lead as Lost</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-sub">
          Moving <span className="font-semibold text-ink">{leadTitle}</span> out of active pipeline.
          Selecting an accurate reason provides actionable conversion analytics.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Primary Reason for Loss
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as LostReason)}
                className="w-full h-10 pl-3 pr-10 appearance-none rounded-control border border-line bg-paper text-ink text-xs focus:ring-2 focus:ring-cobalt focus:outline-none cursor-pointer"
              >
                {LOST_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-sub pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Additional Context / Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Bought from Ford Global City instead..."
              rows={2}
              className="w-full p-2.5 rounded-control border border-line bg-paper text-ink text-xs focus:ring-2 focus:ring-cobalt focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-control text-xs font-semibold text-ink bg-wash border border-line hover:bg-line/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-control text-xs font-semibold text-white bg-overdue hover:bg-overdue/90 transition-colors"
            >
              Confirm Mark Lost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
