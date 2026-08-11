import { lapTimeStr } from '../constants';

export function BarChart({ data, color }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(100 / data.length - 1, 2);

  return (
    <svg
      width="100%"
      viewBox={`0 0 300 100`}
      style={{ display: 'block' }}
      preserveAspectRatio="none"
    >
      {data.map((d, i) => {
        const x = (i / data.length) * 300;
        const w = (300 / data.length) - 2;
        const h = Math.max((d.value / max) * 70, d.value > 0 ? 3 : 1);
        const y = 78 - h;
        return (
          <g key={i}>
            <rect
              x={x + 1}
              y={y}
              width={Math.max(w, 2)}
              height={h}
              rx={2}
              fill={d.value > 0 ? color : 'rgba(255,255,255,0.04)'}
              opacity={0.85}
            >
              <title>{d.label}: {d.value} pts</title>
            </rect>
            <text
              x={x + w / 2 + 1}
              y={94}
              fontSize={7}
              fill="var(--text-muted)"
              textAnchor="middle"
              transform={`rotate(-45, ${x + w / 2 + 1}, 94)`}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LapChart({ laps, color }) {
  if (!laps?.length) return null;
  const times = laps.map(l => l.lap_duration);
  const min = Math.min(...times);
  const max = Math.max(...times);
  const range = max - min || 1;
  const W = 320, H = 80, px = 12, py = 12;

  const points = times.map((t, i) => {
    const x = px + (i / Math.max(times.length - 1, 1)) * (W - px * 2);
    const y = py + ((t - min) / range) * (H - py * 2);
    return { x, y, t };
  });

  const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaStr = `M${px},${H} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L${W - px},${H} Z`;

  const bestIdx = times.indexOf(min);
  const bestPt = points[bestIdx];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`lg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.5, 1].map(f => (
        <line
          key={f}
          x1={px} y1={py + f * (H - py * 2)}
          x2={W - px} y2={py + f * (H - py * 2)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      ))}

      {/* Area fill */}
      <path d={areaStr} fill={`url(#lg-${color.replace('#','')})`} />

      {/* Line */}
      <path
        d={pathStr}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Best lap marker */}
      <circle
        cx={bestPt.x} cy={bestPt.y}
        r={4}
        fill="var(--gold)"
        stroke="var(--bg-app)"
        strokeWidth={1.5}
      />
      <text
        x={bestPt.x} y={bestPt.y - 8}
        fontSize={8}
        fill="var(--gold)"
        textAnchor="middle"
        fontWeight="700"
      >
        Best
      </text>

      {/* Labels */}
      <text x={px} y={H + 16} fontSize={9} fill={color} fontWeight="600">
        {lapTimeStr(min)}
      </text>
      <text x={W - px} y={H + 16} fontSize={9} fill="var(--text-muted)" textAnchor="end">
        L{laps[laps.length - 1]?.lap_number}
      </text>
    </svg>
  );
}
