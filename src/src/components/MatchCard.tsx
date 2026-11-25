import type { MatchX } from '@/lib/espn-types';
import { TeamLogo } from './TeamLogo';
import { ReminderBell, TeamStar } from './MatchActions';
import { formatKickoff } from '@/api';
import { ChevronLeft, Play } from 'lucide-react';
import { useWatchLinks } from '@/lib/watchLinks';

interface Props {
  match: MatchX;
  onClick: () => void;
}

/** دۆخی ئەو یاریانەی نەکراون یان ڕاگیراون (لە espn.ts دێت) */
const CALLED_OFF = ['دواخرا', 'هەڵوەشایەوە', 'ڕاگیرا', 'دواکەوت'];

export function MatchCard({ match, onClick }: Props) {
  const hasWatch = (useWatchLinks()[match.id]?.length ?? 0) > 0;
  const hasScore =
    (match.status === 'live' || match.status === 'finished') &&
    match.scoreHome != null &&
    match.scoreAway != null;

  const homeWin = hasScore && (match.scoreHome ?? 0) > (match.scoreAway ?? 0);
  const awayWin = hasScore && (match.scoreAway ?? 0) > (match.scoreHome ?? 0);
  const isLive = match.status === 'live';
  const isHalfTime = isLive && match.statusShort === 'نیوەکات';
  const isCalledOff = CALLED_OFF.includes(match.statusShort);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-right transition-all duration-200 ${
        isLive
          ? 'border-emerald-500/20 bg-emerald-500/[0.03] hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]'
          : 'border-white/[0.04] bg-slate-800/40 hover:border-white/10 hover:bg-slate-750'
      }`}
    >
      {/* Status / time column */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-1">
        {isLive ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-center text-[11px] font-bold leading-tight tabular-nums text-emerald-400">
              {isHalfTime || match.minute == null ? match.statusShort : `${match.minute}'`}
            </span>
          </>
        ) : isCalledOff ? (
          <span className="text-center text-[10px] font-bold leading-tight text-amber-400">
            {match.statusShort}
          </span>
        ) : match.status === 'finished' ? (
          <span className="text-center text-[10px] font-bold leading-tight text-gray-500">
            {match.statusShort || 'تەواو بوو'}
          </span>
        ) : (
          <span className="text-xs font-bold tabular-nums text-emerald-400">
            {formatKickoff(match.kickoff)}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex flex-1 items-center justify-between gap-2">
        {/* Home (right in RTL) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <TeamStar teamId={match.home.id} size="h-3.5 w-3.5" />
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
          <TeamStar teamId={match.away.id} size="h-3.5 w-3.5" />
        </div>
      </div>

      {hasWatch && (
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
          <Play className="h-3 w-3" />
          <span className="hidden sm:inline">بینین</span>
        </span>
      )}

      <ReminderBell match={match} />

      {/* Arrow */}
      <ChevronLeft className="h-4 w-4 shrink-0 text-gray-600 transition-colors group-hover:text-emerald-400" />
    </div>
  );
}
