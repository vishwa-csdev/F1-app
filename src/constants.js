// ─── TEAM COLORS (2026 Season Grid) ───────────────────────────────────────────

export const TEAM_COLORS = {
  mercedes:     '#27F4D2',
  ferrari:      '#E8002D',
  mclaren:      '#FF8000',
  red_bull:     '#3671C6',
  rb:           '#6692FF',
  alpine:       '#FF87BC',
  aston_martin: '#229971',
  williams:     '#64C4FF',
  haas:         '#B6BABD',
  audi:         '#52E252',
  cadillac:     '#C0A44D',
  sauber:       '#52E252',
  kick_sauber:  '#52E252',
  visa_cash_app_rb: '#6692FF',
};

/**
 * Fuzzy-match a constructor ID or team name to a team color.
 */
export function teamColor(id = '') {
  if (!id) return '#888888';
  const key = id.toLowerCase().replace(/[\s\-]/g, '_');
  for (const [k, v] of Object.entries(TEAM_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return '#888888';
}

/**
 * Get team color from OpenF1 hex colour field (comes without #).
 */
export function teamColorHex(hex, fallbackId) {
  if (hex) return `#${hex.replace('#', '')}`;
  return teamColor(fallbackId);
}

// ─── TYRE COMPOUNDS ───────────────────────────────────────────────────────────

export const TYRE_COMPOUNDS = {
  SOFT:         { color: '#E8002D', label: 'S', name: 'Soft' },
  MEDIUM:       { color: '#FFC72C', label: 'M', name: 'Medium' },
  HARD:         { color: '#FFFFFF', label: 'H', name: 'Hard' },
  INTERMEDIATE: { color: '#43B02A', label: 'I', name: 'Inter' },
  WET:          { color: '#0072C6', label: 'W', name: 'Wet' },
  UNKNOWN:      { color: '#888888', label: '?', name: 'Unknown' },
};

export function getTyre(compound = '') {
  return TYRE_COMPOUNDS[compound?.toUpperCase()] || TYRE_COMPOUNDS.UNKNOWN;
}

// ─── FORMATTING UTILITIES ─────────────────────────────────────────────────────

export function lapTimeStr(secs) {
  if (!secs || secs <= 0) return '—';
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(3).padStart(6, '0');
  return m > 0 ? `${m}:${s}` : `${s}s`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function ordinal(n) {
  const num = parseInt(n);
  if (isNaN(num)) return n;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function countdownStr(targetDate) {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;
  if (diff <= 0) return 'Now';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

// Position medal colors
export function positionColor(pos) {
  const p = parseInt(pos);
  if (p === 1) return '#FFD700';
  if (p === 2) return '#C0C0C0';
  if (p === 3) return '#CD7F32';
  return '#555';
}
