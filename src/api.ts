import type { Match, MatchStatus } from '@/types';

const API_KEY = 'de11f00e343eaef017411a3540759b47';
const BASE_URL = 'https://api-sports.io';

export const ALLOWED_LEAGUES: Record<number, { name: string; country: string; logo: string }> = {
  2: {
    name: 'UEFA Champions League',
    country: 'ئەوروپا',
    logo: 'https://api-sports.io',
  },
  39: {
    name: 'Premier League',
    country: 'ئینگلتەرا',
    logo: 'https://api-sports.io',
  },
  140: {
    name: 'La Liga',
    country: 'ئیسپانیا',
    logo: 'https://api-sports.io',
  },
  135: {
    name: 'Serie A',
    country: 'ئیتاڵیا',
    logo: 'https://api-sports.io',
  },
  78: {
    name: 'Bundesliga',
    country: 'ئەڵمانیا',
    logo: 'https://api-sports.io',
  },
  61: {
    name: 'Ligue 1',
    country: 'فەڕەنسا',
    logo: 'https://api-sports.io',
  },
  307: {
    name: 'Saudi Pro League',
    country: 'سعودیە',
    logo: 'https://api-sports.io',
  },
};

function getDateString(day: 'yesterday' | 'today' | 'tomorrow'): string {
  const now = new Date();
  const baghdadOffset = 3 * 60;
  const localTime = new Date(now.getTime() + (baghdadOffset + now.getTimezoneOffset()) * 60000);
  if (day === 'yesterday') localTime.setDate(localTime.getDate() - 1);
  if (day === 'tomorrow') localTime.setDate(localTime.getDate() + 1);
  return localTime.toISOString().split('T');
}

function mapStatus(short: string): MatchStatus {
  if (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'].includes(short)) return 'live';
  if (['FT', 'AET', 'PEN'].includes(short)) return 'finished';
  return 'upcoming';
}

export function clearCache(day?: 'yesterday' | 'today' | 'tomorrow') {
  if (day) {
    localStorage.removeItem(`lskrd_v3_${day}`);
  } else {
    localStorage.removeItem('lskrd_v3_yesterday');
    localStorage.removeItem('lskrd_v3_today');
    localStorage.removeItem('lskrd_v3_tomorrow');
  }
}

export async function getMatches(day: 'yesterday' | 'today' | 'tomorrow'): Promise<Match[]> {
  const cacheKey = `lskrd_v3_${day}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
        return parsed.data;
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const dateStr = getDateString(day);
  const res = await fetch(`${BASE_URL}/fixtures?date=${dateStr}&timezone=Asia/Baghdad`, {
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error('نەتوانرا زانیاری یارییەکان بهێنرێت');
  }

  const json = await res.json();
  const rawFixtures = json.response || [];

  const filtered: Match[] = rawFixtures
    .filter((item: any) => Boolean(ALLOWED_LEAGUES[item.league?.id]))
    .map((item: any) => {
      const leagueId = item.league.id;
      const leagueInfo = ALLOWED_LEAGUES[leagueId];
      const kickoffDate = new Date(item.fixture.date);
      const kickoff = kickoffDate.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Baghdad',
      });

      return {
        id: String(item.fixture.id),
        home: {
          id: item.teams.home.id,
          name: item.teams.home.name,
          logo: item.teams.home.logo,
        },
        away: {
          id: item.teams.away.id,
          name: item.teams.away.name,
          logo: item.teams.away.logo,
        },
        league: leagueInfo.name,
        leagueId: leagueId,
        leagueLogo: leagueInfo.logo,
        country: leagueInfo.country,
        flag: item.league.flag || null,
        stadium: item.fixture.venue?.name || '',
        kickoff,
        statusShort: item.fixture.status.short,
        status: mapStatus(item.fixture.status.short),
        minute: item.fixture.status.elapsed,
        scoreHome: item.goals.home,
        scoreAway: item.goals.away,
        day,
      };
    });

  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      timestamp: Date.now(),
      data: filtered,
    }),
  );

  return filtered;
}

export function groupByLeague(matches: Match[]) {
  const order =;
  const map = new Map<
    number,
    {
      leagueId: number;
      league: string;
      leagueLogo: string;
      country: string;
      flag: string | null;
      matches: Match[];
    }
  >();

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

  return Array.from(map.values()).sort(
    (a, b) => order.indexOf(a.leagueId) - order.indexOf(b.leagueId),
  );
}
