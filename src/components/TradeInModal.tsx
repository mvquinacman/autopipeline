import React, { useState, useEffect, useMemo } from 'react';
import type { Lead } from '../types/crm';
import type { VehicleCondition, TransmissionType, TradeInRecord } from '../types/tradeIn';
import { tradeInService, getCodingDay, calculateNetEquity } from '../services/tradeInService';
import { formatPeso } from '../data/seed';
import { Repeat, X, Check, AlertCircle } from 'lucide-react';

interface TradeInModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSaveAppraisal: (leadId: string, record: TradeInRecord) => void;
}

const CONDITIONS: { value: VehicleCondition; label: string; desc: string }[] = [
  { value: 'excellent', label: 'Excellent', desc: 'Casa maintained, 0 defects' },
  { value: 'good', label: 'Good', desc: 'Minor cosmetic wear, good tires' },
  { value: 'fair', label: 'Fair', desc: 'Requires detailing / brake pads' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear, pending repairs' },
];

export function TradeInModal({
  isOpen,
  lead,
  onClose,
  onSaveAppraisal,
}: TradeInModalProps) {
  const existingAppraisal = useMemo(() => {
    if (!lead) return null;
    return tradeInService.getAppraisalByLead(lead.id);
  }, [lead, isOpen]);

  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear() - 3);
  const [mileageKm, setMileageKm] = useState<number>(35000);
  const [plateEnding, setPlateEnding] = useState('4');
  const [transmission, setTransmission] = useState<TransmissionType>('automatic');
  const [condition, setCondition] = useState<VehicleCondition>('good');
  const [appraisedValue, setAppraisedValue] = useState<number>(500000);
  const [existingLoanBalance, setExistingLoanBalance] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync state when modal opens or lead changes
  useEffect(() => {
    if (existingAppraisal) {
      setMake(existingAppraisal.make);
      setModel(existingAppraisal.model);
      setYear(existingAppraisal.year);
      setMileageKm(existingAppraisal.mileageKm);
      setPlateEnding(existingAppraisal.plateEnding);
      setTransmission(existingAppraisal.transmission);
      setCondition(existingAppraisal.condition);
      setAppraisedValue(existingAppraisal.appraisedValue);
      setExistingLoanBalance(existingAppraisal.existingLoanBalance);
      setNotes(existingAppraisal.notes || '');
    } else {
      setMake('Toyota');
      setModel('');
      setYear(new Date().getFullYear() - 3);
      setMileageKm(35000);
      setPlateEnding('4');
      setTransmission('automatic');
      setCondition('good');
      setAppraisedValue(500000);
      setExistingLoanBalance(0);
      setNotes('');
    }
    setError(null);
  }, [existingAppraisal, isOpen]);

  const codingDay = useMemo(() => getCodingDay(plateEnding), [plateEnding]);
  const netTradeInEquity = useMemo(
    () => calculateNetEquity(appraisedValue, existingLoanBalance),
    [appraisedValue, existingLoanBalance]
  );

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make.trim() || !model.trim()) {
      setError('Make and model are required for vehicle valuation.');
      return;
    }
    if (appraisedValue <= 0) {
      setError('Appraised value must be greater than ₱0.');
      return;
    }

    const record = tradeInService.saveAppraisal({
      leadId: lead.id,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      mileageKm: Number(mileageKm),
      plateEnding: plateEnding.trim().slice(-1),
      transmission,
      condition,
      appraisedValue: Number(appraisedValue),
      existingLoanBalance: Number(existingLoanBalance),
      notes: notes.trim() || undefined,
      appraiserName: 'Used Car Valuation Desk',
    });

    onSaveAppraisal(lead.id, record);
    onClose();
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-xl w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-cobalt-tint flex items-center justify-center text-cobalt shrink-0">
              <Repeat className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Trade-In Appraisal Desk</h3>
              <p className="text-xs text-sub">Used vehicle valuation & chattel equity credit</p>
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

        {/* Lead Context Pill */}
        <div className="bg-paper border border-line rounded-control p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-sub">Customer:</span>{' '}
            <span className="font-semibold text-ink">{lead.customerName}</span>
          </div>
          <div>
            <span className="text-sub">Target Purchase:</span>{' '}
            <span className="font-semibold text-cobalt">{lead.modelInterest}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-overdue bg-overdue/10 border border-overdue/20 rounded-control p-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Make, Model, Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">Make</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                required
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">Model & Variant</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Vios 1.3 E"
                required
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">Year Model</label>
              <input
                type="number"
                min="1995"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none"
              />
            </div>
          </div>

          {/* Mileage, Plate Ending & Coding Day, Transmission */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">Odometer (KM)</label>
              <input
                type="number"
                min="0"
                step="500"
                value={mileageKm}
                onChange={(e) => setMileageKm(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink tabular-nums focus:border-cobalt focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-sub uppercase">Plate Ending</label>
                <span className="text-[10px] font-semibold text-cobalt bg-cobalt-tint px-1.5 py-0.2 rounded-full">
                  Coding: {codingDay}
                </span>
              </div>
              <input
                type="text"
                maxLength={4}
                value={plateEnding}
                onChange={(e) => setPlateEnding(e.target.value)}
                placeholder="e.g. 4 or ABC-1234"
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">Transmission</label>
              <div className="grid grid-cols-2 gap-1.5 bg-paper p-1 border border-line rounded-control h-9">
                <button
                  type="button"
                  onClick={() => setTransmission('automatic')}
                  className={`text-xs font-semibold rounded ${
                    transmission === 'automatic'
                      ? 'bg-card text-ink shadow-sm border border-line'
                      : 'text-sub hover:text-ink'
                  }`}
                >
                  AT
                </button>
                <button
                  type="button"
                  onClick={() => setTransmission('manual')}
                  className={`text-xs font-semibold rounded ${
                    transmission === 'manual'
                      ? 'bg-card text-ink shadow-sm border border-line'
                      : 'text-sub hover:text-ink'
                  }`}
                >
                  MT
                </button>
              </div>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1.5">Vehicle Condition</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  className={`p-2 rounded-control border text-left transition-all ${
                    condition === c.value
                      ? 'border-cobalt bg-cobalt-tint/30 text-ink'
                      : 'border-line bg-paper hover:bg-wash text-sub'
                  }`}
                >
                  <div className="text-xs font-bold text-ink">{c.label}</div>
                  <div className="text-[10px] text-sub leading-tight line-clamp-1">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Financials & Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                Gross Appraised Value (₱)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={appraisedValue}
                onChange={(e) => setAppraisedValue(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink font-semibold tabular-nums focus:border-cobalt focus:outline-none"
              />
              <span className="text-[10px] text-sub">{formatPeso(appraisedValue)}</span>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                Bank Loan Payoff Balance (₱)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={existingLoanBalance}
                onChange={(e) => setExistingLoanBalance(Number(e.target.value))}
                placeholder="0 if fully paid"
                className="w-full h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink font-semibold tabular-nums focus:border-cobalt focus:outline-none"
              />
              <span className="text-[10px] text-sub">
                {existingLoanBalance > 0 ? `${formatPeso(existingLoanBalance)} to clear chattel` : 'Fully paid (₱0 balance)'}
              </span>
            </div>
          </div>

          {/* Hero Equity Calculation Card */}
          <div className="bg-paper border border-line rounded-control p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sub">Gross Appraised Value:</span>
              <span className="font-semibold text-ink tabular-nums">{formatPeso(appraisedValue)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-sub">Less Existing Loan Payoff:</span>
              <span className="font-semibold text-overdue tabular-nums">
                -{formatPeso(existingLoanBalance)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-2">
              <div>
                <span className="text-xs font-bold text-ink block">Net Trade-In Equity Credit:</span>
                <span className="text-[10px] text-sub">Applies directly toward down payment</span>
              </div>
              <span className="font-display text-2xl font-bold text-won tabular-nums">
                {formatPeso(netTradeInEquity)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1">Appraisal Inspection Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Complete casa service booklet, original spare tire unused, minor bumper scuff."
              className="w-full p-2.5 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:border-cobalt focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
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
              className="px-4 py-2 text-xs font-bold rounded-control bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="size-3.5" /> Save Appraisal &amp; Apply Credit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
