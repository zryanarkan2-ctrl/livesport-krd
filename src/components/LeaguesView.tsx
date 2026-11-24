import { Trophy } from 'lucide-react';
import { StandingsPanel } from './StandingsPanel';

export function LeaguesView() {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-white">
        <Trophy className="h-5 w-5 text-emerald-400" />
        خولەکان
      </h2>
      <StandingsPanel />
    </div>
  );
}
