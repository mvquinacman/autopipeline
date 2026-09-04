import type {
  DocumentMode,
  AccessoryItem,
  VsoVehicleParticulars,
  VsoBuyerParticulars,
  VsoFinancialBreakdown,
  VehicleSalesOrder,
} from '../types/salesOrder';
import type { Lead } from '../types/crm';
import { tradeInService } from './tradeInService';
import { inventoryService } from './inventoryService';
import { multiBankService } from './multiBankService';
import { leadService } from './leadService';
import { formatPeso } from '../data/seed';

export const DEFAULT_ACCESSORIES: AccessoryItem[] = [
  { id: 'acc-1', name: 'Platinum Nano-Ceramic Tint (Full Windshield + Sides)', price: 14500, selected: true },
  { id: 'acc-2', name: '3M Heavy-Duty All-Weather Deep Dish Floor Liners', price: 8500, selected: true },
  { id: 'acc-3', name: 'Front & Rear 4K Digital Dashcam with Parking Monitor', price: 12000, selected: false },
  { id: 'acc-4', name: 'Genuine Heavy-Duty Bedliner & Chassis Rustproofing', price: 18000, selected: false },
  { id: 'acc-5', name: 'Factory Aerodynamic Door Visors & Rain Guards', price: 5500, selected: false },
];

export const STANDARD_TERMS = [
  'Prices and promotional rebates are subject to change without prior notice prior to vehicle release.',
  'Reservation deposit is non-refundable but transferable to another variant within 30 calendar days.',
  'Release of unit is subject to full settlement of Net Cash Outlay or receipt of valid Bank Purchase Order (PO).',
  'All accessories listed are genuine dealership installed and covered by 1-year dealership warranty.',
];

export const salesOrderService = {
  calculateFinancials(
    grossSrp: number,
    dealerDiscount: number,
    selectedAccessories: AccessoryItem[],
    reservationDeposit: number,
    tradeInCredit: number,
    bankLoanProceeds: number,
    partnerBankName?: string,
    isFinanced: boolean = false
  ): VsoFinancialBreakdown {
    const netVehiclePrice = Math.max(0, grossSrp - dealerDiscount);
    const accessoriesTotal = selectedAccessories
      .filter((a) => a.selected)
      .reduce((sum, a) => sum + a.price, 0);

    const ltoRegistrationFee = 10500;
    const comprehensiveInsuranceFee = Math.round(grossSrp * 0.025);
    const chattelMortgageFee = isFinanced || bankLoanProceeds > 0 ? Math.round(grossSrp * 0.02) : 0;

    const totalAcquisitionCost =
      netVehiclePrice +
      accessoriesTotal +
      ltoRegistrationFee +
      comprehensiveInsuranceFee +
      chattelMortgageFee;

    const totalCredits = (reservationDeposit || 0) + (tradeInCredit || 0) + (bankLoanProceeds || 0);
    const netCashOutlayDue = Math.max(0, totalAcquisitionCost - totalCredits);

    return {
      grossSrp,
      dealerDiscount,
      netVehiclePrice,
      accessoriesTotal,
      ltoRegistrationFee,
      comprehensiveInsuranceFee,
      chattelMortgageFee,
      totalAcquisitionCost,
      reservationDeposit,
      tradeInCredit,
      bankLoanProceeds,
      partnerBankName,
      netCashOutlayDue,
    };
  },

  buildSalesOrder(
    lead: Lead,
    mode: DocumentMode = 'vso',
    customDiscount: number = 50000,
    accessories: AccessoryItem[] = DEFAULT_ACCESSORIES,
    reservationAmount: number = 50000
  ): VehicleSalesOrder {
    const tradeIn = tradeInService.getAppraisalByLead(lead.id);
    const tradeInCredit = tradeIn ? tradeIn.netTradeInEquity : 0;

    const inventoryUnit =
      inventoryService.getInventory().find((v) => v.allocatedLeadId === lead.id) ||
      (lead.allocatedVehicleId ? inventoryService.getVehicleById(lead.allocatedVehicleId) : null);

    const offers = multiBankService.getOffersForLead(lead.id);
    const approvedOffer = offers.find((o) => o.status === 'accepted') || offers.find((o) => o.status === 'approved');
    const bankLoanProceeds = approvedOffer ? approvedOffer.loanAmount : 0;
    const partnerBankName = approvedOffer ? approvedOffer.bankName : undefined;

    const financials = this.calculateFinancials(
      lead.estValue,
      customDiscount,
      accessories,
      reservationAmount,
      tradeInCredit,
      bankLoanProceeds,
      partnerBankName,
      Boolean(approvedOffer)
    );

    const suffix = lead.id.slice(-4).toUpperCase();
    const docNumber = mode === 'vso' ? `VSO-2026-0904-${suffix}` : `MMM-QT-2026-${suffix}`;

    const buyer: VsoBuyerParticulars = {
      name: lead.customerName,
      phone: lead.customerPhone,
      email: lead.customerEmail,
      address: 'Bonifacio Global City, Taguig City, Metro Manila',
      tin: '921-445-120-000',
      ltoClientId: `LTO-NCR-${suffix}`,
    };

    const vehicle: VsoVehicleParticulars = {
      year: inventoryUnit ? inventoryUnit.year : 2026,
      make: 'Toyota',
      model: inventoryUnit ? `${inventoryUnit.model} ${inventoryUnit.variant}` : lead.modelInterest,
      color: inventoryUnit ? inventoryUnit.color : 'Platinum White Pearl Mica',
      vin: inventoryUnit ? inventoryUnit.vin : `MR0BA3CD4R${suffix}9812`,
      engineNumber: inventoryUnit ? inventoryUnit.engineNumber : `1GD-FTV-${suffix}892`,
      conductionSticker: `W0${suffix}`,
    };

    const today = new Date();
    const expiry = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);

    return {
      id: `so-${Date.now()}`,
      leadId: lead.id,
      docNumber,
      documentMode: mode,
      dateIssued: today.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntil: expiry.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
      buyer,
      vehicle,
      accessories,
      financials,
      salesConsultantName: lead.agentName || 'Paolo Morales',
      salesManagerName: 'Rafael Alcantara (GSM)',
      dealerPrincipalName: 'Don Antonio Zobel (Dealer Principal)',
      termsAndConditions: STANDARD_TERMS,
    };
  },

  async logDocumentGenerated(order: VehicleSalesOrder, actorId: string, actorName: string): Promise<void> {
    const docLabel = order.documentMode === 'vso' ? 'Official Vehicle Sales Order (VSO)' : 'Official Vehicle Quotation';
    const netCash = formatPeso(order.financials.netCashOutlayDue);
    const detail = `Generated ${docLabel} #${order.docNumber}. Model: ${order.vehicle.model}. Total Cost: ${formatPeso(order.financials.totalAcquisitionCost)}. Net Cash Outlay Due: ${netCash}.`;

    await leadService.addActivity(
      order.leadId,
      actorId,
      actorName,
      'quote',
      detail
    );
  },
};
