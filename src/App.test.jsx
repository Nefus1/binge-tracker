import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import App from "./App.jsx";
import { STORAGE_KEY } from "./storage.js";

beforeEach(() => {
  localStorage.clear();
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
