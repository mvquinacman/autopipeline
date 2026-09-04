import type {
  PartnerBank,
  BankOffer,
  SubmitApplicationInput,
  BankApplicationStatus,
  FiKpiSummary,
} from '../types/multiBank';
import { PARTNER_BANKS, SEED_BANK_OFFERS } from '../data/seedMultiBank';
import { leadService } from './leadService';
import { formatPeso } from '../data/seed';

const STORAGE_KEY = 'autopipeline_bank_offers';

export const multiBankService = {
  getPartnerBanks(): PartnerBank[] {
    return PARTNER_BANKS;
  },

  getOffers(): BankOffer[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BANK_OFFERS));
      return SEED_BANK_OFFERS;
    }
    try {
      return JSON.parse(raw) as BankOffer[];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BANK_OFFERS));
      return SEED_BANK_OFFERS;
    }
  },

  getOffersForLead(leadId: string): BankOffer[] {
    return this.getOffers().filter((o) => o.leadId === leadId);
  },

  submitApplication(input: SubmitApplicationInput): BankOffer {
    const banks = this.getPartnerBanks();
    const bank = banks.find((b) => b.id === input.bankId) || banks[0];

    const downPaymentAmount = Math.round(input.vehiclePrice * (input.downPaymentPercent / 100));
    const loanAmount = Math.max(0, input.vehiclePrice - downPaymentAmount);
    const annualRate = bank.rates[input.termMonths] ?? 9.2;
    const years = input.termMonths / 12;
    const totalInterest = Math.round(loanAmount * (annualRate / 100) * years);
    const monthlyAmortization = Math.round((loanAmount + totalInterest) / input.termMonths);

    const commissionPct = bank.defaultCommissionPct;
    const dealerCommissionAmount = Math.round(loanAmount * (commissionPct / 100));

    const newOffer: BankOffer = {
      id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      leadId: input.leadId,
      bankId: bank.id,
      bankName: bank.name,
      status: 'in_review',
      submittedAt: new Date().toISOString(),
      vehiclePrice: input.vehiclePrice,
      loanAmount,
      downPaymentPercent: input.downPaymentPercent,
      downPaymentAmount,
      termMonths: input.termMonths,
      interestRate: annualRate,
      monthlyAmortization,
      dealerCommissionRate: commissionPct,
      dealerCommissionAmount,
      promos: [...bank.promos],
    };

    const currentOffers = this.getOffers();
    const updated = [newOffer, ...currentOffers];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Log activity on lead
    leadService.addActivity(
      input.leadId,
      'user-fi',
      'F&I Desk',
      'quote',
      `Submitted auto loan application to ${bank.name} (${input.downPaymentPercent}% DP, ${input.termMonths} mos, ${formatPeso(monthlyAmortization)}/mo).`
    );

    return newOffer;
  },

  updateOfferStatus(
    offerId: string,
    status: BankApplicationStatus,
    details?: {
      conditions?: string;
      declineReason?: string;
      purchaseOrderNumber?: string;
    }
  ): BankOffer {
    const current = this.getOffers();
    let updatedOffer: BankOffer | null = null;

    const next = current.map((o) => {
      if (o.id === offerId) {
        updatedOffer = {
          ...o,
          status,
          decidedAt: new Date().toISOString(),
          conditions: details?.conditions !== undefined ? details.conditions : o.conditions,
          declineReason: details?.declineReason !== undefined ? details.declineReason : o.declineReason,
          purchaseOrderNumber:
            details?.purchaseOrderNumber !== undefined
              ? details.purchaseOrderNumber
              : o.purchaseOrderNumber,
        };
        return updatedOffer;
      }
      return o;
    });

    if (!updatedOffer) {
      throw new Error(`Bank offer ${offerId} not found`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return updatedOffer;
  },

  async acceptBankOffer(offerId: string): Promise<{ offer: BankOffer }> {
    const offers = this.getOffers();
    const target = offers.find((o) => o.id === offerId);
    if (!target) {
      throw new Error(`Bank offer ${offerId} not found`);
    }

    const bank = this.getPartnerBanks().find((b) => b.id === target.bankId);
    const short = bank?.shortName || 'BANK';
    const poNumber =
      target.purchaseOrderNumber ||
      `PO-${short.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedOffers = offers.map((o) => {
      if (o.id === offerId) {
        return {
          ...o,
          status: 'accepted' as BankApplicationStatus,
          purchaseOrderNumber: poNumber,
          decidedAt: o.decidedAt || new Date().toISOString(),
        };
      }
      return o;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOffers));

    // Advance the lead stage to 'approved' if active
    const leads = await leadService.getLeads();
    const lead = leads.find((l) => l.id === target.leadId);
    if (lead) {
      if (lead.stage !== 'approved' && lead.stage !== 'released') {
        await leadService.advanceStage(lead.id);
      }
      await leadService.addActivity(
        lead.id,
        'user-fi',
        'F&I Desk',
        'quote',
        `Client accepted ${target.bankName} financing offer (${formatPeso(target.monthlyAmortization)}/mo). Purchase Order issued: ${poNumber}.`
      );
    }

    const acceptedOffer = updatedOffers.find((o) => o.id === offerId)!;
    return { offer: acceptedOffer };
  },

  getFiKpis(): FiKpiSummary {
    const offers = this.getOffers();
    const approved = offers.filter((o) => o.status === 'approved' || o.status === 'accepted');

    const totalUnderwritingVolume = offers.reduce((sum, o) => sum + o.loanAmount, 0);
    const approvedValue = approved.reduce((sum, o) => sum + o.loanAmount, 0);
    const projectedDealerCommission = offers.reduce(
      (sum, o) => sum + (o.status === 'approved' || o.status === 'accepted' ? o.dealerCommissionAmount : 0),
      0
    );

    return {
      totalApplications: offers.length,
      totalUnderwritingVolume,
      approvedCount: approved.length,
      approvedValue,
      averageTurnaroundHours: 21, // Benchmark Philippine dealership turnaround
      projectedDealerCommission,
    };
  },
};
