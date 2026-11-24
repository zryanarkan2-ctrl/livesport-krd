import type { Match, MatchStatus } from '@/types';
import type {
  DayKey,
  MatchDetails,
  MatchEvent,
  MatchX,
  NewsItem,
  StandingGroup,
  StandingRow,
  StatRow,
  TeamLineup,
  LineupPlayer,
} from './espn-types';

/* ------------------------------------------------------------------ */
/*  ڕێکخستن                                                            */
/* ------------------------------------------------------------------ */

const ESPN_HOST = 'https://' + 'site.api.' + 'espn.com';
const SITE_PATH = '/apis/site/v2/sports/soccer/';
const V2_PATH = '/apis/v2/sports/soccer/';

/** ئەگەر true بێت، داواکارییەکان یەکەم جار لە ڕێگەی /api/espn (Vercel) دەڕۆن و کاش دەکرێن.
 *  ئەگەر ئەو فەنکشنە نەبوو، خۆکار دەگەڕێتەوە بۆ ڕاستەوخۆ ESPN. */
const USE_PROXY = true;

export const LEAGUES = [
  { id: 2, slug: 'uefa.champions', name: 'UEFA Champions League', country: 'ئەوروپا' },
  { id: 3, slug: 'uefa.europa', name: 'UEFA Europa League', country: 'ئەوروپا' },
  { id: 39, slug: 'eng.1', name: 'Premier League', country: 'ئینگلتەرا' },
  { id: 140, slug: 'esp.1', name: 'La Liga', country: 'ئیسپانیا' },
  { id: 135, slug: 'ita.1', name: 'Serie A', country: 'ئیتاڵیا' },
  { id: 78, slug: 'ger.1', name: 'Bundesliga', country: 'ئەڵمانیا' },
  { id: 61, slug: 'fra.1', name: 'Ligue 1', country: 'فەڕەنسا' },
] as const;

/** ڕیزبەندی لیگەکان: ئەوەی لە سەرەوەی لیستەکەیە لە سەرەوە دەردەکەوێت */
export const LEAGUE_ORDER: Record<number, number> = Object.fromEntries(
  LEAGUES.map((l, i) => [l.id, i + 1]),
);

/** ئەو لیگانەی پلەبەندییان هەیە */
export const STANDINGS_LEAGUES = LEAGUES;

/* ------------------------------------------------------------------ */
/*  فەنکشنی fetch (proxy ← ESPN ڕاستەوخۆ)                            */
/* ------------------------------------------------------------------ */

let proxyDisabled = false;

