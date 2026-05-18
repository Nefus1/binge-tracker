const DAY_MS = 24 * 60 * 60 * 1000;

export function formatHours(hours) {
  if (!hours) return "0h";
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

export function getShowTitle(shows, showId) {
  return shows.find((show) => show.id === showId)?.title ?? "Unknown show";
}

export function getViewerLabel(settings, viewer) {
  if (viewer === "together") return "Together";
  return settings.people.find((person) => person.id === viewer)?.name ?? viewer;
}

function getWeekStart(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function getBucketKey(date, groupBy) {
  if (groupBy === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  if (groupBy === "week") {
    const start = getWeekStart(date);
    return start.toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function formatBucketLabel(key, groupBy) {
  if (groupBy === "month") {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }
  if (groupBy === "week") {
    return `Week of ${new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`;
  }
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function calculateShowAnalysis(data, options = {}) {
  const groupBy = options.groupBy ?? "day";
  const showId = options.showId ?? "all";
  const selectedShow = data.shows.find((show) => show.id === showId);
  const filteredSessions = data.sessions
    .filter((session) => showId === "all" || session.showId === showId)
    .sort((a, b) => new Date(a.watchedAt).getTime() - new Date(b.watchedAt).getTime());
  const bucketsByKey = new Map();
  const viewerHours = { maya: 0, theo: 0, together: 0 };

  for (const session of filteredSessions) {
    const watchedAt = new Date(session.watchedAt);
    const key = getBucketKey(watchedAt, groupBy);
    const hours = (Number(session.runtimeMinutes) || 0) / 60;
    bucketsByKey.set(key, (bucketsByKey.get(key) ?? 0) + hours);
    viewerHours[session.viewer] = (viewerHours[session.viewer] ?? 0) + hours;
  }

  const buckets = [...bucketsByKey.entries()]
    .map(([key, hours]) => ({
      key,
      label: formatBucketLabel(key, groupBy),
      hours,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
  const totalHours = buckets.reduce((sum, bucket) => sum + bucket.hours, 0);

  return {
    groupBy,
    showId,
    selectedShowTitle: selectedShow?.title ?? "All shows",
    buckets,
    totalHours,
    sessionCount: filteredSessions.length,
    averageHours: buckets.length ? totalHours / buckets.length : 0,
    viewerHours,
  };
}

export function calculateDashboardMetrics(data, options = {}) {
  const now = options.now ?? new Date();
  const showsById = new Map(data.shows.map((show) => [show.id, show]));
  const sortedSessions = [...data.sessions].sort(
    (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime(),
  );
  const weekStart = new Date(now.getTime() - 7 * DAY_MS);
  const sessionsThisWeek = sortedSessions.filter(
    (session) => new Date(session.watchedAt) >= weekStart && new Date(session.watchedAt) <= now,
  );

  const viewerHours = {
    maya: 0,
    theo: 0,
    together: 0,
  };
  const genreHours = new Map();
  const showHours = new Map();

  for (const session of sortedSessions) {
    const hours = (Number(session.runtimeMinutes) || 0) / 60;
    showHours.set(session.showId, (showHours.get(session.showId) ?? 0) + hours);
    const genre = showsById.get(session.showId)?.genre ?? "Unknown";
    genreHours.set(genre, (genreHours.get(genre) ?? 0) + hours);
  }

  for (const session of sessionsThisWeek) {
    const hours = (Number(session.runtimeMinutes) || 0) / 60;
    viewerHours[session.viewer] = (viewerHours[session.viewer] ?? 0) + hours;
  }

  const weekHours = Object.values(viewerHours).reduce((sum, value) => sum + value, 0);
  const coWatchRatio = weekHours ? Math.round((viewerHours.together / weekHours) * 100) : 0;

  const activeShows = data.shows
    .filter((show) => show.status === "watching")
    .map((show) => ({
      ...show,
      progress: show.totalEpisodes ? Math.round((show.currentEpisode / show.totalEpisodes) * 100) : 0,
      hours: showHours.get(show.id) ?? 0,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const leaderboard = [...showHours.entries()]
    .map(([showId, hours]) => ({
      showId,
      title: getShowTitle(data.shows, showId),
      hours,
      genre: showsById.get(showId)?.genre ?? "Unknown",
    }))
    .sort((a, b) => b.hours - a.hours);

  const recentSessions = sortedSessions.slice(0, 8).map((session) => ({
    ...session,
    showTitle: getShowTitle(data.shows, session.showId),
    viewerLabel: getViewerLabel(data.settings, session.viewer),
  }));

  const genreMix = [...genreHours.entries()]
    .map(([genre, hours]) => ({ genre, hours }))
    .sort((a, b) => b.hours - a.hours);

  const weeklyBars = Array.from({ length: 8 }, (_, index) => {
    const end = new Date(now.getTime() - (7 - index) * DAY_MS);
    const start = new Date(end.getTime() - DAY_MS);
    const daySessions = sortedSessions.filter((session) => {
      const watched = new Date(session.watchedAt);
      return watched >= start && watched < end;
    });
    return {
      label: end.toLocaleDateString(undefined, { weekday: "short" }),
      hours: daySessions.reduce((sum, session) => sum + (Number(session.runtimeMinutes) || 0) / 60, 0),
    };
  });

  return {
    weekHours,
    viewerHours,
    coWatchRatio,
    activeShows,
    leaderboard,
    recentSessions,
    genreMix,
    weeklyBars,
    totalSessions: data.sessions.length,
    totalShows: data.shows.length,
  };
}
