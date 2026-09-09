import React, { useState, useEffect, useMemo } from 'react';
import { Lead, Activity, Profile } from '../types/crm';
import { leadService } from '../services/leadService';
import { tradeInService } from '../services/tradeInService';
import type { TradeInRecord } from '../types/tradeIn';
import { formatPeso } from '../data/seed';
import { StatusPill } from './StatusPill';
import { ActivityTimeline } from './ActivityTimeline';
import { MarkLostDialog } from './MarkLostDialog';
import { FinancingCalculatorModal } from './FinancingCalculatorModal';
import { QuotationModal } from './QuotationModal';
import { TestDriveModal } from './TestDriveModal';
import { ViberScriptModal } from './ViberScriptModal';
import { TradeInModal } from './TradeInModal';
import { AllocateVehicleModal } from './AllocateVehicleModal';
import { inventoryService } from '../services/inventoryService';
import type { VehicleStock } from '../types/inventory';
import { MultiBankMatrixModal } from './MultiBankMatrixModal';
import { multiBankService } from '../services/multiBankService';
import { VehicleSalesOrderModal } from './VehicleSalesOrderModal';
import { TurnoverCeremonyModal } from './delivery/TurnoverCeremonyModal';
import { deliveryService } from '../services/deliveryService';
import { STANDARD_PDI_ITEMS, STANDARD_HANDOVER_KIT } from '../data/seedDelivery';
import type { DeliveryBayStatus } from '../types/delivery';
import { CommissionSlipModal } from './commission/CommissionSlipModal';
import { commissionService } from '../services/commissionService';
import type { CommissionRecord } from '../types/commission';
import { PermissionGate } from './auth/PermissionGate';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  X,
  ChevronRight,
  RotateCcw,
  Ban,
  PhoneCall,
  PlusCircle,
  UserCheck,
  Calculator,
  FileText,
  FileCheck,
  Compass,
  MessageSquare,
  Repeat,
  Boxes,
  Lock,
  Unlock,
  Building2,
  CheckCircle2,
  Truck,
  Receipt,
  ChevronDown,
} from 'lucide-react';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  currentProfile: Profile;
  profiles: Profile[];
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  currentProfile,
  profiles,
  onClose,
  onLeadUpdated,
}) => {
  useBodyScrollLock(Boolean(lead));

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [showViberModal, setShowViberModal] = useState(false);
  const [showTradeInModal, setShowTradeInModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showMultiBankModal, setShowMultiBankModal] = useState(false);
  const [showVsoModal, setShowVsoModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [dealCommission, setDealCommission] = useState<CommissionRecord | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleOpenCommission = async () => {
    if (!lead) return;
    let comm = await commissionService.getCommissionForLead(lead.id);
    if (!comm) {
      comm = commissionService.createCommissionForLead(lead, {
        vin: allocatedVehicle?.vin,
        variant: allocatedVehicle?.variant,
      });
    }
    setDealCommission(comm);
    setShowCommissionModal(true);
  };

  const tradeInRecord = useMemo(() => {
    if (!lead) return null;
    return tradeInService.getAppraisalByLead(lead.id);
  }, [lead, activities]);

  const allocatedVehicle = useMemo(() => {
    if (!lead) return null;
    return (
      inventoryService.getInventory().find((v) => v.allocatedLeadId === lead.id) ||
      (lead.allocatedVehicleId ? inventoryService.getVehicleById(lead.allocatedVehicleId) : null)
    );
  }, [lead, activities]);

  const deliveryAppointment = useMemo(() => {
    if (!lead) return null;
    const existing = deliveryService.getAppointmentByLeadId(lead.id);
    if (existing) return existing;
    const suffix = lead.id.slice(-4).toUpperCase();
    return {
      id: `del-${lead.id}`,
      bayNumber: 1 as const,
      leadId: lead.id,
      customerName: lead.customerName,
      customerPhone: lead.customerPhone,
      modelInterest: lead.modelInterest,
      allocatedVehicleId: lead.allocatedVehicleId,
      vin: allocatedVehicle ? allocatedVehicle.vin : `MR0BA3CD4R${suffix}9812`,
      engineNumber: allocatedVehicle ? allocatedVehicle.engineNumber : `1GD-FTV-${suffix}892`,
      conductionSticker: `W0${suffix}`,
      color: allocatedVehicle ? allocatedVehicle.color : 'Platinum White Pearl',
      salesConsultantName: lead.agentName || currentProfile.fullName,
      scheduledTime: 'Today • 2:00 PM',
      status: (lead.stage === 'released' ? 'released' : 'pdi_ready') as DeliveryBayStatus,
      pdiChecklist: STANDARD_PDI_ITEMS,
      handoverKit: STANDARD_HANDOVER_KIT,
      qcInspectorName: 'Ronaldo Cruz (QC Lead)',
      qcSignedAt: new Date().toISOString(),
      ribbonColor: 'red' as const,
    };
  }, [lead, allocatedVehicle, activities, currentProfile]);

  const bankOffers = useMemo(() => {
    if (!lead) return [];
    return multiBankService.getOffersForLead(lead.id);
  }, [lead, activities]);

  const handleOfferAccepted = async () => {
    if (!lead) return;
    const leads = await leadService.getLeads();
    const updated = leads.find((l) => l.id === lead.id);
    if (updated) {
      onLeadUpdated(updated);
    }
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  useEffect(() => {
    if (!lead) return;
    setLoadingActivities(true);
    leadService.getActivities(lead.id).then((acts) => {
      setActivities(acts);
      setLoadingActivities(false);
    });
  }, [lead]);

  useEffect(() => {
    if (!lead) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lead]);

  if (!lead) return null;

  const handleAdvance = async () => {
    const updated = await leadService.advanceStage(
      lead.id,
      'Advanced via Detail Drawer',
      currentProfile.id,
      currentProfile.fullName
    );
    onLeadUpdated(updated);
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleRegress = async () => {
    const updated = await leadService.transitionLead(
      { leadId: lead.id, action: 'regress', note: 'Regressed via Detail Drawer' },
      currentProfile.id,
      currentProfile.fullName
    );
    onLeadUpdated(updated);
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleConfirmLost = async (lostReason: any, note?: string) => {
    const updated = await leadService.transitionLead(
      { leadId: lead.id, action: 'lost', lostReason, note },
      currentProfile.id,
      currentProfile.fullName
    );
    onLeadUpdated(updated);
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    await leadService.addActivity(
      lead.id,
      currentProfile.id,
      currentProfile.fullName,
      'note',
      newNote.trim()
    );
    setNewNote('');
    setIsAddingNote(false);
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleLogCall = async () => {
    await leadService.addActivity(
      lead.id,
      currentProfile.id,
      currentProfile.fullName,
      'call',
      'Outbound phone call made to client. Discussed financing terms.'
    );
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleReassign = async (newAgentId: string) => {
    const targetAgent = profiles.find((p) => p.id === newAgentId);
    if (!targetAgent) return;
    const updated = await leadService.reassignLead(
      lead.id,
      targetAgent.id,
      targetAgent.fullName,
      currentProfile.id,
      currentProfile.fullName
    );
    onLeadUpdated(updated);
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleVehicleAllocated = async (vehicle: VehicleStock) => {
    if (!lead) return;
    const updated = await leadService.updateLead(lead.id, {
      allocatedVehicleId: vehicle.id,
      allocatedVin: vehicle.vin,
      reservationDeposit: vehicle.reservationDeposit,
      reservationExpiresAt: vehicle.reservationExpiresAt,
    });
    await leadService.addActivity(
      lead.id,
      currentProfile.id,
      currentProfile.fullName,
      'quote',
      `Placed 48-hr reservation hold on ${vehicle.model} (${vehicle.variant}, VIN: ${vehicle.vin}, Color: ${vehicle.color}). Deposit: ₱${vehicle.reservationDeposit?.toLocaleString()}.`
    );
    if (updated) {
      onLeadUpdated(updated);
    }
    const refreshed = await leadService.getActivities(lead.id);
    setActivities(refreshed);
  };

  const handleReleaseVehicleHold = async () => {
    if (!lead || !allocatedVehicle) return;
    if (
      window.confirm(
        `Release 48-hour reservation hold on VIN ${allocatedVehicle.vin}? The unit will return to available stock.`
      )
    ) {
      inventoryService.releaseHold(allocatedVehicle.id, 'Hold released from lead detail drawer');
      const updated = await leadService.updateLead(lead.id, {
        allocatedVehicleId: undefined,
        allocatedVin: undefined,
        reservationDeposit: undefined,
        reservationExpiresAt: undefined,
      });
      await leadService.addActivity(
        lead.id,
        currentProfile.id,
        currentProfile.fullName,
        'note',
        `Released 48-hr reservation hold on ${allocatedVehicle.model} (VIN: ${allocatedVehicle.vin}). Unit returned to available stock.`
      );
      if (updated) {
        onLeadUpdated(updated);
      }
      const refreshed = await leadService.getActivities(lead.id);
      setActivities(refreshed);
    }
  };

  const handleSaveFinancingQuote = async (leadId: string, note: string) => {
    await leadService.addActivity(
      leadId,
      currentProfile.id,
      currentProfile.fullName,
      'quote',
      note
    );
    const refreshed = await leadService.getActivities(leadId);
    setActivities(refreshed);
  };

  const handleScheduleTestDrive = async (
    leadId: string,
    unitName: string,
    date: string,
    licenseNo: string
  ) => {
    await leadService.addActivity(
      leadId,
      currentProfile.id,
      currentProfile.fullName,
      'test_drive',
      `Test drive booked on ${unitName} for ${new Date(date).toLocaleString()} (License: ${licenseNo})`
    );
    const refreshed = await leadService.getActivities(leadId);
    setActivities(refreshed);
  };

  const handleLogOutreach = async (leadId: string, templateTitle: string) => {
    await leadService.addActivity(
      leadId,
      currentProfile.id,
      currentProfile.fullName,
      'note',
      `Sent Viber/SMS Outreach: "${templateTitle}"`
    );
    const refreshed = await leadService.getActivities(leadId);
    setActivities(refreshed);
  };

  const handleSaveTradeInAppraisal = async (leadId: string, record: TradeInRecord) => {
    await leadService.addActivity(
      leadId,
      currentProfile.id,
      currentProfile.fullName,
      'trade_in',
      tradeInService.formatTimelineNote(record)
    );
    const updated = await leadService.updateLeadTradeIn(
      leadId,
      record.id,
      record.netTradeInEquity
    );
    onLeadUpdated(updated);
    const refreshed = await leadService.getActivities(leadId);
    setActivities(refreshed);
  };

  return (
    <div className="fixed inset-0 m-0 z-40 flex justify-end bg-ink/40 backdrop-blur-sm animate-fade-in overscroll-none touch-none">
      <div className="w-full sm:max-w-lg bg-card border-l border-line h-[100dvh] max-h-[100dvh] flex flex-col shadow-2xl overflow-hidden touch-auto">
        {/* Drawer Header */}
        <div className="px-4 pt-[max(1rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-3.5 border-b border-line flex items-center justify-between bg-paper shrink-0">
          <div className="space-y-0.5">
            <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider">Lead Inspector</span>
            <h2 className="font-display text-xl font-bold text-ink leading-none">{lead.modelInterest}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lead Inspector"
            className="size-9 rounded-control text-sub hover:text-ink hover:bg-wash flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 modal-scroll-container p-4 space-y-6 pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2rem))]">
          {/* Customer & Value Card */}
          <div className="bg-paper border border-line rounded-control p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-ink">{lead.customerName}</h3>
                <p className="text-xs text-sub tabular-nums">{lead.customerPhone}</p>
                {lead.customerEmail && <p className="text-xs text-sub">{lead.customerEmail}</p>}
              </div>
              <div className="text-right">
                <span className="text-[10.5px] uppercase font-bold text-sub">Est. Value</span>
                <p className="font-display text-xl font-bold text-ink tabular-nums">{formatPeso(lead.estValue)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-line text-xs">
              <span className="text-sub">Stage:</span>
              <span className="font-semibold text-ink uppercase text-[10.5px] bg-wash px-2 py-0.5 rounded border border-line">
                {lead.stage.replace('_', ' ')}
              </span>
              <StatusPill status={lead.status === 'active' ? lead.urgency : lead.status} />
              <span className="ml-auto text-[11px] text-sub font-medium">Agent: {lead.agentName}</span>
            </div>

            <PermissionGate permission="lead:reassign">
              <div className="pt-2 border-t border-line flex items-center gap-2 text-xs">
                <UserCheck className="size-3.5 text-cobalt shrink-0" />
                <span className="text-sub font-semibold">Reassign:</span>
                <div className="relative inline-flex items-center">
                  <select
                    aria-label="Reassign lead"
                    value={lead.agentId}
                    onChange={(e) => handleReassign(e.target.value)}
                    className="h-7 pl-2 pr-7 text-xs bg-card border border-line rounded text-ink appearance-none focus:ring-1 focus:ring-cobalt cursor-pointer"
                  >
                    {profiles.filter((p) => p.role === 'agent').map((p) => (
                      <option key={p.id} value={p.id}>{p.fullName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-sub pointer-events-none" />
                </div>
              </div>
            </PermissionGate>
          </div>

          {/* Vehicle Stock Allocation & 48-Hour Reservation Card */}
          <div className="bg-paper border border-line rounded-control p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-cobalt shrink-0" />
                <span className="text-xs font-bold text-ink">
                  Vehicle Stock &amp; 48-Hr Hold
                </span>
              </div>
              {allocatedVehicle ? (
                <span className="text-[10px] font-bold text-due bg-due/10 px-2 py-0.5 rounded-full border border-due/20 flex items-center gap-1">
                  <Lock className="size-3" /> 48-HR HOLD ACTIVE
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-sub bg-wash px-2 py-0.5 rounded-full border border-line">
                  NO VIN ALLOCATED
                </span>
              )}
            </div>

            {allocatedVehicle ? (
              <div className="space-y-2 pt-1 border-t border-line">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-ink">{allocatedVehicle.model}</h4>
                    <p className="text-[11px] text-sub">
                      {allocatedVehicle.variant} • {allocatedVehicle.color}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase font-bold text-cobalt mt-0.5">
                      VIN: {allocatedVehicle.vin}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-ink tabular-nums block">
                      {formatPeso(allocatedVehicle.msrp)}
                    </span>
                    <span className="text-[10px] text-sub font-semibold">
                      Deposit: {formatPeso(allocatedVehicle.reservationDeposit || 20_000)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-sub pt-1 border-t border-line/60">
                  <span>
                    Location: <strong className="text-ink">{allocatedVehicle.lotLocation}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleReleaseVehicleHold}
                    className="text-sub hover:text-overdue font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <Unlock className="size-3" /> Release Hold
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-line">
                <span className="text-xs text-sub">No physical stock unit locked</span>
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(true)}
                  className="px-2.5 py-1 text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white rounded-control shadow-sm transition-colors"
                >
                  Allocate VIN / Hold
                </button>
              </div>
            )}
          </div>

          {/* Trade-In Vehicle Appraisal Card (if appraised) */}
          {tradeInRecord && (
            <div className="bg-paper border border-line rounded-control p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="size-4 text-cobalt shrink-0" />
                  <span className="text-xs font-bold text-ink">
                    {tradeInRecord.year} {tradeInRecord.make} {tradeInRecord.model}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-cobalt bg-cobalt-tint px-2 py-0.5 rounded-full">
                  Plate ***{tradeInRecord.plateEnding} ({tradeInRecord.codingDay})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-line">
                <div>
                  <span className="text-sub text-[10px] uppercase block font-semibold">Gross Appraisal</span>
                  <span className="font-semibold text-ink tabular-nums">{formatPeso(tradeInRecord.appraisedValue)}</span>
                </div>
                <div>
                  <span className="text-sub text-[10px] uppercase block font-semibold">Net Equity Credit</span>
                  <span className="font-display text-base font-bold text-won tabular-nums">
                    {formatPeso(tradeInRecord.netTradeInEquity)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[11px] text-sub">
                <span>
                  Condition: <strong className="capitalize text-ink">{tradeInRecord.condition}</strong> ({tradeInRecord.mileageKm.toLocaleString()} km)
                </span>
                <button
                  type="button"
                  onClick={() => setShowTradeInModal(true)}
                  className="text-cobalt font-semibold hover:underline"
                >
                  Edit Appraisal
                </button>
              </div>
            </div>
          )}

          {/* Multi-Bank Financing Desk Card */}
          <div className="bg-paper border border-line rounded-control p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-cobalt shrink-0" />
                <span className="text-xs font-bold text-ink">
                  Multi-Bank Financing Approval Matrix
                </span>
              </div>
              {bankOffers.length > 0 && (
                <span className="text-[10px] font-bold text-cobalt bg-cobalt-tint px-2 py-0.5 rounded-full border border-cobalt/20">
                  {bankOffers.length} {bankOffers.length === 1 ? 'Bank' : 'Banks'} Submitted
                </span>
              )}
            </div>

            {bankOffers.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-line">
                {(() => {
                  const accepted = bankOffers.find((o) => o.status === 'accepted');
                  const approved = bankOffers.find((o) => o.status === 'approved');
                  const bestOffer = accepted || approved || bankOffers[0];

                  return (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-sub">
                          {accepted ? (
                            <span className="text-won font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> {accepted.bankName} (Accepted)
                            </span>
                          ) : approved ? (
                            <span className="text-won font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> {approved.bankName} (Approved)
                            </span>
                          ) : (
                            <span className="text-sub">Underwriting ({bankOffers[0].bankName})</span>
                          )}
                        </span>
                        <span className="font-display text-base font-bold text-ink tabular-nums">
                          {formatPeso(bestOffer.monthlyAmortization)}
                          <span className="text-[10px] text-sub font-normal">/mo</span>
                        </span>
                      </div>

                      {accepted?.purchaseOrderNumber && (
                        <p className="text-[10.5px] font-mono text-ink bg-wash px-2 py-1 rounded border border-line">
                          PO #: <strong>{accepted.purchaseOrderNumber}</strong>
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[11px]">
                        <span className="text-sub font-medium">
                          Dealer Reserve:{' '}
                          <strong className="text-won">+{formatPeso(bestOffer.dealerCommissionAmount)}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMultiBankModal(true)}
                          className="text-cobalt font-bold hover:underline"
                        >
                          View All Offers &rarr;
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1 border-t border-line">
                <span className="text-xs text-sub">No bank credit applications submitted</span>
                <button
                  type="button"
                  onClick={() => setShowMultiBankModal(true)}
                  className="px-2.5 py-1 text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white rounded-control shadow-sm transition-colors"
                >
                  Submit Applications
                </button>
              </div>
            )}
          </div>

          {/* Pipeline Action Controls */}
          {lead.status === 'active' && (
            <div className="space-y-2">
              <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider">Pipeline Actions</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={lead.stage === 'released'}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-cobalt text-white rounded-control text-xs font-bold hover:bg-cobalt-press disabled:opacity-50"
                >
                  <ChevronRight className="size-3.5" /> Advance
                </button>
                <button
                  type="button"
                  onClick={handleRegress}
                  disabled={lead.stage === 'new'}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-wash border border-line text-ink rounded-control text-xs font-semibold hover:bg-line/50 disabled:opacity-50"
                >
                  <RotateCcw className="size-3.5" /> Regress
                </button>
                <button
                  type="button"
                  onClick={() => setShowLostDialog(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-card border border-overdue/40 text-overdue rounded-control text-xs font-semibold hover:bg-overdue/10"
                >
                  <Ban className="size-3.5" /> Mark Lost
                </button>
              </div>
            </div>
          )}

          {/* Quick Note & Activity Logging */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider">Quick Actions</span>
              <button
                type="button"
                onClick={handleLogCall}
                className="flex items-center gap-1 text-xs font-semibold text-due hover:underline"
              >
                <PhoneCall className="size-3" /> Quick Call Log
              </button>
            </div>

            {isAddingNote ? (
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record client observation, financing update, or follow-up note..."
                  rows={2}
                  className="w-full p-2 text-xs rounded-control border border-line bg-paper text-ink focus:ring-1 focus:ring-cobalt focus:outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-2.5 py-1 text-xs text-sub hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cobalt text-white text-xs font-semibold rounded-control"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNote(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-line rounded-control text-xs text-sub hover:text-cobalt hover:border-cobalt/60 transition-colors"
              >
                <PlusCircle className="size-3.5" /> Add Customer Note
              </button>
            )}
          </div>

          {/* Showroom Deal Tools */}
          <div className="space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider">Showroom Deal Tools</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setShowVsoModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-cobalt/30 bg-cobalt-tint/40 hover:bg-cobalt-tint text-ink text-center gap-1 transition-colors group"
              >
                <FileCheck className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold text-cobalt">Official VSO</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFinancingModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Calculator className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">F&amp;I Loan Calc</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTradeInModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Repeat className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Trade-In Desk</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQuotationModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <FileText className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Print Quote</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTestDriveModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Compass className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Book Test Drive</span>
              </button>
              <button
                type="button"
                onClick={() => setShowViberModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <MessageSquare className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Viber / SMS</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAllocateModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Boxes className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Allocate VIN</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMultiBankModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Building2 className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Bank Matrix</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDeliveryModal(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Truck className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Delivery Bay</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCommission}
                className="flex flex-col items-center justify-center p-2.5 rounded-control border border-line bg-wash hover:bg-line/60 text-ink text-center gap-1 transition-colors group"
              >
                <Receipt className="size-4 text-cobalt group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold">Commission</span>
              </button>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="space-y-3 pt-2">
            <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider">Audit Trail & Activities</span>
            <ActivityTimeline activities={activities} loading={loadingActivities} />
          </div>
        </div>
      </div>

      <MarkLostDialog
        isOpen={showLostDialog}
        leadTitle={`${lead.customerName} (${lead.modelInterest})`}
        onClose={() => setShowLostDialog(false)}
        onConfirm={handleConfirmLost}
      />

      <FinancingCalculatorModal
        isOpen={showFinancingModal}
        lead={lead}
        onClose={() => setShowFinancingModal(false)}
        onSaveQuotation={handleSaveFinancingQuote}
      />

      <TradeInModal
        isOpen={showTradeInModal}
        lead={lead}
        onClose={() => setShowTradeInModal(false)}
        onSaveAppraisal={handleSaveTradeInAppraisal}
      />

      <QuotationModal
        isOpen={showQuotationModal}
        lead={lead}
        onClose={() => setShowQuotationModal(false)}
      />

      <VehicleSalesOrderModal
        isOpen={showVsoModal}
        lead={lead}
        currentProfile={currentProfile}
        onClose={() => setShowVsoModal(false)}
        initialMode="vso"
        onOrderGenerated={async () => {
          const refreshed = await leadService.getActivities(lead.id);
          setActivities(refreshed);
        }}
      />

      <TurnoverCeremonyModal
        isOpen={showDeliveryModal}
        appointment={deliveryAppointment}
        currentProfile={currentProfile}
        onClose={() => setShowDeliveryModal(false)}
        onAppointmentUpdated={async () => {
          const refreshed = await leadService.getActivities(lead.id);
          setActivities(refreshed);
          const leads = await leadService.getLeads();
          const updated = leads.find((l) => l.id === lead.id);
          if (updated) onLeadUpdated(updated);
        }}
      />

      <TestDriveModal
        isOpen={showTestDriveModal}
        lead={lead}
        onClose={() => setShowTestDriveModal(false)}
        onScheduleTestDrive={handleScheduleTestDrive}
      />

      <ViberScriptModal
        isOpen={showViberModal}
        lead={lead}
        onClose={() => setShowViberModal(false)}
        onLogOutreach={handleLogOutreach}
      />

      <AllocateVehicleModal
        isOpen={showAllocateModal}
        lead={lead}
        onClose={() => setShowAllocateModal(false)}
        onAllocated={handleVehicleAllocated}
      />

      <MultiBankMatrixModal
        isOpen={showMultiBankModal}
        lead={lead}
        onClose={() => setShowMultiBankModal(false)}
        onOfferAccepted={handleOfferAccepted}
      />

      <CommissionSlipModal
        isOpen={showCommissionModal}
        commission={dealCommission}
        onClose={() => setShowCommissionModal(false)}
        onApprove={async (id) => {
          await commissionService.approveCommission(id, currentProfile.fullName);
          if (dealCommission) {
            setDealCommission({
              ...dealCommission,
              status: 'gsm_approved',
              approvedBy: currentProfile.fullName,
              approvedAt: new Date().toISOString(),
            });
          }
        }}
      />
    </div>
  );
};
