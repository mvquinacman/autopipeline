import React, { useState, useMemo } from 'react';
import { Lead, Profile } from '../types/crm';
import { calculateAgentMatrix } from '../data/seed';
import { ManagerDrillDownModal } from './ManagerDrillDownModal';
import { Users } from 'lucide-react';

interface ManagerFollowUpMatrixProps {
  leads: Lead[];
  profiles: Profile[];
  onSelectLead: (lead: Lead) => void;
}

type MatrixCategory =
  | 'new'
  | 'notContacted'
  | 'dueToday'
  | 'overdue'
  | 'interested'
  | 'applications'
  | 'released';

export const ManagerFollowUpMatrix: React.FC<ManagerFollowUpMatrixProps> = ({
  leads,
  profiles,
  onSelectLead,
}) => {
  const matrix = useMemo(() => calculateAgentMatrix(leads, profiles), [leads, profiles]);
  const [drillDown, setDrillDown] = useState<{
    isOpen: boolean;
    title: string;
    agentName: string;
    leads: Lead[];
  }>({ isOpen: false, title: '', agentName: '', leads: [] });

  const getFilteredLeads = (agentId: string, category: MatrixCategory): Lead[] => {
    const agentLeads = leads.filter((l) => l.agentId === agentId);
    switch (category) {
      case 'new':
        return agentLeads.filter((l) => l.stage === 'new' || l.stage === 'attempting_contact');
      case 'notContacted':
        return agentLeads.filter((l) => l.status === 'active' && ((l.contactAttempts ?? 0) === 0 || !l.lastActivity));
      case 'dueToday':
        return agentLeads.filter((l) => l.status === 'active' && l.urgency === 'due_today');
      case 'overdue':
        return agentLeads.filter((l) => l.status === 'active' && l.urgency === 'overdue');
      case 'interested':
        return agentLeads.filter((l) => l.status === 'active' && ['interested', 'quotation_sent', 'showroom', 'test_drive', 'contacted'].includes(l.stage));
      case 'applications':
        return agentLeads.filter((l) => ['application', 'processing', 'approved'].includes(l.stage));
      case 'released':
        return agentLeads.filter((l) => l.stage === 'released' || l.status === 'won');
      default:
        return agentLeads;
    }
  };

  const handleCellClick = (agentId: string, agentName: string, category: MatrixCategory, label: string) => {
    const list = getFilteredLeads(agentId, category);
    setDrillDown({
      isOpen: true,
      title: label,
      agentName,
      leads: list,
    });
  };

  return (
    <div className="bg-card border border-line rounded-card overflow-hidden shadow-xs">
      <div className="px-4 py-3 border-b border-line bg-paper flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-cobalt" />
          <h3 className="font-display text-sm font-bold text-ink uppercase tracking-wider">
            Agent Follow-up &amp; Pipeline Discipline Matrix (V1 Priority #6)
          </h3>
        </div>
        <span className="text-[11px] text-sub font-medium">Click any count to drill down</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-wash/60 text-[10.5px] uppercase font-bold text-sub">
              <th className="py-2.5 px-3">Sales Agent</th>
              <th className="py-2.5 px-2.5 text-center">New</th>
              <th className="py-2.5 px-2.5 text-center text-sub">Not Contacted</th>
              <th className="py-2.5 px-2.5 text-center text-due">Due Today</th>
              <th className="py-2.5 px-2.5 text-center text-overdue">Overdue</th>
              <th className="py-2.5 px-2.5 text-center text-cobalt">Interested</th>
              <th className="py-2.5 px-2.5 text-center text-amber-600">Applications</th>
              <th className="py-2.5 px-2.5 text-center text-won">Released</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {matrix.map((row) => (
              <tr key={row.agentId} className="hover:bg-wash/40 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-ink flex items-center gap-2">
                  <div className="size-6 rounded-full bg-cobalt/10 text-cobalt font-bold text-[10px] flex items-center justify-center shrink-0">
                    {row.agentName.charAt(0)}
                  </div>
                  <span>{row.agentName}</span>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'new', 'New Leads')} className="px-2 py-0.5 rounded font-bold hover:bg-line/60 tabular-nums">
                    {row.newCount}
                  </button>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'notContacted', 'Not Contacted Leads')} className="px-2 py-0.5 rounded font-bold text-sub hover:bg-line/60 tabular-nums">
                    {row.notContactedCount}
                  </button>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'dueToday', 'Due Today Follow-Ups')} className="px-2 py-0.5 rounded font-bold text-due bg-due/10 hover:bg-due/20 tabular-nums">
                    {row.dueTodayCount}
                  </button>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'overdue', 'Overdue Leads')} className="px-2 py-0.5 rounded font-bold text-overdue bg-overdue/10 hover:bg-overdue/20 tabular-nums">
                    {row.overdueCount}
                  </button>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'interested', 'Interested Prospects')} className="px-2 py-0.5 rounded font-bold text-cobalt hover:bg-cobalt/10 tabular-nums">
                    {row.interestedCount}
                  </button>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'applications', 'Financing Applications')} className="px-2 py-0.5 rounded font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 tabular-nums">
                    {row.applicationsCount}
                  </button>
                </td>
                <td className="py-2 px-2.5 text-center">
                  <button type="button" onClick={() => handleCellClick(row.agentId, row.agentName, 'released', 'Released Units')} className="px-2 py-0.5 rounded font-bold text-won bg-won/10 hover:bg-won/20 tabular-nums">
                    {row.releasedCount}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ManagerDrillDownModal
        isOpen={drillDown.isOpen}
        title={drillDown.title}
        agentName={drillDown.agentName}
        leads={drillDown.leads}
        onClose={() => setDrillDown((prev) => ({ ...prev, isOpen: false }))}
        onSelectLead={onSelectLead}
      />
    </div>
  );
};
