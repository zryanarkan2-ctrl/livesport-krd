export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface Team {
  name: string;
  logo: string;
  id: number;
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  offsides: [number, number];
}

export interface Player {
  name: string;
  number: number;
  pos: string;
}

export interface Lineup {
  formation: string;
  players: Player[];
}

export interface Match {
  id: string;
  home: Team;
  away: Team;
  league: string;
  leagueId: number;
  leagueLogo: string;
  country: string;
  flag: string | null;
  stadium: string;
  kickoff: string;
  statusShort: string;
  status: MatchStatus;
  minute?: number | null;
  scoreHome?: number | null;
  scoreAway?: number | null;
  stats?: MatchStats;
  homeLineup?: Lineup;
  awayLineup?: Lineup;
  day: 'yesterday' | 'today' | 'tomorrow';
}

export interface ApiMatch {
  id: string;
  home: { name: string; logo: string; id: number };
  away: { name: string; logo: string; id: number };
  league: string;
  leagueId: number;
  leagueLogo: string;
  country: string;
  flag: string | null;
  stadium: string;
  kickoff: string;
  statusShort: string;
  minute: number | null;
  scoreHome: number | null;
  scoreAway: number | null;
}
