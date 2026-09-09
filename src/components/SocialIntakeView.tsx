import React, { useState, useEffect, useCallback } from 'react';
import type { Profile, Lead } from '../types/crm';
import type { SocialLead, SocialChannel } from '../types/socialIntake';
import { socialIntakeService } from '../services/socialIntakeService';
import { SocialLeadCard } from './social/SocialLeadCard';
import { SimulateLeadAdModal } from './social/SimulateLeadAdModal';
import { SocialKpiStrip } from './social/SocialKpiStrip';
import { Sparkles, Globe } from 'lucide-react';

interface SocialIntakeViewProps {
  currentProfile: Profile;
  onLeadConverted?: (lead: Lead) => void;
}

export const SocialIntakeView: React.FC<SocialIntakeViewProps> = ({
  currentProfile,
  onLeadConverted,
}) => {
  const [leads, setLeads] = useState<SocialLead[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<SocialChannel | 'all'>('all');
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const loadData = useCallback(async () => {
    const list = await socialIntakeService.getSocialLeads();
    setLeads(list);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleContact = async (id: string, channel: 'call' | 'viber' | 'sms') => {
    await socialIntakeService.logFirstContact(id, channel, 'Outreach logged', currentProfile.id, currentProfile.fullName);
    await loadData();
  };

  const handleConvert = async (id: string) => {
    const result = await socialIntakeService.convertSocialLeadToPipeline(id, currentProfile.id, currentProfile.fullName);
    await loadData();
    onLeadConverted?.(result.pipelineLead);
  };

  const handleClaim = async (id: string) => {
    await socialIntakeService.claimSocialLead(id, currentProfile.id, currentProfile.fullName);
    await loadData();
  };

  const handleSimulate = async (data: Partial<SocialLead>) => {
    await socialIntakeService.simulateIncomingLead(data);
    await loadData();
  };

  const kpis = socialIntakeService.getKpis(leads);

  const filtered = leads.filter((l) => {
    if (selectedChannel === 'all') return true;
    return l.channel === selectedChannel;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-cobalt" />
            <h2 className="font-display text-2xl font-bold text-ink">Social Lead Intake Hub</h2>
          </div>
          <p className="text-xs text-sub">
            Meta Lead Ads, Viber Inquiries &amp; Website Inquiries with 15-Minute Dealership SLA
          </p>
        </div>
      </div>

      <SocialKpiStrip kpis={kpis} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'meta_lead_ad', 'viber_inquiry', 'website_form'] as const).map((channel) => (
            <button
              key={channel}
              type="button"
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors ${
                selectedChannel === channel
                  ? 'bg-cobalt text-white shadow-sm'
                  : 'bg-wash text-ink hover:bg-line border border-line'
              }`}
            >
              {channel === 'all' ? 'All Channels' : channel === 'meta_lead_ad' ? 'Meta Lead Ads' : channel === 'viber_inquiry' ? 'Viber' : 'Website'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsSimulateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors"
        >
          <Sparkles className="size-3.5" />
          <span>Simulate Meta Lead Ad</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((lead) => (
          <SocialLeadCard
            key={lead.id}
            lead={lead}
            onContact={handleContact}
            onConvert={handleConvert}
            onClaim={handleClaim}
          />
        ))}
      </div>

      <SimulateLeadAdModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
        onSimulate={handleSimulate}
      />
    </div>
  );
};
