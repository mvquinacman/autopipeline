import React, { useState } from 'react';
import { CheckCircle2, Clock, X } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface NextActionModalProps {
  isOpen: boolean;
  leadName: string;
  currentAction?: string;
  currentDueDate?: string;
  onClose: () => void;
  onSave: (nextAction: string, dueDate: string) => void;
}

const QUICK_ACTIONS = [
  'Call to follow up',
  'Send quotation via Viber',
  'Follow up on bank approval',
  'Schedule showroom visit',
  'Confirm vehicle releasing',
];

export const NextActionModal: React.FC<NextActionModalProps> = ({
  isOpen,
  leadName,
  currentAction = '',
  currentDueDate = '',
  onClose,
  onSave,
}) => {
  useBodyScrollLock(isOpen);
  const [action, setAction] = useState(currentAction);
  const [dueDate, setDueDate] = useState(
    currentDueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSetQuickDate = (daysFromNow: number) => {
    const target = new Date(Date.now() + daysFromNow * 86400000);
    setDueDate(target.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) return;
    onSave(action.trim(), dueDate);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="next-action-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-md bg-card border border-line rounded-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-cobalt" />
            <h3 id="next-action-title" className="text-sm font-bold text-ink">
              Schedule Next Action
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-7 rounded-control text-sub hover:text-ink flex items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-sub">
            Every active lead must have a scheduled next step. Target prospect: <strong className="text-ink">{leadName}</strong>
          </p>

          <div className="space-y-1.5">
            <label htmlFor="next-action-input" className="block text-xs font-semibold text-ink">
              Next Action <span className="text-overdue">*</span>
            </label>
            <input
              id="next-action-input"
              type="text"
              required
              placeholder="e.g. Send revised quotation with 20% DP"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full h-9 px-3 text-xs bg-paper border border-line rounded-control text-ink focus:outline-hidden focus:ring-1 focus:ring-cobalt"
            />
            <div className="flex flex-wrap gap-1 pt-1">
              {QUICK_ACTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAction(item)}
                  className="text-[10.5px] px-2 py-0.5 rounded-full bg-wash border border-line text-sub hover:text-ink hover:border-cobalt transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="next-due-date" className="block text-xs font-semibold text-ink">
              Follow-Up Due Date <span className="text-overdue">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="next-due-date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 h-9 px-3 text-xs bg-paper border border-line rounded-control text-ink focus:outline-hidden focus:ring-1 focus:ring-cobalt"
              />
              <button
                type="button"
                onClick={() => handleSetQuickDate(1)}
                className="px-2 py-1 text-[11px] font-semibold bg-wash border border-line rounded-control hover:bg-line/60 text-ink"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDate(3)}
                className="px-2 py-1 text-[11px] font-semibold bg-wash border border-line rounded-control hover:bg-line/60 text-ink"
              >
                +3 Days
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-sub hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white rounded-control shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="size-3.5" /> Save Next Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
