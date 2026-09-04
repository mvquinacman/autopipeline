import { AlertCircle } from 'lucide-react';
import type { DuplicateCheckResult } from '../services/leadService';

interface DuplicateGuardBannerProps {
  duplicateCheck: DuplicateCheckResult;
  allowOverride: boolean;
  onToggleOverride: (val: boolean) => void;
}

export function DuplicateGuardBanner({
  duplicateCheck,
  allowOverride,
  onToggleOverride,
}: DuplicateGuardBannerProps) {
  if (!duplicateCheck.isDuplicate) return null;

  return (
    <div className="p-3 bg-due/10 border border-due/30 rounded-control space-y-2">
      <div className="flex items-start gap-2 text-due font-semibold">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <div>
          <p>Possible Duplicate Lead Detected!</p>
          <p className="text-[11px] font-normal text-ink mt-0.5">
            Phone matches active lead owned by{' '}
            <span className="font-semibold">{duplicateCheck.existingLead?.agentName}</span> in
            stage{' '}
            <span className="font-semibold uppercase">{duplicateCheck.existingLead?.stage}</span>.
          </p>
        </div>
      </div>
      <label className="flex items-center gap-2 pt-1 border-t border-due/20 cursor-pointer">
        <input
          type="checkbox"
          checked={allowOverride}
          onChange={(e) => onToggleOverride(e.target.checked)}
          className="rounded border-due text-cobalt focus:ring-cobalt"
        />
        <span className="text-[11px] font-semibold text-ink">
          I confirm this is a separate transaction (Override Guard)
        </span>
      </label>
    </div>
  );
}
