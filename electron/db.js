const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuid } = require('uuid');

let db;

function dbPath() {
  const dir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'aurora.sqlite');
}

function init() {
  db = new Database(dbPath());
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#A5B4FC',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      category TEXT DEFAULT 'Development',
      day TEXT,
      start_date TEXT,
      end_date TEXT,
      deadline TEXT,
      duration_hours INTEGER DEFAULT 8,
      depends_on TEXT,
      reminder_hours INTEGER DEFAULT 24,
      notified INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM projects').get().c;
  if (count === 0) seed();
  return db;
}

function seed() {
  const p1 = uuid();
  const p2 = uuid();
  const insP = db.prepare('INSERT INTO projects (id, name, color) VALUES (?, ?, ?)');
  insP.run(p1, 'Website Launch', '#A5B4FC');
  insP.run(p2, 'Mobile App', '#FBCFE8');

  const today = new Date();
  const iso = (d) => d.toISOString();
  const addDays = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };
  const dayName = (d) => ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][d.getDay()];

  const tasks = [
    ['Design system', 'Tokens and components', 'doing', 'high', 'Design', 0, 3, p1],
    ['Landing page', 'Hero and pricing', 'todo', 'high', 'Development', 1, 4, p1],
    ['API integration', 'Auth and tasks API', 'todo', 'medium', 'Development', 2, 6, p1],
    ['QA checklist', 'Regression suite', 'todo', 'medium', 'Testing', 5, 7, p1],
    ['Help articles', 'Onboarding docs', 'todo', 'low', 'Content', 3, 8, p1],
    ['Prototype', 'Clickable Figma', 'done', 'medium', 'Design', -1, 1, p2]
  ];
  const insT = db.prepare(`INSERT INTO tasks
    (id, project_id, title, description, status, priority, category, day, start_date, end_date, deadline, duration_hours, reminder_hours, position)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 24, ?)`);
  tasks.forEach((t, i) => {
    const start = addDays(t[5]);
    const end = addDays(t[6]);
    insT.run(uuid(), t[7], t[0], t[1], t[2], t[3], t[4], dayName(start), iso(start), iso(end), iso(end), (t[6]-t[5]+1)*8, i);
  });

  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('language', 'en');
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('reminderDefault', '24');
}

function allProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at').all();
}
function createProject(name, color = '#A5B4FC') {
  const id = uuid();
  db.prepare('INSERT INTO projects (id, name, color) VALUES (?, ?, ?)').run(id, name, color);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
}
function deleteProject(id) {
  db.prepare('DELETE FROM tasks WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}

function allTasks(projectId) {
  const rows = projectId
    ? db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY position, created_at').all(projectId)
    : db.prepare('SELECT * FROM tasks ORDER BY position, created_at').all();
  const att = db.prepare('SELECT * FROM attachments WHERE task_id = ?');
  return rows.map((t) => ({ ...t, attachments: att.all(t.id) }));
}

function getTask(id) {
  const t = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!t) return null;
  t.attachments = db.prepare('SELECT * FROM attachments WHERE task_id = ?').all(id);
  return t;
}

function createTask(data) {
  const id = uuid();
  db.prepare(`INSERT INTO tasks (id, project_id, title, description, status, priority, category, day, start_date, end_date, deadline, duration_hours, depends_on, reminder_hours, position)
    VALUES (@id, @project_id, @title, @description, @status, @priority, @category, @day, @start_date, @end_date, @deadline, @duration_hours, @depends_on, @reminder_hours, @position)`).run({
    id,
    project_id: data.project_id || null,
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    category: data.category || 'Development',
    day: data.day || null,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    deadline: data.deadline || null,
    duration_hours: data.duration_hours || 8,
    depends_on: data.depends_on || null,
    reminder_hours: data.reminder_hours ?? 24,
    position: data.position || 0
  });
  return getTask(id);
}

function updateTask(id, data) {
  const current = getTask(id);
  if (!current) return null;
  const merged = { ...current, ...data, id };
  db.prepare(`UPDATE tasks SET
    project_id=@project_id, title=@title, description=@description, status=@status, priority=@priority,
    category=@category, day=@day, start_date=@start_date, end_date=@end_date, deadline=@deadline,
    duration_hours=@duration_hours, depends_on=@depends_on, reminder_hours=@reminder_hours,
    position=@position, notified=@notified
    WHERE id=@id`).run({
    ...merged,
    notified: merged.notified ?? 0
  });
  return getTask(id);
}

function deleteTask(id) {
  db.prepare('DELETE FROM attachments WHERE task_id = ?').run(id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}

function addAttachment(taskId, filePath) {
  const id = uuid();
  const fileName = path.basename(filePath);
  db.prepare('INSERT INTO attachments (id, task_id, file_path, file_name) VALUES (?, ?, ?, ?)').run(id, taskId, filePath, fileName);
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
}
function removeAttachment(id) {
  db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
}

function getSettings() {
  const rows = db.prepare('SELECT * FROM settings').all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, String(value));
}

function dueReminders() {
  const now = Date.now();
  const tasks = db.prepare("SELECT * FROM tasks WHERE deadline IS NOT NULL AND notified = 0 AND status != 'done'").all();
  return tasks.filter((t) => {
    const dl = new Date(t.deadline).getTime();
    const lead = (t.reminder_hours || 24) * 3600 * 1000;
    return dl - lead <= now && now < dl;
  });
}

function markNotified(id) {
  db.prepare('UPDATE tasks SET notified = 1 WHERE id = ?').run(id);
}

module.exports = {
  init, allProjects, createProject, deleteProject, allTasks, getTask,
  createTask, updateTask, deleteTask, addAttachment, removeAttachment,
  getSettings, setSetting, dueReminders, markNotified
};
