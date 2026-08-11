export function Loader({ text = 'Loading…' }) {
  return (
    <div className="loader">
      <div className="loader-spinner" />
      <div className="loader-text">{text}</div>
    </div>
  );
}

export function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div className="error-box">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
      {msg}
    </div>
  );
}

export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      className={`card ${onClick ? 'clickable' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

export function Avatar({ num, color, size = 'md' }) {
  const bg = `${color}15`;
  return (
    <div
      className={`avatar ${size}`}
      style={{ background: bg, border: `2px solid ${color}`, color }}
    >
      {num ?? '?'}
    </div>
  );
}

export function Badge({ children, color, style = {} }) {
  return (
    <span
      className="badge"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}40`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function BackButton({ onClick }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

export function TyreDot({ compound, color, label }) {
  return (
    <div
      className="tyre-dot"
      style={{ borderColor: color, color }}
      title={compound}
    >
      {label}
    </div>
  );
}
