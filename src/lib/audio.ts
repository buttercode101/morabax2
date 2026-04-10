// Simple audio manager using Web Audio API to generate sounds so we don't need external assets
// NOTE: This module is intentionally independent of gameStore to avoid circular imports.

let audioCtx: AudioContext | null = null;

// Local state to avoid circular dependency with gameStore
let _soundEnabled = true;
let _volume = 0.7;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported', e);
    }
  }
  return audioCtx;
}

function playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(vol * _volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient() {
  if (!_soundEnabled) return;
  if (ambientOsc) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  ambientOsc = ctx.createOscillator();
  ambientGain = ctx.createGain();

  ambientOsc.type = 'sine';
  ambientOsc.frequency.setValueAtTime(100, ctx.currentTime);

  ambientGain.gain.setValueAtTime(0.02 * _volume, ctx.currentTime);

  ambientOsc.connect(ambientGain);
  ambientGain.connect(ctx.destination);

  ambientOsc.start();
}

export function stopAmbient() {
  if (ambientOsc) {
    try { ambientOsc.stop(); } catch {}
    ambientOsc.disconnect();
    ambientOsc = null;
  }
}

export function playSound(name: 'place' | 'move' | 'select' | 'mill' | 'shoot' | 'win' | 'start') {
  if (!_soundEnabled) return;

  switch (name) {
    case 'place':
      playTone(300, 'sine', 0.1, 0.2);
      break;
    case 'move':
      playTone(400, 'triangle', 0.1, 0.1);
      setTimeout(() => playTone(300, 'triangle', 0.1, 0.1), 50);
      break;
    case 'select':
      playTone(600, 'sine', 0.05, 0.1);
      break;
    case 'mill':
      // Cow moo approximation
      playTone(150, 'sawtooth', 0.4, 0.2);
      setTimeout(() => playTone(140, 'sawtooth', 0.4, 0.2), 100);
      break;
    case 'shoot':
      playTone(100, 'square', 0.2, 0.3);
      break;
    case 'win':
      playTone(400, 'sine', 0.2, 0.2);
      setTimeout(() => playTone(500, 'sine', 0.2, 0.2), 200);
      setTimeout(() => playTone(600, 'sine', 0.4, 0.2), 400);
      break;
    case 'start':
      playTone(440, 'sine', 0.1, 0.1);
      setTimeout(() => playTone(880, 'sine', 0.2, 0.1), 100);
      break;
  }
}

// Sync functions called by gameStore when its state changes
export function syncAudioState(enabled: boolean, volume: number) {
  _soundEnabled = enabled;
  _volume = volume;
}

export function setSoundEnabled(v: boolean) {
  _soundEnabled = v;
  if (!v) {
    stopAmbient();
  } else {
    startAmbient();
  }
}

export function setVolume(v: number) {
  _volume = Math.max(0, Math.min(1, v));
  if (ambientGain) {
    const ctx = getAudioContext();
    if (ctx) {
      ambientGain.gain.setValueAtTime(0.02 * _volume, ctx.currentTime);
    }
  }
}
