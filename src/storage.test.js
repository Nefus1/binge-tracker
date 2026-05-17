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
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-17T12:00:00.000Z"));
});

describe("storage", () => {
  it("loads sample data when local storage is empty", () => {
    expect(loadData()).toEqual(sampleData);
  });

  it("saves and loads a valid data set", () => {
    const next = {
      ...sampleData,
      shows: [{ ...sampleData.shows[0], title: "Edited Show" }],
    };

    saveData(next);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(next);
    expect(loadData()).toEqual(next);
  });

  it("falls back to sample data when stored data is malformed", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    expect(loadData()).toEqual(sampleData);
    expect(localStorage.getItem(`${STORAGE_KEY}:corrupt`)).toBe("{not json");
  });

  it("validates required top-level arrays and version", () => {
    expect(validateData(sampleData).ok).toBe(true);
    expect(validateData({ version: 1, shows: [] }).ok).toBe(false);
    expect(validateData({ ...sampleData, version: 2 }).ok).toBe(false);
  });

  it("exports and imports JSON without mutating bad imports", () => {
    saveData(sampleData);
    const exported = exportData(sampleData);

    expect(JSON.parse(exported)).toEqual(sampleData);
    expect(importData(exported)).toEqual({ ok: true, data: sampleData });
    expect(importData('{"version":1}').ok).toBe(false);
    expect(loadData()).toEqual(sampleData);
  });

  it("creates stable backup filenames", () => {
    expect(createBackupFileName()).toBe("binge-tracker-backup-2026-05-17.json");
  });
});
