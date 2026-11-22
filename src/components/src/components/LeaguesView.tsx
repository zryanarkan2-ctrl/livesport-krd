import { Trophy } from 'lucide-react';

const leagues = [
  { name: 'Premier League', country: 'ئینگلتەرا', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { name: 'La Liga', country: 'ئیسپانیا', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { name: 'Serie A', country: 'ئیتاڵیا', logo: 'https://media.api-sports.io/football/leagues/71.png' },
  { name: 'Bundesliga', country: 'ئەڵمانیا', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { name: 'Ligue 1', country: 'فەرەنسا', logo: 'https://media.api-sports.io/football/leagues/61.png' },
  { name: 'Saudi Pro League', country: 'سعودیە', logo: 'https://media.api-sports.io/football/leagues/203.png' },
  { name: 'Egyptian Premier League', country: 'میسر', logo: 'https://media.api-sports.io/football/leagues/218.png' },
  { name: 'Champions League', country: 'ئەورووپا', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { name: 'Süper Lig', country: 'تورکیا', logo: 'https://media.api-sports.io/football/leagues/250.png' },
  { name: 'Eredivisie', country: 'هۆڵەندا', logo: 'https://media.api-sports.io/football/leagues/88.png' },
];

export function LeaguesView() {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-white">
        <Trophy className="h-5 w-5 text-emerald-400" />
        خولەکان
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {leagues.map((l) => (
          <div
            key={l.name}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-slate-800/40 p-4 transition-all hover:border-emerald-500/30 hover:bg-slate-750"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/[0.03]">
              <img
                src={l.logo}
                alt=""
                loading="lazy"
                className="h-8 w-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-white">
                {l.name}
              </span>
              <span className="text-xs text-gray-500">{l.country}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
