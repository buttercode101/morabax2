import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GameBoard } from './components/GameBoard';
import { GameUI } from './components/GameUI';
import { LandingScreen, GameOverScreen, TutorialScreen, SettingsModal, ShopScreen, StatsScreen, OriginScreen, CampaignScreen, LevelUpOverlay, GameNotifications } from './components/Screens';
import { useGameStore } from './store/gameStore';
import { startAmbient, stopAmbient } from './lib/audio';

export type AppState = 'landing' | 'playing' | 'tutorial' | 'shop' | 'stats' | 'origin' | 'campaign';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const { winner, startNewGame, currentLevelId, soundEnabled, importGameState, savedSlot } = useGameStore();
  const history = useGameStore((s) => s.history);

  // Handle shared game links on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameData = params.get('game');
    if (gameData) {
      try {
        importGameState(gameData);
        setAppState('playing');
      } catch (e) {
        console.error('Failed to load shared game:', e);
      }
    }
  }, [importGameState]);

  useEffect(() => {
    if (appState === 'playing' && soundEnabled) {
      startAmbient();
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
  }, [appState, soundEnabled]);

  const handleStart = (levelId?: number) => {
    startNewGame(levelId);
    setAppState('playing');
  };

  const handleResume = () => {
    setAppState('playing');
  };

  return (
    <div className="min-h-screen bg-earth-950 text-earth-100 font-sans selection:bg-gold-500/30 overflow-x-hidden">
      {/* Premium Background Layers */}
      <div className="fixed inset-0 z-0">
        {/* Base Texture (procedural) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.05)_0%,transparent_50%),radial-gradient(ellipse_at_70%_80%,rgba(0,0,0,0.1)_0%,transparent_50%)]" />
        
        {/* Dynamic Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-earth-800/20 blur-[120px] rounded-full" />
        
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {appState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex justify-center"
            >
              <LandingScreen 
                onStart={handleStart} 
                onResume={(savedSlot || (history || []).length > 0) && !winner ? handleResume : undefined}
                onNavigate={(state) => setAppState(state)} 
              />
            </motion.div>
          )}

          {appState === 'tutorial' && (
            <motion.div
              key="tutorial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <TutorialScreen onClose={() => setAppState('landing')} />
            </motion.div>
          )}

          {appState === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <ShopScreen onBack={() => setAppState('landing')} />
            </motion.div>
          )}

          {appState === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <StatsScreen onBack={() => setAppState('landing')} />
            </motion.div>
          )}

          {appState === 'origin' && (
            <motion.div
              key="origin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <OriginScreen onBack={() => setAppState('landing')} />
            </motion.div>
          )}

          {appState === 'campaign' && (
            <motion.div
              key="campaign"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full"
            >
              <CampaignScreen 
                onBack={() => setAppState('landing')} 
                onStartLevel={(id) => handleStart(id)}
              />
            </motion.div>
          )}

          {appState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full"
            >
              <GameUI onHome={() => setAppState('landing')} />
              <GameBoard />
            </motion.div>
          )}
        </AnimatePresence>

        {winner && appState === 'playing' && (
          <GameOverScreen
            winner={winner}
            onRestart={(id) => handleStart(id)}
            onHome={() => setAppState('landing')}
            currentLevelId={currentLevelId}
          />
        )}

        <SettingsModal />
        <LevelUpOverlay />
        <GameNotifications />
      </main>
    </div>
  );
}
