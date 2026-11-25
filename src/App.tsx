import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { DayTabs } from '@/components/DayTabs';
import { MatchCard } from '@/components/MatchCard';
import { MatchDetailsModal } from '@/components/MatchDetailsModal';
import { EmptyDay } from '@/components/EmptyDay';
import { LeagueHeader } from '@/components/LeagueHeader';
import { Sidebar } from '@/components/Sidebar';
import { LeaguesView } from '@/components/LeaguesView';
import { filterMatches, groupByLeague } from '@/api';
import { useMatches } from '@/hooks/useMatches';
import { useFavorites } from '@/lib/favorites';
import { restoreReminders } from '@/lib/reminders';
import type { DayKey, MatchX } from '@/lib/espn-types';
import { Radio, Calendar, Loader2, AlertCircle, Activity, Search } from 'lucide-react';

export default function App() {
  const [nav, setNav] = useState('today');
  const [day, setDay] = useState<string>('today');
  const [selected, setSelected] = useState<MatchX | null>(null);
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);

  const { favs } = useFavorites();

  // "پەخشی ڕاستەوخۆ" لە مینیوەکە = تابی ڕاستەوخۆ
  const feedActive = nav === 'today' || nav === 'live';
  const effectiveDay: DayKey = nav === 'live' ? 'live' : day;
  const { matches, loading, error, refresh } = useMatches(effectiveDay, feedActive);

  // بیرهێنەرەوە پاشەکەوتکراوەکان دووبارە چالاک بکەرەوە
  useEffect(() => {
    restoreReminders();
  }, []);

  const liveCount = useMemo(
    () =>
      effectiveDay === 'today' || effectiveDay === 'live'
        ? matches.filter((m) => m.status === 'live').length
        : 0,
    [matches, effectiveDay],
  );

  const displayMatches = useMemo(() => {
    let list = filterMatches(matches, query);
    if (favOnly) {
      list = list.filter(
        (m) => favs.teams.includes(m.home.id) || favs.teams.includes(m.away.id),
      );
    }
    return list;
  }, [matches, query, favOnly, favs]);

  const leagueGroups = useMemo(
    () => groupByLeague(displayMatches),
    [displayMatches],
  );

  const handleDayChange = (d: DayKey) => {
    if (d === 'live') {
      setNav('live');
    } else {
      setDay(d);
      setNav('today');
    }
  };

  const handleQuery = (q: string) => {
    setQuery(q);
    if (!feedActive) setNav('today');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header active={nav} onNav={setNav} query={query} onQuery={handleQuery} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero banner — only on today */}
        {nav === 'today' && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-l from-slate-850 via-slate-800/60 to-slate-850 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/20">
                    <Radio className="h-4 w-4 text-emerald-400" />
                  </span>
                  <span className="text-sm font-bold text-emerald-400">پەخشی زیندوو</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                  یارییەکانی ئەمڕۆ
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  {liveCount > 0
                    ? `${liveCount} یاری ڕاستەوخۆ ئێستا`
                    : 'هەموو یارییەکان بەدوای دەرئەنجامی ڕاستەوخۆدا'}
                </p>
              </div>
              <div className="hidden shrink-0 sm:block">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Calendar className="h-8 w-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Matches section with 2-column layout */}
        {feedActive && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Main feed */}
            <div className="min-w-0 flex-1">
              {/* گەڕان بۆ مۆبایل (لە مینیوی سەرەوە تەنها لە شاشەی گەورە دیارە) */}
              <label className="mb-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-800/40 px-3 py-2.5 text-gray-500 focus-within:border-emerald-500/40 sm:hidden">
                <Search className="h-4 w-4" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="گەڕان بەدوای یانە یان خول..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </label>

              <DayTabs
                value={nav === 'live' ? 'live' : day}
                onChange={handleDayChange}
                liveCount={liveCount}
                onRefresh={refresh}
                refreshing={loading}
                favOnly={favOnly}
                onToggleFav={() => setFavOnly((v) => !v)}
              />

              {loading && matches.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-slate-800/40 py-20">
                  <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
                  <p className="text-sm text-gray-400">چاوەڕوانبە، زانیارییەکان باردەبن...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.03] py-16 text-center">
                  <AlertCircle className="h-10 w-10 text-red-400" />
                  <p className="text-sm text-red-300">نەتوانرا یارییەکان بهێنرێن، تۆڕەکەت بپشکنە</p>
                  <button
                    onClick={refresh}
                    className="mt-1 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/30"
                  >
                    هەوڵبدانەوە
                  </button>
                </div>
              )}

              {!loading && !error && displayMatches.length > 0 && (
                <div className="space-y-1">
                  {leagueGroups.map((group) => (
                    <div key={group.leagueId} className="animate-fadeIn">
                      <LeagueHeader group={group} />
                      <div className="space-y-1.5">
                        {group.matches.map((m) => (
                          <MatchCard
                            key={m.id}
                            match={m}
                            onClick={() => setSelected(m)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && displayMatches.length === 0 && (
                <EmptyDay
                  day={effectiveDay}
                  hasSearch={Boolean(query) || favOnly}
                  onGoToday={() => {
                    setDay('today');
                    setNav('today');
                  }}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="shrink-0 lg:w-80">
              <Sidebar
                matches={matches}
                onMatchClick={setSelected}
                onLeagueClick={() => setNav('leagues')}
              />
            </div>
          </div>
        )}

        {nav === 'leagues' && <LeaguesView />}
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-white/[0.06] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Activity className="h-4 w-4 text-slate-950" strokeWidth={2.8} />
              </div>
              <div className="text-right">
                <span className="block text-sm font-extrabold text-white">Live Sport KRD</span>
                <span className="block text-[10px] text-emerald-400">پەخشی زیندووی وەرزشی</span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500">
              داتا لە ESPN وەرگیراوە • کاتی ناوچەی بەغدا
            </p>
          </div>
        </div>
      </footer>

      <MatchDetailsModal match={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
