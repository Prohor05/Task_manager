const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const db = require('./db');

const isDev = !app.isPackaged;
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#F3F4F6',
    title: 'Aurora Tasks',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  db.init();
  createWindow();
  setInterval(checkReminders, 30_000);
  checkReminders();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function checkReminders() {
  const due = db.dueReminders();
  due.forEach((t) => {
    if (Notification.isSupported()) {
      new Notification({
        title: 'Aurora Tasks',
        body: `${t.title} — deadline soon`
      }).show();
    }
    db.markNotified(t.id);
  });
}

ipcMain.handle('projects:list', () => db.allProjects());
ipcMain.handle('projects:create', (_e, { name, color }) => db.createProject(name, color));
ipcMain.handle('projects:delete', (_e, id) => db.deleteProject(id));
ipcMain.handle('tasks:list', (_e, projectId) => db.allTasks(projectId));
ipcMain.handle('tasks:get', (_e, id) => db.getTask(id));
ipcMain.handle('tasks:create', (_e, data) => db.createTask(data));
ipcMain.handle('tasks:update', (_e, { id, data }) => db.updateTask(id, data));
ipcMain.handle('tasks:delete', (_e, id) => db.deleteTask(id));
ipcMain.handle('attachments:add', async (_e, taskId) => {
  const res = await dialog.showOpenDialog(win, { properties: ['openFile', 'multiSelections'] });
  if (res.canceled) return [];
  return res.filePaths.map((p) => db.addAttachment(taskId, p));
});
ipcMain.handle('attachments:remove', (_e, id) => db.removeAttachment(id));
ipcMain.handle('attachments:open', (_e, filePath) => shell.openPath(filePath));
ipcMain.handle('settings:get', () => db.getSettings());
ipcMain.handle('settings:set', (_e, { key, value }) => db.setSetting(key, value));
ipcMain.handle('notify:test', (_e, body) => {
  if (Notification.isSupported()) new Notification({ title: 'Aurora Tasks', body }).show();
});
