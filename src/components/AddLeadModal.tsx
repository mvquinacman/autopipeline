import React, { useState, useEffect } from 'react';
import { Profile, Lead } from '../types/crm';
import { leadService, DuplicateCheckResult } from '../services/leadService';
import { DuplicateGuardBanner } from './DuplicateGuardBanner';
import { CheckCircle2, UserPlus, X, ChevronDown } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface AddLeadModalProps {
  isOpen: boolean;
  currentProfile: Profile;
  onClose: () => void;
  onLeadCreated: (lead: Lead) => void;
}

const VEHICLE_MODELS = [
  { name: 'Toyota Fortuner 2.8 LTD', price: 2630000 },
  { name: 'Toyota Hilux GR-S 4x4', price: 2186000 },
  { name: 'Toyota Land Cruiser Prado', price: 4500000 },
  { name: 'Toyota RAV4 HEV LTD', price: 2621000 },
  { name: 'Toyota Corolla Cross HEV', price: 1815000 },
  { name: 'Toyota Vios 1.5 G CVT', price: 1039000 },
];

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  currentProfile,
  onClose,
  onLeadCreated,
}) => {
  useBodyScrollLock(isOpen);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [modelInterest, setModelInterest] = useState(VEHICLE_MODELS[0].name);
  const [estValue, setEstValue] = useState(VEHICLE_MODELS[0].price);
  const [source, setSource] = useState('walk_in');
  const [notes, setNotes] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState<DuplicateCheckResult>({ isDuplicate: false });
  const [allowOverride, setAllowOverride] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live duplicate phone check with debounce
  useEffect(() => {
    if (!customerPhone || customerPhone.length < 7) {
      setDuplicateCheck({ isDuplicate: false });
      return;
    }
    const timer = setTimeout(() => {
      leadService.checkDuplicate(customerPhone).then((res) => {
        setDuplicateCheck(res);
        if (!res.isDuplicate) setAllowOverride(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [customerPhone]);

  if (!isOpen) return null;

  const handleModelChange = (modelName: string) => {
    setModelInterest(modelName);
    const found = VEHICLE_MODELS.find((m) => m.name === modelName);
    if (found) setEstValue(found.price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (duplicateCheck.isDuplicate && !allowOverride) {
      setErrorMsg('Cannot create duplicate lead without explicit override.');
      return;
    }

    try {
      const newLead = await leadService.createLead(
        {
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          modelInterest,
          estValue,
          source,
          notes: notes.trim() || undefined,
        },
        currentProfile.id,
        currentProfile.fullName
      );
      onLeadCreated(newLead);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create lead');
    }
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-ink/50 backdrop-blur-sm animate-fade-in overscroll-none touch-none">
      <div className="bg-card border border-line rounded-card max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90dvh] modal-scroll-container touch-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="size-5 text-cobalt" />
            <h3 className="font-display text-xl font-bold text-ink">Add New Lead</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash">
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-overdue/10 border border-overdue/20 rounded-control text-xs text-overdue">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full h-10 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Mobile Phone *</label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +63 917 123 4567"
                className="w-full h-10 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
          </div>

          {/* Live Duplicate Guard Warning Banner */}
          <DuplicateGuardBanner
            duplicateCheck={duplicateCheck}
            allowOverride={allowOverride}
            onToggleOverride={setAllowOverride}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Model of Interest</label>
              <div className="relative">
                <select
                  value={modelInterest}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full h-10 pl-3 pr-10 appearance-none rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-2 focus:ring-cobalt focus:outline-none cursor-pointer"
                >
                  {VEHICLE_MODELS.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-sub pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Estimated Value (PHP)</label>
              <input
                type="number"
                value={estValue}
                onChange={(e) => setEstValue(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink tabular-nums font-semibold focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Email Address (Optional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full h-10 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Lead Source</label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full h-10 pl-3 pr-10 appearance-none rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-2 focus:ring-cobalt focus:outline-none cursor-pointer"
                >
                  <option value="walk_in">Showroom Walk-in</option>
                  <option value="facebook">Facebook / Social</option>
                  <option value="website">Dealership Website</option>
                  <option value="referral">Client Referral</option>
                  <option value="repeat_buyer">Repeat Buyer</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-sub pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Initial Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Financing pre-qualification, preferred color, trade-in details..."
              rows={2}
              className="w-full p-2.5 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-2 focus:ring-cobalt focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-control font-semibold text-ink bg-wash border border-line hover:bg-line/50 min-h-[44px] sm:min-h-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={duplicateCheck.isDuplicate && !allowOverride}
              className="flex items-center gap-1.5 px-4 py-2 rounded-control font-bold text-white bg-cobalt hover:bg-cobalt-press disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] sm:min-h-0"
            >
              <CheckCircle2 className="size-4" /> Save New Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
