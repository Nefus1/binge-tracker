// Visual building blocks for Binge Ledger.
// Globally available components attached to window at end.

const { useMemo, useState } = React;

const FILM = "var(--ink-mute)";

// ---------- tiny atoms ----------

function Card({ children, style, pad = 24, span, accent }) {
  return (
    <section
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "var(--rad)",
        padding: pad,
        position: "relative",
        gridColumn: span ? `span ${span}` : undefined,
        ...style,
      }}
    >
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2, background: accent, opacity: 0.9,
        }} />
      )}
      {children}
    </section>
  );
}

function CardHeader({ eyebrow, title, right }) {
  return (
    <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>
        <h3 className="serif" style={{
          margin: 0, fontSize: 26, lineHeight: 1.05, fontWeight: 400,
          letterSpacing: "-0.01em", whiteSpace: "nowrap",
        }}>{title}</h3>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </header>
  );
}

function ModeDot({ mode, size = 8 }) {
  const c = mode === "M" ? "var(--maya)" : mode === "T" ? "var(--theo)" : "var(--together)";
  return <span style={{
    display: "inline-block", width: size, height: size, borderRadius: "50%",
    background: c, verticalAlign: "middle",
  }} />;
}

function ModeLabel({ mode }) {
  const base = { color: "var(--ink-dim)", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", fontFamily: "var(--mono)" };
  if (mode === "together") return <span style={{ whiteSpace: "nowrap" }}><ModeDot mode="together" /> <span style={base}>Together</span></span>;
  if (mode === "M") return <span style={{ whiteSpace: "nowrap" }}><ModeDot mode="M" /> <span style={base}>Tav · solo</span></span>;
  return <span style={{ whiteSpace: "nowrap" }}><ModeDot mode="T" /> <span style={base}>Dee · solo</span></span>;
}

// ---------- header ----------

function TopBar({ range, setRange }) {
  const ranges = ["7D", "4W", "3M", "YTD", "ALL"];
  return (
    <header style={{
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      padding: "22px 40px",
      borderBottom: "1px solid var(--line)",
      gap: 24,
      background: "linear-gradient(180deg, rgba(232,98,60,0.04), transparent 60%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Logo />
        <div style={{ width: 1, height: 28, background: "var(--line-2)" }} />
        <div>
          <div className="eyebrow">Household</div>
          <div className="serif" style={{ fontSize: 18, fontStyle: "italic", lineHeight: 1 }}>T &amp; D</div>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 26, alignItems: "center" }}>
        {["Overview", "Library", "Sessions", "Wrapped"].map((n, i) => (
          <a key={n} href="#" style={{
            color: i === 0 ? "var(--ink)" : "var(--ink-mute)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: ".02em",
            paddingBottom: 4,
            borderBottom: i === 0 ? "1px solid var(--ink)" : "1px solid transparent",
          }}>{n}</a>
        ))}
      </nav>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
        <div style={{
          display: "flex", border: "1px solid var(--line-2)", borderRadius: 2, overflow: "hidden",
        }}>
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              background: r === range ? "var(--ink)" : "transparent",
              color: r === range ? "var(--bg)" : "var(--ink-dim)",
              border: "none",
              padding: "7px 12px",
              fontSize: 11,
              fontFamily: "var(--mono)",
              letterSpacing: ".08em",
              cursor: "pointer",
            }}>{r}</button>
          ))}
        </div>
        <Avatars />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="1" y="4" width="26" height="20" rx="1.5" stroke="var(--ink)" strokeWidth="1.2" />
        <circle cx="5" cy="7" r="0.8" fill="var(--ink)" />
        <circle cx="5" cy="11" r="0.8" fill="var(--ink)" />
        <circle cx="5" cy="15" r="0.8" fill="var(--ink)" />
        <circle cx="5" cy="19" r="0.8" fill="var(--ink)" />
        <circle cx="23" cy="7" r="0.8" fill="var(--ink)" />
        <circle cx="23" cy="11" r="0.8" fill="var(--ink)" />
        <circle cx="23" cy="15" r="0.8" fill="var(--ink)" />
        <circle cx="23" cy="19" r="0.8" fill="var(--ink)" />
        <rect x="8" y="8" width="12" height="12" rx="0.5" fill="var(--maya)" opacity="0.85" />
        <rect x="10" y="10" width="12" height="12" rx="0.5" fill="var(--theo)" opacity="0.65" />
      </svg>
      <div>
        <div className="serif" style={{ fontSize: 22, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.01em" }}>
          Binge Ledger
        </div>
        <div className="eyebrow" style={{ marginTop: 2 }}>est. 2023 · couch № 1</div>
      </div>
    </div>
  );
}

