import { describe, expect, it } from "vitest";
import {
  buildTautulliHistoryUrl,
  mergeTautulliHistory,
  parseUserMap,
} from "./tautulli.js";
import { sampleData } from "./data/sampleData.js";

const historyRows = [
  {
    row_id: 9001,
    date: 1715901120,
    duration: 3480,
    media_type: "episode",
    rating_key: 444,
    parent_rating_key: 333,
    grandparent_rating_key: 222,
    grandparent_title: "For All Mankind",
    parent_media_index: 2,
    media_index: 3,
    year: 2019,
    friendly_name: "plex-tav",
    title: "Rules of Engagement",
  },
  {
    row_id: 9002,
    date: 1715987520,
    duration: 6120,
    media_type: "movie",
    rating_key: 555,
    full_title: "Arrival",
    title: "Arrival",
    year: 2016,
    friendly_name: "couch",
  },
];

describe("tautulli import", () => {
  it("builds a get_history URL with safe base normalization", () => {
    expect(
      buildTautulliHistoryUrl({
        baseUrl: "http://server.local:8181/tautulli/",
        apiKey: "secret",
        length: 250,
      }).toString(),
    ).toBe(
      "http://server.local:8181/tautulli/api/v2?apikey=secret&cmd=get_history&media_type=episode%2Cmovie&order_column=date&order_dir=desc&length=250",
    );
  });

  it("parses comma separated user mappings", () => {
    expect(
      parseUserMap({
        maya: "plex-tav, Tav",
        theo: "dee",
        together: "couch, living room",
      }),
    ).toEqual({
      "plex-tav": "maya",
      tav: "maya",
      dee: "theo",
      couch: "together",
      "living room": "together",
    });
  });

  it("converts history rows into local shows and sessions", () => {
    const result = mergeTautulliHistory(sampleData, historyRows, {
      userMap: parseUserMap({ maya: "plex-tav", together: "couch" }),
    });

    expect(result.importedSessions).toBe(2);
    expect(result.createdShows).toBe(2);
    expect(result.data.shows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "tautulli-show-222", title: "For All Mankind" }),
        expect.objectContaining({ id: "tautulli-movie-555", title: "Arrival" }),
      ]),
    );
    expect(result.data.sessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "tautulli-session-9001",
          showId: "tautulli-show-222",
          viewer: "maya",
          season: 2,
          episodeStart: 3,
          runtimeMinutes: 58,
        }),
        expect.objectContaining({
          id: "tautulli-session-9002",
          showId: "tautulli-movie-555",
          viewer: "together",
          runtimeMinutes: 102,
        }),
      ]),
    );
  });

  it("dedupes sessions by Tautulli row id", () => {
    const first = mergeTautulliHistory(sampleData, historyRows, {
      userMap: parseUserMap({ maya: "plex-tav", together: "couch" }),
    });
    const second = mergeTautulliHistory(first.data, historyRows, {
      userMap: parseUserMap({ maya: "plex-tav", together: "couch" }),
    });

    expect(second.importedSessions).toBe(0);
    expect(second.createdShows).toBe(0);
  });
});
