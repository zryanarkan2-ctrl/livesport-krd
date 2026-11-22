import type { Match, MatchStatus } from '@/types';

const ESPN_BASE = 'https://' + '://espn.com' + '/apis/site/v2/sports/soccer/';
const ESPN_BASE = 'https://' + '://espn.com' + '/apis/site/v2/sports/soccer/';

const LEAGUES_CONFIG = [
  { id: 2, slug: 'uefa.champions', name: 'UEFA Champions League', country: 'ئەوروپا' },
  { id: 39, slug: 'eng.1', name: 'Premier League', country: 'ئینگلتەرا' },
  { id: 140, slug: 'esp.1', name: 'La Liga', country: 'ئیسپانیا' },
  { id: 135, slug: 'ita.1', name: 'Serie A', country: 'ئیتاڵیا' },
  { id: 78, slug: 'ger.1', name: 'Bundesliga', country: 'ئەڵمانیا' },
  { id: 61, slug: 'fra.1', name: 'Ligue 1', country: 'فەڕەنسا' },
  { id: 307, slug: 'ksa.1', name: 'Saudi Pro League', country: 'سعودیە' },
];

const LEAGUE_ORDER: Record<number, number> = {
  2: 1,
  39: 2,
  140: 3,
  135: 4,
  78: 5,
  61: 6,
  307: 7,
};

function getEspnDate(day: 'yesterday' | 'today' | 'tomorrow'): string {
  const now = new Date();
  const baghdadOffset = 3 * 60;
  const localTime = new Date(now.getTime() + (baghdadOffset + now.getTimezoneOffset()) * 60000);
  if (day === 'yesterday') localTime.setDate(localTime.getDate() - 1);
  if (day === 'tomorrow') localTime.setDate(localTime.getDate() + 1);
  return localTime.toISOString().slice(0, 10).replace(/-/g, '');
}

export function clearCache(day?: 'yesterday' | 'today' | 'tomorrow') {
  if (day) {
    localStorage.removeItem(`lskrd_espn_${day}`);
  } else {
    localStorage.removeItem('lskrd_espn_yesterday');
    localStorage.removeItem('lskrd_espn_today');
    localStorage.removeItem('lskrd_espn_tomorrow');
  }
}

export async function getMatches(day: 'yesterday' | 'today' | 'tomorrow'): Promise<Array<Match>> {
  const cacheKey = `lskrd_espn_${day}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed.data;
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const dateParam = getEspnDate(day);
  const allMatches: Array<Match> = [];

  await Promise.all(
    LEAGUES_CONFIG.map(async (lg) => {
      try {
        const res = await fetch(`${ESPN_BASE}${lg.slug}/scoreboard?dates=${dateParam}`);
        if (!res.ok) return;
        const data = await res.json();
        const events = data.events || [];

        for (const ev of events) {
          const comp = ev.competitions?.[0];
          if (!comp) continue;
          const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
          const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
          if (!homeComp || !awayComp) continue;

          const state = ev.status?.type?.state;
          let status: MatchStatus = 'upcoming';
          if (state === 'in') status = 'live';
          else if (state === 'post') status = 'finished';

          const kickoffDate = new Date(ev.date);
          const kickoff = kickoffDate.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Baghdad',
          });

          const rawClock = ev.status?.displayClock || '';
          const minuteNum = parseInt(rawClock, 10);

          allMatches.push({
            id: String(ev.id),
            home: {
              id: Number(homeComp.team?.id) || 0,
              name: homeComp.team?.shortDisplayName || homeComp.team?.name || 'Home',
              logo: homeComp.team?.logo || '',
            },
            away: {
              id: Number(awayComp.team?.id) || 0,
              name: awayComp.team?.shortDisplayName || awayComp.team?.name || 'Away',
              logo: awayComp.team?.logo || '',
            },
            league: lg.name,
            leagueId: lg.id,
            leagueLogo: `${LEAGUE_IMG_BASE}${lg.id}.png`,
            country: lg.country,
            flag: null,
            stadium: comp.venue?.fullName || '',
            kickoff,
            statusShort: ev.status?.type?.shortDetail || '',
            status,
            minute: Number.isNaN(minuteNum) ? null : minuteNum,
            scoreHome: status === 'upcoming' ? null : Number(homeComp.score ?? 0),
            scoreAway: status === 'upcoming' ? null : Number(awayComp.score ?? 0),
            day,
          });
        }
      } catch {
        // Ignore single league fetch failure
      }
    }),
  );

  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      timestamp: Date.now(),
      data: allMatches,
    }),
  );

  return allMatches;
}

export function groupByLeague(matches: Array<Match>) {
  const map = new Map<
    number,
    {
      leagueId: number;
      league: string;
      leagueLogo: string;
      country: string;
      flag: string | null;
      matches: Array<Match>;
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
    (a, b) => (LEAGUE_ORDER[a.leagueId] || 99) - (LEAGUE_ORDER[b.leagueId] || 99),
  );
}

export function formatKickoff(kickoff: string): string {
  return kickoff;
}
