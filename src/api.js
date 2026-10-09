const native = typeof window !== 'undefined' && window.aurora;

const LS = {
  k: 'aurora-store-v1',
  load() {
    try {
      const raw = localStorage.getItem(this.k);
      if (raw) return JSON.parse(raw);
    } catch {}
    const seed = seedStore();
    this.save(seed);
    return seed;
  },
  save(s) {
    localStorage.setItem(this.k, JSON.stringify(s));
  }
};

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function seedStore() {
  const today = new Date();
  const add = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  };
  const dayName = (iso) =>
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(iso).getDay()];
  const p1 = uid();
  const p2 = uid();
  const mk = (title, desc, status, priority, category, s, e, pid, i) => ({
    id: uid(),
    project_id: pid,
    title,
    description: desc,
    status,
    priority,
    category,
    day: dayName(add(s)),
    start_date: add(s),
    end_date: add(e),
    deadline: add(e),
    duration_hours: (e - s + 1) * 8,
    depends_on: null,
    reminder_hours: 24,
    notified: 0,
    position: i,
    attachments: []
  });
  return {
    projects: [
      { id: p1, name: 'Website Launch', color: '#A5B4FC' },
      { id: p2, name: 'Mobile App', color: '#FBCFE8' }
    ],
    tasks: [
      mk('Design system', 'Tokens and components', 'doing', 'high', 'Design', 0, 3, p1, 0),
      mk('Landing page', 'Hero and pricing', 'todo', 'high', 'Development', 1, 4, p1, 1),
      mk('API integration', 'Auth and tasks API', 'todo', 'medium', 'Development', 2, 6, p1, 2),
      mk('QA checklist', 'Regression suite', 'todo', 'medium', 'Testing', 5, 7, p1, 3),
      mk('Help articles', 'Onboarding docs', 'todo', 'low', 'Content', 3, 8, p1, 4),
      mk('Prototype', 'Clickable Figma', 'done', 'medium', 'Design', -1, 1, p2, 5)
    ],
    settings: { language: 'en', reminderDefault: '24' }
  };
}

const web = {
  projects: {
    async list() {
      return LS.load().projects;
    },
    async create(name, color) {
      const s = LS.load();
      const p = { id: uid(), name, color: color || '#A5B4FC' };
      s.projects.push(p);
      LS.save(s);
      return p;
    },
    async delete(id) {
      const s = LS.load();
      s.projects = s.projects.filter((p) => p.id !== id);
      s.tasks = s.tasks.filter((t) => t.project_id !== id);
      LS.save(s);
    }
  },
  tasks: {
    async list(projectId) {
      const s = LS.load();
      return s.tasks.filter((t) => !projectId || t.project_id === projectId);
    },
    async get(id) {
      return LS.load().tasks.find((t) => t.id === id);
    },
    async create(data) {
      const s = LS.load();
      const t = {
        id: uid(),
        attachments: [],
        status: 'todo',
        priority: 'medium',
        category: 'Development',
        reminder_hours: 24,
        notified: 0,
        position: 0,
        ...data
      };
      s.tasks.push(t);
      LS.save(s);
      return t;
    },
    async update(id, data) {
      const s = LS.load();
      s.tasks = s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t));
      LS.save(s);
      return s.tasks.find((t) => t.id === id);
    },
    async delete(id) {
      const s = LS.load();
      s.tasks = s.tasks.filter((t) => t.id !== id);
      LS.save(s);
    }
  },
  attachments: {
    async add(taskId) {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      return new Promise((resolve) => {
        input.onchange = () => {
          const s = LS.load();
          const added = [...input.files].map((f) => ({
            id: uid(),
            task_id: taskId,
            file_path: f.name,
            file_name: f.name
          }));
          s.tasks = s.tasks.map((t) =>
            t.id === taskId ? { ...t, attachments: [...(t.attachments || []), ...added] } : t
          );
          LS.save(s);
          resolve(added);
        };
        input.click();
      });
    },
    async remove(id) {
      const s = LS.load();
      s.tasks = s.tasks.map((t) => ({
        ...t,
        attachments: (t.attachments || []).filter((a) => a.id !== id)
      }));
      LS.save(s);
    },
    async open(filePath) {
      window.open(filePath, '_blank');
    }
  },
  settings: {
    async get() {
      return LS.load().settings;
    },
    async set(key, value) {
      const s = LS.load();
      s.settings[key] = String(value);
      LS.save(s);
    }
  },
  notify: async (body) => {
    if (Notification.permission === 'granted') new Notification('Aurora Tasks', { body });
    else if (Notification.permission !== 'denied') {
      const p = await Notification.requestPermission();
      if (p === 'granted') new Notification('Aurora Tasks', { body });
    }
  }
};

export const api = native || web;
export const isElectron = Boolean(native);
