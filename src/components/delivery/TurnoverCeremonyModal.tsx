import React, { useState } from 'react';
import type { DeliveryAppointment, PdiItemStatus } from '../../types/delivery';
import type { Profile } from '../../types/crm';
import { deliveryService } from '../../services/deliveryService';
import { PdiChecklistCard } from './PdiChecklistCard';
import { HandoverKitCard } from './HandoverKitCard';
import { GatePassModal } from './GatePassModal';
import {
  X,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Star,
  Printer,
} from 'lucide-react';

interface TurnoverCeremonyModalProps {
  isOpen: boolean;
  appointment: DeliveryAppointment | null;
  currentProfile: Profile;
  onClose: () => void;
  onAppointmentUpdated: (updated: DeliveryAppointment) => void;
}

type TabMode = 'pdi' | 'kit' | 'ceremony';

export const TurnoverCeremonyModal: React.FC<TurnoverCeremonyModalProps> = ({
  isOpen,
  appointment,
  currentProfile,
  onClose,
  onAppointmentUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('ceremony');
  const [showGatePass, setShowGatePass] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [feedback, setFeedback] = useState(appointment?.csiFeedback || '');
  const [rating, setRating] = useState(appointment?.csiRating || 5);

  if (!isOpen || !appointment) return null;

  const handleUpdatePdi = (itemId: string, status: PdiItemStatus) => {
    const updated = deliveryService.updatePdiItem(appointment.id, itemId, status, currentProfile.fullName);
    onAppointmentUpdated(updated);
  };

  const handleToggleKit = (itemId: string) => {
    const updated = deliveryService.toggleHandoverKitItem(appointment.id, itemId);
    onAppointmentUpdated(updated);
  };

  const handleGenerateGatePass = async () => {
    setIsReleasing(true);
    try {
      const result = await deliveryService.generateGatePass(
        appointment.id,
        'SGV Officer Edgardo Santos',
        currentProfile.id,
        currentProfile.fullName
      );
      if (feedback) {
        deliveryService.recordCsiFeedback(appointment.id, rating, feedback);
      }
      onAppointmentUpdated(result.appointment);
      setShowGatePass(true);
    } catch (err) {
      console.error('Failed to issue gate pass:', err);
    } finally {
      setIsReleasing(false);
    }
  };

  const isReleased = appointment.status === 'released';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cobalt-tint text-cobalt border border-cobalt/20">
              BAY 0{appointment.bayNumber}
            </span>
            <h3 className="font-display text-xl font-bold text-ink tracking-tight">
              Vehicle Turnover &amp; Handover Ceremony
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close handover modal"
            className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Customer & Unit Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-wash/50 rounded-control border border-line text-xs">
          <div>
            <p className="font-bold text-ink text-sm">{appointment.modelInterest}</p>
            <p className="text-sub">Customer: <span className="font-semibold text-ink">{appointment.customerName}</span> ({appointment.customerPhone})</p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-ink text-xs">VIN: {appointment.vin}</p>
            <p className="text-sub">Sticker: <span className="font-bold text-ink">{appointment.conductionSticker}</span> • Color: {appointment.color}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-line pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('ceremony')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'ceremony' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:bg-wash'
            }`}
          >
            Turnover Ceremony
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdi')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'pdi' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:bg-wash'
            }`}
          >
            PDI Checklist ({appointment.pdiChecklist.filter((i) => i.status === 'passed').length}/10)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kit')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
              activeTab === 'kit' ? 'bg-cobalt text-white shadow-sm' : 'text-sub hover:bg-wash'
            }`}
          >
            Handover Kit ({appointment.handoverKit.filter((k) => k.verified).length}/7)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'pdi' && (
          <PdiChecklistCard
            checklist={appointment.pdiChecklist}
            qcInspectorName={appointment.qcInspectorName}
            qcSignedAt={appointment.qcSignedAt}
            onUpdateItem={handleUpdatePdi}
          />
        )}

        {activeTab === 'kit' && (
          <HandoverKitCard
            kit={appointment.handoverKit}
            onToggleItem={handleToggleKit}
          />
        )}

        {activeTab === 'ceremony' && (
          <div className="space-y-4 text-xs">
            {/* Ceremony Atmosphere Card */}
            <div className="p-4 bg-cobalt-tint/30 border border-cobalt/30 rounded-control space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink flex items-center gap-1.5 text-sm">
                  <Sparkles className="size-4 text-cobalt" /> Commemorative Delivery Ceremony
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-won/10 text-won">
                  RED RIBBON MOUNTED
                </span>
              </div>
              <p className="text-sub text-[11px] leading-relaxed">
                Ceremonial Big Bow mounted on hood. Delivery bay spotlight illuminated for customer turnover photoshoot and vehicle key handover.
              </p>
            </div>

            {/* CSI Rating Input */}
            <div className="p-3.5 bg-card border border-line rounded-control space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink">48-Hour Customer Satisfaction Index (CSI)</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`size-4 ${
                          star <= rating ? 'text-due fill-due' : 'text-sub/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Client comments regarding delivery ceremony, vehicle cleanliness, and consultant service..."
                rows={2}
                className="w-full p-2 bg-wash/50 border border-line rounded text-xs text-ink focus:outline-none focus:border-cobalt"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-line">
          <div className="text-xs text-sub">
            {isReleased ? (
              <span className="text-won font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Vehicle Released &amp; Cleared by Security
              </span>
            ) : (
              <span>Pending Gate Pass Authorization</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {appointment.gatePass && (
              <button
                type="button"
                onClick={() => setShowGatePass(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors min-h-[40px]"
              >
                <Printer className="size-3.5 text-cobalt" /> View Gate Pass
              </button>
            )}

            {!isReleased && (
              <button
                type="button"
                disabled={isReleasing}
                onClick={handleGenerateGatePass}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[40px] disabled:opacity-50"
              >
                <ShieldAlert className="size-3.5" />
                {isReleasing ? 'Authorizing Exit...' : 'Issue Security Gate Pass'}
              </button>
            )}
          </div>
        </div>
      </div>

      <GatePassModal
        isOpen={showGatePass}
        gatePass={appointment.gatePass || null}
        onClose={() => setShowGatePass(false)}
      />
    </div>
  );
};
