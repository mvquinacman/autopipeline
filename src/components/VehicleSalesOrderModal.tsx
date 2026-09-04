import React, { useState, useMemo } from 'react';
import type { Lead, Profile } from '../types/crm';
import type { DocumentMode, AccessoryItem } from '../types/salesOrder';
import { salesOrderService, DEFAULT_ACCESSORIES } from '../services/salesOrderService';
import { VsoDocumentView } from './vso/VsoDocumentView';
import {
  Printer,
  X,
  FileText,
  Sliders,
} from 'lucide-react';

interface VehicleSalesOrderModalProps {
  isOpen: boolean;
  lead: Lead | null;
  currentProfile: Profile;
  onClose: () => void;
  initialMode?: DocumentMode;
  onOrderGenerated?: () => void;
}

export const VehicleSalesOrderModal: React.FC<VehicleSalesOrderModalProps> = ({
  isOpen,
  lead,
  currentProfile,
  onClose,
  initialMode = 'vso',
  onOrderGenerated,
}) => {
  const [mode, setMode] = useState<DocumentMode>(initialMode);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [discount, setDiscount] = useState(50000);
  const [reservationDeposit, setReservationDeposit] = useState(50000);
  const [accessories, setAccessories] = useState<AccessoryItem[]>(DEFAULT_ACCESSORIES);
  const [buyerTin, setBuyerTin] = useState('921-445-120-000');
  const [buyerAddress, setBuyerAddress] = useState('Bonifacio Global City, Taguig City, Metro Manila');

  const order = useMemo(() => {
    if (!lead) return null;
    const base = salesOrderService.buildSalesOrder(
      lead,
      mode,
      discount,
      accessories,
      reservationDeposit
    );

    return {
      ...base,
      buyer: {
        ...base.buyer,
        tin: buyerTin,
        address: buyerAddress,
      },
      salesConsultantName: currentProfile.fullName || base.salesConsultantName,
    };
  }, [lead, mode, discount, reservationDeposit, accessories, buyerTin, buyerAddress, currentProfile]);

  if (!isOpen || !lead || !order) return null;

  const handleToggleAccessory = (id: string) => {
    setAccessories((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, selected: !acc.selected } : acc))
    );
  };

  const handlePrint = async () => {
    await salesOrderService.logDocumentGenerated(order, currentProfile.id, currentProfile.fullName);
    if (onOrderGenerated) onOrderGenerated();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink/50 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-card border border-line rounded-card max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto print:border-none print:shadow-none print:max-w-none print:p-0 print:max-h-none print:overflow-visible">
        {/* Screen Toolbar (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-cobalt" />
            <div>
              <h3 className="font-display text-lg font-bold text-ink leading-tight">
                {mode === 'vso' ? 'Vehicle Sales Order (VSO) Agreement' : 'Official Pro-Forma Quotation'}
              </h3>
              <p className="text-[11px] text-sub">
                Official Metro Manila Motors Agreement Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-control bg-wash p-0.5 border border-line">
              <button
                type="button"
                onClick={() => setMode('vso')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  mode === 'vso' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:text-ink'
                }`}
              >
                VSO Agreement
              </button>
              <button
                type="button"
                onClick={() => setMode('quotation')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  mode === 'quotation' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:text-ink'
                }`}
              >
                Quotation
              </button>
            </div>

            {/* Configurator Toggle */}
            <button
              type="button"
              onClick={() => setIsConfiguring(!isConfiguring)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold border transition-colors min-h-[36px] ${
                isConfiguring
                  ? 'bg-cobalt-tint text-cobalt border-cobalt/30'
                  : 'bg-wash text-ink border-line hover:bg-line'
              }`}
            >
              <Sliders className="size-3.5" />
              <span>Customize</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[36px]"
            >
              <Printer className="size-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Configurator Panel (Hidden when printing) */}
        {isConfiguring && (
          <div className="p-4 bg-wash/50 border border-line rounded-control space-y-4 text-xs print:hidden animate-fade-in">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <h4 className="font-bold text-ink flex items-center gap-1.5">
                <Sliders className="size-3.5 text-cobalt" /> Agreement Particulars &amp; Discount Controls
              </h4>
              <span className="text-[11px] text-sub">Changes calculate in real-time</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-sub block mb-1">
                  Promotional Discount (₱)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-card border border-line rounded-control text-ink font-semibold tabular-nums"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-sub block mb-1">
                  Reservation Deposit (₱)
                </label>
                <input
                  type="number"
                  value={reservationDeposit}
                  onChange={(e) => setReservationDeposit(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-card border border-line rounded-control text-ink font-semibold tabular-nums"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-sub block mb-1">
                  Buyer BIR TIN
                </label>
                <input
                  type="text"
                  value={buyerTin}
                  onChange={(e) => setBuyerTin(e.target.value)}
                  className="w-full p-2 bg-card border border-line rounded-control text-ink font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-sub block mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full p-2 bg-card border border-line rounded-control text-ink"
                />
              </div>
            </div>

            {/* Accessories Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-sub block">
                Select Dealership Installed Accessories
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accessories.map((acc) => (
                  <label
                    key={acc.id}
                    className="flex items-center gap-2 p-2 rounded bg-card border border-line cursor-pointer hover:border-cobalt transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={acc.selected}
                      onChange={() => handleToggleAccessory(acc.id)}
                      className="rounded text-cobalt focus:ring-cobalt size-4"
                    />
                    <span className="flex-1 text-ink">{acc.name}</span>
                    <span className="font-bold text-ink tabular-nums shrink-0">
                      +₱{acc.price.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Sheet */}
        <div className="border border-line rounded-card overflow-hidden shadow-sm print:border-none print:shadow-none">
          <VsoDocumentView order={order} />
        </div>
      </div>
    </div>
  );
};
