import { useMemo } from 'react';
import { STAGES } from '../data/seed';
import type { Lead, Stage, StageConfig } from '../types/crm';

interface StageRailProps {
  leads: Lead[];
  activeStage: Stage | null;
  onSelectStage: (stage: Stage | null) => void;
  stages?: StageConfig[];
}

const STAGE_BG_ACTIVE: Record<string, string> = {
  new: 'bg-stage-new',
  contacted: 'bg-stage-contacted',
  showroom: 'bg-stage-showroom',
  test_drive: 'bg-stage-testdrive',
  application: 'bg-stage-application',
  approved: 'bg-stage-approved',
  released: 'bg-stage-released',
};

export function StageRail({
  leads,
  activeStage,
  onSelectStage,
  stages = STAGES,
}: StageRailProps) {
  const counts = useMemo(() => {
    const record: Record<string, number> = {};
    for (const lead of leads) {
      record[lead.stage] = (record[lead.stage] || 0) + 1;
    }
    return record;
  }, [leads]);

  return (
    <nav
      aria-label="Pipeline Stages"
      className="w-full overflow-x-auto flex-nowrap scrollbar-none snap-x snap-mandatory touch-pan-x py-1 flex items-center gap-2"
    >
      <button
        type="button"
        onClick={() => onSelectStage(null)}
        className={`shrink-0 px-3.5 py-2.5 rounded-control flex flex-col items-center justify-center transition-colors min-h-[44px] snap-start focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:outline-none ${
          activeStage === null
            ? 'bg-cobalt text-white shadow-sm'
            : 'bg-wash text-ink hover:bg-line/60'
        }`}
      >
        <span className="font-display text-[22px] font-bold leading-none tabular-nums">
          {leads.length}
        </span>
        <span className="text-[10.5px] uppercase font-bold tracking-wider mt-1">
          All Stages
        </span>
      </button>

      <div className="flex items-center flex-nowrap shrink-0 md:flex-1">
        {stages.map((stage, index) => {
          const isActive = activeStage === stage.id;
          const count = counts[stage.id] ?? 0;
          const isFirst = index === 0;
          const isLast = index === stages.length - 1;

          const clipClass = isFirst
            ? 'clip-chevron-first'
            : isLast
            ? 'clip-chevron-last'
            : 'clip-chevron';

          const activeBg = STAGE_BG_ACTIVE[stage.id] || 'bg-cobalt';

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onSelectStage(isActive ? null : stage.id)}
              style={isActive ? { backgroundColor: stage.color } : undefined}
              className={`min-w-[124px] md:flex-1 min-h-[44px] py-2 px-3 snap-start flex flex-col items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                index > 0 ? '-ml-3' : ''
              } ${clipClass} ${
                isActive
                  ? `${activeBg} text-white shadow-sm z-10`
                  : 'bg-wash text-ink hover:bg-line/60'
              }`}
            >
              <span className="font-display text-[22px] font-bold leading-none tabular-nums">
                {count}
              </span>
              <span className="text-[10.5px] uppercase font-bold tracking-wider mt-1 truncate max-w-[100px]">
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
