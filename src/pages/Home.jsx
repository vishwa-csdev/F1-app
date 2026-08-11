import { useState, useEffect } from 'react';
import F1 from '../api';
import { teamColor, formatDate, countdownStr, positionColor } from '../constants';
import { Loader, ErrorBox, Card, SectionLabel, Avatar, Badge } from '../components/UI';

export default function Home({ onNav }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverStandings, setDS] = useState([]);
  const [constructorStandings, setCS] = useState([]);
  const [lastRace, setLR] = useState(null);
  const [nextRace, setNR] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [ds, cs, lr, nr] = await Promise.all([
          F1.driverStandings(),
          F1.constructorStandings(),
          F1.lastRaceResults(),
          F1.nextRace(),
        ]);
        if (cancelled) return;
        setDS(ds.slice(0, 10));
        setCS(cs.slice(0, 6));
        setLR(lr);
        setNR(nr);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader text="Loading season data…" />;

  const maxPts = parseInt(constructorStandings[0]?.points || 1);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="home-grid">
      <ErrorBox msg={error} />

      {/* Next Race */}
      {nextRace && (
        <Card className="next-race-card full-width animate-in">
          <SectionLabel>Next Race</SectionLabel>
          <div className="next-race-name">{nextRace.race_name}</div>
          <div className="next-race-details">
            {nextRace.circuit_name} · {nextRace.country} · {formatDate(nextRace.date)}
          </div>
          <div className="next-race-countdown">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M8 4.5V8L10.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {countdownStr(nextRace.date + 'T' + (nextRace.time || '14:00:00Z'))}
          </div>
        </Card>
      )}

      {/* Last Race Podium */}
      {lastRace && (
        <Card className="full-width animate-in" style={{ animationDelay: '0.05s' }}>
          <SectionLabel>Last Race · {lastRace.race_name}</SectionLabel>
          <div className="podium-grid">
            {/* Show P2, P1, P3 for visual podium effect */}
            {[1, 0, 2].map(idx => {
              const r = lastRace.results?.[idx];
              if (!r) return <div key={idx} />;
              const c = teamColor(r.team_id);
              return (
                <div
                  key={idx}
                  className={`podium-card ${idx === 0 ? 'p1' : ''}`}
                  style={{ borderColor: `${c}33` }}
                >
                  <div className="podium-medal">{medals[idx]}</div>
                  <div className="podium-name" style={{ color: c }}>
                    {r.family_name || r.driver_name?.split(' ').pop()}
                  </div>
                  <div className="podium-team">{r.team_name}</div>
                  <div className="podium-points">{r.points} pts</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Driver Standings */}
      <Card className="animate-in" style={{ animationDelay: '0.1s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <SectionLabel>Drivers</SectionLabel>
          <button className="link-btn" onClick={() => onNav('drivers')}>
            View All →
          </button>
        </div>
        {driverStandings.slice(0, 5).map((d, i) => {
          const c = teamColor(d.team_id);
          return (
            <div className="standing-row" key={d.driver_id}>
              <div className="standing-pos" style={{ color: positionColor(d.position) }}>
                {d.position}
              </div>
              <Avatar num={d.number} color={c} size="sm" />
              <div className="standing-info">
                <div className="standing-name">{d.driver_name}</div>
                <div className="standing-team" style={{ color: c }}>{d.team_name}</div>
              </div>
              <div className="standing-points">{d.points}</div>
            </div>
          );
        })}
      </Card>

      {/* Constructor Standings */}
      <Card className="animate-in" style={{ animationDelay: '0.15s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <SectionLabel>Constructors</SectionLabel>
          <button className="link-btn" onClick={() => onNav('teams')}>
            View All →
          </button>
        </div>
        {constructorStandings.map((t, i) => {
          const c = teamColor(t.team_id);
          const pct = (parseInt(t.points) / maxPts) * 100;
          return (
            <div key={t.team_id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 'var(--font-size-sm)' }}>
                <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: positionColor(t.position), fontWeight: 800, fontSize: 'var(--font-size-xs)' }}>
                    {t.position}
                  </span>
                  <span style={{ fontWeight: 700 }}>{t.team_name}</span>
                </span>
                <span style={{ fontWeight: 900 }}>{t.points}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
              </div>
            </div>
          );
        })}
      </Card>

      {/* Quick Nav */}
      <Card
        className="full-width animate-in"
        style={{ animationDelay: '0.2s', cursor: 'pointer' }}
        onClick={() => onNav('race')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--accent-soft)', border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>
            🏁
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>Live Race View</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              Leaderboard, lap times, weather & telemetry
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--text-muted)">
            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Card>
    </div>
  );
}
