import { useEffect, useMemo, useState } from "react";
import { BarChart3, Database, LibraryBig, ListPlus, Settings as SettingsIcon } from "lucide-react";
import { Dashboard } from "./components/Dashboard.jsx";
import { Library } from "./components/Library.jsx";
import { Sessions } from "./components/Sessions.jsx";
import { Settings } from "./components/Settings.jsx";
import { calculateDashboardMetrics } from "./metrics.js";
import { loadData, saveData } from "./storage.js";

const VIEWS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "library", label: "Library", icon: LibraryBig },
  { id: "sessions", label: "Sessions", icon: ListPlus },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [data, setData] = useState(() => loadData());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    saveData(data);
  }, [data]);

  const metrics = useMemo(() => calculateDashboardMetrics(data), [data]);

  function showNotice(message) {
    setNotice(message);
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(""), 2800);
  }

  function updateSettings(settings) {
    setData((current) => ({ ...current, settings }));
    showNotice("Settings saved.");
  }

  function addShow(input) {
    const title = input.title.trim();
    if (!title) return;
    const idBase = toSlug(title) || "show";
    const existing = new Set(data.shows.map((show) => show.id));
    let id = idBase;
    let index = 2;
    while (existing.has(id)) {
      id = `${idBase}-${index}`;
      index += 1;
    }
    const show = {
      id,
      title,
      year: Number(input.year) || new Date().getFullYear(),
      genre: input.genre.trim() || "Drama",
      status: "watching",
      season: Number(input.season) || 1,
      totalEpisodes: Number(input.totalEpisodes) || 8,
      currentEpisode: Number(input.currentEpisode) || 0,
      runtime: Number(input.runtime) || 45,
      watchMode: input.watchMode || "together",
      rating: Number(input.rating) || 0,
      note: input.note.trim(),
    };
    setData((current) => ({ ...current, shows: [show, ...current.shows] }));
    showNotice(`${title} added to the library.`);
  }

  function updateShow(showId, patch) {
    setData((current) => ({
      ...current,
      shows: current.shows.map((show) => (show.id === showId ? { ...show, ...patch } : show)),
    }));
  }

  function deleteShow(showId) {
    setData((current) => ({
      ...current,
      shows: current.shows.filter((show) => show.id !== showId),
      sessions: current.sessions.filter((session) => session.showId !== showId),
    }));
    showNotice("Show deleted.");
  }

  function addSession(input) {
    const show = data.shows.find((item) => item.id === input.showId);
    if (!show) return;
    const episodeCount = Number(input.episodeCount) || 1;
    const session = {
      id: createId("session"),
      showId: input.showId,
      watchedAt: new Date(input.watchedAt).toISOString(),
      viewer: input.viewer,
      season: Number(input.season) || show.season,
      episodeStart: Number(input.episodeStart) || Math.max(1, show.currentEpisode + 1),
      episodeCount,
      runtimeMinutes: Number(input.runtimeMinutes) || show.runtime * episodeCount,
      note: input.note.trim(),
    };
    setData((current) => ({
      ...current,
      sessions: [session, ...current.sessions],
      shows: current.shows.map((item) =>
        item.id === show.id
          ? {
              ...item,
              currentEpisode: Math.min(
                item.totalEpisodes,
                Math.max(item.currentEpisode, session.episodeStart + episodeCount - 1),
              ),
              status:
                session.episodeStart + episodeCount - 1 >= item.totalEpisodes ? "completed" : item.status,
            }
          : item,
      ),
    }));
    showNotice("Session logged.");
  }

  function deleteSession(sessionId) {
    setData((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId),
    }));
    showNotice("Session deleted.");
  }

  function replaceData(nextData, message) {
    setData(nextData);
    showNotice(message);
  }

  const ActiveIcon = VIEWS.find((item) => item.id === view)?.icon ?? BarChart3;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BT</div>
          <div>
            <p>{data.settings.householdName}</p>
            <h1>Binge Tracker</h1>
          </div>
        </div>
        <nav className="nav" aria-label="Primary navigation">
          {VIEWS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={view === item.id ? "nav-item active" : "nav-item"}
                onClick={() => setView(item.id)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <span>{data.shows.length} shows</span>
          <span>{data.sessions.length} sessions</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="page-kicker">Local-first watch ledger</p>
            <h2>
              <ActiveIcon size={24} aria-hidden="true" />
              {VIEWS.find((item) => item.id === view)?.label}
            </h2>
          </div>
          {notice && <div className="notice">{notice}</div>}
        </header>

        {view === "dashboard" && <Dashboard data={data} metrics={metrics} onViewChange={setView} />}
        {view === "library" && (
          <Library
            data={data}
            onAddShow={addShow}
            onUpdateShow={updateShow}
            onDeleteShow={deleteShow}
            onQuickLog={(show) =>
              addSession({
                showId: show.id,
                viewer: show.watchMode === "maya" || show.watchMode === "theo" ? show.watchMode : "together",
                watchedAt: new Date().toISOString().slice(0, 16),
                season: show.season,
                episodeStart: show.currentEpisode + 1,
                episodeCount: 1,
                runtimeMinutes: show.runtime,
                note: "",
              })
            }
          />
        )}
        {view === "sessions" && (
          <Sessions data={data} onAddSession={addSession} onDeleteSession={deleteSession} />
        )}
        {view === "settings" && (
          <Settings
            data={data}
            onUpdateSettings={updateSettings}
            onReplaceData={replaceData}
          />
        )}
      </main>
    </div>
  );
}
