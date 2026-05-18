import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { STORAGE_KEY } from "./storage.js";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

it("renders dashboard metrics from local data", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: /binge tracker/i })).toBeInTheDocument();
  expect(screen.getByText(/hours this week/i)).toBeInTheDocument();
  expect(screen.getByText(/currently watching/i)).toBeInTheDocument();
  expect(screen.getAllByText(/Severance/i).length).toBeGreaterThan(0);
});

it("adds a show from the library and persists it", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /library/i }));
  await user.type(screen.getByLabelText(/title/i), "Poker Face");
  await user.type(screen.getByLabelText(/genre/i), "Mystery");
  await user.click(screen.getByRole("button", { name: /add show/i }));

  expect(screen.getByText("Poker Face")).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).shows).toEqual(
    expect.arrayContaining([expect.objectContaining({ title: "Poker Face" })]),
  );
});

it("searches TMDB from the library and adds a show with season metadata", async () => {
  globalThis.fetch = vi.fn(async (url) => ({
    ok: true,
    json: async () => {
      const href = url.toString();
      if (href.includes("/search/tv")) {
        return {
          results: [
            {
              id: 93740,
              name: "Foundation",
              first_air_date: "2021-09-24",
              overview: "Follow a band of exiles.",
              poster_path: "/foundation.jpg",
              vote_average: 7.8,
            },
          ],
        };
      }
      return {
        id: 93740,
        name: "Foundation",
        first_air_date: "2021-09-24",
        genres: [{ name: "Sci-Fi & Fantasy" }],
        episode_run_time: [55],
        number_of_episodes: 30,
        seasons: [
          { season_number: 1, name: "Season 1", episode_count: 10, air_date: "2021-09-24" },
          { season_number: 2, name: "Season 2", episode_count: 10, air_date: "2023-07-14" },
          { season_number: 3, name: "Season 3", episode_count: 10, air_date: "2025-07-11" },
        ],
        overview: "Follow a band of exiles.",
        poster_path: "/foundation.jpg",
        vote_average: 7.8,
      };
    },
  }));

  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /library/i }));
  await user.type(screen.getByLabelText(/tmdb api key or token/i), "abc123");
  await user.type(screen.getByLabelText(/show search/i), "Foundation");
  await user.click(screen.getByRole("button", { name: /search tmdb/i }));
  expect(await screen.findByText("Foundation")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /^add$/i }));

  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).shows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Foundation",
          tmdbId: 93740,
          totalEpisodes: 30,
          seasons: [
            expect.objectContaining({ seasonNumber: 1, episodeCount: 10 }),
            expect.objectContaining({ seasonNumber: 2, episodeCount: 10 }),
            expect.objectContaining({ seasonNumber: 3, episodeCount: 10 }),
          ],
        }),
      ]),
    );
  });
});

it("logs a session from the sessions view", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /sessions/i }));
  await user.selectOptions(screen.getByLabelText(/show/i), "severance");
  await user.selectOptions(screen.getByLabelText(/watched by/i), "together");
  await user.clear(screen.getByLabelText(/runtime/i));
  await user.type(screen.getByLabelText(/runtime/i), "44");
  await user.click(screen.getByRole("button", { name: /log session/i }));

  expect(screen.getAllByText(/Severance/i).length).toBeGreaterThan(0);
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).sessions).toEqual(
    expect.arrayContaining([expect.objectContaining({ runtimeMinutes: 44 })]),
  );
});

it("shows Tautulli import controls in settings", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /settings/i }));

  expect(screen.getByRole("heading", { name: /tautulli import/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/tautulli url/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/tautulli api key/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /import tautulli/i })).toBeInTheDocument();
});

it("shows TMDB enrichment controls in settings", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: /settings/i }));

  expect(screen.getByRole("heading", { name: /tmdb enrichment/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/tmdb api key or token/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /enrich with tmdb/i })).toBeInTheDocument();
});
