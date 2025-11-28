# Major Order ⚔️

A pixel-style productivity app for macOS with gamified task management, Pomodoro timer, and streak tracking.

![Platform](https://img.shields.io/badge/platform-macOS-blue)
![Framework](https://img.shields.io/badge/framework-Electron%20%2B%20React-61DAFB)
![Style](https://img.shields.io/badge/style-Pixel%20Art-green)

## Features

- **📋 Task Management** - Add, edit, delete, and reorder tasks with priority levels
- **🍅 Pomodoro Timer** - Focus sessions with customizable work duration
- **🔥 Streak Tracking** - Build momentum by completing all daily tasks
- **🎖️ Badges & Rewards** - Unlock achievements for milestones
- **⏱️ Time Tracking** - Estimate vs actual time with feedback
- **🔄 Recurring Tasks** - Auto-generate daily/weekly tasks

## Screenshots

*Coming soon*

## Installation

```bash
# Clone the repository
git clone https://github.com/elitedevstudios/majororderapp.git
cd majororderapp

# Install dependencies
npm install

# Start development
npm run dev

# Build for macOS
npm run build:mac
```

## Tech Stack

- **Runtime**: Electron (macOS Apple Silicon)
- **Frontend**: React 18 + TypeScript
- **State**: Zustand
- **Storage**: electron-store (local JSON)
- **Styling**: CSS Modules + CSS Custom Properties
- **Build**: Vite + electron-builder

## Development

```bash
# Start dev server with hot reload
npm run dev

# Run tests
npm test

# Build production
npm run build:mac
```

## Project Structure

```
major-order/
├── electron/          # Electron main process
├── src/
│   ├── components/    # React components
│   ├── stores/        # Zustand state stores
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript definitions
│   ├── styles/        # Global CSS
│   └── assets/        # Fonts, sounds, images
└── tests/             # Test files
```

## Badges

| Badge | Name | Condition |
|-------|------|-----------|
| 🎖️ | First Blood | Complete first task |
| 🔥 | On Fire | 3-day streak |
| ⚡ | Unstoppable | 7-day streak |
| 👑 | Legend | 30-day streak |
| 💯 | Centurion | 100 tasks completed |
| ⏱️ | Time Lord | 10 pomodoros in one day |
| 🎯 | Sniper | Complete task under estimate |

## License

MIT

---

*No excuses. Complete your orders. Build momentum.*
