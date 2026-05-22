import { Download, Film, RotateCcw, ServerCog, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import {
  clearStoredData,
  createBackupFileName,
  exportData,
  importData,
  resetToSampleData,
} from "../storage.js";
import {
  fetchTautulliHistory,
  getTautulliImportCandidates,
  mergeTautulliHistory,
  parseTautulliPayload,
  parseUserMap,
} from "../tautulli.js";
import { enrichShowsWithTmdb } from "../tmdb.js";
import { Card, Field, SectionHeader } from "./ui.jsx";

export function Settings({ data, onUpdateSettings, onReplaceData }) {
  const [settings, setSettings] = useState(data.settings);
  const [importError, setImportError] = useState("");
  const [tautulli, setTautulli] = useState({
    baseUrl: localStorage.getItem("binge-tracker:tautulli:url") ?? "",
    apiKey: localStorage.getItem("binge-tracker:tautulli:key") ?? "",
    length: 500,
    tavUsers: "",
    deeUsers: "",
    togetherUsers: "",
    pastedJson: "",
  });
  const [tautulliStatus, setTautulliStatus] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [tautulliRows, setTautulliRows] = useState([]);
  const [selectedTautulliShowIds, setSelectedTautulliShowIds] = useState([]);
  const tautulliCandidates = useMemo(
    () => getTautulliImportCandidates(tautulliRows),
    [tautulliRows],
  );
  const [tmdb, setTmdb] = useState({
    credential: localStorage.getItem("binge-tracker:tmdb:credential") ?? "",
    language: localStorage.getItem("binge-tracker:tmdb:language") ?? "en-US",
  });
  const [tmdbStatus, setTmdbStatus] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);

  function updatePerson(personId, patch) {
    setSettings((current) => ({
      ...current,
      people: current.people.map((person) => (person.id === personId ? { ...person, ...patch } : person)),
    }));
  }

  function submit(event) {
    event.preventDefault();
    onUpdateSettings(settings);
  }

  function downloadBackup() {
    const url = URL.createObjectURL(new Blob([exportData(data)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = createBackupFileName();
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = importData(await file.text());
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    setImportError("");
    onReplaceData(result.data, "Backup imported.");
  }

  function updateTautulli(name, value) {
    setTautulli((current) => ({ ...current, [name]: value }));
  }

  function prepareTautulliRows(rows) {
    const candidates = getTautulliImportCandidates(rows);
    setTautulliRows(rows);
    setSelectedTautulliShowIds(candidates.map((candidate) => candidate.id));
    setTautulliStatus(
      candidates.length
        ? `Found ${candidates.length} shows or movies across ${rows.length} Tautulli rows. Choose what to import below.`
        : "No TV episodes or movies were found in that Tautulli response.",
    );
  }

  function importRows(rows, selectedShowIds) {
    const userMap = parseUserMap({
      maya: tautulli.tavUsers,
      theo: tautulli.deeUsers,
      together: tautulli.togetherUsers,
    });
    const result = mergeTautulliHistory(data, rows, { selectedShowIds, userMap });
    onReplaceData(
      result.data,
      `Tautulli import: ${result.importedSessions} sessions, ${result.createdShows} shows.`,
    );
    setTautulliStatus(
      `Imported ${result.importedSessions} sessions, created ${result.createdShows} shows, skipped ${result.skippedRows} rows.`,
    );
    setTautulliRows([]);
    setSelectedTautulliShowIds([]);
  }

  function toggleTautulliShow(showId) {
    setSelectedTautulliShowIds((current) =>
      current.includes(showId) ? current.filter((id) => id !== showId) : [...current, showId],
    );
  }

  function importSelectedTautulliRows() {
    if (!selectedTautulliShowIds.length) {
      setTautulliStatus("Select at least one show or movie to import.");
      return;
    }
    importRows(tautulliRows, selectedTautulliShowIds);
  }

  async function importFromTautulli(event) {
    event.preventDefault();
    setIsImporting(true);
    setTautulliStatus("");
    try {
      localStorage.setItem("binge-tracker:tautulli:url", tautulli.baseUrl);
      localStorage.setItem("binge-tracker:tautulli:key", tautulli.apiKey);
      const rows = await fetchTautulliHistory({
        baseUrl: tautulli.baseUrl,
        apiKey: tautulli.apiKey,
        length: tautulli.length,
      });
      prepareTautulliRows(rows);
    } catch (error) {
      setTautulliStatus(
        `${error.message} If your browser blocks the request, open the generated Tautulli API URL separately and paste the JSON response below.`,
      );
    } finally {
      setIsImporting(false);
    }
  }

  function importPastedTautulliJson() {
    try {
      prepareTautulliRows(parseTautulliPayload(tautulli.pastedJson));
      updateTautulli("pastedJson", "");
    } catch {
      setTautulliStatus("Could not read the pasted Tautulli JSON.");
    }
  }

  function updateTmdb(name, value) {
    setTmdb((current) => ({ ...current, [name]: value }));
  }

  async function enrichFromTmdb(event) {
    event.preventDefault();
    setIsEnriching(true);
    setTmdbStatus("");
    try {
      localStorage.setItem("binge-tracker:tmdb:credential", tmdb.credential);
      localStorage.setItem("binge-tracker:tmdb:language", tmdb.language);
      const result = await enrichShowsWithTmdb(data, {
        credential: tmdb.credential,
        language: tmdb.language,
      });
      onReplaceData(result.data, `TMDB enriched ${result.enriched} shows.`);
      setTmdbStatus(`Enriched ${result.enriched} shows. Missed ${result.missed}.`);
    } catch (error) {
      setTmdbStatus(error.message);
    } finally {
      setIsEnriching(false);
    }
  }

  return (
    <div className="view settings-view">
      <Card>
        <SectionHeader title="Household" eyebrow="Names and colors" />
        <form className="settings-form" onSubmit={submit}>
          <Field label="Household name">
            <input value={settings.householdName} onChange={(event) => setSettings({ ...settings, householdName: event.target.value })} />
          </Field>
          {settings.people.map((person) => (
            <div className="person-settings" key={person.id}>
              <Field label={`${person.short} name`}>
                <input value={person.name} onChange={(event) => updatePerson(person.id, { name: event.target.value })} />
              </Field>
              <Field label={`${person.short} color`}>
                <input value={person.color} onChange={(event) => updatePerson(person.id, { color: event.target.value })} type="color" />
              </Field>
            </div>
          ))}
          <Field label="Together color">
            <input value={settings.togetherColor} onChange={(event) => setSettings({ ...settings, togetherColor: event.target.value })} type="color" />
          </Field>
          <Field label="Density">
            <select value={settings.density} onChange={(event) => setSettings({ ...settings, density: event.target.value })}>
              <option value="cozy">Cozy</option>
              <option value="compact">Compact</option>
            </select>
          </Field>
          <button className="primary-btn form-submit" type="submit">
            Save settings
          </button>
        </form>
      </Card>

      <Card>
        <SectionHeader title="Tautulli import" eyebrow="Plex watch history" />
        <form className="settings-form" onSubmit={importFromTautulli}>
          <Field label="Tautulli URL">
            <input
              value={tautulli.baseUrl}
              onChange={(event) => updateTautulli("baseUrl", event.target.value)}
              placeholder="http://192.168.1.20:8181"
              type="url"
            />
          </Field>
          <Field label="Tautulli API key">
            <input
              value={tautulli.apiKey}
              onChange={(event) => updateTautulli("apiKey", event.target.value)}
              placeholder="Settings -> Access Control"
              type="password"
            />
          </Field>
          <Field label="Rows">
            <input
              value={tautulli.length}
              onChange={(event) => updateTautulli("length", event.target.value)}
              min="1"
              type="number"
            />
          </Field>
          <Field label="Tav users">
            <input
              value={tautulli.tavUsers}
              onChange={(event) => updateTautulli("tavUsers", event.target.value)}
              placeholder="Plex usernames, comma-separated"
            />
          </Field>
          <Field label="Dee users">
            <input
              value={tautulli.deeUsers}
              onChange={(event) => updateTautulli("deeUsers", event.target.value)}
              placeholder="Plex usernames, comma-separated"
            />
          </Field>
          <Field label="Together users">
            <input
              value={tautulli.togetherUsers}
              onChange={(event) => updateTautulli("togetherUsers", event.target.value)}
              placeholder="Shared Plex user, comma-separated"
            />
          </Field>
          <button className="primary-btn form-submit" type="submit" disabled={isImporting}>
            <ServerCog size={18} aria-hidden="true" />
            {isImporting ? "Loading..." : "Review Tautulli"}
          </button>
        </form>
        <div className="paste-import">
          <Field label="Paste Tautulli JSON response">
            <textarea
              value={tautulli.pastedJson}
              onChange={(event) => updateTautulli("pastedJson", event.target.value)}
              placeholder='{"response":{"result":"success","data":{"data":[...]}}}'
            />
          </Field>
          <button className="ghost-btn" type="button" onClick={importPastedTautulliJson}>
            Review pasted JSON
          </button>
        </div>
        {tautulliCandidates.length > 0 && (
          <div className="tautulli-review">
            <div className="row-between">
              <div>
                <p className="eyebrow">Import selection</p>
                <h3>Choose shows to import</h3>
              </div>
              <div className="settings-actions">
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => setSelectedTautulliShowIds(tautulliCandidates.map((candidate) => candidate.id))}
                >
                  Select all
                </button>
                <button className="ghost-btn" type="button" onClick={() => setSelectedTautulliShowIds([])}>
                  Clear
                </button>
              </div>
            </div>
            <div className="tautulli-candidate-list">
              {tautulliCandidates.map((candidate) => (
                <label className="tautulli-candidate" key={candidate.id}>
                  <input
                    type="checkbox"
                    checked={selectedTautulliShowIds.includes(candidate.id)}
                    onChange={() => toggleTautulliShow(candidate.id)}
                  />
                  <span>
                    <strong>{candidate.title}</strong>
                    <small>
                      {candidate.mediaType === "movie" ? "Movie" : "TV"} · {candidate.year} ·{" "}
                      {candidate.sessionCount} history {candidate.sessionCount === 1 ? "row" : "rows"} · latest{" "}
                      {new Date(candidate.latestWatchedAt).toLocaleDateString()}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <button
              className="primary-btn"
              type="button"
              onClick={importSelectedTautulliRows}
              disabled={!selectedTautulliShowIds.length}
            >
              Import selected
            </button>
          </div>
        )}
        {tautulliStatus && <p className="settings-note">{tautulliStatus}</p>}
        <p className="settings-note">
          Tautulli history loads into a review list first. Unmapped users import as Together, and repeat imports are deduped by Tautulli history row.
        </p>
      </Card>

      <Card>
        <SectionHeader title="TMDB enrichment" eyebrow="Posters and metadata" />
        <form className="settings-form" onSubmit={enrichFromTmdb}>
          <Field label="TMDB API key or token">
            <input
              value={tmdb.credential}
              onChange={(event) => updateTmdb("credential", event.target.value)}
              placeholder="v3 API key or Read Access Token"
              type="password"
            />
          </Field>
          <Field label="Language">
            <input
              value={tmdb.language}
              onChange={(event) => updateTmdb("language", event.target.value)}
              placeholder="en-US"
            />
          </Field>
          <button className="primary-btn form-submit" type="submit" disabled={isEnriching}>
            <Film size={18} aria-hidden="true" />
            {isEnriching ? "Enriching..." : "Enrich with TMDB"}
          </button>
        </form>
        {tmdbStatus && <p className="settings-note">{tmdbStatus}</p>}
        <p className="settings-note">
          TMDB searches your current Library by title and year, then adds posters, genres, ratings, runtime, overview, and TMDB IDs.
        </p>
      </Card>

      <Card>
        <SectionHeader title="Data management" eyebrow="Local backup" />
        <div className="settings-actions">
          <button type="button" className="ghost-btn" onClick={downloadBackup}>
            <Download size={16} aria-hidden="true" />
            Export JSON
          </button>
          <label className="file-btn">
            <Upload size={16} aria-hidden="true" />
            Import JSON
            <input type="file" accept="application/json" onChange={handleImport} />
          </label>
          <button type="button" className="ghost-btn" onClick={() => window.confirm("Reset to sample data?") && onReplaceData(resetToSampleData(), "Sample data restored.")}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset sample
          </button>
          <button type="button" className="danger-btn" onClick={() => window.confirm("Clear all local data?") && onReplaceData(clearStoredData(), "All local data cleared.")}>
            <Trash2 size={16} aria-hidden="true" />
            Clear data
          </button>
        </div>
        {importError && <p className="error-text">{importError}</p>}
        <p className="settings-note">
          Data is stored in this browser only. Export a JSON backup before clearing browser storage or moving machines.
        </p>
      </Card>
    </div>
  );
}
