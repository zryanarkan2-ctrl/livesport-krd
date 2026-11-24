import type { MatchX } from './espn-types';

/**
 * بیرهێنەرەوەی پێش یاری.
 *
 * سنووردارییەکە: ئەمە تەنها کاتێک کار دەکات کە پەیجەکە (تاب) کراوە بێت، چونکە
 * بە setTimeout و Notification API ی وێبگەڕ کار دەکات. بۆ ئاگادارکردنەوەی ڕاستەقینە
 * کاتێک وێبگەڕ داخراوە، پێویستت بە Service Worker + Web Push + سێرڤەرە، کە پڕۆژەیەکی جیاوازە.
 */

const KEY = 'lskrd_reminders_v1';
const timers = new Map<string, number>();

interface Reminder {
  id: string;
  at: number; // کاتی ئاگادارکردنەوە (ms)
  title: string;
  body: string;
}

function load(): Reminder[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(list: Reminder[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('lskrd-reminders'));
  } catch {
    // localStorage بەردەست نییە
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

function arm(r: Reminder) {
  const delay = r.at - Date.now();
  if (delay <= 0 || delay > 2_000_000_000) return;
  window.clearTimeout(timers.get(r.id));
  timers.set(
    r.id,
    window.setTimeout(() => {
      try {
        new Notification(r.title, { body: r.body });
      } catch {
        // هیچ
      }
      removeReminder(r.id);
    }, delay),
  );
}

export function hasReminder(matchId: string): boolean {
  return load().some((r) => r.id === matchId);
}

export function removeReminder(matchId: string) {
  window.clearTimeout(timers.get(matchId));
  timers.delete(matchId);
  save(load().filter((r) => r.id !== matchId));
}

/** بیرهێنەرەوە دابنێ. false دەگەڕێنێتەوە ئەگەر ڕێگەپێدان نەدرا یان یاری دەستی پێکردووە */
export async function setReminder(match: MatchX, minutesBefore = 15): Promise<boolean> {
  if (!match.startTime) return false;
  const at = new Date(match.startTime).getTime() - minutesBefore * 60_000;
  if (at <= Date.now()) return false;
  if (!(await ensureNotificationPermission())) return false;

  const r: Reminder = {
    id: match.id,
    at,
    title: `${match.home.name} - ${match.away.name}`,
    body: `${match.league} · ${match.kickoff} (${minutesBefore} خولەکی تر)`,
  };
  save([...load().filter((x) => x.id !== r.id), r]);
  arm(r);
  return true;
}

/** لە دەستپێکی ئەپەکە یەک جار بانگ بکە، بۆ ئەوەی بیرهێنەرەوەکانی پێشوو دووبارە چالاک بن */
export function restoreReminders() {
  const now = Date.now();
  const alive = load().filter((r) => r.at > now);
  save(alive);
  alive.forEach(arm);
}
