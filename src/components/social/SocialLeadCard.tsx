import React from 'react';
import type { SocialLead } from '../../types/socialIntake';
import { SlaCountdownTimer } from './SlaCountdownTimer';
import { MessageSquare, PhoneCall, ArrowRight } from 'lucide-react';

interface SocialLeadCardProps {
  lead: SocialLead;
  onContact: (id: string, channel: 'call' | 'viber' | 'sms') => void;
  onConvert: (id: string) => void;
  onClaim?: (id: string) => void;
}

export const SocialLeadCard: React.FC<SocialLeadCardProps> = ({
  lead,
  onContact,
  onConvert,
  onClaim,
}) => {
  return (
    <div className="bg-card border border-line rounded-card p-4 space-y-3 hover:border-cobalt/60 transition-colors shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              lead.channel === 'meta_lead_ad'
                ? 'bg-cobalt text-white'
                : lead.channel === 'viber_inquiry'
                ? 'bg-[#7360F2]/15 text-[#59267c] dark:text-[#7360F2]'
                : 'bg-wash text-ink'
            }`}>
              {lead.channel === 'meta_lead_ad' ? 'Meta Lead Ad' : lead.channel === 'viber_inquiry' ? 'Viber' : 'Website'}
            </span>
            <span className="text-xs text-sub truncate max-w-[200px]">{lead.campaignName}</span>
          </div>
          <h4 className="text-sm font-bold text-ink">{lead.customerName}</h4>
          <p className="text-xs text-sub">{lead.customerPhone} • {lead.customerEmail}</p>
        </div>
        <SlaCountdownTimer
          deadline={lead.slaDeadline}
          slaStatus={lead.slaStatus}
          firstContactTimestamp={lead.firstContactTimestamp}
        />
      </div>

      <div className="bg-paper p-2.5 rounded-control border border-line space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-bold text-ink">{lead.modelInterest}</span>
          <span className="text-[11px] font-semibold text-cobalt capitalize">{lead.preferredFinancing}</span>
        </div>
        {lead.downpaymentBudget && (
          <p className="text-[11px] text-sub">Budget / DP: <strong className="text-ink">{lead.downpaymentBudget}</strong></p>
        )}
        {lead.customerMessage && (
          <p className="text-[11px] text-sub italic mt-1 bg-card p-1.5 rounded border border-line/60">
            &ldquo;{lead.customerMessage}&rdquo;
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-line/60 text-xs">
        <span className="text-sub text-[11px]">
          Assigned: <strong className="text-ink">{lead.assignedAgentName || 'Unassigned'}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          {lead.status === 'unclaimed' && onClaim && (
            <button
              type="button"
              onClick={() => onClaim(lead.id)}
              className="px-2 py-1 text-[11px] font-semibold text-sub hover:text-cobalt border border-line rounded"
            >
              Claim
            </button>
          )}

          {lead.status !== 'converted' && (
            <>
              <button
                type="button"
                onClick={() => onContact(lead.id, 'viber')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-wash hover:bg-line text-ink border border-line rounded transition-colors"
                title="Send official Viber greeting"
              >
                <MessageSquare className="size-3 text-cobalt" /> Viber
              </button>
              <button
                type="button"
                onClick={() => onContact(lead.id, 'call')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-wash hover:bg-line text-ink border border-line rounded transition-colors"
                title="Log phone call outreach"
              >
                <PhoneCall className="size-3 text-due" /> Call
              </button>
              <button
                type="button"
                onClick={() => onConvert(lead.id)}
                title="Convert to CRM lead"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-cobalt hover:bg-cobalt-press text-white rounded shadow-sm transition-colors"
              >
                Pipeline <ArrowRight className="size-3" />
              </button>
            </>
          )}

          {lead.status === 'converted' && (
            <span className="text-[11px] font-bold text-won inline-flex items-center gap-1">
              ✓ Converted to CRM Lead
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
