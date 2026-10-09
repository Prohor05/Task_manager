# Task_manager
# Aurora Tasks

Advanced Task Manager and Project Roadmap desktop app.

**Stack:** Electron.js + React + Vite + Tailwind CSS + SQLite (`better-sqlite3`).

## Features

- Tasks with deadlines (date + time), status, priority, categories
- Local file attachments (stores path; opens in the system default app)
- System notifications (1 hour / 1 day / 48 hours before deadline)
- Daily Kanban (columns = weekdays) with drag-and-drop
- Roadmap / Gantt view with phase bars and dependencies
- EN / RU localization
- Flat Design 2.0: light grey canvas, white cards, pastel category bars
- Sidebar + top bar (search, filters, dates, language, invite)

## Develop

```bash
npm install
npm run dev
```

The UI also runs in a browser (`npm run build` then `npx vite --host`) with a localStorage fallback when Electron APIs are missing.

## Package Windows .exe

On Windows (or CI with Windows):

```bat
scripts\build-windows.bat
```

or:

```bash
npm run dist
```

Output: `dist-electron/Aurora Tasks Setup 1.0.0.exe` (NSIS installer).

Native module `better-sqlite3` is rebuilt for Electron automatically by electron-builder.
