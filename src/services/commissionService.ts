import { SEED_COMMISSIONS } from '../data/seedCommission';
import type { CommissionRecord, CommissionKpiSummary } from '../types/commission';
import type { Lead, Role } from '../types/crm';

let commissionsStore: CommissionRecord[] = JSON.parse(JSON.stringify(SEED_COMMISSIONS));

export function getBaseUnitCommission(modelInterest: string): { baseUnit: number; gsmOverride: number } {
  const lower = modelInterest.toLowerCase();
  if (lower.includes('vios') || lower.includes('wigo')) {
    return { baseUnit: 5_000, gsmOverride: 1_000 };
  }
  if (lower.includes('cross') || lower.includes('yaris')) {
    return { baseUnit: 8_000, gsmOverride: 1_200 };
  }
  if (lower.includes('fortuner') || lower.includes('hilux') || lower.includes('rav4') || lower.includes('innova') || lower.includes('hiace')) {
    return { baseUnit: 12_000, gsmOverride: 1_500 };
  }
  if (lower.includes('prado') || lower.includes('land cruiser') || lower.includes('alphard')) {
    return { baseUnit: 20_000, gsmOverride: 2_500 };
  }
  return { baseUnit: 10_000, gsmOverride: 1_500 };
}

export const commissionService = {
  async getCommissions(role?: Role, agentId?: string): Promise<CommissionRecord[]> {
    if (role === 'agent' && agentId) {
      return commissionsStore.filter((c) => c.salesConsultantId === agentId);
    }
    return [...commissionsStore];
  },

  async getCommissionForLead(leadId: string): Promise<CommissionRecord | undefined> {
    return commissionsStore.find((c) => c.leadId === leadId);
  },

  createCommissionForLead(
    lead: Lead,
    options?: {
      bankReserveTotal?: number;
      accessoriesValue?: number;
      isServiceDrive?: boolean;
      vin?: string;
      variant?: string;
    }
  ): CommissionRecord {
    const existing = commissionsStore.find((c) => c.leadId === lead.id);
    if (existing) return existing;

    const { baseUnit, gsmOverride } = getBaseUnitCommission(lead.modelInterest);
    const bankReserveTotal = options?.bankReserveTotal ?? 40_000;
    const accessoriesCommission = Math.round((options?.accessoriesValue ?? 30_000) * 0.05);
    const serviceDriveSpotterBounty = options?.isServiceDrive ? 5_000 : 0;

    const agentShare = Math.round(bankReserveTotal * 0.2);
    const fiShare = Math.round(bankReserveTotal * 0.3);
    const dealershipShare = bankReserveTotal - agentShare - fiShare;

    const totalAgentPayout = baseUnit + agentShare + accessoriesCommission + serviceDriveSpotterBounty;

    const record: CommissionRecord = {
      id: `comm-${Date.now()}`,
      leadId: lead.id,
      customerName: lead.customerName,
      vehicleModel: lead.modelInterest,
      variant: options?.variant || 'Standard Spec',
      vin: options?.vin || `MR0VIN${Date.now().toString().slice(-6)}`,
      salesConsultantId: lead.agentId || 'user-agent-1',
      salesConsultantName: lead.agentName || 'Paolo Morales',
      dealValue: lead.estValue,
      baseUnitCommission: baseUnit,
      bankFinancingReserveTotal: bankReserveTotal,
      bankReserveSplit: {
        totalReserve: bankReserveTotal,
        agentShare,
        fiShare,
        dealershipShare,
      },
      accessoriesCommission,
      serviceDriveSpotterBounty,
      totalAgentPayout,
      gsmOverrideAmount: gsmOverride,
      status: lead.stage === 'released' ? 'ready_for_payout' : 'pending_release',
      payoutDueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    commissionsStore = [record, ...commissionsStore];
    return record;
  },

  async approveCommission(commissionId: string, gsmName: string): Promise<CommissionRecord> {
    const index = commissionsStore.findIndex((c) => c.id === commissionId);
    if (index === -1) throw new Error('Commission not found');

    const updated: CommissionRecord = {
      ...commissionsStore[index],
      status: 'gsm_approved',
      approvedAt: new Date().toISOString(),
      approvedBy: gsmName,
    };
    commissionsStore[index] = updated;
    return updated;
  },

  async batchApproveCommissions(commissionIds: string[], gsmName: string): Promise<CommissionRecord[]> {
    const updated: CommissionRecord[] = [];
    for (const id of commissionIds) {
      try {
        const item = await this.approveCommission(id, gsmName);
        updated.push(item);
      } catch {
        // ignore individual errors
      }
    }
    return updated;
  },

  async markAsPaid(commissionId: string): Promise<CommissionRecord> {
    const index = commissionsStore.findIndex((c) => c.id === commissionId);
    if (index === -1) throw new Error('Commission not found');

    const updated: CommissionRecord = {
      ...commissionsStore[index],
      status: 'paid',
      paidAt: new Date().toISOString(),
    };
    commissionsStore[index] = updated;
    return updated;
  },

  calculateKpis(commissions: CommissionRecord[], role?: Role, agentId?: string): CommissionKpiSummary {
    const filtered = role === 'agent' && agentId
      ? commissions.filter((c) => c.salesConsultantId === agentId)
      : commissions;

    const mtdEarnedAgent = filtered
      .filter((c) => c.status === 'gsm_approved' || c.status === 'paid' || c.status === 'ready_for_payout')
      .reduce((sum, c) => sum + c.totalAgentPayout, 0);

    const pendingReleaseValue = filtered
      .filter((c) => c.status === 'pending_release')
      .reduce((sum, c) => sum + c.totalAgentPayout, 0);

    const approvedPayoutValue = filtered
      .filter((c) => c.status === 'gsm_approved')
      .reduce((sum, c) => sum + c.totalAgentPayout, 0);

    const totalDealershipPayroll = commissions
      .filter((c) => c.status !== 'pending_release')
      .reduce((sum, c) => sum + c.totalAgentPayout + c.gsmOverrideAmount, 0);

    return {
      mtdEarnedAgent,
      pendingReleaseValue,
      approvedPayoutValue,
      totalDealershipPayroll,
      dealsCount: filtered.length,
    };
  },

  exportPayrollCsv(commissions: CommissionRecord[], filename = 'toyota-bgc-commission-payroll.csv'): void {
    const headers = [
      'Commission ID',
      'Status',
      'Sales Consultant',
      'Customer',
      'Vehicle Model',
      'VIN',
      'Deal Value',
      'Base Commission',
      'Bank Reserve Total',
      'Agent Bank Share (20%)',
      'F&I Share (30%)',
      'Dealership Share (50%)',
      'Accessories Cut',
      'Service Spotter Bounty',
      'Total Agent Payout',
      'GSM Override',
      'Payout Due Date',
    ];

    const rows = commissions.map((c) => [
      c.id,
      c.status,
      `"${c.salesConsultantName}"`,
      `"${c.customerName}"`,
      `"${c.vehicleModel}"`,
      c.vin,
      c.dealValue,
      c.baseUnitCommission,
      c.bankFinancingReserveTotal,
      c.bankReserveSplit.agentShare,
      c.bankReserveSplit.fiShare,
      c.bankReserveSplit.dealershipShare,
      c.accessoriesCommission,
      c.serviceDriveSpotterBounty,
      c.totalAgentPayout,
      c.gsmOverrideAmount,
      c.payoutDueDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  resetStore(): void {
    commissionsStore = JSON.parse(JSON.stringify(SEED_COMMISSIONS));
  },
};
