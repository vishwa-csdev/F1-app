// ─── IN-MEMORY CACHE WITH TTL ─────────────────────────────────────────────────

const cache = new Map();

async function cachedFetch(url, cacheKey, ttlMs = 60000) {
  const now = Date.now();
  const entry = cache.get(cacheKey);

  // Return fresh cache hit
  if (entry && now - entry.ts < ttlMs) {
    return entry.data;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cache.set(cacheKey, { data, ts: now });
    return data;
  } catch (err) {
    // Stale-data fallback: return last good response if available
    if (entry) {
      console.warn(`[F1 API] Fetch failed for ${cacheKey}, using stale data:`, err.message);
      return entry.data;
    }
    throw err;
  }
}

// ─── JOLPICA (Ergast) PARSERS ─────────────────────────────────────────────────

function parseDriverStandings(raw) {
  const lists = raw?.MRData?.StandingsTable?.StandingsLists;
  if (!lists?.length) return [];
  return lists[0].DriverStandings.map(ds => ({
    position:     ds.position,
    points:       ds.points,
    wins:         ds.wins,
    driver_id:    ds.Driver.driverId,
    driver_code:  ds.Driver.code,
    number:       ds.Driver.permanentNumber,
    given_name:   ds.Driver.givenName,
    family_name:  ds.Driver.familyName,
    driver_name:  `${ds.Driver.givenName} ${ds.Driver.familyName}`,
    nationality:  ds.Driver.nationality,
    team_id:      ds.Constructors?.[0]?.constructorId || '',
    team_name:    ds.Constructors?.[0]?.name || '',
  }));
}

function parseConstructorStandings(raw) {
  const lists = raw?.MRData?.StandingsTable?.StandingsLists;
  if (!lists?.length) return [];
  return lists[0].ConstructorStandings.map(cs => ({
    position:    cs.position,
    points:      cs.points,
    wins:        cs.wins,
    team_id:     cs.Constructor.constructorId,
    team_name:   cs.Constructor.name,
    nationality: cs.Constructor.nationality,
  }));
}

function parseRaceResults(raw) {
  const races = raw?.MRData?.RaceTable?.Races;
  if (!races?.length) return null;
  const race = races[0];
  return {
    race_name:    race.raceName,
    circuit:      race.Circuit?.circuitName,
    country:      race.Circuit?.Location?.country,
    locality:     race.Circuit?.Location?.locality,
    date:         race.date,
    round:        race.round,
    results: (race.Results || []).map(r => ({
      position:       r.position,
      number:         r.number,
      driver_id:      r.Driver.driverId,
      driver_code:    r.Driver.code,
      driver_name:    `${r.Driver.givenName} ${r.Driver.familyName}`,
      family_name:    r.Driver.familyName,
      team_id:        r.Constructor?.constructorId || '',
      team_name:      r.Constructor?.name || '',
      grid:           r.grid,
      laps:           r.laps,
      status:         r.status,
      points:         r.points,
      time:           r.Time?.time || '',
      fastest_lap:    r.FastestLap?.Time?.time || '',
    })),
  };
}

function parseSchedule(raw) {
  const races = raw?.MRData?.RaceTable?.Races;
  if (!races?.length) return [];
  return races.map(r => ({
    round:        r.round,
    race_name:    r.raceName,
    circuit_name: r.Circuit?.circuitName,
    country:      r.Circuit?.Location?.country,
    locality:     r.Circuit?.Location?.locality,
    date:         r.date,
    time:         r.time || '',
  }));
}

function parseDriverHistory(raw) {
  const races = raw?.MRData?.RaceTable?.Races;
  if (!races?.length) return [];
  return races.map(r => {
    const result = r.Results?.[0];
    return {
      race_name: r.raceName,
      circuit:   r.Circuit?.circuitName,
      country:   r.Circuit?.Location?.country,
      date:      r.date,
      round:     r.round,
      position:  result?.position || '',
      grid:      result?.grid || '',
      points:    result?.points || '0',
      status:    result?.status || '',
      laps:      result?.laps || '',
    };
  });
}

