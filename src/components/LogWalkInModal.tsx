import React, { useState } from 'react';
import type { WalkInSource, FloorQueueEntry } from '../types/upSystem';
import { upSystemService } from '../services/upSystemService';
import { Users, X, Check, AlertCircle, Phone, Car } from 'lucide-react';

interface LogWalkInModalProps {
  isOpen: boolean;
  nextUpAgent?: FloorQueueEntry;
  onClose: () => void;
  onWalkInCreated: () => void;
}

const SOURCES: { value: WalkInSource; label: string }[] = [
  { value: 'walk_in', label: 'Showroom Walk-In' },
  { value: 'phone_in', label: 'Inbound Phone Inquiry' },
  { value: 'service_drive', label: 'Service Customer Upsell' },
];

export const LogWalkInModal: React.FC<LogWalkInModalProps> = ({
  isOpen,
  nextUpAgent,
  onClose,
  onWalkInCreated,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [modelInterest, setModelInterest] = useState('Toyota Fortuner 2.8 LTD');
  const [source, setSource] = useState<WalkInSource>('walk_in');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !modelInterest.trim()) {
      setError('Customer name, phone, and vehicle interest are required.');
      return;
    }

    try {
      upSystemService.assignWalkIn({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        modelInterest: modelInterest.trim(),
        source,
        notes: notes.trim() || undefined,
      });

      onWalkInCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign walk-in to floor consultant.');
    }
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-cobalt-tint flex items-center justify-center text-cobalt shrink-0">
              <Users className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Log Showroom Walk-In</h3>
              <p className="text-xs text-sub">Assign in-store prospect to the Up Consultant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="size-7 flex items-center justify-center rounded-control hover:bg-wash text-sub hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Next Up Consultant Banner */}
        {nextUpAgent ? (
          <div className="bg-paper border border-line rounded-control p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-cobalt tracking-wider">
                Assigned to Consultant On Deck
              </span>
              <p className="text-xs font-bold text-ink">{nextUpAgent.agentName}</p>
            </div>
            <span className="text-[10.5px] font-bold text-won bg-won/10 px-2 py-0.5 rounded-full border border-won/20">
              Position #{nextUpAgent.position}
            </span>
          </div>
        ) : (
          <div className="text-xs text-overdue bg-overdue/10 p-2.5 rounded-control">
            No sales consultants are currently marked as available on the floor.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-overdue bg-overdue/10 border border-overdue/20 rounded-control p-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
              Customer Full Name
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Eduardo Ramos"
              className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="size-3.5 text-sub absolute left-3 top-3 pointer-events-none" />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+63 917 555 9876"
                className="w-full h-9 pl-9 pr-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink tabular-nums focus:border-cobalt focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
              Vehicle Model of Interest
            </label>
            <div className="relative">
              <Car className="size-3.5 text-sub absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                value={modelInterest}
                onChange={(e) => setModelInterest(e.target.value)}
                placeholder="e.g. Toyota Land Cruiser Prado"
                className="w-full h-9 pl-9 pr-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
              Inquiry Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SOURCES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSource(s.value)}
                  className={`p-2 rounded-control border text-xs text-center transition-all ${
                    source === s.value
                      ? 'border-cobalt bg-cobalt-tint text-cobalt font-bold'
                      : 'border-line bg-paper text-sub hover:bg-wash'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
              Observation / Floor Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Walked in with family, interested in 3-row SUV with 4x4 capability."
              className="w-full p-2.5 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-sub hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!nextUpAgent}
              className="px-4 py-2 text-xs font-bold rounded-control bg-cobalt hover:bg-cobalt-press disabled:opacity-50 text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="size-3.5" /> Assign to {nextUpAgent ? nextUpAgent.agentName : 'Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