function Avatars() {
  return (
    <div style={{ display: "flex" }}>
      {[{ n: "T", c: "var(--maya)" }, { n: "D", c: "var(--theo)" }].map((p, i) => (
        <div key={p.n} style={{
          width: 32, height: 32, borderRadius: "50%",
          background: p.c, color: "var(--bg)",
          display: "grid", placeItems: "center",
          fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 16,
          marginLeft: i === 0 ? 0 : -8,
          border: "2px solid var(--bg)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
        }}>{p.n}</div>
      ))}
    </div>
  );
}

// ---------- hero ----------

function Hero({ range }) {
  const cur = BINGE.CURRENT_WEEK;
  const total = cur.m + cur.t + cur.c;
  // diff vs prior week
  const prev = BINGE.WEEKLY[BINGE.WEEKLY.length - 2];
  const prevTotal = prev.m + prev.t + prev.c;
  const delta = total - prevTotal;
  const deltaPct = Math.round((delta / prevTotal) * 100);

  const segs = [
    { k: "Together", v: cur.c, c: "var(--together)" },
    { k: "Tav solo", v: cur.m, c: "var(--maya)" },
    { k: "Dee solo", v: cur.t, c: "var(--theo)" },
  ];

  return (
    <section style={{
      padding: "56px 40px 48px",
      borderBottom: "1px solid var(--line)",
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
      gap: 56,
      alignItems: "end",
      background: "radial-gradient(circle at 18% 60%, rgba(240, 194, 74, 0.05), transparent 55%)",
    }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 18 }}>This week · May 12 – 18</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 8 }}>
          <div className="serif" style={{
            fontSize: 188, lineHeight: 0.82, fontStyle: "italic",
            letterSpacing: "-0.04em",
            background: "linear-gradient(180deg, var(--ink) 30%, color-mix(in oklab, var(--ink) 50%, var(--together)) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{total.toFixed(1)}</div>
          <div style={{ paddingBottom: 18 }}>
            <div className="serif" style={{ fontSize: 36, fontStyle: "italic", lineHeight: 1, color: "var(--ink-dim)" }}>
              hours
            </div>
            <div className="mono" style={{ fontSize: 12, color: delta >= 0 ? "var(--together)" : "var(--bad)", marginTop: 8, letterSpacing: ".05em" }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)} h ({delta >= 0 ? "+" : ""}{deltaPct}%) vs last wk
            </div>
          </div>
        </div>
        <p className="serif" style={{
          fontStyle: "italic", color: "var(--ink-dim)", fontSize: 19,
          maxWidth: 520, margin: "12px 0 0", lineHeight: 1.35,
        }}>
          “We said one more episode at 10:14. It is now 1:48.
          The credits are rolling on Severance for the third time tonight.”
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {segs.map(s => (
          <div key={s.k} style={{
            border: "1px solid var(--line-2)",
            padding: "20px 18px",
            borderRadius: 2,
            background: "rgba(0,0,0,0.25)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: s.c,
            }} />
            <div className="eyebrow" style={{ marginBottom: 10 }}>{s.k}</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {s.v.toFixed(1)}
              <span style={{ fontSize: 13, color: "var(--ink-mute)", marginLeft: 4 }}>h</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 6, letterSpacing: ".06em" }}>
              {((s.v / total) * 100).toFixed(0)}% OF WEEK
            </div>
            {/* mini bar */}
            <div style={{ marginTop: 14, height: 3, background: "var(--line)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${(s.v / total) * 100}%`, height: "100%", background: s.c }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- strip stats ----------

function StatStrip() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      borderBottom: "1px solid var(--line)",
    }}>
      {BINGE.STRIP_STATS.map((s, i) => (
        <div key={s.k} style={{
          padding: "22px 26px",
          borderRight: i < 5 ? "1px solid var(--line)" : "none",
        }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{s.k}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div className="mono" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>{s.v}</div>
            <Trend kind={s.trend} />
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 4, letterSpacing: ".05em" }}>
            {s.sub.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
}

function Trend({ kind }) {
  if (kind === "up") return <span style={{ color: "var(--together)", fontSize: 11 }}>▲</span>;
  if (kind === "bad") return <span style={{ color: "var(--bad)", fontSize: 11 }}>▲</span>;
  return <span style={{ color: "var(--ink-mute)", fontSize: 11 }}>—</span>;
}

// ---------- weekly stacked bar chart ----------

function WeeklyChart() {
  const data = BINGE.WEEKLY;
  const max = Math.max(...data.map(d => d.m + d.t + d.c));
  const H = 280;
  const W = 100; // virtual width per bar — we use flex

  // Y axis ticks
  const ticks = [0, 5, 10, 15, 20];

  return (
    <Card pad={28}>
      <CardHeader
        eyebrow="Weekly watch · last 12 weeks"
        title={<>Hours, <em style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>stacked by mode</em></>}
        right={
          <div style={{ display: "flex", gap: 18, fontSize: 11 }}>
            <Legend swatch="var(--together)" label="Together" />
            <Legend swatch="var(--maya)" label="Tav" />
            <Legend swatch="var(--theo)" label="Dee" />
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 16 }}>
        <div style={{ position: "relative", height: H }}>
          {ticks.map(t => (
            <div key={t} style={{
              position: "absolute", right: 0, bottom: (t / max) * H - 6,
              fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-mute)",
            }}>{t}h</div>
          ))}
        </div>
        <div style={{ position: "relative", height: H, borderBottom: "1px solid var(--line-2)" }}>
          {/* gridlines */}
          {ticks.map(t => (
            <div key={t} style={{
              position: "absolute", left: 0, right: 0, bottom: (t / max) * H,
              height: 1, background: "var(--line)",
            }} />
          ))}
          {/* bars */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 10, paddingRight: 4 }}>
            {data.map((d, i) => {
              const total = d.m + d.t + d.c;
              const isLast = i === data.length - 1;
              const cH = (d.c / max) * H;
              const mH = (d.m / max) * H;
              const tH = (d.t / max) * H;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 1, position: "relative" }}>
                  {isLast && (
                    <div style={{
                      position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)",
                      fontFamily: "var(--mono)", fontSize: 11, color: "var(--together)",
                      whiteSpace: "nowrap",
                    }}>{total.toFixed(1)}h ↓</div>
                  )}
                  <div title={`Dee solo ${d.t}h`} style={{ height: tH, background: "var(--theo)", opacity: isLast ? 1 : 0.85 }} />
                  <div title={`Tav solo ${d.m}h`} style={{ height: mH, background: "var(--maya)", opacity: isLast ? 1 : 0.85 }} />
                  <div title={`Together ${d.c}h`}  style={{ height: cH, background: "var(--together)", opacity: isLast ? 1 : 0.85 }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* x labels */}
      <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 16, marginTop: 8 }}>
        <div />
        <div style={{ display: "flex", gap: 10, paddingRight: 4 }}>
          {data.map((d, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center",
              fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-mute)",
              letterSpacing: ".02em",
            }}>{d.wk}</div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Legend({ swatch, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink-dim)" }}>
      <span style={{ width: 10, height: 10, background: swatch, display: "inline-block" }} />
      <span style={{ letterSpacing: ".06em", textTransform: "uppercase", fontSize: 10, fontFamily: "var(--mono)" }}>{label}</span>
    </span>
  );
}

