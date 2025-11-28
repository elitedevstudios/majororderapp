# Major Order - Product Requirements Document

**Version**: 1.0  
**Date**: November 2024  
**Author**: Development Team  
**Platform**: macOS (Apple Silicon)

---

## Executive Summary

**Major Order** is a single-user desktop productivity application for macOS that combines task management, Pomodoro timing, and streak-based gamification with a retro pixel art aesthetic. The app is designed to create momentum through discipline—miss a day, lose your streak.

### Vision Statement
> "No excuses. Complete your orders. Build momentum."

---

## Problem Statement

Existing productivity apps suffer from:
- **Feature bloat**: Too many options create decision paralysis
- **Lack of accountability**: No consequences for missed tasks
- **Boring interfaces**: Utilitarian designs fail to engage users
- **Cloud dependency**: Require accounts, sync, internet access

### Target User
- Individual professionals or students
- Self-motivated but need external accountability
- Appreciate retro gaming aesthetics
- Prefer offline, privacy-respecting tools

---

## Product Goals

| Goal | Success Metric |
|------|----------------|
| Simple task management | < 3 clicks to add/complete task |
| Build daily habits | Users maintain 7+ day streaks |
| Focused work sessions | 4+ pomodoros completed daily |
| Delightful experience | Users keep app open/visible |

---

## Features

### 1. Task Management (Orders)

#### 1.1 Create Task
- **Input**: Title (required), priority, estimated time
- **Priority levels**: Low, Medium, High (visual distinction)
- **Estimated time**: Optional, in minutes
- **Default state**: Incomplete, ordered by creation

#### 1.2 Edit Task
- Inline editing of title
- Change priority via dropdown/buttons
- Modify estimated time
- Cannot edit completed tasks (historical accuracy)

#### 1.3 Delete Task
- Confirmation required (pixel-style dialog)
- Soft delete with undo option (5 seconds)
- Permanent after undo window

#### 1.4 Reorder Tasks
- Drag and drop interface
- Manual order persists across sessions
- Visual feedback during drag

#### 1.5 Complete Task
- Single click/tap to mark complete
- Records completion timestamp
- Records actual time spent (from linked pomodoros)
- Triggers completion animation
- Plays 8-bit sound effect

#### 1.6 Time Tracking Feedback
When a task with estimated time is completed:
- **Under estimate**: "⚡ SNIPER! Completed 5 min faster!"
- **On target**: "✓ Right on schedule, soldier."
- **Over estimate**: "⏰ Took 10 min longer. Adjust next time?"

---

### 2. Recurring Tasks (Standing Orders)

#### 2.1 Create Recurring Task
- Same fields as regular task + frequency
- Frequency options: Daily, Weekly
- Stored as template, not active task

#### 2.2 Auto-Generation
- Daily tasks: Generated at midnight local time
- Weekly tasks: Generated on specified day
- Skips if instance already exists for period
- Inherits all template properties

#### 2.3 Manage Templates
- Separate section in UI
- Edit/delete templates
- Pause/resume generation
- View generation history

---

### 3. Pomodoro Timer

#### 3.1 Timer Modes
| Mode | Default Duration | Customizable |
|------|------------------|--------------|
| Work | 25 minutes | Yes |
| Short Break | 5 minutes | No |
| Long Break | 15 minutes | No |

- Long break triggers after 4 work sessions

#### 3.2 Timer Controls
- **Start**: Begin countdown
- **Pause**: Freeze timer (work sessions only)
- **Stop**: Cancel current session
- **Skip**: Move to next phase

#### 3.3 Task Linking
- Select active task before starting timer
- Pomodoro count increments on task
- Actual time accumulates from completed pomodoros
- Unlinked pomodoros allowed but not tracked

#### 3.4 Notifications
- **Audio**: 8-bit chime on timer complete
- **Visual**: Window flash, tray icon change
- **System**: macOS notification (optional)

#### 3.5 Custom Work Duration
- Settings panel to adjust work duration
- Range: 15-60 minutes
- Persists across sessions

---

### 4. Streak Tracking

#### 4.1 Streak Rules
- **Increment**: Complete ALL tasks for the day
- **Reset**: Miss completing all tasks by midnight
- **No freeze**: Intentional—builds discipline
- **Timezone**: Local system time

#### 4.2 Streak Display
- Current streak count (prominent)
- Longest streak record
- Calendar heat map (optional, future)

#### 4.3 Edge Cases
- No tasks = no streak change (neutral day)
- Tasks added after midnight = new day
- Recurring tasks count toward daily total

---

### 5. Badges & Rewards

#### 5.1 Badge Definitions

| Badge | Name | Condition | Icon |
|-------|------|-----------|------|
| 🎖️ | First Blood | Complete 1st task ever | Sword |
| 🔥 | On Fire | 3-day streak | Flame |
| ⚡ | Unstoppable | 7-day streak | Lightning |
| 👑 | Legend | 30-day streak | Crown |
| 💯 | Centurion | 100 tasks completed | Shield |
| ⏱️ | Time Lord | 10 pomodoros in one day | Hourglass |
| 🎯 | Sniper | Complete task under estimate | Crosshair |

#### 5.2 Badge Unlock
- Check conditions on relevant events
- Display unlock animation (pixel explosion)
- Play fanfare sound
- Badge permanently visible in profile

#### 5.3 Badge Gallery
- View all badges (locked and unlocked)
- Locked badges show silhouette + hint
- Unlocked badges show date earned

---

### 6. Window Behaviors

