import { useState, useEffect } from 'react';
import { useGameStore, LEVELS } from '@/store/gameStore';
import { Play, Users, Settings as SettingsIcon, BookOpen, Trophy, ArrowRight, X, Volume2, VolumeX, Coins, ShoppingCart, BarChart2, Globe, Save, Map as MapIcon, Star, Lock, ChevronRight, Zap, Target, RotateCcw, LayoutGrid, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Piece } from './Piece';
import { cn } from '@/lib/utils';
import { Player } from '@/types/game';
import { BOARD_CONFIGS } from '@/lib/game-engine/constants';

// Game Notification Component
export function GameNotifications() {
  const { gameNotifications, dismissNotification } = useGameStore();

  return (
    <div className="fixed top-4 right-4 z-[150] flex flex-col gap-3 max-w-sm pointer-events-none" aria-live="polite">
      <AnimatePresence>
        {gameNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "leather-panel p-4 rounded-2xl shadow-2xl pointer-events-auto flex items-center gap-3 border",
              notification.type === 'warning' ? "border-red-500/30 bg-red-950/80" :
              notification.type === 'success' ? "border-gold-500/30 bg-gold-950/80" :
              "border-earth-700/30 bg-earth-900/80"
            )}
            role="alert"
          >
            <div className={cn(
              "p-2 rounded-full shrink-0",
              notification.type === 'warning' ? "bg-red-500/20 text-red-400" :
              notification.type === 'success' ? "bg-gold-500/20 text-gold-400" :
              "bg-earth-700/20 text-earth-300"
            )}>
              <Zap size={16} />
            </div>
            <span className="text-sm font-bold text-earth-100 flex-1">{notification.message}</span>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-earth-500 hover:text-earth-200 shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function LandingScreen({ onStart, onNavigate }: { onStart: () => void, onNavigate: (state: any) => void }) {
  const { setMode, setSettingsOpen, savedSlot, loadFromSlot } = useGameStore();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden w-full bg-earth-950">
      {/* Background Vignette & Depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-0" />
      
      {/* Atmospheric Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-950/20 rounded-full blur-[150px] flicker opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-earth-900/20 rounded-full blur-[150px] flicker opacity-50" />
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="dust-particle"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 15}s`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.3
            }} 
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-4xl w-full flex flex-col items-center justify-center min-h-screen py-12"
      >
        <div className="mb-8 md:mb-12 w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-block mb-6 md:mb-8"
          >
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto bg-earth-900 rounded-[1.5rem] md:rounded-[2rem] rotate-45 flex items-center justify-center border-2 border-gold-700/40 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative group">
              <div className="absolute inset-2 border border-gold-700/20 rounded-[1rem] md:rounded-[1.5rem]" />
              <div className="absolute inset-0 bg-gold-500/5 rounded-[1.5rem] md:rounded-[2rem] group-hover:bg-gold-500/10 transition-colors" />
              <Trophy size={40} className="text-gold-500 -rotate-45 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] md:hidden" />
              <Trophy size={56} className="text-gold-500 -rotate-45 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] hidden md:block" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-black mb-4 md:mb-6 gold-gradient-text tracking-tight leading-none px-4 max-w-full break-words">
            MORABARABA
          </h1>
          
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
            <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-gold-700/50" />
            <p className="text-gold-500/80 font-serif italic text-sm md:text-xl tracking-[0.2em] uppercase font-medium">
              Ancient Strategy
            </p>
            <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-gold-700/50" />
          </div>
          
          <p className="text-earth-400 font-serif italic text-sm md:text-lg max-w-md md:max-w-lg mx-auto leading-relaxed px-6">
            The sacred game of the Southern Sun, where every cow is a legacy and every move a legend.
          </p>
        </div>

        <div className="flex flex-col gap-5 w-full max-w-md mx-auto px-6">
          <button 
            onClick={() => onNavigate('campaign')}
            className="premium-button group h-20 md:h-24 bg-earth-900 hover:bg-earth-800 rounded-[1.5rem] md:rounded-[2rem] border border-earth-700/40 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all overflow-hidden relative w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold-600/0 via-gold-600/5 to-gold-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative z-10 flex items-center px-6 md:px-8 h-full gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-earth-950 flex items-center justify-center border border-earth-800 group-hover:border-gold-700/50 transition-colors shadow-inner shrink-0">
                <MapIcon className="text-gold-500 group-hover:scale-110 transition-transform" size={24} />
              </div>
              <div className="text-left">
                <span className="block text-xl md:text-2xl font-display font-black text-earth-200 group-hover:text-earth-100 transition-colors">Campaign</span>
                <span className="block text-[8px] md:text-[10px] font-black text-earth-500 uppercase tracking-widest">The Herder's Journey</span>
              </div>
              <div className="ml-auto">
                <ChevronRight className="text-earth-700 group-hover:text-gold-600 transition-colors" size={24} />
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => { setMode('pve'); onStart(); }}
              className="premium-button h-16 md:h-20 bg-earth-900/40 hover:bg-earth-800/60 rounded-[1.2rem] md:rounded-[1.5rem] border border-earth-800/50 text-earth-300 flex flex-col items-center justify-center gap-1 transition-all hover:border-gold-900/50 group"
            >
              <ArrowRight size={20} className="text-gold-700 group-hover:translate-x-1 transition-transform" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Quick Play</span>
            </button>
            <button 
              onClick={() => { setMode('pvp'); onStart(); }}
              className="premium-button h-16 md:h-20 bg-earth-900/40 hover:bg-earth-800/60 rounded-[1.2rem] md:rounded-[1.5rem] border border-earth-800/50 text-earth-300 flex flex-col items-center justify-center gap-1 transition-all hover:border-gold-900/50 group"
            >
              <Users size={20} className="text-gold-700 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Local PvP</span>
            </button>
          </div>

          {savedSlot && (
            <button 
              onClick={() => { loadFromSlot(); onStart(); }}
              className="premium-button h-14 md:h-16 bg-gold-950/20 hover:bg-gold-950/30 rounded-[1.2rem] md:rounded-[1.5rem] border border-gold-900/30 text-gold-500 flex items-center justify-center gap-3 transition-all group"
            >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-xs md:text-sm font-black uppercase tracking-widest">Resume Journey</span>
            </button>
          )}

          <div className="flex items-center justify-between gap-2 md:gap-4 mt-6 md:mt-8">
            {[
              { icon: ShoppingCart, action: () => onNavigate('shop'), label: 'Shop' },
              { icon: BarChart2, action: () => onNavigate('stats'), label: 'Stats' },
              { icon: Globe, action: () => onNavigate('origin'), label: 'Origin' },
              { icon: SettingsIcon, action: () => setSettingsOpen(true), label: 'Settings' }
            ].map((item, idx) => (
              <button 
                key={idx}
                onClick={item.action} 
                className="group relative p-3 md:p-4 bg-earth-900/40 hover:bg-earth-800 rounded-xl md:rounded-2xl text-earth-500 hover:text-gold-500 transition-all border border-earth-800/50 shadow-lg flex-1 flex items-center justify-center"
                title={item.label}
              >
                <item.icon size={20} />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-earth-500">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-earth-800 to-transparent" />
          <p className="text-[10px] font-mono uppercase tracking-[0.6em] text-earth-600">
            Heritage Strategy • Circa 1200 AD
          </p>
        </div>
      </div>
    </div>
  );
}

export const SKINS = [
  { id: 'classic', name: 'Classic Clay', cost: 0, desc: 'Traditional sun-dried clay pieces.' },
  { id: 'obsidian', name: 'Polished Stone', cost: 500, desc: 'Smooth river stones from the Vaal.' },
  { id: 'gold', name: 'Royal Gold', cost: 2000, desc: 'Pure gold pieces from Mapungubwe.' },
  { id: 'ebony', name: 'Ebony Wood', cost: 1000, desc: 'Dark, hand-carved hardwood.' },
  { id: 'ivory', name: 'Carved Ivory', cost: 1500, desc: 'Intricately carved bone and ivory.' },
  { id: 'jade', name: 'Imperial Jade', cost: 3000, desc: 'Rare green gemstone from distant lands.' },
] as const;

export function CampaignScreen({ onBack, onStartLevel }: { onBack: () => void, onStartLevel: (id: number) => void }) {
  const { progress } = useGameStore();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
        <button onClick={onBack} className="p-4 hover:bg-earth-800 rounded-2xl transition-all bg-earth-900/50 border border-earth-700/30 text-earth-100 shadow-xl group">
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-earth-200 mb-2 engraved-text">
            The Herder's Journey
          </h2>
          <p className="text-gold-600 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">Conquer the lands, claim the crown</p>
        </div>
        <div className="hidden md:block w-12" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {LEVELS.map((level, index) => {
          const prevLevel = LEVELS[index - 1];
          const isUnlocked = index === 0 || (progress?.completedLevels || []).includes(prevLevel?.id ?? -1);
          const stars = progress?.levelStars?.[level.id] || 0;

          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={isUnlocked ? { y: -8, scale: 1.02 } : {}}
              onClick={() => isUnlocked && onStartLevel(level.id)}
              disabled={!isUnlocked}
              className={`group relative p-8 rounded-[2.5rem] border-2 text-left transition-all duration-500 ${
                isUnlocked 
                  ? 'leather-panel border-earth-700/50 shadow-2xl hover:border-gold-500/50' 
                  : 'bg-earth-950/50 border-earth-900 opacity-40 grayscale'
              }`}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2.5rem] z-10">
                  <div className="bg-earth-900 p-4 rounded-full shadow-2xl border border-earth-700">
                    <Lock size={32} className="text-earth-500" />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  level.difficulty === 'expert' ? 'bg-red-900 text-white' :
                  level.difficulty === 'hard' ? 'bg-orange-600 text-white' :
                  level.difficulty === 'medium' ? 'bg-gold-600 text-white' :
                  'bg-earth-800 text-white'
                }`}>
                  {level.difficulty}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(s => (
                    <Star 
                      key={s} 
                      size={20} 
                      className={s <= stars ? "fill-gold-500 text-gold-500" : "text-earth-800"} 
                    />
                  ))}
                </div>
              </div>

              <h3 className="text-2xl font-display font-black text-earth-200 mb-2 group-hover:text-gold-500 transition-colors engraved-text">{level.name}</h3>
              <p className="text-earth-400 text-sm leading-relaxed mb-8 line-clamp-2 font-serif italic">{level.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-earth-800/50">
                <div>
                  <div className="text-[10px] font-black text-earth-500 uppercase tracking-widest mb-1">Opponent</div>
                  <div className="text-sm font-bold text-earth-200">{level.opponentName}</div>
                </div>
                {isUnlocked && (
                  <div className="w-10 h-10 rounded-full bg-earth-800 flex items-center justify-center text-earth-100 group-hover:bg-gold-600 group-hover:text-white transition-all duration-300 shadow-lg">
                    <ChevronRight size={24} />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function ShopScreen({ onBack }: { onBack: () => void }) {
  const { coins, unlockedSkins, currentSkin, buySkin, equipSkin } = useGameStore();

  const skins = [
    { id: 'classic', name: 'Classic Clay', price: 0, description: 'Traditional sun-dried clay pieces.' },
    { id: 'obsidian', name: 'Polished Stone', price: 500, description: 'Smooth river stones from the Vaal.' },
    { id: 'gold', name: 'Royal Gold', price: 2000, description: 'Pure gold pieces from Mapungubwe.' },
    { id: 'ebony', name: 'Ebony Wood', price: 1000, description: 'Dark, hand-carved hardwood.' },
    { id: 'ivory', name: 'Carved Ivory', price: 1500, description: 'Intricately carved bone and ivory.' },
    { id: 'jade', name: 'Imperial Jade', price: 3000, description: 'Rare green gemstone from distant lands.' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
        <button onClick={onBack} className="p-4 hover:bg-earth-800 rounded-2xl transition-all bg-earth-900/50 border border-earth-700/30 text-earth-100 shadow-xl group">
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-earth-200 mb-4 engraved-text">The Trading Post</h2>
          <div className="flex items-center justify-center gap-2 text-gold-500 font-black bg-gold-950/50 px-6 py-2 rounded-full border border-gold-900/50 mx-auto w-fit shadow-inner">
            <Coins size={20} className="text-gold-500" /> 
            <span className="text-xl">{coins}</span>
          </div>
        </div>
        <div className="hidden md:block w-12" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
        {skins.map((skin) => {
          const isUnlocked = (unlockedSkins || []).includes(skin.id as any);
          const isSelected = currentSkin === skin.id;

          return (
            <div key={skin.id} className="leather-panel p-8 rounded-[2.5rem] flex flex-col gap-4 border border-earth-700/30 shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 p-4 bg-earth-950/50 rounded-2xl border border-earth-800/50 shadow-inner">
                  <Piece player="player1" className="w-10 h-10" />
                  <Piece player="player2" className="w-10 h-10" />
                </div>
                {isSelected ? (
                  <span className="px-4 py-1.5 bg-gold-900/30 text-gold-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gold-700/30">Active</span>
                ) : isUnlocked ? (
                  <button onClick={() => equipSkin(skin.id as any)} className="premium-button px-6 py-2 bg-earth-800 text-earth-100 rounded-full text-sm font-bold hover:bg-earth-700 transition-all border border-earth-700/50 shadow-lg">Select</button>
                ) : (
                  <button 
                    onClick={() => buySkin(skin.id as any, skin.price)}
                    disabled={coins < skin.price}
                    className="premium-button px-6 py-2 bg-gold-700 text-white rounded-full text-sm font-bold hover:bg-gold-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    <Coins size={16} /> {skin.price}
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-display font-black text-earth-100 engraved-text">{skin.name}</h3>
                <p className="text-earth-400 font-serif italic">{skin.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StatsScreen({ onBack }: { onBack: () => void }) {
  const { stats, progress } = useGameStore();

  const statCards = [
    { label: 'Total Wins', value: stats?.wins || 0, icon: Trophy, color: 'text-gold-500' },
    { label: 'Total Games', value: stats?.totalGames || 0, icon: Play, color: 'text-earth-300' },
    { label: 'Mills Formed', value: stats?.millsFormed || 0, icon: Zap, color: 'text-gold-400' },
    { label: 'Cows Captured', value: stats?.cowsCaptured || 0, icon: Target, color: 'text-red-500' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
        <button onClick={onBack} className="p-4 hover:bg-earth-800 rounded-2xl transition-all bg-earth-900/50 border border-earth-700/30 text-earth-100 shadow-xl group">
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-earth-200 mb-2 engraved-text">Your Legacy</h2>
          <p className="text-gold-600 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">The marks of a master herder</p>
        </div>
        <div className="hidden md:block w-12" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
        {statCards.map((stat) => (
          <div key={stat.label} className="leather-panel p-8 rounded-[2.5rem] text-center border border-earth-700/30 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-colors" />
            <div className={cn("mx-auto w-14 h-14 rounded-2xl bg-earth-950/50 flex items-center justify-center mb-6 shadow-inner border border-earth-800/50 transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon size={28} />
            </div>
            <div className="text-4xl font-display font-black text-earth-100 mb-2 engraved-text">{stat.value}</div>
            <div className="text-[10px] font-black text-earth-500 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="leather-panel p-8 md:p-12 rounded-[3rem] border border-earth-700/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-900/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <h3 className="text-2xl md:text-3xl font-display font-black text-earth-100 mb-8 engraved-text flex items-center gap-4">
          <Trophy className="text-gold-500" /> Recent Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progress.completedLevels.length > 0 ? (
            progress.completedLevels.slice(-4).reverse().map((levelId) => {
              const level = LEVELS.find(l => l.id === levelId);
              return (
                <div key={levelId} className="flex items-center gap-6 p-6 bg-earth-950/50 rounded-3xl border border-earth-800/50 shadow-inner hover:bg-earth-900/50 transition-colors group">
                  <div className="w-14 h-14 rounded-2xl bg-gold-900/20 flex items-center justify-center text-gold-500 border border-gold-700/30 group-hover:scale-110 transition-transform">
                    <Trophy size={28} />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-earth-100 mb-1">Conquered {level?.name}</div>
                    <div className="text-xs text-earth-500 font-black uppercase tracking-widest">Campaign Milestone</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-earth-500 font-serif italic text-xl">Your journey is just beginning...</p>
              <p className="text-earth-600 text-sm mt-2">Complete campaign levels to earn your place in history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function OriginScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
        <button onClick={onBack} className="p-4 hover:bg-earth-800 rounded-2xl transition-all bg-earth-900/50 border border-earth-700/30 text-earth-100 shadow-xl group">
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-display font-black text-earth-200 mb-2 engraved-text">Ancient Roots</h2>
          <p className="text-gold-600 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">A journey through time and tradition</p>
        </div>
        <div className="hidden md:block w-12" />
      </div>

      <div className="space-y-12">
        <section className="leather-panel p-8 md:p-16 rounded-[3rem] relative overflow-hidden border border-earth-700/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-900/10 rounded-full blur-[100px] -mr-48 -mt-48 flicker" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-5xl font-display font-black text-earth-100 mb-8 engraved-text">The Game of Kings</h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-xl md:text-2xl text-earth-300 leading-relaxed font-serif italic mb-10 border-l-4 border-gold-700 pl-8">
                "Morabaraba is more than a game; it is a living artifact of Southern African heritage."
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <p className="text-earth-400 text-lg leading-relaxed font-serif">
                  Originating from the pastoral cultures of Southern Africa, the game simulates the strategic management of cattle herds. The 'cows' (dikgomo) are the central pieces, and the board represents the kraal or the open veld.
                </p>
                <p className="text-earth-400 text-lg leading-relaxed font-serif">
                  Archaeological evidence from the Mapungubwe World Heritage Site shows stone-carved boards dating back over 800 years, proving that this strategy has challenged the minds of leaders and herders alike for centuries.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="leather-panel p-10 rounded-[3rem] border border-earth-700/30 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-colors" />
            <h4 className="text-2xl font-display font-black text-earth-100 mb-6 engraved-text">The Variants</h4>
            <p className="text-earth-400 leading-relaxed font-serif italic text-lg">
              While the 12-cow variant is most common in tournaments today, many regional versions exist. The Sesotho variant, often played in Lesotho, features a 25th point in the center, adding a unique tactical layer to the ancient kraal.
            </p>
          </div>
          <div className="leather-panel p-10 rounded-[3rem] border border-earth-700/30 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-colors" />
            <h4 className="text-2xl font-display font-black text-earth-100 mb-6 engraved-text">Modern Legacy</h4>
            <p className="text-earth-400 leading-relaxed font-serif italic text-lg">
              Today, Morabaraba is recognized as an official sport by Mind Sports South Africa (MSSA). It continues to be a bridge between generations, teaching patience, foresight, and the value of every single 'cow' in the herd.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, variant, setVariant, soundEnabled, toggleSound, difficulty, setDifficulty, showNotation, setShowNotation, volume, setVolume, player1Name, player2Name, setPlayerNames } = useGameStore();
  const [p1Name, setP1Name] = useState(player1Name);
  const [p2Name, setP2Name] = useState(player2Name);

  if (!isSettingsOpen) return null;

  const handleSaveNames = () => {
    setPlayerNames(p1Name || 'Player 1', p2Name || 'Player 2');
  };

  return (
    <div className="fixed inset-0 bg-earth-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8" role="dialog" aria-modal="true" aria-label="Game settings">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="leather-panel p-8 md:p-12 rounded-[3rem] max-w-2xl w-full relative overflow-hidden border border-earth-700/30 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gold-600 shadow-[0_0_15px_rgba(217,119,6,0.5)]" />

        <button
          onClick={() => setSettingsOpen(false)}
          className="absolute top-8 right-8 p-3 hover:bg-earth-800 rounded-2xl transition-all text-earth-500 hover:text-earth-100 border border-earth-800/50 group"
          aria-label="Close settings"
        >
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        </button>

        <h2 className="text-4xl font-display font-black text-earth-100 mb-10 flex items-center gap-4 engraved-text">
          <SettingsIcon size={32} className="text-gold-500" /> Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-black text-earth-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap size={14} /> AI Difficulty
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['easy', 'medium', 'hard', 'expert'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as any)}
                    className={cn(
                      "py-3 px-4 rounded-2xl font-bold text-sm transition-all border-2 capitalize shadow-lg",
                      difficulty === d
                        ? "bg-gold-700 text-white border-gold-600 shadow-gold-900/20"
                        : "bg-earth-950/50 text-earth-400 border-earth-800/50 hover:border-earth-700 shadow-inner"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-earth-800/50">
              <h3 className="text-xs font-black text-earth-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Audio
              </h3>
              <button
                onClick={toggleSound}
                className="flex items-center justify-between w-full p-5 bg-earth-950/50 rounded-2xl hover:bg-earth-900/50 transition-all group border border-earth-800/50 shadow-inner mb-4"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl transition-colors", soundEnabled ? "bg-gold-900/20 text-gold-500" : "bg-earth-800 text-earth-500")}>
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <span className="font-bold text-earth-100">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  soundEnabled ? "bg-gold-600" : "bg-earth-800"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    soundEnabled ? "left-7" : "left-1"
                  )} />
                </div>
              </button>

              {/* Volume Slider */}
              {soundEnabled && (
                <div className="px-5">
                  <label className="text-xs font-bold text-earth-400 uppercase tracking-widest mb-2 block">Volume: {Math.round(volume * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 bg-earth-800 rounded-full appearance-none cursor-pointer accent-gold-500"
                    aria-label="Sound volume"
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-earth-800/50">
              <h3 className="text-xs font-black text-earth-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={14} /> Player Names
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-earth-500 uppercase tracking-widest mb-1 block">Player 1</label>
                  <input
                    type="text"
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    maxLength={20}
                    className="w-full p-3 bg-earth-950/50 rounded-xl border border-earth-800/50 text-earth-100 text-sm font-bold focus:border-gold-500 focus:outline-none transition-colors"
                    placeholder="Player 1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-earth-500 uppercase tracking-widest mb-1 block">Player 2 / AI</label>
                  <input
                    type="text"
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    maxLength={20}
                    className="w-full p-3 bg-earth-950/50 rounded-xl border border-earth-800/50 text-earth-100 text-sm font-bold focus:border-gold-500 focus:outline-none transition-colors"
                    placeholder="Player 2"
                  />
                </div>
                <button
                  onClick={handleSaveNames}
                  className="w-full py-2 bg-gold-700 text-white rounded-xl font-bold text-sm hover:bg-gold-600 transition-colors"
                >
                  Save Names
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-earth-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe size={14} /> Board Variant
            </h3>
            <div className="space-y-3">
              {[
                { id: 'standard', name: 'Standard MSSA', desc: '24 points. Official tournament board.', icon: <LayoutGrid size={20} /> },
                { id: 'sesotho', name: 'Sesotho/Lesotho', desc: '25 points. Includes central point.', icon: <Target size={20} /> },
                { id: '11men', name: '11 Men', desc: '24 points. Played with 11 pieces.', icon: <Users size={20} /> },
                { id: 'gonjilgonu', name: 'Gonjilgonu', desc: '24 points. Blocked captured spots.', icon: <ShieldAlert size={20} /> }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id as any)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 text-left transition-all group relative overflow-hidden flex items-center gap-4",
                    variant === v.id
                      ? "bg-gold-900/20 border-gold-600 ring-4 ring-gold-500/5"
                      : "bg-earth-950/50 border-earth-800/50 hover:border-earth-700 shadow-inner"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", variant === v.id ? "bg-gold-500/20 text-gold-500" : "bg-earth-900 text-earth-500")}>
                    {v.icon}
                  </div>
                  <div className="relative z-10 flex-1">
                    <div className={cn("font-bold transition-colors", variant === v.id ? "text-gold-500" : "text-earth-100")}>{v.name}</div>
                    <div className="text-[10px] text-earth-500 font-serif italic leading-tight mt-1">{v.desc}</div>
                  </div>
                  {variant === v.id && (
                    <motion.div
                      layoutId="variant-active"
                      className="absolute inset-0 bg-gold-500/5"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-earth-800/50">
              <h3 className="text-xs font-black text-earth-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BookOpen size={14} /> Display
              </h3>
              <button
                onClick={() => setShowNotation(!showNotation)}
                className="flex items-center justify-between w-full p-5 bg-earth-950/50 rounded-2xl hover:bg-earth-900/50 transition-all group border border-earth-800/50 shadow-inner"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-2 rounded-xl transition-colors", showNotation ? "bg-gold-900/20 text-gold-500" : "bg-earth-800 text-earth-500")}>
                    <LayoutGrid size={20} />
                  </div>
                  <span className="font-bold text-earth-100">{showNotation ? 'Notation On' : 'Notation Off'}</span>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  showNotation ? "bg-gold-600" : "bg-earth-800"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    showNotation ? "left-7" : "left-1"
                  )} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GameOverScreen({ winner, onRestart, onHome, currentLevelId }: { winner: Player | 'draw', onRestart: (levelId?: number) => void, onHome: () => void, currentLevelId: number | null }) {
  const isWin = winner === 'player1';
  const isDraw = winner === 'draw';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-earth-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        className="max-w-lg w-full leather-panel p-10 md:p-16 rounded-[4rem] text-center relative overflow-hidden border border-earth-700/30 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-gold-600 shadow-[0_0_30px_rgba(217,119,6,0.5)]" />
        
        <div className="mb-12">
          {isWin ? (
            <div className="relative inline-block mb-8">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Trophy size={100} className="text-gold-500 mx-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
              </motion.div>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gold-500/30 blur-3xl rounded-full -z-10"
              />
            </div>
          ) : isDraw ? (
            <RotateCcw size={100} className="text-earth-400 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(139,98,65,0.3)]" />
          ) : (
            <X size={100} className="text-red-500 mx-auto mb-8 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
          )}
          
          <h2 className="text-5xl md:text-7xl font-display font-black text-earth-100 mb-4 engraved-text leading-tight">
            {isWin ? "Victory!" : isDraw ? "Stalemate" : "Defeat"}
          </h2>
          <p className="text-gold-600 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">
            {isWin ? "The herd is safe under your watch" : isDraw ? "A balanced match of wits" : "The opponent has outsmarted you"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => onRestart(currentLevelId || undefined)}
            className="premium-button group w-full py-6 bg-gold-700 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-gold-600 transition-all relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isWin ? "Next Challenge" : "Try Again"} <ChevronRight size={28} />
            </span>
          </button>
          
          <button
            onClick={onHome}
            className="premium-button w-full py-5 bg-earth-950/50 text-earth-400 border border-earth-800/50 rounded-[2rem] font-bold hover:bg-earth-900/50 shadow-inner transition-all"
          >
            Return to Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function LevelUpOverlay() {
  const { lastLeveledUp } = useGameStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastLeveledUp) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastLeveledUp]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.5, y: -100 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="leather-panel px-16 py-12 rounded-[3rem] shadow-[0_0_100px_rgba(217,119,6,0.4)] border-4 border-gold-500/50 flex flex-col items-center gap-6 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gold-500/10 flicker" />
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 5 }}
            >
              <Trophy size={80} className="text-gold-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] relative z-10" />
            </motion.div>
            <div className="relative z-10">
              <h2 className="text-5xl font-display font-black text-earth-100 engraved-text mb-2">Level Up!</h2>
              <p className="text-gold-500 font-black uppercase tracking-[0.4em] text-sm">You have reached Level {lastLeveledUp}</p>
            </div>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="absolute bottom-0 left-0 h-2 bg-gold-500"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TutorialScreen({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [tutorialBoard, setTutorialBoard] = useState<(Player | null)[]>(Array(24).fill(null));
  const [_tutorialPhase, setTutorialPhase] = useState<'placing' | 'moving' | 'shooting'>('placing');
  const [highlightedNodes, setHighlightedNodes] = useState<number[]>([]);

  const steps = [
    {
      title: "Welcome to Morabaraba",
      description: "Morabaraba is an ancient strategy game of 'cows' and 'mills'. Let's learn how to play.",
      action: "Next"
    },
    {
      title: "Phase 1: Placing",
      description: "Players take turns placing 12 cows. Try placing your first cow on the highlighted spot.",
      setup: () => {
        setTutorialBoard(Array(24).fill(null));
        setTutorialPhase('placing');
        setHighlightedNodes([0]);
      }
    },
    {
      title: "The Opponent Responds",
      description: "The opponent (Player 2) will now place their cow to block you.",
      setup: () => {
        setTutorialBoard(b => {
          const newB = [...b];
          newB[0] = 'player1';
          newB[1] = 'player2';
          return newB;
        });
        setHighlightedNodes([]);
      }
    },
    {
      title: "Phase 2: Moving",
      description: "Once all cows are placed, you move to adjacent spots. Try moving your cow from the center to the edge.",
      setup: () => {
        const b = Array(24).fill(null);
        b[4] = 'player1';
        setTutorialBoard(b);
        setTutorialPhase('moving');
        setHighlightedNodes([3, 5, 1]); // Adjacent to 4
      }
    },
    {
      title: "Forming a Mill",
      description: "Forming a line of 3 cows is called a 'Mill'. This is your most powerful move.",
      setup: () => {
        const b = Array(24).fill(null);
        b[0] = 'player1';
        b[1] = 'player1';
        setTutorialBoard(b);
        setHighlightedNodes([2]); // Completes mill 0-1-2
      }
    },
    {
      title: "Shooting (Capturing)",
      description: "When you form a Mill, you can 'shoot' (remove) one of your opponent's cows. Try it now!",
      setup: () => {
        const b = Array(24).fill(null);
        b[0] = 'player1';
        b[1] = 'player1';
        b[2] = 'player1';
        b[10] = 'player2';
        setTutorialBoard(b);
        setTutorialPhase('shooting');
        setHighlightedNodes([10]);
      }
    },
    {
      title: "Victory!",
      description: "You win by reducing your opponent to 2 cows or blocking all their moves. You're ready to play!",
      action: "Play Now"
    }
  ];

  useEffect(() => {
    const currentStep = steps[step];
    if (currentStep?.setup) {
      currentStep.setup();
    }
  }, [step]);

  const handleTutorialClick = (idx: number) => {
    if (highlightedNodes.includes(idx)) {
      setStep(s => s + 1);
    }
  };

  const currentStep = steps[step]!;

  return (
    <div className="fixed inset-0 bg-earth-950 z-50 flex flex-col items-center justify-center p-4 md:p-12 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-6xl w-full leather-panel p-8 md:p-16 rounded-[4rem] shadow-2xl relative border border-earth-700/30 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gold-600 shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
        
        <button onClick={onClose} className="absolute top-10 right-10 p-4 hover:bg-earth-800 rounded-2xl transition-all text-earth-500 hover:text-earth-100 border border-earth-800/50 group">
          <X size={28} className="group-hover:rotate-90 transition-transform" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-gold-900/30 text-gold-500 rounded-full font-black uppercase tracking-[0.2em] text-[10px] border border-gold-700/30">
                  Step {step + 1} of {steps.length}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-gold-700/30 to-transparent" />
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-earth-100 engraved-text leading-tight">{currentStep.title}</h2>
            </div>
            <p className="text-xl text-earth-400 leading-relaxed font-serif italic border-l-4 border-gold-700/50 pl-8">
              {currentStep.description}
            </p>
            
            <div className="pt-10 flex gap-6">
              {step > 0 && (
                <button 
                  onClick={() => setStep(s => s - 1)} 
                  className="px-10 py-4 bg-earth-900/50 text-earth-300 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-earth-800 transition-all border border-earth-800/50 shadow-lg"
                >
                  Back
                </button>
              )}
              {currentStep.action && (
                <button 
                  onClick={() => step === steps.length - 1 ? onClose() : setStep(s => s + 1)} 
                  className="premium-button group px-10 py-4 bg-gold-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-gold-600 transition-all flex items-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center gap-2">
                    {currentStep.action} <ArrowRight size={20} />
                  </span>
                </button>
              )}
              {step < steps.length - 1 && (
                <button 
                  onClick={onClose} 
                  className="ml-auto px-8 py-4 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-red-900/30 shadow-lg"
                >
                  Skip Tutorial
                </button>
              )}
            </div>
          </div>

          <div className="relative aspect-square stone-surface rounded-[3rem] p-8 border-4 border-earth-800/50 shadow-2xl overflow-hidden group">
             <div className="absolute inset-0 bg-gold-500/0 group-hover:bg-gold-500/5 transition-colors pointer-events-none" />
             
             {/* Simplified Tutorial Board */}
             <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <MapIcon size={300} className="text-gold-500" />
             </div>
             
             <div className="relative w-full h-full">
                {BOARD_CONFIGS.standard.coords.map((coord, idx) => {
                  const isHighlighted = highlightedNodes.includes(idx);
                  const player = tutorialBoard[idx];
                  
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => handleTutorialClick(idx)}
                        className={cn(
                          "absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 transition-all duration-500 z-10",
                          isHighlighted 
                            ? "bg-gold-500 border-gold-400 scale-125 animate-pulse shadow-[0_0_25px_rgba(245,158,11,0.8)]" 
                            : "bg-earth-950/40 border-earth-800/50 opacity-30"
                        )}
                        style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                      />
                      {player && (
                        <div 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                          style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                        >
                          <Piece player={player} className="w-10 h-10 md:w-12 md:h-12 shadow-2xl" />
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        <div className="mt-16 flex gap-3 justify-center">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-2 rounded-full transition-all duration-700",
                i === step ? "w-16 bg-gold-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "w-4 bg-earth-800"
              )} 
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
