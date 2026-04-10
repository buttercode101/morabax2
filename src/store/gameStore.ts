import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Phase, GameState, Difficulty, GameMode, BoardVariant, SkinId, Level } from '@/types/game';
import { getOpponent, isMill, canShoot, getValidMoves, checkWinCondition, getFormedMill, isPartOfMill } from '@/lib/game-engine/logic';
import { getBestMove } from '@/lib/game-engine/ai';
import { playSound, setSoundEnabled, setVolume as setAudioVolume } from '@/lib/audio';
import confetti from 'canvas-confetti';

// Unique ID generator for notifications
let notificationIdCounter = 0;

// Helper: apply a completed move to state (used by both human and AI)
function applyMoveToState(
  state: any,
  board: (Player | null)[],
  turn: Player,
  from: number | null,
  to: number,
  shoot: number | null,
  unplacedCows: Record<Player, number>,
  cowsOnBoard: Record<Player, number>,
  capturedCows: Record<Player, number>,
  movesWithoutShoot: number,
  markedNodes: number[],
  variant: BoardVariant
): Partial<any> {
  const opponent = getOpponent(turn);
  const formedMill = getFormedMill(board, to, turn, variant);
  const moveNotation = from !== null
    ? `${from !== null ? board[from] === 'player1' ? 'W' : 'B' : '-'}→${to}`
    : `Place@${to}`;

  if (shoot !== null) {
    // Capture applied
    board[shoot] = null;
    const newCaptured = { ...capturedCows, [turn]: capturedCows[turn] + 1 };
    const newCowsOnBoard = { ...cowsOnBoard, [opponent]: cowsOnBoard[opponent] - 1 };

    let newMarkedNodes = [...markedNodes];
    if (variant === 'gonjilgonu') {
      newMarkedNodes.push(shoot);
    }

    return {
      board: [...board],
      selectedNode: null,
      turn: opponent,
      cowsOnBoard: newCowsOnBoard,
      capturedCows: newCaptured,
      shootMode: false,
      movesWithoutShoot: 0,
      activeMill: null,
      lastMove: { from, to },
      markedNodes: newMarkedNodes,
      moveHistory: [...state.moveHistory, `${moveNotation} x${shoot}`],
    };
  } else if (formedMill) {
    // Mill formed, enter shoot mode
    return {
      board: [...board],
      selectedNode: null,
      shootMode: true,
      activeMill: formedMill,
      lastMove: { from, to },
      movesWithoutShoot: movesWithoutShoot + 1,
      moveHistory: [...state.moveHistory, `${moveNotation} MILL!`],
    };
  } else {
    // Normal move
    const nextPhase = unplacedCows[opponent] > 0
      ? 'placing'
      : (cowsOnBoard[opponent] <= 3 && variant !== 'sesotho' ? 'flying' : 'moving');

    let newMarkedNodes = [...markedNodes];
    if (nextPhase !== 'placing') {
      newMarkedNodes = [];
    }

    return {
      board: [...board],
      selectedNode: null,
      turn: opponent,
      phase: nextPhase,
      movesWithoutShoot: movesWithoutShoot + 1,
      activeMill: null,
      lastMove: { from, to },
      markedNodes: newMarkedNodes,
      moveHistory: [...state.moveHistory, moveNotation],
    };
  }
}

export const LEVELS: Level[] = [
  { id: 1, name: "The Herdboy's Trial", difficulty: 'easy', variant: 'standard', opponentName: "Young Thabo", description: "Learn the basics of the game.", unlocked: true, stars: 0, reward: 100 },
  { id: 2, name: "The Village Square", difficulty: 'easy', variant: 'standard', opponentName: "Elder Mofokeng", description: "A friendly match in the village.", unlocked: false, stars: 0, reward: 150 },
  { id: 3, name: "Mountain Pass", difficulty: 'medium', variant: 'sesotho', opponentName: "The Agile Climber", description: "The terrain is different here.", unlocked: false, stars: 0, reward: 200 },
  { id: 4, name: "The Chief's Kraal", difficulty: 'medium', variant: '11men', opponentName: "Chieftain Mzobe", description: "Fewer cows, higher stakes.", unlocked: false, stars: 0, reward: 300 },
  { id: 5, name: "The Great Plateau", difficulty: 'hard', variant: 'gonjilgonu', opponentName: "The Wind Rider", description: "Every capture leaves a mark.", unlocked: false, stars: 0, reward: 500 },
  { id: 6, name: "Legendary Arena", difficulty: 'expert', variant: 'standard', opponentName: "The Ancient Guardian", description: "Only the best can win here.", unlocked: false, stars: 0, reward: 1000 },
];

