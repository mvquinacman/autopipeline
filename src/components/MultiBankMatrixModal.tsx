import React, { useState, useEffect } from 'react';
import type { Lead } from '../types/crm';
import type { BankOffer, PartnerBank, DownPaymentPercent, LoanTerm } from '../types/multiBank';
import { multiBankService } from '../services/multiBankService';
import { formatPeso } from '../data/seed';
import {
  Building2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  FileText,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface MultiBankMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onOfferAccepted?: (offer: BankOffer) => void;
}

export const MultiBankMatrixModal: React.FC<MultiBankMatrixModalProps> = ({
  isOpen,
  onClose,
  lead,
  onOfferAccepted,
}) => {
  const [offers, setOffers] = useState<BankOffer[]>([]);
  const [partnerBanks, setPartnerBanks] = useState<PartnerBank[]>([]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState<DownPaymentPercent>(20);
  const [termMonths, setTermMonths] = useState<LoanTerm>(60);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setIsSubmittingNew(false);
      setSuccessMsg(null);
    }
  }, [isOpen, lead.id]);

  const loadData = () => {
    const banks = multiBankService.getPartnerBanks();
    setPartnerBanks(banks);
    const existing = multiBankService.getOffersForLead(lead.id);
    setOffers(existing);
    const unsubmitted = banks.find((b) => !existing.some((o) => o.bankId === b.id));
    if (unsubmitted) setSelectedBankId(unsubmitted.id);
  };

  if (!isOpen) return null;

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const result = await multiBankService.acceptBankOffer(offerId);
      loadData();
      setSuccessMsg(`Offer accepted! Purchase Order ${result.offer.purchaseOrderNumber} successfully issued.`);
      if (onOfferAccepted) {
        onOfferAccepted(result.offer);
      }
    } catch (err) {
      console.error('Failed to accept bank offer:', err);
    }
  };

  const handleManualStatusChange = (
    offerId: string,
    status: 'approved' | 'conditionally_approved' | 'declined'
  ) => {
    const details =
      status === 'conditionally_approved'
        ? { conditions: 'Requires co-maker payslip and proof of billing' }
        : status === 'declined'
        ? { declineReason: 'Credit underwriting threshold not met' }
        : { purchaseOrderNumber: `PO-AUTO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` };

    multiBankService.updateOfferStatus(offerId, status, details);
    loadData();
  };

  const handleNewSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBankId) return;

    multiBankService.submitApplication({
      leadId: lead.id,
      bankId: selectedBankId,
      vehiclePrice: lead.estValue,
      downPaymentPercent,
      termMonths,
    });

    setIsSubmittingNew(false);
    loadData();
  };

  const getStatusBadge = (status: BankOffer['status']) => {
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
            <AlertCircle className="size-3" /> Conditional Approval
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

  const availableBanks = partnerBanks.filter((b) => !offers.some((o) => o.bankId === b.id));

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-4xl w-full p-4 sm:p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-control bg-cobalt-tint flex items-center justify-center text-cobalt shrink-0">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-ink">
                  Multi-Bank Financing Approval Matrix
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-wash rounded border border-line text-sub">
                  F&amp;I Desk
                </span>
              </div>
              <p className="text-xs text-sub">
                Prospect: <span className="font-semibold text-ink">{lead.customerName}</span> • Model: <span className="font-semibold text-ink">{lead.modelInterest}</span> (MSRP {formatPeso(lead.estValue)})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close financing matrix"
            className="size-8 flex items-center justify-center rounded-control hover:bg-wash text-sub hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-won/10 border border-won/20 rounded-control text-xs font-semibold text-won">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Top Spec Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-paper border border-line rounded-control p-3 text-xs">
          <div>
            <span className="text-[10px] text-sub uppercase font-semibold block">Total Submissions</span>
            <span className="font-display text-base font-bold text-ink tabular-nums">{offers.length} Banks</span>
          </div>
          <div>
            <span className="text-[10px] text-sub uppercase font-semibold block">Approved Offers</span>
            <span className="font-display text-base font-bold text-won tabular-nums">
              {offers.filter((o) => o.status === 'approved' || o.status === 'accepted').length} Ready
            </span>
          </div>
          <div>
            <span className="text-[10px] text-sub uppercase font-semibold block">Requested Loan Amount</span>
            <span className="font-display text-base font-bold text-ink tabular-nums">
              {formatPeso(offers[0]?.loanAmount || Math.round(lead.estValue * 0.8))}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-sub uppercase font-semibold block">Max Dealer Reserve</span>
            <span className="font-display text-base font-bold text-won tabular-nums">
              +{formatPeso(Math.max(0, ...offers.map((o) => o.dealerCommissionAmount)))}
            </span>
          </div>
        </div>

        {/* Bank Offers Comparison Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
              Submitted Partner Bank Offers ({offers.length})
            </h4>
            {availableBanks.length > 0 && !isSubmittingNew && (
              <button
                type="button"
                onClick={() => setIsSubmittingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white transition-colors shadow-sm"
              >
                <Plus className="size-3.5" /> Submit to Another Bank
              </button>
            )}
          </div>

          {offers.length === 0 ? (
            <div className="p-8 text-center bg-paper border border-line rounded-control space-y-2">
              <Building2 className="size-8 text-sub mx-auto" />
              <p className="text-xs font-bold text-ink">No bank applications submitted yet</p>
              <p className="text-[11px] text-sub max-w-sm mx-auto">
                Submit this prospect&apos;s credit folder to accredited partner banks to begin multi-bank underwriting.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {offers.map((offer) => {
                const isAccepted = offer.status === 'accepted';
                const isApproved = offer.status === 'approved';

                return (
                  <div
                    key={offer.id}
                    className={`bg-card border rounded-control p-4 flex flex-col justify-between space-y-3 transition-all ${
                      isAccepted
                        ? 'border-won shadow-md ring-1 ring-won/30'
                        : isApproved
                        ? 'border-cobalt/60 shadow-sm'
                        : 'border-line hover:border-line/80'
                    }`}
                  >
                    <div>
                      {/* Bank Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-line pb-2.5">
                        <div>
                          <p className="font-display text-base font-bold text-ink">{offer.bankName}</p>
                          <span className="text-[10px] text-sub">
                            Submitted {new Date(offer.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      {/* Financial Terms */}
                      <div className="grid grid-cols-2 gap-2 py-3 border-b border-line text-xs">
                        <div>
                          <span className="text-[10px] text-sub uppercase block">Monthly Payment</span>
                          <span className="font-display text-xl font-bold text-ink tabular-nums leading-none">
                            {formatPeso(offer.monthlyAmortization)}
                          </span>
                          <span className="text-[10px] text-sub">/month</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-sub uppercase block">Down Payment</span>
                          <span className="font-semibold text-ink tabular-nums">
                            {offer.downPaymentPercent}% ({formatPeso(offer.downPaymentAmount, true)})
                          </span>
                          <span className="text-[10px] text-sub block">Term: {offer.termMonths} mos</span>
                        </div>
                      </div>

                      {/* Promos & Conditions */}
                      <div className="pt-2 space-y-1.5 min-h-[48px]">
                        {offer.promos.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {offer.promos.map((promo, idx) => (
                              <span
                                key={idx}
                                className="text-[9.5px] font-semibold text-cobalt bg-cobalt-tint px-1.5 py-0.5 rounded border border-cobalt/20"
                              >
                                {promo}
                              </span>
                            ))}
                          </div>
                        )}
                        {offer.conditions && (
                          <p className="text-[10.5px] text-due bg-due/10 border border-due/20 rounded p-1.5">
                            <span className="font-semibold">Condition:</span> {offer.conditions}
                          </p>
                        )}
                        {offer.declineReason && (
                          <p className="text-[10.5px] text-lost bg-lost/10 border border-lost/20 rounded p-1.5">
                            <span className="font-semibold">Decline:</span> {offer.declineReason}
                          </p>
                        )}
                        {offer.purchaseOrderNumber && (
                          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-ink bg-wash p-1 rounded border border-line">
                            <FileText className="size-3 text-sub" /> {offer.purchaseOrderNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer: Dealer Reserve & Actions */}
                    <div className="pt-2 border-t border-line space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-sub font-medium">Dealer Reserve (F&amp;I):</span>
                        <span className="font-bold text-won font-mono">
                          +{formatPeso(offer.dealerCommissionAmount)} ({offer.dealerCommissionRate}%)
                        </span>
                      </div>

                      {isApproved && !isAccepted && (
                        <button
                          type="button"
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="w-full py-2 px-3 rounded-control text-xs font-bold bg-won hover:bg-won/90 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[36px]"
                        >
                          <ShieldCheck className="size-4" /> Accept Offer &amp; Issue PO
                        </button>
                      )}

                      {!isAccepted && (
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleManualStatusChange(
                                offer.id,
                                isApproved ? 'conditionally_approved' : 'approved'
                              )
                            }
                            className="text-[10px] text-sub hover:text-ink underline transition-colors"
                          >
                            {isApproved ? 'Mark Conditional' : 'Simulate Approval'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleManualStatusChange(offer.id, 'declined')}
                            className="text-[10px] text-sub hover:text-overdue underline transition-colors"
                          >
                            Mark Declined
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Bank Application Drawer */}
        {isSubmittingNew && availableBanks.length > 0 && (
          <form
            onSubmit={handleNewSubmission}
            className="bg-paper border border-line rounded-control p-4 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                Submit Application to Partner Bank
              </h4>
              <button
                type="button"
                onClick={() => setIsSubmittingNew(false)}
                className="text-sub hover:text-ink text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                  Select Bank
                </label>
                <div className="relative">
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full h-9 pl-2.5 pr-8 appearance-none rounded-control border border-line bg-card text-xs text-ink focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    {availableBanks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.approvalRatePct}% approval rate)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-sub pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                  Down Payment %
                </label>
                <div className="relative">
                  <select
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value) as DownPaymentPercent)}
                    className="w-full h-9 pl-2.5 pr-8 appearance-none rounded-control border border-line bg-card text-xs text-ink focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    <option value={15}>15% Down Payment</option>
                    <option value={20}>20% Standard DP</option>
                    <option value={30}>30% Low Amortization DP</option>
                    <option value={50}>50% High Equity DP</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-sub pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-sub uppercase mb-1">
                  Financing Term
                </label>
                <div className="relative">
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value) as LoanTerm)}
                    className="w-full h-9 pl-2.5 pr-8 appearance-none rounded-control border border-line bg-card text-xs text-ink focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    <option value={60}>60 Months (5 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={24}>24 Months (2 Years)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-sub pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors"
              >
                Submit Folder to Bank
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
