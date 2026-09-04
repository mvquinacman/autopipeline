import React from 'react';
import { Lead, Profile } from '../types/crm';
import { formatPeso } from '../data/seed';
import { Users } from 'lucide-react';

interface ManagerPerformanceCardProps {
  currentProfile: Profile;
  profiles: Profile[];
  leads: Lead[];
}

export const ManagerPerformanceCard: React.FC<ManagerPerformanceCardProps> = ({
  currentProfile,
  profiles,
  leads,
}) => {
  const agents = profiles.filter((p) => p.role === 'agent');

  return (
    <div className="bg-card border border-line rounded-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-cobalt" />
          <h3 className="font-display text-base font-bold text-ink uppercase tracking-wide">
            {currentProfile.role === 'dealer_principal' ? 'Dealership Sales Leaderboard' : 'Team Alpha Performance'}
          </h3>
        </div>
        <span className="text-xs text-sub font-medium">
          Quota Month: <strong className="text-ink">September 2026</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {agents.map((agent) => {
          const agentLeads = leads.filter((l) => l.agentId === agent.id);
          const activeCount = agentLeads.filter((l) => l.status === 'active').length;
          const closedValue = agentLeads
            .filter((l) => l.status === 'won' || l.stage === 'released')
            .reduce((sum, l) => sum + l.estValue, 0);

          const target = agent.targetValue || 7_000_000;
          const pct = Math.min(100, Math.round((closedValue / target) * 100));

          return (
            <div key={agent.id} className="p-3 bg-paper border border-line rounded-control space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-cobalt/10 text-cobalt font-bold text-xs flex items-center justify-center">
                    {agent.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-ink leading-tight">{agent.fullName}</h4>
                    <p className="text-[11px] text-sub">{activeCount} active pipeline leads</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display text-sm font-bold text-ink tabular-nums">{formatPeso(closedValue, true)}</span>
                  <span className="text-[10px] text-sub block">/ {formatPeso(target, true)}</span>
                </div>
              </div>

              {/* 6px Achievement Bar matching DESIGN.md */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10.5px] text-sub font-medium tabular-nums">
                  <span>Quota Achievement</span>
                  <span className={pct >= 100 ? 'text-won font-bold' : 'text-ink font-semibold'}>{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-wash rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pct >= 100 ? 'bg-won' : 'bg-cobalt'
                    }`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
