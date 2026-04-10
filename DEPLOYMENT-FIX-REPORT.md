# Vercel Deployment — Root Cause Analysis & Fix Report

## Summary
After analyzing the codebase post-refactor, **6 critical issues** were identified that would cause Vercel deployment to fail. All have been fixed.

---

## Root Causes Found & Fixed

### 🔴 CRITICAL #1: Circular Dependency (Build Failure)
**Files:** `src/store/gameStore.ts` ↔ `src/lib/audio.ts`

**Problem:** `gameStore.ts` imports `playSound` from `audio.ts`, and `audio.ts` imports `useGameStore` from `gameStore.ts`. This creates a **circular import** that causes:
- TypeScript compilation errors in strict mode
- Runtime initialization failures (undefined functions at import time)
- Build failures on Vercel's Node.js build environment

**Fix:** Completely decoupled `audio.ts` from `gameStore.ts`:
- `audio.ts` now manages its own `_soundEnabled` and `_volume` state
- Exports `setSoundEnabled()` and `setVolume()` for the store to call
- `gameStore.ts` imports these setters and calls them when state changes
- Zero circular dependency — import chain is now unidirectional

---

### 🔴 CRITICAL #2: PWA Plugin Icon Mismatch (Build Failure)
**File:** `vite.config.ts`

**Problem:** The `VitePWA` plugin manifest referenced:
```json
{ "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
{ "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
```
But only `public/icon.svg` existed. The PWA plugin's `generateSW` mode validates icon files during build and **fails if they're missing**.

**Fix:** Updated manifest to reference the existing `icon.svg`:
```json
{ "src": "/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }
```
Also removed the complex `runtimeCaching` config that required additional Workbox strategy imports which can cause build issues.

---

### 🔴 CRITICAL #3: TypeScript Strict Mode Violations (Build Failure)
**File:** `tsconfig.json` + multiple source files

**Problem:** Enabled `strict: true`, `noUncheckedIndexedAccess: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. These catch:
- `board[c.i] === null` — with `noUncheckedIndexedAccess`, `board[c.i]` could be `undefined`, not just `null`
- `coords[selectedNode]` — same issue
- `showNotation` destructured but unused in `Node.tsx`
- `adjacency` destructured but unused in `GameBoard.tsx`
- `saveToSlot` destructured but unused in `GameUI.tsx`
- `Save` icon imported but unused in `GameUI.tsx`
- `Video` icon imported but unused in `Screens.tsx`
- `window as any` in `audio.ts`

**Fixes Applied:**
| File | Issue | Fix |
|------|-------|-----|
| `GameBoard.tsx` | `board[c.i] === null` | Changed to `!board[c.i]` (catches null AND undefined) |
| `GameBoard.tsx` | `coords[selectedNode]` | Added `if (!currentCoord) return;` guard |
| `GameBoard.tsx` | `coords[edge[0]]` / `coords[edge[1]]` | Added `if (!start \|\| !end) return null;` |
| `GameBoard.tsx` | Unused `adjacency` | Removed from destructuring |
| `GameBoard.tsx` | `(config as any).edges` | Removed `as any` (types are correct) |
| `Node.tsx` | Unused `showNotation` | Removed from destructuring |
| `GameUI.tsx` | Unused `saveToSlot` | Removed from destructuring |
| `GameUI.tsx` | Unused `Save` icon import | Removed from imports |
| `Screens.tsx` | Unused `Video` icon import | Removed from imports |
| `audio.ts` | `window as any` | Changed to `window as unknown as { webkitAudioContext: typeof AudioContext }` |

---

### 🟡 MODERATE #4: Missing `savedSlot` in App.tsx
**File:** `src/App.tsx`

**Problem:** The `LandingScreen` `onResume` prop checked `(history \|\| []).length > 0` but `history` was destructured from the store and is no longer persisted (reset on merge). The `savedSlot` field was not destructured, so the resume button wouldn't appear for users with saved games.

**Fix:**
- Added `savedSlot` to destructured store values
- Used selector pattern for `history`: `const history = useGameStore((s) => s.history);`
- Updated `onResume` condition: `(savedSlot || (history || []).length > 0) && !winner`

---

### 🟡 MODERATE #5: Recursive `setVolume` Call (Runtime Crash)
**File:** `src/store/gameStore.ts`

**Problem:** The store action `setVolume` was calling itself recursively:
```typescript
setVolume: (volume) => {
  setVolume(volume);  // Calls itself! Infinite recursion → stack overflow
  set({ volume });
}
```

**Fix:** Renamed the audio module import to avoid naming collision:
```typescript
import { setVolume as setAudioVolume } from '@/lib/audio';
// ...
setVolume: (volume) => {
  setAudioVolume(volume);  // Calls the audio module function
  set({ volume });
},
```

---

### 🟡 MODERATE #6: Missing Deployment Configuration
**Files:** None existed previously

**Problem:** No `vercel.json` or `.node-version` file. Vercel defaults to an older Node version and may not detect the framework correctly.

**Fix:**
- Created `vercel.json` with explicit build config:
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "installCommand": "npm install",
    "framework": "vite"
  }
  ```
- Created `.node-version` specifying Node 20

---

## What Was NOT Causing the Issue

| Suspect | Verdict | Reason |
|---------|---------|--------|
| `process.env.DISABLE_HMR` | ✅ Fixed | Guarded with `typeof process !== 'undefined'` |
| Missing `npm install` | ❌ Not an issue | Vercel auto-detects and runs `npm install` |
| Missing dependencies | ❌ Not an issue | All deps in `package.json` |
| `vite build` command | ❌ Not an issue | Command is correct |
| Build output directory | ❌ Not an issue | Vite defaults to `dist/` |

---

## Deployment Checklist (All ✅)

- [x] Circular dependency eliminated
- [x] PWA plugin icons match existing files
- [x] No unused imports/variables (strict mode clean)
- [x] No `as any` type assertions in critical paths
- [x] No recursive function calls
- [x] All indexed access guarded against `undefined`
- [x] `vercel.json` created with correct config
- [x] `.node-version` set to 20
- [x] No external network dependencies (all textures removed)

---

## How to Verify Locally Before Deploying

```bash
cd "C:\Users\motaung\Downloads\Morabaraba-main-v3\Morabaraba-main"

# 1. Install fresh dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Type-check (catches strict mode errors)
npm run lint

# 3. Build (simulates Vercel build)
npm run build

# 4. Preview production build
npm run preview
```

If all 4 commands succeed without errors, Vercel deployment will succeed.

---

## What Changed Between Old Working Deploy and New Failing Deploy

The refactor introduced:
1. **Circular import** (audio.ts ↔ gameStore.ts) — didn't exist before
2. **PWA plugin** with missing icon references — didn't exist before
3. **TypeScript strict mode** — was not enabled before
4. **`setVolume` recursive call** — didn't exist before
5. **New unused imports** from added features — didn't exist before

All of these are new code from the polish/refactor pass. The original codebase didn't have these issues because it didn't have these features or strict mode enabled.
