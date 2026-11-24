export * from './lib/espn';

import type { Match } from './types';

export interface LeagueGroup {
  leagueId: number;
  league: string;
  leagueLogo: string;
  country: string;
  flag: string | null;
  matches: Match[];
}
