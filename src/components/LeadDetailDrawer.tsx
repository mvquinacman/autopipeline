import React, { useState, useEffect } from 'react';
import { Lead, Activity, Profile } from '../types/crm';
import { leadService } from '../services/leadService';
import { formatPeso } from '../data/seed';
import { StatusPill } from './StatusPill';
import { ActivityTimeline } from './ActivityTimeline';
import { MarkLostDialog } from './MarkLostDialog';
import { FinancingCalculatorModal } from './FinancingCalculatorModal';
import { QuotationModal } from './QuotationModal';
import { TestDriveModal } from './TestDriveModal';
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
  Compass,
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setLoadingActivities(true);
    leadService.getActivities(lead.id).then((acts) => {
      setActivities(acts);
      setLoadingActivities(false);
    });
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

  const isManagerOrOwner = currentProfile.role === 'manager' || currentProfile.role === 'dealer_principal';

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-card border-l border-line h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-paper">
          <div className="space-y-0.5">
            <span className="text-[10.5px] uppercase font-bold text-sub tracking-wider">Lead Inspector</span>
            <h2 className="font-display text-xl font-bold text-ink leading-none">{lead.modelInterest}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-control text-sub hover:text-ink hover:bg-wash">
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

            {isManagerOrOwner && (
              <div className="pt-2 border-t border-line flex items-center gap-2 text-xs">
                <UserCheck className="size-3.5 text-cobalt shrink-0" />
                <span className="text-sub font-semibold">Reassign:</span>
                <select
                  value={lead.agentId}
                  onChange={(e) => handleReassign(e.target.value)}
                  className="h-7 px-2 text-xs bg-card border border-line rounded text-ink focus:ring-1 focus:ring-cobalt"
                >
                  {profiles.filter((p) => p.role === 'agent').map((p) => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
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
            <div className="grid grid-cols-3 gap-2">
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

      <QuotationModal
        isOpen={showQuotationModal}
        lead={lead}
        onClose={() => setShowQuotationModal(false)}
      />

      <TestDriveModal
        isOpen={showTestDriveModal}
        lead={lead}
        onClose={() => setShowTestDriveModal(false)}
        onScheduleTestDrive={handleScheduleTestDrive}
      />
    </div>
  );
};
