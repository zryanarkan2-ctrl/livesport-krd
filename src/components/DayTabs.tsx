import { Calendar, RefreshCw } from 'lucide-react';

interface Props {
  active: 'yesterday' | 'today' | 'tomorrow';
  onChange: (day: 'yesterday' | 'today' | 'tomorrow') => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const tabs = [
  { id: 'yesterday' as const, label: 'دوێنێ' },
  { id: 'today' as const, label: 'ئەمڕۆ' },
  { id: 'tomorrow' as const, label: 'سبەی' },
];

export function DayTabs({ active, onChange, onRefresh, refreshing }: Props) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex flex-1 items-center gap-1 rounded-xl border border-white/[0.06] bg-slate-800/40 p-1">
        <div className="mr-1 flex items-center gap-1.5 px-2 text-gray-500">
          <Calendar className="h-4 w-4" />
        </div>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-slate-800/40 px-3 py-2.5 text-xs font-semibold text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
          title="نوێکردنەوەی ئەنجامەکان"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">نوێکردنەوەی ئەنجامەکان</span>
        </button>
      )}
    </div>
  );
}
