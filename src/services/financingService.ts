import type { LoanTerm, DownPaymentPercent, BankPreset, FinancingCalculation } from '../types/financing';
import { formatPeso } from '../data/seed';

export const BANK_PRESETS: BankPreset[] = [
  {
    id: 'metrobank',
    name: 'Metrobank Auto Loan',
    rates: { 24: 6.2, 36: 7.1, 48: 8.2, 60: 9.3 },
  },
  {
    id: 'bdo',
    name: 'BDO Consumer Lending',
    rates: { 24: 6.0, 36: 6.9, 48: 8.0, 60: 9.1 },
  },
  {
    id: 'bpi',
    name: 'BPI Family Auto Loan',
    rates: { 24: 6.1, 36: 7.0, 48: 8.1, 60: 9.2 },
  },
  {
    id: 'security_bank',
    name: 'Security Bank Auto',
    rates: { 24: 6.3, 36: 7.2, 48: 8.3, 60: 9.4 },
  },
];

export const financingService = {
  getBankPresets(): BankPreset[] {
    return BANK_PRESETS;
  },

  calculate(
    vehiclePrice: number,
    downPaymentPercent: DownPaymentPercent = 20,
    termMonths: LoanTerm = 60,
    bankId = 'metrobank',
    includeInsurance = true,
    includeChattel = true,
    tradeInEquity = 0
  ): FinancingCalculation {
    const bank = BANK_PRESETS.find((b) => b.id === bankId) || BANK_PRESETS[0];
    const annualRate = bank.rates[termMonths] ?? 8.5;

    const downPaymentAmount = Math.round(vehiclePrice * (downPaymentPercent / 100));
    const loanAmount = Math.max(0, vehiclePrice - downPaymentAmount);

    // Standard automotive add-on rate formula
    const years = termMonths / 12;
    const totalInterest = Math.round(loanAmount * (annualRate / 100) * years);
    const monthlyAmortization = Math.round((loanAmount + totalInterest) / termMonths);

    // Associated Dealership F&I fees
    const chattelMortgageFee = includeChattel ? Math.round(loanAmount * 0.025 + 1500) : 0;
    const comprehensiveInsurance = includeInsurance ? Math.round(vehiclePrice * 0.025) : 0;
    const ltoRegistrationFee = 10500; // 3-year LTO registration

    const totalCashOutlay =
      downPaymentAmount + chattelMortgageFee + comprehensiveInsurance + ltoRegistrationFee;

    const netCashOutlayRequired = Math.max(0, totalCashOutlay - tradeInEquity);

    return {
      vehiclePrice,
      downPaymentPercent,
      downPaymentAmount,
      loanAmount,
      termMonths,
      annualInterestRate: annualRate,
      monthlyAmortization,
      chattelMortgageFee,
      comprehensiveInsurance,
      ltoRegistrationFee,
      totalCashOutlay,
      tradeInEquityApplied: tradeInEquity > 0 ? tradeInEquity : undefined,
      netCashOutlayRequired,
      bankName: bank.name,
    };
  },

  formatQuotationNote(calc: FinancingCalculation): string {
    const tradeInPart = calc.tradeInEquityApplied
      ? ` | Trade-In Credit: -${formatPeso(calc.tradeInEquityApplied, true)} (Net Outlay: ${formatPeso(calc.netCashOutlayRequired, true)})`
      : ` | Initial Outlay: ${formatPeso(calc.totalCashOutlay, true)}`;

    return (
      `Loan Simulation (${calc.bankName}): ${calc.downPaymentPercent}% DP (${formatPeso(calc.downPaymentAmount, true)}) ` +
      `| ${calc.termMonths} mos @ ${formatPeso(calc.monthlyAmortization)}/mo${tradeInPart}`
    );
  },
};
