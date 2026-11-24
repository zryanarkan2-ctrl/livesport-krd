import { useEffect, useState } from 'react';
import { Bell, BellRing, Star } from 'lucide-react';
import { useFavorites } from '@/lib/favorites';
import { hasReminder, removeReminder, setReminder } from '@/lib/reminders';
import type { MatchX } from '@/lib/espn-types';

/** ئەستێرە بۆ تیمی بەدڵ */
export function TeamStar({ teamId, size = 'h-4 w-4' }: { teamId: number; size?: string }) {
  const { isTeamFav, toggleTeam } = useFavorites();
  const fav = isTeamFav(teamId);
  if (!teamId) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleTeam(teamId);
      }}
      aria-label={fav ? 'لابردن لە بەدڵەکان' : 'زیادکردن بۆ بەدڵەکان'}
      className="rounded p-1 text-slate-500 hover:text-amber-400"
    >
      <Star className={`${size} ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
    </button>
  );
}

/** زەنگی بیرهێنەرەوە، تەنها بۆ یاری نەدەستپێکراو */
export function ReminderBell({ match }: { match: MatchX }) {
  const [on, setOn] = useState(() => hasReminder(match.id));
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const sync = () => setOn(hasReminder(match.id));
    window.addEventListener('lskrd-reminders', sync);
    return () => window.removeEventListener('lskrd-reminders', sync);
  }, [match.id]);

  if (match.status !== 'upcoming' || !match.startTime) return null;

  return (
    <button
      type="button"
      title={denied ? 'ڕێگەپێدانی ئاگادارکردنەوە لە وێبگەڕدا بدە' : 'بیرهێنەرەوە ١٥ خولەک پێش یاری'}
      onClick={async (e) => {
        e.stopPropagation();
        if (on) {
          removeReminder(match.id);
          return;
        }
        const ok = await setReminder(match, 15);
        setDenied(!ok);
        setOn(ok);
      }}
      className={`rounded p-1 hover:text-emerald-400 ${on ? 'text-emerald-400' : denied ? 'text-red-400' : 'text-slate-500'}`}
    >
      {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  );
}
