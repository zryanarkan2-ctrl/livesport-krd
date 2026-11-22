import { Radio } from 'lucide-react';
import type { DayKey } from '@/lib/espn-types';

interface Props {
  value: DayKey;
  onChange: (day: DayKey) => void;
  liveCount?: number;
}

const TABS: Array<{ key: DayKey; label: string }> = [
  { key: 'live', label: 'ڕاستەوخۆ' },
  { key: 'yesterday', label: 'دوێنێ' },
  { key: 'today', label: 'ئەمڕۆ' },
  { key: 'tomorrow', label: 'سبەی' },
];

/** تابەکانی ڕۆژ + هەڵبژاردنی بەروار (calendar) */
export function DayTabs({ value, onChange, liveCount = 0 }: Props) {
  const isCustom = /^\d{8}$/.test(value);
  const dateInputValue = isCustom ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : '';

  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-2">
      <div className="flex flex-1 gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
        {TABS.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-emerald-500 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.key === 'live' && <Radio className="h-4 w-4" />}
              {t.label}
              {t.key === 'live' && liveCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 text-xs leading-5 text-white">{liveCount}</span>
              )}
            </button>
          );
        })}
      </div>

      <label
        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
          isCustom
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
        }`}
      >
        <span>{isCustom ? dateInputValue.replace(/-/g, '/') : 'بەروار'}</span>
        <input
          type="date"
          value={dateInputValue}
          onChange={(e) => {
            const v = e.target.value.replace(/-/g, '');
            if (/^\d{8}$/.test(v)) onChange(v);
          }}
          className="w-0 opacity-0 [color-scheme:dark] focus:w-auto focus:opacity-100"
          aria-label="هەڵبژاردنی بەروار"
        />
      </label>
    </div>
  );
}
