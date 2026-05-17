# Binge Tracker

Binge Tracker is a household watch ledger for tracking shows, episodes, watch sessions, and shared viewing habits.

The project is currently a static React prototype and is being converted into a polished local-first product. The target product will save data in the browser with `localStorage`, support real show/session management, and provide JSON import/export for backups.

## Current Prototype

Open `Binge Tracker.html` in a browser to view the current static dashboard prototype.

Current prototype files:

- `Binge Tracker.html` - browser shell with React/Babel CDN scripts
- `app.jsx` - top-level prototype app
- `data.jsx` - static sample data
- `parts.jsx` - dashboard UI components
- `tweaks-panel.jsx` - prototype tweak controls

## Product Direction

The finalized local-first version will include:

- Dashboard metrics generated from real local data
- Library management for active, completed, and archived shows
- Session logging by viewer: Maya, Theo, or Together
- JSON import/export for backups
- Settings for household names, colors, reset, and clear data
- Responsive desktop and mobile layouts

Out of scope for the first finished version:

- Accounts or authentication
- Cloud sync
- Server database
- Automatic imports from streaming services

## Planning Docs

- Design spec: `docs/superpowers/specs/2026-05-17-local-first-binge-tracker-design.md`
- Implementation plan: `docs/superpowers/plans/2026-05-17-local-first-binge-tracker.md`

## Future App Commands

After the Vite React rebuild is implemented:

```bash
npm install
npm run dev
npm test
npm run build
```

## Data Safety

The planned product stores data locally in the browser. Browser storage can be cleared by the user, browser settings, or system cleanup tools, so the app will include JSON export/import for backups.
