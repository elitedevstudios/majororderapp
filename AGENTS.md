# AGENTS.md - Major Order

> A pixel-style productivity app for macOS with gamified task management, Pomodoro timer, and streak tracking.

## Project Overview

**Major Order** is a no-nonsense productivity tracker with a retro video game aesthetic. Users receive "orders" (tasks), complete them, and track their momentum through streaks and badges. Built as a self-contained macOS desktop app using Electron + React.

### Core Philosophy
- **Mission-focused**: Tasks are orders/objectives to complete
- **Momentum-driven**: Streaks reset on missed days to build discipline
- **Game-like feedback**: Pixel art, 8-bit sounds, celebratory animations
- **Self-contained**: All data stored locally, no external dependencies

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Electron (macOS Apple Silicon) |
| Frontend | React 18+ with TypeScript |
| State | Zustand (lightweight, persistent) |
| Storage | electron-store (JSON file-based) |
| Styling | CSS Modules + CSS Custom Properties |
| Build | Vite + electron-builder |
| Audio | Howler.js (8-bit sound effects) |

## Setup Commands

```bash
# Install dependencies
npm install

# Start development (Electron + React hot reload)
npm run dev

# Run tests
npm test

# Build for macOS (Apple Silicon)
npm run build:mac

# Package distributable
npm run package
```

## Project Structure

```
major-order/
├── AGENTS.md
├── README.md
├── package.json
├── vite.config.ts
├── electron-builder.yml
├── tsconfig.json
│
├── electron/                 # Electron main process
│   ├── main.ts              # App entry, window management
│   ├── preload.ts           # Secure bridge to renderer
│   ├── tray.ts              # Menu bar/tray functionality
│   └── store.ts             # electron-store configuration
│
├── src/                      # React renderer process
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Root component
│   │
│   ├── components/          # UI components
│   │   ├── TaskList/        # Task CRUD, ordering, priority
│   │   ├── Timer/           # Pomodoro timer display
│   │   ├── Streak/          # Streak counter, badges
│   │   ├── RecurringTasks/  # Daily recurring task templates
│   │   └── ui/              # Shared pixel-style components
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useTimer.ts      # Pomodoro logic
│   │   ├── useTasks.ts      # Task state management
│   │   ├── useStreak.ts     # Streak calculation
│   │   └── useSound.ts      # Audio playback
│   │
│   ├── stores/              # Zustand stores
│   │   ├── taskStore.ts     # Tasks, recurring tasks
│   │   ├── timerStore.ts    # Timer state
│   │   ├── streakStore.ts   # Streak & badges
│   │   └── settingsStore.ts # User preferences
│   │
│   ├── utils/               # Helper functions
│   │   ├── time.ts          # Time formatting
│   │   ├── streak.ts        # Streak calculations
│   │   └── sound.ts         # Sound file loading
│   │
│   ├── types/               # TypeScript definitions
│   │   └── index.ts         # Shared types
│   │
│   ├── assets/              # Static assets
│   │   ├── fonts/           # Pixel fonts
│   │   ├── sounds/          # 8-bit audio files
│   │   └── images/          # Pixel art sprites
│   │
│   └── styles/              # Global styles
│       ├── variables.css    # CSS custom properties
│       ├── reset.css        # CSS reset
│       ├── fonts.css        # Font-face declarations
│       └── animations.css   # Keyframe animations
│
└── tests/                    # Test files
    ├── tasks.test.ts
    ├── timer.test.ts
    └── streak.test.ts
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled (`strict: true`)
- Explicit return types on functions
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for literal types
- No `any` - use `unknown` and narrow types

### React Patterns
- Functional components only
- Custom hooks for reusable logic
- Prefer composition over prop drilling
- Use React.memo() for expensive renders
- Keep components under 150 lines

### CSS Requirements (CRITICAL)
- **BEM naming**: `.block__element--modifier`
- **Logical properties only**: Use `margin-inline`, `padding-block`, `inset-inline-start` (never `left`, `right`, `top`, `bottom` for spacing)
- **Container queries**: Prefer over media queries for component responsiveness
- **CSS custom properties**: All colors, spacing, fonts as variables
- **No inline styles**: All styles in CSS Modules

```css
/* ✅ Correct */
.task-item {
  padding-block: var(--space-sm);
  padding-inline: var(--space-md);
  margin-block-end: var(--space-xs);
}

