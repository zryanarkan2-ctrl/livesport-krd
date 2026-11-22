import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from '@/components/Header';
import { DayTabs } from '@/components/DayTabs';
import { MatchCard } from '@/components/MatchCard';
import { LeagueHeader } from '@/components/LeagueHeader';
import { Sidebar } from '@/components/Sidebar';
import { LeaguesView } from '@/components/LeaguesView';
import { NewsView } from '@/components/NewsView';
import { getMatches, groupByLeague, clearCache } from '@/api';
import type { Match } from '@/types';
import {
  Radio,
  Calendar,
  Info,
  Loader2,
  AlertCircle,
  Activity,
  Play,
  Tv,
  Youtube,
  Film,
  ArrowRight,
  Lock,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

type Day = 'yesterday' | 'today' | 'tomorrow';

interface StreamLinks {
  match_id: string;
  server_1: string;
  server_2: string;
  youtube_url: string;
  highlights_url: string;
}

const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_KEY = 'sb_publishable_FpHs9PFk69xUttciSQLksg_hUFoSt14';

function formatEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('://youtube.com')) {
    const id = trimmed.split('v=')[1]?.split('&')[0];
    return id ? `https://youtube.com{id}?autoplay=1` : trimmed;
  }
  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://youtube.com{id}?autoplay=1` : trimmed;
  }
  return trimmed;
}

