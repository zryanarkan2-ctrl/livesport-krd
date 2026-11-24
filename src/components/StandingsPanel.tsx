import { useEffect, useState } from 'react';
import { STANDINGS_LEAGUES, getStandings } from '@/lib/espn';
import type { StandingGroup } from '@/lib/espn-types';
import { TeamStar } from './MatchActions';

/** خشتەی پلەبەندی. لیگێک هەڵبژێرە و خشتەکەی دەهێنێت */
export function StandingsPanel({ initialSlug = 'eng.1' }: { initialSlug?: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [groups, setGroups] = useState<StandingGroup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setGroups(null);
    getStandings(slug)
      .then((g) => !cancelled && setGroups(g))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <section dir="rtl" className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STANDINGS_LEAGUES.map((l) => (
          <button
            key={l.slug}
            type="button"
            onClick={() => setSlug(l.slug)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              slug === l.slug
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                : 'border-white/[0.06] bg-slate-800/40 text-gray-300 hover:bg-slate-800'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {loading && <p className="py-10 text-center text-gray-400">چاوەڕێ بە...</p>}
      {!loading && (error || (groups && groups.length === 0)) && (
        <p className="rounded-2xl border border-white/[0.06] bg-slate-800/40 py-10 text-center text-gray-400">
          پلەبەندی ئەم لیگە بەردەست نییە
        </p>
      )}

      {groups?.map((g, gi) => (
        <div key={gi} className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-slate-800/40">
          {groups.length > 1 && g.name && <h3 className="px-4 pt-3 font-semibold text-white">{g.name}</h3>}
          <table className="w-full min-w-[520px] text-sm" dir="ltr">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="px-3 py-3 text-start font-normal">#</th>
                <th className="px-3 py-3 text-start font-normal">Team</th>
                <th className="px-2 py-3 font-normal">P</th>
                <th className="px-2 py-3 font-normal">W</th>
                <th className="px-2 py-3 font-normal">D</th>
                <th className="px-2 py-3 font-normal">L</th>
                <th className="px-2 py-3 font-normal">GF</th>
                <th className="px-2 py-3 font-normal">GA</th>
                <th className="px-2 py-3 font-normal">GD</th>
                <th className="px-3 py-3 font-semibold text-slate-200">Pts</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r.teamId || r.team} className="border-t border-white/[0.06] text-center text-slate-200">
                  <td className="px-3 py-2.5 text-start text-gray-400">{r.rank}</td>
                  <td className="px-3 py-2.5 text-start">
                    <div className="flex items-center gap-2">
                      {r.logo && <img src={r.logo} alt="" className="h-5 w-5 object-contain" />}
                      <span className="font-medium">{r.team}</span>
                      <TeamStar teamId={r.teamId} size="h-3.5 w-3.5" />
                    </div>
                  </td>
                  <td className="px-2">{r.played}</td>
                  <td className="px-2">{r.wins}</td>
                  <td className="px-2">{r.draws}</td>
                  <td className="px-2">{r.losses}</td>
                  <td className="px-2">{r.gf}</td>
                  <td className="px-2">{r.ga}</td>
                  <td className="px-2">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                  <td className="px-3 font-bold text-white">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}
