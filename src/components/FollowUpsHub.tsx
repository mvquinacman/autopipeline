import { useState, useMemo } from 'react';
import type { FollowUpWithLead, Profile } from '../types/crm';
import { FollowUpCard } from './FollowUpCard';
import { CheckCircle, AlertOctagon, Clock } from 'lucide-react';

interface FollowUpsHubProps {
  followUps: FollowUpWithLead[];
  currentProfile: Profile;
  onComplete: (id: string) => void;
  onReschedule: (id: string, newDate: string) => void;
  onSelectLead?: (leadId: string) => void;
}

type TabType = 'active' | 'overdue' | 'due_today' | 'upcoming' | 'done';

export function FollowUpsHub({
  followUps,
  currentProfile,
  onComplete,
  onReschedule,
  onSelectLead,
}: FollowUpsHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const todayStr = '2026-09-04'; // Dealership reference date

  const counts = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    let done = 0;
    let escalated = 0;

    for (const f of followUps) {
      if (f.status === 'done') {
        done += 1;
      } else {
        const isPast = f.dueDate < `${todayStr}T00:00:00Z` || f.status === 'missed';
        const isToday = f.dueDate.startsWith(todayStr);

        if (isPast) overdue += 1;
        else if (isToday) dueToday += 1;
        else upcoming += 1;

        if (f.isEscalated) escalated += 1;
      }
    }
    return { overdue, dueToday, upcoming, done, active: overdue + dueToday + upcoming, escalated };
  }, [followUps, todayStr]);

  const filtered = useMemo(() => {
    return followUps.filter((f) => {
      if (activeTab === 'done') return f.status === 'done';
      if (f.status === 'done') return false;
      if (activeTab === 'active') return true;

      const isPast = f.dueDate < `${todayStr}T00:00:00Z` || f.status === 'missed';
      const isToday = f.dueDate.startsWith(todayStr);

      if (activeTab === 'overdue') return isPast;
      if (activeTab === 'due_today') return isToday;
      if (activeTab === 'upcoming') return !isPast && !isToday;
      return true;
    });
  }, [followUps, activeTab, todayStr]);

  const isManager = currentProfile.role !== 'agent';

  return (
    <div className="space-y-4">
      {isManager && counts.escalated > 0 && (
        <div className="bg-overdue/10 border border-overdue/20 rounded-card p-3 flex items-center gap-2.5 text-overdue text-xs font-semibold">
          <AlertOctagon className="size-4 shrink-0" />
          <span>
            Manager Alert: {counts.escalated} follow-up tasks are overdue by &gt;24 hours and have been escalated for review.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors ${
            activeTab === 'active' ? 'bg-cobalt text-white' : 'bg-wash text-ink hover:bg-line'
          }`}
        >
          Active Tasks ({counts.active})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors ${
            activeTab === 'overdue' ? 'bg-overdue text-white' : 'bg-wash text-overdue hover:bg-line'
          }`}
        >
          Overdue ({counts.overdue})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('due_today')}
          className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors ${
            activeTab === 'due_today' ? 'bg-due text-white' : 'bg-wash text-ink hover:bg-line'
          }`}
        >
          Due Today ({counts.dueToday})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors ${
            activeTab === 'upcoming' ? 'bg-ink text-white' : 'bg-wash text-ink hover:bg-line'
          }`}
        >
          Upcoming ({counts.upcoming})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('done')}
          className={`px-3 py-1.5 rounded-control text-xs font-bold transition-colors ${
            activeTab === 'done' ? 'bg-won text-white' : 'bg-wash text-ink hover:bg-line'
          }`}
        >
          Completed ({counts.done})
        </button>
      </div>

      {/* List / 5-State Completeness */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-line rounded-card p-12 text-center space-y-2">
          <div className="size-10 rounded-full bg-wash flex items-center justify-center mx-auto text-sub">
            {activeTab === 'done' ? <Clock className="size-5" /> : <CheckCircle className="size-5 text-won" />}
          </div>
          <p className="font-display text-lg font-bold text-ink">No tasks in this queue</p>
          <p className="text-xs text-sub">
            {activeTab === 'overdue'
              ? 'Great work! There are no overdue follow-ups.'
              : 'All scheduled customer touchpoints are up to date.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((fu) => (
            <FollowUpCard
              key={fu.id}
              followUp={fu}
              onComplete={onComplete}
              onReschedule={onReschedule}
              onSelectLead={onSelectLead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
