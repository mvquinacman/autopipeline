import React, { useState, useMemo } from 'react';
import type { DeliveryAppointment } from '../types/delivery';
import type { Profile } from '../types/crm';
import { deliveryService } from '../services/deliveryService';
import { TurnoverCeremonyModal } from './delivery/TurnoverCeremonyModal';
import {
  Truck,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface DeliveryBayViewProps {
  currentProfile: Profile;
  onOpenLead?: (leadId: string) => void;
  onDeliveryCompleted?: () => void;
}

export const DeliveryBayView: React.FC<DeliveryBayViewProps> = ({
  currentProfile,
  onOpenLead,
  onDeliveryCompleted,
}) => {
  const [appointments, setAppointments] = useState<DeliveryAppointment[]>(() =>
    deliveryService.getAppointments()
  );
  const [selectedAppt, setSelectedAppt] = useState<DeliveryAppointment | null>(null);
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);

  const kpis = useMemo(() => deliveryService.getKpis(), [appointments]);

  const handleOpenCeremony = (appt: DeliveryAppointment) => {
    setSelectedAppt(appt);
    setIsCeremonyOpen(true);
  };

  const handleAppointmentUpdated = (updated: DeliveryAppointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAppt(updated);
    if (onDeliveryCompleted) onDeliveryCompleted();
  };

  const getStatusBadge = (status: DeliveryAppointment['status']) => {
    switch (status) {
      case 'released':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-won text-white">
            RELEASED / EXIT
          </span>
        );
      case 'ceremony_active':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cobalt text-white">
            CEREMONY ACTIVE
          </span>
        );
      case 'pdi_ready':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-won/10 text-won border border-won/30">
            PDI PASSED (READY)
          </span>
        );
      case 'pdi_in_progress':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-due/10 text-due border border-due/30">
            PDI IN PROGRESS
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-wash text-sub border border-line">
            SCHEDULED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Spec-Sheet KPI Strip */}
      <section aria-label="Delivery Bay KPIs">
        <div className="bg-card border border-line rounded-card divide-y md:divide-y-0 md:divide-x divide-line grid grid-cols-2 md:grid-cols-5 text-left shadow-sm">
          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Scheduled Today
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-ink tabular-nums leading-tight">
              {kpis.scheduledTodayCount}
            </div>
            <p className="text-[11px] text-sub">Today's turnover slots</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              PDI Inspected
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-won tabular-nums leading-tight">
              {kpis.pdiCompletedCount}
            </div>
            <p className="text-[11px] text-sub">10-Point QC cleared</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Release Kit Ready
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-cobalt tabular-nums leading-tight">
              {kpis.handoverReadyCount}
            </div>
            <p className="text-[11px] text-sub">Manuals, keys &amp; permits</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Gate Passes Issued
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-ink tabular-nums leading-tight">
              {kpis.gatePassesIssuedCount}
            </div>
            <p className="text-[11px] text-sub">Cleared yard security</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1 col-span-2 md:col-span-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Turnover CSI Score
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-due tabular-nums leading-tight">
              {kpis.averageCsiScore.toFixed(1)} ★
            </div>
            <p className="text-[11px] text-won font-semibold">Post-handover CSAT</p>
          </div>
        </div>
      </section>

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Truck className="size-4 text-cobalt" />
          <h2 className="font-display text-lg font-bold text-ink tracking-tight">
            Delivery Bays &amp; Vehicle Turnover Ceremony
          </h2>
          <span className="text-xs text-sub tabular-nums">({appointments.length} active bays)</span>
        </div>
      </div>

      {/* 3 Delivery Bay Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {appointments.map((appt) => {
          const passedPdi = appt.pdiChecklist.filter((i) => i.status === 'passed').length;
          const verifiedKit = appt.handoverKit.filter((k) => k.verified).length;

          return (
            <div
              key={appt.id}
              className="bg-card border border-line rounded-card p-4 shadow-sm hover:border-cobalt transition-colors space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-ink px-2 py-0.5 rounded bg-wash border border-line">
                    BAY 0{appt.bayNumber}
                  </span>
                  {getStatusBadge(appt.status)}
                </div>

                {/* Unit Details */}
                <div>
                  <h3 className="font-bold text-sm text-ink leading-snug">
                    {appt.modelInterest}
                  </h3>
                  <p className="text-xs text-sub mt-0.5">
                    Color: <span className="font-medium text-ink">{appt.color}</span> • Conduction:{' '}
                    <span className="font-bold text-ink">{appt.conductionSticker}</span>
                  </p>
                  <p className="text-xs text-sub mt-1">
                    Customer:{' '}
                    {onOpenLead ? (
                      <button
                        type="button"
                        onClick={() => onOpenLead(appt.leadId)}
                        className="font-semibold text-ink hover:text-cobalt hover:underline text-left inline"
                      >
                        {appt.customerName}
                      </button>
                    ) : (
                      <span className="font-semibold text-ink">{appt.customerName}</span>
                    )}
                  </p>
                </div>

                {/* Scheduled Slot & Consultant */}
                <div className="p-2.5 rounded-control bg-wash/40 border border-line text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-sub">
                    <span className="flex items-center gap-1 font-semibold text-ink">
                      <Clock className="size-3 text-cobalt" /> {appt.scheduledTime}
                    </span>
                    <span>SC: {appt.salesConsultantName.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[11px]">
                    <span className="text-sub">QC Inspector:</span>
                    <span className="font-medium text-ink">{appt.qcInspectorName}</span>
                  </div>
                </div>

                {/* Checklist Progress Indicators */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-card border border-line space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-sub flex items-center gap-1">
                      <ShieldCheck className="size-3 text-cobalt" /> PDI QC
                    </span>
                    <p className="font-display font-bold text-ink tabular-nums text-sm">
                      {passedPdi}/10 Passed
                    </p>
                  </div>
                  <div className="p-2 rounded bg-card border border-line space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-sub flex items-center gap-1">
                      <PackageCheck className="size-3 text-cobalt" /> Release Kit
                    </span>
                    <p className="font-display font-bold text-ink tabular-nums text-sm">
                      {verifiedKit}/7 Items
                    </p>
                  </div>
                </div>

                {/* Gate Pass Indicator if Released */}
                {appt.gatePass && (
                  <div className="p-2 rounded bg-won/10 border border-won/20 text-[11px] text-won font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="size-3.5" /> Gate Pass Issued
                    </span>
                    <span className="font-mono text-[10px]">{appt.gatePass.passNumber}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => handleOpenCeremony(appt)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[44px]"
                >
                  <Sparkles className="size-3.5" />
                  <span>{appt.status === 'released' ? 'Review Turnover & Gate Pass' : 'Enter Turnover Ceremony'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Turnover Ceremony Modal */}
      {selectedAppt && (
        <TurnoverCeremonyModal
          isOpen={isCeremonyOpen}
          appointment={selectedAppt}
          currentProfile={currentProfile}
          onClose={() => {
            setIsCeremonyOpen(false);
            setSelectedAppt(null);
          }}
          onAppointmentUpdated={handleAppointmentUpdated}
        />
      )}
    </div>
  );
};
