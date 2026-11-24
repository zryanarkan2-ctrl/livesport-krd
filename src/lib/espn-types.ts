import type { Match } from '@/types';

/** Match + ئەو خانانەی نوێ زیادمان کردوون (بێ گۆڕینی src/types) */
export type MatchX = Match & {
  /** slug ی ESPN بۆ لیگەکە، بۆ وردەکاری یاری و پلەبەندی */
  leagueSlug?: string;
  /** کاتی دەستپێکردن بە ISO، بۆ ڕیزکردن و بیرهێنەرەوە */
  startTime?: string;
};

/** 'live' = تەنها یاریە زیندووەکان، 'yesterday'|'today'|'tomorrow'، یان بەروار بە شێوەی YYYYMMDD */
export type DayKey = 'live' | 'yesterday' | 'today' | 'tomorrow' | (string & {});

export type EventKind = 'goal' | 'own-goal' | 'yellow' | 'red' | 'sub';

export interface MatchEvent {
  kind: EventKind;
  minute: string;
  isHome: boolean;
  player: string;
  /** یاریزانی دووەم: یارمەتیدەر یان جێگرەوە */
  extra?: string;
}

export interface StatRow {
  label: string;
  home: string;
  away: string;
  homeNum: number;
  awayNum: number;
}

export interface LineupPlayer {
  name: string;
  number: string;
  pos: string;
}

export interface TeamLineup {
  formation: string;
  starters: LineupPlayer[];
  subs: LineupPlayer[];
}

export interface MatchDetails {
  events: MatchEvent[];
  stats: StatRow[];
  lineups: { home: TeamLineup; away: TeamLineup } | null;
  venue?: string;
  attendance?: number;
  referee?: string;
}

export interface StandingRow {
  rank: number;
  teamId: number;
  team: string;
  logo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface StandingGroup {
  name: string;
  rows: StandingRow[];
}

export interface NewsItem {
  id: string;
  headline: string;
  description: string;
  url: string;
  image: string;
  published: string;
}
