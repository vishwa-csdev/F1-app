import { useState, useEffect, useCallback } from 'react';
import F1 from '../api';
import { teamColorHex, teamColor, getTyre, positionColor, lapTimeStr } from '../constants';
import { usePolling } from '../hooks';
import { Loader, ErrorBox, Card, SectionLabel, TyreDot } from '../components/UI';
import { LapChart } from '../components/Charts';

export default function Race() {
  const [session, setSession] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [weather, setWeather] = useState(null);
  const [rcMessages, setRcMessages] = useState([]);
  const [selDriver, setSelDriver] = useState(null);
  const [laps, setLaps] = useState([]);
  const [lapsLoading, setLapsLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Initial load: get latest session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitLoading(true);
      setError(null);
      try {
        const sess = await F1.latestSession();
        if (cancelled) return;
        if (!sess) {
          setError('No race session found');
          setInitLoading(false);
          return;
        }
        setSession(sess);

        // Check if session is live
        const now = new Date();
        const start = new Date(sess.date_start);
        const end = new Date(sess.date_end);
        setIsLive(now >= start && now <= end);

        // Fetch initial data
        const [lb, wx, rc] = await Promise.all([
          F1.raceLeaderboard(sess.session_key),
          F1.weatherData(sess.session_key),
          F1.raceControlMessages(sess.session_key).catch(() => []),
        ]);
        if (cancelled) return;
        if (Array.isArray(lb)) setLeaderboard(lb);
        if (wx) setWeather(wx);
        if (Array.isArray(rc)) setRcMessages(rc.slice(-10).reverse());
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
      if (!cancelled) setInitLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Polling for live data
  const pollFn = useCallback(async () => {
    if (!session?.session_key) return null;
    const [lb, wx] = await Promise.all([
      F1.raceLeaderboard(session.session_key),
      F1.weatherData(session.session_key),
    ]);
    if (Array.isArray(lb)) setLeaderboard(lb);
    if (wx) setWeather(wx);
    return lb;
  }, [session?.session_key]);

  usePolling(pollFn, 8000, isLive && !!session);

  // Load laps for selected driver
  useEffect(() => {
    if (!selDriver || !session) return;
    let cancelled = false;
    (async () => {
      setLapsLoading(true);
      try {
        const data = await F1.driverLapTimes(session.session_key, selDriver.driver_number);
        if (!cancelled && Array.isArray(data)) setLaps(data);
      } catch {}
      if (!cancelled) setLapsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selDriver?.driver_number, session?.session_key]);

  if (initLoading) return <Loader text="Loading race data…" />;

  const getFlagClass = (msg) => {
    const m = msg?.message?.toLowerCase() || '';
    const cat = msg?.category?.toLowerCase() || '';
    if (m.includes('red flag') || cat.includes('red')) return 'flag-red';
    if (m.includes('yellow') || cat.includes('yellow') || m.includes('safety car') || m.includes('vsc')) return 'flag-yellow';
    if (m.includes('green') || cat.includes('green') || m.includes('clear')) return 'flag-green';
    return '';
  };

  return (
    <div>
      <ErrorBox msg={error} />

      {/* Session Info + Weather */}
      {session && (
        <Card className="animate-in" style={{ borderColor: 'var(--border-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 'var(--font-size-lg)' }}>
                {session.circuit_short_name || session.meeting_name}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 3 }}>
                {session.session_name} · {session.country_name}
              </div>
            </div>
            {isLive && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                background: 'rgba(225,6,0,0.12)', border: '1px solid rgba(225,6,0,0.3)',
                fontSize: 11, fontWeight: 700, color: 'var(--accent)'
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite' }} />
                LIVE
              </div>
            )}
          </div>

          {weather && (
            <div className="weather-bar" style={{ marginTop: 'var(--space-lg)' }}>
              {[
                ['🌡️', `${weather.track_temperature?.toFixed?.(0) ?? '—'}°C`, 'Track'],
                ['💨', `${weather.air_temperature?.toFixed?.(0) ?? '—'}°C`, 'Air'],
                ['💧', `${weather.humidity?.toFixed?.(0) ?? '—'}%`, 'Humidity'],
                ['🌧️', weather.rainfall > 0 ? 'Yes' : 'Dry', 'Rain'],
                ...(weather.wind_speed ? [['🌬️', `${weather.wind_speed.toFixed?.(0) ?? '—'} km/h`, 'Wind']] : []),
              ].map(([icon, val, label]) => (
                <div className="weather-item" key={label}>
                  <div className="weather-value">{icon} {val}</div>
                  <div className="weather-label">{label}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Race Control Messages */}
      {rcMessages.length > 0 && (
        <div className="race-control-strip" style={{ marginTop: 'var(--space-md)' }}>
          {rcMessages.map((msg, i) => (
            <div key={i} className={`rc-msg ${getFlagClass(msg)}`} title={msg.message}>
              {msg.message}
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <Card className="animate-in" style={{ animationDelay: '0.05s' }}>
        <SectionLabel>Race Order · Tap for lap times</SectionLabel>
        {leaderboard.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-xl)' }}>
            No leaderboard data available
          </div>
        )}
        {leaderboard.map((d, i) => {
          const c = teamColorHex(d.team_colour, d.team_name);
          const tyre = getTyre(d.tyre_compound);
          const isSel = selDriver?.driver_number === d.driver_number;
          return (
            <div
              key={d.driver_number}
              className={`lb-row ${isSel ? 'selected' : ''}`}
              style={{ color: c, borderLeftColor: isSel ? c : 'transparent' }}
              onClick={() => setSelDriver(isSel ? null : d)}
            >
              <div className="lb-pos" style={{ color: positionColor(d.position) }}>
                {d.position ?? i + 1}
              </div>
              <div className="lb-color-bar" style={{ background: c }} />
              <div className="lb-info">
                <div className="lb-name" style={{ color: 'var(--text-primary)' }}>{d.full_name}</div>
                <div className="lb-team">{d.team_name}</div>
              </div>
              <div className="lb-data">
                {d.gap_to_leader != null && (
                  <div className="lb-gap">
                    {i === 0 ? 'Leader' : typeof d.gap_to_leader === 'number' ? `+${d.gap_to_leader.toFixed(3)}` : `+${d.gap_to_leader}`}
                  </div>
                )}
                {d.interval != null && i > 0 && (
                  <div className="lb-interval">
                    {typeof d.interval === 'number' ? `+${d.interval.toFixed(3)}` : `+${d.interval}`}
                  </div>
                )}
                {tyre.label !== '?' && <TyreDot compound={tyre.name} color={tyre.color} label={tyre.label} />}
              </div>
            </div>
          );
        })}
      </Card>

      {/* Selected driver lap times */}
      {selDriver && (
        <Card className="animate-in">
          <SectionLabel>{selDriver.full_name} · Lap Times</SectionLabel>
          {lapsLoading ? (
            <Loader text="Fetching laps…" />
          ) : laps.length > 0 ? (
            <LapChart
              laps={laps}
              color={teamColorHex(selDriver.team_colour, selDriver.team_name)}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-xl)' }}>
              No lap data available for this session
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
