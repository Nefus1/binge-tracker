import { Archive, CheckCircle2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  createShowInputFromTmdbDetails,
  fetchTmdbTvShowDetails,
  searchTmdbTvShows,
} from "../tmdb.js";
import { Card, EmptyState, Field, SectionHeader, ViewerBadge } from "./ui.jsx";

const initialShowForm = {
  title: "",
  year: "",
  genre: "",
  season: 1,
  totalEpisodes: 8,
  currentEpisode: 0,
  runtime: 45,
  watchMode: "together",
  rating: "",
  note: "",
};

export function Library({ data, onAddShow, onUpdateShow, onDeleteShow, onQuickLog }) {
  const [form, setForm] = useState(initialShowForm);
  const [filter, setFilter] = useState("all");
  const [tmdbSearch, setTmdbSearch] = useState({
    credential: localStorage.getItem("binge-tracker:tmdb:credential") ?? "",
    language: localStorage.getItem("binge-tracker:tmdb:language") ?? "en-US",
    query: "",
    watchMode: "together",
  });
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbStatus, setTmdbStatus] = useState("");
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);
  const [addingTmdbId, setAddingTmdbId] = useState(null);

  const visibleShows = data.shows.filter((show) => filter === "all" || show.status === filter);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onAddShow(form);
    setForm(initialShowForm);
  }

  function updateTmdbSearch(name, value) {
    setTmdbSearch((current) => ({ ...current, [name]: value }));
  }

  async function submitTmdbSearch(event) {
    event.preventDefault();
    setIsSearchingTmdb(true);
    setTmdbStatus("");
    try {
      localStorage.setItem("binge-tracker:tmdb:credential", tmdbSearch.credential);
      localStorage.setItem("binge-tracker:tmdb:language", tmdbSearch.language);
      const results = await searchTmdbTvShows({
        credential: tmdbSearch.credential,
        query: tmdbSearch.query,
        language: tmdbSearch.language,
      });
      setTmdbResults(results);
      setTmdbStatus(results.length ? `${results.length} TMDB matches found.` : "No TMDB matches found.");
    } catch (error) {
      setTmdbStatus(error.message);
      setTmdbResults([]);
    } finally {
      setIsSearchingTmdb(false);
    }
  }

  async function addTmdbShow(result) {
    setAddingTmdbId(result.tmdbId);
    setTmdbStatus("");
    try {
      const details = await fetchTmdbTvShowDetails({
        credential: tmdbSearch.credential,
        tmdbId: result.tmdbId,
        language: tmdbSearch.language,
      });
      onAddShow(createShowInputFromTmdbDetails(details, tmdbSearch.watchMode));
      setTmdbStatus(`${result.title} added with TMDB season metadata.`);
    } catch (error) {
      setTmdbStatus(error.message);
    } finally {
      setAddingTmdbId(null);
    }
  }

  return (
    <div className="view library-view">
      <Card>
        <SectionHeader title="Search TMDB" eyebrow="Add from database" />
        <form className="form-grid" onSubmit={submitTmdbSearch}>
          <Field label="TMDB API key or token">
            <input
              value={tmdbSearch.credential}
              onChange={(event) => updateTmdbSearch("credential", event.target.value)}
              placeholder="Saved from Settings if available"
              type="password"
            />
          </Field>
          <Field label="Show search">
            <input
              value={tmdbSearch.query}
              onChange={(event) => updateTmdbSearch("query", event.target.value)}
              placeholder="Severance, The Bear, Silo..."
              required
            />
          </Field>
          <Field label="Language">
            <input
              value={tmdbSearch.language}
              onChange={(event) => updateTmdbSearch("language", event.target.value)}
              placeholder="en-US"
            />
          </Field>
          <Field label="Watch mode">
            <select value={tmdbSearch.watchMode} onChange={(event) => updateTmdbSearch("watchMode", event.target.value)}>
              <option value="together">Together</option>
              {data.settings.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </Field>
          <button className="primary-btn form-submit" type="submit" disabled={isSearchingTmdb}>
            <Search size={18} aria-hidden="true" />
            {isSearchingTmdb ? "Searching..." : "Search TMDB"}
          </button>
        </form>
        {tmdbStatus && <p className="settings-note">{tmdbStatus}</p>}
        {tmdbResults.length > 0 && (
          <div className="tmdb-results">
            {tmdbResults.map((result) => (
              <article key={result.tmdbId} className="tmdb-result">
                <div
                  className={result.posterUrl ? "library-poster has-poster" : "library-poster"}
                  style={result.posterUrl ? { backgroundImage: `url(${result.posterUrl})` } : undefined}
                >
                  {!result.posterUrl && result.title.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3>{result.title}</h3>
                  <p>
                    {result.year || "Unknown year"} · TMDB {result.rating ? result.rating.toFixed(1) : "unrated"}
                  </p>
                  <p>{result.overview || "No overview available."}</p>
                </div>
                <button className="ghost-btn" type="button" onClick={() => addTmdbShow(result)} disabled={addingTmdbId === result.tmdbId}>
                  <Plus size={16} aria-hidden="true" />
                  {addingTmdbId === result.tmdbId ? "Adding..." : "Add"}
                </button>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Add show" eyebrow="Library intake" />
        <form className="form-grid" onSubmit={submit}>
          <Field label="Title">
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
          </Field>
          <Field label="Genre">
            <input value={form.genre} onChange={(event) => updateField("genre", event.target.value)} />
          </Field>
          <Field label="Year">
            <input value={form.year} onChange={(event) => updateField("year", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Season">
            <input value={form.season} onChange={(event) => updateField("season", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Total episodes">
            <input value={form.totalEpisodes} onChange={(event) => updateField("totalEpisodes", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Runtime">
            <input value={form.runtime} onChange={(event) => updateField("runtime", event.target.value)} type="number" min="1" />
          </Field>
          <Field label="Watch mode">
            <select value={form.watchMode} onChange={(event) => updateField("watchMode", event.target.value)}>
              <option value="together">Together</option>
              {data.settings.people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Note">
            <input value={form.note} onChange={(event) => updateField("note", event.target.value)} />
          </Field>
          <button className="primary-btn form-submit" type="submit">
            <Plus size={18} aria-hidden="true" />
            Add show
          </button>
        </form>
      </Card>

      <div className="filter-row" role="group" aria-label="Library filters">
        {["all", "watching", "completed", "archived"].map((item) => (
          <button key={item} className={filter === item ? "chip active" : "chip"} type="button" onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>

      {visibleShows.length === 0 ? (
        <EmptyState title="No shows here yet" body="Add a show or switch filters to see the rest of the library." />
      ) : (
        <div className="library-grid">
          {visibleShows.map((show) => (
            <Card key={show.id} className="show-row-card">
              <div
                className={show.posterUrl ? "library-poster has-poster" : "library-poster"}
                style={show.posterUrl ? { backgroundImage: `url(${show.posterUrl})` } : undefined}
              >
                {!show.posterUrl && show.title.slice(0, 2).toUpperCase()}
              </div>
              <div className="library-detail">
                <div className="row-between">
                  <div>
                    <h3>{show.title}</h3>
                    <p>
                      {show.year} · {show.genre} · S{show.season}
                    </p>
                  </div>
                  <ViewerBadge viewer={show.watchMode} settings={data.settings} />
                </div>
                <div className="progress-track">
                  <span style={{ width: `${show.totalEpisodes ? (show.currentEpisode / show.totalEpisodes) * 100 : 0}%` }} />
                </div>
                <div className="library-actions">
                  <button type="button" onClick={() => onQuickLog(show)} disabled={show.status === "archived" || show.currentEpisode >= show.totalEpisodes}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Next episode
                  </button>
                  <button type="button" onClick={() => onUpdateShow(show.id, { status: show.status === "archived" ? "watching" : "archived" })}>
                    <Archive size={16} aria-hidden="true" />
                    {show.status === "archived" ? "Restore" : "Archive"}
                  </button>
                  <button className="danger-btn" type="button" onClick={() => window.confirm(`Delete ${show.title}?`) && onDeleteShow(show.id)}>
                    <Trash2 size={16} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
