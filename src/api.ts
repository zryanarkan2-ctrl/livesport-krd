import type { ApiMatch, Match, MatchStatus } from './types';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/matches`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CACHE_TTL = 10 * 60 * 1000;
const CACHE_PREFIX = 'lskrd_matches_';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const LIVE_CODES = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'SUSP', 'LIVE']);
const FINISHED_CODES = new Set(['FT', 'AET', 'PEN', 'WO', 'LU']);

function deriveStatus(short: string): MatchStatus {
  if (LIVE_CODES.has(short)) return 'live';
  if (FINISHED_CODES.has(short)) return 'finished';
  return 'upcoming';
}

function cacheKey(day: string): string {
  return `${CACHE_PREFIX}${day}`;
}

function readCache(day: string): ApiMatch[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(day));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data as ApiMatch[];
  } catch {
    return null;
  }
}

function writeCache(day: string, data: ApiMatch[]): void {
  try {
    localStorage.setItem(cacheKey(day), JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore
  }
}

export function clearCache(day: string): void {
  try {
    localStorage.removeItem(cacheKey(day));
  } catch {
    // ignore
  }
}

async function fetchDay(date: string): Promise<ApiMatch[]> {
  const url = `${EDGE_URL}?date=${date}&timezone=Asia/Baghdad`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    throw new Error(`هەڵە لە وەرگرتنی داتا (${resp.status})`);
  }
  const json = await resp.json();
  if (json.error) {
    throw new Error(json.error);
  }
  if (!Array.isArray(json.response)) {
    throw new Error('وەڵامی داتا نادروستە');
  }
  return json.response as ApiMatch[];
}

export async function getMatches(
  day: 'yesterday' | 'today' | 'tomorrow',
): Promise<Match[]> {
  const date =
    day === 'yesterday'
      ? shiftDate(-1)
      : day === 'tomorrow'
        ? shiftDate(1)
        : todayISO();

  let apiMatches = readCache(day);
  if (!apiMatches) {
    apiMatches = await fetchDay(date);
    writeCache(day, apiMatches);
  }

  return apiMatches.map((m) => ({
    id: m.id,
    home: m.home,
    away: m.away,
    league: m.league,
    leagueId: m.leagueId,
    leagueLogo: m.leagueLogo,
    country: m.country,
    flag: m.flag,
    stadium: m.stadium,
    kickoff: m.kickoff,
    statusShort: m.statusShort,
    status: deriveStatus(m.statusShort),
    minute: m.minute,
    scoreHome: m.scoreHome,
    scoreAway: m.scoreAway,
    day,
  }));
}

export function formatKickoff(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

export interface LeagueGroup {
  leagueId: number;
  league: string;
  leagueLogo: string;
  country: string;
  flag: string | null;
  matches: Match[];
}

export function groupByLeague(matches: Match[]): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();
  for (const m of matches) {
    if (!map.has(m.leagueId)) {
      map.set(m.leagueId, {
        leagueId: m.leagueId,
        league: m.league,
        leagueLogo: m.leagueLogo,
        country: m.country,
        flag: m.flag,
        matches: [],
      });
    }
    map.get(m.leagueId)!.matches.push(m);
  }
  return Array.from(map.values());
}
