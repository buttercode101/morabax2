import { useEffect, useRef } from 'react';
import { useGameStore, LEVELS } from '@/store/gameStore';
import { Player } from '@/types/game';
import { Undo2, Settings as SettingsIcon, Home, Coins, Clock, Lightbulb, Zap, RefreshCw, Share2 } from 'lucide-react';
import { Piece } from './Piece';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function GameUI({ onHome }: { onHome: () => void }) {
  const { turn, phase, unplacedCows, capturedCows, shootMode, undo, mode, setSettingsOpen, coins, elapsedTime, setElapsedTime, winner, isSettingsOpen, progress, getHint, isRotated, setRotated, player1Name, exportGameState, addNotification, undoCount } = useGameStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleShare = () => {
    const encoded = exportGameState();
    const url = `${window.location.origin}?game=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      addNotification('Game link copied to clipboard!', 'success');
    }).catch(() => {
      addNotification('Failed to copy game link', 'warning');
    });
  };

  const handleUndo = () => {
    if (undoCount >= 3) {
      addNotification('No undos remaining', 'warning');
    } else {
      undo();
    }
  };

  const xpPercent = ((progress?.xp || 0) / ((progress?.level || 1) * 1000)) * 100;

  // Timer: uses ref to avoid interval re-creation on state changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!winner && !isSettingsOpen) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(useGameStore.getState().elapsedTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [winner, isSettingsOpen, setElapsedTime]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderPlayerInfo = (player: Player, name: string) => {
    const isTurn = turn === player;
    const isP1 = player === 'player1';
    const isAIThinking = !isP1 && mode === 'pve' && isTurn && !winner;

    return (
      <div className={cn(
        "flex flex-col p-5 md:p-6 rounded-[2.5rem] transition-all duration-500 w-full md:max-w-[240px] relative overflow-hidden",
        isTurn ? "leather-panel shadow-2xl scale-105 ring-2 ring-gold-500/30" : "opacity-40 grayscale scale-95",
        isP1 ? "items-start" : "items-end"
      )}>
        {/* Thinking Pulse for AI */}
        {isAIThinking && (
          <motion.div 
            className="absolute inset-0 bg-gold-500/10 pointer-events-none"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className={cn("flex items-center gap-4 mb-4 relative z-10 w-full", !isP1 && "flex-row-reverse")}>
          <div className="relative shrink-0">
            <motion.div
              animate={isAIThinking ? { scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Piece player={player} className="w-12 h-12 md:w-16 md:h-16" />
            </motion.div>
            {isTurn && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute -top-1 -right-1 w-5 h-5 bg-gold-500 rounded-full border-2 border-earth-950 shadow-[0_0_20px_rgba(249,176,26,0.9)]"
              />
            )}
          </div>
          <div className={cn("flex-1", isP1 ? "text-left" : "text-right")}>
            <h2 className="text-xl md:text-2xl font-display font-black text-earth-200 leading-none engraved-text mb-1">{name}</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-gold-600/80">
              {isP1 ? "Player 1" : (mode === 'pve' ? "AI Opponent" : "Player 2")}
            </span>
          </div>
        </div>
        
        <div className={cn("flex gap-1.5 flex-wrap mb-4 relative z-10", !isP1 && "justify-end")}>
          {Array.from({ length: unplacedCows[player] }).map((_, i) => (
            <div key={i} className={cn(
              "w-3 h-3 rounded-full shadow-inner border border-black/20",
              isP1 ? "bg-earth-400" : "bg-earth-800 border-earth-700"
            )} />
          ))}
        </div>
        <div className="text-[10px] font-black text-earth-500 uppercase tracking-widest relative z-10 flex items-center gap-2">
          Captured: <span className="text-earth-100 text-sm">{capturedCows[player]}</span>
        </div>

        {/* AI Progress Bar */}
        {isAIThinking && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-earth-950/50">
            <motion.div 
              className="h-full bg-gold-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-12 px-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 leather-panel px-8 py-5 rounded-[3rem] relative overflow-hidden border border-earth-700/30 shadow-2xl">
        {/* XP Bar Background */}
        <div className="absolute bottom-0 left-0 h-2 bg-earth-950/50 w-full" />
        <motion.div 
          className="absolute bottom-0 left-0 h-2 bg-gold-600 shadow-[0_0_20px_rgba(217,119,6,0.7)]" 
          initial={{ width: 0 }}
          animate={{ width: `${xpPercent}%` }}
          transition={{ duration: 1.2, ease: "circOut" }}
        />

        <button onClick={onHome} className="flex items-center gap-3 text-earth-400 hover:text-gold-500 transition-all font-black uppercase tracking-widest text-xs group">
          <div className="p-2 bg-earth-950/50 rounded-xl group-hover:bg-earth-800 transition-colors">
            <Home size={18} />
          </div>
          Main Menu
        </button>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-earth-950/50 text-gold-500 px-5 py-2 rounded-full shadow-inner border border-earth-800/50">
            <Zap size={16} className="fill-gold-500" />
            <span className="text-xs font-black uppercase tracking-widest">Level {progress?.level || 1}</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-base font-bold text-earth-300 bg-earth-950/50 px-5 py-2 rounded-full border border-earth-800/50 shadow-inner">
            <Clock size={18} className="text-earth-500" /> {formatTime(elapsedTime)}
          </div>
        </div>

        <div className="flex items-center gap-3 text-gold-500 font-black bg-gold-950/50 px-6 py-2 rounded-full border border-gold-900/50 shadow-inner">
          <Coins size={22} className="drop-shadow-[0_0_5px_rgba(245,158,11,0.4)]" /> 
          <span className="text-xl">{coins}</span>
        </div>
      </div>

      {/* Player Info & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-8">
        <div className="flex-1 flex justify-center lg:justify-start">
          {renderPlayerInfo('player1', player1Name || 'Player 1')}
        </div>
        
        <div className="flex flex-col items-center justify-center px-10 py-6 leather-panel rounded-[3rem] min-w-[280px] border border-earth-700/30 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-colors pointer-events-none" />
          <div className="text-xs font-black text-gold-600 uppercase tracking-[0.3em] mb-3">
            {shootMode ? 'Shoot Phase' : `${phase} Phase`}
          </div>
          <div className={cn(
            "text-center font-display font-black text-2xl h-10 mb-6 leading-none transition-colors duration-500",
            shootMode ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" : "text-earth-200 engraved-text"
          )}>
            {shootMode 
              ? "Capture a Cow!" 
              : `${turn === 'player1' ? 'Your Move' : (mode === 'pve' ? 'AI Thinking...' : 'Player 2 Move')}`}
          </div>
          
          <div className="flex gap-2 p-2 bg-earth-950/50 rounded-full border border-earth-800/50 shadow-inner">
            {[
              { icon: Lightbulb, action: getHint, disabled: turn !== 'player1' || shootMode, title: 'Get Hint', color: 'text-gold-500' },
              { icon: Undo2, action: handleUndo, disabled: undoCount >= 3, title: `Undo (${3 - undoCount} left)`, color: undoCount >= 3 ? 'text-red-400' : 'text-earth-300' },
              { icon: RefreshCw, action: () => setRotated(!isRotated), disabled: mode !== 'pvp', title: 'Rotate Board', color: isRotated ? 'text-gold-500' : 'text-earth-400' },
              { icon: Share2, action: handleShare, disabled: false, title: 'Share Game', color: 'text-gold-400' },
              { icon: SettingsIcon, action: () => setSettingsOpen(true), disabled: false, title: 'Settings', color: 'text-earth-400' }
            ].map((btn, idx) => (
              <button 
                key={idx}
                onClick={btn.action}
                disabled={btn.disabled}
                className={cn(
                  "p-4 rounded-full transition-all shadow-lg relative group/btn",
                  btn.disabled ? "opacity-20 cursor-not-allowed" : "hover:bg-earth-800 hover:scale-110 active:scale-95",
                  btn.color
                )}
                title={btn.title}
              >
                <btn.icon size={22} />
                {!btn.disabled && (
                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-earth-900 text-[10px] font-black uppercase tracking-widest text-earth-200 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap border border-earth-700 pointer-events-none">
                    {btn.title}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          {renderPlayerInfo('player2', mode === 'pve' ? (LEVELS.find(l => l.id === useGameStore.getState().currentLevelId)?.opponentName || 'AI') : 'Player 2')}
        </div>
      </div>
    </div>
  );
}
