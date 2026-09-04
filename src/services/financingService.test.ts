import { describe, it, expect } from 'vitest';
import { financingService } from './financingService';

describe('financingService - Loan & Amortization Calculations', () => {
  it('calculates 20% downpayment on a ₱2,000,000 vehicle', () => {
    const calc = financingService.calculate(2_000_000, 20, 60, 'metrobank');

    expect(calc.downPaymentAmount).toBe(400_000);
    expect(calc.loanAmount).toBe(1_600_000);
    expect(calc.monthlyAmortization).toBeGreaterThan(0);
    expect(calc.totalCashOutlay).toBeGreaterThan(calc.downPaymentAmount);
  });

  it('adjusts loan terms properly (24m vs 60m)', () => {
    const calc24 = financingService.calculate(2_000_000, 20, 24, 'bdo');
    const calc60 = financingService.calculate(2_000_000, 20, 60, 'bdo');

    // 24 month term should have higher monthly amortization than 60 month term
    expect(calc24.monthlyAmortization).toBeGreaterThan(calc60.monthlyAmortization);
  });

  it('formats a concise quotation note for lead timeline', () => {
    const calc = financingService.calculate(2_630_000, 20, 48, 'metrobank');
    const note = financingService.formatQuotationNote(calc);

    expect(note).toContain('Loan Simulation');
    expect(note).toContain('20% DP');
    expect(note).toContain('48 mos');
  });

  it('deducts trade-in equity from total cash outlay to calculate net cash outlay', () => {
    // 2M vehicle, 20% DP = 400,000 DP, total cash outlay around 490k+
    const withoutTradeIn = financingService.calculate(2_000_000, 20, 60, 'metrobank', true, true, 0);
    const withTradeIn = financingService.calculate(2_000_000, 20, 60, 'metrobank', true, true, 300_000);

    expect(withTradeIn.totalCashOutlay).toBe(withoutTradeIn.totalCashOutlay);
    expect(withTradeIn.tradeInEquityApplied).toBe(300_000);
    expect(withTradeIn.netCashOutlayRequired).toBe(withoutTradeIn.totalCashOutlay - 300_000);

    const note = financingService.formatQuotationNote(withTradeIn);
    expect(note).toContain('Trade-In Credit: -₱300K');
    expect(note).toContain('Net Outlay:');
  });
});
