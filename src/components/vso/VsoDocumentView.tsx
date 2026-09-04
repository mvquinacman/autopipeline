import React from 'react';
import type { VehicleSalesOrder } from '../../types/salesOrder';
import { formatPeso } from '../../data/seed';

interface VsoDocumentViewProps {
  order: VehicleSalesOrder;
}

export const VsoDocumentView: React.FC<VsoDocumentViewProps> = ({ order }) => {
  const isVso = order.documentMode === 'vso';
  const { buyer, vehicle, financials, accessories } = order;
  const selectedAccessories = accessories.filter((a) => a.selected);

  return (
    <div className="bg-card text-ink p-4 sm:p-8 space-y-6 print:p-0 print:border-none print:shadow-none font-sans text-xs">
      {/* Dealership Letterhead */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-ink pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-7 rounded bg-cobalt text-white flex items-center justify-center font-display font-bold text-sm tracking-wider">
              MMM
            </span>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              METRO MANILA MOTORS CORP.
            </h2>
          </div>
          <p className="text-xs font-semibold text-sub mt-0.5">
            Authorized Toyota Dealership — Bonifacio Global City Showroom
          </p>
          <p className="text-[11px] text-sub">32nd Street cor. 5th Avenue, Bonifacio Global City, Taguig City, 1634</p>
          <p className="text-[11px] text-sub">
            BIR TIN: <span className="font-semibold text-ink">004-912-883-000 VAT Reg</span> • LTO Accreditation: <span className="font-semibold text-ink">NCR-2024-0812</span>
          </p>
          <p className="text-[10px] text-sub">DTI Fair Trade Permit No. FTEB-189201 Series of 2026</p>
        </div>

        <div className="sm:text-right space-y-1">
          <span className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
            isVso ? 'bg-cobalt text-white' : 'bg-wash text-ink border border-line'
          }`}>
            {isVso ? 'VEHICLE SALES ORDER (VSO)' : 'PRO-FORMA QUOTATION'}
          </span>
          <p className="font-display text-sm font-bold text-ink mt-1.5">
            Ref: <span className="tabular-nums">{order.docNumber}</span>
          </p>
          <p className="text-[11px] text-sub">Date Issued: {order.dateIssued}</p>
          <p className="text-[11px] text-sub">Validity: {order.validUntil}</p>
        </div>
      </div>

      {/* Buyer & Vehicle Technical Specs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Particulars */}
        <div className="p-3.5 rounded-control bg-wash/40 border border-line space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-sub tracking-wider border-b border-line pb-1">
            Section 1: Buyer Particulars
          </p>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Customer Name:</span>
            <span className="col-span-2 font-bold text-ink">{buyer.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Contact / Phone:</span>
            <span className="col-span-2 font-medium text-ink">{buyer.phone}</span>
          </div>
          {buyer.email && (
            <div className="grid grid-cols-3 gap-1">
              <span className="text-sub">Email Address:</span>
              <span className="col-span-2 text-ink">{buyer.email}</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Delivery Address:</span>
            <span className="col-span-2 text-ink">{buyer.address}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Customer TIN:</span>
            <span className="col-span-2 font-mono text-ink">{buyer.tin}</span>
          </div>
        </div>

        {/* Vehicle Technical Particulars */}
        <div className="p-3.5 rounded-control bg-wash/40 border border-line space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-sub tracking-wider border-b border-line pb-1">
            Section 2: Vehicle Technical Particulars
          </p>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Model &amp; Variant:</span>
            <span className="col-span-2 font-bold text-ink">{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Exterior Color:</span>
            <span className="col-span-2 font-medium text-ink">{vehicle.color}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">VIN / Chassis No.:</span>
            <span className="col-span-2 font-mono font-bold text-ink">{vehicle.vin}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Engine Number:</span>
            <span className="col-span-2 font-mono text-ink">{vehicle.engineNumber}</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <span className="text-sub">Conduction / Plate:</span>
            <span className="col-span-2 font-semibold text-ink">
              {vehicle.conductionSticker} {vehicle.plateNumber ? `(${vehicle.plateNumber})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Financial Breakdown */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-sub tracking-wider">
          Section 3: Financial Settlement &amp; Payment Breakdown
        </p>
        <div className="border border-line rounded-control overflow-hidden divide-y divide-line">
          <div className="flex justify-between p-2.5 bg-wash/60 font-semibold">
            <span>Description</span>
            <span className="tabular-nums">Amount (PHP)</span>
          </div>

          <div className="flex justify-between p-2.5">
            <span className="text-sub">Manufacturer Suggested Retail Price (SRP)</span>
            <span className="tabular-nums font-semibold text-ink">{formatPeso(financials.grossSrp)}</span>
          </div>

          {financials.dealerDiscount > 0 && (
            <div className="flex justify-between p-2.5 text-won">
              <span>Less: Approved Dealership Promotional Discount / Promo Rebate</span>
              <span className="tabular-nums font-semibold">-{formatPeso(financials.dealerDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between p-2.5 font-bold bg-wash/30">
            <span>Net Vehicle Selling Price</span>
            <span className="tabular-nums">{formatPeso(financials.netVehiclePrice)}</span>
          </div>

          {/* Installed Accessories */}
          {selectedAccessories.length > 0 && (
            <div className="p-2.5 bg-card space-y-1">
              <div className="flex justify-between font-semibold text-ink">
                <span>Dealer Installed Genuine Accessories &amp; Upgrades</span>
                <span className="tabular-nums">{formatPeso(financials.accessoriesTotal)}</span>
              </div>
              <ul className="pl-3 space-y-0.5 text-[11px] text-sub list-disc list-inside">
                {selectedAccessories.map((acc) => (
                  <li key={acc.id} className="flex justify-between">
                    <span>{acc.name}</span>
                    <span className="tabular-nums">{formatPeso(acc.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Fees */}
          <div className="flex justify-between p-2.5">
            <span className="text-sub">3-Year LTO Registration, CPLI &amp; Plates Processing</span>
            <span className="tabular-nums text-ink">{formatPeso(financials.ltoRegistrationFee)}</span>
          </div>
          <div className="flex justify-between p-2.5">
            <span className="text-sub">1-Year Comprehensive Insurance with Acts of God (AON)</span>
            <span className="tabular-nums text-ink">{formatPeso(financials.comprehensiveInsuranceFee)}</span>
          </div>
          {financials.chattelMortgageFee > 0 && (
            <div className="flex justify-between p-2.5">
              <span className="text-sub">Chattel Mortgage Processing &amp; Bank Documentation</span>
              <span className="tabular-nums text-ink">{formatPeso(financials.chattelMortgageFee)}</span>
            </div>
          )}

          <div className="flex justify-between p-2.5 font-bold bg-wash/60 text-ink">
            <span>TOTAL VEHICLE ACQUISITION COST</span>
            <span className="tabular-nums">{formatPeso(financials.totalAcquisitionCost)}</span>
          </div>

          {/* Settlement Deductions */}
          {financials.reservationDeposit > 0 && (
            <div className="flex justify-between p-2.5 text-won">
              <span>Less: Reservation Hold Deposit Paid (Official Receipt Issued)</span>
              <span className="tabular-nums font-semibold">-{formatPeso(financials.reservationDeposit)}</span>
            </div>
          )}

          {financials.tradeInCredit > 0 && (
            <div className="flex justify-between p-2.5 text-won">
              <span>Less: Approved Trade-In Net Equity Credit (Used Car Desk)</span>
              <span className="tabular-nums font-semibold">-{formatPeso(financials.tradeInCredit)}</span>
            </div>
          )}

          {financials.bankLoanProceeds > 0 && (
            <div className="flex justify-between p-2.5 text-won">
              <span>
                Less: Bank Financing Proceeds / Bank PO ({financials.partnerBankName || 'Partner Bank'})
              </span>
              <span className="tabular-nums font-semibold">-{formatPeso(financials.bankLoanProceeds)}</span>
            </div>
          )}

          {/* Net Cash Outlay Due */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-paper font-display text-base sm:text-lg font-bold gap-1 border-t-2 border-cobalt">
            <span className="text-ink">NET CASH OUTLAY DUE FROM BUYER</span>
            <span className="text-cobalt tabular-nums">{formatPeso(financials.netCashOutlayDue)}</span>
          </div>
        </div>
      </div>

      {/* 4-Tier Philippine Dealership Signature Block */}
      <div className="space-y-3 pt-4 border-t border-line">
        <p className="text-[10px] uppercase font-bold text-sub tracking-wider">
          Section 4: Conforme, Review &amp; Executive Approval Hierarchy
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {/* Buyer */}
          <div className="space-y-3 pt-6 border-t border-ink/40">
            <p className="font-bold text-ink text-xs">{buyer.name}</p>
            <p className="text-[10px] text-sub uppercase">Buyer / Conforme</p>
          </div>

          {/* Sales Consultant */}
          <div className="space-y-3 pt-6 border-t border-ink/40">
            <p className="font-bold text-ink text-xs">{order.salesConsultantName}</p>
            <p className="text-[10px] text-sub uppercase">Marketing Professional</p>
          </div>

          {/* General Sales Manager */}
          <div className="space-y-3 pt-6 border-t border-ink/40">
            <p className="font-bold text-ink text-xs">{order.salesManagerName}</p>
            <p className="text-[10px] text-sub uppercase">General Sales Manager</p>
          </div>

          {/* Dealer Principal */}
          <div className="space-y-3 pt-6 border-t border-ink/40">
            <p className="font-bold text-ink text-xs">{order.dealerPrincipalName}</p>
            <p className="text-[10px] text-sub uppercase">Dealer Principal / VP</p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="p-3 bg-wash/30 rounded-control border border-line text-[10px] text-sub space-y-1">
        <p className="font-bold text-ink uppercase tracking-wider">Terms and Conditions:</p>
        <ol className="list-decimal list-inside space-y-0.5">
          {order.termsAndConditions.map((term, i) => (
            <li key={i}>{term}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};
