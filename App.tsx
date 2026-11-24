import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { DayTabs } from '@/components/DayTabs';
import { MatchCard } from '@/components/MatchCard';
import { MatchModal } from '@/components/MatchModal';
import { LeagueHeader } from '@/components/LeagueHeader';
import { Sidebar } from '@/components/Sidebar';
import { LeaguesView } from '@/components/LeaguesView';
import { getMatches, groupByLeague, clearCache } from '@/api';
import type { Match } from '@/types';
import { Radio, Calendar, Info, Loader2, AlertCircle, Activity } from 'lucide-react';

type Day = 'yesterday' | 'today' | 'tomorrow';

export default function App() {
  const [nav, setNav] = useState('today');
  const [day, setDay] = useState<Day>('today');
  const [selected, setSelected] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = useCallback(
    (targetDay: Day, force = false) => {
      if (force) clearCache(targetDay);
      setLoading(true);
      setError(null);
      getMatches(targetDay)
        .then((data) => setMatches(data))
        .catch((err) => setError(err.message || 'هەڵەیەک ڕوویدا'))
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    if (nav !== 'today' && nav !== 'live') return;
    loadMatches(day);
  }, [day, nav, loadMatches]);

  const liveCount = useMemo(
    () => matches.filter((m) => m.status === 'live').length,
    [matches],
  );

  const displayMatches =
    nav === 'live' ? matches.filter((m) => m.status === 'live') : matches;

  const leagueGroups = useMemo(
    () => groupByLeague(displayMatches),
    [displayMatches],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header active={nav} onNav={setNav} />

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
        {(nav === 'today' || nav === 'live') && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Main feed */}
            <div className="min-w-0 flex-1">
              <DayTabs
                active={day}
                onChange={setDay}
                onRefresh={() => loadMatches(day, true)}
                refreshing={loading}
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
                  <p className="text-sm text-red-300">{error}</p>
                  <button
                    onClick={() => loadMatches(day, true)}
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
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.06] bg-slate-800/40 py-16 text-center">
                  <Info className="h-10 w-10 text-gray-600" />
                  <p className="text-gray-400">هیچ یارییەک لەم ڕۆژەدا بەردەست نییە</p>
                </div>
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
              داتا لە API-Sports وەرگیراوە • کاتی ناوچەی بەغدا
            </p>
          </div>
        </div>
      </footer>

      {selected && (
        <MatchModal match={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
