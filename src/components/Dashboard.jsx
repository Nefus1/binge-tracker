import { Clock, PlusCircle } from "lucide-react";
import { formatHours } from "../metrics.js";
import { Card, SectionHeader, ViewerBadge } from "./ui.jsx";

export function Dashboard({ data, metrics, onViewChange }) {
  const maxBar = Math.max(...metrics.weeklyBars.map((bar) => bar.hours), 1);

  return (
    <div className="view dashboard-view">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Household pace</p>
          <h2>{formatHours(metrics.weekHours)} watched this week</h2>
          <p>
            {data.settings.householdName} has a {metrics.coWatchRatio}% co-watch share, with{" "}
            {metrics.totalSessions} sessions logged across {metrics.totalShows} shows.
          </p>
        </div>
        <button className="primary-btn" type="button" onClick={() => onViewChange("sessions")}>
          <PlusCircle size={18} aria-hidden="true" />
          Log session
        </button>
      </section>

      <section className="stat-grid" aria-label="Dashboard metrics">
        <Card>
          <p className="metric-label">Hours this week</p>
          <strong>{formatHours(metrics.weekHours)}</strong>
        </Card>
        <Card>
          <p className="metric-label">Together</p>
          <strong>{formatHours(metrics.viewerHours.together)}</strong>
        </Card>
        <Card>
          <p className="metric-label">Solo split</p>
          <strong>
            {formatHours(metrics.viewerHours.maya)} / {formatHours(metrics.viewerHours.theo)}
          </strong>
        </Card>
        <Card>
          <p className="metric-label">Co-watch ratio</p>
          <strong>{metrics.coWatchRatio}%</strong>
        </Card>
      </section>

      <section className="content-grid">
        <Card className="wide">
          <SectionHeader title="Weekly rhythm" eyebrow="Last 8 days" />
          <div className="bar-chart">
            {metrics.weeklyBars.map((bar, index) => (
              <div key={`${bar.label}-${index}`} className="bar-item">
                <div className="bar-track">
                  <span style={{ height: `${Math.max(8, (bar.hours / maxBar) * 100)}%` }} />
                </div>
                <small>{bar.label}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Genre mix" eyebrow="All-time hours" />
          <div className="stack-list">
            {metrics.genreMix.map((item) => (
              <div key={item.genre} className="stack-row">
                <span>{item.genre}</span>
                <strong>{formatHours(item.hours)}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="wide">
          <SectionHeader title="Currently watching" eyebrow="Active shows" />
          <div className="show-grid">
            {metrics.activeShows.map((show) => (
              <article key={show.id} className="show-card">
                <div
                  className={show.posterUrl ? "poster has-poster" : "poster"}
                  style={show.posterUrl ? { backgroundImage: `url(${show.posterUrl})` } : undefined}
                >
                  {!show.posterUrl && show.title.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4>{show.title}</h4>
                  <p>
                    S{show.season} · E{show.currentEpisode}/{show.totalEpisodes} · {show.genre}
                  </p>
                  <div className="progress-track">
                    <span style={{ width: `${show.progress}%` }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Leaderboard" eyebrow="Most watched" />
          <div className="stack-list">
            {metrics.leaderboard.slice(0, 5).map((show, index) => (
              <div key={show.showId} className="stack-row">
                <span>
                  {index + 1}. {show.title}
                </span>
                <strong>{formatHours(show.hours)}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card className="wide">
          <SectionHeader title="Recent sessions" eyebrow="Latest log" />
          <div className="session-table">
            {metrics.recentSessions.map((session) => (
              <div key={session.id} className="session-row">
                <span className="session-time">
                  <Clock size={14} aria-hidden="true" />
                  {new Date(session.watchedAt).toLocaleDateString()}
                </span>
                <strong>{session.showTitle}</strong>
                <span>S{session.season} · E{session.episodeStart}</span>
                <span>{session.runtimeMinutes}m</span>
                <ViewerBadge viewer={session.viewer} settings={data.settings} />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
