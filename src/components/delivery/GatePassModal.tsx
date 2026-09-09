import React from 'react';
import type { GatePassRecord } from '../../types/delivery';
import { Printer, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface GatePassModalProps {
  isOpen: boolean;
  gatePass: GatePassRecord | null;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({ isOpen, gatePass, onClose }) => {
  useBodyScrollLock(isOpen && Boolean(gatePass));
  if (!isOpen || !gatePass) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-ink/50 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static overscroll-none touch-none">
      <div className="bg-card border border-line rounded-card max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[95dvh] modal-scroll-container touch-auto print:border-none print:shadow-none print:max-w-none print:p-0">
        {/* Screen Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-line pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-cobalt" />
            <h3 className="font-display text-xl font-bold text-ink">Dealership Security Gate Pass</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[36px]"
            >
              <Printer className="size-3.5" /> Print Gate Pass
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close gate pass dialog"
              className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="border border-line rounded-card p-6 space-y-5 bg-card text-ink print:border-2 print:border-ink">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-ink pb-3">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                METRO MANILA MOTORS CORP.
              </h2>
              <p className="text-xs text-sub font-semibold">Security Yard Clearance &amp; Logistics Gate Pass</p>
              <p className="text-[11px] text-sub">Bonifacio Global City Dealership Compound</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-won/10 text-won border border-won/30">
                AUTHORIZED EXIT
              </span>
              <p className="font-mono text-xs font-bold text-ink mt-1.5">{gatePass.passNumber}</p>
              <p className="text-[10px] text-sub">{new Date(gatePass.issuedAt).toLocaleString('en-PH')}</p>
            </div>
          </div>

          {/* Vehicle Particulars */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-wash/40 p-3 rounded-control border border-line">
            <div>
              <p className="text-[10px] text-sub uppercase font-bold">Vehicle Model &amp; Description</p>
              <p className="font-bold text-ink text-sm">{gatePass.modelDescription}</p>
              <p className="text-sub mt-1">Conduction Sticker: <span className="font-bold text-ink">{gatePass.conductionSticker}</span></p>
            </div>
            <div>
              <p className="text-[10px] text-sub uppercase font-bold">Chassis / VIN &amp; Engine</p>
              <p className="font-mono font-bold text-ink text-xs">{gatePass.vehicleVin}</p>
              <p className="font-mono text-sub text-[11px] mt-1">Engine: {gatePass.engineNumber}</p>
            </div>
          </div>

          {/* Driver & Authorization Particulars */}
          <div className="grid grid-cols-3 gap-2 text-xs border border-line rounded-control p-3 divide-x divide-line">
            <div>
              <p className="text-[10px] text-sub uppercase font-bold">Client / Releasing To</p>
              <p className="font-bold text-ink mt-0.5">{gatePass.customerName}</p>
              <p className="text-[10px] text-sub">Registered Owner</p>
            </div>
            <div className="pl-2">
              <p className="text-[10px] text-sub uppercase font-bold">Sales Consultant</p>
              <p className="font-bold text-ink mt-0.5">{gatePass.escortConsultantName}</p>
              <p className="text-[10px] text-sub">Escort Out of Compound</p>
            </div>
            <div className="pl-2">
              <p className="text-[10px] text-sub uppercase font-bold">Security Inspection</p>
              <p className="font-bold text-ink mt-0.5">{gatePass.securityGuardOnDuty}</p>
              <p className="text-[10px] text-won font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Gate Clearance OK
              </p>
            </div>
          </div>

          {/* Guard Sign-off & Barcode Simulation */}
          <div className="flex justify-between items-end pt-3 border-t border-line text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-mono tracking-widest text-sub">||| | ||||| |||| || | |||| ||| ||||</p>
              <p className="text-[10px] text-sub">Scan barcode at Gate 1 Main Exit</p>
            </div>
            <div className="text-right space-y-3">
              <div className="border-b border-ink/40 w-44 ml-auto" />
              <p className="text-[10px] text-sub uppercase">Security Guard On-Duty Signature &amp; Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
