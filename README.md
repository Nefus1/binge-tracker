# Binge Tracker

Binge Tracker is a local-first household watch ledger for tracking shows, episodes, watch sessions, and shared viewing habits.

The production app is a Vite React single-page app. It stores data in the browser with `localStorage`, starts with sample data, and supports JSON import/export for backups.

## Features

- Dashboard metrics generated from real local sessions
- Library management for active, completed, and archived shows
- Session logging by viewer: Tav, Dee, or Together
- CSV export for the filtered session log
- JSON import/export, reset-to-sample, and clear-data controls
- Household names, colors, and density settings
- Responsive desktop and mobile layouts

## Commands

```bash
npm install
npm run dev
npm test
npm run build
```

The dev server runs at `http://127.0.0.1:5173/` by default.

## Data Safety

Data is stored locally in the current browser. Browser storage can be cleared by the user, browser settings, or system cleanup tools, so use **Settings -> Export JSON** for backups.

## Legacy Prototype

The original static prototype is still kept for reference:

- `Binge Tracker.html`
- `app.jsx`
- `data.jsx`
- `parts.jsx`
- `tweaks-panel.jsx`

Use the Vite app for the finished product.

## Planning Docs

- Design spec: `docs/superpowers/specs/2026-05-17-local-first-binge-tracker-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-17-local-first-binge-tracker.md`
