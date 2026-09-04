import { describe, it, expect, beforeEach } from 'vitest';
import { multiBankService } from './multiBankService';
import { leadService } from './leadService';

describe('multiBankService - Auto Financing Approval Matrix', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves accredited partner banks with turnaround and commission rates', () => {
    const banks = multiBankService.getPartnerBanks();
    expect(banks.length).toBeGreaterThanOrEqual(5);

    const bpi = banks.find((b) => b.id === 'bpi');
    expect(bpi).toBeDefined();
    expect(bpi?.name).toContain('BPI Family');
    expect(bpi?.rates[60]).toBeGreaterThan(0);
    expect(bpi?.approvalRatePct).toBeGreaterThan(70);
  });

  it('retrieves default seed offers and filters by leadId', () => {
    const offers = multiBankService.getOffers();
    expect(offers.length).toBeGreaterThanOrEqual(5);

    const lead09Offers = multiBankService.getOffersForLead('lead-09');
    expect(lead09Offers.length).toBeGreaterThanOrEqual(2);
    expect(lead09Offers.some((o) => o.bankId === 'bpi')).toBe(true);
  });

  it('submits a new bank application and calculates amortization & dealer commission', () => {
    const newOffer = multiBankService.submitApplication({
      leadId: 'lead-03',
      bankId: 'bdo',
      vehiclePrice: 1815000,
      downPaymentPercent: 20,
      termMonths: 60,
    });

    expect(newOffer.id).toBeDefined();
    expect(newOffer.status).toBe('in_review');
    expect(newOffer.downPaymentAmount).toBe(363000); // 20% of 1,815,000
    expect(newOffer.loanAmount).toBe(1452000); // 80%
    expect(newOffer.monthlyAmortization).toBeGreaterThan(0);
    expect(newOffer.dealerCommissionAmount).toBeGreaterThan(0);

    const leadOffers = multiBankService.getOffersForLead('lead-03');
    expect(leadOffers.some((o) => o.id === newOffer.id)).toBe(true);
  });

  it('updates bank offer status to conditionally approved or approved', () => {
    const offers = multiBankService.getOffers();
    const target = offers[0];

    const updated = multiBankService.updateOfferStatus(target.id, 'conditionally_approved', {
      conditions: 'Requires additional proof of income',
    });

    expect(updated.status).toBe('conditionally_approved');
    expect(updated.conditions).toBe('Requires additional proof of income');
    expect(updated.decidedAt).toBeDefined();
  });

  it('accepts a bank offer, issues a purchase order, and advances the lead', async () => {
    const offers = multiBankService.getOffersForLead('lead-09');
    const bpiOffer = offers.find((o) => o.bankId === 'bpi')!;

    const result = await multiBankService.acceptBankOffer(bpiOffer.id);
    expect(result.offer.status).toBe('accepted');
    expect(result.offer.purchaseOrderNumber).toContain('PO-');

    // Lead should have activity added
    const leads = await leadService.getLeads();
    const lead = leads.find((l) => l.id === 'lead-09');
    expect(lead).toBeDefined();
  });

  it('computes F&I KPIs across the dealership portfolio', () => {
    const kpis = multiBankService.getFiKpis();
    expect(kpis.totalApplications).toBeGreaterThan(0);
    expect(kpis.totalUnderwritingVolume).toBeGreaterThan(0);
    expect(kpis.approvedCount).toBeGreaterThan(0);
    expect(kpis.projectedDealerCommission).toBeGreaterThan(0);
  });
});
