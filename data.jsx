// Static realistic data for the binge tracker mock.
// Two viewers, 12 weeks of history, real prestige-TV slate.

const PEOPLE = {
  M: { key: "M", name: "Maya",  short: "M", color: "var(--maya)" },
  T: { key: "T", name: "Theo",  short: "T", color: "var(--theo)" },
};

// 12 weeks of (solo M, solo T, together) hours. Most recent week last.
const WEEKLY = [
  { wk: "Mar 2",  m: 1.2, t: 2.4, c: 3.5 },
  { wk: "Mar 9",  m: 0.8, t: 1.6, c: 5.1 },
  { wk: "Mar 16", m: 2.1, t: 1.2, c: 4.8 },
  { wk: "Mar 23", m: 1.6, t: 2.0, c: 6.2 },
  { wk: "Mar 30", m: 0.9, t: 3.1, c: 7.8 },
  { wk: "Apr 6",  m: 2.4, t: 1.8, c: 5.6 },
  { wk: "Apr 13", m: 1.7, t: 1.4, c: 9.1 },
  { wk: "Apr 20", m: 1.1, t: 2.9, c: 8.4 },
  { wk: "Apr 27", m: 2.6, t: 1.5, c: 6.7 },
  { wk: "May 4",  m: 1.4, t: 2.2, c: 10.3 },
  { wk: "May 11", m: 1.8, t: 1.6, c: 11.5 },
  { wk: "May 18", m: 2.3, t: 2.7, c: 12.5 }, // current week
];

const CURRENT_WEEK = WEEKLY[WEEKLY.length - 1];

// Currently watching — shows with progress
const NOW_WATCHING = [
  {
    id: "severance",
    title: "Severance",
    season: 2,
    ep: 7, total: 10,
    runtime: 58,
    nextAt: "Tonight · 9:40 PM",
    mode: "together",
    accent: "var(--together)",
    cover: "#2b3a4a",
    glyph: "S",
    note: "Lumon, eight months in. We have theories."
  },
  {
    id: "bear",
    title: "The Bear",
    season: 3,
    ep: 4, total: 10,
    runtime: 33,
    nextAt: "Thu · 10:15 PM",
    mode: "together",
    accent: "var(--together)",
    cover: "#3a2418",
    glyph: "B",
    note: "Cousin arc, eating glass."
  },
  {
    id: "slow-horses",
    title: "Slow Horses",
    season: 4,
    ep: 2, total: 6,
    runtime: 47,
    nextAt: "Last · Sat 11:33 PM",
    mode: "T",
    accent: "var(--theo)",
    cover: "#2a2e1f",
    glyph: "SH",
    note: "Lamb is being Lamb."
  },
  {
    id: "diplomat",
    title: "The Diplomat",
    season: 2,
    ep: 5, total: 6,
    runtime: 51,
    nextAt: "Last · Sat 8:20 PM",
    mode: "M",
    accent: "var(--maya)",
    cover: "#3a1f2a",
    glyph: "D",
    note: "Hair is doing a lot."
  },
];

// Recent finishes
const RECENT_FINISHES = [
  { title: "Shōgun",                        year: 2024, eps: 10, hrs: 9.8,  rating: 9.4, mode: "together" },
  { title: "True Detective: Night Country", year: 2024, eps: 6,  hrs: 5.6,  rating: 8.1, mode: "together" },
  { title: "Mr. & Mrs. Smith",              year: 2024, eps: 8,  hrs: 6.4,  rating: 7.5, mode: "together" },
  { title: "Ripley",                        year: 2024, eps: 8,  hrs: 7.7,  rating: 8.9, mode: "M" },
  { title: "Andor",                         year: 2022, eps: 12, hrs: 10.5, rating: 9.2, mode: "T" },
];

// Top shows of all time by hours
const LEADERBOARD = [
  { title: "Severance",       hrs: 17.4, mode: "together", eps: 18, year: "2022–" },
  { title: "Succession",      hrs: 29.0, mode: "together", eps: 39, year: "2018–23" },
  { title: "The Bear",        hrs: 13.8, mode: "together", eps: 24, year: "2022–" },
  { title: "Andor",           hrs: 10.5, mode: "T",        eps: 12, year: "2022–" },
  { title: "Shōgun",          hrs:  9.8, mode: "together", eps: 10, year: "2024" },
  { title: "The Last of Us",  hrs:  9.2, mode: "together", eps:  9, year: "2023–" },
];

