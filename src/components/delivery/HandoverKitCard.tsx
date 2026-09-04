import React from 'react';
import type { HandoverKitItem } from '../../types/delivery';
import { PackageCheck, AlertCircle } from 'lucide-react';

interface HandoverKitCardProps {
  kit: HandoverKitItem[];
  onToggleItem: (itemId: string) => void;
}

export const HandoverKitCard: React.FC<HandoverKitCardProps> = ({ kit, onToggleItem }) => {
  const requiredItems = kit.filter((k) => k.required);
  const verifiedRequired = requiredItems.filter((k) => k.verified).length;
  const isKitReady = verifiedRequired === requiredItems.length;

  return (
    <div className="bg-card border border-line rounded-control p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <PackageCheck className="size-4 text-cobalt" />
          <h4 className="font-bold text-xs text-ink uppercase tracking-wider">
            Mandatory Vehicle Release Kit
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
            isKitReady ? 'bg-won/10 text-won' : 'bg-due/10 text-due'
          }`}>
            {verifiedRequired}/{requiredItems.length} Required Verified
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {kit.map((item) => (
          <label
            key={item.id}
            className={`p-2.5 rounded-control border flex items-start gap-2.5 cursor-pointer transition-colors text-xs ${
              item.verified
                ? 'bg-won/5 border-won/30'
                : 'bg-wash/40 border-line hover:border-line/80'
            }`}
          >
            <input
              type="checkbox"
              checked={item.verified}
              onChange={() => onToggleItem(item.id)}
              className="mt-0.5 rounded text-cobalt focus:ring-cobalt size-4 shrink-0"
            />
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">{item.label}</span>
                {item.required ? (
                  <span className="text-[9px] uppercase font-bold text-due bg-due/10 px-1.5 py-0.2 rounded">
                    Required
                  </span>
                ) : (
                  <span className="text-[9px] text-sub uppercase font-semibold">Optional</span>
                )}
              </div>
              <p className="text-[11px] text-sub">{item.description}</p>
            </div>
          </label>
        ))}
      </div>

      {!isKitReady && (
        <div className="p-2 rounded bg-due/10 border border-due/20 text-due text-[11px] font-medium flex items-center gap-1.5">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>All mandatory items must be verified prior to security gate pass release.</span>
        </div>
      )}
    </div>
  );
};