/* ❌ Wrong */
.task-item {
  padding-top: 8px;
  padding-left: 16px;
  margin-bottom: 4px;
}
```

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Styles: `ComponentName.module.css`
- Tests: `*.test.ts`

## Data Models

### Task
```typescript
interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  order: number;
  completed: boolean;
  completedAt?: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  pomodorosSpent: number;
  createdAt: number;
  isRecurring: boolean;
  recurringTemplateId?: string;
}
```

### RecurringTask
```typescript
interface RecurringTask {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  estimatedMinutes?: number;
  frequency: 'daily' | 'weekly';
  lastGenerated?: string; // ISO date
}
```

### Streak
```typescript
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string; // ISO date
  badges: Badge[];
}
```

### Badge
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}
```

## Timer Configuration

```typescript
interface TimerConfig {
  workMinutes: number;      // Default: 25
  shortBreakMinutes: number; // Default: 5
  longBreakMinutes: number;  // Default: 15
  longBreakInterval: number; // Default: 4 (after 4 pomodoros)
}
```

## Badge Definitions

| ID | Name | Condition |
|----|------|-----------|
| `first-blood` | First Blood | Complete first task |
| `on-fire` | On Fire | 3-day streak |
| `unstoppable` | Unstoppable | 7-day streak |
| `legend` | Legend | 30-day streak |
| `centurion` | Centurion | 100 tasks completed |
| `time-lord` | Time Lord | 10 pomodoros in one day |
| `sniper` | Sniper | Complete task under estimated time |

## Window Behaviors

- **Always on top**: Toggle via menu/shortcut (Cmd+Shift+T)
- **Tray icon**: Quick timer access, streak display
- **Minimize to tray**: Close button minimizes, Cmd+Q quits
- **Menu bar timer**: Shows remaining time during active pomodoro

## Sound Effects

Use 8-bit style sounds for:
- Timer start
- Timer complete (work session)
- Break complete
- Task complete
- Badge unlock
- Streak milestone

Source: Free 8-bit sound packs (OpenGameArt, Freesound)

## Testing Instructions

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tasks.test.ts

# Run with coverage
npm run test:coverage
```

### Test Requirements
- Unit tests for all store logic
- Test streak calculations edge cases
- Test timer state transitions
- Test recurring task generation

## Build & Package

```bash
# Development build
npm run build

# Production build for macOS ARM64
npm run build:mac

# Output: dist/Major Order-{version}-arm64.dmg
```

### electron-builder Configuration
- Target: macOS ARM64 (Apple Silicon)
- Format: DMG
- Code signing: Optional for local use
- Auto-update: Disabled (self-hosted)

## Security Considerations

- No network requests (fully offline)
- All data in user's Application Support folder
- Preload script with contextIsolation enabled
- No nodeIntegration in renderer

## Common Tasks

### Adding a new badge
1. Add badge definition to `src/stores/streakStore.ts`
2. Add unlock condition check
3. Add pixel art icon to `src/assets/images/badges/`
4. Test unlock trigger

### Modifying timer defaults
1. Update `src/stores/timerStore.ts` defaults
2. Update settings UI if exposed
3. Test timer state machine

### Adding new sound
1. Add .mp3/.wav to `src/assets/sounds/`
2. Register in `src/utils/sound.ts`
3. Call via `useSound` hook

## Commit Message Format

```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`

Examples:
- `feat(timer): add custom work duration setting`
- `fix(streak): correct midnight rollover calculation`
- `style(tasks): add completion animation`
