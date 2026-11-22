const APISPORTS_KEY = "de11f00e343eaef017411a3540759b47";

// Major league IDs to keep the response focused and within rate limits.
const PRIORITY_LEAGUES = new Set([
  1,   // World Cup
  2,   // UCL
  3,   // UEFA Europa League
  4,   // UEFA Conference League
  39,  // Premier League
  61,  // Ligue 1
  71,  // Serie A (Italy)
  78,  // Bundesliga
  88,  // Eredivisie
  94,  // Primeira Liga
  140, // La Liga
  144, // Jupiler Pro League
  203, // Saudi Pro League
  218, // Egyptian Premier League
  222, // AFC Champions League
  250, // Turkish Super Lig
]);

interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    venue: { name: string | null; city: string | null };
    status: { short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    country: string;
    flag: string | null;
  };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const timezone = url.searchParams.get("timezone") || "Asia/Baghdad";

    if (!date) {
      return new Response(
        JSON.stringify({ error: "Missing date parameter (YYYY-MM-DD)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiUrl = `https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(timezone)}`;
    const resp = await fetch(apiUrl, {
      headers: { "x-apisports-key": APISPORTS_KEY },
    });

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream API error: ${resp.status}` }),
        { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const raw = await resp.json();
    const all: ApiFixture[] = raw.response || [];

    const filtered = all.filter((f) => PRIORITY_LEAGUES.has(f.league.id));

    const simplified = filtered.map((f) => ({
      id: String(f.fixture.id),
      home: {
        name: f.teams.home.name,
        logo: f.teams.home.logo,
        id: f.teams.home.id,
      },
      away: {
        name: f.teams.away.name,
        logo: f.teams.away.logo,
        id: f.teams.away.id,
      },
      league: f.league.name,
      leagueId: f.league.id,
      leagueLogo: f.league.logo,
      country: f.league.country,
      flag: f.league.flag,
      stadium: f.fixture.venue.name || f.fixture.venue.city || "",
      kickoff: f.fixture.date,
      statusShort: f.fixture.status.short,
      minute: f.fixture.status.elapsed,
      scoreHome: f.goals.home,
      scoreAway: f.goals.away,
    }));

    return new Response(
      JSON.stringify({ response: simplified }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
