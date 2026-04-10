# Morabaraba

The definitive digital version of the official South African indigenous strategy board game (also known as Ncuva, Umlabalaba, Mlabalaba).

## Cultural Context
Morabaraba is a traditional African strategy game played for hundreds of years. Boards dating back 800 years have been found at Mapungubwe. The pieces represent 'cows' (dikgomo), reflecting the pastoral heritage of Southern Africa. This digital version adheres to the Mind Sports South Africa (MSSA) Generally Accepted Rules (GAR).

## Features
- **Authentic Rules:** 100% MSSA GAR compliant (Placing, Moving, Flying, Shooting).
- **AI Opponent:** Play against a Minimax AI with 4 difficulty levels (Easy, Medium, Hard, Expert).
- **Local Multiplayer:** Play against a friend on the same device.
- **PWA Ready:** Installable on mobile devices with full offline support.
- **Responsive Design:** Playable on any screen size.
- **Audio:** Native Web Audio API sounds with volume control.
- **Accessibility:** Keyboard navigation, ARIA labels, reduced motion support.
- **Game Sharing:** Share your game state via URL.
- **Multiple Variants:** Standard (24), Sesotho (25), 11 Men, Gonjilgonu.
- **Customization:** Player names, piece skins, board notation toggle.
- **Undo System:** 3 undos per game.
- **Notifications:** In-game event system with toast notifications.
- **Threefold Repetition:** Draw by repetition rule implemented.
- **Haptic Feedback:** Tactile feedback on mobile devices.

## Vercel Deployment Guide
1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click "Add New Project".
3. Import your GitHub repository.
4. Vercel will automatically detect the Vite framework.
5. Click "Deploy".
6. Your game is now live on the Vercel Hobby tier!

## Tech Stack
- React 19 + Vite
- Tailwind CSS v4
- Zustand (State Management)
- Framer Motion (Animations)
- Lucide React (Icons)
- Vitest (Testing)
- Vite PWA Plugin (Offline Support)

## Development
```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run test     # Run tests
npm run lint     # Type check
```
