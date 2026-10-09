import React, { useState } from 'react';

export default function Sidebar({ t, projects, projectId, onSelectProject, view, onView, onNewProject, onNewTask }) {
  const [name, setName] = useState('');
  const nav = [
    { id: 'daily', label: t('daily') },
    { id: 'roadmap', label: t('roadmap') },
    { id: 'settings', label: t('settings') }
  ];
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col">
      <div className="px-5 py-5">
        <div className="text-lg font-semibold tracking-tight">{t('appName')}</div>
        <div className="text-xs text-muted mt-0.5">Flat Design 2.0</div>
      </div>
      <nav className="px-3 space-y-1">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => onView(n.id)}
            className={`btn-glow w-full text-left px-3 py-2 rounded-xl text-sm ${
              view === n.id ? 'bg-accentSoft text-accent font-medium' : 'text-ink hover:bg-gray-50'
            }`}
          >
            {n.label}
          </button>
        ))}
      </nav>
      <div className="px-5 mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t('projects')}</div>
      <button
        onClick={() => onSelectProject(null)}
        className={`mx-3 mb-1 text-left px-3 py-2 rounded-xl text-sm btn-glow ${
          !projectId ? 'bg-accentSoft text-accent' : 'hover:bg-gray-50'
        }`}
      >
        {t('allTasks')}
      </button>
      <div className="flex-1 overflow-auto px-3 space-y-1">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProject(p.id)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 btn-glow ${
              projectId === p.id ? 'bg-accentSoft text-accent' : 'hover:bg-gray-50'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="truncate">{p.name}</span>
          </button>
        ))}
      </div>
      <form
        className="p-3 border-t border-gray-100"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onNewProject(name.trim());
          setName('');
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('newProject')}
          className="w-full text-sm px-3 py-2 rounded-xl bg-canvas outline-none focus:ring-2 focus:ring-accent/30"
        />
      </form>
      <button
        onClick={onNewTask}
        className="m-3 btn-glow bg-accent text-white text-sm font-medium py-2.5 rounded-xl"
      >
        {t('newTask')}
      </button>
    </aside>
  );
}
