import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import en from './i18n/en.json';
import ru from './i18n/ru.json';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import DailyView from './components/DailyView.jsx';
import RoadmapView from './components/RoadmapView.jsx';
import TaskModal from './components/TaskModal.jsx';
import SettingsView from './components/SettingsView.jsx';

const dicts = { en, ru };
export const CAT_COLORS = {
  Development: '#93C5FD',
  Testing: '#FCD34D',
  Content: '#C4B5FD',
  Design: '#F9A8D4',
  Other: '#A7F3D0'
};

export default function App() {
  const [lang, setLang] = useState('en');
  const t = useCallback((k) => dicts[lang]?.[k] || dicts.en[k] || k, [lang]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [view, setView] = useState('daily');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [weekOffset, setWeekOffset] = useState(0);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    const [p, settings] = await Promise.all([api.projects.list(), api.settings.get()]);
    setProjects(p);
    if (settings?.language) setLang(settings.language);
    const list = await api.tasks.list(projectId);
    setTasks(list);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    return tasks.filter((task) => {
      if (search && !`${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter !== 'all' && task.status !== filter) return false;
      return true;
    });
  }, [tasks, search, filter]);

  async function changeLang(next) {
    setLang(next);
    await api.settings.set('language', next);
  }

  async function saveTask(data, id) {
    if (id) await api.tasks.update(id, data);
    else await api.tasks.create({ ...data, project_id: projectId || projects[0]?.id });
    setModal(null);
    load();
  }

  async function removeTask(id) {
    await api.tasks.delete(id);
    setModal(null);
    load();
  }

  async function moveTask(id, patch) {
    await api.tasks.update(id, patch);
    load();
  }

  async function addProject(name) {
    await api.projects.create(name);
    load();
  }

  return (
    <div className="flex h-full bg-canvas overflow-hidden">
      <Sidebar
        t={t}
        projects={projects}
        projectId={projectId}
        onSelectProject={setProjectId}
        view={view}
        onView={(v) => setView(v)}
        onNewProject={addProject}
        onNewTask={() => setModal({})}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          t={t}
          lang={lang}
          onLang={changeLang}
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          weekOffset={weekOffset}
          onWeek={setWeekOffset}
          onInvite={() => {
            setToast(t('mockInvite'));
            setTimeout(() => setToast(''), 2200);
          }}
        />
        <main className="flex-1 overflow-auto p-6">
          {view === 'settings' ? (
            <SettingsView t={t} lang={lang} onLang={changeLang} />
          ) : view === 'roadmap' ? (
            <RoadmapView key="rm" t={t} tasks={visible} onOpen={(task) => setModal(task)} />
          ) : (
            <DailyView
              key="dv"
              t={t}
              tasks={visible}
              weekOffset={weekOffset}
              onMove={moveTask}
              onOpen={(task) => setModal(task)}
            />
          )}
        </main>
      </div>
      {modal !== null && (
        <TaskModal
          t={t}
          task={modal.id ? modal : null}
          projects={projects}
          tasks={tasks}
          onClose={() => setModal(null)}
          onSave={saveTask}
          onDelete={removeTask}
          reload={load}
        />
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-ink text-white text-sm px-4 py-2 rounded-xl shadow-card spring-view">
          {toast}
        </div>
      )}
    </div>
  );
}
