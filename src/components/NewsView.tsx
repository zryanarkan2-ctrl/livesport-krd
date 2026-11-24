import { useState } from 'react';
import { Newspaper, Clock, ChevronDown } from 'lucide-react';
import { NEWS } from '@/data/news';

export function NewsView() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="animate-fadeIn">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-white">
        <Newspaper className="h-5 w-5 text-emerald-400" />
        هەواڵەکان
      </h2>

      {NEWS.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-slate-800/40 py-14 text-center text-gray-400">
          ئێستا هیچ هەواڵێک نییە
        </div>
      ) : (
        <div className="space-y-3">
          {NEWS.map((n) => {
            const isOpen = open === n.id;
            return (
              <article
                key={n.id}
                className="group rounded-2xl border border-white/[0.06] bg-slate-800/40 p-4 transition-all hover:border-emerald-500/30 hover:bg-slate-750"
              >
                <button
                  type="button"
                  onClick={() => n.body && setOpen(isOpen ? null : n.id)}
                  className={`block w-full text-right ${n.body ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                      {n.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500">
                      <Clock className="h-3 w-3" />
                      {n.date.replace(/-/g, '/')}
                    </span>
                    {n.body && (
                      <ChevronDown
                        className={`mr-auto h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                  <h3 className="mb-1 text-sm font-bold text-white transition-colors group-hover:text-emerald-400">
                    {n.title}
                  </h3>
                  <p className="text-xs text-gray-400">{n.excerpt}</p>
                </button>
                {n.body && isOpen && (
                  <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-6 text-gray-300">{n.body}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
