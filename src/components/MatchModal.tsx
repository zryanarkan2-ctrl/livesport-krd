import type { Match } from '@/types';
import { TeamLogo } from './TeamLogo';
import { StatusBadge } from './StatusBadge';
import { formatKickoff } from '@/api';
import { X, MapPin, Play, BarChart3, Users, Video, Info, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Props {
  match: Match;
  onClose: () => void;
}

const statLabels: { key: keyof NonNullable<Match['stats']>; label: string }[] = [
  { key: 'possession', label: 'خاوەندارێتی %' },
  { key: 'shots', label: 'تیرەکان' },
  { key: 'shotsOnTarget', label: 'تیری ڕاست' },
  { key: 'corners', label: 'گۆشەکان' },
  { key: 'fouls', label: 'هەڵەکان' },
  { key: 'yellowCards', label: 'کارتەی زەرد' },
  { key: 'redCards', label: 'کارتەی سوور' },
  { key: 'offsides', label: 'ئۆفساید' },
];

export function MatchModal({ match, onClose }: Props) {
  const [tab, setTab] = useState<'stats' | 'lineups' | 'video'>('video');
  const stats = match.stats;
  const hasLineups = !!(match.homeLineup && match.awayLineup);
  const hasStats = !!stats;

  const activeTab: 'stats' | 'lineups' | 'video' =
    tab === 'stats' && !hasStats
      ? hasLineups
        ? 'lineups'
        : 'video'
      : tab === 'lineups' && !hasLineups
        ? 'video'
        : tab;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm animate-fadeIn sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/[0.08] bg-slate-900 shadow-2xl animate-slideUp sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative shrink-0 border-b border-white/[0.06] bg-gradient-to-b from-slate-800/60 to-slate-900 px-5 pb-4 pt-5">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* League */}
          <div className="mb-4 flex items-center justify-center gap-2">
            {match.leagueLogo && (
              <img
                src={match.leagueLogo}
                alt=""
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-xs font-semibold text-gray-400">{match.league}</span>
          </div>

          {/* Teams + score */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 flex-col items-center gap-2">
              <TeamLogo team={match.home} size={56} />
              <span className="text-center text-sm font-bold text-white">
                {match.home.name}
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 px-2">
              <StatusBadge status={match.status} minute={match.minute} />
              {match.status === 'upcoming' ? (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-extrabold tabular-nums text-emerald-400">
                    {formatKickoff(match.kickoff)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(match.kickoff).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-4xl font-extrabold tabular-nums">
                  <span className={match.status === 'live' ? 'text-emerald-400' : 'text-white'}>
                    {match.scoreHome}
                  </span>
                  <span className="text-gray-700">-</span>
                  <span className={match.status === 'live' ? 'text-emerald-400' : 'text-white'}>
                    {match.scoreAway}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col items-center gap-2">
              <TeamLogo team={match.away} size={56} />
              <span className="text-center text-sm font-bold text-white">
                {match.away.name}
              </span>
            </div>
          </div>

          {/* Meta */}
          {match.stadium && (
            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {match.stadium}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-white/[0.06] px-2">
          {[
            { id: 'stats' as const, label: 'ئامارەکان', icon: BarChart3, available: hasStats },
            { id: 'lineups' as const, label: 'ڕیزبەندی', icon: Users, available: hasLineups },
            { id: 'video' as const, label: 'پوختە', icon: Video, available: true },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                disabled={!t.available}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-3 text-xs font-bold transition-all sm:text-sm ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400'
                    : !t.available
                      ? 'cursor-not-allowed border-transparent text-gray-600'
                      : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'stats' && stats && <StatsView match={match} />}
          {activeTab === 'lineups' && hasLineups && <LineupsView match={match} />}
          {activeTab === 'video' && <VideoView match={match} />}
        </div>
      </div>
    </div>
  );
}

function StatsView({ match }: { match: Match }) {
  const stats = match.stats!;
  return (
    <div className="space-y-4">
      {statLabels.map(({ key, label }) => {
        const [home, away] = stats[key];
        const total = home + away || 1;
        const homePct = (home / total) * 100;
        const awayPct = (away / total) * 100;
        const homeHigher = home > away;
        const awayHigher = away > home;

        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span
                className={`tabular-nums font-bold ${awayHigher ? 'text-emerald-400' : 'text-white'}`}
              >
                {away}
              </span>
              <span className="text-xs font-semibold text-gray-400">{label}</span>
              <span
                className={`tabular-nums font-bold ${homeHigher ? 'text-emerald-400' : 'text-white'}`}
              >
                {home}
              </span>
            </div>
            <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-white/5">
              <div className="flex flex-1 justify-end">
                <div
                  className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${homePct}%` }}
                />
              </div>
              <div className="flex flex-1 justify-start">
                <div
                  className="h-full rounded-r-full bg-gray-600 transition-all duration-500"
                  style={{ width: `${awayPct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineupsView({ match }: { match: Match }) {
  const home = match.homeLineup!;
  const away = match.awayLineup!;
  return (
    <div className="space-y-5">
      {[
        { lineup: home, team: match.home },
        { lineup: away, team: match.away },
      ].map(({ lineup, team }) => (
        <div key={team.name}>
          <div className="mb-3 flex items-center gap-2">
            <TeamLogo team={team} size={28} />
            <span className="font-bold text-white">{team.name}</span>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-semibold text-gray-300">
              {lineup.formation}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {lineup.players.map((p) => (
              <div
                key={p.number}
                className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-slate-800/60 p-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-extrabold text-emerald-400 ring-1 ring-emerald-500/20">
                  {p.number}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-gray-500">{p.pos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoView({ match }: { match: Match }) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/[0.06]">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30 transition-transform hover:scale-110">
            <Play className="h-6 w-6 text-slate-950" fill="currentColor" />
          </div>
          <span className="px-4 text-center text-sm font-semibold text-gray-300">
            پوختەی {match.home.name} دژی {match.away.name}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <span className="text-xs text-gray-300">گۆڵ و لاوەکی گرنگ</span>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-xl bg-white/[0.03] p-3 text-xs text-gray-400">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <span>
          پوختەی ڤیدیۆیی دوای کۆتایی هاتنی یاری بەردەست دەبێت. ئێستا تەنها زانیاریی یاری و
          ئەنجامی ڕاستەوخۆ پیشان دەدرێت.
        </span>
      </div>
    </div>
  );
}
