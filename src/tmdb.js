const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function credentialIsBearer(credential) {
  const value = credential.trim();
  return value.startsWith("Bearer ") || value.startsWith("eyJ");
}

function getCredentialValue(credential) {
  return credential.trim().replace(/^Bearer\s+/i, "");
}

function getAuthHeaders(credential) {
  if (!credentialIsBearer(credential)) return {};
  return {
    Authorization: `Bearer ${getCredentialValue(credential)}`,
    accept: "application/json",
  };
}

function addCredential(url, credential) {
  if (!credential.trim()) {
    throw new Error("TMDB credential is required.");
  }
  if (!credentialIsBearer(credential)) {
    url.searchParams.set("api_key", credential.trim());
  }
}

export function buildTmdbImageUrl(path, size = "w342") {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getTmdbMediaType(show) {
  if (show.tmdbType) return show.tmdbType;
  if (show.source?.mediaType === "movie" || show.genre === "Movie" || show.id?.startsWith("tautulli-movie-")) {
    return "movie";
  }
  return "tv";
}

export function buildTmdbSearchUrl({
  credential,
  mediaType,
  query,
  year,
  language = "en-US",
  page = 1,
}) {
  if (!query.trim()) {
    throw new Error("Search query is required.");
  }
  const url = new URL(`${TMDB_API_BASE}/search/${mediaType}`);
  url.searchParams.set("query", query.trim());
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("language", language || "en-US");
  url.searchParams.set("page", String(page));
  addCredential(url, credential);
  if (year) {
    url.searchParams.set(mediaType === "movie" ? "primary_release_year" : "first_air_date_year", String(year));
  }
  return url;
}

function buildTmdbDetailsUrl({ credential, mediaType, id, language = "en-US" }) {
  const url = new URL(`${TMDB_API_BASE}/${mediaType}/${id}`);
  url.searchParams.set("language", language || "en-US");
  addCredential(url, credential);
  return url;
}

async function fetchJson(url, credential) {
  const response = await fetch(url, { headers: getAuthHeaders(credential) });
  if (!response.ok) {
    throw new Error(`TMDB returned HTTP ${response.status}.`);
  }
  return response.json();
}

function getYear(details, mediaType) {
  const value = mediaType === "movie" ? details.release_date : details.first_air_date;
  return Number(String(value ?? "").slice(0, 4)) || undefined;
}

function getRuntime(details, mediaType) {
  if (mediaType === "movie") {
    return Number(details.runtime) || undefined;
  }
  return Number(details.episode_run_time?.[0]) || undefined;
}

function getTotalEpisodes(details, mediaType) {
  if (mediaType === "movie") return 1;
  return Number(details.number_of_episodes) || undefined;
}

export function mapTmdbDetailsToShowPatch(details, mediaType) {
  const year = getYear(details, mediaType);
  const runtime = getRuntime(details, mediaType);
  const totalEpisodes = getTotalEpisodes(details, mediaType);
  const genre = details.genres?.[0]?.name;
  const title = mediaType === "movie" ? details.title : details.name;

  return {
    tmdbId: details.id,
    tmdbType: mediaType,
    ...(title ? { title } : {}),
    ...(year ? { year } : {}),
    ...(genre ? { genre } : {}),
    ...(runtime ? { runtime } : {}),
    ...(totalEpisodes ? { totalEpisodes } : {}),
    ...(details.overview ? { note: details.overview } : {}),
    ...(details.poster_path ? { posterUrl: buildTmdbImageUrl(details.poster_path) } : {}),
    ...(details.backdrop_path ? { backdropUrl: buildTmdbImageUrl(details.backdrop_path, "w780") } : {}),
    ...(Number(details.vote_average) ? { rating: Number(details.vote_average.toFixed?.(1) ?? details.vote_average) } : {}),
  };
}

export async function fetchTmdbDetailsForShow(show, options) {
  const mediaType = getTmdbMediaType(show);
  const searchUrl = buildTmdbSearchUrl({
    credential: options.credential,
    mediaType,
    query: show.title,
    year: show.year,
    language: options.language,
  });
  const search = await fetchJson(searchUrl, options.credential);
  const match = search.results?.[0];
  if (!match) return null;

  const detailsUrl = buildTmdbDetailsUrl({
    credential: options.credential,
    mediaType,
    id: match.id,
    language: options.language,
  });
  return fetchJson(detailsUrl, options.credential);
}

export async function enrichShowsWithTmdb(data, options) {
  const searcher = options.searcher ?? fetchTmdbDetailsForShow;
  const next = structuredClone(data);
  let enriched = 0;
  let missed = 0;

  const shows = [];
  for (const show of next.shows) {
    try {
      const mediaType = getTmdbMediaType(show);
      const details = await searcher(show, options);
      if (!details) {
        missed += 1;
        shows.push(show);
        continue;
      }
      shows.push({
        ...show,
        ...mapTmdbDetailsToShowPatch(details, mediaType),
      });
      enriched += 1;
    } catch {
      missed += 1;
      shows.push(show);
    }
  }

  return {
    data: { ...next, shows },
    enriched,
    missed,
  };
}
