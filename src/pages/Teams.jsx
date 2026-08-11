import { useState, useEffect } from 'react';
import F1 from '../api';
import { teamColor, positionColor } from '../constants';
import { Loader, ErrorBox, Card, SectionLabel, Badge } from '../components/UI';

export default function Teams({ onSelect }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cs = await F1.constructorStandings();
        if (!cancelled) setStandings(cs);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader text="Loading constructor standings…" />;
  const maxPts = parseInt(standings[0]?.points || 1);

  return (
    <div>
      <ErrorBox msg={error} />
      <SectionLabel>{new Date().getFullYear()} Constructor Championship</SectionLabel>
      {standings.map((t, i) => {
        const c = teamColor(t.team_id);
        const pct = (parseInt(t.points) / maxPts) * 100;
        return (
          <Card
            key={t.team_id}
            className="animate-in"
            style={{ animationDelay: `${i * 0.03}s` }}
            onClick={() => onSelect(t)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div style={{
                fontWeight: 900, fontSize: 'var(--font-size-xl)',
                color: positionColor(t.position),
                width: 30, textAlign: 'center', flexShrink: 0
              }}>
                {t.position}
              </div>
              <div style={{ width: 4, height: 40, borderRadius: 2, background: c, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)' }}>{t.team_name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{t.nationality}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 900, fontSize: 'var(--font-size-xl)' }}>{t.points}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5 }}>PTS</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
              </div>
              {parseInt(t.wins) > 0 && (
                <Badge color="var(--gold)">{t.wins} WIN{parseInt(t.wins) > 1 ? 'S' : ''}</Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
