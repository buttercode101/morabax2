import { Player, Phase, BoardVariant } from '@/types/game';
import { BOARD_CONFIGS } from './constants';
import { getOpponent, isMill, canShoot, getValidMoves, hasValidMoves } from './logic';

// Evaluation function
function evaluateBoard(board: (Player | null)[], player: Player, phase: Phase, unplaced: Record<Player, number>, variant: BoardVariant): number {
  const opponent = getOpponent(player);
  let score = 0;

  let myPieces = unplaced[player];
  let oppPieces = unplaced[opponent];
  let myMills = 0;
  let oppMills = 0;
  let myMobility = 0;
  let oppMobility = 0;

  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  const numNodes = config.nodes;
  const canFly = variant !== 'sesotho';

  // Count pieces on board
  for (let i = 0; i < numNodes; i++) {
    if (board[i] === player) {
      myPieces++;
    } else if (board[i] === opponent) {
      oppPieces++;
    }
  }

  // Calculate mobility (only when in moving/flying phase)
  if (unplaced[player] === 0) {
    const myPhase = myPieces <= 3 && canFly ? 'flying' : 'moving';
    for (let i = 0; i < numNodes; i++) {
      if (board[i] === player) {
        myMobility += getValidMoves(board, i, myPhase, variant).length;
      }
    }
  }
  if (unplaced[opponent] === 0) {
    const oppPhase = oppPieces <= 3 && canFly ? 'flying' : 'moving';
    for (let i = 0; i < numNodes; i++) {
      if (board[i] === opponent) {
        oppMobility += getValidMoves(board, i, oppPhase, variant).length;
      }
    }
  }

  for (const mill of config.mills) {
    let myCount = 0;
    let oppCount = 0;
    for (const node of mill) {
      if (board[node] === player) myCount++;
      else if (board[node] === opponent) oppCount++;
    }
    if (myCount === 3) myMills++;
    if (oppCount === 3) oppMills++;
    if (myCount === 2 && oppCount === 0) score += 10; // Potential mill
    if (oppCount === 2 && myCount === 0) score -= 10;
  }

  score += (myPieces - oppPieces) * 100;
  score += (myMills - oppMills) * 50;

  if (phase !== 'placing') {
    score += (myMobility - oppMobility) * 2;
  }

  // Winning conditions (only when all pieces are placed)
  if (unplaced[opponent] === 0 && oppPieces < 3) return 10000;
  if (unplaced[player] === 0 && myPieces < 3) return -10000;
  if (unplaced[opponent] === 0 && !hasValidMoves(board, opponent, oppPieces <= 3 && canFly ? 'flying' : 'moving', variant)) return 10000;
  if (unplaced[player] === 0 && !hasValidMoves(board, player, myPieces <= 3 && canFly ? 'flying' : 'moving', variant)) return -10000;

  return score;
}

// Get all possible moves (including shooting)
function generateMoves(board: (Player | null)[], player: Player, _phase: Phase, unplaced: Record<Player, number>, variant: BoardVariant) {
  const moves: { from: number | null, to: number, shoot: number | null }[] = [];
  const opponent = getOpponent(player);
  const canFly = variant !== 'sesotho';
  const isFlying = unplaced[player] === 0 && board.filter(p => p === player).length <= 3 && canFly;
  const currentPhase = unplaced[player] > 0 ? 'placing' : (isFlying ? 'flying' : 'moving');
  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  const numNodes = config.nodes;

  const addShoots = (from: number | null, to: number, newBoard: (Player | null)[]) => {
    if (isMill(newBoard, to, player, variant)) {
      let canShootAny = false;
      for (let i = 0; i < numNodes; i++) {
        if (canShoot(newBoard, i, opponent, variant)) {
          moves.push({ from, to, shoot: i });
          canShootAny = true;
        }
      }
      if (!canShootAny) moves.push({ from, to, shoot: null }); // Edge case: no valid shoot targets
    } else {
      moves.push({ from, to, shoot: null });
    }
  };

  if (currentPhase === 'placing') {
    for (let i = 0; i < numNodes; i++) {
      if (board[i] === null) {
        const newBoard = [...board];
        newBoard[i] = player;
        addShoots(null, i, newBoard);
      }
    }
  } else {
    for (let i = 0; i < numNodes; i++) {
      if (board[i] === player) {
        const validTos = getValidMoves(board, i, currentPhase, variant);
        for (const to of validTos) {
          const newBoard = [...board];
          newBoard[i] = null;
          newBoard[to] = player;
          addShoots(i, to, newBoard);
        }
      }
    }
  }
  return moves;
}

export function getBestMove(board: (Player | null)[], player: Player, phase: Phase, unplaced: Record<Player, number>, depth: number, variant: BoardVariant) {
  let bestScore = -Infinity;
  let bestMove = null;
  const moves = generateMoves(board, player, phase, unplaced, variant);

  // Shuffle moves to add variety
  moves.sort(() => Math.random() - 0.5);

  for (const move of moves) {
    const newBoard = [...board];
    if (move.from !== null) newBoard[move.from] = null;
    newBoard[move.to] = player;
    if (move.shoot !== null) newBoard[move.shoot] = null;

    const newUnplaced = { ...unplaced };
    if (move.from === null) newUnplaced[player]--;

    const score = minimax(newBoard, depth - 1, false, player, phase, newUnplaced, -Infinity, Infinity, variant);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(board: (Player | null)[], depth: number, isMaximizing: boolean, aiPlayer: Player, phase: Phase, unplaced: Record<Player, number>, alpha: number, beta: number, variant: BoardVariant): number {
  const currentPlayer = isMaximizing ? aiPlayer : getOpponent(aiPlayer);
  const canFly = variant !== 'sesotho';

  if (depth === 0) {
    return evaluateBoard(board, aiPlayer, phase, unplaced, variant);
  }

  // Calculate current phase for this player in the search tree
  const currentPhase = unplaced[currentPlayer] > 0
    ? 'placing'
    : (board.filter(p => p === currentPlayer).length <= 3 && canFly ? 'flying' : 'moving');

  const moves = generateMoves(board, currentPlayer, currentPhase, unplaced, variant);
  if (moves.length === 0) {
    return isMaximizing ? -10000 : 10000; // No moves means loss
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      if (move.from !== null) newBoard[move.from] = null;
      newBoard[move.to] = currentPlayer;
      if (move.shoot !== null) newBoard[move.shoot] = null;

      const newUnplaced = { ...unplaced };
      if (move.from === null) newUnplaced[currentPlayer]--;

      const ev = minimax(newBoard, depth - 1, false, aiPlayer, phase, newUnplaced, alpha, beta, variant);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = [...board];
      if (move.from !== null) newBoard[move.from] = null;
      newBoard[move.to] = currentPlayer;
      if (move.shoot !== null) newBoard[move.shoot] = null;

      const newUnplaced = { ...unplaced };
      if (move.from === null) newUnplaced[currentPlayer]--;

      const ev = minimax(newBoard, depth - 1, true, aiPlayer, phase, newUnplaced, alpha, beta, variant);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
