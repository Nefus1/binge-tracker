export function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function SectionHeader({ title, eyebrow, action }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h3>{title}</h3>
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {action}
    </div>
  );
}

export function ViewerBadge({ viewer, settings }) {
  const people = Object.fromEntries(settings.people.map((person) => [person.id, person]));
  const label = viewer === "together" ? "Together" : people[viewer]?.name ?? viewer;
  const color = viewer === "together" ? settings.togetherColor : people[viewer]?.color;
  return (
    <span className="viewer-badge" style={{ "--viewer-color": color }}>
      {label}
    </span>
  );
}
