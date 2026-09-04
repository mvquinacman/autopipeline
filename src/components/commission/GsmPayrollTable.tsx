import React from 'react';
import type { CommissionRecord } from '../../types/commission';
import { Download, CheckCircle2 } from 'lucide-react';
import { commissionService } from '../../services/commissionService';
import { GsmPayrollRow } from './GsmPayrollRow';

interface GsmPayrollTableProps {
  commissions: CommissionRecord[];
  onApprove: (id: string) => void;
  onBatchApprove: (ids: string[]) => void;
  onSelectCommission: (record: CommissionRecord) => void;
}

export const GsmPayrollTable: React.FC<GsmPayrollTableProps> = ({
  commissions,
  onApprove,
  onBatchApprove,
  onSelectCommission,
}) => {
  const pendingReady = commissions.filter((c) => c.status === 'ready_for_payout');

  return (
    <div className="bg-card border border-line rounded-card p-4 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <h3 className="text-sm font-bold text-ink">Dealership Commission &amp; Incentive Ledger</h3>
          <p className="text-xs text-sub">GSM Authorization &amp; Bank Financing Reserve Clearance</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingReady.length > 0 && (
            <button
              type="button"
              onClick={() => onBatchApprove(pendingReady.map((c) => c.id))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Approve All ({pendingReady.length})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => commissionService.exportPayrollCsv(commissions)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors"
          >
            <Download className="size-3.5 text-sub" />
            <span>Export Payroll CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-line rounded-control">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-paper border-b border-line text-[10.5px] uppercase font-bold text-sub tracking-wider">
              <th className="p-2.5">Consultant</th>
              <th className="p-2.5">Deal / Customer</th>
              <th className="p-2.5">Base Unit</th>
              <th className="p-2.5">F&amp;I Reserve Split (20/30/50)</th>
              <th className="p-2.5">Total Agent</th>
              <th className="p-2.5">GSM Override</th>
              <th className="p-2.5">Status</th>
              <th className="p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {commissions.map((c) => (
              <GsmPayrollRow
                key={c.id}
                record={c}
                onApprove={onApprove}
                onSelectCommission={onSelectCommission}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