// 12 weeks × 7 days of episode counts. 0–4. Most-recent at bottom-right.
// Designed to show patterns: weekends heavier, the occasional Tuesday binge.
const HEATMAP_WEEKS = 12;
const HEATMAP = (() => {
  // pseudo-random but stable
  const seed = 1337;
  const rng = (i) => {
    const x = Math.sin(seed + i * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  const data = [];
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const r = rng(w * 7 + d);
      // weighted: weekday lower, friday/sat higher
      let base;
      if (d === 5 || d === 6) base = 0.55;      // Fri/Sat
      else if (d === 0)        base = 0.40;     // Sun
      else if (d === 2)        base = 0.30;     // Tue (random bingeable nights)
      else                     base = 0.18;
      // ramp up recent weeks
      base += w / HEATMAP_WEEKS * 0.18;
      let v = 0;
      if (r < base * 0.25) v = 4;
      else if (r < base * 0.55) v = 3;
      else if (r < base * 0.9)  v = 2;
      else if (r < base * 1.3)  v = 1;
      else v = 0;
      row.push(v);
    }
    data.push(row);
  }
  return data;
})();

// Genre split (% of hours)
const GENRES = [
  { name: "Prestige Drama", pct: 38, hex: "var(--maya)" },
  { name: "Thriller",       pct: 22, hex: "var(--theo)" },
  { name: "Sci-Fi",         pct: 18, hex: "var(--together)" },
  { name: "Comedy",          pct: 12, hex: "#9c7cd6" },
  { name: "Documentary",     pct:  6, hex: "#7a8eaa" },
  { name: "Animation",       pct:  4, hex: "#6b6357" },
];

// Latest episodes log
const RECENT_LOG = [
  { when: "Yesterday · 11:12 PM", show: "Severance",     ep: "S2 · E7",  title: "Chikhai Bardo",        runtime: 58, who: "together" },
  { when: "Yesterday · 10:08 PM", show: "Severance",     ep: "S2 · E6",  title: "Attila",               runtime: 47, who: "together" },
  { when: "Sun · 9:45 PM",         show: "The Bear",      ep: "S3 · E4",  title: "Violet",               runtime: 33, who: "together" },
  { when: "Sun · 9:10 PM",         show: "The Bear",      ep: "S3 · E3",  title: "Doors",                runtime: 31, who: "together" },
  { when: "Sat · 11:33 PM",        show: "Slow Horses",   ep: "S4 · E2",  title: "Bad Influence",        runtime: 47, who: "T" },
  { when: "Sat · 8:20 PM",         show: "The Diplomat",  ep: "S2 · E5",  title: "Some People Did…",    runtime: 51, who: "M" },
  { when: "Fri · 10:50 PM",        show: "Severance",     ep: "S2 · E5",  title: "Trojan's Horse",       runtime: 41, who: "together" },
  { when: "Fri · 9:55 PM",         show: "Severance",     ep: "S2 · E4",  title: "Woe's Hollow",         runtime: 65, who: "together" },
];

// Headline stats for the strip
const STRIP_STATS = [
  { k: "Episodes this wk",     v: "14",       sub: "+3 vs last wk", trend: "up" },
  { k: "Avg per sitting",      v: "2.8",      sub: "episodes",       trend: "flat" },
  { k: "Longest session",      v: "4h 12m",   sub: "Sat May 17",     trend: "up" },
  { k: "Co-watch share",       v: "71%",      sub: "of all hours",   trend: "up" },
  { k: "Late-night (after 10)",v: "62%",      sub: "of episodes",    trend: "up" },
  { k: "Avg bedtime drift",    v: "+38m",     sub: "vs target",      trend: "bad" },
];

window.BINGE = {
  PEOPLE, WEEKLY, CURRENT_WEEK, NOW_WATCHING, RECENT_FINISHES,
  LEADERBOARD, HEATMAP, HEATMAP_WEEKS, GENRES, RECENT_LOG, STRIP_STATS,
};
