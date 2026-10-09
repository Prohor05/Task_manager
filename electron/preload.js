const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aurora', {
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    create: (name, color) => ipcRenderer.invoke('projects:create', { name, color }),
    delete: (id) => ipcRenderer.invoke('projects:delete', id)
  },
  tasks: {
    list: (projectId) => ipcRenderer.invoke('tasks:list', projectId),
    get: (id) => ipcRenderer.invoke('tasks:get', id),
    create: (data) => ipcRenderer.invoke('tasks:create', data),
    update: (id, data) => ipcRenderer.invoke('tasks:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id)
  },
  attachments: {
    add: (taskId) => ipcRenderer.invoke('attachments:add', taskId),
    remove: (id) => ipcRenderer.invoke('attachments:remove', id),
    open: (filePath) => ipcRenderer.invoke('attachments:open', filePath)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key, value) => ipcRenderer.invoke('settings:set', { key, value })
  },
  notify: (body) => ipcRenderer.invoke('notify:test', body)
});