// ─── API OBJECT ───────────────────────────────────────────────────────────────

const YEAR = new Date().getFullYear();

const F1 = {
  // ── Jolpica endpoints ──

  async driverStandings() {
    const raw = await cachedFetch(
      'https://api.jolpi.ca/ergast/f1/current/driverStandings.json',
      'driver_standings',
      120000
    );
    return parseDriverStandings(raw);
  },

  async constructorStandings() {
    const raw = await cachedFetch(
      'https://api.jolpi.ca/ergast/f1/current/constructorStandings.json',
      'constructor_standings',
      120000
    );
    return parseConstructorStandings(raw);
  },

  async lastRaceResults() {
    const raw = await cachedFetch(
      'https://api.jolpi.ca/ergast/f1/current/last/results.json',
      'last_race',
      120000
    );
    return parseRaceResults(raw);
  },

  async seasonSchedule() {
    const raw = await cachedFetch(
      'https://api.jolpi.ca/ergast/f1/current.json',
      'season_schedule',
      3600000
    );
    return parseSchedule(raw);
  },

  async nextRace() {
    const schedule = await this.seasonSchedule();
    const today = new Date().toISOString().slice(0, 10);
    return schedule.find(r => r.date >= today) || null;
  },

  async driverSeasonHistory(driverId) {
    const raw = await cachedFetch(
      `https://api.jolpi.ca/ergast/f1/current/drivers/${driverId}/results.json`,
      `driver_history_${driverId}`,
      300000
    );
    return parseDriverHistory(raw);
  },

  // ── OpenF1 endpoints ──

  async latestSession() {
    const sessions = await cachedFetch(
      `https://api.openf1.org/v1/sessions?session_type=Race&year=${YEAR}`,
      'race_sessions',
      120000
    );
    if (!Array.isArray(sessions) || sessions.length === 0) return null;
    // Filter to non-cancelled, past sessions (date_end before now)
    const now = new Date().toISOString();
    const past = sessions.filter(s => !s.is_cancelled && s.date_end <= now);
    return past.length > 0 ? past[past.length - 1] : sessions[sessions.length - 1];
  },

  async raceDrivers(sessionKey) {
    return cachedFetch(
      `https://api.openf1.org/v1/drivers?session_key=${sessionKey}`,
      `drivers_${sessionKey}`,
      300000
    );
  },

  async racePositions(sessionKey) {
    return cachedFetch(
      `https://api.openf1.org/v1/position?session_key=${sessionKey}`,
      `positions_${sessionKey}`,
      30000
    );
  },

  async raceStints(sessionKey) {
    return cachedFetch(
      `https://api.openf1.org/v1/stints?session_key=${sessionKey}`,
      `stints_${sessionKey}`,
      30000
    );
  },

  async raceIntervals(sessionKey) {
    return cachedFetch(
      `https://api.openf1.org/v1/intervals?session_key=${sessionKey}`,
      `intervals_${sessionKey}`,
      30000
    );
  },

  async raceControlMessages(sessionKey) {
    return cachedFetch(
      `https://api.openf1.org/v1/race_control?session_key=${sessionKey}`,
      `race_control_${sessionKey}`,
      30000
    );
  },

  /**
   * Build a combined leaderboard from drivers, positions, stints, and intervals.
   */
  async raceLeaderboard(sessionKey) {
    const [drivers, positions, stints, intervals] = await Promise.all([
      this.raceDrivers(sessionKey),
      this.racePositions(sessionKey),
      this.raceStints(sessionKey),
      this.raceIntervals(sessionKey),
    ]);

    if (!Array.isArray(drivers)) return [];

    // Build lookup maps (latest entry per driver)
    const posMap = {};
    if (Array.isArray(positions)) {
      for (const p of positions) {
        posMap[p.driver_number] = p;
      }
    }

    const stintMap = {};
    if (Array.isArray(stints)) {
      for (const s of stints) {
        stintMap[s.driver_number] = s;
      }
    }

    const intervalMap = {};
    if (Array.isArray(intervals)) {
      for (const iv of intervals) {
        intervalMap[iv.driver_number] = iv;
      }
    }

    const merged = drivers.map(d => ({
      driver_number:  d.driver_number,
      full_name:      d.full_name || `${d.first_name || ''} ${d.last_name || ''}`.trim(),
      name_acronym:   d.name_acronym,
      team_name:      d.team_name,
      team_colour:    d.team_colour,
      country_code:   d.country_code,
      position:       posMap[d.driver_number]?.position ?? 99,
      tyre_compound:  stintMap[d.driver_number]?.compound || '',
      gap_to_leader:  intervalMap[d.driver_number]?.gap_to_leader ?? null,
      interval:       intervalMap[d.driver_number]?.interval ?? null,
    }));

    merged.sort((a, b) => (a.position || 99) - (b.position || 99));
    return merged;
  },

  async driverLapTimes(sessionKey, driverNumber) {
    const laps = await cachedFetch(
      `https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${driverNumber}`,
      `laps_${sessionKey}_${driverNumber}`,
      60000
    );
    if (!Array.isArray(laps)) return [];
    return laps
      .filter(l => l.lap_duration && l.lap_duration > 0)
      .map(l => ({
        lap_number:   l.lap_number,
        lap_duration: l.lap_duration,
        sector_1:     l.duration_sector_1,
        sector_2:     l.duration_sector_2,
        sector_3:     l.duration_sector_3,
      }));
  },

  async weatherData(sessionKey) {
    const data = await cachedFetch(
      `https://api.openf1.org/v1/weather?session_key=${sessionKey}`,
      `weather_${sessionKey}`,
      60000
    );
    if (!Array.isArray(data) || data.length === 0) return null;
    // Return latest weather entry
    return data[data.length - 1];
  },

  async radioClips(sessionKey) {
    const [clips, drivers] = await Promise.all([
      cachedFetch(
        `https://api.openf1.org/v1/team_radio?session_key=${sessionKey}`,
        `radio_${sessionKey}`,
        120000
      ),
      this.raceDrivers(sessionKey),
    ]);

    if (!Array.isArray(clips)) return [];

    const driverMap = {};
    if (Array.isArray(drivers)) {
      for (const d of drivers) {
        driverMap[d.driver_number] = d;
      }
    }

    return clips
      .slice(-40)
      .reverse()
      .map(c => {
        const d = driverMap[c.driver_number];
        return {
          driver_number: c.driver_number,
          recording_url: c.recording_url,
          date:          c.date,
          driver_name:   d?.full_name || d?.name_acronym || `#${c.driver_number}`,
          team_name:     d?.team_name || '',
          team_colour:   d?.team_colour || '',
        };
      });
  },

  async recentMeetings() {
    const meetings = await cachedFetch(
      `https://api.openf1.org/v1/meetings?year=${YEAR}`,
      'meetings',
      3600000
    );
    if (!Array.isArray(meetings)) return [];
    // Filter out testing sessions and cancelled meetings, return last 8
    return meetings
      .filter(m => !m.meeting_name?.includes('Testing') && !m.is_cancelled)
      .slice(-8);
  },

  async meetingRaceSession(meetingKey) {
    const sessions = await cachedFetch(
      `https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}&session_type=Race`,
      `meeting_session_${meetingKey}`,
      3600000
    );
    if (!Array.isArray(sessions) || sessions.length === 0) return null;
    // Prefer the main Race over Sprint
    const mainRace = sessions.find(s => s.session_name === 'Race');
    return mainRace || sessions[0];
  },
};

export default F1;
