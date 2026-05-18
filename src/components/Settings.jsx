import { Download, RotateCcw, ServerCog, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import {
  clearStoredData,
  createBackupFileName,
  exportData,
  importData,
  resetToSampleData,
} from "../storage.js";
import {
  fetchTautulliHistory,
  mergeTautulliHistory,
  parseTautulliPayload,
  parseUserMap,
} from "../tautulli.js";
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

  function importRows(rows) {
    const userMap = parseUserMap({
      maya: tautulli.tavUsers,
      theo: tautulli.deeUsers,
      together: tautulli.togetherUsers,
    });
    const result = mergeTautulliHistory(data, rows, { userMap });
    onReplaceData(
      result.data,
      `Tautulli import: ${result.importedSessions} sessions, ${result.createdShows} shows.`,
    );
    setTautulliStatus(
      `Imported ${result.importedSessions} sessions, created ${result.createdShows} shows, skipped ${result.skippedRows} rows.`,
    );
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
      importRows(rows);
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
      importRows(parseTautulliPayload(tautulli.pastedJson));
      updateTautulli("pastedJson", "");
    } catch {
      setTautulliStatus("Could not read the pasted Tautulli JSON.");
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
          <Field label="API key">
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
            {isImporting ? "Importing..." : "Import Tautulli"}
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
            Import pasted JSON
          </button>
        </div>
        {tautulliStatus && <p className="settings-note">{tautulliStatus}</p>}
        <p className="settings-note">
          Unmapped Tautulli users import as Together. Repeat imports are deduped by Tautulli history row.
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
