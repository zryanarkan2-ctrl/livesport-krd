import { CalendarOff } from 'lucide-react';
import type { DayKey } from '@/lib/espn-types';

interface Props {
  day: DayKey;
  hasSearch?: boolean;
  onGoToday?: () => void;
}

/** نامەی ڕۆژی بەتاڵ، بۆ ئەوەی بەکارهێنەر وا نەزانێت سایتەکە خراپە */
export function EmptyDay({ day, hasSearch, onGoToday }: Props) {
  let title = 'هیچ یاریەک نییە بۆ ئەم ڕۆژە';
  let hint = 'لە هەندێک ڕۆژ، لیگە گەورەکان یاری ناکەن. ڕۆژێکی تر هەڵبژێرە.';

  if (hasSearch) {
    title = 'هیچ ئەنجامێک نەدۆزرایەوە';
    hint = 'ناوی تیم یان لیگێکی تر تاقی بکەرەوە.';
  } else if (day === 'live') {
    title = 'ئێستا هیچ یاریەک ڕاستەوخۆ نییە';
    hint = 'تابی «ئەمڕۆ» ببینە بۆ ئەو یاریانەی دەستپێدەکەن.';
  }

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-slate-800/40 px-6 py-14 text-center"
    >
      <CalendarOff className="h-10 w-10 text-gray-500" />
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="max-w-sm text-sm text-gray-400">{hint}</p>
      {onGoToday && day !== 'today' && !hasSearch && (
        <button
          type="button"
          onClick={onGoToday}
          className="mt-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400"
        >
          بڕۆ بۆ ئەمڕۆ
        </button>
      )}
    </div>
  );
}
