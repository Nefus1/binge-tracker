const DEFAULT_HISTORY_LENGTH = 500;

function cleanBaseUrl(baseUrl) {
  return baseUrl.trim().replace(/\/+$/, "");
}

function normalizeName(value) {
  return String(value ?? "").trim().toLowerCase();
}

function toSlug(value) {
  return String(value ?? "item")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildTautulliHistoryUrl({ baseUrl, apiKey, length = DEFAULT_HISTORY_LENGTH }) {
  if (!baseUrl.trim()) {
    throw new Error("Tautulli URL is required.");
  }
  if (!apiKey.trim()) {
    throw new Error("Tautulli API key is required.");
  }

  const url = new URL(`${cleanBaseUrl(baseUrl)}/api/v2`);
  url.searchParams.set("apikey", apiKey.trim());
  url.searchParams.set("cmd", "get_history");
  url.searchParams.set("media_type", "episode,movie");
  url.searchParams.set("order_column", "date");
  url.searchParams.set("order_dir", "desc");
  url.searchParams.set("length", String(Number(length) || DEFAULT_HISTORY_LENGTH));
  return url;
}

export function parseUserMap(values) {
  const map = {};
  for (const [viewer, raw] of Object.entries(values)) {
    for (const name of String(raw ?? "").split(",")) {
      const normalized = normalizeName(name);
      if (normalized) {
        map[normalized] = viewer;
      }
    }
  }
  return map;
}

export async function fetchTautulliHistory(options) {
  const response = await fetch(buildTautulliHistoryUrl(options));
  if (!response.ok) {
    throw new Error(`Tautulli returned HTTP ${response.status}.`);
  }
  const payload = await response.json();
  if (payload?.response?.result && payload.response.result !== "success") {
    throw new Error(payload.response.message || "Tautulli did not return a successful response.");
  }
  return payload?.response?.data?.data ?? payload?.data?.data ?? payload?.data ?? [];
}

function getRecordTimestamp(record) {
  const seconds = Number(record.date ?? record.stopped ?? record.started);
  if (seconds) {
    return new Date(seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

function getRecordRuntime(record) {
  const duration = Number(record.duration);
  if (!duration) return 45;
  return Math.max(1, Math.round(duration / 60));
}

function getViewer(record, userMap) {
  const candidates = [record.friendly_name, record.user, record.username].map(normalizeName);
  for (const candidate of candidates) {
    if (candidate && userMap[candidate]) {
      return userMap[candidate];
    }
  }
  return "together";
}

function getShowForRecord(record) {
  const isMovie = record.media_type === "movie";
  const ratingKey = String(
    isMovie ? record.rating_key : record.grandparent_rating_key || record.parent_rating_key || record.rating_key,
  );
  const title = isMovie
    ? record.full_title || record.title || "Unknown movie"
    : record.grandparent_title || record.full_title || record.title || "Unknown show";

  return {
    id: isMovie ? `tautulli-movie-${ratingKey}` : `tautulli-show-${ratingKey}`,
    title,
    year: Number(record.year) || new Date().getFullYear(),
    genre: isMovie ? "Movie" : "TV",
    status: "watching",
    season: isMovie ? 1 : Number(record.parent_media_index) || 1,
    totalEpisodes: isMovie ? 1 : Math.max(Number(record.media_index) || 1, 1),
    currentEpisode: isMovie ? 1 : Number(record.media_index) || 1,
    runtime: getRecordRuntime(record),
    watchMode: "together",
    rating: 0,
    note: "Imported from Tautulli.",
    source: {
      tautulliRatingKey: ratingKey,
      mediaType: record.media_type,
    },
  };
}

function getSessionForRecord(record, showId, viewer) {
  const isMovie = record.media_type === "movie";
  const rowId = String(record.row_id ?? record.id ?? record.reference_id ?? record.rating_key);
  return {
    id: `tautulli-session-${rowId}`,
    showId,
    watchedAt: getRecordTimestamp(record),
    viewer,
    season: isMovie ? 1 : Number(record.parent_media_index) || 1,
    episodeStart: isMovie ? 1 : Number(record.media_index) || 1,
    episodeCount: 1,
    runtimeMinutes: getRecordRuntime(record),
    note: record.full_title || record.title || "Imported from Tautulli.",
    source: {
      tautulliRowId: rowId,
      tautulliRatingKey: String(record.rating_key ?? ""),
      user: record.friendly_name || record.user || record.username || "",
    },
  };
}

export function mergeTautulliHistory(data, rows, options = {}) {
  const userMap = options.userMap ?? {};
  const next = structuredClone(data);
  const showIds = new Set(next.shows.map((show) => show.id));
  const sessionIds = new Set(next.sessions.map((session) => session.id));
  let createdShows = 0;
  let importedSessions = 0;
  let skippedRows = 0;

  for (const record of rows) {
    if (!["episode", "movie"].includes(record.media_type)) {
      skippedRows += 1;
      continue;
    }

    const show = getShowForRecord(record);
    if (!showIds.has(show.id)) {
      next.shows.push(show);
      showIds.add(show.id);
      createdShows += 1;
    } else {
      next.shows = next.shows.map((existing) => {
        if (existing.id !== show.id) return existing;
        return {
          ...existing,
          totalEpisodes: Math.max(existing.totalEpisodes || 0, show.totalEpisodes),
          currentEpisode: Math.max(existing.currentEpisode || 0, show.currentEpisode),
        };
      });
    }

    const session = getSessionForRecord(record, show.id, getViewer(record, userMap));
    if (sessionIds.has(session.id)) {
      skippedRows += 1;
      continue;
    }
    next.sessions.push(session);
    sessionIds.add(session.id);
    importedSessions += 1;
  }

  next.sessions.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime());

  return {
    data: next,
    createdShows,
    importedSessions,
    skippedRows,
  };
}

export function parseTautulliPayload(raw) {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (Array.isArray(parsed)) return parsed;
  return parsed?.response?.data?.data ?? parsed?.data?.data ?? parsed?.data ?? [];
}
