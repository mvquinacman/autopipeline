import React from 'react';
import type { CommissionRecord } from '../../types/commission';
import { formatPeso } from '../../data/seed';
import { X, Receipt, Printer } from 'lucide-react';

interface CommissionSlipModalProps {
  isOpen: boolean;
  commission: CommissionRecord | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
}

export const CommissionSlipModal: React.FC<CommissionSlipModalProps> = ({
  isOpen,
  commission,
  onClose,
  onApprove,
}) => {
  if (!isOpen || !commission) return null;

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-control bg-cobalt-tint text-cobalt"><Receipt className="size-4" /></div>
            <div>
              <h3 className="text-sm font-bold text-ink">Commission Voucher &amp; Payout Slip</h3>
              <p className="text-[11px] text-sub font-mono">{commission.id} • Ref: {commission.vin}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-control hover:bg-line text-sub"><X className="size-4" /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          <div className="bg-paper p-3 rounded-control border border-line space-y-1">
            <div className="flex justify-between font-bold text-ink text-sm">
              <span>{commission.customerName}</span>
              <span className="font-display text-base tabular-nums">{formatPeso(commission.dealValue)}</span>
            </div>
            <p className="text-sub">{commission.vehicleModel} ({commission.variant})</p>
            <p className="text-[11px] text-sub">Consultant: <strong className="text-ink">{commission.salesConsultantName}</strong></p>
          </div>

          <div className="space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">Compensation Breakdown</span>
            <div className="divide-y divide-line/60 border border-line rounded-control p-2.5 space-y-2 bg-paper/50">
              <div className="flex justify-between pt-1">
                <span className="text-sub">Base Unit Sales Commission:</span>
                <span className="font-bold font-display text-ink tabular-nums">{formatPeso(commission.baseUnitCommission)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <div>
                  <span className="text-sub block">F&amp;I Bank Reserve Share (20%):</span>
                  <span className="text-[10px] text-sub">Total PO Reserve: {formatPeso(commission.bankFinancingReserveTotal)}</span>
                </div>
                <span className="font-bold font-display text-won tabular-nums">+{formatPeso(commission.bankReserveSplit.agentShare)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sub">Genuine Accessories (5%):</span>
                <span className="font-bold font-display text-ink tabular-nums">+{formatPeso(commission.accessoriesCommission)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sub">Service Drive Buyback Bounty:</span>
                <span className="font-bold font-display text-ink tabular-nums">+{formatPeso(commission.serviceDriveSpotterBounty)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-line text-sm">
                <span className="font-bold text-ink">Total Sales Consultant Payout:</span>
                <span className="font-bold font-display text-cobalt text-lg tabular-nums">{formatPeso(commission.totalAgentPayout)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-wash/60 rounded-control border border-line text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-sub">Dealership Retention (50%):</span>
              <strong className="text-ink font-display">{formatPeso(commission.bankReserveSplit.dealershipShare)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-sub">GSM Management Override:</span>
              <strong className="text-cobalt font-display">+{formatPeso(commission.gsmOverrideAmount)}</strong>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-line bg-paper flex items-center justify-between">
          <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line">
            <Printer className="size-3.5" /> Print Voucher
          </button>
          <div className="flex gap-2">
            {commission.status === 'ready_for_payout' && onApprove && (
              <button type="button" onClick={() => { onApprove(commission.id); onClose(); }} className="px-3 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm">
                Authorize Payout
              </button>
            )}
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
