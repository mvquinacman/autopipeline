import React, { useState, useEffect, useCallback } from 'react';
import type { Profile } from '../types/crm';
import type { CommissionRecord } from '../types/commission';
import { commissionService } from '../services/commissionService';
import { AgentWalletCard } from './commission/AgentWalletCard';
import { GsmPayrollTable } from './commission/GsmPayrollTable';
import { CommissionSlipModal } from './commission/CommissionSlipModal';
import { formatPeso } from '../data/seed';

interface CommissionsViewProps {
  currentProfile: Profile;
}

export const CommissionsView: React.FC<CommissionsViewProps> = ({ currentProfile }) => {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [selectedCommission, setSelectedCommission] = useState<CommissionRecord | null>(null);

  const loadData = useCallback(async () => {
    const list = await commissionService.getCommissions(currentProfile.role, currentProfile.id);
    setCommissions(list);
  }, [currentProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    await commissionService.approveCommission(id, currentProfile.fullName);
    await loadData();
  };

  const handleBatchApprove = async (ids: string[]) => {
    await commissionService.batchApproveCommissions(ids, currentProfile.fullName);
    await loadData();
  };

  const kpis = commissionService.calculateKpis(commissions, currentProfile.role, currentProfile.id);

  return (
    <div className="space-y-6">
      {/* KPI Spec Strip */}
      <div className="bg-card border border-line rounded-card divide-y md:divide-y-0 md:divide-x divide-line grid grid-cols-2 md:grid-cols-4 shadow-sm">
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">MTD Payout</span>
          <span className="font-display text-2xl font-bold text-ink tabular-nums block">{formatPeso(kpis.mtdEarnedAgent)}</span>
          <span className="text-[10.5px] text-won font-medium">Cleared for disbursement</span>
        </div>
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">Pending Release</span>
          <span className="font-display text-2xl font-bold text-due tabular-nums block">{formatPeso(kpis.pendingReleaseValue)}</span>
          <span className="text-[10.5px] text-sub">Awaiting Gate Pass clearance</span>
        </div>
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">GSM Approved</span>
          <span className="font-display text-2xl font-bold text-cobalt tabular-nums block">{formatPeso(kpis.approvedPayoutValue)}</span>
          <span className="text-[10.5px] text-sub">Ready for bank batch transfer</span>
        </div>
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sub block">Total Dealership Outlay</span>
          <span className="font-display text-2xl font-bold text-ink tabular-nums block">{formatPeso(kpis.totalDealershipPayroll)}</span>
          <span className="text-[10.5px] text-sub">{kpis.dealsCount} Total deals logged</span>
        </div>
      </div>

      {/* Role-Scoped Main Ledger */}
      {currentProfile.role === 'agent' ? (
        <AgentWalletCard
          commissions={commissions}
          agentName={currentProfile.fullName}
          onSelectCommission={(c) => setSelectedCommission(c)}
        />
      ) : (
        <div className="space-y-6">
          <GsmPayrollTable
            commissions={commissions}
            onApprove={handleApprove}
            onBatchApprove={handleBatchApprove}
            onSelectCommission={(c) => setSelectedCommission(c)}
          />
        </div>
      )}

      <CommissionSlipModal
        isOpen={!!selectedCommission}
        commission={selectedCommission}
        onClose={() => setSelectedCommission(null)}
        onApprove={currentProfile.role !== 'agent' ? handleApprove : undefined}
      />
    </div>
  );
};
