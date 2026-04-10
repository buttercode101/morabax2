export type Player = 'player1' | 'player2';
export type Phase = 'placing' | 'moving' | 'flying';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameMode = 'pvp' | 'pve';
export type BoardVariant = 'standard' | 'sesotho' | '11men' | 'gonjilgonu';
export type SkinId = 'classic' | 'obsidian' | 'gold' | 'ebony' | 'ivory' | 'jade';

export interface Level {
  id: number;
  name: string;
  difficulty: Difficulty;
  variant: BoardVariant;
  opponentName: string;
  description: string;
  unlocked: boolean;
  stars: number;
  reward: number;
}

export interface UserProgress {
  xp: number;
  level: number;
  completedLevels: number[];
  levelStars: Record<number, number>;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  millsFormed: number;
  cowsCaptured: number;
}

export interface GameState {
  board: (Player | null)[];
  turn: Player;
  phase: Phase;
  unplacedCows: Record<Player, number>;
  cowsOnBoard: Record<Player, number>;
  capturedCows: Record<Player, number>;
  selectedNode: number | null;
  shootMode: boolean;
  winner: Player | 'draw' | null;
  moveHistory: string[];
  movesWithoutShoot: number;
  variant: BoardVariant;
  soundEnabled: boolean;
  isSettingsOpen: boolean;
  coins: number;
  stats: GameStats;
  unlockedSkins: SkinId[];
  currentSkin: SkinId;
  activeMill: number[] | null;
  lastMove: { from: number | null, to: number } | null;
  elapsedTime: number;
  markedNodes: number[]; // For Gonjilgonu variant
  progress: UserProgress;
  currentLevelId: number | null;
  showHint: number | null;
  lastLeveledUp: number | null;
  boardHistory: string[]; // For threefold repetition detection
}
