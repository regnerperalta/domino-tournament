import type { LeaderboardPlayer } from '../types/tournament';

// Header Configuration
export const HEADER_CONFIG = {
  TITLE: "TORNEO DE DOMINO - 2026",
  SUBTITLE: "En el Patio de Chapin",
  ROUND_LABEL: "Round Actual",
  ROUND_PREFIX: "Round ",
};

//Tables configuration
export const TABLES_CONFIG = {
  TABLE_A_TITLE: "Mesa 1",
  TABLE_B_TITLE: "Mesa 2",
};

// Domino Table
export const TABLE_ACTIONS_CONFIG = {
  ENTER_SCORES_LABEL: "ENTER SCORES",
};

// Score Entry
export const SCORE_ENTRY_CONFIG = {
  TITLE: "Score Entry",
  SUBTITLE: "Enter player scores after each game.",
  SAVE_BUTTON_LABEL: "SAVE SCORES",
  INPUT_PLACEHOLDER: "",
};

// Modal Titles
export const MODAL_TITLES_CONFIG = {
  PLAYERS: "Registered Players",
  BRACKET: "Tournament Bracket",
  LEADERBOARD: "Current Standings",
  RULES: "Tournament Rules",
  SCORES: "Match Score Entry Sheet",
};

// Initial Mock Standings Data
export const DEFAULT_LEADERBOARD: LeaderboardPlayer[] = [
  { name: "Luis", points: 120 },
  { name: "Carlos", points: 95 },
  { name: "Miguel", points: 70 },
  { name: "Jose", points: 60 },
];

// Stationary Rule Book Strings
export const TOURNAMENT_RULES_LIST = [
  "Top 2 players advance per table",
  "Bottom 2 players drop to losers bracket",
  "Double elimination format",
  "Finals consist of a best-of-3 series",
  "Tie-breakers must be handled manually by the admin",
];

export function deriveTableSeating(players: string[]) {
  return {
    tableA: {
      north: players[0] || "Player 1",
      east: players[2] || "Player 3",
      south: players[3] || "Player 4",
      west: players[1] || "Player 2",
    },
    tableB: {
      north: players[4] || "Player 5",
      east: players[6] || "Player 7",
      south: players[7] || "Player 8",
      west: players[5] || "Player 6",
    },
  };
}

export function deriveProgressionLists(players: string[]) {
  const round1Players = [players[0], players[1], players[2], players[3]].filter(Boolean);
  const winnersList = [players[0], players[1]].filter(Boolean);
  const losersList = [players[2], players[3]].filter(Boolean);
  const activeScorePlayers = [players[0], players[1], players[2], players[3]].filter(Boolean);

  return {
    round1Players,
    winnersList,
    losersList,
    activeScorePlayers,
  };
}

export interface BracketColumnConfig {
  title: string;
  dataKey: 'roundPlayers' | 'winners' | 'losers';
  highlight?: boolean;
  danger?: boolean;
}

export const BRACKET_COLUMNS_CONFIG: BracketColumnConfig[] = [
  { 
    title: "Round 1", 
    dataKey: "roundPlayers" 
  },
  { 
    title: "Winners", 
    dataKey: "winners", 
    highlight: true 
  },
  { 
    title: "Losers", 
    dataKey: "losers", 
    danger: true 
  },
];

