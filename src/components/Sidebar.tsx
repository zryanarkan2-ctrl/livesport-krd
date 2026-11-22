import type { Match } from '@/types';
import { TeamLogo } from './TeamLogo';
import { Trophy, Radio, MapPin, Flame } from 'lucide-react';

interface Props {
  matches: Match[];
  onMatchClick: (m: Match) => void;
  onLeagueClick: () => void;
}

const TOP_LEAGUES = [
  { id: 2, name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { id: 39, name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { id: 140, name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { id: 135, name: 'Serie A', logo: 'https://api-sports.io' },
  { id: 78, name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { id: 61, name: 'Ligue 1', logo: 'https://media.api-sports.io/football/leagues/61.png' },
  { id: 307, name: 'Saudi Pro League', logo: 'https://api-sports.io' },
];

export function Sidebar({ matches, onMatchClick, onLeagueClick }: Props) {
  const liveMatch = matches.find((m) => m.status === 'live') ?? null;

  return (
    <aside className="flex flex-col gap-4">
      {/* Featured Live Match */}
      {liveMatch && (
        <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-slate-800/60 to-slate-850">
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <Flame className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">یاری ڕاستەوخۆ</span>
            <span className="mr-auto flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-emerald-400">
                {liveMatch.minute}'
              </span>
            </span>
          </div>
          <button
            onClick={() => onMatchClick(liveMatch)}
            className="w-full p-4 text-right transition-colors hover:bg-white/[0.02]"
          >
            <div className="mb-3 flex items-center gap-2">
              <img
                src={liveMatch.leagueLogo}
                alt=""
                className="h-4 w-4 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-[11px] font-semibold text-gray-400">
                {liveMatch.league}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-1 flex-col items-center gap-2">
                <TeamLogo team={liveMatch.home} size={36} />
                <span className="truncate text-xs font-semibold text-white">
                  {liveMatch.home.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-2xl font-extrabold tabular-nums">
                <span className="text-emerald-400">{liveMatch.scoreHome}</span>
                <span className="text-gray-600">-</span>
                <span className="text-emerald-400">{liveMatch.scoreAway}</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <TeamLogo team={liveMatch.away} size={36} />
                <span className="truncate text-xs font-semibold text-white">
                  {liveMatch.away.name}
                </span>
              </div>
            </div>
            {liveMatch.stadium && (
              <div className="mt-3 flex items-center justify-center gap-1 text-[11px] text-gray-500">
                <MapPin className="h-3 w-3" />
                {liveMatch.stadium}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Top Leagues */}
      <div className="rounded-2xl border border-white/[0.06] bg-slate-800/40">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <Trophy className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">خولە سەرەکییەکان</span>
        </div>
        <div className="p-2">
          {TOP_LEAGUES.map((l) => (
            <button
              key={l.id}
              onClick={onLeagueClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right transition-colors hover:bg-white/5"
            >
              <img
                src={l.logo}
                alt=""
                loading="lazy"
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-sm font-medium text-gray-300 hover:text-white">
                {l.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Live indicator summary */}
      <div className="rounded-2xl border border-white/[0.06] bg-slate-800/40 p-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">ئاماری خێرا</span>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">یاریی ڕاستەوخۆ</span>
            <span className="font-bold text-emerald-400">
              {matches.filter((m) => m.status === 'live').length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">یاری کۆتاییهاتوو</span>
            <span className="font-bold text-gray-300">
              {matches.filter((m) => m.status === 'finished').length}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">یاری دەستپێنەکردوو</span>
            <span className="font-bold text-amber-400">
              {matches.filter((m) => m.status === 'upcoming').length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
