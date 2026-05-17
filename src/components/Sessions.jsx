import { Download, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getShowTitle } from "../metrics.js";
import { Card, Field, SectionHeader, ViewerBadge } from "./ui.jsx";

function defaultDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function Sessions({ data, onAddSession, onDeleteSession }) {
  const firstShow = data.shows[0];
  const [form, setForm] = useState(() => ({
    showId: firstShow?.id ?? "",
    viewer: "together",
    watchedAt: defaultDateTime(),
    season: firstShow?.season ?? 1,
    episodeStart: firstShow ? firstShow.currentEpisode + 1 : 1,
    episodeCount: 1,
    runtimeMinutes: firstShow?.runtime ?? 45,
    note: "",
  }));
  const [viewerFilter, setViewerFilter] = useState("all");

  const selectedShow = data.shows.find((show) => show.id === form.showId);
  const visibleSessions = useMemo(
    () =>
      data.sessions
        .filter((session) => viewerFilter === "all" || session.viewer === viewerFilter)
        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()),
    [data.sessions, viewerFilter],
  );

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "showId") {
        const show = data.shows.find((item) => item.id === value);
        if (show) {
          next.season = show.season;
          next.episodeStart = show.currentEpisode + 1;
          next.runtimeMinutes = show.runtime;
        }
      }
      return next;
    });
  }

  function submit(event) {
    event.preventDefault();
    onAddSession(form);
    setForm((current) => ({
      ...current,
      watchedAt: defaultDateTime(),
      episodeStart: Number(current.episodeStart) + Number(current.episodeCount || 1),
      note: "",
    }));
  }

  function exportCsv() {
    const rows = [
      ["watchedAt", "show", "viewer", "season", "episodeStart", "episodeCount", "runtimeMinutes", "note"],
      ...visibleSessions.map((session) => [
        session.watchedAt,
        getShowTitle(data.shows, session.showId),
        session.viewer,
        session.season,
        session.episodeStart,
        session.episodeCount,
        session.runtimeMinutes,
        session.note,
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "binge-tracker-sessions.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="view sessions-view">
      <Card>
        <SectionHeader title="Log session" eyebrow="Watch ledger" />
        <form className="form-grid" onSubmit={submit}>
          <Field label="Show">
            <select value={form.showId} onChange={(event) => updateField("showId", event.target.value)} required>
              {data.shows.map((show) => (
                <option key={show.id} value={show.id}>
                  {show.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Watched by">
            <select value={form.viewer} onChange={(event) => updateField("viewer", event.target.value)}>
              <option value="together">Together</option>
              {data.settings.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input value={form.watchedAt} onChange={(event) => updateField("watchedAt", event.target.value)} type="datetime-local" />
          </Field>
          <Field label="Season">
            <input value={form.season} onChange={(event) => updateField("season", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Episode start">
            <input value={form.episodeStart} onChange={(event) => updateField("episodeStart", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Episode count">
            <input value={form.episodeCount} onChange={(event) => updateField("episodeCount", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Runtime">
            <input value={form.runtimeMinutes} onChange={(event) => updateField("runtimeMinutes", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Note">
            <input value={form.note} onChange={(event) => updateField("note", event.target.value)} />
          </Field>
          <button className="primary-btn form-submit" type="submit" disabled={!selectedShow}>
            <Plus size={18} aria-hidden="true" />
            Log session
          </button>
        </form>
      </Card>

      <Card>
        <SectionHeader
          title="Session log"
          eyebrow="Audit trail"
          action={
            <button type="button" className="ghost-btn" onClick={exportCsv}>
              <Download size={16} aria-hidden="true" />
              Export CSV
            </button>
          }
        />
        <div className="filter-row" role="group" aria-label="Session filters">
          {["all", "together", ...data.settings.people.map((person) => person.id)].map((viewer) => (
            <button key={viewer} className={viewerFilter === viewer ? "chip active" : "chip"} type="button" onClick={() => setViewerFilter(viewer)}>
              {viewer === "all" ? "All" : viewer === "together" ? "Together" : data.settings.people.find((person) => person.id === viewer)?.name}
            </button>
          ))}
        </div>
        <div className="session-table">
          {visibleSessions.map((session) => (
            <div key={session.id} className="session-row">
              <span>{new Date(session.watchedAt).toLocaleString()}</span>
              <strong>{getShowTitle(data.shows, session.showId)}</strong>
              <span>S{session.season} · E{session.episodeStart}</span>
              <span>{session.runtimeMinutes}m</span>
              <ViewerBadge viewer={session.viewer} settings={data.settings} />
              <button className="icon-danger" type="button" aria-label={`Delete ${getShowTitle(data.shows, session.showId)} session`} onClick={() => onDeleteSession(session.id)}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
