import { describe, it, expect, beforeEach } from 'vitest';
import { salesOrderService, DEFAULT_ACCESSORIES } from './salesOrderService';
import { tradeInService } from './tradeInService';
import { SEED_LEADS } from '../data/seed';

describe('salesOrderService - Philippine Dealership VSO & Quotation Generator', () => {
  beforeEach(() => {
    localStorage.clear();
    tradeInService.resetMockStore();
  });

  it('calculates financial settlement correctly with itemized accessories and mandatory fees', () => {
    const srp = 2630000;
    const discount = 50000;
    const reservation = 50000;
    const tradeInCredit = 330000;
    const bankLoanProceeds = 1800000;

    const financials = salesOrderService.calculateFinancials(
      srp,
      discount,
      DEFAULT_ACCESSORIES,
      reservation,
      tradeInCredit,
      bankLoanProceeds,
      'BDO Auto Loan',
      true
    );

    expect(financials.grossSrp).toBe(2630000);
    expect(financials.netVehiclePrice).toBe(2580000);
    expect(financials.accessoriesTotal).toBe(23000); // Tint (14500) + Mats (8500)
    expect(financials.ltoRegistrationFee).toBe(10500);
    expect(financials.comprehensiveInsuranceFee).toBe(Math.round(srp * 0.025));
    expect(financials.chattelMortgageFee).toBe(Math.round(srp * 0.02));

    const expectedAcquisition =
      2580000 + 23000 + 10500 + Math.round(srp * 0.025) + Math.round(srp * 0.02);
    expect(financials.totalAcquisitionCost).toBe(expectedAcquisition);

    const expectedOutlay = expectedAcquisition - (reservation + tradeInCredit + bankLoanProceeds);
    expect(financials.netCashOutlayDue).toBe(expectedOutlay);
  });

  it('bridges trade-in credit and builds official VSO document for pipeline lead', () => {
    const lead = SEED_LEADS[0]; // Maria Santos (lead-01) which has a pre-seeded trade-in ti-001 (₱330k net equity)
    const vso = salesOrderService.buildSalesOrder(lead, 'vso');

    expect(vso.documentMode).toBe('vso');
    expect(vso.docNumber).toContain('VSO-2026');
    expect(vso.buyer.name).toBe(lead.customerName);
    expect(vso.vehicle.model).toBe(lead.modelInterest);
    expect(vso.financials.tradeInCredit).toBe(330000); // Successfully bridged from tradeInService!
    expect(vso.termsAndConditions.length).toBeGreaterThanOrEqual(4);
    expect(vso.dealerPrincipalName).toContain('Don Antonio Zobel');
  });

  it('logs document generation activity to lead history', async () => {
    const lead = SEED_LEADS[0];
    const quote = salesOrderService.buildSalesOrder(lead, 'quotation');

    await salesOrderService.logDocumentGenerated(quote, 'user-1', 'Paolo Morales');
    // Verify no throw and executed cleanly
    expect(quote.docNumber).toContain('MMM-QT-2026');
  });
});
