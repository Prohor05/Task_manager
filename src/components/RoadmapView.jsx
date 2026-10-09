import React, { useMemo } from 'react';
import { CAT_COLORS } from '../App.jsx';

const DAY = 86400000;

export default function RoadmapView({ t, tasks, onOpen }) {
  const { min, max, span } = useMemo(() => {
    const dates = tasks.flatMap((x) => [x.start_date, x.end_date, x.deadline].filter(Boolean).map((d) => new Date(d).getTime()));
    const now = Date.now();
    const min = dates.length ? Math.min(...dates, now) : now;
    const max = dates.length ? Math.max(...dates, now + DAY * 14) : now + DAY * 21;
    return { min, max: max + DAY, span: Math.max(max - min, DAY * 7) };
  }, [tasks]);

  const ticks = Math.min(14, Math.ceil(span / DAY));
  const byCat = useMemo(() => {
    const m = {};
    tasks.forEach((task) => {
      const c = task.category || 'Other';
      (m[c] ||= []).push(task);
    });
    return m;
  }, [tasks]);

  return (
    <div className="spring-view bg-white rounded-2xl shadow-card p-5 overflow-auto">
      <div className="text-sm font-semibold mb-4">{t('roadmap')}</div>
      <div className="min-w-[860px]">
        <div className="flex text-[11px] text-muted mb-2 pl-40">
          {Array.from({ length: ticks }).map((_, i) => {
            const d = new Date(min + i * (span / ticks));
            return (
              <div key={i} className="flex-1">
                {d.getMonth() + 1}/{d.getDate()}
              </div>
            );
          })}
        </div>
        {Object.entries(byCat).map(([cat, list]) => (
          <div key={cat} className="mb-6">
            <div className="text-xs font-semibold mb-2" style={{ color: '#4B5563' }}>
              {cat}
            </div>
            {list.map((task) => {
              const s = new Date(task.start_date || task.deadline || min).getTime();
              const e = new Date(task.end_date || task.deadline || s + DAY * 2).getTime();
              const left = ((s - min) / span) * 100;
              const width = Math.max(((e - s) / span) * 100, 4);
              return (
                <button
                  key={task.id}
                  onClick={() => onOpen(task)}
                  className="w-full flex items-center gap-3 mb-2 group"
                >
                  <div className="w-40 shrink-0 text-left text-xs truncate">{task.title}</div>
                  <div className="flex-1 h-8 relative bg-canvas rounded-lg">
                    <div
                      className="absolute top-1 bottom-1 rounded-md card-hover"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: CAT_COLORS[cat] || CAT_COLORS.Other
                      }}
                    />
                    {task.depends_on && (
                      <div className="absolute inset-y-0 left-0 w-px bg-accent/30" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
        {tasks.length === 0 && <div className="text-sm text-muted">{t('noTasks')}</div>}
      </div>
    </div>
  );
}
