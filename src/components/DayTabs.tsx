import { useRef } from 'react';
import { Calendar, Radio, RefreshCw, Star } from 'lucide-react';
import type { DayKey } from '@/lib/espn-types';

interface Props {
  value: DayKey;
  onChange: (day: DayKey) => void;
  liveCount?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  favOnly?: boolean;
  onToggleFav?: () => void;
}

const TABS: Array<{ key: DayKey; label: string }> = [
  { key: 'live', label: 'ڕاستەوخۆ' },
  { key: 'yesterday', label: 'دوێنێ' },
  { key: 'today', label: 'ئەمڕۆ' },
  { key: 'tomorrow', label: 'سبەی' },
];

/** تابەکانی ڕۆژ + هەڵبژاردنی بەروار + نوێکردنەوە + تەنها بەدڵەکان */
export function DayTabs({
  value,
  onChange,
  liveCount = 0,
  onRefresh,
  refreshing = false,
  favOnly = false,
  onToggleFav,
}: Props) {
  const dateRef = useRef<HTMLInputElement | null>(null);
  const isCustom = /^\d{8}$/.test(value);
  const dateInputValue = isCustom ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}` : '';

  const openPicker = () => {
    const el = dateRef.current;
    if (!el) return;
    try {
      el.showPicker();
    } catch {
      el.focus();
    }
  };

  const pill = (active: boolean) =>
    `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
      active
        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
        : 'border-white/[0.06] bg-slate-800/40 text-gray-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="flex min-w-0 flex-1 gap-1 rounded-xl border border-white/[0.06] bg-slate-800/40 p-1">
        {TABS.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-all ${
                active
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {t.key === 'live' && <Radio className="h-4 w-4" />}
              {t.label}
              {t.key === 'live' && liveCount > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[11px] leading-5 ${
                    active ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {liveCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <button type="button" onClick={openPicker} className={pill(isCustom)} aria-label="هەڵبژاردنی بەروار">
          <Calendar className="h-4 w-4" />
          <span>{isCustom ? dateInputValue.replace(/-/g, '/') : 'بەروار'}</span>
        </button>
        <input
          ref={dateRef}
          type="date"
          value={dateInputValue}
          onChange={(e) => {
            const v = e.target.value.replace(/-/g, '');
            if (/^\d{8}$/.test(v)) onChange(v);
          }}
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0 [color-scheme:dark]"
        />
      </div>

      {onToggleFav && (
        <button
          type="button"
          onClick={onToggleFav}
          className={pill(favOnly)}
          aria-pressed={favOnly}
          title="تەنها یاری تیمە بەدڵەکان"
        >
          <Star className={`h-4 w-4 ${favOnly ? 'fill-emerald-400' : ''}`} />
          <span className="hidden sm:inline">بەدڵەکان</span>
        </button>
      )}

      {onRefresh && (
        <button type="button" onClick={onRefresh} className={pill(false)}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">نوێکردنەوەی ئەنجامەکان</span>
        </button>
      )}
    </div>
  );
}
