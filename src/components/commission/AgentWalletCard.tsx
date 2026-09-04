import React from 'react';
import type { CommissionRecord } from '../../types/commission';
import { formatPeso } from '../../data/seed';
import { Wallet } from 'lucide-react';

interface AgentWalletCardProps {
  commissions: CommissionRecord[];
  agentName: string;
  onSelectCommission?: (record: CommissionRecord) => void;
}

export const AgentWalletCard: React.FC<AgentWalletCardProps> = ({
  commissions,
  agentName,
  onSelectCommission,
}) => {
  const mtdEarned = commissions
    .filter((c) => c.status === 'gsm_approved' || c.status === 'paid' || c.status === 'ready_for_payout')
    .reduce((sum, c) => sum + c.totalAgentPayout, 0);

  const pendingRelease = commissions
    .filter((c) => c.status === 'pending_release')
    .reduce((sum, c) => sum + c.totalAgentPayout, 0);

  const totalBankShare = commissions.reduce((sum, c) => sum + c.bankReserveSplit.agentShare, 0);
  const totalBaseUnit = commissions.reduce((sum, c) => sum + c.baseUnitCommission, 0);
  const totalBounties = commissions.reduce((sum, c) => sum + c.serviceDriveSpotterBounty + c.accessoriesCommission, 0);

  return (
    <div className="bg-card border border-line rounded-card p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-control bg-cobalt-tint text-cobalt">
            <Wallet className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">My Earnings Wallet</h3>
            <p className="text-xs text-sub">{agentName} • Sales Consultant Payouts</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">MTD Net Earnings</span>
          <span className="font-display text-2xl font-bold text-cobalt tabular-nums">
            {formatPeso(mtdEarned)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-paper p-2.5 rounded-control border border-line">
          <span className="text-[10.5px] uppercase font-semibold text-sub block">Base Unit Cut</span>
          <span className="font-display text-base font-bold text-ink tabular-nums">{formatPeso(totalBaseUnit)}</span>
        </div>
        <div className="bg-paper p-2.5 rounded-control border border-line">
          <span className="text-[10.5px] uppercase font-semibold text-sub block">F&amp;I Bank Share (20%)</span>
          <span className="font-display text-base font-bold text-won tabular-nums">+{formatPeso(totalBankShare)}</span>
        </div>
        <div className="bg-paper p-2.5 rounded-control border border-line">
          <span className="text-[10.5px] uppercase font-semibold text-sub block">Acc. &amp; Spotters</span>
          <span className="font-display text-base font-bold text-ink tabular-nums">+{formatPeso(totalBounties)}</span>
        </div>
        <div className="bg-paper p-2.5 rounded-control border border-line">
          <span className="text-[10.5px] uppercase font-semibold text-sub block">Pending Release</span>
          <span className="font-display text-base font-bold text-due tabular-nums">{formatPeso(pendingRelease)}</span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">Recent Deal Commissions</span>
        {commissions.length === 0 ? (
          <p className="text-xs text-sub py-3 text-center">No commission records found for this period.</p>
        ) : (
          <div className="divide-y divide-line/60 border border-line rounded-control overflow-hidden">
            {commissions.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelectCommission?.(record)}
                className="w-full flex items-center justify-between p-2.5 text-left hover:bg-wash transition-colors group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-ink truncate">{record.customerName}</span>
                    <span className="text-[10px] text-sub truncate">({record.vehicleModel})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10.5px] text-sub">
                    <span>Base: {formatPeso(record.baseUnitCommission)}</span>
                    <span>•</span>
                    <span>Bank PO: +{formatPeso(record.bankReserveSplit.agentShare)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span className="font-display text-sm font-bold text-ink tabular-nums block">
                      {formatPeso(record.totalAgentPayout)}
                    </span>
                    <span className={`text-[10px] font-bold capitalize ${
                      record.status === 'paid' ? 'text-won' : record.status === 'gsm_approved' ? 'text-cobalt' : 'text-due'
                    }`}>
                      {record.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
