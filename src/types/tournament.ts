export interface LeaderboardPlayer {
  name: string;
  points: number;
}

export interface GameHeaderProps {
  roundNumber?: number;
}

export interface BracketColumnProps {
  title: string;
  players: string[];
  highlight?: boolean;
  danger?: boolean;
}

export interface TableSeats {
  north: string;
  east: string;
  south: string;
  west: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export interface RegisteredPlayersProps {
  players: string[];
}

export interface SetupScreenProps {
  onStartTournament: (playerNames: string[]) => void;
}

export interface BracketProgressionProps {
  roundPlayers: string[];
  winners: string[];
  losers: string[];
}

export interface LeaderboardProps {
  leaderboard: LeaderboardPlayer[];
}

export interface ControlPanelProps {
  onOpenRoster: () => void;
  onOpenBracket: () => void;
  onOpenLeaderboard: () => void;
  onOpenRules: () => void;
  onOpenScoreEntry: () => void;
  onNextRound: () => void;
  isNextRoundDisabled: boolean;
  currentRound: number;
}

export interface ScoreEntryProps {
  activePlayers: string[];
  currentScores: Record<string, number>;
  onSaveScores: (scores: Record<string, number>) => void;
}

// src/types/tournament.ts

export interface SeatProps {
  position: 'top' | 'bottom' | 'left' | 'right';
  player: string;
  score: number;
}

export interface DominoTableProps {
  title: string;
  seats: TableSeats;
  scores: Record<string, number>;
  onEnterScores: () => void;
}

export interface CurrentGamesProps {
  tableA: TableSeats;
  tableB: TableSeats;
  scores: Record<string, number>;
  onEnterScores: (tablePlayers: string[]) => void;
}

export interface TieBreakerContext {
  tableKey: 'tableA' | 'tableB';
  tableTitle: string;
  type: '1st_place_3way' | '2nd_place_tie';
  tiedPlayers: string[];
}