import React, { useState, useMemo } from 'react';
import type { Lead } from '../types/crm';
import type { VehicleStock } from '../types/inventory';
import { inventoryService } from '../services/inventoryService';
import { formatPeso } from '../data/seed';
import {
  Car,
  X,
  Check,
  Clock,
  MapPin,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface AllocateVehicleModalProps {
  isOpen: boolean;
  lead: Lead;
  onClose: () => void;
  onAllocated: (vehicle: VehicleStock) => void;
}

export const AllocateVehicleModal: React.FC<AllocateVehicleModalProps> = ({
  isOpen,
  lead,
  onClose,
  onAllocated,
}) => {
  useBodyScrollLock(isOpen);
  const [showAllModels, setShowAllModels] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<number>(20_000);
  const [error, setError] = useState<string | null>(null);

  const availableUnits = useMemo(() => {
    if (showAllModels) {
      return inventoryService.getInventory().filter(
        (v) => v.status === 'in_stock' || v.status === 'in_transit'
      );
    }
    const matched = inventoryService.getAvailableUnitsForModel(lead.modelInterest);
    // If no direct matches, fallback to all available
    return matched.length > 0
      ? matched
      : inventoryService.getInventory().filter(
          (v) => v.status === 'in_stock' || v.status === 'in_transit'
        );
  }, [lead.modelInterest, showAllModels]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setError('Please select a vehicle unit to place on reservation hold.');
      return;
    }

    try {
      const reserved = inventoryService.reserveVehicle({
        vehicleId: selectedVehicleId,
        leadId: lead.id,
        customerName: lead.customerName,
        agentId: lead.agentId,
        agentName: lead.agentName,
        depositAmount,
        durationHours: 48,
      });

      onAllocated(reserved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place reservation hold.');
    }
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-ink/50 backdrop-blur-sm animate-fade-in overscroll-none touch-none">
      <div className="bg-card border border-line rounded-card max-w-xl w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90dvh] modal-scroll-container touch-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-cobalt-tint flex items-center justify-center text-cobalt shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-ink">
                Allocate VIN &amp; 48-Hour Hold
              </h3>
              <p className="text-xs text-sub">
                Lock physical inventory unit for <strong>{lead.customerName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close allocation modal"
            className="size-7 flex items-center justify-center rounded-control hover:bg-wash text-sub hover:text-ink transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Lead Model Target & Filter Toggle */}
        <div className="bg-paper p-3 rounded-control border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-sub tracking-wider block">
              Customer Model Interest
            </span>
            <p className="text-xs font-bold text-ink">{lead.modelInterest}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAllModels(!showAllModels)}
            className="text-xs font-semibold text-cobalt hover:underline text-left sm:text-right"
          >
            {showAllModels ? 'Show matching models only' : 'View all available models'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-overdue bg-overdue/10 border border-overdue/20 rounded-control p-2.5">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available Units Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1.5">
              Select In-Stock / Pipeline Unit ({availableUnits.length} available)
            </label>

            {availableUnits.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-line rounded-control bg-paper">
                <Car className="size-6 text-sub mx-auto mb-1.5 opacity-50" />
                <p className="text-xs text-sub font-medium">No available units found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {availableUnits.map((unit) => {
                  const isSelected = selectedVehicleId === unit.id;
                  const isAged = unit.daysInStock > 60;

                  return (
                    <div
                      key={unit.id}
                      onClick={() => {
                        setSelectedVehicleId(unit.id);
                        setError(null);
                      }}
                      className={`p-3 rounded-control border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-cobalt bg-cobalt-tint/20 shadow-sm ring-1 ring-cobalt'
                          : 'border-line bg-card hover:bg-wash/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-ink">{unit.model}</h4>
                            <span className="text-[11px] text-sub">({unit.variant})</span>
                          </div>
                          <p className="text-[11px] text-sub flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10.5px] uppercase font-bold text-ink bg-wash px-1.5 py-0.5 rounded border border-line">
                              VIN: {unit.vin}
                            </span>
                            <span>• {unit.color}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-display text-sm font-bold text-ink tabular-nums block">
                            {formatPeso(unit.msrp)}
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                              unit.status === 'in_stock'
                                ? 'bg-won/10 text-won'
                                : 'bg-teal-50 text-teal-700'
                            }`}
                          >
                            {unit.status === 'in_stock' ? 'In Stock' : 'In Transit'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10.5px] text-sub pt-1.5 border-t border-line/60">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-sub" /> {unit.lotLocation}
                        </span>
                        {unit.status === 'in_stock' && (
                          <span
                            className={`font-semibold ${
                              isAged ? 'text-overdue font-bold' : 'text-sub'
                            }`}
                          >
                            {unit.daysInStock}d on lot {isAged && '(AGED STOCK)'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reservation Deposit Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-sub uppercase mb-1.5">
              Reservation Deposit Amount (PHP)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[20_000, 30_000, 50_000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`py-2 px-3 text-xs rounded-control border text-center transition-colors font-bold ${
                    depositAmount === amt
                      ? 'bg-cobalt text-white border-cobalt shadow-sm'
                      : 'bg-paper text-ink border-line hover:bg-wash'
                  }`}
                >
                  {formatPeso(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* 48-Hour Policy Disclaimer */}
          <div className="p-3 rounded-control bg-due/10 border border-due/20 flex items-start gap-2.5 text-xs text-ink">
            <Clock className="size-4 text-due shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Standard Dealership Hold Policy:</strong> Unit will be locked for exactly{' '}
              <strong>48 hours</strong> to allow down payment clearing or bank purchase order (P.O.)
              issuance. The unit cannot be allocated to another consultant during this window.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-sub hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedVehicleId}
              className="px-4 py-2 text-xs font-bold rounded-control bg-cobalt hover:bg-cobalt-press disabled:opacity-50 text-white shadow-sm transition-colors flex items-center gap-1.5 min-h-[38px]"
            >
              <Check className="size-3.5" /> Confirm 48-Hr Hold &amp; Allocate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
