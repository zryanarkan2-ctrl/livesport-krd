import type { Match } from '@/types';
import { TeamLogo } from './TeamLogo';
import { formatKickoff } from '@/api';
import { ChevronLeft } from 'lucide-react';

interface Props {
  match: Match;
  onClick: () => void;
}

export function MatchCard({ match, onClick }: Props) {
  const hasScore =
    (match.status === 'live' || match.status === 'finished') &&
    match.scoreHome != null &&
    match.scoreAway != null;

  const homeWin = hasScore && (match.scoreHome ?? 0) > (match.scoreAway ?? 0);
  const awayWin = hasScore && (match.scoreAway ?? 0) > (match.scoreHome ?? 0);
  const isLive = match.status === 'live';

  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-right transition-all duration-200 ${
        isLive
          ? 'border-emerald-500/20 bg-emerald-500/[0.03] hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]'
          : 'border-white/[0.04] bg-slate-800/40 hover:border-white/10 hover:bg-slate-750'
      }`}
    >
      {/* Status / time column */}
      <div className="flex w-12 shrink-0 flex-col items-center gap-1">
        {isLive ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tabular-nums text-emerald-400">
              {match.minute}'
            </span>
          </>
        ) : (
          <span
            className={`text-xs font-bold tabular-nums ${
              match.status === 'finished' ? 'text-gray-500' : 'text-emerald-400'
            }`}
          >
            {formatKickoff(match.kickoff)}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex flex-1 items-center justify-between gap-2">
        {/* Home (right in RTL) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span
            className={`truncate text-sm font-semibold ${
              homeWin ? 'text-white' : 'text-gray-300'
            }`}
          >
            {match.home.name}
          </span>
          <TeamLogo team={match.home} size={26} />
        </div>

        {/* Score / VS */}
        <div className="flex shrink-0 items-center gap-1.5 px-1">
          {hasScore ? (
            <>
              <span
                className={`min-w-[16px] text-center text-base font-extrabold tabular-nums ${
                  homeWin ? 'text-emerald-400' : 'text-gray-300'
                }`}
              >
                {match.scoreHome}
              </span>
              <span className="text-xs text-gray-600">-</span>
              <span
                className={`min-w-[16px] text-center text-base font-extrabold tabular-nums ${
                  awayWin ? 'text-emerald-400' : 'text-gray-300'
                }`}
              >
                {match.scoreAway}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-gray-600">VS</span>
          )}
        </div>

        {/* Away (left in RTL) */}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <TeamLogo team={match.away} size={26} />
          <span
            className={`truncate text-sm font-semibold ${
              awayWin ? 'text-white' : 'text-gray-300'
            }`}
          >
            {match.away.name}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronLeft className="h-4 w-4 shrink-0 text-gray-600 transition-colors group-hover:text-emerald-400" />
    </button>
  );
}
