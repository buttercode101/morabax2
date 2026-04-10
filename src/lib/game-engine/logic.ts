import { Player, Phase, GameState, BoardVariant } from '@/types/game';
import { BOARD_CONFIGS } from './constants';

export function getOpponent(player: Player): Player {
  return player === 'player1' ? 'player2' : 'player1';
}

export function isMill(board: (Player | null)[], node: number, player: Player, variant: BoardVariant = 'standard'): boolean {
  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  return config.mills.some(mill => 
    mill.includes(node) && mill.every(n => board[n] === player)
  );
}

export function getFormedMill(board: (Player | null)[], node: number, player: Player, variant: BoardVariant = 'standard'): number[] | null {
  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  for (const mill of config.mills) {
    if (mill.includes(node) && mill.every(n => board[n] === player)) {
      return mill;
    }
  }
  return null;
}

export function getAllMills(board: (Player | null)[], player: Player, variant: BoardVariant = 'standard'): number[][] {
  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  return config.mills.filter(mill => mill.every(n => board[n] === player));
}

export function isPartOfMill(board: (Player | null)[], node: number, player: Player, variant: BoardVariant = 'standard'): boolean {
  return isMill(board, node, player, variant);
}

export function canShoot(board: (Player | null)[], node: number, opponent: Player, variant: BoardVariant = 'standard'): boolean {
  if (board[node] !== opponent) return false;
  
  const inMill = isPartOfMill(board, node, opponent, variant);
  if (!inMill) return true;

  // If in a mill, can only shoot if ALL opponent pieces are in mills
  const allOpponentPieces = board.reduce((acc, p, idx) => {
    if (p === opponent) acc.push(idx);
    return acc;
  }, [] as number[]);

  const allInMills = allOpponentPieces.every(n => isPartOfMill(board, n, opponent, variant));
  return allInMills;
}

export function getValidMoves(board: (Player | null)[], node: number, phase: Phase, variant: BoardVariant = 'standard'): number[] {
  const canFly = variant !== 'sesotho';
  if (phase === 'flying' && canFly) {
    return board.map((p, idx) => p === null ? idx : -1).filter(idx => idx !== -1);
  }
  // If phase is flying but can't fly (Sesotho), treat as moving
  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  const neighbors = config.adjacency[node];
  if (!neighbors) return [];
  return neighbors.filter(n => board[n] === null);
}

export function hasValidMoves(board: (Player | null)[], player: Player, phase: Phase, variant: BoardVariant = 'standard'): boolean {
  const canFly = variant !== 'sesotho';
  if (phase === 'flying' && canFly) return board.some(p => p === null);
  if (phase === 'placing') return board.some(p => p === null);

  for (let i = 0; i < board.length; i++) {
    if (board[i] === player) {
      if (getValidMoves(board, i, phase, variant).length > 0) return true;
    }
  }
  return false;
}

export function checkWinCondition(state: GameState): Player | 'draw' | null {
  const { board, unplacedCows, cowsOnBoard, movesWithoutShoot, variant, boardHistory } = state;

  // Only evaluate win/loss when both players have finished placing all cows
  if (unplacedCows.player1 === 0 && unplacedCows.player2 === 0) {
    // Check if either player has fewer than 3 cows on the board
    if (cowsOnBoard.player1 < 3) return 'player2';
    if (cowsOnBoard.player2 < 3) return 'player1';

    const canFly = variant !== 'sesotho';

    // Determine each player's current phase
    const p1Phase = cowsOnBoard.player1 <= 3 && canFly ? 'flying' : 'moving';
    const p2Phase = cowsOnBoard.player2 <= 3 && canFly ? 'flying' : 'moving';

    // Check if either player has no valid moves
    if (!hasValidMoves(board, 'player1', p1Phase, variant)) return 'player2';
    if (!hasValidMoves(board, 'player2', p2Phase, variant)) return 'player1';

    // Draw by excessive moves without captures (30 moves each = 60 total turns)
    if (movesWithoutShoot >= 60) return 'draw';
  }

  // Draw by threefold repetition (same board position appears 3 times)
  if (boardHistory && boardHistory.length > 0) {
    const currentHash = `${board.join(',')}-${state.turn}`;
    const repetitionCount = boardHistory.filter(h => h === currentHash).length;
    if (repetitionCount >= 2) { // 2 previous + 1 current = 3 occurrences
      return 'draw';
    }
  }

  return null;
}
