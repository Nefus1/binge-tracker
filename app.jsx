// Binge Ledger — main app
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mayaColor": "#e8623c",
  "theoColor": "#4ec9b0",
  "togetherColor": "#f0c24a",
  "grain": true,
  "density": "cozy"
}/*EDITMODE-END*/;

function App() {
  const [range, setRange] = useState("7D");
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // apply tweaks to css vars
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--maya", t.mayaColor);
    r.setProperty("--theo", t.theoColor);
    r.setProperty("--together", t.togetherColor);
    document.body.style.setProperty("--grain-opacity", t.grain ? "0.5" : "0");
    // toggle grain via body class
    if (t.grain) document.body.classList.remove("no-grain");
    else document.body.classList.add("no-grain");
  }, [t.mayaColor, t.theoColor, t.togetherColor, t.grain]);

  const pad = t.density === "compact" ? "0 32px" : "0 40px";

  return (
    <div data-screen-label="01 Dashboard" style={{ maxWidth: 1480, margin: "0 auto" }}>
      <TopBar range={range} setRange={setRange} />
      <Hero range={range} />
      <StatStrip />

      <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        <WeeklyChart />
        <CoWatchRing />

        <NowWatching />
        <GenreCard />

        <div style={{ gridColumn: "1 / -1" }}>
          <HeatmapCard />
        </div>

        <Leaderboard />
        <Card pad={28}>
          <CardHeader eyebrow="Recently finished · 2024–25" title={<>Closed <em style={{ fontStyle: "italic", color: "var(--ink-dim)" }}>cases</em></>} />
          <div>
            {BINGE.RECENT_FINISHES.map((s, i) => (
              <div key={s.title} style={{
                display: "grid", gridTemplateColumns: "1fr 60px 50px",
                alignItems: "baseline", padding: "14px 0",
                borderBottom: i < BINGE.RECENT_FINISHES.length - 1 ? "1px solid var(--line)" : "none",
                gap: 12,
              }}>
                <div>
                  <div className="serif" style={{ fontSize: 18, fontStyle: "italic" }}>{s.title}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, alignItems: "center" }}>
                    <ModeLabel mode={s.mode} />
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".06em" }}>
                      · {s.eps} EP · {s.year}
                    </span>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 13, color: "var(--ink-dim)", textAlign: "right" }}>{s.hrs.toFixed(1)}h</div>
                <div style={{ textAlign: "right" }}>
                  <span className="mono" style={{
                    fontSize: 11, color: "var(--together)",
                    border: "1px solid var(--together)",
                    padding: "2px 6px", letterSpacing: ".06em",
                  }}>★ {s.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ gridColumn: "1 / -1" }}>
          <RecentLog />
        </div>
      </div>

      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent colors">
          <TweakColor
            label="Tav"
            value={t.mayaColor}
            onChange={v => setTweak("mayaColor", v)}
            options={["#e8623c", "#d04848", "#e4a04a", "#c87aa8", "#7ab9d4"]}
          />
          <TweakColor
            label="Dee"
            value={t.theoColor}
            onChange={v => setTweak("theoColor", v)}
            options={["#4ec9b0", "#7aa86e", "#5a9ed9", "#9c7cd6", "#d4b35a"]}
          />
          <TweakColor
            label="Together (gold)"
            value={t.togetherColor}
            onChange={v => setTweak("togetherColor", v)}
            options={["#f0c24a", "#e8623c", "#f4ede2", "#c8a868", "#a07cd6"]}
          />
        </TweakSection>
        <TweakSection label="Surface">
          <TweakToggle
            label="Film grain"
            value={t.grain}
            onChange={v => setTweak("grain", v)}
          />
          <TweakRadio
            label="Density"
            value={t.density}
            options={["cozy", "compact"]}
            onChange={v => setTweak("density", v)}
          />
        </TweakSection>
      </TweaksPanel>

      <style>{`
        body.no-grain::before { display: none !important; }
      `}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
