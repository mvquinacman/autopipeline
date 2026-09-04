import type { TradeInRecord, CreateTradeInInput } from '../types/tradeIn';
import { formatPeso } from '../data/seed';

// Metro Manila LTO UVVRP Number Coding Schedule
export function getCodingDay(plateEnding: string): string {
  const digit = plateEnding.trim().slice(-1);
  switch (digit) {
    case '1':
    case '2':
      return 'Monday';
    case '3':
    case '4':
      return 'Tuesday';
    case '5':
    case '6':
      return 'Wednesday';
    case '7':
    case '8':
      return 'Thursday';
    case '9':
    case '0':
      return 'Friday';
    default:
      return 'N/A';
  }
}

export function calculateNetEquity(appraisedValue: number, existingLoanBalance: number): number {
  return Math.max(0, (appraisedValue || 0) - (existingLoanBalance || 0));
}

// In-memory trade-in appraisal registry
const tradeInStore = new Map<string, TradeInRecord>();

// Preseed an appraisal for lead-01 (Toyota Fortuner - Maria Santos)
const initialRecord: TradeInRecord = {
  id: 'ti-001',
  leadId: 'lead-01',
  make: 'Toyota',
  model: 'Vios 1.3 E AT',
  year: 2020,
  mileageKm: 42500,
  plateEnding: '4',
  codingDay: 'Tuesday',
  transmission: 'automatic',
  condition: 'good',
  appraisedValue: 450000,
  existingLoanBalance: 120000,
  netTradeInEquity: 330000,
  notes: 'Minor scratch on rear bumper, casa maintained with complete service records.',
  appraiserName: 'Carlos Mendoza (Used Car Desk)',
  createdAt: new Date().toISOString(),
};
tradeInStore.set(initialRecord.id, { ...initialRecord });

export const tradeInService = {
  getCodingDay,
  calculateNetEquity,

  resetMockStore(): void {
    tradeInStore.clear();
    tradeInStore.set(initialRecord.id, { ...initialRecord });
  },

  saveAppraisal(input: CreateTradeInInput): TradeInRecord {
    const existing = Array.from(tradeInStore.values()).find((r) => r.leadId === input.leadId);
    const id = existing ? existing.id : `ti-${Date.now()}`;
    const codingDay = getCodingDay(input.plateEnding);
    const netTradeInEquity = calculateNetEquity(input.appraisedValue, input.existingLoanBalance);

    const record: TradeInRecord = {
      ...input,
      id,
      codingDay,
      netTradeInEquity,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
    };

    tradeInStore.set(id, record);
    return record;
  },

  getAppraisal(id: string): TradeInRecord | undefined {
    return tradeInStore.get(id);
  },

  getAppraisalByLead(leadId: string): TradeInRecord | undefined {
    return Array.from(tradeInStore.values()).find((r) => r.leadId === leadId);
  },

  getAllAppraisals(): TradeInRecord[] {
    return Array.from(tradeInStore.values());
  },

  formatTimelineNote(record: TradeInRecord): string {
    const loanNote = record.existingLoanBalance > 0
      ? ` (Loan Payoff: ${formatPeso(record.existingLoanBalance, true)})`
      : ' (Fully Paid)';
    return (
      `Trade-In Appraised: ${record.year} ${record.make} ${record.model} (${record.mileageKm.toLocaleString()} km, ` +
      `Plate ending ${record.plateEnding} [Coding: ${record.codingDay}]). Gross: ${formatPeso(record.appraisedValue, true)}${loanNote} ` +
      `-> Net Equity Credit: ${formatPeso(record.netTradeInEquity, true)}`
    );
  },
};