interface GameStore extends GameState {
  mode: GameMode;
  difficulty: Difficulty;
  history: GameState[];
  savedSlot: GameState | null;
  isRotated: boolean;
  undoCount: number;
  showNotation: boolean;
  volume: number;
  player1Name: string;
  player2Name: string;
  boardHistory: string[]; // For threefold repetition detection
  gameNotifications: Array<{ id: number; message: string; type: 'info' | 'success' | 'warning' }>;
  setRotated: (rotated: boolean) => void;
  setMode: (mode: GameMode) => void;
  setDifficulty: (diff: Difficulty) => void;
  setVariant: (variant: BoardVariant) => void;
  toggleSound: () => void;
  setSettingsOpen: (isOpen: boolean) => void;
  startNewGame: (levelId?: number) => void;
  handleNodeClick: (nodeIdx: number, isAI?: boolean) => void;
  aiApplyMove: (from: number | null, to: number, shoot: number | null) => void;
  undo: () => void;
  aiMove: () => void;
  continueFromAd: () => void;
  buySkin: (skin: SkinId, cost: number) => void;
  equipSkin: (skin: SkinId) => void;
  recordGameResult: (winner: Player | 'draw') => void;
  saveToSlot: () => void;
  loadFromSlot: () => void;
  setElapsedTime: (time: number) => void;
  getHint: () => void;
  addXP: (amount: number) => void;
  setShowNotation: (show: boolean) => void;
  setVolume: (vol: number) => void;
  setPlayerNames: (p1: string, p2: string) => void;
  dismissNotification: (id: number) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning') => void;
  exportGameState: () => string;
  importGameState: (encoded: string) => void;
}

