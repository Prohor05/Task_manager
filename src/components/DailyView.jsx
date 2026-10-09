import React, { useMemo, useState } from 'react';
import { CAT_COLORS } from '../App.jsx';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function mondayOf(offset) {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DailyView({ t, tasks, weekOffset, onMove, onOpen }) {
  const [dragId, setDragId] = useState(null);
  const start = mondayOf(weekOffset);
  const columns = DAYS.map((key, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { key, date };
  });

  const grouped = useMemo(() => {
    const g = Object.fromEntries(DAYS.map((d) => [d, []]));
    g.unscheduled = [];
    tasks.forEach((task) => {
      const k = task.day && g[task.day] ? task.day : 'unscheduled';
      g[k].push(task);
    });
    return g;
  }, [tasks]);

  function dropOn(day) {
    if (!dragId) return;
    onMove(dragId, { day });
    setDragId(null);
  }

  return (
    <div className="spring-view h-full flex flex-col gap-4">
      <div className="grid grid-cols-7 gap-3 min-h-[420px]">
        {columns.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dropOn(col.key)}
            className="bg-white rounded-2xl p-3 shadow-card min-h-[360px] border border-transparent"
          >
            <div className="flex items-baseline justify-between mb-3">
              <div className="text-sm font-semibold">{t(col.key)}</div>
              <div className="text-xs text-muted">{col.date.getDate()}</div>
            </div>
            <div className="space-y-2">
              {(grouped[col.key] || []).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  t={t}
                  dragging={dragId === task.id}
                  onDragStart={() => setDragId(task.id)}
                  onOpen={() => onOpen(task)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => dropOn(null)}
        className="bg-white rounded-2xl p-3 shadow-card"
      >
        <div className="text-sm font-semibold mb-2">{t('unscheduled')}</div>
        <div className="flex flex-wrap gap-2">
          {(grouped.unscheduled || []).map((task) => (
            <div key={task.id} className="w-64">
              <TaskCard
                task={task}
                t={t}
                dragging={dragId === task.id}
                onDragStart={() => setDragId(task.id)}
                onOpen={() => onOpen(task)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, t, dragging, onDragStart, onOpen }) {
  const bar = CAT_COLORS[task.category] || CAT_COLORS.Other;
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className={`card-hover cursor-grab active:cursor-grabbing bg-white rounded-xl border border-gray-100 overflow-hidden ${
        dragging ? 'dragging' : ''
      }`}
    >
      <div className="h-1" style={{ background: bar }} />
      <div className="p-3">
        <div className="text-sm font-medium leading-snug">{task.title}</div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
          <span className="px-1.5 py-0.5 rounded-md bg-canvas">{t(task.status)}</span>
          <span>{t(task.priority)}</span>
        </div>
      </div>
    </article>
  );
}
