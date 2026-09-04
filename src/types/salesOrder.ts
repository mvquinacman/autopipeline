export type DocumentMode = 'quotation' | 'vso';

export interface AccessoryItem {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface VsoVehicleParticulars {
  year: number;
  make: string;
  model: string;
  variant?: string;
  color: string;
  vin: string;
  engineNumber: string;
  conductionSticker: string;
  plateNumber?: string;
}

export interface VsoBuyerParticulars {
  name: string;
  phone: string;
  email?: string;
  address: string;
  tin: string;
  ltoClientId?: string;
}

export interface VsoFinancialBreakdown {
  grossSrp: number;
  dealerDiscount: number;
  netVehiclePrice: number;
  accessoriesTotal: number;
  ltoRegistrationFee: number;
  comprehensiveInsuranceFee: number;
  chattelMortgageFee: number;
  totalAcquisitionCost: number;

  // Deductions & Credits
  reservationDeposit: number;
  tradeInCredit: number;
  bankLoanProceeds: number;
  partnerBankName?: string;
  netCashOutlayDue: number;
}

export interface VehicleSalesOrder {
  id: string;
  leadId: string;
  docNumber: string;
  documentMode: DocumentMode;
  dateIssued: string;
  validUntil: string;
  buyer: VsoBuyerParticulars;
  vehicle: VsoVehicleParticulars;
  accessories: AccessoryItem[];
  financials: VsoFinancialBreakdown;
  salesConsultantName: string;
  salesManagerName: string;
  dealerPrincipalName: string;
  termsAndConditions: string[];
}
