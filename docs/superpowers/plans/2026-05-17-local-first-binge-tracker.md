# Local-First Binge Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static Binge Tracker prototype into a polished local-first React product with persisted shows, sessions, dashboard metrics, import/export, and responsive views.

**Architecture:** Replace the CDN/Babel prototype with a Vite React app. Keep data responsibilities separated: `sampleData` seeds the app, `storage` owns persistence/import/export, `metrics` owns derived stats, and React components own view state and user workflows.

**Tech Stack:** React 18, Vite, Vitest, Testing Library, localStorage, CSS modules via a single `src/styles.css` file.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: Vite app shell.
- Create `src/main.jsx`: React entrypoint.
- Create `src/App.jsx`: route state, top-level app state, CRUD handlers.
- Create `src/data/sampleData.js`: versioned seed data.
- Create `src/storage.js`: localStorage key, validation, load/save/import/export.
- Create `src/metrics.js`: dashboard calculations.
- Create `src/components/ui.jsx`: shared small presentational components.
- Create `src/components/Dashboard.jsx`: dashboard view.
- Create `src/components/Library.jsx`: show management view.
- Create `src/components/Sessions.jsx`: session log view.
- Create `src/components/Settings.jsx`: app settings and data management.
- Create `src/styles.css`: responsive product styling.
- Create `src/test/setup.js`: test environment setup.
- Create `src/storage.test.js`: storage tests.
- Create `src/metrics.test.js`: metrics tests.
- Create `src/App.test.jsx`: render smoke test.
- Modify `.gitignore`: keep `node_modules`, `dist`, `.superpowers`, coverage artifacts ignored.
- Leave legacy prototype files in place until the new app is verified; then remove or archive them in the final cleanup task.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles.css`
- Create: `src/test/setup.js`
- Modify: `.gitignore`

- [ ] **Step 1: Create npm project metadata**

Write `package.json`:

```json
{
  "name": "binge-tracker",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint ."
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^15.0.6",
    "@testing-library/user-event": "^14.5.2",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jsdom": "^24.0.0",
    "vitest": "^1.4.0"
  },
  "vitest": {
    "environment": "jsdom",
    "setupFiles": [
      "./src/test/setup.js"
    ]
  }
}
```

- [ ] **Step 2: Create the Vite HTML shell**

Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A local-first household binge watching tracker." />
    <title>Binge Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create the React entrypoint**

Write `src/main.jsx`:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 4: Create a temporary app shell**

Write `src/App.jsx`:

```jsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>Binge Tracker</h1>
      <p>Local-first app shell ready.</p>
    </main>
  );
}
```

- [ ] **Step 5: Create base CSS**

Write `src/styles.css`:

```css
:root {
  color-scheme: dark;
  --bg: #0d0f12;
  --surface: #161a1f;
  --surface-2: #20262d;
  --line: rgba(238, 242, 246, 0.12);
  --text: #f1f5f9;
  --muted: #94a3b8;
  --maya: #e8623c;
  --theo: #4ec9b0;
  --together: #f0c24a;
  --danger: #ef4444;
  --radius: 8px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

- [ ] **Step 6: Create test setup**

Write `src/test/setup.js`:

```js
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Update ignore rules**

Ensure `.gitignore` contains:

```gitignore
.superpowers/
node_modules/
dist/
coverage/
.env
```

- [ ] **Step 8: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and install completes without errors.

- [ ] **Step 9: Verify scaffold**

Run: `npm test`

Expected: Vitest exits successfully with "No test files found" or equivalent no-test success after `--passWithNoTests` is added if Vitest requires it. If Vitest fails on no tests, change the test script to `vitest run --passWithNoTests`.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json index.html src/main.jsx src/App.jsx src/styles.css src/test/setup.js .gitignore
git commit -m "chore: scaffold vite react app"
```

---

### Task 2: Seed Data and Storage

**Files:**
- Create: `src/data/sampleData.js`
- Create: `src/storage.js`
- Create: `src/storage.test.js`

- [ ] **Step 1: Write failing storage tests**

Write `src/storage.test.js`:

```js
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  STORAGE_KEY,
  createBackupFileName,
  exportData,
  importData,
  loadData,
  saveData,
  validateData,
} from "./storage.js";
import { sampleData } from "./data/sampleData.js";

beforeEach(() => {
  localStorage.clear();
  vi.setSystemTime(new Date("2026-05-17T12:00:00.000Z"));
});

describe("storage", () => {
  it("loads sample data when localStorage is empty", () => {
    const loaded = loadData();
    expect(loaded.data.version).toBe(1);
    expect(loaded.data.shows.length).toBeGreaterThan(0);
    expect(loaded.status).toBe("seeded");
  });

  it("saves and reloads data", () => {
    const next = { ...sampleData, shows: [{ ...sampleData.shows[0], title: "Edited" }] };
    saveData(next);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).shows[0].title).toBe("Edited");
    expect(loadData().data.shows[0].title).toBe("Edited");
  });

  it("rejects malformed imports without replacing existing data", () => {
    saveData(sampleData);
    const result = importData("{\"version\":1,\"shows\":[]}");
    expect(result.ok).toBe(false);
    expect(loadData().data.shows.length).toBe(sampleData.shows.length);
  });

  it("imports valid JSON", () => {
    const imported = {
      ...sampleData,
      shows: [{ ...sampleData.shows[0], id: "new-show", title: "New Show" }],
      sessions: [],
    };
    const result = importData(JSON.stringify(imported));
    expect(result.ok).toBe(true);
    expect(loadData().data.shows[0].title).toBe("New Show");
  });

  it("exports formatted JSON", () => {
    const json = exportData(sampleData);
    expect(JSON.parse(json).version).toBe(1);
    expect(json).toContain("\\n  ");
  });

  it("validates required top-level arrays", () => {
    expect(validateData(sampleData).ok).toBe(true);
    expect(validateData({ version: 1, settings: {}, shows: [], sessions: "bad" }).ok).toBe(false);
  });

  it("creates stable backup file names", () => {
    expect(createBackupFileName()).toBe("binge-tracker-backup-2026-05-17.json");
  });
});
```

- [ ] **Step 2: Run storage tests to verify failure**

Run: `npm test -- src/storage.test.js`

Expected: FAIL because `src/storage.js` and `src/data/sampleData.js` do not exist.

- [ ] **Step 3: Create seed data**

Write `src/data/sampleData.js`:

```js
export const sampleData = {
  version: 1,
  settings: {
    householdName: "Maya & Theo",
    people: [
      { id: "maya", name: "Maya", short: "M", color: "#e8623c" },
      { id: "theo", name: "Theo", short: "T", color: "#4ec9b0" },
    ],
    togetherColor: "#f0c24a",
    density: "cozy",
  },
  shows: [
    {
      id: "severance",
      title: "Severance",
      year: 2022,
      genre: "Sci-Fi",
      status: "watching",
      season: 2,
      totalEpisodes: 10,
      currentEpisode: 7,
      runtime: 58,
      watchMode: "together",
      rating: 9.2,
      note: "Lumon, eight months in.",
    },
    {
      id: "the-bear",
      title: "The Bear",
      year: 2022,
      genre: "Comedy",
      status: "watching",
      season: 3,
      totalEpisodes: 10,
      currentEpisode: 4,
      runtime: 33,
      watchMode: "together",
      rating: 8.4,
      note: "Cousin arc, still stressful.",
    },
    {
      id: "slow-horses",
      title: "Slow Horses",
      year: 2022,
      genre: "Thriller",
      status: "watching",
      season: 4,
      totalEpisodes: 6,
      currentEpisode: 2,
      runtime: 47,
      watchMode: "theo",
      rating: 8.5,
      note: "Theo solo queue.",
    },
    {
      id: "shogun",
      title: "Shogun",
      year: 2024,
      genre: "Drama",
      status: "completed",
      season: 1,
      totalEpisodes: 10,
      currentEpisode: 10,
      runtime: 58,
      watchMode: "together",
      rating: 9.4,
      note: "Finished and rated highly.",
    },
  ],
  sessions: [
    {
      id: "session-1",
      showId: "severance",
      watchedAt: "2026-05-16T23:12:00.000Z",
      viewer: "together",
      season: 2,
      episodeStart: 6,
      episodeCount: 2,
      runtimeMinutes: 105,
      note: "Late-night double episode.",
    },
    {
      id: "session-2",
      showId: "the-bear",
      watchedAt: "2026-05-15T21:45:00.000Z",
      viewer: "together",
      season: 3,
      episodeStart: 3,
      episodeCount: 2,
      runtimeMinutes: 64,
      note: "",
    },
    {
      id: "session-3",
      showId: "slow-horses",
      watchedAt: "2026-05-14T22:33:00.000Z",
      viewer: "theo",
      season: 4,
      episodeStart: 2,
      episodeCount: 1,
      runtimeMinutes: 47,
      note: "",
    },
    {
      id: "session-4",
      showId: "shogun",
      watchedAt: "2026-05-12T20:00:00.000Z",
      viewer: "together",
      season: 1,
      episodeStart: 10,
      episodeCount: 1,
      runtimeMinutes: 61,
      note: "Finale.",
    },
  ],
};
```

- [ ] **Step 4: Create storage helpers**

Write `src/storage.js`:

```js
import { sampleData } from "./data/sampleData.js";

export const STORAGE_KEY = "binge-tracker:v1";

export function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

export function validateData(data) {
  if (!data || typeof data !== "object") return { ok: false, error: "Data must be an object." };
  if (data.version !== 1) return { ok: false, error: "Unsupported data version." };
  if (!data.settings || typeof data.settings !== "object") return { ok: false, error: "Missing settings." };
  if (!Array.isArray(data.settings.people) || data.settings.people.length < 1) {
    return { ok: false, error: "At least one person is required." };
  }
  if (!Array.isArray(data.shows)) return { ok: false, error: "Shows must be an array." };
  if (!Array.isArray(data.sessions)) return { ok: false, error: "Sessions must be an array." };
  return { ok: true };
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = cloneData(sampleData);
    saveData(seeded);
    return { status: "seeded", data: seeded };
  }

  try {
    const parsed = JSON.parse(raw);
    const valid = validateData(parsed);
    if (!valid.ok) throw new Error(valid.error);
    return { status: "loaded", data: parsed };
  } catch (error) {
    localStorage.setItem(`${STORAGE_KEY}:malformed:${Date.now()}`, raw);
    const seeded = cloneData(sampleData);
    saveData(seeded);
    return { status: "recovered", data: seeded, error: error.message };
  }
}

export function saveData(data) {
  const valid = validateData(data);
  if (!valid.ok) throw new Error(valid.error);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function importData(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    const valid = validateData(parsed);
    if (!valid.ok) return { ok: false, error: valid.error };
    saveData(parsed);
    return { ok: true, data: parsed };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function exportData(data) {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export function createBackupFileName(date = new Date()) {
  return `binge-tracker-backup-${date.toISOString().slice(0, 10)}.json`;
}
```

- [ ] **Step 5: Run storage tests**

Run: `npm test -- src/storage.test.js`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/sampleData.js src/storage.js src/storage.test.js
git commit -m "feat: add local storage data layer"
```

---

### Task 3: Metrics

**Files:**
- Create: `src/metrics.js`
- Create: `src/metrics.test.js`

- [ ] **Step 1: Write failing metric tests**

Write `src/metrics.test.js`:

```js
import { describe, expect, it } from "vitest";
import {
  getCoWatchRatio,
  getGenreMix,
  getLeaderboard,
  getRecentSessions,
  getWeeklyHours,
  summarizeDashboard,
} from "./metrics.js";
import { sampleData } from "./data/sampleData.js";

describe("metrics", () => {
  it("calculates weekly hours by viewer bucket", () => {
    const week = getWeeklyHours(sampleData, new Date("2026-05-17T12:00:00.000Z"));
    expect(week.totalHours).toBeCloseTo(4.62, 2);
    expect(week.togetherHours).toBeCloseTo(3.83, 2);
    expect(week.theoHours).toBeCloseTo(0.78, 2);
    expect(week.mayaHours).toBe(0);
  });

  it("calculates co-watch ratio", () => {
    expect(getCoWatchRatio(sampleData)).toBeCloseTo(0.83, 2);
  });

  it("builds a leaderboard from sessions", () => {
    const top = getLeaderboard(sampleData)[0];
    expect(top.showId).toBe("severance");
    expect(top.hours).toBeCloseTo(1.75, 2);
  });

  it("builds genre mix by watched minutes", () => {
    const mix = getGenreMix(sampleData);
    expect(mix[0].genre).toBe("Sci-Fi");
    expect(mix.reduce((sum, item) => sum + item.minutes, 0)).toBe(277);
  });

  it("returns recent sessions with show titles", () => {
    const recent = getRecentSessions(sampleData, 2);
    expect(recent).toHaveLength(2);
    expect(recent[0].showTitle).toBe("Severance");
  });

  it("summarizes dashboard data", () => {
    const summary = summarizeDashboard(sampleData, new Date("2026-05-17T12:00:00.000Z"));
    expect(summary.week.totalHours).toBeGreaterThan(0);
    expect(summary.activeShows).toHaveLength(3);
    expect(summary.recentSessions[0].showTitle).toBe("Severance");
  });
});
```

- [ ] **Step 2: Run metric tests to verify failure**

Run: `npm test -- src/metrics.test.js`

Expected: FAIL because `src/metrics.js` does not exist.

- [ ] **Step 3: Create metrics implementation**

Write `src/metrics.js`:

```js
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function showMap(data) {
  return new Map(data.shows.map((show) => [show.id, show]));
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function getWeeklyHours(data, now = new Date()) {
  const start = startOfDay(new Date(now.getTime() - 6 * MS_PER_DAY));
  const buckets = { maya: 0, theo: 0, together: 0 };

  data.sessions.forEach((session) => {
    const watchedAt = new Date(session.watchedAt);
    if (watchedAt >= start && watchedAt <= now) {
      buckets[session.viewer] = (buckets[session.viewer] || 0) + session.runtimeMinutes / 60;
    }
  });

  const totalHours = buckets.maya + buckets.theo + buckets.together;
  return {
    mayaHours: buckets.maya,
    theoHours: buckets.theo,
    togetherHours: buckets.together,
    totalHours,
  };
}

export function getCoWatchRatio(data) {
  const total = data.sessions.reduce((sum, session) => sum + session.runtimeMinutes, 0);
  if (!total) return 0;
  const together = data.sessions
    .filter((session) => session.viewer === "together")
    .reduce((sum, session) => sum + session.runtimeMinutes, 0);
  return together / total;
}

export function getLeaderboard(data) {
  const shows = showMap(data);
  const byShow = new Map();

  data.sessions.forEach((session) => {
    const current = byShow.get(session.showId) || 0;
    byShow.set(session.showId, current + session.runtimeMinutes);
  });

  return [...byShow.entries()]
    .map(([showId, minutes]) => ({
      showId,
      title: shows.get(showId)?.title || "Unknown show",
      hours: minutes / 60,
      minutes,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

export function getGenreMix(data) {
  const shows = showMap(data);
  const byGenre = new Map();

  data.sessions.forEach((session) => {
    const genre = shows.get(session.showId)?.genre || "Unknown";
    byGenre.set(genre, (byGenre.get(genre) || 0) + session.runtimeMinutes);
  });

  return [...byGenre.entries()]
    .map(([genre, minutes]) => ({ genre, minutes }))
    .sort((a, b) => b.minutes - a.minutes);
}

export function getRecentSessions(data, limit = 8) {
  const shows = showMap(data);
  return [...data.sessions]
    .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
    .slice(0, limit)
    .map((session) => ({
      ...session,
      showTitle: shows.get(session.showId)?.title || "Unknown show",
    }));
}

export function summarizeDashboard(data, now = new Date()) {
  return {
    week: getWeeklyHours(data, now),
    coWatchRatio: getCoWatchRatio(data),
    leaderboard: getLeaderboard(data).slice(0, 6),
    genreMix: getGenreMix(data),
    recentSessions: getRecentSessions(data, 8),
    activeShows: data.shows.filter((show) => show.status === "watching"),
  };
}
```

- [ ] **Step 4: Run metric tests**

Run: `npm test -- src/metrics.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/metrics.js src/metrics.test.js
git commit -m "feat: add dashboard metrics"
```

---

### Task 4: App State and Navigation

**Files:**
- Modify: `src/App.jsx`
- Create: `src/components/ui.jsx`
- Create: `src/App.test.jsx`

- [ ] **Step 1: Write failing render smoke test**

Write `src/App.test.jsx`:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App.jsx";

beforeEach(() => {
  localStorage.clear();
});

describe("App", () => {
  it("renders the dashboard and navigates to library", async () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: /binge tracker/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /library/i }));
    expect(screen.getByRole("heading", { name: /library/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run smoke test to verify failure**

Run: `npm test -- src/App.test.jsx`

Expected: FAIL because Library navigation is not implemented.

- [ ] **Step 3: Create shared UI components**

Write `src/components/ui.jsx`:

```jsx
export function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function EmptyState({ title, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {action ? <p>{action}</p> : null}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function ViewerPill({ viewer }) {
  return <span className={`viewer-pill viewer-${viewer}`}>{viewer === "together" ? "Together" : viewer}</span>;
}
```

- [ ] **Step 4: Implement top-level app state and navigation**

Replace `src/App.jsx` with:

```jsx
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, ListVideo, Library, Settings } from "lucide-react";
import { loadData, saveData } from "./storage.js";
import { summarizeDashboard } from "./metrics.js";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "library", label: "Library", icon: Library },
  { id: "sessions", label: "Sessions", icon: ListVideo },
  { id: "settings", label: "Settings", icon: Settings },
];

function PlaceholderView({ title }) {
  return (
    <section className="view">
      <h2>{title}</h2>
      <p className="muted">This view will be implemented in the next task.</p>
    </section>
  );
}

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [loaded] = useState(() => loadData());
  const [data, setData] = useState(loaded.data);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.style.setProperty("--maya", data.settings.people[0]?.color || "#e8623c");
    document.documentElement.style.setProperty("--theo", data.settings.people[1]?.color || "#4ec9b0");
    document.documentElement.style.setProperty("--together", data.settings.togetherColor || "#f0c24a");
  }, [data.settings]);

  const summary = useMemo(() => summarizeDashboard(data), [data]);
  const current = navItems.find((item) => item.id === route);

  return (
    <div className="product-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">BT</span>
          <div>
            <h1>Binge Tracker</h1>
            <p>{data.settings.householdName}</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={route === item.id ? "nav-item active" : "nav-item"}
                type="button"
                onClick={() => setRoute(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="main-header">
          <div>
            <p className="eyebrow">Local-first ledger</p>
            <h2>{current?.label || "Dashboard"}</h2>
          </div>
          <p className="muted">{loaded.status === "recovered" ? "Recovered from malformed local data." : "Saved in this browser."}</p>
        </header>

        {route === "dashboard" && (
          <PlaceholderView title={`${summary.week.totalHours.toFixed(1)} hours this week`} />
        )}
        {route === "library" && <PlaceholderView title="Library" />}
        {route === "sessions" && <PlaceholderView title="Sessions" />}
        {route === "settings" && <PlaceholderView title="Settings" />}
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Run smoke test**

Run: `npm test -- src/App.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/components/ui.jsx src/App.test.jsx
git commit -m "feat: add app shell navigation"
```

---

### Task 5: Product Views and CRUD

**Files:**
- Modify: `src/App.jsx`
- Create: `src/components/Dashboard.jsx`
- Create: `src/components/Library.jsx`
- Create: `src/components/Sessions.jsx`
- Create: `src/components/Settings.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Extend smoke tests for core workflows**

Append to `src/App.test.jsx`:

```jsx
it("adds a show from the library", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /library/i }));
  await userEvent.type(screen.getByLabelText(/title/i), "Dark");
  await userEvent.type(screen.getByLabelText(/total episodes/i), "8");
  await userEvent.click(screen.getByRole("button", { name: /add show/i }));
  expect(screen.getByText("Dark")).toBeInTheDocument();
});

it("logs a watch session", async () => {
  render(<App />);
  await userEvent.click(screen.getByRole("button", { name: /sessions/i }));
  await userEvent.click(screen.getByRole("button", { name: /log session/i }));
  expect(screen.getAllByText(/severance/i).length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/App.test.jsx`

Expected: FAIL because forms are not implemented.

- [ ] **Step 3: Create Dashboard view**

Write `src/components/Dashboard.jsx` with cards for week hours, co-watch ratio, active shows, leaderboard, genre mix, and recent sessions. Use `summary` and `data` props. Render `Unknown show` for orphan sessions.

```jsx
import { Card, EmptyState, ViewerPill } from "./ui.jsx";

export function Dashboard({ data, summary }) {
  return (
    <section className="view dashboard-grid">
      <Card className="hero-card">
        <p className="eyebrow">This week</p>
        <div className="hero-number">{summary.week.totalHours.toFixed(1)}<span>h</span></div>
        <div className="metric-row">
          <span>Together {summary.week.togetherHours.toFixed(1)}h</span>
          <span>Maya {summary.week.mayaHours.toFixed(1)}h</span>
          <span>Theo {summary.week.theoHours.toFixed(1)}h</span>
        </div>
      </Card>

      <Card>
        <p className="eyebrow">Co-watch ratio</p>
        <div className="big-stat">{Math.round(summary.coWatchRatio * 100)}%</div>
        <p className="muted">Share of all watch time logged together.</p>
      </Card>

      <Card className="wide">
        <h3>Now watching</h3>
        {summary.activeShows.length ? (
          <div className="show-grid">
            {summary.activeShows.map((show) => (
              <article className="show-tile" key={show.id}>
                <h4>{show.title}</h4>
                <p>S{show.season} · E{show.currentEpisode}/{show.totalEpisodes}</p>
                <progress value={show.currentEpisode} max={show.totalEpisodes} />
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No active shows" action="Add a show in Library." />
        )}
      </Card>

      <Card>
        <h3>Leaderboard</h3>
        <div className="list">
          {summary.leaderboard.map((item) => (
            <div className="list-row" key={item.showId}>
              <span>{item.title}</span>
              <strong>{item.hours.toFixed(1)}h</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3>Genre mix</h3>
        <div className="list">
          {summary.genreMix.map((item) => (
            <div className="list-row" key={item.genre}>
              <span>{item.genre}</span>
              <strong>{Math.round(item.minutes / 60)}h</strong>
            </div>
          ))}
        </div>
      </Card>

      <Card className="wide">
        <h3>Recent sessions</h3>
        <div className="session-table">
          {summary.recentSessions.map((session) => (
            <div className="session-row" key={session.id}>
              <span>{new Date(session.watchedAt).toLocaleString()}</span>
              <strong>{session.showTitle}</strong>
              <span>S{session.season} · E{session.episodeStart}</span>
              <span>{session.runtimeMinutes}m</span>
              <ViewerPill viewer={session.viewer} />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
```

- [ ] **Step 4: Create Library view**

Write `src/components/Library.jsx`:

```jsx
import { useState } from "react";
import { Card, Field } from "./ui.jsx";

const initialForm = {
  title: "",
  year: "",
  genre: "Drama",
  season: 1,
  totalEpisodes: "",
  runtime: 45,
  watchMode: "together",
};

export function LibraryView({ data, onAddShow, onUpdateShow, onDeleteShow }) {
  const [form, setForm] = useState(initialForm);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || Number(form.totalEpisodes) < 1) return;
    onAddShow({
      ...form,
      title: form.title.trim(),
      year: form.year ? Number(form.year) : "",
      season: Number(form.season),
      totalEpisodes: Number(form.totalEpisodes),
      currentEpisode: 0,
      runtime: Number(form.runtime),
      status: "watching",
      rating: "",
      note: "",
    });
    setForm(initialForm);
  }

  return (
    <section className="view two-column">
      <Card>
        <h3>Add show</h3>
        <form className="form-grid" onSubmit={submit}>
          <Field label="Title">
            <input value={form.title} onChange={(event) => update("title", event.target.value)} />
          </Field>
          <Field label="Year">
            <input value={form.year} onChange={(event) => update("year", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Genre">
            <input value={form.genre} onChange={(event) => update("genre", event.target.value)} />
          </Field>
          <Field label="Season">
            <input value={form.season} onChange={(event) => update("season", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Total episodes">
            <input value={form.totalEpisodes} onChange={(event) => update("totalEpisodes", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Runtime minutes">
            <input value={form.runtime} onChange={(event) => update("runtime", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Default mode">
            <select value={form.watchMode} onChange={(event) => update("watchMode", event.target.value)}>
              <option value="together">Together</option>
              <option value="maya">Maya</option>
              <option value="theo">Theo</option>
            </select>
          </Field>
          <button className="primary-button" type="submit">Add show</button>
        </form>
      </Card>

      <div className="stack">
        {data.shows.map((show) => (
          <Card key={show.id}>
            <div className="show-row">
              <div>
                <h3>{show.title}</h3>
                <p className="muted">S{show.season} · E{show.currentEpisode}/{show.totalEpisodes} · {show.genre}</p>
              </div>
              <div className="button-row">
                <button type="button" onClick={() => onUpdateShow(show.id, { currentEpisode: Math.min(show.totalEpisodes, show.currentEpisode + 1) })}>Next episode</button>
                <button type="button" onClick={() => onUpdateShow(show.id, { status: show.status === "archived" ? "watching" : "archived" })}>
                  {show.status === "archived" ? "Unarchive" : "Archive"}
                </button>
                <button className="danger-button" type="button" onClick={() => onDeleteShow(show.id)}>Delete</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create Sessions view**

Write `src/components/Sessions.jsx`:

```jsx
import { useState } from "react";
import { Card, Field, ViewerPill } from "./ui.jsx";

export function SessionsView({ data, onAddSession, onDeleteSession }) {
  const firstShow = data.shows[0]?.id || "";
  const [form, setForm] = useState({
    showId: firstShow,
    viewer: "together",
    watchedAt: new Date().toISOString().slice(0, 16),
    season: 1,
    episodeStart: 1,
    episodeCount: 1,
    runtimeMinutes: 45,
    note: "",
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!form.showId) return;
    onAddSession({
      ...form,
      watchedAt: new Date(form.watchedAt).toISOString(),
      season: Number(form.season),
      episodeStart: Number(form.episodeStart),
      episodeCount: Number(form.episodeCount),
      runtimeMinutes: Number(form.runtimeMinutes),
    });
  }

  const showById = new Map(data.shows.map((show) => [show.id, show]));
  const sessions = [...data.sessions].sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

  return (
    <section className="view two-column">
      <Card>
        <h3>Log session</h3>
        <form className="form-grid" onSubmit={submit}>
          <Field label="Show">
            <select value={form.showId} onChange={(event) => update("showId", event.target.value)}>
              {data.shows.map((show) => <option key={show.id} value={show.id}>{show.title}</option>)}
            </select>
          </Field>
          <Field label="Watched by">
            <select value={form.viewer} onChange={(event) => update("viewer", event.target.value)}>
              <option value="together">Together</option>
              <option value="maya">Maya</option>
              <option value="theo">Theo</option>
            </select>
          </Field>
          <Field label="Watched at">
            <input type="datetime-local" value={form.watchedAt} onChange={(event) => update("watchedAt", event.target.value)} />
          </Field>
          <Field label="Season">
            <input value={form.season} onChange={(event) => update("season", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Episode start">
            <input value={form.episodeStart} onChange={(event) => update("episodeStart", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Episode count">
            <input value={form.episodeCount} onChange={(event) => update("episodeCount", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Runtime minutes">
            <input value={form.runtimeMinutes} onChange={(event) => update("runtimeMinutes", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Note">
            <textarea value={form.note} onChange={(event) => update("note", event.target.value)} />
          </Field>
          <button className="primary-button" type="submit">Log session</button>
        </form>
      </Card>

      <Card>
        <h3>Session log</h3>
        <div className="session-table">
          {sessions.map((session) => (
            <div className="session-row" key={session.id}>
              <span>{new Date(session.watchedAt).toLocaleString()}</span>
              <strong>{showById.get(session.showId)?.title || "Unknown show"}</strong>
              <span>{session.runtimeMinutes}m</span>
              <ViewerPill viewer={session.viewer} />
              <button className="danger-button" type="button" onClick={() => onDeleteSession(session.id)}>Delete</button>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
```

- [ ] **Step 6: Create Settings view**

Write `src/components/Settings.jsx`:

```jsx
import { useRef, useState } from "react";
import { Card, Field } from "./ui.jsx";
import { createBackupFileName, exportData, importData } from "../storage.js";
import { sampleData } from "../data/sampleData.js";

export function SettingsView({ data, onReplaceData, onUpdateSettings }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState("");

  function downloadJson() {
    const blob = new Blob([exportData(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = createBackupFileName();
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const result = importData(text);
    if (result.ok) {
      onReplaceData(result.data);
      setMessage("Imported backup.");
    } else {
      setMessage(result.error);
    }
    event.target.value = "";
  }

  return (
    <section className="view two-column">
      <Card>
        <h3>Household</h3>
        <div className="form-grid">
          <Field label="Household name">
            <input value={data.settings.householdName} onChange={(event) => onUpdateSettings({ householdName: event.target.value })} />
          </Field>
          <Field label="Density">
            <select value={data.settings.density} onChange={(event) => onUpdateSettings({ density: event.target.value })}>
              <option value="cozy">Cozy</option>
              <option value="compact">Compact</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <h3>Data</h3>
        <div className="button-row wrap">
          <button type="button" onClick={downloadJson}>Export JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <button type="button" onClick={() => onReplaceData(sampleData)}>Reset sample data</button>
          <button className="danger-button" type="button" onClick={() => window.confirm("Clear all data?") && onReplaceData({ ...sampleData, shows: [], sessions: [] })}>
            Clear all data
          </button>
        </div>
        <input ref={fileRef} className="sr-only" type="file" accept="application/json" onChange={importFile} />
        {message ? <p className="muted">{message}</p> : null}
      </Card>
    </section>
  );
}
```

- [ ] **Step 7: Wire views and handlers in App**

Modify `src/App.jsx` to import the four views and replace placeholders with handlers:

```jsx
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, ListVideo, Library, Settings } from "lucide-react";
import { loadData, saveData } from "./storage.js";
import { summarizeDashboard } from "./metrics.js";
import { Dashboard } from "./components/Dashboard.jsx";
import { LibraryView } from "./components/Library.jsx";
import { SessionsView } from "./components/Sessions.jsx";
import { SettingsView } from "./components/Settings.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "library", label: "Library", icon: Library },
  { id: "sessions", label: "Sessions", icon: ListVideo },
  { id: "settings", label: "Settings", icon: Settings },
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [loaded] = useState(() => loadData());
  const [data, setData] = useState(loaded.data);

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.style.setProperty("--maya", data.settings.people[0]?.color || "#e8623c");
    document.documentElement.style.setProperty("--theo", data.settings.people[1]?.color || "#4ec9b0");
    document.documentElement.style.setProperty("--together", data.settings.togetherColor || "#f0c24a");
  }, [data.settings]);

  const summary = useMemo(() => summarizeDashboard(data), [data]);
  const current = navItems.find((item) => item.id === route);

  function addShow(show) {
    setData((currentData) => ({
      ...currentData,
      shows: [...currentData.shows, { ...show, id: createId("show") }],
    }));
  }

  function updateShow(showId, edits) {
    setData((currentData) => ({
      ...currentData,
      shows: currentData.shows.map((show) => show.id === showId ? { ...show, ...edits } : show),
    }));
  }

  function deleteShow(showId) {
    if (!window.confirm("Delete this show and its sessions?")) return;
    setData((currentData) => ({
      ...currentData,
      shows: currentData.shows.filter((show) => show.id !== showId),
      sessions: currentData.sessions.filter((session) => session.showId !== showId),
    }));
  }

  function addSession(session) {
    setData((currentData) => ({
      ...currentData,
      sessions: [{ ...session, id: createId("session") }, ...currentData.sessions],
      shows: currentData.shows.map((show) => {
        if (show.id !== session.showId) return show;
        return {
          ...show,
          currentEpisode: Math.min(show.totalEpisodes, Math.max(show.currentEpisode, session.episodeStart + session.episodeCount - 1)),
        };
      }),
    }));
  }

  function deleteSession(sessionId) {
    setData((currentData) => ({
      ...currentData,
      sessions: currentData.sessions.filter((session) => session.id !== sessionId),
    }));
  }

  function updateSettings(settings) {
    setData((currentData) => ({
      ...currentData,
      settings: { ...currentData.settings, ...settings },
    }));
  }

  return (
    <div className="product-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">BT</span>
          <div>
            <h1>Binge Tracker</h1>
            <p>{data.settings.householdName}</p>
          </div>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={route === item.id ? "nav-item active" : "nav-item"}
                type="button"
                onClick={() => setRoute(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="main-header">
          <div>
            <p className="eyebrow">Local-first ledger</p>
            <h2>{current?.label || "Dashboard"}</h2>
          </div>
          <p className="muted">{loaded.status === "recovered" ? "Recovered from malformed local data." : "Saved in this browser."}</p>
        </header>

        {route === "dashboard" && <Dashboard data={data} summary={summary} />}
        {route === "library" && (
          <LibraryView data={data} onAddShow={addShow} onUpdateShow={updateShow} onDeleteShow={deleteShow} />
        )}
        {route === "sessions" && (
          <SessionsView data={data} onAddSession={addSession} onDeleteSession={deleteSession} />
        )}
        {route === "settings" && (
          <SettingsView data={data} onReplaceData={setData} onUpdateSettings={updateSettings} />
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 8: Run app tests**

Run: `npm test -- src/App.test.jsx`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/components/Dashboard.jsx src/components/Library.jsx src/components/Sessions.jsx src/components/Settings.jsx
git commit -m "feat: add product views and local CRUD"
```

---

### Task 6: Responsive Product Styling

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Replace base CSS with complete product styling**

Replace `src/styles.css` with responsive styles for `.product-shell`, `.sidebar`, `.main-panel`, `.card`, `.dashboard-grid`, `.two-column`, `.form-grid`, `.session-table`, `.button-row`, and mobile breakpoints.

```css
:root {
  color-scheme: dark;
  --bg: #0d0f12;
  --surface: #161a1f;
  --surface-2: #20262d;
  --line: rgba(238, 242, 246, 0.12);
  --text: #f1f5f9;
  --muted: #94a3b8;
  --maya: #e8623c;
  --theo: #4ec9b0;
  --together: #f0c24a;
  --danger: #ef4444;
  --radius: 8px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; background: var(--bg); color: var(--text); }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }

.product-shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
.sidebar { border-right: 1px solid var(--line); padding: 24px; background: #101317; }
.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.brand h1 { margin: 0; font-size: 20px; }
.brand p, .muted { color: var(--muted); margin: 0; }
.brand-mark { width: 42px; height: 42px; border-radius: var(--radius); display: grid; place-items: center; background: var(--together); color: #111; font-weight: 800; }
.nav-list { display: grid; gap: 8px; }
.nav-item { display: flex; align-items: center; gap: 10px; border: 1px solid transparent; background: transparent; color: var(--muted); padding: 10px 12px; border-radius: var(--radius); text-align: left; }
.nav-item.active, .nav-item:hover { background: var(--surface); color: var(--text); border-color: var(--line); }
.main-panel { min-width: 0; padding: 28px; }
.main-header { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 24px; }
.main-header h2 { margin: 0; font-size: clamp(28px, 4vw, 44px); }
.eyebrow { color: var(--muted); text-transform: uppercase; letter-spacing: .12em; font-size: 12px; margin: 0 0 6px; }
.view { display: grid; gap: 18px; }
.dashboard-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.two-column { grid-template-columns: minmax(300px, 420px) 1fr; align-items: start; }
.wide { grid-column: span 2; }
.hero-card { grid-column: span 3; }
.card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 20px; min-width: 0; }
.card h3 { margin: 0 0 14px; }
.hero-number { font-size: clamp(64px, 12vw, 128px); line-height: .9; font-weight: 800; letter-spacing: -0.05em; }
.hero-number span { font-size: .25em; color: var(--muted); margin-left: 6px; }
.big-stat { font-size: 56px; font-weight: 800; }
.metric-row, .button-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.metric-row span { border: 1px solid var(--line); border-radius: 999px; padding: 6px 10px; color: var(--muted); }
.show-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.show-tile, .empty-state { background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px; }
.show-tile h4 { margin: 0 0 6px; }
.show-tile p { margin: 0 0 12px; color: var(--muted); }
progress { width: 100%; accent-color: var(--together); }
.list, .stack { display: grid; gap: 10px; }
.list-row, .show-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.form-grid { display: grid; gap: 12px; }
.field { display: grid; gap: 6px; color: var(--muted); }
.field input, .field select, .field textarea { width: 100%; border: 1px solid var(--line); border-radius: var(--radius); background: #0f1318; color: var(--text); padding: 10px; }
.field textarea { min-height: 86px; resize: vertical; }
button, .primary-button { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface-2); color: var(--text); padding: 9px 12px; }
.primary-button { background: var(--together); color: #14110d; border-color: transparent; font-weight: 700; }
.danger-button { border-color: rgba(239, 68, 68, .35); color: #fecaca; }
.session-table { display: grid; gap: 8px; }
.session-row { display: grid; grid-template-columns: 1.2fr 1fr auto auto auto; gap: 12px; align-items: center; border-bottom: 1px solid var(--line); padding: 10px 0; }
.viewer-pill { border-radius: 999px; padding: 4px 8px; font-size: 12px; background: var(--surface-2); }
.viewer-maya { color: var(--maya); }
.viewer-theo { color: var(--theo); }
.viewer-together { color: var(--together); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }

@media (max-width: 980px) {
  .product-shell { grid-template-columns: 1fr; }
  .sidebar { position: sticky; top: 0; z-index: 10; border-right: 0; border-bottom: 1px solid var(--line); }
  .nav-list { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .nav-item { justify-content: center; }
  .dashboard-grid, .two-column { grid-template-columns: 1fr; }
  .wide, .hero-card { grid-column: auto; }
}

@media (max-width: 640px) {
  .main-panel, .sidebar { padding: 16px; }
  .main-header { display: grid; }
  .brand { margin-bottom: 16px; }
  .nav-item { font-size: 0; padding: 10px; }
  .nav-item svg { width: 20px; height: 20px; }
  .session-row { grid-template-columns: 1fr; gap: 4px; }
  .show-row { align-items: flex-start; flex-direction: column; }
}
```

- [ ] **Step 2: Run tests after styling**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/styles.css
git commit -m "style: polish responsive product UI"
```

---

### Task 7: Cleanup, Build, Browser Verification

**Files:**
- Modify: `README.md`
- Delete or archive: `Binge Tracker.html`, `app.jsx`, `data.jsx`, `parts.jsx`, `tweaks-panel.jsx`

- [ ] **Step 1: Create README**

Write `README.md`:

```md
# Binge Tracker

A local-first household binge watching tracker. Data is saved in this browser with `localStorage`; export JSON backups from Settings before clearing browser data.

## Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Product Scope

- Dashboard metrics from real local data.
- Library show tracking.
- Session logging.
- JSON import/export.
- No accounts or cloud sync in this version.
```

- [ ] **Step 2: Remove legacy prototype files**

Delete these files after the Vite app passes tests and build:

```text
Binge Tracker.html
app.jsx
data.jsx
parts.jsx
tweaks-panel.jsx
```

- [ ] **Step 3: Run full automated verification**

Run: `npm test`

Expected: PASS.

Run: `npm run build`

Expected: production build succeeds and writes `dist/`.

- [ ] **Step 4: Start local app for manual verification**

Run: `npm run dev -- --port 5173`

Expected: Vite serves at `http://127.0.0.1:5173/`.

- [ ] **Step 5: Verify in browser**

Use the browser to verify:

- Dashboard loads with sample data.
- Library can add a show.
- Sessions can log a session.
- Settings can export JSON.
- Mobile width does not horizontally scroll.

- [ ] **Step 6: Commit**

```bash
git add README.md "Binge Tracker.html" app.jsx data.jsx parts.jsx tweaks-panel.jsx
git commit -m "chore: remove prototype and document product"
```

---

## Self-Review

- Spec coverage: Dashboard, Library, Sessions, Settings, localStorage persistence, import/export, reset, clear-all, responsive behavior, tests, and prototype migration are all covered by tasks.
- No backend, auth, cloud sync, or third-party media import work is included.
- Type consistency: viewer values are `maya`, `theo`, and `together`; show status values are `watching`, `completed`, and `archived`; storage version is `1`.
- Known implementation risk: npm dependency installation requires network access. If sandboxed install fails with a registry or DNS error, rerun `npm install` with escalated permissions.
