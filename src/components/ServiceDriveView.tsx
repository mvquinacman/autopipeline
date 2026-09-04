import React, { useState, useMemo } from 'react';
import type { ServiceAppointment } from '../types/serviceDrive';
import type { Profile, Lead } from '../types/crm';
import { serviceDriveService } from '../services/serviceDriveService';
import { formatPeso } from '../data/seed';
import { ServiceDrivePitchModal } from './ServiceDrivePitchModal';
import {
  Wrench,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ServiceDriveViewProps {
  currentProfile: Profile;
  onOpenLead: (leadId: string) => void;
  onLeadConverted: (lead: Lead) => void;
}

type FilterType = 'all' | 'high_equity' | 'expiring_warranty' | 'high_repair' | 'converted';

export const ServiceDriveView: React.FC<ServiceDriveViewProps> = ({
  currentProfile,
  onOpenLead,
  onLeadConverted,
}) => {
  const [appointments, setAppointments] = useState<ServiceAppointment[]>(() =>
    serviceDriveService.getAppointments()
  );
  const [selectedAppointment, setSelectedAppointment] = useState<ServiceAppointment | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const kpis = useMemo(() => serviceDriveService.getKpis(), [appointments]);

  const filteredAppointments = useMemo(() => {
    switch (activeFilter) {
      case 'high_equity':
        return appointments.filter((a) => a.opportunityType === 'high_positive_equity');
      case 'expiring_warranty':
        return appointments.filter(
          (a) => a.warrantyStatus === 'expiring_soon' || a.warrantyStatus === 'expired'
        );
      case 'high_repair':
        return appointments.filter((a) => a.estimatedRepairBill >= 50000);
      case 'converted':
        return appointments.filter((a) => a.pitchStatus === 'converted_to_lead');
      case 'all':
      default:
        return appointments;
    }
  }, [appointments, activeFilter]);

  const handleOpenPitch = (appt: ServiceAppointment) => {
    setSelectedAppointment(appt);
    setIsPitchModalOpen(true);
  };

  const handleStatusUpdated = (updated: ServiceAppointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAppointment(updated);
  };

  const handleConverted = (newLead: Lead) => {
    onLeadConverted(newLead);
  };

  const getBayStatusBadge = (status: ServiceAppointment['bayStatus']) => {
    switch (status) {
      case 'in_bay':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cobalt-tint text-cobalt border border-cobalt/20">
            ON LIFT
          </span>
        );
      case 'inspection_complete':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-won/10 text-won border border-won/20">
            INSPECTED
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-won text-white">
            RELEASE READY
          </span>
        );
      case 'checked_in':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-wash text-sub border border-line">
            CHECKED IN
          </span>
        );
    }
  };

  const getPitchStatusBadge = (status: ServiceAppointment['pitchStatus']) => {
    switch (status) {
      case 'converted_to_lead':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-won/10 text-won">
            CONVERTED TO LEAD
          </span>
        );
      case 'pitch_presented':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-due/10 text-due">
            PITCH PRESENTED
          </span>
        );
      case 'test_drive_scheduled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cobalt-tint text-cobalt">
            TEST DRIVE BOOKED
          </span>
        );
      case 'declined':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lost/10 text-lost">
            CLIENT DECLINED
          </span>
        );
      case 'uncontacted':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-wash text-sub">
            UNCONTACTED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Drive KPI Spec-Sheet Strip */}
      <section aria-label="Service Drive KPIs">
        <div className="bg-card border border-line rounded-card divide-y md:divide-y-0 md:divide-x divide-line grid grid-cols-2 md:grid-cols-5 text-left shadow-sm">
          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Active in Bays
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-ink tabular-nums leading-tight">
              {kpis.activeVehiclesInService}
            </div>
            <p className="text-[11px] text-sub">Workshop capacity (6 bays)</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              High Equity Targets
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-won tabular-nums leading-tight">
              {kpis.highEquityProspectsCount}
            </div>
            <p className="text-[11px] text-sub">&gt; ₱300k Net Equity</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Expiring Warranty
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-due tabular-nums leading-tight">
              {kpis.expiringWarrantyCount}
            </div>
            <p className="text-[11px] text-sub">High upgrade propensity</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Potential Trade-In Value
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-cobalt tabular-nums leading-tight">
              {formatPeso(kpis.totalPotentialTradeInValue, true)}
            </div>
            <p className="text-[11px] text-sub">Used inventory pipeline</p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-1 col-span-2 md:col-span-1">
            <span className="text-[11px] uppercase text-sub tracking-wider font-semibold block">
              Converted to Leads
            </span>
            <div className="font-display text-[26px] sm:text-[30px] font-bold text-ink tabular-nums leading-tight">
              {kpis.convertedLeadsCount}
            </div>
            <p className="text-[11px] text-won font-semibold">Active in sales funnel</p>
          </div>
        </div>
      </section>

      {/* Filter and Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-cobalt" />
          <h2 className="font-display text-lg font-bold text-ink tracking-tight">
            Workshop Lift Board &amp; Buyback Prospecting
          </h2>
          <span className="text-xs text-sub tabular-nums">({filteredAppointments.length} vehicles)</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-control text-xs font-semibold transition-colors shrink-0 ${
              activeFilter === 'all'
                ? 'bg-cobalt text-white shadow-sm'
                : 'bg-wash text-sub hover:text-ink hover:bg-line'
            }`}
          >
            All Bays
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('high_equity')}
            className={`px-2.5 py-1 rounded-control text-xs font-semibold transition-colors shrink-0 ${
              activeFilter === 'high_equity'
                ? 'bg-won text-white shadow-sm'
                : 'bg-wash text-sub hover:text-ink hover:bg-line'
            }`}
          >
            High Positive Equity
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('expiring_warranty')}
            className={`px-2.5 py-1 rounded-control text-xs font-semibold transition-colors shrink-0 ${
              activeFilter === 'expiring_warranty'
                ? 'bg-due text-white shadow-sm'
                : 'bg-wash text-sub hover:text-ink hover:bg-line'
            }`}
          >
            Expiring Warranty
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('high_repair')}
            className={`px-2.5 py-1 rounded-control text-xs font-semibold transition-colors shrink-0 ${
              activeFilter === 'high_repair'
                ? 'bg-overdue text-white shadow-sm'
                : 'bg-wash text-sub hover:text-ink hover:bg-line'
            }`}
          >
            High Repair Cost
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('converted')}
            className={`px-2.5 py-1 rounded-control text-xs font-semibold transition-colors shrink-0 ${
              activeFilter === 'converted'
                ? 'bg-cobalt text-white shadow-sm'
                : 'bg-wash text-sub hover:text-ink hover:bg-line'
            }`}
          >
            Converted
          </button>
        </div>
      </div>

      {/* Workshop Bays 6-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((appt) => {
          const isConverted = appt.pitchStatus === 'converted_to_lead';

          return (
            <div
              key={appt.id}
              className="bg-card border border-line rounded-card p-4 shadow-sm hover:border-cobalt transition-colors space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Bay Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-ink px-2 py-0.5 rounded bg-wash border border-line">
                      BAY 0{appt.bayNumber}
                    </span>
                    {getBayStatusBadge(appt.bayStatus)}
                  </div>
                  {getPitchStatusBadge(appt.pitchStatus)}
                </div>

                {/* Vehicle & Customer Info */}
                <div>
                  <h3 className="font-bold text-sm text-ink leading-snug">
                    {appt.currentVehicleYear} {appt.currentVehicleMake} {appt.currentVehicleModel}
                  </h3>
                  <p className="text-xs text-sub mt-0.5">
                    Plate: <span className="font-semibold text-ink">{appt.currentPlateNumber}</span> •{' '}
                    <span className="tabular-nums font-medium text-ink">{appt.mileageKm.toLocaleString()} km</span>
                  </p>
                  <p className="text-xs text-sub mt-1">
                    Customer: <span className="font-semibold text-ink">{appt.customerName}</span>
                  </p>
                </div>

                {/* Service Reason & Repair Bill */}
                <div className="p-2.5 rounded-control bg-wash/40 border border-line text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-sub">
                    <span className="truncate pr-2">{appt.serviceType}</span>
                    <span className="shrink-0 font-medium">SA: {appt.serviceAdvisorName.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-line/60">
                    <span className="text-sub">Repair Quote:</span>
                    <span className="font-display font-bold text-overdue text-sm tabular-nums">
                      {formatPeso(appt.estimatedRepairBill)}
                    </span>
                  </div>
                </div>

                {/* Equity & Upgrade Opportunity */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-sub">Customer Net Equity:</span>
                    <span className="font-display font-bold text-won text-sm tabular-nums">
                      +{formatPeso(appt.netEquity, true)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-sub">Suggested Trade-Up:</span>
                    <span className="font-semibold text-cobalt truncate max-w-[170px]" title={appt.suggestedUpgradeModel}>
                      {appt.suggestedUpgradeModel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-line">
                {isConverted && appt.convertedLeadId ? (
                  <button
                    type="button"
                    onClick={() => onOpenLead(appt.convertedLeadId!)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-control text-xs font-bold bg-wash hover:bg-line text-ink border border-line transition-colors min-h-[44px]"
                  >
                    <ExternalLink className="size-3.5 text-cobalt" />
                    <span>View Converted Lead</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenPitch(appt)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[44px]"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Review Buyback Pitch</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Buyback Pitch Modal */}
      {selectedAppointment && (
        <ServiceDrivePitchModal
          isOpen={isPitchModalOpen}
          appointment={selectedAppointment}
          currentProfile={currentProfile}
          onClose={() => {
            setIsPitchModalOpen(false);
            setSelectedAppointment(null);
          }}
          onLeadConverted={handleConverted}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};
