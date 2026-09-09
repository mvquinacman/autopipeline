import React, { useState } from 'react';
import type { ServiceAppointment, PitchStatus } from '../types/serviceDrive';
import type { Profile, Lead } from '../types/crm';
import { serviceDriveService } from '../services/serviceDriveService';
import { formatPeso } from '../data/seed';
import {
  X,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface ServiceDrivePitchModalProps {
  isOpen: boolean;
  appointment: ServiceAppointment | null;
  currentProfile: Profile;
  onClose: () => void;
  onLeadConverted: (lead: Lead) => void;
  onStatusUpdated: (updatedAppt: ServiceAppointment) => void;
}

export const ServiceDrivePitchModal: React.FC<ServiceDrivePitchModalProps> = ({
  isOpen,
  appointment,
  currentProfile,
  onClose,
  onLeadConverted,
  onStatusUpdated,
}) => {
  useBodyScrollLock(isOpen && Boolean(appointment));
  const [pitchNotes, setPitchNotes] = useState(appointment?.pitchNotes || '');
  const [isConverting, setIsConverting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen || !appointment) return null;

  const handleUpdateStatus = (status: PitchStatus) => {
    try {
      const updated = serviceDriveService.updatePitchStatus(
        appointment.id,
        status,
        pitchNotes
      );
      onStatusUpdated(updated);
      setFeedbackMsg(`Pitch status updated to "${status.replace(/_/g, ' ')}"`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update pitch status:', err);
    }
  };

  const handleConvertLead = async () => {
    setIsConverting(true);
    try {
      const result = await serviceDriveService.convertServiceToLead({
        appointmentId: appointment.id,
        assignedAgentId: currentProfile.id,
        assignedAgentName: currentProfile.fullName,
        initialNote: pitchNotes,
      });
      onStatusUpdated(result.appointment);
      onLeadConverted(result.lead);
      onClose();
    } catch (err) {
      console.error('Failed to convert appointment to lead:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const isConverted = appointment.pitchStatus === 'converted_to_lead';

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] bg-ink/50 backdrop-blur-sm animate-fade-in overscroll-none touch-none">
      <div className="bg-card border border-line rounded-card max-w-3xl w-full p-4 sm:p-6 shadow-xl space-y-5 max-h-[90dvh] modal-scroll-container touch-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cobalt-tint text-cobalt border border-cobalt/20">
              BAY 0{appointment.bayNumber}
            </span>
            <h3 className="font-display text-xl font-bold text-ink tracking-tight">
              Service Drive Equity &amp; Buyback Pitch
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pitch modal"
            className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Customer & Workshop Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-wash/50 rounded-control border border-line text-xs">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-sub tracking-wider">Customer &amp; Vehicle on Lift</p>
            <p className="font-bold text-ink text-sm">{appointment.customerName}</p>
            <p className="text-sub">{appointment.customerPhone} • {appointment.customerEmail}</p>
            <p className="font-semibold text-ink pt-1">
              {appointment.currentVehicleYear} {appointment.currentVehicleMake} {appointment.currentVehicleModel}
            </p>
            <p className="text-sub">
              Plate: <span className="font-semibold text-ink">{appointment.currentPlateNumber}</span> •{' '}
              Mileage: <span className="tabular-nums font-semibold text-ink">{appointment.mileageKm.toLocaleString()} km</span>
            </p>
          </div>
          <div className="space-y-1 sm:text-right">
            <p className="text-[10px] uppercase font-bold text-sub tracking-wider">Service Diagnosis</p>
            <p className="font-semibold text-ink">{appointment.serviceType}</p>
            <p className="text-sub">Advisor: {appointment.serviceAdvisorName}</p>
            <div className="pt-1.5">
              <span className="text-sub">Estimated Repair Bill: </span>
              <span className="font-display text-base font-bold text-overdue tabular-nums">
                {formatPeso(appointment.estimatedRepairBill)}
              </span>
            </div>
            <div className="pt-0.5">
              <span className="text-[11px] text-sub">Warranty: </span>
              <span
                className={`text-[11px] font-bold ${
                  appointment.warrantyStatus === 'expired'
                    ? 'text-overdue'
                    : appointment.warrantyStatus === 'expiring_soon'
                    ? 'text-due'
                    : 'text-won'
                }`}
              >
                {appointment.warrantyStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Equity Summary Strip */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3.5 bg-card rounded-control border border-line text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-sub">Trade-in Cash Offer</p>
            <p className="font-display text-lg sm:text-xl font-bold text-ink tabular-nums mt-0.5">
              {formatPeso(appointment.estimatedMarketValue, true)}
            </p>
            <p className="text-[10px] text-sub">Current Market Valuation</p>
          </div>
          <div className="border-x border-line">
            <p className="text-[10px] uppercase font-bold text-sub">Bank Loan Payoff</p>
            <p className="font-display text-lg sm:text-xl font-bold text-sub tabular-nums mt-0.5">
              {formatPeso(appointment.estimatedLoanPayoff, true)}
            </p>
            <p className="text-[10px] text-sub">Outstanding Chattel</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-sub">Customer Net Equity</p>
            <p className="font-display text-lg sm:text-xl font-bold text-won tabular-nums mt-0.5">
              +{formatPeso(appointment.netEquity, true)}
            </p>
            <p className="text-[10px] text-won font-semibold">Available for Down Payment</p>
          </div>
        </div>

        {/* Side-by-side Decision Matrix */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sub">
            The Decision Matrix: Repair vs. Upgrade
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
            {/* Option A: Keep Current Car */}
            <div className="p-4 bg-wash/30 border border-line rounded-control space-y-3">
              <div className="flex items-center gap-2 border-b border-line pb-2">
                <Wrench className="size-4 text-sub" />
                <h5 className="font-bold text-ink text-sm">Option A: Keep Current Vehicle</h5>
              </div>
              <ul className="space-y-2 text-sub">
                <li className="flex justify-between items-center">
                  <span>Out-of-Pocket Repair Today:</span>
                  <span className="font-bold text-overdue tabular-nums">
                    {formatPeso(appointment.estimatedRepairBill)}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Current Monthly Amortization:</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatPeso(appointment.currentEstimatedMonthly)}/mo
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Factory Warranty Coverage:</span>
                  <span className="font-semibold text-overdue">Expired / No Coverage</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Future Depreciation Risk:</span>
                  <span className="font-semibold text-sub">High (Aging Tech)</span>
                </li>
              </ul>
            </div>

            {/* Option B: Trade-Up */}
            <div className="p-4 bg-cobalt-tint/30 border border-cobalt/30 rounded-control space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-cobalt/20 pb-2">
                <div className="flex items-center gap-2 text-cobalt font-bold text-sm">
                  <Sparkles className="size-4" />
                  <h5>Option B: Trade-Up to 2026 Model</h5>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-won/10 text-won">
                  RECOMMENDED
                </span>
              </div>
              <p className="font-bold text-ink text-sm">
                {appointment.suggestedUpgradeModel}
              </p>
              <ul className="space-y-2 text-sub">
                <li className="flex justify-between items-center">
                  <span>Cash Outlay for Repair Today:</span>
                  <span className="font-bold text-won tabular-nums">₱0 (Dealer Absorbed)</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Trade-In Down Payment Credit:</span>
                  <span className="font-bold text-won tabular-nums">
                    {formatPeso(appointment.netEquity)}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>New Monthly Amortization:</span>
                  <span className="font-display font-bold text-cobalt text-sm tabular-nums">
                    {formatPeso(appointment.newEstimatedMonthly)}/mo
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Monthly Payment Variance:</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      appointment.monthlyDifference <= 0 ? 'text-won' : 'text-ink'
                    }`}
                  >
                    {appointment.monthlyDifference <= 0
                      ? `${formatPeso(appointment.monthlyDifference)}/mo`
                      : `+${formatPeso(appointment.monthlyDifference)}/mo`}
                  </span>
                </li>
                <li className="flex justify-between items-center pt-1 border-t border-cobalt/10">
                  <span className="flex items-center gap-1 text-ink font-semibold">
                    <ShieldCheck className="size-3.5 text-won" /> 3-Year Factory Warranty:
                  </span>
                  <span className="font-semibold text-won">100% Free PMS &amp; Parts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pitch Notes Input */}
        <div className="space-y-1.5">
          <label htmlFor="pitchNotes" className="text-[11px] font-bold text-sub uppercase tracking-wider block">
            Advisor / Consultant Discussion Notes
          </label>
          <textarea
            id="pitchNotes"
            rows={2}
            value={pitchNotes}
            onChange={(e) => setPitchNotes(e.target.value)}
            placeholder="Record client reaction, trade-up preferences, or scheduled appointment notes..."
            className="w-full text-xs p-2.5 rounded-control border border-line bg-card text-ink focus:outline-none focus:border-cobalt transition-colors"
          />
        </div>

        {feedbackMsg && (
          <div className="p-2.5 rounded-control bg-won/10 border border-won/20 text-won text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-line">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isConverted}
              onClick={() => handleUpdateStatus('pitch_presented')}
              className="px-3 py-2 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Mark Pitch Presented
            </button>
            <button
              type="button"
              disabled={isConverted}
              onClick={() => handleUpdateStatus('test_drive_scheduled')}
              className="px-3 py-2 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Schedule Test Drive
            </button>
            <button
              type="button"
              disabled={isConverted}
              onClick={() => handleUpdateStatus('declined')}
              className="px-3 py-2 rounded-control text-xs font-semibold bg-wash hover:bg-line text-sub hover:text-overdue border border-line transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Client Declined
            </button>
          </div>

          <button
            type="button"
            disabled={isConverted || isConverting}
            onClick={handleConvertLead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isConverting ? (
              <span>Converting...</span>
            ) : isConverted ? (
              <>
                <CheckCircle2 className="size-4 text-won" />
                <span>Converted to Lead</span>
              </>
            ) : (
              <>
                <UserCheck className="size-4" />
                <span>Convert to Pipeline Lead</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
