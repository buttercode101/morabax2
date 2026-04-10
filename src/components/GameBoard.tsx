import { useGameStore } from '@/store/gameStore';
import { BOARD_CONFIGS, BOARD_NOTATION } from '@/lib/game-engine/constants';
import { canShoot, getOpponent, getValidMoves } from '@/lib/game-engine/logic';
import { Node } from './Node';
import { Piece } from './Piece';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function GameBoard() {
  const { board, handleNodeClick, variant, activeMill, lastMove, isRotated, selectedNode, shootMode, turn, phase, showNotation } = useGameStore();

  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  const { coords } = config;

  // Keyboard navigation
  const handleBoardKeyDown = (e: React.KeyboardEvent) => {
    if (selectedNode === null) return;
    const currentCoord = coords[selectedNode];
    if (!currentCoord) return;
    let targetNode: number | null = null;

    switch (e.key) {
      case 'ArrowUp':
        // Find closest node above
        targetNode = coords
          .map((c, i) => ({ ...c, i }))
          .filter(c => c.y < currentCoord.y - 5 && !board[c.i])
          .sort((a, b) => b.y - a.y)[0]?.i ?? null;
        break;
      case 'ArrowDown':
        targetNode = coords
          .map((c, i) => ({ ...c, i }))
          .filter(c => c.y > currentCoord.y + 5 && !board[c.i])
          .sort((a, b) => a.y - b.y)[0]?.i ?? null;
        break;
      case 'ArrowLeft':
        targetNode = coords
          .map((c, i) => ({ ...c, i }))
          .filter(c => c.x < currentCoord.x - 5 && !board[c.i])
          .sort((a, b) => b.x - a.x)[0]?.i ?? null;
        break;
      case 'ArrowRight':
        targetNode = coords
          .map((c, i) => ({ ...c, i }))
          .filter(c => c.x > currentCoord.x + 5 && !board[c.i])
          .sort((a, b) => a.x - b.x)[0]?.i ?? null;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleNodeClick(selectedNode);
        return;
      case 'Escape':
        handleNodeClick(selectedNode); // Deselect
        return;
    }

    if (targetNode !== null) {
      e.preventDefault();
      handleNodeClick(targetNode);
    }
  };

  return (
    <div
      className="relative w-full max-w-2xl aspect-square mx-auto p-4 md:p-8 perspective-1000"
      role="main"
      aria-label="Morabaraba game board"
      tabIndex={0}
      onKeyDown={handleBoardKeyDown}
    >
      <motion.div
        initial={{ rotateX: 20, y: 50, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn(
          "w-full h-full p-6 md:p-10 transition-all duration-700 ease-in-out relative",
          variant === 'sesotho' ? "stone-surface-sesotho" :
          variant === 'gonjilgonu' ? "stone-surface-gonjilgonu" :
          variant === '11men' ? "stone-surface-11men" : "stone-surface",
          isRotated ? "rotate-180" : "",
          turn === 'player1' ? "ring-2 ring-gold-500/10 shadow-[0_0_40px_rgba(245,158,11,0.05)]" : "ring-2 ring-earth-500/5 shadow-[0_0_40px_rgba(0,0,0,0.2)]"
        )}
        aria-label={`${variant} board, ${turn === 'player1' ? "Player 1" : "Player 2"}'s turn, ${phase} phase`}
      >
        {/* Turn Indicator Glow */}
        <motion.div 
          className={cn(
            "absolute inset-0 pointer-events-none opacity-10 transition-colors duration-1000 rounded-[3rem]",
            turn === 'player1' ? "bg-gold-500/3" : "bg-earth-500/3"
          )}
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        {/* Inner Grid Container for Perfect Alignment */}
        <div className="relative w-full h-full">
          {/* Etched Lines */}
          <svg 
            viewBox="0 0 100 100" 
            className="absolute inset-0 w-full h-full pointer-events-none opacity-50 overflow-visible"
            shapeRendering="geometricPrecision"
          >
          <filter id="etch-sharp">
            <feOffset dx="-0.2" dy="-0.2" />
            <feGaussianBlur stdDeviation="0.1" result="blur" />
            <feComposite operator="out" in="SourceGraphic" in2="blur" result="inverse" />
            <feFlood floodColor="black" floodOpacity="0.9" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            
            {/* Subtle highlight for depth */}
            <feOffset dx="0.2" dy="0.2" in="SourceGraphic" result="offset-highlight" />
            <feFlood floodColor="white" floodOpacity="0.1" result="highlight-color" />
            <feComposite operator="in" in="highlight-color" in2="offset-highlight" result="highlight" />
            
            <feComposite operator="over" in="shadow" in2="highlight" result="depth" />
            <feComposite operator="over" in="depth" in2="SourceGraphic" />
          </filter>
          
          <g filter="url(#etch-sharp)" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-earth-950/90">
            {/* Dynamic Lines based on variant edges */}
            {config.edges.map((edge: [number, number], i: number) => {
              const start = coords[edge[0]];
              const end = coords[edge[1]];
              if (!start || !end) return null;
              return (
                <line 
                  key={i}
                  x1={start.x} 
                  y1={start.y} 
                  x2={end.x} 
                  y2={end.y} 
                  strokeLinecap="round"
                />
              );
            })}

            {variant === 'sesotho' && (
              <circle cx="50" cy="50" r="2" fill="currentColor" />
            )}
          </g>
        </svg>

        {/* Nodes and Pieces */}
        <div className="absolute inset-0">
          {coords.map((coord, idx) => {
            const isOccupied = board[idx] !== null;
            const isShootable = shootMode && canShoot(board, idx, getOpponent(turn), variant);
            const isMillPart = activeMill?.includes(idx) ?? false;
            const isLastMove = lastMove?.to === idx || lastMove?.from === idx;

            const isValidMove = phase === 'placing' 
              ? board[idx] === null 
              : (selectedNode !== null && getValidMoves(board, selectedNode, phase, variant).includes(idx));

            return (
              <div key={idx}>
                {/* Notation Label (togglable) */}
                {showNotation && (
                  <div
                    className="absolute transform -translate-x-full -translate-y-full text-[9px] md:text-xs font-mono text-earth-500/60 pointer-events-none font-bold"
                    style={{ left: `calc(${coord.x}% - 14px)`, top: `calc(${coord.y}% - 14px)` }}
                    aria-hidden="true"
                  >
                    {BOARD_NOTATION[idx]}
                  </div>
                )}
                
                <Node 
                  index={idx} 
                  isValidMove={isValidMove}
                  isLastMove={isLastMove}
                  isMillPart={isMillPart}
                  onClick={() => handleNodeClick(idx)} 
                />
                {isOccupied && (
                  <AnimatePresence mode="popLayout">
                    <motion.div 
                      key={`piece-${idx}-${board[idx]}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                      style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    >
                      <Piece 
                        player={board[idx]!} 
                        selected={selectedNode === idx}
                        shootable={isShootable}
                        isActiveMill={isMillPart}
                        onClick={() => handleNodeClick(idx)}
                        className="pointer-events-auto"
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </motion.div>

      {/* Board Shadow/Depth */}
      <div className="absolute -bottom-10 left-10 right-10 h-20 bg-black/60 blur-3xl -z-10 rounded-full" />
    </div>
  );
}
