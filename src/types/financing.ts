export type LoanTerm = 24 | 36 | 48 | 60;
export type DownPaymentPercent = 15 | 20 | 30 | 50;

export interface BankPreset {
  id: string;
  name: string;
  rates: Record<LoanTerm, number>; // annual percentage, e.g. 7.1
}

export interface FinancingCalculation {
  vehiclePrice: number;
  downPaymentPercent: DownPaymentPercent;
  downPaymentAmount: number;
  loanAmount: number;
  termMonths: LoanTerm;
  annualInterestRate: number;
  monthlyAmortization: number;
  chattelMortgageFee: number;
  comprehensiveInsurance: number;
  ltoRegistrationFee: number;
  totalCashOutlay: number;
  bankName: string;
}
