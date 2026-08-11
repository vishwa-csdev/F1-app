import { useState, useEffect } from 'react';
import F1 from '../api';
import { teamColor, formatDate } from '../constants';
import { Loader, ErrorBox, Card, SectionLabel, Avatar, BackButton } from '../components/UI';
import { BarChart } from '../components/Charts';

export default function DriverDetail({ driver, onBack }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const c = teamColor(driver.team_id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const h = await F1.driverSeasonHistory(driver.driver_id);
        if (!cancelled) setHistory(h);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [driver.driver_id]);

  const chartData = history.slice().reverse().map(r => ({
    label: r.race_name?.replace(' Grand Prix', '')?.slice(0, 3) || '',
    value: parseFloat(r.points) || 0,
  }));

  const podiums = history.filter(r => {
    const p = parseInt(r.position);
    return !isNaN(p) && p <= 3;
  }).length;

  return (
    <div>
      <BackButton onClick={onBack} />
      <ErrorBox msg={error} />

      {/* Driver Header Hero */}
      <Card
        className="animate-in"
        style={{
          background: `linear-gradient(135deg, ${c}15 0%, rgba(17,17,20,0.9) 100%)`,
          borderColor: `${c}33`,
        }}
      >
        <div className="driver-hero">
          <Avatar num={driver.number} color={c} size="xl" />
          <div>
            <div className="driver-hero-name">{driver.driver_name}</div>
            <div className="driver-hero-team" style={{ color: c }}>
              {driver.team_name}
            </div>
            <div className="driver-hero-nationality">{driver.nationality}</div>
          </div>
        </div>
      </Card>

      {/* Key Stats Row */}
      <Card className="animate-in" style={{ animationDelay: '0.05s' }}>
        <div className="stats-grid stats-grid-4">
          {[
            [`P${driver.position}`, 'Rank', c],
            [driver.points, 'Points', 'var(--text-primary)'],
            [driver.wins, 'Wins', 'var(--gold)'],
            [podiums, 'Podiums', 'var(--silver)'],
          ].map(([v, l, col]) => (
            <div className="stat-item" key={l}>
              <div className="stat-value" style={{ color: col }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chart & History */}
      {loading ? (
        <Loader text="Loading season results…" />
      ) : (
        <>
          {chartData.length > 0 && (
            <Card className="animate-in" style={{ animationDelay: '0.1s' }}>
              <SectionLabel>Points per race</SectionLabel>
              <BarChart data={chartData} color={c} />
            </Card>
          )}

          <Card className="animate-in" style={{ animationDelay: '0.15s' }}>
            <SectionLabel>Season Results</SectionLabel>
            {history.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-md)' }}>
                No race history available yet
              </div>
            ) : (
              history.map((r, i) => {
                const pos = parseInt(r.position);
                const posColor = pos === 1 ? 'var(--gold)' : pos <= 3 ? 'var(--silver)' : pos <= 10 ? c : 'var(--text-muted)';
                return (
                  <div className="race-history-row" key={i}>
                    <div className="race-pos-badge" style={{ color: posColor }}>
                      {isNaN(pos) ? r.status?.slice(0, 3) || '—' : `P${pos}`}
                    </div>
                    <div className="race-info">
                      <div className="race-name">
                        {r.race_name?.replace(' Grand Prix', ' GP')}
                      </div>
                      <div className="race-circuit">{r.circuit} · {formatDate(r.date)}</div>
                    </div>
                    <div className="race-result">
                      <div className="race-pts" style={{ color: r.points > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {r.points} pts
                      </div>
                      <div className="race-grid">Grid {r.grid || '—'}</div>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </>
      )}
    </div>
  );
}
