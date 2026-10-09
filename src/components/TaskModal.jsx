import React, { useState } from 'react';
import { api } from '../api';

function toLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TaskModal({ t, task, projects, tasks, onClose, onSave, onDelete, reload }) {
  const [form, setForm] = useState(() => ({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    category: task?.category || 'Development',
    project_id: task?.project_id || projects[0]?.id || '',
    deadline: toLocal(task?.deadline),
    start_date: toLocal(task?.start_date),
    end_date: toLocal(task?.end_date),
    reminder_hours: task?.reminder_hours ?? 24,
    depends_on: task?.depends_on || '',
    day: task?.day || ''
  }));
  const attachments = task?.attachments || [];

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function payload() {
    const iso = (v) => (v ? new Date(v).toISOString() : null);
    const deadline = iso(form.deadline);
    let day = form.day;
    if (deadline) {
      day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(deadline).getDay()];
    }
    return {
      ...form,
      deadline,
      start_date: iso(form.start_date) || deadline,
      end_date: iso(form.end_date) || deadline,
      depends_on: form.depends_on || null,
      day
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
      <div className="modal-in bg-white w-full max-w-lg rounded-2xl shadow-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="text-base font-semibold mb-4">{task ? t('editTask') : t('newTask')}</div>
        <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
          <Field label={t('title')}>
            <input className="inp" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label={t('description')}>
            <textarea className="inp h-20" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('status')}>
              <select className="inp" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="todo">{t('todo')}</option>
                <option value="doing">{t('doing')}</option>
                <option value="done">{t('done')}</option>
              </select>
            </Field>
            <Field label={t('priority')}>
              <select className="inp" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
              </select>
            </Field>
            <Field label={t('category')}>
              <select className="inp" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {['Development', 'Testing', 'Content', 'Design', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label={t('projects')}>
              <select className="inp" value={form.project_id} onChange={(e) => set('project_id', e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('startDate')}>
              <input type="datetime-local" className="inp" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
            </Field>
            <Field label={t('endDate')}>
              <input type="datetime-local" className="inp" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} />
            </Field>
            <Field label={t('deadline')}>
              <input type="datetime-local" className="inp" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </Field>
            <Field label={t('reminder')}>
              <select className="inp" value={form.reminder_hours} onChange={(e) => set('reminder_hours', Number(e.target.value))}>
                <option value={1}>{t('oneHour')}</option>
                <option value={24}>{t('oneDay')}</option>
                <option value={48}>48 {t('hoursBefore')}</option>
              </select>
            </Field>
          </div>
          <Field label={t('dependsOn')}>
            <select className="inp" value={form.depends_on} onChange={(e) => set('depends_on', e.target.value)}>
              <option value="">{t('none')}</option>
              {tasks
                .filter((x) => x.id !== task?.id)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
            </select>
          </Field>
          {task?.id && (
            <div>
              <div className="text-xs text-muted mb-1">{t('attachments')}</div>
              <div className="space-y-1">
                {attachments.map((a) => (
                  <button
                    key={a.id}
                    className="text-sm text-accent hover:underline block"
                    onClick={() => api.attachments.open(a.file_path)}
                  >
                    {a.file_name}
                  </button>
                ))}
              </div>
              <button
                className="mt-2 text-sm btn-glow px-3 py-1.5 rounded-xl bg-canvas"
                onClick={async () => {
                  await api.attachments.add(task.id);
                  reload();
                }}
              >
                {t('attachFile')}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-5">
          {task?.id && (
            <button className="text-sm text-red-500" onClick={() => onDelete(task.id)}>
              {t('delete')}
            </button>
          )}
          <button className="ml-auto text-sm px-3 py-2 rounded-xl" onClick={onClose}>
            {t('cancel')}
          </button>
          <button
            className="btn-glow text-sm px-4 py-2 rounded-xl bg-accent text-white"
            onClick={() => onSave(payload(), task?.id)}
            disabled={!form.title.trim()}
          >
            {t('save')}
          </button>
        </div>
      </div>
      <style>{`.inp{width:100%;font-size:13px;padding:8px 10px;border-radius:12px;background:#F3F4F6;outline:none}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs text-muted mb-1">{label}</div>
      {children}
    </label>
  );
}
