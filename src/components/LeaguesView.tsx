import { Trophy } from 'lucide-react';

const LEAGUES = [
  {
    id: 2,
    name: 'UEFA Champions League',
    country: 'ئەوروپا',
    logo: 'https://api-sports.io',
  },
  {
    id: 39,
    name: 'Premier League',
    country: 'ئینگلتەرا',
    logo: 'https://api-sports.io',
  },
  {
    id: 140,
    name: 'La Liga',
    country: 'ئیسپانیا',
    logo: 'https://api-sports.io',
  },
  {
    id: 135,
    name: 'Serie A',
    country: 'ئیتاڵیا',
    logo: 'https://api-sports.io',
  },
  {
    id: 78,
    name: 'Bundesliga',
    country: 'ئەڵمانیا',
    logo: 'https://api-sports.io',
  },
  {
    id: 61,
    name: 'Ligue 1',
    country: 'فەڕەنسا',
    logo: 'https://api-sports.io',
  },
  {
    id: 307,
    name: 'Saudi Pro League',
    country: 'سعودیە',
    logo: 'https://api-sports.io',
  },
];

export function LeaguesView() {
  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">خولە سەرەکییەکان</h2>
          <p className="text-xs text-gray-400">چامپیۆنزلیگ، ٥ خولە گەورەکەی ئەوروپا و خولی ڕۆشەنی سعودی</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEAGUES.map((league) => (
          <div
            key={league.id}
            className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-slate-900/80 p-5 transition hover:border-emerald-500/40 hover:bg-slate-900"
          >
            <div>
              <h3 className="text-base font-extrabold text-white">{league.name}</h3>
              <p className="mt-1 text-xs text-gray-400">{league.country}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/95 p-2">
              <img
                src={league.logo}
                alt={league.name}
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
