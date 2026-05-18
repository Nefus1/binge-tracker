# Binge Tracker

Binge Tracker is a local-first household watch ledger for tracking shows, episodes, watch sessions, and shared viewing habits.

The production app is a Vite React single-page app. It stores data in the browser with `localStorage`, starts with sample data, and supports JSON import/export for backups.

## Features

- Dashboard metrics generated from real local sessions
- Library management for active, completed, and archived shows
- Session logging by viewer: Tav, Dee, or Together
- CSV export for the filtered session log
- Tautulli watch-history import with Tav/Dee/Together user mapping
- TMDB enrichment for posters, genres, ratings, runtime, overview, and IDs
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

## Tautulli Import

Open **Settings -> Tautulli import** and enter:

- Tautulli URL, for example `http://192.168.1.20:8181`
- Tautulli API key
- Row count to import
- Tautulli/Plex usernames mapped to Tav, Dee, or Together

The importer reads Tautulli `get_history`, creates missing shows, logs sessions, and dedupes repeat imports by Tautulli history row. If the browser blocks a direct request because of CORS or network rules, open the generated Tautulli API URL separately and paste the JSON response into the fallback JSON field.

## TMDB Enrichment

Open **Settings -> TMDB enrichment** and enter a TMDB v3 API key or Read Access Token. The app searches each local Library item by title and year, detects TV vs movie records, then adds TMDB metadata and poster URLs. TMDB enrichment does not create sessions; use Tautulli import for watch history.

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