export default function App() {
  const [nav, setNav] = useState('today');
  const [day, setDay] = useState<Day>('today');
  const [selected, setSelected] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeServer, setActiveServer] = useState<'server_1' | 'server_2' | 'youtube_url' | 'highlights_url'>('server_1');
  const [currentStreams, setCurrentStreams] = useState<StreamLinks | null>(null);
  const [loadingStreams, setLoadingStreams] = useState(false);

  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [editingMatchId, setEditingMatchId] = useState<string>('');
  const [formLinks, setFormLinks] = useState<StreamLinks>({
    match_id: '',
    server_1: '',
    server_2: '',
    youtube_url: '',
    highlights_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadMatches = useCallback((targetDay: Day, force = false) => {
    if (force) clearCache(targetDay);
    setLoading(true);
    setError(null);
    getMatches(targetDay)
      .then((data) => setMatches(data))
      .catch((err) => setError(err.message || 'هەڵەیەک ڕوویدا'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (nav !== 'today' && nav !== 'live' && nav !== 'admin') return;
    loadMatches(day);
  }, [day, nav, loadMatches]);

  const fetchStreamsForMatch = async (matchId: string) => {
    setLoadingStreams(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/match_streams?match_id=eq.${matchId}&select=*`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        },
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCurrentStreams(data[0]);
        return data[0] as StreamLinks;
      } else {
        const empty: StreamLinks = {
          match_id: matchId,
          server_1: '',
          server_2: '',
          youtube_url: '',
          highlights_url: '',
        };
        setCurrentStreams(empty);
        return empty;
      }
    } catch {
      return null;
    } finally {
      setLoadingStreams(false);
    }
  };

  const handleOpenMatch = (m: Match) => {
    setSelected(m);
    setActiveServer('server_1');
    fetchStreamsForMatch(m.id);
  };

  const handleSelectAdminMatch = async (matchId: string) => {
    setEditingMatchId(matchId);
    setSaveSuccess(false);
    const existing = await fetchStreamsForMatch(matchId);
    if (existing) {
      setFormLinks(existing);
    } else {
      setFormLinks({
        match_id: matchId,
        server_1: '',
        server_2: '',
        youtube_url: '',
        highlights_url: '',
      });
    }
  };

  const handleSaveStreams = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatchId) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/match_streams`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          match_id: editingMatchId,
          server_1: formLinks.server_1,
          server_2: formLinks.server_2,
          youtube_url: formLinks.youtube_url,
          highlights_url: formLinks.highlights_url,
        }),
      });
      setSaveSuccess(true);
    } catch {
      alert('هەڵەیەک ڕوویدا لە کاتی خەزنکردن');
    } finally {
      setSaving(false);
    }
  };

  const liveCount = useMemo(
    () => matches.filter((m) => m.status === 'live').length,
    [matches],
  );

  const displayMatches =
    nav === 'live' ? matches.filter((m) => m.status === 'live') : matches;

  const leagueGroups = useMemo(
    () => groupByLeague(displayMatches),
    [displayMatches],
  );

  const activeUrl = currentStreams ? formatEmbedUrl(currentStreams[activeServer]) : '';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header
        active={nav}
        onNav={(newNav) => {
          setSelected(null);
          setNav(newNav);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {selected ? (
          <div className="animate-fadeIn space-y-6">
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm font-bold text-gray-300 transition hover:border-emerald-500/40 hover:text-white"
            >
              <ArrowRight className="h-4 w-4 text-emerald-400" />
              گەڕانەوە بۆ خشتەی یارییەکان
            </button>

            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-slate-900 to-slate-900/60 p-6">
              <div className="mb-4 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  {selected.league}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-around">
                <div className="flex flex-col items-center gap-3 text-center">
                  <img
                    src={selected.home.logo}
                    alt={selected.home.name}
                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                  />
                  <h2 className="text-base font-extrabold sm:text-xl">{selected.home.name}</h2>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950 px-6 py-3 text-2xl font-black tracking-wider text-white sm:text-4xl">
                    {selected.status === 'upcoming'
                      ? selected.kickoff
                      : `${selected.scoreHome ?? 0} - ${selected.scoreAway ?? 0}`}
                  </div>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      selected.status === 'live'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selected.status === 'finished'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {selected.status === 'live'
                      ? `ڕاستەوخۆ • ${selected.minute}'`
                      : selected.status === 'finished'
                      ? 'کۆتایی هات'
                      : 'دەستی پێنەکردووە'}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-3 text-center">
                  <img
                    src={selected.away.logo}
                    alt={selected.away.name}
                    className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                  />
                  <h2 className="text-base font-extrabold sm:text-xl">{selected.away.name}</h2>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-slate-900/80 p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveServer('server_1')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    activeServer === 'server_1'
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Tv className="h-4 w-4" />
                  سێرڤەری سەرەکی
                </button>

                <button
                  onClick={() => setActiveServer('server_2')}
className={flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${ activeServer === 'server_2' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25' : 'bg-slate-800 text-gray-300 hover:bg-slate-700' }}
>

سێرڤەری ٢
<button
onClick={() => setActiveServer('youtube_url')}
className={flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${ activeServer === 'youtube_url' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' : 'bg-slate-800 text-gray-300 hover:bg-slate-700' }}
>

یوتیوب
<button
onClick={() => setActiveServer('highlights_url')}
className={flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${ activeServer === 'highlights_url' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25' : 'bg-slate-800 text-gray-300 hover:bg-slate-700' }}
>

کورتەی یاری

{loadingStreams ? (


چاوەڕوانبە، سێرڤەر باردەبێت...

) : activeUrl ? (

) : (





لینکی ئەم سێرڤەرە هێشتا دانەنراوە


کەمێک پێش دەستپێکردنی یارییەکە یان لە سێرڤەرەکانی ترەوە لینکەکە چالاک دەبێت.


)}



) : nav === 'admin' ? (

{!adminUnlocked ? (




پانێڵی بەڕێوەبەری Live Sport KRD

وشەی نهێنی بنووسە بۆ دانان و دەستکاریکردنی لینکی یارییەکان

<form
onSubmit={(e) => {
e.preventDefault();
if (adminPass === 'KRD2026@') {
setAdminUnlocked(true);
setAdminError('');
} else {
setAdminError('وشەی نهێنی هەڵەیە!');
}
}}
className="mx-auto mt-6 max-w-xs space-y-3"
>
<input
type="password"
value={adminPass}
onChange={(e) => setAdminPass(e.target.value)}
placeholder="وشەی نهێنی..."
className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-center text-white focus:border-emerald-500 focus:outline-none"
/>
{adminError && {adminError}}

چوونە ژوورەوە



) : (




بەڕێوەبردنی لینکی یارییەکان

<button
onClick={() => setNav('today')}
className="text-xs text-gray-400 hover:text-white"
>
گەڕانەوە بۆ ماڵپەڕ

١. یارییەک هەڵبژێرە لە لیستی یارییەکانی ئەمڕۆ:
<select
value={editingMatchId}
onChange={(e) => handleSelectAdminMatch(e.target.value)}
className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
>
-- یارییەک دیاری بکە --
{matches.map((m) => (

{m.home.name} vs {m.away.name} ({m.league} - {m.kickoff})

))}

{editingMatchId && (

لینکی سێرڤەری سەرەکی (Embed URL):
<input
type="url"
value={formLinks.server_1}
onChange={(e) =>
setFormLinks({ ...formLinks, server_1: e.target.value })
}
placeholder="https://..."
dir="ltr"
className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white"
/>
لینکی سێرڤەری ٢ (Embed URL):
<input
type="url"
value={formLinks.server_2}
onChange={(e) =>
setFormLinks({ ...formLinks, server_2: e.target.value })
}
placeholder="https://..."
dir="ltr"
className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white"
/>
لینکی پەخشی فەرمی یوتیوب (YouTube URL):
<input
type="url"
value={formLinks.youtube_url}
onChange={(e) =>
setFormLinks({ ...formLinks, youtube_url: e.target.value })
}
placeholder="youtube.com..."
dir="ltr"
className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white"
/>
لینکی کورتەی یاری (Highlights YouTube URL):
<input
type="url"
value={formLinks.highlights_url}
onChange={(e) =>
setFormLinks({ ...formLinks, highlights_url: e.target.value })
}
placeholder="youtube.com..."
dir="ltr"
className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white"
/>
{saveSuccess && (


لینکەکان بە سەرکەوتوویی خەزن کران و ئێستا لای هەموو سەردانیکەران کاردەکەن!

)}
{saving ? 'خەریکی خەزنکردنە...' : 'خەزنکردنی لینکەکان'}


)}

)}

) : (
<>
{nav === 'today' && (







پەخشی زیندوو


یارییەکانی ئەمڕۆ


{liveCount > 0
? ${liveCount} یاری ڕاستەوخۆ ئێستا
: 'هەموو یارییەکان بەدوای دەرئەنجامی ڕاستەوخۆدا'}









)}
{(nav === 'today' || nav === 'live') && (


<DayTabs
active={day}
onChange={setDay}
onRefresh={() => loadMatches(day, true)}
refreshing={loading}
/>
{loading && matches.length === 0 && (


چاوەڕوانبە، زانیارییەکان باردەبن...

)}
{error && (


{error}
<button
onClick={() => loadMatches(day, true)}
className="mt-1 rounded-lg bg-red-500/20 px-4 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-500/30"
>
هەوڵبدانەوە


)}
{!loading && !error && displayMatches.length > 0 && (

{leagueGroups.map((group) => (



{group.matches.map((m) => (
<MatchCard
key={m.id}
match={m}
onClick={() => handleOpenMatch(m)}
/>
))}


))}

)}
{!loading && !error && displayMatches.length === 0 && (


هیچ یارییەک لەم ڕۆژەدا بەردەست نییە

)}
<Sidebar
matches={matches}
onMatchClick={handleOpenMatch}
onLeagueClick={() => setNav('leagues')}
/>


)}
{nav === 'leagues' && }
{nav === 'news' && }
</>
)}
Live Sport KRD
پەخشی زیندووی وەرزشی




داتا لە API-Sports وەرگیراوە • کاتی ناوچەی بەغدا

<button
onClick={() => {
setSelected(null);
setNav('admin');
}}
className="text-xs text-gray-600 transition hover:text-emerald-400"
>
بەڕێوەبردن






);
}

4. کلیک لە دوگمە سەوزەکەی **`Commit changes`** بکە لە GitHub.
5. ٣٠ چرکە چاوەڕێ بکە؛ لە Vercel نیشانەکە دەبێتە سەوز (**Ready**)، و کاتێک دەچیتە سەر `livesportkrd.vercel.app`، دەتوانیت بچیتە خوارەوەی پەڕەکە و کلیک لە **`بەڕێوەبردن`** بکەیت.

<FollowUp>
ئەم کۆدە چاککراوە بخەرە ناو `src/App.tsx` و **Commit changes** دابگرە؛ پێم بڵێ دوای ٣٠ چرکە کاتێک **Ready** بوو و پەڕەی بینینی یاریت تاقی کردەوە!
</FollowUp>
