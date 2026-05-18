import { describe, expect, it } from "vitest";
import {
  calculateShowAnalysis,
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

  it("filters analysis by show and groups hours by day", () => {
    const analysis = calculateShowAnalysis(sampleData, {
      showId: "severance",
      groupBy: "day",
      now: new Date("2026-05-17T12:00:00.000Z"),
    });

    expect(analysis.selectedShowTitle).toBe("Severance");
    expect(analysis.totalHours).toBeCloseTo((58 + 106) / 60, 2);
    expect(analysis.sessionCount).toBe(2);
    expect(analysis.buckets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "May 11", hours: 106 / 60 }),
        expect.objectContaining({ label: "May 16", hours: 58 / 60 }),
      ]),
    );
  });

  it("groups show analysis by week and month", () => {
    const weekly = calculateShowAnalysis(sampleData, {
      showId: "severance",
      groupBy: "week",
      now: new Date("2026-05-17T12:00:00.000Z"),
    });
    const monthly = calculateShowAnalysis(sampleData, {
      showId: "severance",
      groupBy: "month",
      now: new Date("2026-05-17T12:00:00.000Z"),
    });

    expect(weekly.buckets.some((bucket) => bucket.hours > 0)).toBe(true);
    expect(monthly.buckets).toEqual([
      expect.objectContaining({ label: "May 2026", hours: (58 + 106) / 60 }),
    ]);
  });
});