const initialState = {
  board: Array(24).fill(null) as (Player | null)[],
  turn: 'player1' as Player,
  phase: 'placing' as Phase,
  unplacedCows: { player1: 12, player2: 12 },
  cowsOnBoard: { player1: 0, player2: 0 },
  capturedCows: { player1: 0, player2: 0 },
  selectedNode: null as number | null,
  shootMode: false,
  winner: null as Player | 'draw' | null,
  moveHistory: [] as string[],
  movesWithoutShoot: 0,
  activeMill: null as number[] | null,
  lastMove: null as { from: number | null, to: number } | null,
  elapsedTime: 0,
  markedNodes: [] as number[],
  lastLeveledUp: null as number | null,
  boardHistory: [] as string[],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      mode: 'pve',
      difficulty: 'medium',
      variant: 'standard',
      soundEnabled: true,
      isSettingsOpen: false,
      history: [],
      savedSlot: null,
      coins: 0,
      stats: { wins: 0, losses: 0, draws: 0, totalGames: 0, millsFormed: 0, cowsCaptured: 0 },
      unlockedSkins: ['classic'],
      currentSkin: 'classic',
      currentLevelId: null,
      showHint: null,
      isRotated: false,
      undoCount: 0,
      showNotation: false,
      volume: 0.7,
      player1Name: 'Player 1',
      player2Name: 'Player 2',
      gameNotifications: [],
      progress: {
        xp: 0,
        level: 1,
        completedLevels: [],
        levelStars: {},
      },

      setMode: (mode) => set({ mode }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setVariant: (variant) => {
        set({ variant });
        get().startNewGame();
      },
      toggleSound: () => set((state) => {
        const newEnabled = !state.soundEnabled;
        setSoundEnabled(newEnabled);
        return { soundEnabled: newEnabled };
      }),
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
      setElapsedTime: (time) => set({ elapsedTime: time }),
      setRotated: (isRotated) => set({ isRotated }),

      addXP: (amount) => {
        const state = get();
        const newXP = state.progress.xp + amount;
        const nextLevelXP = state.progress.level * 1000;
        if (newXP >= nextLevelXP) {
          const newLevel = state.progress.level + 1;
          set({
            progress: {
              ...state.progress,
              xp: newXP - nextLevelXP,
              level: newLevel
            },
            lastLeveledUp: newLevel
          });
          playSound('win');
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#fbbf24', '#ffffff']
          });
        } else {
          set({ progress: { ...state.progress, xp: newXP } });
        }
      },

      getHint: () => {
        const state = get();
        if (state.winner || state.turn !== 'player1') return;
        const move = getBestMove(state.board, 'player1', state.phase, state.unplacedCows, 3, state.variant);
        if (move) {
          set({ showHint: move.to });
          setTimeout(() => set({ showHint: null }), 2000);
        }
      },

      saveToSlot: () => {
        const state = get();
        set({ savedSlot: {
          board: state.board, turn: state.turn, phase: state.phase,
          unplacedCows: state.unplacedCows, cowsOnBoard: state.cowsOnBoard,
          capturedCows: state.capturedCows, selectedNode: state.selectedNode,
          shootMode: state.shootMode, winner: state.winner, moveHistory: state.moveHistory,
          movesWithoutShoot: state.movesWithoutShoot, variant: state.variant,
          soundEnabled: state.soundEnabled, isSettingsOpen: state.isSettingsOpen,
          coins: state.coins, stats: state.stats, unlockedSkins: state.unlockedSkins,
          currentSkin: state.currentSkin, activeMill: state.activeMill,
          lastMove: state.lastMove, elapsedTime: state.elapsedTime,
          markedNodes: state.markedNodes, progress: state.progress,
          currentLevelId: state.currentLevelId, showHint: state.showHint,
          lastLeveledUp: state.lastLeveledUp, boardHistory: state.boardHistory,
        } });
      },

      loadFromSlot: () => {
        const state = get();
        if (state.savedSlot) {
          set({ ...state.savedSlot });
        }
      },

      buySkin: (skin, cost) => {
        const state = get();
        if (state.coins >= cost && !state.unlockedSkins.includes(skin)) {
          set({
            coins: state.coins - cost,
            unlockedSkins: [...state.unlockedSkins, skin],
            currentSkin: skin
          });
        }
      },
      equipSkin: (skin) => set({ currentSkin: skin }),

      recordGameResult: (winner) => {
        const state = get();
        let coinsEarned = 10;
        let xpEarned = 50;
        const newStats = { ...state.stats };
        newStats.totalGames++;

        if (winner === 'draw') {
          coinsEarned = 20;
          xpEarned = 100;
          newStats.draws++;
        } else if (state.mode === 'pve') {
          if (winner === 'player1') {
            coinsEarned = 50;
            xpEarned = 200;
            newStats.wins++;
            
            // Handle Level Completion
            if (state.currentLevelId) {
              const level = LEVELS.find(l => l.id === state.currentLevelId);
              const stars = state.capturedCows.player2 <= 3 ? 3 : (state.capturedCows.player2 <= 6 ? 2 : 1);
              const newCompleted = [...state.progress.completedLevels];
              if (!newCompleted.includes(state.currentLevelId)) {
                newCompleted.push(state.currentLevelId);
                coinsEarned += level?.reward || 0;
              }
              const newStars = { ...state.progress.levelStars, [state.currentLevelId]: Math.max(state.progress.levelStars[state.currentLevelId] || 0, stars) };
              set({ progress: { ...state.progress, completedLevels: newCompleted, levelStars: newStars } });
            }
          } else {
            coinsEarned = 10;
            xpEarned = 20;
            newStats.losses++;
          }
        } else {
          coinsEarned = 30;
          xpEarned = 150;
        }

        set({
          coins: state.coins + coinsEarned,
          stats: newStats
        });
        get().addXP(xpEarned);
      },

      startNewGame: (levelId) => {
        const state = get();
        let variant = state.variant;
        let difficulty = state.difficulty;
        let mode = state.mode;
        const p2Name = levelId
          ? (LEVELS.find(l => l.id === levelId)?.opponentName || 'AI')
          : (mode === 'pve' ? 'AI' : 'Player 2');

        if (levelId) {
          const level = LEVELS.find(l => l.id === levelId);
          if (level) {
            variant = level.variant;
            difficulty = level.difficulty;
            mode = 'pve';
          }
        }

        const numNodes = variant === 'sesotho' ? 25 : 24;
        const numPieces = variant === '11men' ? 11 : 12;
        set({
          ...initialState,
          board: Array(numNodes).fill(null),
          unplacedCows: { player1: numPieces, player2: numPieces },
          history: [],
          winner: null,
          markedNodes: [],
          variant,
          difficulty,
          mode,
          currentLevelId: levelId || null,
          lastLeveledUp: null,
          showNotation: false,
          volume: state.volume,
          player1Name: state.player1Name || 'Player 1',
          player2Name: p2Name,
          undoCount: 0,
          boardHistory: [],
          gameNotifications: [],
        });
        playSound('start');
      },

      undo: () => {
        set((state) => {
          if (state.history.length === 0) return state;
          if (state.undoCount >= 3) {
            get().addNotification('Undo limit reached (3 per game)', 'warning');
            return state;
          }
          const newHistory = [...state.history];
          const previousState = newHistory.pop()!;
          // If playing AI, undo twice to get back to player's turn
          if (state.mode === 'pve' && previousState.turn === 'player2' && newHistory.length > 0) {
             const playerState = newHistory.pop()!;
             return { ...playerState, history: newHistory, undoCount: state.undoCount + 1 };
          }
          return { ...previousState, history: newHistory, undoCount: state.undoCount + 1 };
        });
      },

      continueFromAd: () => {
        get().addNotification('Continue feature not yet implemented', 'info');
      },

      handleNodeClick: (nodeIdx: number, isAI: boolean = false) => {
        const state = get();
        if (state.winner) return;
        if (state.mode === 'pve' && state.turn === 'player2' && !isAI) return; // AI's turn

        const { board, turn, phase, unplacedCows, cowsOnBoard, capturedCows, selectedNode, shootMode, movesWithoutShoot, variant } = state;

        // Save history before move
        const saveHistory = () => {
          const bh = `${state.board.join(',')}-${state.turn}`;
          set(s => ({
            history: [...s.history, {
              board: [...s.board], turn: s.turn, phase: s.phase, unplacedCows: {...s.unplacedCows},
              cowsOnBoard: {...s.cowsOnBoard}, capturedCows: {...s.capturedCows}, selectedNode: s.selectedNode,
              shootMode: s.shootMode, winner: s.winner, moveHistory: [...s.moveHistory], movesWithoutShoot: s.movesWithoutShoot,
              variant: s.variant, soundEnabled: s.soundEnabled, isSettingsOpen: s.isSettingsOpen,
              coins: s.coins, stats: s.stats, unlockedSkins: s.unlockedSkins, currentSkin: s.currentSkin,
              activeMill: s.activeMill, lastMove: s.lastMove, elapsedTime: s.elapsedTime,
              markedNodes: [...s.markedNodes], progress: {...s.progress},
              currentLevelId: s.currentLevelId, showHint: s.showHint, lastLeveledUp: s.lastLeveledUp,
              boardHistory: [...s.boardHistory, bh],
            }],
            boardHistory: [...s.boardHistory, bh],
          }));
        };

        if (shootMode) {
          if (canShoot(board, nodeIdx, getOpponent(turn), variant)) {
            saveHistory();
            const newBoard = [...board];
            newBoard[nodeIdx] = null;
            playSound('shoot');
            
            const newCowsOnBoard = { ...cowsOnBoard, [getOpponent(turn)]: cowsOnBoard[getOpponent(turn)] - 1 };
            const newCaptured = { ...capturedCows, [turn]: capturedCows[turn] + 1 };
            
            const nextTurn = getOpponent(turn);
            const canFly = variant !== 'sesotho';
            const nextPhase = unplacedCows[nextTurn] > 0 ? 'placing' : (newCowsOnBoard[nextTurn] <= 3 && canFly ? 'flying' : 'moving');

            let newMarkedNodes = [...state.markedNodes];
            if (variant === 'gonjilgonu' && phase === 'placing') {
              newMarkedNodes.push(nodeIdx);
            }
            if (nextPhase !== 'placing') {
              newMarkedNodes = [];
            }

            set({
              board: newBoard,
              shootMode: false,
              turn: nextTurn,
              cowsOnBoard: newCowsOnBoard,
              capturedCows: newCaptured,
              phase: nextPhase,
              movesWithoutShoot: 0,
              activeMill: null,
              markedNodes: newMarkedNodes,
            });

            const winner = checkWinCondition(get());
            if (winner) {
              set({ winner });
              get().recordGameResult(winner);
              if (winner !== 'draw') playSound('win');
            } else if (get().mode === 'pve' && nextTurn === 'player2') {
              setTimeout(() => get().aiMove(), 500);
            }
          }
          return;
        }

        if (phase === 'placing') {
          if (board[nodeIdx] === null) {
            if (variant === 'gonjilgonu' && state.markedNodes.includes(nodeIdx)) {
              return; // Cannot place on marked node in Gonjilgonu
            }
            saveHistory();
            const newBoard = [...board];
            newBoard[nodeIdx] = turn;
            playSound('place');

            const newUnplaced = { ...unplacedCows, [turn]: unplacedCows[turn] - 1 };
            const newCowsOnBoard = { ...cowsOnBoard, [turn]: cowsOnBoard[turn] + 1 };
            const moveRecord = { from: null, to: nodeIdx };

            if (isMill(newBoard, nodeIdx, turn, variant)) {
              playSound('mill');
              const millNodes = getFormedMill(newBoard, nodeIdx, turn, variant);
              set({ board: newBoard, unplacedCows: newUnplaced, cowsOnBoard: newCowsOnBoard, shootMode: true, activeMill: millNodes, lastMove: moveRecord });
            } else {
              const nextTurn = getOpponent(turn);
              const canFly = variant !== 'sesotho';
              const nextPhase = unplacedCows[nextTurn] > 0 ? 'placing' : (cowsOnBoard[nextTurn] <= 3 && unplacedCows[nextTurn] === 0 && canFly ? 'flying' : 'moving');
              
              let newMarkedNodes = [...state.markedNodes];
              if (nextPhase !== 'placing') {
                newMarkedNodes = [];
              }

              set({
                board: newBoard,
                turn: nextTurn,
                unplacedCows: newUnplaced,
                cowsOnBoard: newCowsOnBoard,
                phase: nextPhase,
                movesWithoutShoot: movesWithoutShoot + 1,
                activeMill: null,
                lastMove: moveRecord,
                markedNodes: newMarkedNodes
              });
              
              const winner = checkWinCondition(get());
              if (winner) {
                set({ winner });
                get().recordGameResult(winner);
                if (winner !== 'draw') playSound('win');
              } else if (get().mode === 'pve' && nextTurn === 'player2') {
                setTimeout(() => get().aiMove(), 500);
              }
            }
          }
        } else {
          // Moving or Flying
          if (selectedNode === null) {
            if (board[nodeIdx] === turn) {
              set({ selectedNode: nodeIdx });
              playSound('select');
            }
          } else {
            if (selectedNode === nodeIdx) {
              set({ selectedNode: null }); // Deselect
              return;
            }
            if (board[nodeIdx] === turn) {
              set({ selectedNode: nodeIdx }); // Change selection
              playSound('select');
              return;
            }

            const validMoves = getValidMoves(board, selectedNode, phase, variant);
            if (validMoves.includes(nodeIdx)) {
              saveHistory();
              const newBoard = [...board];
              newBoard[selectedNode] = null;
              newBoard[nodeIdx] = turn;
              playSound('move');
              
              const moveRecord = { from: selectedNode, to: nodeIdx };

              if (isMill(newBoard, nodeIdx, turn, variant)) {
                playSound('mill');
                const millNodes = getFormedMill(newBoard, nodeIdx, turn, variant);
                set({ board: newBoard, selectedNode: null, shootMode: true, activeMill: millNodes, lastMove: moveRecord });
              } else {
                const nextTurn = getOpponent(turn);
                const canFly = variant !== 'sesotho';
                const nextPhase = unplacedCows[nextTurn] > 0 ? 'placing' : (cowsOnBoard[nextTurn] <= 3 && canFly ? 'flying' : 'moving');
                set({
                  board: newBoard,
                  selectedNode: null,
                  turn: nextTurn,
                  phase: nextPhase,
                  movesWithoutShoot: movesWithoutShoot + 1,
                  activeMill: null,
                  lastMove: moveRecord
                });

                const winner = checkWinCondition(get());
                if (winner) {
                  set({ winner });
                  get().recordGameResult(winner);
                  if (winner !== 'draw') playSound('win');
                } else if (get().mode === 'pve' && nextTurn === 'player2') {
                  setTimeout(() => get().aiMove(), 500);
                }
              }
            }
          }
        }
      },

      // AI Move - directly applies state changes instead of simulating clicks
      aiMove: () => {
        const state = get();
        if (state.winner || state.turn !== 'player2') return;

        const depthMap = { easy: 1, medium: 2, hard: 3, expert: 4 };
        const depth = depthMap[state.difficulty] || 2;

        let move = null;
        try {
          move = getBestMove(state.board, 'player2', state.phase, state.unplacedCows, depth, state.variant);
        } catch (e) {
          console.error("AI Error:", e);
        }

        if (move) {
          // Animate AI piece selection briefly
          if (move.from !== null) {
            set({ selectedNode: move.from });
          }

          setTimeout(() => {
            const currentState = get();
            if (currentState.turn !== 'player2') return;

            // Apply the move directly to state
            const newBoard = [...currentState.board];
            if (move.from !== null) {
              newBoard[move.from] = null;
            }
            newBoard[move.to] = 'player2';

            playSound(move.from !== null ? 'move' : 'place');

            // Handle capture if shooting
            if (move.shoot !== null) {
              newBoard[move.shoot] = null;
              playSound('shoot');
              const result = applyMoveToState(
                currentState, newBoard, 'player2',
                move.from, move.to, move.shoot,
                currentState.unplacedCows, currentState.cowsOnBoard,
                currentState.capturedCows, currentState.movesWithoutShoot,
                currentState.markedNodes, currentState.variant
              );

              const newUnplaced = { ...currentState.unplacedCows };
              if (move.from === null) newUnplaced.player2--;
              const newCowsOnBoard = { ...currentState.cowsOnBoard, player2: currentState.cowsOnBoard.player2 + 1 };

              set({
                ...result,
                unplacedCows: newUnplaced,
                cowsOnBoard: newCowsOnBoard,
              });

              get().addNotification(`AI captured your cow!`, 'warning');
            } else {
              // Check if mill formed
              const formedMill = getFormedMill(newBoard, move.to, 'player2', currentState.variant);
              if (formedMill) {
                playSound('mill');
                const newUnplaced = { ...currentState.unplacedCows };
                if (move.from === null) newUnplaced.player2--;
                const newCowsOnBoard = { ...currentState.cowsOnBoard, player2: currentState.cowsOnBoard.player2 + 1 };

                set({
                  board: newBoard,
                  selectedNode: null,
                  shootMode: true,
                  activeMill: formedMill,
                  lastMove: { from: move.from, to: move.to },
                  unplacedCows: newUnplaced,
                  cowsOnBoard: newCowsOnBoard,
                  movesWithoutShoot: currentState.movesWithoutShoot + 1,
                  moveHistory: [...currentState.moveHistory, `AI→${move.to} MILL!`],
                });
                get().addNotification(`AI formed a Mill!`, 'warning');

                // AI auto-selects shoot target after a delay
                setTimeout(() => {
                  const shootState = get();
                  if (!shootState.shootMode || shootState.turn !== 'player2') return;

                  // Find best shoot target (prefer non-mill pieces)
                  let shootTarget: number | null = null;
                  for (let i = 0; i < newBoard.length; i++) {
                    if (newBoard[i] === 'player1' && canShoot(newBoard, i, 'player1', shootState.variant)) {
                      if (!isPartOfMill(newBoard, i, 'player1', shootState.variant)) {
                        shootTarget = i;
                        break;
                      }
                      if (shootTarget === null) shootTarget = i;
                    }
                  }

                  if (shootTarget !== null) {
                    get().handleNodeClick(shootTarget, true);
                  }
                }, 800);
              } else {
                const newUnplaced = { ...currentState.unplacedCows };
                if (move.from === null) newUnplaced.player2--;
                const newCowsOnBoard = { ...currentState.cowsOnBoard, player2: currentState.cowsOnBoard.player2 + 1 };
                const nextPhase = newUnplaced.player1 > 0
                  ? 'placing'
                  : (currentState.cowsOnBoard.player1 <= 3 && currentState.variant !== 'sesotho' ? 'flying' : 'moving');

                let newMarkedNodes = [...currentState.markedNodes];
                if (nextPhase !== 'placing') newMarkedNodes = [];

                set({
                  board: newBoard,
                  selectedNode: null,
                  turn: 'player1',
                  phase: nextPhase,
                  unplacedCows: newUnplaced,
                  cowsOnBoard: newCowsOnBoard,
                  movesWithoutShoot: currentState.movesWithoutShoot + 1,
                  activeMill: null,
                  lastMove: { from: move.from, to: move.to },
                  markedNodes: newMarkedNodes,
                  moveHistory: [...currentState.moveHistory, `AI→${move.to}`],
                });

                // Check win
                const winner = checkWinCondition(get());
                if (winner) {
                  set({ winner });
                  get().recordGameResult(winner);
                  if (winner !== 'draw') playSound('win');
                }
              }
            }
          }, 600);
        } else {
          // AI has no moves, player 1 wins
          set({ winner: 'player1' });
          get().recordGameResult('player1');
          playSound('win');
        }
      },

      // New: AI Apply Move - direct state application
      aiApplyMove: (from, to, shoot) => {
        const state = get();
        if (state.winner || state.turn !== 'player2') return;

        const newBoard = [...state.board];
        if (from !== null) newBoard[from] = null;
        newBoard[to] = 'player2';
        if (shoot !== null) newBoard[shoot] = null;

        playSound(shoot !== null ? 'shoot' : (from !== null ? 'move' : 'place'));

        const newUnplaced = { ...state.unplacedCows, player2: state.unplacedCows.player2 - (from === null ? 1 : 0) };
        const newCowsOnBoard = { ...state.cowsOnBoard, player2: state.cowsOnBoard.player2 + 1 };
        const newCaptured = shoot !== null ? { ...state.capturedCows, player2: state.capturedCows.player2 + 1 } : state.capturedCows;

        let newMarkedNodes = [...state.markedNodes];
        if (shoot !== null && state.variant === 'gonjilgonu') newMarkedNodes.push(shoot);

        const nextTurn = 'player1';
        const nextPhase = newUnplaced.player1 > 0
          ? 'placing'
          : (state.cowsOnBoard.player1 <= 3 && state.variant !== 'sesotho' ? 'flying' : 'moving');
        if (nextPhase !== 'placing') newMarkedNodes = [];

        set({
          board: newBoard,
          selectedNode: null,
          turn: nextTurn,
          phase: nextPhase,
          unplacedCows: newUnplaced,
          cowsOnBoard: newCowsOnBoard,
          capturedCows: newCaptured,
          shootMode: false,
          activeMill: null,
          lastMove: { from, to },
          movesWithoutShoot: shoot !== null ? 0 : state.movesWithoutShoot + 1,
          markedNodes: newMarkedNodes,
          moveHistory: [...state.moveHistory, `AI: ${from ?? '-'}→${to}${shoot !== null ? ` x${shoot}` : ''}`],
        });

        const winner = checkWinCondition(get());
        if (winner) {
          set({ winner });
          get().recordGameResult(winner);
          if (winner !== 'draw') playSound('win');
        }
      },

      // New: Toggle notation display
      setShowNotation: (show) => set({ showNotation: show }),

      // New: Set volume
      setVolume: (volume) => {
        setAudioVolume(volume);
        set({ volume });
      },

      // New: Set player names
      setPlayerNames: (player1Name, player2Name) => set({ player1Name, player2Name }),

      // New: Add notification
      addNotification: (message, type) => {
        const id = ++notificationIdCounter;
        set((state) => ({
          gameNotifications: [...state.gameNotifications, { id, message, type }],
        }));
        setTimeout(() => {
          set((state) => ({
            gameNotifications: state.gameNotifications.filter((n) => n.id !== id),
          }));
        }, 4000);
      },

      // New: Dismiss notification
      dismissNotification: (id) => {
        set((state) => ({
          gameNotifications: state.gameNotifications.filter((n) => n.id !== id),
        }));
      },

      // New: Export game state as encoded string
      exportGameState: () => {
        const state = get();
        const data = {
          board: state.board,
          turn: state.turn,
          phase: state.phase,
          unplacedCows: state.unplacedCows,
          cowsOnBoard: state.cowsOnBoard,
          capturedCows: state.capturedCows,
          variant: state.variant,
          mode: state.mode,
          difficulty: state.difficulty,
          moveHistory: state.moveHistory,
        };
        return btoa(JSON.stringify(data));
      },

      // New: Import game state from encoded string
      importGameState: (encoded) => {
        try {
          const data = JSON.parse(atob(encoded));
          set({
            board: data.board,
            turn: data.turn,
            phase: data.phase,
            unplacedCows: data.unplacedCows,
            cowsOnBoard: data.cowsOnBoard,
            capturedCows: data.capturedCows,
            variant: data.variant,
            mode: data.mode,
            difficulty: data.difficulty,
            moveHistory: data.moveHistory || [],
            winner: null,
            selectedNode: null,
            shootMode: false,
            activeMill: null,
            lastMove: null,
            history: [],
          });
        } catch (e) {
          console.error('Failed to import game state:', e);
        }
      },
    }),
    {
      name: 'morabaraba-storage',
      merge: (persistedState: any, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState;
        return {
          ...currentState,
          ...persistedState,
          variant: persistedState.variant || currentState.variant || 'standard',
          mode: persistedState.mode || currentState.mode || 'pve',
          difficulty: persistedState.difficulty || currentState.difficulty || 'medium',
          progress: {
            ...currentState.progress,
            ...(persistedState.progress || {})
          },
          stats: {
            ...currentState.stats,
            ...(persistedState.stats || {})
          },
          unlockedSkins: persistedState.unlockedSkins || currentState.unlockedSkins,
          currentSkin: persistedState.currentSkin || currentState.currentSkin,
          markedNodes: persistedState.markedNodes || currentState.markedNodes,
          board: persistedState.board || currentState.board,
          volume: persistedState.volume ?? currentState.volume,
          showNotation: persistedState.showNotation ?? currentState.showNotation,
          player1Name: persistedState.player1Name || currentState.player1Name,
          player2Name: persistedState.player2Name || currentState.player2Name,
          // Don't persist history or active game state to avoid stale state
          history: currentState.history,
          winner: currentState.winner,
          selectedNode: null,
          shootMode: false,
          activeMill: null,
        };
      },
      partialize: (state) => ({
        board: state.board,
        turn: state.turn,
        phase: state.phase,
        unplacedCows: state.unplacedCows,
        cowsOnBoard: state.cowsOnBoard,
        capturedCows: state.capturedCows,
        mode: state.mode,
        difficulty: state.difficulty,
        variant: state.variant,
        soundEnabled: state.soundEnabled,
        movesWithoutShoot: state.movesWithoutShoot,
        winner: state.winner,
        coins: state.coins,
        stats: state.stats,
        unlockedSkins: state.unlockedSkins,
        currentSkin: state.currentSkin,
        savedSlot: state.savedSlot,
        elapsedTime: state.elapsedTime,
        markedNodes: state.markedNodes,
        progress: state.progress,
        currentLevelId: state.currentLevelId,
        lastLeveledUp: state.lastLeveledUp,
        showHint: state.showHint,
        volume: state.volume,
        showNotation: state.showNotation,
        player1Name: state.player1Name,
        player2Name: state.player2Name,
      })
    }
  )
);
