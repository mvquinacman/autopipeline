import { useState, useMemo } from 'react';
import type { Lead } from '../types/crm';
import type { DownPaymentPercent, LoanTerm } from '../types/financing';
import { financingService, BANK_PRESETS } from '../services/financingService';
import { formatPeso } from '../data/seed';
import { Calculator, X, Check } from 'lucide-react';

interface FinancingCalculatorModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onSaveQuotation: (leadId: string, note: string) => void;
}

export function FinancingCalculatorModal({
  isOpen,
  lead,
  onClose,
  onSaveQuotation,
}: FinancingCalculatorModalProps) {
  const [dpPercent, setDpPercent] = useState<DownPaymentPercent>(20);
  const [termMonths, setTermMonths] = useState<LoanTerm>(60);
  const [bankId, setBankId] = useState('metrobank');
  const includeInsurance = true;
  const includeChattel = true;

  const calc = useMemo(() => {
    if (!lead) return null;
    const tradeInEquity = lead.netTradeInEquity ?? 0;
    return financingService.calculate(
      lead.estValue,
      dpPercent,
      termMonths,
      bankId,
      includeInsurance,
      includeChattel,
      tradeInEquity
    );
  }, [lead, dpPercent, termMonths, bankId, includeInsurance, includeChattel]);

  if (!isOpen || !lead || !calc) return null;

  const handleSave = () => {
    const note = financingService.formatQuotationNote(calc);
    onSaveQuotation(lead.id, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-cobalt" />
            <h3 className="font-display text-xl font-bold text-ink">F&amp;I Loan Calculator</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash">
            <X className="size-5" />
          </button>
        </div>

        {/* Lead Context */}
        <div className="bg-wash/60 p-3 rounded-control flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-ink">{lead.customerName}</p>
            <p className="text-sub">{lead.modelInterest}</p>
          </div>
          <div className="text-right">
            <p className="text-sub uppercase text-[10px] font-semibold">Vehicle SRP</p>
            <p className="font-bold text-ink tabular-nums">{formatPeso(lead.estValue)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-ink mb-1.5">Down Payment</label>
            <div className="grid grid-cols-4 gap-1.5">
              {([15, 20, 30, 50] as DownPaymentPercent[]).map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDpPercent(pct)}
                  className={`py-1.5 px-1 rounded-control font-bold transition-colors text-center ${
                    dpPercent === pct ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
                  }`}
                >
                  <span className="block text-xs">{pct}%</span>
                  <span className="block text-[10px] opacity-80 tabular-nums">
                    {formatPeso(Math.round(lead.estValue * (pct / 100)), true)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1.5">Loan Term</label>
            <div className="grid grid-cols-4 gap-1.5">
              {([24, 36, 48, 60] as LoanTerm[]).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setTermMonths(term)}
                  className={`py-1.5 px-1 rounded-control font-bold transition-colors text-center ${
                    termMonths === term ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
                  }`}
                >
                  <span className="block text-xs">{term} Mos</span>
                  <span className="block text-[10px] opacity-80">
                    {term / 12} Yrs
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1.5">Financing Partner Bank</label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="w-full h-10 sm:h-9 px-3 rounded-control border border-line bg-paper text-base sm:text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none"
            >
              {BANK_PRESETS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.rates[termMonths]}% p.a.)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Spec Sheet Strip */}
        <div className="bg-paper border border-line rounded-control p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-line pb-2">
            <span className="text-xs font-medium text-sub">Estimated Monthly Amortization</span>
            <span className="font-display text-2xl font-bold text-cobalt tabular-nums">
              {formatPeso(calc.monthlyAmortization)}
              <span className="text-xs font-normal text-sub font-sans">/mo</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-sub">Down Payment:</span>
              <span className="font-semibold tabular-nums text-ink">{formatPeso(calc.downPaymentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sub">Loan Amount:</span>
              <span className="font-semibold tabular-nums text-ink">{formatPeso(calc.loanAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sub">Chattel Fee:</span>
              <span className="font-semibold tabular-nums text-ink">{formatPeso(calc.chattelMortgageFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sub">Insurance (1yr):</span>
              <span className="font-semibold tabular-nums text-ink">{formatPeso(calc.comprehensiveInsurance)}</span>
            </div>
          </div>
          {calc.tradeInEquityApplied ? (
            <div className="space-y-1.5 pt-2 border-t border-line">
              <div className="flex justify-between items-center text-xs">
                <span className="text-sub">Gross Cash Outlay:</span>
                <span className="font-semibold tabular-nums text-ink">{formatPeso(calc.totalCashOutlay)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-won font-semibold">
                <span>Less Trade-In Equity:</span>
                <span className="font-display tabular-nums">-{formatPeso(calc.tradeInEquityApplied)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-line/60 text-xs font-bold text-ink">
                <span>Net Drive-Away Cash Outlay:</span>
                <span className="text-base font-display text-cobalt tabular-nums">{formatPeso(calc.netCashOutlayRequired)}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center pt-2 border-t border-line text-xs font-bold text-ink">
              <span>Total Cash Outlay Required:</span>
              <span className="text-sm font-display text-ink tabular-nums">{formatPeso(calc.totalCashOutlay)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-sub hover:text-ink"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold rounded-control bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="size-3.5" /> Attach Quote to Lead
          </button>
        </div>
      </div>
    </div>
  );
}
