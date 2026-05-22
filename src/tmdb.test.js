import { describe, expect, it, vi } from "vitest";
import {
  buildTmdbImageUrl,
  buildTmdbSearchUrl,
  createShowInputFromTmdbDetails,
  enrichShowsWithTmdb,
  fetchTmdbMediaDetails,
  fetchTmdbTvShowDetails,
  getTmdbMediaType,
  mapTmdbDetailsToShowPatch,
  searchTmdbMedia,
  searchTmdbTvShows,
} from "./tmdb.js";
import { sampleData } from "./data/sampleData.js";

describe("tmdb enrichment", () => {
  it("builds TV and movie search URLs with v3 API key auth", () => {
    expect(
      buildTmdbSearchUrl({
        credential: "abc123",
        mediaType: "tv",
        query: "Severance",
        year: 2022,
        language: "en-US",
      }).toString(),
    ).toBe(
      "https://api.themoviedb.org/3/search/tv?query=Severance&include_adult=false&language=en-US&page=1&api_key=abc123&first_air_date_year=2022",
    );

    expect(
      buildTmdbSearchUrl({
        credential: "abc123",
        mediaType: "movie",
        query: "Arrival",
        year: 2016,
      }).searchParams.get("primary_release_year"),
    ).toBe("2016");
  });

  it("builds TMDB image URLs from poster paths", () => {
    expect(buildTmdbImageUrl("/poster.jpg")).toBe("https://image.tmdb.org/t/p/w342/poster.jpg");
    expect(buildTmdbImageUrl(null)).toBe("");
  });

  it("detects movie records imported from Tautulli", () => {
    expect(getTmdbMediaType({ genre: "Movie", source: { mediaType: "movie" } })).toBe("movie");
    expect(getTmdbMediaType(sampleData.shows[0])).toBe("tv");
  });

  it("maps TMDB details into local show metadata", () => {
    const patch = mapTmdbDetailsToShowPatch(
      {
        id: 95396,
        name: "Severance",
        first_air_date: "2022-02-18",
        genres: [{ name: "Sci-Fi & Fantasy" }, { name: "Drama" }],
        episode_run_time: [50],
        number_of_episodes: 19,
        seasons: [
          { season_number: 0, name: "Specials", episode_count: 2 },
          { season_number: 1, name: "Season 1", episode_count: 9, air_date: "2022-02-18" },
          { season_number: 2, name: "Season 2", episode_count: 10, air_date: "2025-01-17" },
        ],
        overview: "Mark leads a team of office workers.",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        vote_average: 8.4,
      },
      "tv",
    );

    expect(patch).toMatchObject({
      tmdbId: 95396,
      tmdbType: "tv",
      title: "Severance",
      year: 2022,
      genre: "Sci-Fi & Fantasy",
      runtime: 50,
      totalEpisodes: 19,
      rating: 8.4,
      posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
    });
    expect(patch.seasons).toEqual([
      {
        seasonNumber: 1,
        name: "Season 1",
        episodeCount: 9,
        airDate: "2022-02-18",
        posterUrl: "",
      },
      {
        seasonNumber: 2,
        name: "Season 2",
        episodeCount: 10,
        airDate: "2025-01-17",
        posterUrl: "",
      },
    ]);
  });

  it("creates a local show input from TMDB TV details with season metadata", () => {
    expect(
      createShowInputFromTmdbDetails(
        {
          id: 95396,
          name: "Severance",
          first_air_date: "2022-02-18",
          genres: [{ name: "Sci-Fi & Fantasy" }],
          episode_run_time: [50],
          number_of_episodes: 19,
          seasons: [
            { season_number: 1, name: "Season 1", episode_count: 9, air_date: "2022-02-18" },
            { season_number: 2, name: "Season 2", episode_count: 10, air_date: "2025-01-17" },
          ],
          overview: "Office workers, severed.",
          poster_path: "/poster.jpg",
          vote_average: 8.4,
        },
        "maya",
      ),
    ).toMatchObject({
      title: "Severance",
      year: 2022,
      genre: "Sci-Fi & Fantasy",
      season: 1,
      totalEpisodes: 19,
      runtime: 50,
      watchMode: "maya",
      tmdbId: 95396,
      tmdbType: "tv",
      seasons: [
        { seasonNumber: 1, episodeCount: 9 },
        { seasonNumber: 2, episodeCount: 10 },
      ],
    });
  });

  it("searches TMDB TV shows and fetches details", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (url) => ({
      ok: true,
      json: async () => {
        const text = url.toString();
        if (text.includes("/search/tv")) {
          return {
            results: [
              {
                id: 95396,
                name: "Severance",
                first_air_date: "2022-02-18",
                overview: "Office workers, severed.",
                poster_path: "/poster.jpg",
                vote_average: 8.4,
              },
            ],
          };
        }
        return { id: 95396, name: "Severance" };
      },
    }));

    await expect(searchTmdbTvShows({ credential: "abc123", query: "Severance" })).resolves.toEqual([
      expect.objectContaining({
        tmdbId: 95396,
        title: "Severance",
        year: 2022,
        posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
      }),
    ]);
    await expect(fetchTmdbTvShowDetails({ credential: "abc123", tmdbId: 95396 })).resolves.toEqual({
      id: 95396,
      name: "Severance",
    });

    globalThis.fetch = originalFetch;
  });

  it("searches and fetches arbitrary TMDB media types", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async (url) => ({
      ok: true,
      json: async () => {
        const text = url.toString();
        if (text.includes("/search/movie")) {
          return {
            results: [
              {
                id: 329865,
                title: "Arrival",
                release_date: "2016-11-10",
                overview: "A linguist works with the military.",
                poster_path: "/arrival.jpg",
                vote_average: 7.6,
              },
            ],
          };
        }
        return { id: 329865, title: "Arrival", runtime: 116 };
      },
    }));

    await expect(
      searchTmdbMedia({ credential: "abc123", mediaType: "movie", query: "Arrival", year: 2016 }),
    ).resolves.toEqual([
      expect.objectContaining({
        tmdbId: 329865,
        tmdbType: "movie",
        title: "Arrival",
        year: 2016,
      }),
    ]);
    await expect(
      fetchTmdbMediaDetails({ credential: "abc123", mediaType: "movie", tmdbId: 329865 }),
    ).resolves.toEqual({ id: 329865, title: "Arrival", runtime: 116 });

    globalThis.fetch = originalFetch;
  });

  it("enriches matching shows and reports misses", async () => {
    const searcher = vi.fn(async (show) => {
      if (show.title !== "Severance") return null;
      return {
        id: 95396,
        name: "Severance",
        first_air_date: "2022-02-18",
        genres: [{ name: "Sci-Fi & Fantasy" }],
        episode_run_time: [50],
        number_of_episodes: 19,
        overview: "Office workers, severed.",
        poster_path: "/poster.jpg",
        vote_average: 8.4,
      };
    });

    const result = await enrichShowsWithTmdb(
      { ...sampleData, shows: [sampleData.shows[0], sampleData.shows[1]] },
      { credential: "abc123", searcher },
    );

    expect(result.enriched).toBe(1);
    expect(result.missed).toBe(1);
    expect(result.data.shows[0]).toMatchObject({
      title: "Severance",
      tmdbId: 95396,
      genre: "Sci-Fi & Fantasy",
      posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
    });
  });
});
