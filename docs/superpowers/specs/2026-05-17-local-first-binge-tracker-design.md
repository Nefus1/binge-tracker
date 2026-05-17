# Local-First Binge Tracker Product Design

## Summary

Binge Tracker will become a polished local-first browser app for tracking shows, episodes, watch sessions, and household viewing stats. It will keep the editorial dashboard feel of the prototype while replacing mock-only data with real user-managed data persisted in `localStorage`.

The first finished product will not require accounts, hosting, a backend, or third-party media integrations. It will run from the local project, seed itself with sample data on first launch, and support import/export so the user's data is portable.

## Goals

- Let a household track what they are watching, who watched it, and when.
- Generate the existing dashboard stats from real sessions rather than static constants.
- Provide working navigation for Dashboard, Library, Sessions, and Settings.
- Support add, edit, delete, reset, import, and export flows.
- Work cleanly on desktop and mobile screen sizes.
- Remove prototype-only controls and copy that make the app feel like a mockup.

## Non-Goals

- No user accounts, authentication, or cloud sync in this phase.
- No server database or hosted API.
- No automatic imports from Plex, Netflix, Max, Apple TV+, or similar services.
- No recommendation engine.
- No native mobile app packaging.

## Product Shape

The app will be a single-page local application with four primary views.

### Dashboard

The Dashboard summarizes recent watching behavior from persisted data. It includes:

- Current week total hours.
- Breakdown by Maya solo, Theo solo, and together.
- Weekly stacked hours chart.
- Co-watch ratio.
- Currently watching list.
- Genre mix.
- Recent sessions table.
- All-time most watched shows.

The current prototype's cinematic visual identity can stay, but the layout needs responsive behavior, real empty states, and controls that perform real actions.

### Library

The Library manages shows and progress. Users can:

- Add a show with title, optional year, season, total episodes, runtime, genre, and watch mode.
- Edit show metadata.
- Mark the next episode watched.
- Set exact progress.
- Archive or delete a show.
- See active, completed, and archived shows.

### Sessions

The Sessions view is the audit log. Users can:

- Log a watch session for a show.
- Choose who watched: Maya, Theo, or together.
- Set date/time, episode count, runtime minutes, and optional note.
- Edit or delete an existing session.
- Filter by viewer, show, or date range.
- Export visible sessions to CSV.

### Settings

Settings owns local app management:

- Household names and colors.
- Import JSON data.
- Export JSON backup.
- Reset to sample data.
- Clear all data.
- Theme density preference.

Dangerous actions must require confirmation.

## Data Model

Data will be stored under a versioned `localStorage` key, for example `binge-tracker:v1`.

```json
{
  "version": 1,
  "settings": {
    "householdName": "Maya & Theo",
    "people": [
      { "id": "maya", "name": "Maya", "short": "M", "color": "#e8623c" },
      { "id": "theo", "name": "Theo", "short": "T", "color": "#4ec9b0" }
    ],
    "togetherColor": "#f0c24a",
    "density": "cozy"
  },
  "shows": [
    {
      "id": "severance",
      "title": "Severance",
      "year": 2022,
      "genre": "Sci-Fi",
      "status": "watching",
      "season": 2,
      "totalEpisodes": 10,
      "currentEpisode": 7,
      "runtime": 58,
      "watchMode": "together",
      "rating": 9.2,
      "note": "Optional note"
    }
  ],
  "sessions": [
    {
      "id": "session-1",
      "showId": "severance",
      "watchedAt": "2026-05-16T23:12:00.000Z",
      "viewer": "together",
      "season": 2,
      "episodeStart": 6,
      "episodeCount": 2,
      "runtimeMinutes": 105,
      "note": "Optional note"
    }
  ]
}
```

Derived metrics should be computed from `shows`, `sessions`, and `settings`, not hand-maintained.

## Architecture

The app should move away from scattered global constants while staying lightweight.

- `index.html`: app shell and bundled script entry.
- `src/data/sampleData.js`: seed data.
- `src/storage.js`: load, save, migrate, import, export, and validation helpers.
- `src/metrics.js`: dashboard calculations.
- `src/App.jsx`: view routing and top-level state.
- `src/components/`: shared UI and view components.
- `src/styles.css`: responsive product styling.

If a build tool is introduced, Vite is the preferred default because it gives React JSX, development server, production builds, and tests without overengineering the app.

## User Experience Requirements

- First launch loads sample data so the app never starts blank.
- Users can replace sample data by adding real shows and sessions.
- Empty states explain what action to take next, using concise product copy.
- Forms validate required fields before saving.
- Save actions should be immediate and visible.
- Import failures should preserve existing data.
- Export should download valid JSON.
- Layout should fit at common mobile, tablet, and desktop widths without horizontal scrolling.

## Error Handling

- If stored data is missing or malformed, the app should keep a backup copy and offer to reset to sample data.
- Import should validate schema version and required arrays before replacing current data.
- Delete, reset, and clear-all actions should use confirmation dialogs or explicit confirmation UI.
- Unknown show IDs in sessions should render as "Unknown show" instead of crashing.

## Testing and Verification

The implementation should include focused tests for:

- Storage load/save/import/export behavior.
- Migration or fallback behavior for malformed data.
- Metrics calculations for weekly hours, co-watch ratio, progress, and leaderboard.
- Basic render smoke test for the app.

Manual verification should cover:

- Add/edit/delete a show.
- Log/edit/delete a session.
- Export and re-import data.
- Reset to sample data.
- Desktop and mobile layout.

## Migration From Prototype

The current files are a static React/Babel prototype:

- `Binge Tracker.html`
- `app.jsx`
- `data.jsx`
- `parts.jsx`
- `tweaks-panel.jsx`

The production pass should preserve useful visual ideas from these files, but it should remove the prototype tweak panel and replace hardcoded data with application state and persistence.

## Acceptance Criteria

- The app can be installed and run with documented commands.
- The dashboard reflects user-edited local data.
- Library, Sessions, and Settings are functional, not placeholder navigation.
- Data persists across reloads.
- Exported JSON can be imported back into a fresh app state.
- Tests pass.
- The UI is responsive and visually coherent enough to use as a finished local product.
