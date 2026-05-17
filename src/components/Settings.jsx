import { Download, RotateCcw, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import {
  clearStoredData,
  createBackupFileName,
  exportData,
  importData,
  resetToSampleData,
} from "../storage.js";
import { Card, Field, SectionHeader } from "./ui.jsx";

export function Settings({ data, onUpdateSettings, onReplaceData }) {
  const [settings, setSettings] = useState(data.settings);
  const [importError, setImportError] = useState("");

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
