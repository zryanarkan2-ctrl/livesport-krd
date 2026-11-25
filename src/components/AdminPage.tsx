import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Lock, LogOut, Plus, Trash2 } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { supabaseReady } from '@/lib/config';
import {
  addLink,
  adminLogin,
  adminLogout,
  deleteLink,
  getAdminSession,
  useWatchLinks,
} from '@/lib/watchLinks';
import type { DayKey, MatchX } from '@/lib/espn-types';

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await adminLogin(email, password);
      onDone();
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'هەڵە');
    } finally {
      setBusy(false);
    }
  };

  const input =
    'w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50';
  return (
    <form onSubmit={submit} className="mx-auto mt-20 max-w-sm space-y-3 rounded-2xl border border-white/[0.06] bg-slate-850 p-6">
      <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
        <Lock className="h-5 w-5 text-emerald-400" />
        چوونەژوورەوەی ئەدمین
      </h1>
      <input className={input} type="email" dir="ltr" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={input} type="password" dir="ltr" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-xs text-red-400">{err}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">
        {busy ? 'چاوەڕێ بە...' : 'چوونەژوورەوە'}
      </button>
    </form>
  );
}

function MatchRow({ match }: { match: MatchX }) {
  const all = useWatchLinks();
  const links = all[match.id] ?? [];
  const [title, setTitle] = useState('بینین');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await addLink(match.id, title, url);
      setUrl('');
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'هەڵە');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteLink(id);
    } catch (x) {
      setErr(x instanceof Error ? x.message : 'هەڵە');
    }
  };

  const input = 'rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50';
  return (
    <div className="rounded-xl border border-white/[0.06] bg-slate-800/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2 text-sm">
        <span className="font-bold text-white">
          {match.home.name} - {match.away.name}
        </span>
        <span className="text-xs text-gray-500">
          {match.league} · {match.kickoff}
        </span>
      </div>

      {links.length > 0 && (
        <ul className="mb-2 space-y-1">
          {links.map((l) => (
            <li key={l.id} className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-2 py-1.5 text-xs">
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-bold text-emerald-400">
                {l.title}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="min-w-0 flex-1 truncate text-gray-500" dir="ltr">
                {l.url}
              </span>
              <button type="button" onClick={() => remove(l.id)} aria-label="سڕینەوە" className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input className={`${input} w-28`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ناو" />
        <input className={`${input} min-w-0 flex-1`} dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required />
        <button disabled={busy} className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">
          <Plus className="h-4 w-4" />
          زیادکردن
        </button>
      </form>
      {err && <p className="mt-1 text-xs text-red-400">{err}</p>}
    </div>
  );
}

const DAYS: Array<{ key: DayKey; label: string }> = [
  { key: 'yesterday', label: 'دوێنێ' },
  { key: 'today', label: 'ئەمڕۆ' },
  { key: 'tomorrow', label: 'سبەی' },
];

function Panel({ onLogout }: { onLogout: () => void }) {
  const [day, setDay] = useState<DayKey>('today');
  const { matches, loading, error } = useMatches(day);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-white">پەڕەی ئەدمین · لینکی بینین</h1>
        <div className="flex items-center gap-3 text-xs">
          <a href="/" className="text-gray-400 hover:text-white">
            سایتەکە
          </a>
          <button type="button" onClick={onLogout} className="flex items-center gap-1 text-red-400 hover:text-red-300">
            <LogOut className="h-4 w-4" />
            دەرچوون
          </button>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-slate-800/40 p-1">
        {DAYS.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDay(d.key)}
            className={`flex-1 rounded-lg py-2 text-sm font-bold ${
              day === d.key ? 'bg-emerald-500 text-slate-950' : 'text-gray-400 hover:text-white'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        تەنها لینکی ڕێگەپێدراو دابنێ (کەناڵی ڕەسمی، YouTube ی ڕەسمی، لاپەڕەی ڕەسمی کەناڵ). لینکەکە دەبێت بە https:// دەست پێ بکات.
      </p>

      {loading && matches.length === 0 && <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" />}
      {error && <p className="text-center text-sm text-red-400">یاریەکان نەهێنران</p>}
      {!loading && !error && matches.length === 0 && <p className="text-center text-sm text-gray-400">یاری نییە</p>}

      <div className="space-y-2">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}

export function AdminPage() {
  const [state, setState] = useState<'loading' | 'out' | 'in'>('loading');

  const check = async () => setState((await getAdminSession()) ? 'in' : 'out');
  useEffect(() => {
    check();
  }, []);

  let body;
  if (!supabaseReady()) {
    body = (
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-200">
        Supabase هێشتا ڕێک نەخراوە. لە فایلی <code dir="ltr">src/lib/config.ts</code> دوو نرخەکە (URL و anon key) دابنێ.
      </div>
    );
  } else if (state === 'loading') {
    body = <Loader2 className="mx-auto mt-24 h-6 w-6 animate-spin text-emerald-400" />;
  } else if (state === 'out') {
    body = <Login onDone={check} />;
  } else {
    body = (
      <Panel
        onLogout={() => {
          adminLogout();
          setState('out');
        }}
      />
    );
  }
  return <div className="min-h-screen bg-slate-950 text-white">{body}</div>;
}
