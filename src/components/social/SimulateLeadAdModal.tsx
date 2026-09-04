import React, { useState } from 'react';
import type { SocialLead } from '../../types/socialIntake';
import { X, Sparkles, Send } from 'lucide-react';

interface SimulateLeadAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (data: Partial<SocialLead>) => void;
}

const PRESETS = [
  { campaign: 'Meta Ad: Fortuner Midyear Zero DP Special', model: 'Toyota Fortuner 2.8 LTD', message: 'Low downpayment promo & fast BDO/BPI PO approval.' },
  { campaign: 'Meta Ad: Hilux GR-S Tough & Ready Promo', model: 'Toyota Hilux GR-S 4x4', message: '3-year term financing and trade-in valuation on pickup.' },
  { campaign: 'Viber Community: RAV4 Hybrid Availability', model: 'Toyota RAV4 HEV', message: 'Confirm if HEV unit is ready in delivery bay for release.' },
];

export const SimulateLeadAdModal: React.FC<SimulateLeadAdModalProps> = ({ isOpen, onClose, onSimulate }) => {
  const [customerName, setCustomerName] = useState('Miguel Hernandez');
  const [customerPhone, setCustomerPhone] = useState('+63 917 444 8899');
  const [modelInterest, setModelInterest] = useState('Toyota Fortuner 2.8 LTD');
  const [campaignName, setCampaignName] = useState('Meta Ad: Fortuner Midyear Zero DP Special');
  const [message, setMessage] = useState('Saw your Facebook ad. Can you send monthly amortization options?');

  if (!isOpen) return null;

  const handlePreset = (p: typeof PRESETS[0]) => {
    setCampaignName(p.campaign);
    setModelInterest(p.model);
    setMessage(p.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate({
      customerName, customerPhone, modelInterest, campaignName,
      customerMessage: message,
      channel: campaignName.includes('Viber') ? 'viber_inquiry' : 'meta_lead_ad',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-line rounded-card shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-line bg-paper">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-control bg-cobalt-tint text-cobalt"><Sparkles className="size-4" /></div>
            <div>
              <h3 className="text-sm font-bold text-ink">Simulate Live Lead Intake</h3>
              <p className="text-[11px] text-sub">Test 15-Minute SLA &amp; Floor Queue Auto-Dispatch</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-control hover:bg-line text-sub"><X className="size-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10.5px] uppercase font-bold text-sub">Ad Campaign Presets</span>
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((p) => (
                <button key={p.model} type="button" onClick={() => handlePreset(p)} className="px-2 py-1 bg-wash hover:bg-line text-ink rounded text-[11px] font-semibold border border-line">
                  {p.model.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] uppercase font-bold text-sub block">Customer Full Name</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required className="w-full h-8 px-2.5 bg-paper border border-line rounded text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] uppercase font-bold text-sub block">Mobile Phone Number</label>
            <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required className="w-full h-8 px-2.5 bg-paper border border-line rounded text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] uppercase font-bold text-sub block">Vehicle Interest</label>
            <input type="text" value={modelInterest} onChange={(e) => setModelInterest(e.target.value)} required className="w-full h-8 px-2.5 bg-paper border border-line rounded text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[10.5px] uppercase font-bold text-sub block">Inquiry Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="w-full p-2 bg-paper border border-line rounded text-xs text-ink focus:ring-1 focus:ring-cobalt focus:outline-none" />
          </div>

          <div className="pt-2 border-t border-line flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-xs font-semibold bg-wash hover:bg-line text-sub">Cancel</button>
            <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm">
              <Send className="size-3.5" /> Inject Webhook Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
