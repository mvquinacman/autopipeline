import React, { useState, useEffect, useCallback } from 'react';
import type { FloorQueueEntry, WalkInLog, AgentFloorStatus } from '../types/upSystem';
import { upSystemService } from '../services/upSystemService';
import { LogWalkInModal } from './LogWalkInModal';
import {
  Users,
  Plus,
  UserCheck,
  Clock,
  Car,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const FloorBoardView: React.FC = () => {
  const [queue, setQueue] = useState<FloorQueueEntry[]>([]);
  const [walkIns, setWalkIns] = useState<WalkInLog[]>([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const refreshData = useCallback(() => {
    setQueue(upSystemService.getQueue());
    setWalkIns(upSystemService.getWalkIns());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const nextUpAgent = upSystemService.getNextUpAgent();
  const activeEngagements = queue.filter((e) => e.status === 'with_client');

  const handleStatusChange = (agentId: string, newStatus: AgentFloorStatus) => {
    upSystemService.setAgentStatus(agentId, newStatus);
    refreshData();
  };

  const handleCompleteMeeting = (agentId: string) => {
    upSystemService.completeMeeting(agentId, 'Completed floor consultation');
    refreshData();
  };

  const getStatusBadge = (status: AgentFloorStatus) => {
    switch (status) {
      case 'up_next':
        return (
          <span className="text-[10.5px] font-bold text-won bg-won/10 px-2 py-0.5 rounded-full border border-won/20 animate-pulse">
            UP NEXT
          </span>
        );
      case 'ready':
        return (
          <span className="text-[10.5px] font-bold text-cobalt bg-cobalt-tint px-2 py-0.5 rounded-full border border-cobalt/20">
            ON FLOOR
          </span>
        );
      case 'with_client':
        return (
          <span className="text-[10.5px] font-bold text-due bg-due/10 px-2 py-0.5 rounded-full border border-due/20">
            WITH CLIENT
          </span>
        );
      case 'on_test_drive':
        return (
          <span className="text-[10.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            ON DEMO DRIVE
          </span>
        );
      default:
        return (
          <span className="text-[10.5px] font-bold text-sub bg-sub/10 px-2 py-0.5 rounded-full border border-sub/20">
            OFF FLOOR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-cobalt" />
            <h2 className="font-display text-2xl font-bold text-ink">Showroom Floor Board</h2>
          </div>
          <p className="text-xs text-sub">
            Real-time walk-in traffic up-system &amp; consultant rotation queue
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLogModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-control text-xs font-bold bg-cobalt hover:bg-cobalt-press text-white shadow-sm transition-colors min-h-[40px]"
        >
          <Plus className="size-4" /> Log Showroom Walk-In
        </button>
      </div>

      {/* Up-System KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line rounded-card overflow-hidden">
        <div className="bg-card p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Consultant Up Next
          </span>
          <p className="font-display text-2xl font-bold text-cobalt truncate">
            {nextUpAgent ? nextUpAgent.agentName : 'None Available'}
          </p>
          <span className="text-[10px] text-sub">Next in line to greet walk-in</span>
        </div>

        <div className="bg-card p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Available on Floor
          </span>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">
            {queue.filter((e) => e.status === 'up_next' || e.status === 'ready').length}
          </p>
          <span className="text-[10px] text-sub">Ready to receive clients</span>
        </div>

        <div className="bg-card p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            With Clients Now
          </span>
          <p className="font-display text-2xl font-bold text-due tabular-nums">
            {activeEngagements.length}
          </p>
          <span className="text-[10px] text-sub">In showroom consultations</span>
        </div>

        <div className="bg-card p-4">
          <span className="text-[11px] font-semibold text-sub uppercase block mb-1">
            Today&#39;s Showroom Ups
          </span>
          <p className="font-display text-2xl font-bold text-ink tabular-nums">
            {walkIns.length}
          </p>
          <span className="text-[10px] text-sub">Walk-ins logged today</span>
        </div>
      </div>

      {/* Up-Rotation Queue Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-1.5">
            <UserCheck className="size-4 text-cobalt" /> Active Floor Rotation Queue
          </h3>
          <span className="text-xs text-sub">Auto-advances as walk-ins arrive</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {queue.map((entry) => (
            <div
              key={entry.id}
              className={`p-3.5 rounded-card border transition-all ${
                entry.status === 'up_next'
                  ? 'border-won bg-card shadow-sm'
                  : 'border-line bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-sub">
                    #{entry.position}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-ink">{entry.agentName}</h4>
                    <p className="text-[10px] text-sub">Sales Consultant</p>
                  </div>
                </div>
                {getStatusBadge(entry.status)}
              </div>

              {entry.currentCustomerName && (
                <div className="bg-paper p-2 rounded-control text-xs mb-2.5 border border-line">
                  <span className="text-[10px] text-sub uppercase block font-semibold">
                    Current Client
                  </span>
                  <p className="font-bold text-ink">{entry.currentCustomerName}</p>
                  <p className="text-cobalt text-[11px] font-medium">{entry.currentModelInterest}</p>
                </div>
              )}

              {/* Status Switcher Controls */}
              <div className="flex items-center justify-between gap-1 pt-2 border-t border-line text-[11px]">
                <span className="text-sub font-medium">Change Floor Status:</span>
                <div className="relative inline-flex items-center">
                  <select
                    aria-label={`Change status for ${entry.agentName}`}
                    value={entry.status}
                    onChange={(e) =>
                      handleStatusChange(entry.agentId, e.target.value as AgentFloorStatus)
                    }
                    className="h-6 pl-1.5 pr-5 text-xs bg-paper border border-line rounded text-ink appearance-none focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    <option value="up_next">Up Next</option>
                    <option value="ready">On Floor</option>
                    <option value="with_client">With Client</option>
                    <option value="on_test_drive">On Demo Drive</option>
                    <option value="off_floor">Off Floor</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-sub pointer-events-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Client Engagements */}
      {activeEngagements.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-ink flex items-center gap-1.5">
            <Clock className="size-4 text-due" /> Active Client Consultations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeEngagements.map((eng) => (
              <div
                key={eng.id}
                className="bg-card border border-due/40 rounded-card p-4 flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-due tracking-wider">
                      Meeting in Progress
                    </span>
                    <h4 className="text-sm font-bold text-ink">{eng.currentCustomerName}</h4>
                    <p className="text-xs text-cobalt font-semibold">{eng.currentModelInterest}</p>
                  </div>
                  <span className="text-xs text-sub font-medium">
                    Consultant: <strong className="text-ink">{eng.agentName}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => handleCompleteMeeting(eng.agentId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-wash hover:bg-line text-ink border border-line transition-colors"
                  >
                    <CheckCircle2 className="size-3.5 text-won" /> Complete &amp; Return to Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Showroom Traffic Log */}
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-ink flex items-center gap-1.5">
          <Car className="size-4 text-cobalt" /> Today&#39;s Showroom Walk-In Traffic
        </h3>

        <div className="bg-card border border-line rounded-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper border-b border-line text-sub uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Model of Interest</th>
                  <th className="py-2.5 px-3">Assigned Consultant</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {walkIns.map((w) => (
                  <tr key={w.id} className="hover:bg-wash/50 transition-colors">
                    <td className="py-2.5 px-3 text-sub tabular-nums">
                      {new Date(w.timestamp).toLocaleTimeString('en-PH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-ink block">{w.customerName}</span>
                      <span className="text-[11px] text-sub tabular-nums">{w.customerPhone}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-ink">{w.modelInterest}</td>
                    <td className="py-2.5 px-3 font-medium text-ink">{w.assignedAgentName}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] uppercase font-semibold text-sub bg-wash px-2 py-0.5 rounded border border-line">
                        {w.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          w.status === 'active'
                            ? 'text-due bg-due/10 border-due/20'
                            : 'text-won bg-won/10 border-won/20'
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LogWalkInModal
        isOpen={isLogModalOpen}
        nextUpAgent={nextUpAgent}
        onClose={() => setIsLogModalOpen(false)}
        onWalkInCreated={refreshData}
      />
    </div>
  );
};
