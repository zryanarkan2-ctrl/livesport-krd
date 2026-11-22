import { Newspaper, Clock } from 'lucide-react';

const news = [
  {
    title: 'Barcelona بەرامبەر Villarreal لە La Liga — شوێنپێهەوانەی ڕاستەوخۆ',
    excerpt: 'یاری گرنگی ئەم هەفتەیە لە خولی ئیسپانی بەردەوامە بەدوای دەرئەنجامی سەرەکیدا.',
    time: '١٠ خولەک لەمەوبەر',
    tag: 'La Liga',
  },
  {
    title: 'Ajax دژی ADO Den Haag لە Eredivisie',
    excerpt: 'یاری ئەم هەفتەیە لە خولی هۆڵەندا چاوەڕێی ئەنجامی باش دەکرێت.',
    time: '٢٥ خولەک لەمەوبەر',
    tag: 'Eredivisie',
  },
  {
    title: 'Süper Lig: Konyaspor دژی Beşiktaş',
    excerpt: 'یارییەکی گرنگی خولی تورکیا لە نێوان دوو تیمی ناوداردا.',
    time: '٣ کاتژمێر لەمەوبەر',
    tag: 'Süper Lig',
  },
  {
    title: 'Champions League: ئامادەکاری بۆ قۆناغی داهاتوو',
    excerpt: 'تیمە گەورەکانی ئەورووپا ئامادەکاری دەکەن بۆ قۆناغی کۆتایی پاڵەوانێتی.',
    time: '٥ کاتژمێر لەمەوبەر',
    tag: 'UCL',
  },
  {
    title: 'Saudi Pro League: بەردەوامیی خولە سعودیە بۆ قۆناغی کۆتایی',
    excerpt: 'یارییەکانی خولی سعودیە بەردەوامن بە ئاستێکی بەرز و یاریزانە ناودارەکان.',
    time: 'دوێنێ',
    tag: 'Saudi Pro League',
  },
];

export function NewsView() {
  return (
    <div className="animate-fadeIn">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-extrabold text-white">
        <Newspaper className="h-5 w-5 text-emerald-400" />
        هەواڵەکان
      </h2>
      <div className="space-y-3">
        {news.map((n, i) => (
          <article
            key={i}
            className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-slate-800/40 p-4 transition-all hover:border-emerald-500/30 hover:bg-slate-750"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                {n.tag}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Clock className="h-3 w-3" />
                {n.time}
              </span>
            </div>
            <h3 className="mb-1 text-sm font-bold text-white transition-colors group-hover:text-emerald-400">
              {n.title}
            </h3>
            <p className="text-xs text-gray-400">{n.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
