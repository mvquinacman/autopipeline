export type VehicleCondition = 'excellent' | 'good' | 'fair' | 'poor';

export type TransmissionType = 'automatic' | 'manual';

export interface TradeInRecord {
  id: string;
  leadId: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  plateEnding: string;
  codingDay: string;
  transmission: TransmissionType;
  condition: VehicleCondition;
  appraisedValue: number;
  existingLoanBalance: number;
  netTradeInEquity: number;
  notes?: string;
  appraiserName: string;
  createdAt: string;
}

export type CreateTradeInInput = Omit<
  TradeInRecord,
  'id' | 'codingDay' | 'netTradeInEquity' | 'createdAt'
>;
