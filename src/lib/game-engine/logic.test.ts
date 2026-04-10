import { describe, it, expect } from 'vitest';
import { getOpponent, isMill, canShoot, getValidMoves, hasValidMoves, checkWinCondition, getFormedMill } from './logic';
import type { GameState, Player, BoardVariant } from '@/types/game';

describe('Game Logic', () => {

  describe('getOpponent', () => {
    it('should return player2 when given player1', () => {
      expect(getOpponent('player1')).toBe('player2');
    });

    it('should return player1 when given player2', () => {
      expect(getOpponent('player2')).toBe('player1');
    });
  });

  describe('isMill', () => {
    it('should detect a mill on the outer ring', () => {
      const board = Array(24).fill(null);
      board[0] = 'player1';
      board[1] = 'player1';
      board[2] = 'player1';
      expect(isMill(board, 1, 'player1', 'standard')).toBe(true);
    });

    it('should not detect a mill with mixed pieces', () => {
      const board = Array(24).fill(null);
      board[0] = 'player1';
      board[1] = 'player2';
      board[2] = 'player1';
      expect(isMill(board, 1, 'player1', 'standard')).toBe(false);
    });

    it('should detect mill on inner ring', () => {
      const board = Array(24).fill(null);
      board[16] = 'player2';
      board[17] = 'player2';
      board[18] = 'player2';
      expect(isMill(board, 17, 'player2', 'standard')).toBe(true);
    });
  });

  describe('getFormedMill', () => {
    it('should return the mill nodes when a mill is formed', () => {
      const board = Array(24).fill(null);
      board[0] = 'player1';
      board[1] = 'player1';
      board[2] = 'player1';
      const mill = getFormedMill(board, 1, 'player1', 'standard');
      expect(mill).toEqual([0, 1, 2]);
    });

    it('should return null when no mill is formed', () => {
      const board = Array(24).fill(null);
      board[0] = 'player1';
      board[1] = 'player1';
      expect(getFormedMill(board, 1, 'player1', 'standard')).toBeNull();
    });
  });

  describe('canShoot', () => {
    it('should allow shooting non-mill pieces', () => {
      const board = Array(24).fill(null);
      board[0] = 'player2';
      expect(canShoot(board, 0, 'player2', 'standard')).toBe(true);
    });

    it('should not allow shooting mill pieces when other non-mill pieces exist', () => {
      const board = Array(24).fill(null);
      board[0] = 'player2';
      board[1] = 'player2';
      board[2] = 'player2';
      board[4] = 'player2';
      expect(canShoot(board, 1, 'player2', 'standard')).toBe(false);
    });

    it('should allow shooting mill pieces when all opponent pieces are in mills', () => {
      const board = Array(24).fill(null);
      board[0] = 'player2';
      board[1] = 'player2';
      board[2] = 'player2';
      expect(canShoot(board, 1, 'player2', 'standard')).toBe(true);
    });
  });

  describe('getValidMoves', () => {
    it('should return all empty spots when flying', () => {
      const board = Array(24).fill(null);
      const moves = getValidMoves(board, 0, 'flying', 'standard');
      expect(moves.length).toBe(24);
    });

    it('should return only adjacent empty spots when moving', () => {
      const board = Array(24).fill(null);
      board[1] = 'player1';
      const moves = getValidMoves(board, 1, 'moving', 'standard');
      // Node 1 is adjacent to 0, 2, 9
      expect(moves).toEqual(expect.arrayContaining([0, 2, 9].filter(n => board[n] === null)));
    });
  });

  describe('hasValidMoves', () => {
    it('should return true when player has at least one valid move', () => {
      const board = Array(24).fill(null);
      board[0] = 'player1';
      expect(hasValidMoves(board, 'player1', 'moving', 'standard')).toBe(true);
    });

    it('should return false when player has no valid moves', () => {
      const board = Array(24).fill('player2');
      board[0] = 'player1';
      expect(hasValidMoves(board, 'player1', 'moving', 'standard')).toBe(false);
    });

    it('should return true during flying if any spot is empty', () => {
      const board = Array(24).fill('player2');
      board[0] = 'player1';
      expect(hasValidMoves(board, 'player1', 'flying', 'standard')).toBe(true);
    });
  });

  describe('checkWinCondition', () => {
    const createMockState = (overrides: Partial<GameState>): GameState => ({
      board: Array(24).fill(null),
      turn: 'player1',
      phase: 'placing',
      unplacedCows: { player1: 0, player2: 0 },
      cowsOnBoard: { player1: 12, player2: 12 },
      capturedCows: { player1: 0, player2: 0 },
      selectedNode: null,
      shootMode: false,
      winner: null,
      moveHistory: [],
      movesWithoutShoot: 0,
      variant: 'standard' as BoardVariant,
      soundEnabled: true,
      isSettingsOpen: false,
      coins: 0,
      stats: { wins: 0, losses: 0, draws: 0, totalGames: 0, millsFormed: 0, cowsCaptured: 0 },
      unlockedSkins: ['classic'],
      currentSkin: 'classic',
      activeMill: null,
      lastMove: null,
      elapsedTime: 0,
      markedNodes: [],
      progress: { xp: 0, level: 1, completedLevels: [], levelStars: {} },
      currentLevelId: null,
      showHint: null,
      lastLeveledUp: null,
      boardHistory: [],
      ...overrides,
    });

    it('should return null when game is ongoing', () => {
      const state = createMockState({});
      expect(checkWinCondition(state)).toBeNull();
    });

    it('should return player2 when player1 has fewer than 3 cows', () => {
      const state = createMockState({
        cowsOnBoard: { player1: 2, player2: 12 },
      });
      expect(checkWinCondition(state)).toBe('player2');
    });

    it('should return player1 when player2 has no valid moves', () => {
      // Fill all spots with player2 except where player1 is
      const board = Array(24).fill('player2') as (Player | null)[];
      board[0] = 'player1';
      const state = createMockState({ board });
      expect(checkWinCondition(state)).toBe('player1');
    });

    it('should return draw when movesWithoutShoot >= 60', () => {
      const state = createMockState({ movesWithoutShoot: 60 });
      expect(checkWinCondition(state)).toBe('draw');
    });
  });
});
