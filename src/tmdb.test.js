import { describe, expect, it, vi } from "vitest";
import {
  buildTmdbImageUrl,
  buildTmdbSearchUrl,
  enrichShowsWithTmdb,
  getTmdbMediaType,
  mapTmdbDetailsToShowPatch,
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
