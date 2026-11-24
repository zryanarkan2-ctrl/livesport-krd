import { useEffect, useState } from 'react';
import { getNews } from '@/lib/espn';
import type { NewsItem } from '@/lib/espn-types';

/** هەواڵی تۆپی پێ لە ESPN. تێبینی: هەواڵەکان بە ئینگلیزین، ESPN وەرگێڕانی کوردی نییە */
export function NewsList({ leagueSlug = 'all', limit = 12 }: { leagueSlug?: string; limit?: number }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNews(leagueSlug, limit)
      .then((n) => !cancelled && setItems(n.filter((x) => x.url && x.headline)))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [leagueSlug, limit]);

  if (error) return <p className="py-10 text-center text-gray-400">هەواڵەکان بەردەست نین</p>;
  if (!items) return <p className="py-10 text-center text-gray-400">چاوەڕێ بە...</p>;

  return (
    <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
      {items.map((n) => (
        <a
          key={n.id}
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-800/40 transition hover:border-emerald-500/50"
        >
          {n.image && <img src={n.image} alt="" loading="lazy" className="h-40 w-full object-cover" />}
          <div className="space-y-1 p-4" dir="ltr">
            <h3 className="font-semibold text-white group-hover:text-emerald-300">{n.headline}</h3>
            <p className="line-clamp-2 text-sm text-gray-400">{n.description}</p>
            {n.published && (
              <p className="pt-1 text-xs text-gray-500">{new Date(n.published).toLocaleDateString('en-GB')} · ESPN</p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
