import React from 'react';
import { Activity } from '../types/crm';
import { ArrowRight, Phone, Car, FileText, CheckCircle2, Repeat } from 'lucide-react';

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  loading,
}) => {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3 animate-pulse">
            <div className="size-6 rounded-full bg-wash shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-wash rounded w-1/3" />
              <div className="h-2.5 bg-wash rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-xs text-sub italic py-4 text-center">
        No recorded activities yet for this lead.
      </p>
    );
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'stage_change':
        return <ArrowRight className="size-3.5 text-cobalt" />;
      case 'call':
        return <Phone className="size-3.5 text-due" />;
      case 'test_drive':
        return <Car className="size-3.5 text-won" />;
      case 'quote':
        return <CheckCircle2 className="size-3.5 text-cobalt" />;
      case 'trade_in':
        return <Repeat className="size-3.5 text-cobalt" />;
      default:
        return <FileText className="size-3.5 text-sub" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-line">
      {activities.map((act) => (
        <div key={act.id} className="relative group">
          <div className="absolute -left-6 top-0.5 size-5 rounded-full bg-card border border-line flex items-center justify-center shrink-0 shadow-sm">
            {getActivityIcon(act.type)}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink">{act.actorName}</span>
              <span className="text-[10px] text-sub tabular-nums">
                {new Date(act.createdAt).toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-xs text-sub leading-relaxed">{act.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
