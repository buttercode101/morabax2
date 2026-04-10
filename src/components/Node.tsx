import { BOARD_CONFIGS } from '@/lib/game-engine/constants';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface NodeProps {
  index: number;
  isValidMove: boolean;
  isLastMove?: boolean;
  isMillPart?: boolean;
  isHint?: boolean;
  onClick: () => void;
}

export function Node({ index, isValidMove, isLastMove, isMillPart, isHint, onClick }: NodeProps) {
  const { variant, markedNodes } = useGameStore();
  const config = BOARD_CONFIGS[variant] || BOARD_CONFIGS['standard'];
  const { x, y } = config.coords[index];
  const isMarked = (markedNodes || []).includes(index);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleClick = () => {
    triggerHaptic();
    onClick();
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center cursor-pointer group"
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={isMarked ? undefined : handleClick}
      role="gridcell"
      aria-label={`Node ${index + 1}${isMarked ? ', blocked' : ''}${isValidMove ? ', valid move' : ''}`}
      tabIndex={isValidMove ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* The visual dot/ring (subtle, carved look) */}
      <div className={cn(
        "rounded-full transition-all duration-300 pointer-events-none shadow-inner",
        // Base empty state: tiny carved dot
        "w-1.5 h-1.5 bg-earth-950/60 border border-black/30",
        // Valid move: slightly larger, faint gold ring
        isValidMove && "w-3 h-3 bg-transparent border-[1.5px] border-gold-500/50 shadow-[0_0_5px_rgba(245,158,11,0.2)]",
        // Hover on valid move
        isValidMove && "group-hover:border-gold-500/90 group-hover:bg-gold-500/20 group-hover:scale-125",
        // Marked (Gonjilgonu blocked spot)
        isMarked && "w-2 h-2 bg-red-900/60 border-red-900/80",
        // Mill part (subtle highlight)
        isMillPart && "ring-1 ring-gold-400/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]",
        // Hint
        isHint && "ring-2 ring-gold-400 animate-pulse"
      )} />
    </div>
  );
}
