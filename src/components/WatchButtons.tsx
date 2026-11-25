import { ExternalLink, Play } from 'lucide-react';
import type { WatchLink } from '@/lib/watchLinks';

/** دوگمەکانی بینین لەناو وردەکاری یاری */
export function WatchButtons({ links }: { links: WatchLink[] }) {
  if (!links.length) return null;
  return (
    <div className="border-b border-white/[0.06] p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
        <Play className="h-3.5 w-3.5" />
        بینینی یاری
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            {l.title}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
