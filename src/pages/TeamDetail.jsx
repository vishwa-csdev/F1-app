import { useState, useEffect } from 'react';
import F1 from '../api';
import { teamColor, positionColor } from '../constants';
import { Loader, ErrorBox, Card, SectionLabel, Avatar, BackButton } from '../components/UI';

export default function TeamDetail({ team, onBack }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const c = teamColor(team.team_id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const all = await F1.driverStandings();
        if (!cancelled && Array.isArray(all)) {
          const matched = all.filter(d =>
            d.team_id === team.team_id ||
            d.team_name?.toLowerCase().includes(team.team_name?.toLowerCase().split(' ')[0])
          );
          setDrivers(matched);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [team.team_id, team.team_name]);

  const totalPts = Math.max(parseInt(team.points) || 1, 1);

  return (
    <div>
      <BackButton onClick={onBack} />
      <ErrorBox msg={error} />

      {/* Team Hero */}
      <Card
        className="animate-in"
        style={{
          background: `linear-gradient(135deg, ${c}15 0%, rgba(17,17,20,0.9) 100%)`,
          borderColor: `${c}33`,
        }}
      >
        <div className="team-hero">
          <div className="team-hero-bars">
            <div className="team-hero-bar" style={{ width: 6, height: 48, background: c }} />
            <div className="team-hero-bar" style={{ width: 3, height: 48, background: `${c}55` }} />
          </div>
          <div style={{ marginLeft: 'var(--space-md)' }}>
            <div className="team-hero-name">{team.team_name}</div>
            <div className="team-hero-nationality">{team.nationality}</div>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <Card className="animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="stats-grid stats-grid-3">
          {[
            [`P${team.position}`, 'Championship Rank', c],
            [team.points, 'Total Points', 'var(--text-primary)'],
            [team.wins, 'Race Wins', 'var(--gold)'],
          ].map(([v, l, col]) => (
            <div className="stat-item" key={l}>
              <div className="stat-value" style={{ color: col }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </Card>

      {loading ? (
        <Loader text="Loading driver lineup…" />
      ) : (
        <>
          {/* Driver Contribution Split */}
          {drivers.length > 0 && (
            <Card className="animate-in" style={{ animationDelay: '0.1s' }}>
              <SectionLabel>Points Distribution</SectionLabel>
              {drivers.map((d, idx) => {
                const pts = parseInt(d.points) || 0;
                const pct = ((pts / totalPts) * 100).toFixed(0);
                return (
                  <div className="split-row" key={d.driver_id}>
                    <div className="split-header">
                      <span className="split-name">{d.driver_name}</span>
                      <span className="split-pts">{d.points} pts</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${(pts / totalPts) * 100}%`,
                          background: idx === 0 ? c : `${c}88`,
                        }}
                      />
                    </div>
                    <div className="split-pct">{pct}% of constructor total</div>
                  </div>
                );
              })}
            </Card>
          )}

          {/* Driver Lineup Cards */}
          <SectionLabel>Drivers</SectionLabel>
          {drivers.map((d, i) => (
            <Card
              key={d.driver_id}
              className="animate-in"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              <div className="standing-row">
                <Avatar num={d.number} color={c} size="lg" />
                <div className="standing-info" style={{ marginLeft: 'var(--space-sm)' }}>
                  <div className="standing-name">{d.driver_name}</div>
                  <div className="standing-team">{d.nationality}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="standing-points" style={{ color: c }}>{d.points} PTS</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    P{d.position} in WDC
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
