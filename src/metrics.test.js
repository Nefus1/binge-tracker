import { describe, expect, it } from "vitest";
import {
  calculateDashboardMetrics,
  formatHours,
  getShowTitle,
  getViewerLabel,
} from "./metrics.js";
import { sampleData } from "./data/sampleData.js";

describe("metrics", () => {
  it("formats hours for compact dashboard labels", () => {
    expect(formatHours(0)).toBe("0h");
    expect(formatHours(1.25)).toBe("1.3h");
    expect(formatHours(2)).toBe("2h");
  });

  it("calculates weekly totals, viewer split, active shows, and leaderboard", () => {
    const metrics = calculateDashboardMetrics(sampleData, {
      now: new Date("2026-05-17T12:00:00.000Z"),
    });

    expect(metrics.weekHours).toBeGreaterThan(0);
    expect(metrics.viewerHours.together).toBeGreaterThan(metrics.viewerHours.maya);
    expect(metrics.coWatchRatio).toBeGreaterThan(50);
    expect(metrics.activeShows.map((show) => show.title)).toContain("Severance");
    expect(metrics.leaderboard[0].hours).toBeGreaterThan(0);
    expect(metrics.recentSessions[0].showTitle).toBe("Severance");
  });

  it("handles unknown sessions without crashing", () => {
    expect(getShowTitle([], "missing")).toBe("Unknown show");
    expect(getViewerLabel(sampleData.settings, "together")).toBe("Together");
  });
});
