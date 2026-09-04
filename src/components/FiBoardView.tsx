import React, { useState, useMemo } from 'react';
import type { Lead } from '../types/crm';
import type { BankApplicationStatus } from '../types/multiBank';
import { multiBankService } from '../services/multiBankService';
import { formatPeso } from '../data/seed';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';

interface FiBoardViewProps {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onOpenMatrix: (lead: Lead) => void;
}

export const FiBoardView: React.FC<FiBoardViewProps> = ({
  leads,
  onOpenLead,
  onOpenMatrix,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const partnerBanks = useMemo(() => multiBankService.getPartnerBanks(), []);
  const allOffers = useMemo(() => multiBankService.getOffers(), []);
  const kpis = useMemo(() => multiBankService.getFiKpis(), [allOffers]);

  const leadMap = useMemo(() => {
    const map = new Map<string, Lead>();
    leads.forEach((l) => map.set(l.id, l));
    return map;
  }, [leads]);

  const filteredOffers = useMemo(() => {
    if (statusFilter === 'all') return allOffers;
    return allOffers.filter((o) => o.status === statusFilter);
  }, [allOffers, statusFilter]);

  const getStatusBadge = (status: BankApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-won px-2 py-0.5 rounded-full shadow-sm">
            <CheckCircle2 className="size-3" /> Client Accepted
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-won bg-won/10 border border-won/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="size-3" /> Approved (PO Ready)
          </span>
        );
      case 'conditionally_approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-due bg-due/10 border border-due/20 px-2 py-0.5 rounded-full">
            <AlertCircle className="size-3" /> Conditional
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-lost bg-lost/10 border border-lost/20 px-2 py-0.5 rounded-full">
            <X className="size-3" /> Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stage-contacted bg-stage-contacted/10 border border-stage-contacted/20 px-2 py-0.5 rounded-full">
            <Clock className="size-3" /> In Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-control bg-cobalt-tint flex items-center justify-center text-cobalt shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                F&amp;I Desk • Multi-Bank Approval Board
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-wash rounded border border-line text-sub">
                Live Underwriting
              </span>
            </div>
            <p className="text-xs text-sub">
              Track auto loan submissions, accredited Philippine bank turnarounds, and dealer commission reserves.
            </p>
          </div>
        </div>
      </div>

      {/* F&I Spec-Sheet KPI Strip */}
      <div className="bg-card border border-line rounded-card shadow-sm grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-line">
        <div className="p-4 space-y-1">
          <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">
            Total Submissions
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-ink tabular-nums leading-none">
            {kpis.totalApplications}
          </p>
          <p className="text-[11px] text-sub">Across 6 partner banks</p>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">
            Loan Volume
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-ink tabular-nums leading-none">
            {formatPeso(kpis.totalUnderwritingVolume, true)}
          </p>
          <p className="text-[11px] text-sub">In active underwriting</p>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">
            Approved (PO Ready)
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-won tabular-nums leading-none">
            {kpis.approvedCount} Units
          </p>
          <p className="text-[11px] text-sub font-medium">{formatPeso(kpis.approvedValue, true)} approved</p>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">
            Avg Turnaround
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-ink tabular-nums leading-none">
            {kpis.averageTurnaroundHours} hrs
          </p>
          <p className="text-[11px] text-won font-medium">Below 24h SLA threshold</p>
        </div>

        <div className="p-4 space-y-1 col-span-2 md:col-span-1">
          <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider block">
            Projected F&amp;I Reserve
          </span>
          <p className="font-display text-2xl sm:text-3xl font-bold text-won tabular-nums leading-none">
            +{formatPeso(kpis.projectedDealerCommission, true)}
          </p>
          <p className="text-[11px] text-sub">Dealer commission pool</p>
        </div>
      </div>

      {/* Partner Banks Scorecard */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
          Accredited Philippine Partner Banks ({partnerBanks.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {partnerBanks.map((bank) => (
            <div
              key={bank.id}
              className="bg-card border border-line rounded-control p-3.5 space-y-3 shadow-sm hover:border-line/80 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-bold text-ink">{bank.name}</p>
                  <p className="text-[11px] text-sub font-medium">{bank.averageTurnaroundHours}h avg response time</p>
                </div>
                <span className="text-[10px] font-bold text-won bg-won/10 px-2 py-0.5 rounded-full border border-won/20">
                  {bank.approvalRatePct}% Approval
                </span>
              </div>

              <div className="bg-paper border border-line rounded p-2 text-xs flex items-center justify-between">
                <span className="text-sub font-medium">Dealer Reserve:</span>
                <span className="font-bold text-won font-mono">{bank.defaultCommissionPct}%</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-sub pt-1 border-t border-line">
                <span className="font-medium text-ink truncate mr-2">{bank.loanOfficer.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${bank.loanOfficer.phone}`}
                    className="p-1 hover:bg-wash rounded text-sub hover:text-cobalt transition-colors"
                    title={`Call ${bank.loanOfficer.phone}`}
                  >
                    <Phone className="size-3" />
                  </a>
                  <a
                    href={`mailto:${bank.loanOfficer.email}`}
                    className="p-1 hover:bg-wash rounded text-sub hover:text-cobalt transition-colors"
                    title={`Email ${bank.loanOfficer.email}`}
                  >
                    <Mail className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Applications Roster */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
            Live Financing Applications ({filteredOffers.length})
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'in_review', label: 'In Review' },
              { id: 'conditionally_approved', label: 'Conditional' },
              { id: 'approved', label: 'Approved' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'declined', label: 'Declined' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-control font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-ink text-white shadow-sm'
                    : 'bg-card text-sub hover:text-ink border border-line'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOffers.length === 0 ? (
          <div className="p-8 text-center bg-card border border-line rounded-card text-sub text-xs">
            No applications found matching the selected filter.
          </div>
        ) : (
          <div className="bg-card border border-line rounded-card overflow-hidden shadow-sm divide-y divide-line">
            {filteredOffers.map((offer) => {
              const lead = leadMap.get(offer.leadId);
              return (
                <div
                  key={offer.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-wash/50 transition-colors"
                >
                  <div className="space-y-1 min-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">
                        {lead ? lead.customerName : 'Walk-in Prospect'}
                      </span>
                      {getStatusBadge(offer.status)}
                    </div>
                    <p className="text-xs text-sub">
                      {lead?.modelInterest || 'Vehicle Interested'} • MSRP {formatPeso(offer.vehiclePrice)}
                    </p>
                    <p className="text-[11px] text-sub">
                      Submitted to <span className="font-semibold text-ink">{offer.bankName}</span> on{' '}
                      {new Date(offer.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs md:text-center">
                    <div>
                      <span className="text-[10px] text-sub uppercase block">Monthly Payment</span>
                      <span className="font-display text-base font-bold text-ink tabular-nums">
                        {formatPeso(offer.monthlyAmortization)}
                      </span>
                      <span className="text-[10px] text-sub block">/mo</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-sub uppercase block">Down Payment</span>
                      <span className="font-semibold text-ink tabular-nums">
                        {offer.downPaymentPercent}%
                      </span>
                      <span className="text-[10px] text-sub block">
                        {formatPeso(offer.downPaymentAmount, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-sub uppercase block">Dealer Reserve</span>
                      <span className="font-bold text-won font-mono">
                        +{formatPeso(offer.dealerCommissionAmount)}
                      </span>
                      <span className="text-[10px] text-sub block">{offer.dealerCommissionRate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {lead && (
                      <button
                        type="button"
                        onClick={() => onOpenMatrix(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[36px]"
                      >
                        <span>Open Matrix</span>
                        <ChevronRight className="size-3.5" />
                      </button>
                    )}
                    {lead && (
                      <button
                        type="button"
                        onClick={() => onOpenLead(lead)}
                        className="px-2.5 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors min-h-[36px]"
                      >
                        Drawer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
