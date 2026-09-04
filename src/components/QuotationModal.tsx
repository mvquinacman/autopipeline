import type { Lead } from '../types/crm';
import { formatPeso } from '../data/seed';
import { Printer, X, FileText } from 'lucide-react';

interface QuotationModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
}

export function QuotationModal({ isOpen, lead, onClose }: QuotationModalProps) {
  if (!isOpen || !lead) return null;

  const quoteNumber = `MMM-QT-2026-${lead.id.slice(-4).toUpperCase()}`;
  const srp = lead.estValue;
  const discount = 50_000;
  const netSrp = srp - discount;
  const ltoFee = 10_500;
  const insuranceFee = Math.round(srp * 0.025);
  const chattelFee = Math.round(srp * 0.02);
  const totalPayable = netSrp + ltoFee + insuranceFee + chattelFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-card border border-line rounded-card max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[95vh] overflow-y-auto print:border-none print:shadow-none print:max-w-none print:p-0">
        {/* Screen Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-line pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-cobalt" />
            <h3 className="font-display text-xl font-bold text-ink">Official Vehicle Quotation</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors"
            >
              <Printer className="size-3.5" /> Print / Save PDF
            </button>
            <button type="button" onClick={onClose} className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash">
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 text-ink">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-ink pb-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink tracking-tight">METRO MANILA MOTORS</h2>
              <p className="text-xs text-sub">Bonifacio Global City Showroom</p>
              <p className="text-[11px] text-sub">32nd Street cor. Rizal Drive, BGC, Taguig City</p>
              <p className="text-[11px] text-sub">Tel: +63 (2) 8888-TOYOTA | VAT Reg: 004-829-102-000</p>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-bold bg-wash rounded border border-line">
                PRO-FORMA QUOTATION
              </span>
              <p className="font-display text-sm font-bold text-ink mt-2">Ref: {quoteNumber}</p>
              <p className="text-[11px] text-sub">Date: {new Date().toLocaleDateString('en-PH')}</p>
              <p className="text-[11px] text-sub">Valid for: 15 Days</p>
            </div>
          </div>

          {/* Customer & Consultant Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-wash/40 p-3.5 rounded-control border border-line">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-sub">Customer Information</p>
              <p className="font-bold text-ink text-sm">{lead.customerName}</p>
              <p className="text-sub">Mobile: {lead.customerPhone}</p>
              {lead.customerEmail && <p className="text-sub">Email: {lead.customerEmail}</p>}
            </div>
            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] uppercase font-bold text-sub">Account Executive</p>
              <p className="font-bold text-ink text-sm">{lead.agentName}</p>
              <p className="text-sub">Sales Consultant</p>
              <p className="text-sub">Showroom Alpha Team</p>
            </div>
          </div>

          {/* Specification & Price Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sub">Vehicle &amp; Incidental Breakdown</h4>
            <div className="border border-line rounded-control divide-y divide-line text-xs">
              <div className="flex justify-between p-2.5 font-semibold bg-wash/50">
                <span>Vehicle Model &amp; Specification</span>
                <span className="tabular-nums font-bold">{lead.modelInterest}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-sub">Manufacturer Suggested Retail Price (SRP)</span>
                <span className="tabular-nums font-semibold text-ink">{formatPeso(srp)}</span>
              </div>
              <div className="flex justify-between p-2.5 text-won">
                <span>Special Showroom Promotional Discount</span>
                <span className="tabular-nums font-semibold">-{formatPeso(discount)}</span>
              </div>
              <div className="flex justify-between p-2.5 font-bold bg-wash/20">
                <span>Net Vehicle Selling Price</span>
                <span className="tabular-nums">{formatPeso(netSrp)}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-sub">3-Year LTO Registration, Plates &amp; Stickers</span>
                <span className="tabular-nums text-ink">{formatPeso(ltoFee)}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-sub">1-Year Comprehensive Insurance (Acts of God included)</span>
                <span className="tabular-nums text-ink">{formatPeso(insuranceFee)}</span>
              </div>
              <div className="flex justify-between p-2.5">
                <span className="text-sub">Chattel Mortgage &amp; Encumbrance Processing Fee</span>
                <span className="tabular-nums text-ink">{formatPeso(chattelFee)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-paper font-display text-sm sm:text-base font-bold gap-1">
                <span>TOTAL AMOUNT PAYABLE (CASH OUTLAY / FULL PURCHASE)</span>
                <span className="text-cobalt tabular-nums">{formatPeso(totalPayable)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 sm:pt-8 border-t border-line text-xs">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sub">Prepared by:</p>
              <div className="border-b border-ink/40 w-full max-w-[192px]" />
              <div>
                <p className="font-bold text-ink">{lead.agentName}</p>
                <p className="text-[11px] text-sub">Sales Consultant</p>
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 sm:text-right">
              <p className="text-sub">Approved by:</p>
              <div className="border-b border-ink/40 w-full max-w-[192px] sm:ml-auto" />
              <div>
                <p className="font-bold text-ink">Rafael Alcantara</p>
                <p className="text-[11px] text-sub">General Sales Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
