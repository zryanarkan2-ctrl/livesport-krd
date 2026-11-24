import { useCallback, useEffect, useRef, useState } from 'react';
import { getMatchesFor } from '@/lib/espn';
import type { DayKey, MatchX } from '@/lib/espn-types';

const BASE_TITLE = typeof document !== 'undefined' ? document.title : '';

/**
 * یاریەکانی ڕۆژێک یان تابی 'live' دەهێنێت و خۆکار نوێیان دەکاتەوە:
 *  - ٣٠ چرکە ئەگەر یاری زیندوو هەبێت
 *  - ٢ خولەک بۆ "ئەمڕۆ" ئەگەر یاری زیندوو نەبێت
 *  - بۆ دوێنێ و سبەی و بەرواری تر تەنها ئەگەر زیندوو هەبێت
 *  - کاتێک تابەکە شاراوەیە ڕادەوەستێت و کە گەڕایەوە دەستبەجێ نوێ دەبێتەوە
 */
export function useMatches(day: DayKey, enabled = true) {
  const [matches, setMatches] = useState<MatchX[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const reqId = useRef(0);

  const load = useCallback(
    async (opts: { force?: boolean; silent?: boolean } = {}) => {
      const id = ++reqId.current;
      if (!opts.silent) setLoading(true);
      try {
        const data = await getMatchesFor(day, { force: opts.force });
        if (id !== reqId.current) return; // وەڵامی کۆن، ڕۆژەکە گۆڕاوە
        setMatches(data);
        setError(null);
        setUpdatedAt(Date.now());
      } catch (e) {
        if (id !== reqId.current) return;
        // لە نوێبوونەوەی بێدەنگدا، یاریەکانی پێشوو بهێڵەوە
        if (!opts.silent) setError(e instanceof Error ? e.message : 'Failed to fetch');
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [day],
  );

  // بارکردن کاتێک ڕۆژ دەگۆڕێت
  useEffect(() => {
    if (!enabled) return;
    setMatches([]);
    load();
    return () => {
      reqId.current += 1;
    };
  }, [load, enabled]);

  const hasLive = matches.some((m) => m.status === 'live');
  const liveN = matches.filter((m) => m.status === 'live').length;

  // ژمارەی یاری زیندوو لە ناونیشانی تابی وێبگەڕ: "(2) Live Sport KRD"
  useEffect(() => {
    if (!enabled || !BASE_TITLE || (day !== 'today' && day !== 'live')) return;
    document.title = liveN > 0 ? `(${liveN}) ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [liveN, day, enabled]);

  // نوێبوونەوەی خۆکار
  useEffect(() => {
    const interval = hasLive ? 30_000 : day === 'today' ? 120_000 : 0;
    if (!enabled || !interval) return;

    const tick = () => {
      if (!document.hidden) load({ force: true, silent: true });
    };
    const id = window.setInterval(tick, interval);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [hasLive, day, load, enabled]);

  const refresh = useCallback(() => load({ force: true }), [load]);

  return { matches, loading, error, updatedAt, hasLive, refresh };
}