async function espnFetch(path: string): Promise<any> {
  if (USE_PROXY && !proxyDisabled) {
    try {
      const res = await fetch(`/api/espn?path=${encodeURIComponent(path)}`);
      if (res.ok) return await res.json();
      if (res.status === 404) proxyDisabled = true; // فەنکشنەکە نییە (مەسەلەن لە dev)
    } catch {
      // وەڵامەکە JSON نەبوو (SPA fallback) یان تۆڕ کێشەی هەبوو
      proxyDisabled = true;
    }
  }
  const res = await fetch(`${ESPN_HOST}${path}`);
  if (!res.ok) throw new Error(`ESPN ${res.status}`);
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  بەروارەکان (هەمووی بە کاتی بەغدا)                                  */
/* ------------------------------------------------------------------ */

const BAGHDAD_OFFSET_MS = 3 * 60 * 60 * 1000;

function baghdadDateStr(ms: number): string {
  return new Date(ms + BAGHDAD_OFFSET_MS).toISOString().slice(0, 10).replace(/-/g, '');
}

function shiftDate(yyyymmdd: string, delta: number): string {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  return new Date(Date.UTC(y, m, d + delta)).toISOString().slice(0, 10).replace(/-/g, '');
}

/** 'today' | 'yesterday' | 'tomorrow' | 'YYYYMMDD'  ←  'YYYYMMDD' */
export function resolveDate(day: string): string {
  if (/^\d{8}$/.test(day)) return day;
  const shift = day === 'yesterday' ? -1 : day === 'tomorrow' ? 1 : 0;
  return baghdadDateStr(Date.now() + shift * 86_400_000);
}

/** بەرواری YYYYMMDD بۆ نووسینێکی خوێنراو */
export function formatDayLabel(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(6, 8)}`;
}

/* ------------------------------------------------------------------ */
/*  کاش                                                                */
/* ------------------------------------------------------------------ */

const CACHE_PREFIX = 'lskrd_v2_';

function readCache(key: string): MatchX[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < parsed.ttl) return parsed.data;
  } catch {
    localStorage.removeItem(CACHE_PREFIX + key);
  }
  return null;
}

function writeCache(key: string, data: MatchX[]) {
  // یاری زیندوو: ٣٠ چرکە | هەموو تەواو بووە: ٣٠ خولەک | ئەوانی تر: ٢ خولەک
  const hasLive = data.some((m) => m.status === 'live');
  const allDone = data.length > 0 && data.every((m) => m.status === 'finished');
  const ttl = hasLive ? 30_000 : allDone ? 30 * 60_000 : 2 * 60_000;
  try {
    localStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ timestamp: Date.now(), ttl, data }),
    );
  } catch {
    // localStorage پڕە یان بەردەست نییە
  }
}

export function clearCache(day?: string) {
  try {
    if (day) {
      localStorage.removeItem(CACHE_PREFIX + resolveDate(day));
      return;
    }
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX) || k.startsWith('lskrd_espn_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    // هیچ
  }
}

/* ------------------------------------------------------------------ */
/*  یاریەکان                                                           */
/* ------------------------------------------------------------------ */

/** دۆخی یاری بە کوردی. ئەوەی نەناسرێت وەک خۆی دەمێنێت (بۆ نموونە خولەکی یاری زیندوو: 67') */
function kurdishStatus(raw: string, typeName: string, status: MatchStatus): string {
  const t = `${typeName} ${raw}`;
  if (/POSTPONED/i.test(t)) return 'دواخرا';
  if (/CANCEL/i.test(t)) return 'هەڵوەشایەوە';
  if (/SUSPENDED|ABANDONED/i.test(t)) return 'ڕاگیرا';
  if (/DELAYED/i.test(t)) return 'دواکەوت';
  if (status === 'upcoming') return 'دەستپێدەکات';
  if (/FINAL_PEN|PENALT|PENS/i.test(t)) return 'تەواو بوو (پێنالتی)';
  if (/FINAL_AET|AET/i.test(t)) return 'تەواو بوو (کاتی زیادە)';
  if (/HALFTIME/i.test(typeName) || /^HT$/i.test(raw)) return 'نیوەکات';
  if (status === 'finished') return 'تەواو بوو';
  return raw;
}

function mapEvent(ev: any, lg: (typeof LEAGUES)[number], leagueLogo: string, day: string): MatchX | null {
  const comp = ev.competitions?.[0];
  if (!comp) return null;
  const homeComp = comp.competitors?.find((c: any) => c.homeAway === 'home');
  const awayComp = comp.competitors?.find((c: any) => c.homeAway === 'away');
  if (!homeComp || !awayComp) return null;

  const state = ev.status?.type?.state;
  const typeName: string = ev.status?.type?.name || '';
  let status: MatchStatus = 'upcoming';
  if (state === 'in') status = 'live';
  else if (state === 'post') status = 'finished';
  // دواخراو / هەڵوەشاوە: وەک "هێشتا نەکراوە" نیشان بدە، نەک 0-0
  if (/POSTPONED|CANCEL|DELAYED|SUSPENDED|ABANDONED/i.test(typeName)) status = 'upcoming';

  const kickoff = new Date(ev.date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Baghdad',
  });

  const minuteNum = parseInt(ev.status?.displayClock || '', 10);
  const hasScore = status === 'live' || status === 'finished';

  return {
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
    leagueLogo,
    country: lg.country,
    flag: null,
    stadium: comp.venue?.fullName || '',
    kickoff,
    statusShort: kurdishStatus(ev.status?.type?.shortDetail || '', typeName, status),
    status,
    minute: Number.isNaN(minuteNum) ? null : minuteNum,
    scoreHome: hasScore ? Number(homeComp.score ?? 0) : null,
    scoreAway: hasScore ? Number(awayComp.score ?? 0) : null,
    day,
    leagueSlug: lg.slug,
    startTime: ev.date,
  } as MatchX;
}

/* ------------------------------------------------------------------ */
/*  لۆگۆی لیگەکان (لە ESPN وەردەگیرێن و هەڵدەگیرێن بۆ Sidebar)       */
/* ------------------------------------------------------------------ */

const LOGO_KEY = 'lskrd_league_logos_v1';

export function getLeagueLogos(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(LOGO_KEY) || '{}');
  } catch {
    return {};
  }
}

function rememberLogos(found: Record<number, string>) {
  if (!Object.keys(found).length) return;
  try {
    localStorage.setItem(LOGO_KEY, JSON.stringify({ ...getLeagueLogos(), ...found }));
  } catch {
    // localStorage بەردەست نییە
  }
}

/** یاریەکانی ڕۆژێک. day: 'yesterday' | 'today' | 'tomorrow' | 'YYYYMMDD' */
export async function getMatches(
  day: string,
  opts: { force?: boolean } = {},
): Promise<MatchX[]> {
  const target = resolveDate(day);

  if (!opts.force) {
    const cached = readCache(target);
    if (cached) return cached;
  }

  // ESPN ڕۆژەکان بە کاتی ئەمریکا دابەش دەکات، بۆیە ڕۆژی پێش و دوای ئەویش دەهێنین
  // و دواتر بە کاتی بەغدا فلتەریان دەکەین. ئەمە یاری نیوەشەو لە دەست نادات.
  const range = `${shiftDate(target, -1)}-${shiftDate(target, 1)}`;
  const byId = new Map<string, MatchX>();
  const seenLogos: Record<number, string> = {};
  let failed = 0;

  await Promise.all(
    LEAGUES.map(async (lg) => {
      try {
        const data = await espnFetch(`${SITE_PATH}${lg.slug}/scoreboard?dates=${range}&limit=300`);
        const leagueLogo: string = data.leagues?.[0]?.logos?.[0]?.href || '';
        if (leagueLogo) seenLogos[lg.id] = leagueLogo;
        for (const ev of data.events || []) {
          if (baghdadDateStr(new Date(ev.date).getTime()) !== target) continue;
          const m = mapEvent(ev, lg, leagueLogo, day);
          if (m) byId.set(`${lg.id}-${m.id}`, m);
        }
      } catch (err) {
        failed += 1;
        console.error(`Failed to load ${lg.name}:`, err);
      }
    }),
  );

  rememberLogos(seenLogos);

  // ئەگەر هەموو لیگەکان شکستیان هێنا، هەڵە فڕێ بدە (نەک لیستی بەتاڵ)
  if (failed === LEAGUES.length) throw new Error('Failed to fetch');

  const matches = Array.from(byId.values()).sort((a, b) =>
    (a.startTime || '').localeCompare(b.startTime || ''),
  );

  // تەنها ئەگەر هیچ لیگێک شکستی نەهێنابێت کاش بکە
  if (failed === 0) writeCache(target, matches);
  return matches;
}

/** تەنها یاریە زیندووەکان (دوێنێ + ئەمڕۆ، چونکە یاری نیوەشەو بۆ ڕۆژی پێشوو دەچێت) */
export async function getLiveMatches(opts: { force?: boolean } = {}): Promise<MatchX[]> {
  const [y, t] = await Promise.all([
    getMatches('yesterday', opts).catch(() => [] as MatchX[]),
    getMatches('today', opts),
  ]);
  return [...y, ...t].filter((m) => m.status === 'live');
}

/** پیشاندانی یاری بەپێی ڕۆژ یان 'live' */
export function getMatchesFor(day: DayKey, opts: { force?: boolean } = {}): Promise<MatchX[]> {
  return day === 'live' ? getLiveMatches(opts) : getMatches(day, opts);
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

/** گەڕان لە ناو یاریە هێنراوەکان: ناوی تیم، لیگ، وڵات */
export function filterMatches<T extends Match>(matches: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return matches;
  return matches.filter((m) =>
    [m.home.name, m.away.name, m.league, m.country].some((s) => s.toLowerCase().includes(q)),
  );
}

/* ------------------------------------------------------------------ */
/*  وردەکاری یاری                                                      */
/* ------------------------------------------------------------------ */

const STAT_LABELS: Array<[string, string]> = [
  ['possessionPct', 'خاوەندارێتی توپ'],
  ['totalShots', 'شووت'],
  ['shotsOnTarget', 'شووتی ڕاست'],
  ['wonCorners', 'کۆرنەر'],
  ['foulsCommitted', 'فاوڵ'],
  ['offsides', 'ئۆفسایید'],
  ['yellowCards', 'کارتی زەرد'],
  ['redCards', 'کارتی سوور'],
  ['saves', 'ڕزگارکردن'],
];

function toNum(v: unknown): number {
  const n = parseFloat(String(v ?? '').replace('%', ''));
  return Number.isNaN(n) ? 0 : n;
}

function parseLineup(roster: any): TeamLineup {
  const players: LineupPlayer[] = (roster?.roster || []).map((p: any) => ({
    name: p.athlete?.displayName || p.athlete?.shortName || '',
    number: String(p.jersey ?? ''),
    pos: p.position?.abbreviation || '',
    starter: Boolean(p.starter),
  }));
  const strip = ({ starter: _s, ...rest }: any): LineupPlayer => rest;
  return {
    formation: roster?.formation || '',
    starters: players.filter((p: any) => p.starter).map(strip),
    subs: players.filter((p: any) => !p.starter).map(strip),
  };
}

export async function getMatchDetails(leagueSlug: string, eventId: string): Promise<MatchDetails> {
  const data = await espnFetch(`${SITE_PATH}${leagueSlug}/summary?event=${eventId}`);

  const competitors: any[] = data.header?.competitions?.[0]?.competitors || [];
  const homeId = String(competitors.find((c) => c.homeAway === 'home')?.team?.id ?? '');

  // ڕووداوەکان (گۆڵ، کارت، گۆڕانکاری)
  const events: MatchEvent[] = [];
  for (const k of data.keyEvents || []) {
    const t = String(k.type?.text || '').toLowerCase();
    if (t.includes('disallow')) continue;

    let kind: MatchEvent['kind'] | null = null;
    if (t.includes('own goal')) kind = 'own-goal';
    else if (t.includes('goal') || (t.includes('penalty') && t.includes('scored'))) kind = 'goal';
    else if (t.includes('yellow')) kind = 'yellow';
    else if (t.includes('red card')) kind = 'red';
    else if (t.includes('substitution')) kind = 'sub';
    if (!kind) continue;

    const names: string[] = (k.participants || [])
      .map((p: any) => p.athlete?.displayName)
      .filter(Boolean);

    events.push({
      kind,
      minute: k.clock?.displayValue || '',
      isHome: String(k.team?.id ?? '') === homeId,
      player: names[0] || k.shortText || '',
      extra: names[1],
    });
  }

  // ستاتیستیک
  const stats: StatRow[] = [];
  const teams: any[] = data.boxscore?.teams || [];
  const isHomeTeam = (t: any) =>
    t.homeAway ? t.homeAway === 'home' : String(t.team?.id ?? '') === homeId;
  const homeStats: any[] = teams.find(isHomeTeam)?.statistics || [];
  const awayStats: any[] = teams.find((t) => !isHomeTeam(t))?.statistics || [];

  for (const [name, label] of STAT_LABELS) {
    const h = homeStats.find((s) => s.name === name);
    const a = awayStats.find((s) => s.name === name);
    if (!h && !a) continue;
    const suffix = name === 'possessionPct' ? '%' : '';
    stats.push({
      label,
      home: `${h?.displayValue ?? '0'}${suffix}`,
      away: `${a?.displayValue ?? '0'}${suffix}`,
      homeNum: toNum(h?.displayValue),
      awayNum: toNum(a?.displayValue),
    });
  }

  // لاینئەپ
  const rosters: any[] = data.rosters || [];
  const hr = rosters.find((r) => r.homeAway === 'home');
  const ar = rosters.find((r) => r.homeAway === 'away');
  const lineups = hr && ar ? { home: parseLineup(hr), away: parseLineup(ar) } : null;

  return {
    events,
    stats,
    lineups: lineups && (lineups.home.starters.length || lineups.away.starters.length) ? lineups : null,
    venue: data.gameInfo?.venue?.fullName,
    attendance: data.gameInfo?.attendance || undefined,
    referee: data.gameInfo?.officials?.[0]?.displayName || data.gameInfo?.officials?.[0]?.fullName,
  };
}

/* ------------------------------------------------------------------ */
/*  پلەبەندی                                                           */
/* ------------------------------------------------------------------ */

export async function getStandings(leagueSlug: string): Promise<StandingGroup[]> {
  const data = await espnFetch(`${V2_PATH}${leagueSlug}/standings`);
  const nodes: any[] = data.children?.length ? data.children : [data];

  const groups: StandingGroup[] = nodes.map((node) => {
    const rows: StandingRow[] = (node.standings?.entries || []).map((entry: any, i: number) => {
      const val = (name: string) => {
        const s = (entry.stats || []).find((x: any) => x.name === name);
        return Number(s?.value ?? 0);
      };
      return {
        rank: val('rank') || i + 1,
        teamId: Number(entry.team?.id) || 0,
        team: entry.team?.shortDisplayName || entry.team?.displayName || entry.team?.name || '',
        logo: entry.team?.logos?.[0]?.href || '',
        played: val('gamesPlayed'),
        wins: val('wins'),
        draws: val('ties'),
        losses: val('losses'),
        gf: val('pointsFor'),
        ga: val('pointsAgainst'),
        gd: val('pointDifferential'),
        points: val('points'),
      };
    });
    rows.sort((a, b) => a.rank - b.rank);
    return { name: node.name || '', rows };
  });

  return groups.filter((g) => g.rows.length > 0);
}

/* ------------------------------------------------------------------ */
/*  هەواڵ (بە ئینگلیزی، ESPN وەرگێڕانی کوردی نییە)                    */
/* ------------------------------------------------------------------ */

export async function getNews(leagueSlug = 'all', limit = 20): Promise<NewsItem[]> {
  const toItems = (data: any): NewsItem[] =>
    (data.articles || []).map((a: any, i: number) => ({
      id: String(a.id ?? i),
      headline: a.headline || '',
      description: a.description || '',
      url: a.links?.web?.href || '',
      image: a.images?.[0]?.url || '',
      published: a.published || '',
    }));
  const one = async (slug: string, n: number) =>
    toItems(await espnFetch(`${SITE_PATH}${slug}/news?limit=${n}`));

  try {
    const items = await one(leagueSlug, limit);
    if (items.length > 0 || leagueSlug !== 'all') return items;
  } catch (err) {
    if (leagueSlug !== 'all') throw err;
  }

  // 'all' کاری نەکرد: هەواڵی هەر لیگێک جیا دەهێنین و تێکەڵیان دەکەین
  const results = await Promise.allSettled(LEAGUES.map((l) => one(l.slug, 8)));
  const byKey = new Map<string, NewsItem>();
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const n of r.value) byKey.set(n.url || n.id, n);
  }
  const merged = Array.from(byKey.values())
    .sort((a, b) => b.published.localeCompare(a.published))
    .slice(0, limit);
  if (merged.length === 0) throw new Error('No news');
  return merged;
}
