import { useState, useEffect } from 'react';
import F1 from '../api';
import { teamColor, positionColor } from '../constants';
import { Loader, ErrorBox, Card, SectionLabel, Avatar, Badge } from '../components/UI';

export default function Drivers({ onSelect }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const ds = await F1.driverStandings();
        if (!cancelled) setStandings(ds);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <Loader text="Loading drivers…" />;

  return (
    <div>
      <ErrorBox msg={error} />
      <SectionLabel>{new Date().getFullYear()} Driver Championship</SectionLabel>
      {standings.map((d, i) => {
        const c = teamColor(d.team_id);
        return (
          <Card
            key={d.driver_id}
            className="animate-in"
            style={{ animationDelay: `${i * 0.03}s` }}
            onClick={() => onSelect(d)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <div style={{
                fontWeight: 900, fontSize: 'var(--font-size-xl)',
                color: positionColor(d.position),
                width: 30, textAlign: 'center', flexShrink: 0
              }}>
                {d.position}
              </div>
              <Avatar num={d.number} color={c} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-base)' }}>
                  {d.driver_name}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: c, fontWeight: 600, marginTop: 2 }}>
                  {d.team_name}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <Badge color={c}>{d.points} PTS</Badge>
                  {parseInt(d.wins) > 0 && (
                    <Badge color="var(--gold)">{d.wins} WIN{parseInt(d.wins) > 1 ? 'S' : ''}</Badge>
                  )}
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M6 3L11 8L6 13" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
