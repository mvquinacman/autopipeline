import { useState, useMemo } from 'react';
import type { Lead } from '../types/crm';
import { formatPeso } from '../data/seed';
import { MessageSquare, Copy, Check, X, Send, Phone } from 'lucide-react';

interface ViberScriptModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onLogOutreach?: (leadId: string, templateTitle: string) => void;
}

type TemplateType = 'visit_followup' | 'financing_promo' | 'test_drive_invite' | 'release_checklist';

export function ViberScriptModal({
  isOpen,
  lead,
  onClose,
  onLogOutreach,
}: ViberScriptModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('visit_followup');
  const [copied, setCopied] = useState(false);

  const messageText = useMemo(() => {
    if (!lead) return '';

    const srpStr = formatPeso(lead.estValue);

    switch (selectedTemplate) {
      case 'visit_followup':
        return (
          `Good day, ${lead.customerName}! 🚗\n\n` +
          `Thank you for visiting Toyota BGC today. As discussed, here are the details for your inquired ${lead.modelInterest} (${srpStr}).\n\n` +
          `I am preparing the official computation sheet and bank loan options. Please let me know if you have any questions or if you'd like to reserve the incoming unit allocation.\n\n` +
          `Best regards,\n${lead.agentName}\nMetro Manila Motors — BGC Showroom`
        );
      case 'financing_promo':
        return (
          `Hi ${lead.customerName}! 🌟\n\n` +
          `Great news from Toyota BGC! Our partner financing banks (Metrobank, BDO, BPI) have approved low down payment rates for the ${lead.modelInterest}.\n\n` +
          `With a 20% down payment, your estimated monthly amortization is very competitive. Would you like me to send you the official 15-minute quick loan application form?\n\n` +
          `Best regards,\n${lead.agentName}`
        );
      case 'test_drive_invite':
        return (
          `Hello ${lead.customerName}! 🏎️\n\n` +
          `We have our official dealership demo unit for the ${lead.modelInterest} ready at our BGC showroom.\n\n` +
          `Would you be available for a complimentary 20-minute test drive this weekend? I can reserve the unit and gate pass for you.\n\n` +
          `Best regards,\n${lead.agentName}\nToyota BGC Showroom`
        );
      case 'release_checklist':
        return (
          `Congratulations, ${lead.customerName}! 🎉\n\n` +
          `Your vehicle turnover for the brand new ${lead.modelInterest} is scheduled! Here is your gate release checklist:\n` +
          `1. 2 Valid Government IDs\n` +
          `2. Signed Bank Promissory Note & PDCs\n` +
          `3. Comprehensive Insurance Policy Acceptance\n\n` +
          `See you at the BGC showroom for your unit turnover ceremony!\n\n` +
          `Best regards,\n${lead.agentName}`
        );
    }
  }, [lead, selectedTemplate]);

  if (!isOpen || !lead) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogAndClose = () => {
    const titleMap: Record<TemplateType, string> = {
      visit_followup: 'Showroom Visit Follow-up',
      financing_promo: 'Bank Financing Promotion',
      test_drive_invite: 'Test Drive Invitation',
      release_checklist: 'Unit Release Checklist',
    };
    onLogOutreach?.(lead.id, titleMap[selectedTemplate]);
    onClose();
  };

  return (
    <div className="fixed inset-0 m-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card max-w-lg w-full p-4 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-cobalt" />
            <h3 className="font-display text-xl font-bold text-ink">Viber &amp; SMS Outreach Script</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-control text-sub hover:text-ink hover:bg-wash">
            <X className="size-5" />
          </button>
        </div>

        {/* Recipient Context */}
        <div className="bg-wash/60 p-3 rounded-control flex justify-between items-center text-xs">
          <div>
            <p className="font-bold text-ink">{lead.customerName}</p>
            <p className="text-sub">{lead.modelInterest}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-cobalt font-semibold tabular-nums flex items-center gap-1 justify-end">
              <Phone className="size-3" /> {lead.customerPhone}
            </span>
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ink">Select Script Template</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedTemplate('visit_followup')}
              className={`p-2.5 rounded-control font-bold text-left transition-colors min-h-[44px] ${
                selectedTemplate === 'visit_followup' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
              }`}
            >
              1. Showroom Visit Follow-up
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('financing_promo')}
              className={`p-2.5 rounded-control font-bold text-left transition-colors min-h-[44px] ${
                selectedTemplate === 'financing_promo' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
              }`}
            >
              2. Bank Loan Pre-Approval
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('test_drive_invite')}
              className={`p-2.5 rounded-control font-bold text-left transition-colors min-h-[44px] ${
                selectedTemplate === 'test_drive_invite' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
              }`}
            >
              3. Test Drive Invitation
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('release_checklist')}
              className={`p-2.5 rounded-control font-bold text-left transition-colors min-h-[44px] ${
                selectedTemplate === 'release_checklist' ? 'bg-cobalt text-white shadow-sm' : 'bg-wash text-ink hover:bg-line'
              }`}
            >
              4. Unit Release Checklist
            </button>
          </div>
        </div>

        {/* Generated Message Preview */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-ink">Personalized Message</label>
          <textarea
            readOnly
            value={messageText}
            rows={7}
            className="w-full p-3 text-base sm:text-xs rounded-control border border-line bg-paper text-ink font-sans focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-line">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-control text-xs font-bold border border-line transition-colors min-h-[44px] sm:min-h-0 ${
              copied ? 'bg-won text-white' : 'bg-wash hover:bg-line text-ink'
            }`}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Script'}
          </button>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 sm:py-1.5 text-xs font-medium text-sub hover:text-ink min-h-[44px] sm:min-h-0"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleLogAndClose}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[44px] sm:min-h-0"
            >
              <Send className="size-3.5" /> Log Outreach Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
