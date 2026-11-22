# Project memory

## Product intent & audience

- Sports match schedule & live scores web app inspired by Yalla Shoot
- Arabic-speaking audience; fully RTL layout
- Core features: browse matches by day, view live scores, match details (lineups, stats, video highlights), leagues, news

## Brand personality & voice

- Sports broadcast tone; clean, energetic, modern
- Arabic-first UI labels (e.g. الأمس / اليوم / غداً)

## Visual design & UX direction

- Dark navy + blue sports theme
- Arabic fonts: Cairo / Tajawal
- Header: live-broadcast logo, nav links (Today's Matches, Leagues, News, Live Stream), mobile menu
- Day tabs filter matches: Yesterday / Today / Tomorrow
- Match cards: home team on right, away team on left (RTL), time or live score + minute in center; status badge (Live pulsing red / Upcoming / Finished); league + stadium + channel below card
- Match details modal: 3 tabs — Statistics (animated comparison bars), Lineups (formation + player numbers), Video highlights placeholder
- Leagues page: competition cards
- News page: headlines tagged by league
- Fully responsive; subtle animations and hover states
- Icons via lucide-react; path alias `@/` → `src/`

## Decisions, constraints & rationale

- Stack: Vite + React, Tailwind CSS, React hooks, Lucide React only (no extra UI/icon packages)
- Match data modeled with optional `stats` field; stat label typing kept on object keys rather than `keyof Match['stats']` to avoid `never`
- Build and typecheck both pass cleanly

## Open questions & assumptions

- Match data is static/mock; no backend or real live data integration yet
- Video highlights are placeholder only; no actual streaming
- RTL is primarily for Arabic; LTR English variant not implemented