import React from 'react';
import type { CommissionRecord } from '../../types/commission';
import { formatPeso } from '../../data/seed';

interface GsmPayrollRowProps {
  record: CommissionRecord;
  onApprove: (id: string) => void;
  onSelectCommission: (record: CommissionRecord) => void;
}

export const GsmPayrollRow: React.FC<GsmPayrollRowProps> = ({
  record: c,
  onApprove,
  onSelectCommission,
}) => {
  return (
    <tr className="hover:bg-wash/60 transition-colors">
      <td className="p-2.5 font-bold text-ink whitespace-nowrap">{c.salesConsultantName}</td>
      <td className="p-2.5 whitespace-nowrap">
        <button
          type="button"
          onClick={() => onSelectCommission(c)}
          className="font-semibold text-cobalt hover:underline text-left"
        >
          {c.customerName}
        </button>
        <p className="text-[10px] text-sub">{c.vehicleModel}</p>
      </td>
      <td className="p-2.5 font-display text-xs font-bold tabular-nums text-ink">
        {formatPeso(c.baseUnitCommission)}
      </td>
      <td className="p-2.5 whitespace-nowrap">
        <span className="text-[10px] text-won font-bold block">Agent 20%: +{formatPeso(c.bankReserveSplit.agentShare)}</span>
        <span className="text-[9.5px] text-sub">House: {formatPeso(c.bankReserveSplit.dealershipShare)}</span>
      </td>
      <td className="p-2.5 font-display text-xs font-bold tabular-nums text-ink">
        {formatPeso(c.totalAgentPayout)}
      </td>
      <td className="p-2.5 font-display text-xs font-bold tabular-nums text-cobalt">
        +{formatPeso(c.gsmOverrideAmount)}
      </td>
      <td className="p-2.5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
          c.status === 'paid'
            ? 'bg-won/10 text-won'
            : c.status === 'gsm_approved'
            ? 'bg-cobalt-tint text-cobalt'
            : c.status === 'ready_for_payout'
            ? 'bg-due/10 text-due'
            : 'bg-wash text-sub'
        }`}>
          {c.status.replace(/_/g, ' ')}
        </span>
      </td>
      <td className="p-2.5 text-right whitespace-nowrap">
        {c.status === 'ready_for_payout' ? (
          <button
            type="button"
            onClick={() => onApprove(c.id)}
            className="px-2.5 py-1 text-[11px] font-bold bg-cobalt hover:bg-cobalt-press text-white rounded shadow-sm transition-colors"
          >
            Approve
          </button>
        ) : (
          <span className="text-[10px] text-sub font-semibold">Cleared</span>
        )}
      </td>
    </tr>
  );
};
