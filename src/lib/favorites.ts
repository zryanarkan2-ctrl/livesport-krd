import { useCallback, useEffect, useState } from 'react';

const KEY = 'lskrd_favs_v1';

export interface Favorites {
  teams: number[];
  leagues: number[];
}

const EMPTY: Favorites = { teams: [], leagues: [] };

function read(): Favorites {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    return {
      teams: Array.isArray(p.teams) ? p.teams : [],
      leagues: Array.isArray(p.leagues) ? p.leagues : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(f: Favorites) {
  try {
    localStorage.setItem(KEY, JSON.stringify(f));
    window.dispatchEvent(new Event('lskrd-favs'));
  } catch {
    // localStorage بەردەست نییە
  }
}

/** تیم و لیگە بەدڵەکان، لە localStorage هەڵدەگیرێن و لە هەموو کۆمپۆنێنتەکان هاوکات دەبن */
export function useFavorites() {
  const [favs, setFavs] = useState<Favorites>(read);

  useEffect(() => {
    const sync = () => setFavs(read());
    window.addEventListener('lskrd-favs', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('lskrd-favs', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleTeam = useCallback((id: number) => {
    const cur = read();
    write({
      ...cur,
      teams: cur.teams.includes(id) ? cur.teams.filter((x) => x !== id) : [...cur.teams, id],
    });
  }, []);

  const toggleLeague = useCallback((id: number) => {
    const cur = read();
    write({
      ...cur,
      leagues: cur.leagues.includes(id) ? cur.leagues.filter((x) => x !== id) : [...cur.leagues, id],
    });
  }, []);

  const isTeamFav = useCallback((id: number) => favs.teams.includes(id), [favs]);
  const isLeagueFav = useCallback((id: number) => favs.leagues.includes(id), [favs]);

  return { favs, toggleTeam, toggleLeague, isTeamFav, isLeagueFav };
}
