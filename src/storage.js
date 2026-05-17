import { cloneSampleData } from "./data/sampleData.js";

export const STORAGE_KEY = "binge-tracker:v1";

export function validateData(data) {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Data must be an object." };
  }
  if (data.version !== 1) {
    return { ok: false, error: "Unsupported backup version." };
  }
  if (!data.settings || !Array.isArray(data.settings.people)) {
    return { ok: false, error: "Backup is missing household settings." };
  }
  if (!Array.isArray(data.shows)) {
    return { ok: false, error: "Backup is missing shows." };
  }
  if (!Array.isArray(data.sessions)) {
    return { ok: false, error: "Backup is missing sessions." };
  }

  const showIds = new Set();
  for (const show of data.shows) {
    if (!show.id || !show.title) {
      return { ok: false, error: "Every show needs an id and title." };
    }
    showIds.add(show.id);
  }

  for (const session of data.sessions) {
    if (!session.id || !session.showId || !session.watchedAt || !session.viewer) {
      return { ok: false, error: "Every session needs id, show, date, and viewer." };
    }
  }

  return { ok: true, showIds };
}

export function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return cloneSampleData();
  }

  try {
    const parsed = JSON.parse(raw);
    const result = validateData(parsed);
    if (result.ok) {
      return parsed;
    }
    localStorage.setItem(`${STORAGE_KEY}:corrupt`, raw);
    return cloneSampleData();
  } catch {
    localStorage.setItem(`${STORAGE_KEY}:corrupt`, raw);
    return cloneSampleData();
  }
}

export function saveData(data) {
  const result = validateData(data);
  if (!result.ok) {
    throw new Error(result.error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data) {
  const result = validateData(data);
  if (!result.ok) {
    throw new Error(result.error);
  }
  return JSON.stringify(data, null, 2);
}

export function importData(raw) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    const result = validateData(parsed);
    if (!result.ok) {
      return result;
    }
    saveData(parsed);
    return { ok: true, data: parsed };
  } catch {
    return { ok: false, error: "Import file is not valid JSON." };
  }
}

export function createBackupFileName(date = new Date()) {
  return `binge-tracker-backup-${date.toISOString().slice(0, 10)}.json`;
}

export function resetToSampleData() {
  const data = cloneSampleData();
  saveData(data);
  return data;
}

export function clearStoredData() {
  const empty = {
    ...cloneSampleData(),
    shows: [],
    sessions: [],
  };
  saveData(empty);
  return empty;
}
