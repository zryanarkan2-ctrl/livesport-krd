import { useEffect, useState } from 'react';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseReady } from './config';

export interface WatchLink {
  id: string;
  match_id: string;
  title: string;
  url: string;
  created_at: string;
}

const TABLE = `${SUPABASE_URL}/rest/v1/watch_links`;

/** تەنها http/https قبوڵە، بۆ ڕێگری لە javascript: و هاوشێوەکانی */
export function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

function headers(token?: string, extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...extra,
  };
  // کلیلی نوێی sb_publishable_ JWT نییە: تەنها لە apikey دادەنرێت. تۆکنی بەکارهێنەر (JWT) دەچێتە Authorization
  if (token) h.Authorization = `Bearer ${token}`;
  else if (!SUPABASE_ANON_KEY.startsWith('sb_')) h.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  return h;
}

/* ───────────── خوێندنەوە (گشتی) ───────────── */

let cache: { at: number; byMatch: Record<string, WatchLink[]> } | null = null;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

async function loadAll(force = false): Promise<void> {
  if (!supabaseReady()) return;
  if (!force && cache && Date.now() - cache.at < 60_000) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${TABLE}?select=*&order=created_at.asc`, { headers: headers() });
      if (!res.ok) throw new Error(String(res.status));
      const rows = (await res.json()) as WatchLink[];
      const byMatch: Record<string, WatchLink[]> = {};
      for (const r of rows) {
        if (!safeUrl(r.url)) continue;
        (byMatch[r.match_id] ||= []).push(r);
      }
      cache = { at: Date.now(), byMatch };
      listeners.forEach((l) => l());
    } catch (e) {
      console.error('watch links load failed', e);
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** هەموو لینکەکانی بینین، بە match.id. هەر ٢ خولەک نوێ دەبێتەوە */
export function useWatchLinks(): Record<string, WatchLink[]> {
  const [, force] = useState(0);
  useEffect(() => {
    if (!supabaseReady()) return;
    const l = () => force((n) => n + 1);
    listeners.add(l);
    loadAll();
    const t = window.setInterval(() => !document.hidden && loadAll(), 120_000);
    return () => {
      listeners.delete(l);
      window.clearInterval(t);
    };
  }, []);
  return cache?.byMatch ?? {};
}

/* ───────────── ئەدمین: چوونەژوورەوە ───────────── */

const SESSION_KEY = 'lskrd_admin_session_v1';
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // چرکە
  email: string;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

async function tokenRequest(grant: 'password' | 'refresh_token', body: object): Promise<Session> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) {
    throw new Error(j.error_description || j.msg || 'چوونەژوورەوە سەرنەکەوت');
  }
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600),
    email: j.user?.email ?? '',
  };
}

export async function adminLogin(email: string, password: string): Promise<Session> {
  const s = await tokenRequest('password', { email: email.trim(), password });
  saveSession(s);
  return s;
}

export function adminLogout() {
  saveSession(null);
}

/** تۆکنی دروست دەگەڕێنێتەوە و ئەگەر بەسەرچوو بێت نوێی دەکاتەوە */
export async function getAdminSession(): Promise<Session | null> {
  const s = readSession();
  if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s;
  try {
    const n = await tokenRequest('refresh_token', { refresh_token: s.refresh_token });
    n.email = n.email || s.email;
    saveSession(n);
    return n;
  } catch {
    saveSession(null);
    return null;
  }
}

/* ───────────── ئەدمین: نووسین ───────────── */

export async function addLink(matchId: string, title: string, url: string): Promise<WatchLink> {
  const s = await getAdminSession();
  if (!s) throw new Error('دووبارە بچۆ ژوورەوە');
  const clean = safeUrl(url);
  if (!clean) throw new Error('لینکەکە دروست نییە (دەبێت بە https:// دەست پێ بکات)');
  const res = await fetch(TABLE, {
    method: 'POST',
    headers: headers(s.access_token, { Prefer: 'return=representation' }),
    body: JSON.stringify({ match_id: matchId, title: title.trim() || 'بینین', url: clean }),
  });
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'مۆڵەتت نییە' : 'پاشەکەوت نەکرا');
  const [row] = (await res.json()) as WatchLink[];
  await loadAll(true);
  return row;
}

export async function deleteLink(id: string): Promise<void> {
  const s = await getAdminSession();
  if (!s) throw new Error('دووبارە بچۆ ژوورەوە');
  const res = await fetch(`${TABLE}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(s.access_token),
  });
  if (!res.ok) throw new Error('نەسڕایەوە');
  await loadAll(true);
}
