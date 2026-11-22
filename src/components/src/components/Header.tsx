import { Trophy, Calendar, Newspaper, Radio, Search, Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';

interface Props {
  active: string;
  onNav: (item: string) => void;
}

const navItems = [
  { id: 'today', label: 'یارییەکانی ئەمڕۆ', icon: Calendar },
  { id: 'leagues', label: 'خولەکان', icon: Trophy },
  { id: 'news', label: 'هەواڵەکان', icon: Newspaper },
  { id: 'live', label: 'پەخشی ڕاستەوخۆ', icon: Radio },
];

export function Header({ active, onNav }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => onNav('today')}
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <Activity className="h-5 w-5 text-slate-950" strokeWidth={2.8} />
          </div>
          <div className="text-right leading-tight">
            <span className="block text-base font-extrabold text-white">
              Live Sport KRD
            </span>
            <span className="block text-[10px] font-medium text-emerald-400">
              پەخشی زیندووی وەرزشی
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-2 text-sm text-gray-500 sm:flex">
            <Search className="h-4 w-4" />
            <span className="text-xs">گەڕان بەدوای یانە یان خول...</span>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="animate-slideUp border-t border-white/[0.06] bg-slate-950 md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNav(item.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
