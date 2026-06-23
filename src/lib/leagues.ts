import type { Category } from "./types";

// The three top-level "hubs". Each maps to one or more product categories and carries
// its own accent colour so the UI re-themes per league (set via the `--accent` CSS var).
export interface League {
  slug: string; // URL segment, e.g. "football"
  name: string;
  tagline: string;
  blurb: string;
  categories: Category[];
  accent: string; // hex, drives `--accent`
}

export const LEAGUES: League[] = [
  {
    slug: "football",
    name: "Football",
    tagline: "Club & Country",
    blurb: "Home, away and third kits from the biggest clubs and national teams.",
    categories: ["football-club", "national-team", "training"],
    accent: "#00e676",
  },
  {
    slug: "nba",
    name: "NBA",
    tagline: "Hardwood Heat",
    blurb: "Authentic-style jerseys and city editions straight off the court.",
    categories: ["nba"],
    accent: "#ff7a00",
  },
  {
    slug: "f1",
    name: "F1",
    tagline: "Paddock & Podium",
    blurb: "Team kit and race-weekend gear for the grid's biggest names.",
    categories: ["f1"],
    accent: "#ff2d2d",
  },
];

export function getLeague(slug: string): League | undefined {
  return LEAGUES.find((l) => l.slug === slug);
}

export function leagueForCategory(category: Category): League | undefined {
  return LEAGUES.find((l) => l.categories.includes(category));
}