#### 6.1 Always on Top
- Toggle via menu: View → Always on Top
- Keyboard shortcut: Cmd+Shift+T
- Visual indicator when active
- Persists across sessions

#### 6.2 Tray Icon
- Shows in macOS menu bar
- Displays: Current streak, timer status
- Click: Show/hide main window
- Right-click: Quick actions menu

#### 6.3 Minimize to Tray
- Close button (X) minimizes to tray
- Cmd+Q fully quits application
- Tray tooltip shows status

#### 6.4 Menu Bar Timer
- During active pomodoro: Shows remaining time
- Format: "🍅 12:34" or "☕ 3:21"
- Updates every second

---

## Visual Design

### Color Palette (SNES Era)

```
Primary:
- Background Dark:  #1a1c2c
- Background Mid:   #333c57
- Background Light: #566c86

Accent:
- Red (High):       #b13e53
- Yellow (Medium):  #ef7d57
- Green (Low):      #38b764
- Blue (Timer):     #41a6f6
- Purple (Badges):  #73eff7

Text:
- Primary:          #f4f4f4
- Secondary:        #94b0c2
- Disabled:         #566c86
```

### Typography
- **Primary font**: "Press Start 2P" or "Pixelify Sans" (readable pixel font)
- **Fallback**: system-ui, monospace
- **Sizes**: 8px, 12px, 16px, 24px (multiples of 4)

### Visual Elements
- 2px borders on interactive elements
- 4px border-radius (subtle rounding)
- Drop shadows: 2px offset, no blur
- Pixel-perfect icons (16x16, 32x32)

### Animations
- **Task complete**: Checkmark draws, item flashes green, slides out
- **Badge unlock**: Screen flash, badge zooms in, particles explode
- **Streak milestone**: Fire animation, number pulses
- **Timer complete**: Screen shake, flash, icon bounce
- **Drag reorder**: Item lifts with shadow, others shift smoothly

---

## Technical Requirements

### Platform
- macOS 12.0+ (Monterey and later)
- Apple Silicon (ARM64) native
- Intel support optional (Universal binary)

### Performance
- App launch: < 2 seconds
- Timer accuracy: ±1 second
- Memory usage: < 150MB
- Disk usage: < 100MB (app + data)

### Data Storage
- Location: `~/Library/Application Support/Major Order/`
- Format: JSON (via electron-store)
- Backup: Manual export to JSON file
- No cloud sync (by design)

### Security
- No network requests
- No analytics/telemetry
- No user accounts
- Context isolation enabled
- Node integration disabled in renderer

---

## User Flows

### Flow 1: Daily Usage
```
1. Open app (or click tray icon)
2. Review today's tasks (including auto-generated recurring)
3. Select task to work on
4. Start pomodoro timer
5. Work until timer completes
6. Take break (timer auto-starts break)
7. Repeat until task complete
8. Mark task complete
9. See feedback on time estimate
10. Continue with next task
11. Complete all tasks → streak increments
```

### Flow 2: First Launch
```
1. App opens with empty state
2. Onboarding tooltip: "Add your first order"
3. User adds task
4. Tooltip: "Start a pomodoro to focus"
5. User starts timer
6. Timer completes → celebration
7. User completes task → "First Blood" badge
```

### Flow 3: Streak Loss
```
1. User opens app next day
2. Previous day had incomplete tasks
3. Modal: "Mission Failed. Streak reset to 0."
4. Shows previous streak for reference
5. Motivational message: "Start again. No excuses."
6. New day begins fresh
```

---

## MVP Scope (Phase 1)

### Included
- [ ] Basic task CRUD
- [ ] Task ordering (drag & drop)
- [ ] Priority levels with visual distinction
- [ ] Pomodoro timer (standard intervals)
- [ ] Timer-task linking
- [ ] Basic streak tracking
- [ ] Tray icon with timer display
- [ ] Pixel art styling (basic)
- [ ] Sound effects (timer complete)

### Deferred to Phase 2
- [ ] Custom work duration
- [ ] Recurring tasks
- [ ] All badges
- [ ] Time estimation feedback
- [ ] Elaborate animations
- [ ] Badge gallery
- [ ] Settings panel
- [ ] Data export

---

## Success Criteria

### MVP Launch
- App installs and runs on macOS ARM64
- Tasks can be created, edited, deleted, reordered
- Timer functions correctly with audio
- Streak tracks across days
- No crashes during normal usage

### Post-Launch (30 days)
- User maintains 7+ day streak
- 50+ tasks completed
- App used daily

---

## Appendix

### A. Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New Task | Cmd+N |
| Start/Pause Timer | Space |
| Stop Timer | Escape |
| Toggle Always on Top | Cmd+Shift+T |
| Quit | Cmd+Q |
| Settings | Cmd+, |

### B. Sound Effects List

| Event | Sound Type | Duration |
|-------|------------|----------|
| Timer Start | Rising beep | 0.3s |
| Work Complete | Victory fanfare | 1.5s |
| Break Complete | Soft chime | 0.5s |
| Task Complete | Coin collect | 0.3s |
| Badge Unlock | Level up fanfare | 2.0s |
| Streak Milestone | Fire whoosh | 1.0s |

### C. Error States

| Error | Message | Action |
|-------|---------|--------|
| No tasks | "No orders received. Add a task to begin." | Show add button |
| Timer interrupted | "Timer stopped. Progress not saved." | Return to ready state |
| Data corruption | "Save file corrupted. Starting fresh." | Reset to defaults |

---

*Document maintained by development team. Last updated: November 2024*