// ---------- now watching ----------

function NowWatching() {
  return (
    <Card pad={28}>
      <CardHeader
        eyebrow="On the queue · 4 active"
        title={<>Now watching</>}
        right={<a href="#" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-dim)", textDecoration: "none", letterSpacing: ".08em" }}>VIEW ALL →</a>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {BINGE.NOW_WATCHING.map(s => <ShowCard key={s.id} s={s} />)}
      </div>
    </Card>
  );
}

function ShowCard({ s }) {
  const pct = (s.ep / s.total) * 100;
  return (
    <div style={{
      border: "1px solid var(--line)",
      background: "var(--panel-2)",
      padding: 18,
      borderRadius: 2,
      display: "flex",
      gap: 16,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        width: 64, height: 92, flexShrink: 0,
        background: `linear-gradient(155deg, ${s.cover}, color-mix(in oklab, ${s.cover}, black 40%))`,
        border: "1px solid var(--line-2)",
        position: "relative",
        display: "grid", placeItems: "center",
      }}>
        <span className="serif" style={{ fontStyle: "italic", fontSize: 28, color: "rgba(255,255,255,0.8)" }}>{s.glyph}</span>
        <div style={{
          position: "absolute", top: 6, right: 6,
          fontFamily: "var(--mono)", fontSize: 9, color: "rgba(255,255,255,0.5)",
          letterSpacing: ".08em",
        }}>S{s.season}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 className="serif" title={s.title} style={{
          margin: 0, fontSize: 21, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {s.title}
        </h4>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 8 }}>
          <ModeLabel mode={s.mode} />
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", whiteSpace: "nowrap" }}>S{s.season}·E{s.ep}/{s.total}</span>
        </div>
        <div style={{ marginTop: 14, height: 4, background: "var(--line)", borderRadius: 2, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: s.accent }} />
          {/* episode pips */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", justifyContent: "space-between",
            paddingTop: -2,
          }}>
            {Array.from({ length: s.total - 1 }).map((_, i) => (
              <div key={i} style={{
                width: 1, height: 4, background: "var(--bg)",
                marginLeft: i === 0 ? `${100 / s.total}%` : 0,
                visibility: "hidden", /* using flex instead */
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".06em" }}>
            {s.nextAt.toUpperCase()}
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>
            ~{(s.runtime * (s.total - s.ep))}m left
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- co-watch ring ----------

function CoWatchRing() {
  const cur = BINGE.CURRENT_WEEK;
  const total = cur.m + cur.t + cur.c;
  const segs = [
    { k: "together", v: cur.c, c: "var(--together)" },
    { k: "M", v: cur.m, c: "var(--maya)" },
    { k: "T", v: cur.t, c: "var(--theo)" },
  ];
  const R = 80, C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <Card pad={28}>
      <CardHeader eyebrow="Time together" title={<>Co-watch ratio</>} />
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <svg width="190" height="190" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--line)" strokeWidth="22" />
          {segs.map((s, i) => {
            const frac = s.v / total;
            const len = frac * C;
            const offset = -acc * C;
            acc += frac;
            return (
              <circle key={s.k}
                cx="100" cy="100" r={R} fill="none"
                stroke={s.c} strokeWidth="22"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={offset}
                transform="rotate(-90 100 100)"
              />
            );
          })}
          <text x="100" y="98" textAnchor="middle"
            style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 44, fill: "var(--ink)" }}>
            {Math.round((cur.c / total) * 100)}%
          </text>
          <text x="100" y="118" textAnchor="middle"
            style={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--ink-mute)", letterSpacing: "0.12em" }}>
            TOGETHER
          </text>
        </svg>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {segs.map(s => (
            <div key={s.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <span><ModeDot mode={s.k === "together" ? "together" : s.k} /> <span style={{ fontSize: 12, color: "var(--ink-dim)", marginLeft: 6, letterSpacing: ".06em", textTransform: "uppercase", fontFamily: "var(--mono)" }}>
                {s.k === "together" ? "Together" : s.k === "M" ? "Tav solo" : "Dee solo"}
              </span></span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>
                {s.v.toFixed(1)}h <span style={{ color: "var(--ink-mute)", fontSize: 10 }}>· {Math.round((s.v / total) * 100)}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------- genre stacked bar ----------

function GenreCard() {
  return (
    <Card pad={28}>
      <CardHeader eyebrow="Quarterly mix" title={<>Genre <em style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>diet</em></>} />
      <div style={{
        display: "flex", height: 14, marginBottom: 18,
        border: "1px solid var(--line-2)",
      }}>
        {BINGE.GENRES.map(g => (
          <div key={g.name} title={`${g.name} · ${g.pct}%`} style={{
            width: `${g.pct}%`, background: g.hex,
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {BINGE.GENRES.map(g => (
          <div key={g.name} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-dim)", fontSize: 12 }}>
              <span style={{ width: 8, height: 8, background: g.hex, display: "inline-block" }} />
              {g.name}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>{g.pct}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- heatmap ----------

function HeatmapCard() {
  const data = BINGE.HEATMAP;
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const palette = [
    "rgba(244, 237, 226, 0.06)",
    "rgba(240, 194, 74, 0.32)",
    "rgba(240, 194, 74, 0.58)",
    "rgba(240, 194, 74, 0.82)",
    "rgba(240, 194, 74, 1.00)",
  ];

  return (
    <Card pad={28}>
      <CardHeader
        eyebrow="Episode calendar · 12 weeks × 7 days"
        title={<>Every night a <em style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>session</em></>}
        right={
          <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 10, color: "var(--ink-mute)", fontFamily: "var(--mono)", letterSpacing: ".06em" }}>
            FEWER
            {palette.map((p, i) => <span key={i} style={{ width: 12, height: 12, background: p, border: "1px solid var(--line)" }} />)}
            MORE
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 6, alignItems: "start" }}>
        <div style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 4, marginTop: 0 }}>
          {dayLabels.map((d, i) => (
            <div key={i} style={{
              fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-mute)",
              textAlign: "right", paddingRight: 4, height: 22, display: "flex", alignItems: "center", justifyContent: "flex-end",
            }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 4 }}>
          {data.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 4 }}>
              {week.map((v, di) => (
                <div key={di} title={`${v} episode${v === 1 ? "" : "s"}`} style={{
                  height: 22, background: palette[v],
                  border: "1px solid var(--line)",
                  borderRadius: 1,
                }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "24px 1fr", gap: 6, marginTop: 8,
      }}>
        <div />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.length}, 1fr)`, gap: 4 }}>
          {BINGE.WEEKLY.map((w, i) => (
            <div key={i} style={{
              fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-mute)",
              textAlign: "center", letterSpacing: ".02em",
            }}>{w.wk.split(" ")[1]}</div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------- leaderboard ----------

function Leaderboard() {
  const max = Math.max(...BINGE.LEADERBOARD.map(x => x.hrs));
  return (
    <Card pad={28}>
      <CardHeader eyebrow="All-time" title={<>Most-watched <em style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>shows</em></>} />
      <div>
        {BINGE.LEADERBOARD.map((s, i) => (
          <div key={s.title} style={{
            display: "grid", gridTemplateColumns: "22px 1fr auto",
            gap: 14, alignItems: "center",
            padding: "12px 0", borderBottom: i < BINGE.LEADERBOARD.length - 1 ? "1px solid var(--line)" : "none",
          }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>0{i + 1}</span>
            <div style={{ minWidth: 0 }}>
              <div className="serif" style={{
                fontSize: 18, fontStyle: "italic", lineHeight: 1.1, marginBottom: 4,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{s.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 3, background: "var(--line)", position: "relative", minWidth: 0 }}>
                  <div style={{
                    height: "100%", width: `${(s.hrs / max) * 100}%`,
                    background: s.mode === "together" ? "var(--together)" : s.mode === "M" ? "var(--maya)" : "var(--theo)",
                  }} />
                </div>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", whiteSpace: "nowrap" }}>{s.year} · {s.eps} ep</span>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 15, textAlign: "right", fontWeight: 500, whiteSpace: "nowrap" }}>{s.hrs.toFixed(1)}h</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ---------- recent log ----------

function RecentLog() {
  return (
    <Card pad={28}>
      <CardHeader
        eyebrow="Session log · last 48 hours"
        title={<>The <em style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>tape</em></>}
        right={<a href="#" style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-dim)", textDecoration: "none", letterSpacing: ".08em" }}>EXPORT CSV ↗</a>}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--line-2)" }}>
            {["When", "Show", "Episode", "Title", "Runtime", "Watched"].map(h => (
              <th key={h} className="mono" style={{
                textAlign: h === "Runtime" ? "right" : "left",
                fontWeight: 400, fontSize: 10, color: "var(--ink-mute)",
                letterSpacing: ".1em", padding: "10px 0",
                textTransform: "uppercase",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BINGE.RECENT_LOG.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--line)" }}>
              <td className="mono" style={{ fontSize: 12, color: "var(--ink-dim)", padding: "12px 0" }}>{r.when}</td>
              <td className="serif" style={{ fontSize: 17, fontStyle: "italic", padding: "12px 12px 12px 0" }}>{r.show}</td>
              <td className="mono" style={{ fontSize: 11, color: "var(--ink-dim)", padding: "12px 12px 12px 0" }}>{r.ep}</td>
              <td style={{ fontSize: 13, color: "var(--ink)", padding: "12px 12px 12px 0" }}>{r.title}</td>
              <td className="mono" style={{ fontSize: 12, color: "var(--ink-dim)", textAlign: "right", padding: "12px 0" }}>{r.runtime}m</td>
              <td style={{ padding: "12px 0 12px 16px" }}><ModeLabel mode={r.who} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ---------- footer ----------

function Footer() {
  return (
    <footer style={{
      padding: "40px 40px 56px",
      borderTop: "1px solid var(--line)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      color: "var(--ink-mute)", fontSize: 11, fontFamily: "var(--mono)", letterSpacing: ".06em",
      textTransform: "uppercase",
    }}>
      <span>Binge Ledger · synced from Plex, Netflix, Max, AppleTV+ · last 14s ago</span>
      <span>v 1.4.0 · couch № 1, blanket № 2</span>
    </footer>
  );
}

Object.assign(window, {
  Card, CardHeader, TopBar, Hero, StatStrip,
  WeeklyChart, NowWatching, CoWatchRing, GenreCard,
  HeatmapCard, Leaderboard, RecentLog, Footer,
  ModeDot, ModeLabel,
});
