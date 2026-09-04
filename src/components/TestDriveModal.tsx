import { useState } from 'react';
import type { Lead } from '../types/crm';
import { Compass, X, Check } from 'lucide-react';

interface TestDriveModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onScheduleTestDrive: (leadId: string, unitName: string, date: string, licenseNo: string) => void;
}

const DEMO_FLEET = [
  'Fortuner 2.8 LTD 4x4 Demo #1 (NFO-2819)',
  'Hilux GR-S Demo #2 (NGR-4410)',
  'Land Cruiser Prado Demo #3 (LCP-9901)',
  'RAV4 Hybrid Demo #4 (NRV-1102)',
  'Corolla Cross HEV Demo #5 (NCC-8821)',
  'Vios 1.5 G Demo #6 (NVS-3312)',
];

export function TestDriveModal({
  isOpen,
  lead,
  onClose,
  onScheduleTestDrive,
}: TestDriveModalProps) {
  const [selectedUnit, setSelectedUnit] = useState(DEMO_FLEET[0]);
  const [scheduledDate, setScheduledDate] = useState('2026-09-05T14:00');
  const [licenseNo, setLicenseNo] = useState('');
  const [hasWaiver, setHasWaiver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNo.trim()) {
      setErrorMsg("Customer's Driver's License Number is strictly required.");
      return;
    }
    if (!hasWaiver) {
      setErrorMsg('Liability waiver acknowledgement must be verified.');
      return;
    }

    onScheduleTestDrive(lead.id, selectedUnit, scheduledDate, licenseNo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Compass className="size-5 text-cobalt" />
            <h3 className="font-display text-xl font-bold text-ink">Schedule Showroom Test Drive</h3>
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
          <div className="bg-wash/60 p-3 rounded-control flex justify-between items-center">
            <div>
              <p className="font-bold text-ink">{lead.customerName}</p>
              <p className="text-sub">Model of Interest: {lead.modelInterest}</p>
            </div>
            <span className="text-[10px] uppercase font-bold text-cobalt bg-cobalt-tint px-2 py-0.5 rounded-full">
              {lead.stage}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Select Available Demo Fleet Unit *</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full h-10 sm:h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none"
            >
              {DEMO_FLEET.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-ink mb-1">Preferred Date &amp; Time *</label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full h-10 sm:h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Driver's License No. *</label>
              <input
                type="text"
                required
                value={licenseNo}
                onChange={(e) => {
                  setLicenseNo(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. N02-18-092812"
                className="w-full h-10 sm:h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-start gap-2 pt-2 border-t border-line cursor-pointer">
            <input
              type="checkbox"
              checked={hasWaiver}
              onChange={(e) => {
                setHasWaiver(e.target.checked);
                setErrorMsg('');
              }}
              className="mt-0.5 rounded border-line text-cobalt focus:ring-cobalt"
            />
            <span className="text-[11px] font-medium text-ink">
              Verified: Customer presented valid driver's license and signed the Showroom Test Drive Liability Waiver.
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-sub hover:text-ink min-h-[44px] sm:min-h-0">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-control bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
            >
              <Check className="size-3.5" /> Book Demo Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
