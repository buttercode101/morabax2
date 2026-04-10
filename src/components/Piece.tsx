import { Player } from '@/types/game';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useGameStore } from '@/store/gameStore';

interface PieceProps {
  player: Player;
  selected?: boolean;
  shootable?: boolean;
  isActiveMill?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Piece({ player, selected, shootable, isActiveMill, onClick, className }: PieceProps) {
  const { currentSkin } = useGameStore();

  const isPlayer1 = player === 'player1';
  
  // Base styles for the "Ancestral Stone & Spirit" theme
  const getSkinStyles = () => {
    switch (currentSkin) {
      case 'obsidian':
        return isPlayer1 
          ? "bg-earth-300 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.5),4px 4px 8px rgba(0,0,0,0.3)] border-2 border-earth-400/30" 
          : "bg-earth-950 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),4px 4px 12px rgba(0,0,0,0.8)] border-2 border-earth-800/50";
      case 'gold':
        return isPlayer1 
          ? "bg-gold-600 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.4),4px 4px 8px rgba(0,0,0,0.3)] border-2 border-gold-400/50" 
          : "bg-earth-900 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.05),4px 4px 12px rgba(0,0,0,0.6)] border-2 border-earth-800/50";
      case 'ebony':
        return isPlayer1 
          ? "bg-earth-800 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.5),4px 4px 8px rgba(0,0,0,0.3)] border-2 border-earth-700/50" 
          : "bg-earth-950 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.05),4px 4px 12px rgba(0,0,0,0.8)] border-2 border-earth-900/50";
      case 'ivory':
        return isPlayer1 
          ? "bg-stone-200 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.2),4px 4px 8px rgba(0,0,0,0.3)] border-2 border-stone-100" 
          : "bg-stone-400 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.3),4px 4px 12px rgba(0,0,0,0.5)] border-2 border-stone-300";
      case 'jade':
        return isPlayer1 
          ? "bg-emerald-500 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.4),4px 4px 8px rgba(0,0,0,0.3)] border-2 border-emerald-400/50" 
          : "bg-emerald-900 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),4px 4px 12px rgba(0,0,0,0.8)] border-2 border-emerald-800/50";
      default: // Classic Clay
        return isPlayer1 
          ? "bg-earth-500 shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.4),4px 4px 8px rgba(0,0,0,0.3)] border-2 border-earth-400/50" 
          : "bg-earth-900 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.05),4px 4px 12px rgba(0,0,0,0.6)] border-2 border-earth-800/50";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, opacity: 0 }}
      exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: selected 
          ? "0 0 30px rgba(245, 158, 11, 0.4)" 
          : (shootable ? "0 0 30px rgba(239, 68, 68, 0.4)" : "0 10px 20px rgba(0,0,0,0.3)")
      }}
      onClick={onClick}
      className={cn(
        "w-10 h-10 md:w-12 md:h-12 rounded-full relative transition-all duration-500",
        getSkinStyles(),
        selected && "ring-4 ring-gold-500 ring-offset-4 ring-offset-earth-950 scale-110 z-30",
        shootable && "ring-4 ring-red-500 animate-pulse cursor-crosshair z-30",
        isActiveMill && "ring-2 ring-gold-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-[soft-glow_3s_infinite]",
        className
      )}
    >
      {/* Dynamic Glow for Selected/Shootable */}
      {(selected || shootable) && (
        <motion.div 
          className={cn(
            "absolute -inset-2 rounded-full blur-xl opacity-50",
            selected ? "bg-gold-500" : "bg-red-500"
          )}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Texture Overlay (procedural, no external dependency) */}
      <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
      
      {/* Highlight */}
      <div className="absolute top-1 left-2 w-1/3 h-1/3 bg-white/20 rounded-full blur-[2px]" />
      
      {/* Player Indicator */}
      <div className={cn(
        "absolute inset-2 border border-white/10 rounded-full",
        isPlayer1 ? "border-earth-200/20" : "border-earth-400/10"
      )} />
    </motion.button>
  );
}
