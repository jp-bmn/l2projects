# Web Speech API Integration Plan

## Overview

This document outlines the initial plan for integrating Web Speech API (TTS and STT) into GitHub Desktop. The Web Speech API provides browser-native Text-to-Speech and Speech-to-Text capabilities that work directly in Electron's Chromium-based renderer.

## Goals

1. **Accessibility**: Provide voice-based interaction for users who prefer or require audio feedback
2. **Hands-free Operation**: Enable voice commands for common git operations
3. **Educational**: CLI Teaching Mode reads equivalent git commands to help users learn command-line git

## Key Features

### Text-to-Speech (TTS)
- Read commit messages aloud
- Read diff summaries ("5 files changed, 120 insertions")
- Announce notifications and status changes
- Speak branch names when switching
- **CLI Teaching Mode**: Read equivalent git commands after operations

### Speech-to-Text (STT)
- Voice-dictate commit messages
- Voice commands: "commit", "push", "pull", "switch branch", etc.
- Voice search for repositories/branches

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Toolbar                                 │
│  [Fetch] [Pull] [Push] [Branch▾]  ...  [🔊 TTS] [🎤 STT]    │
└──────────────────────────────────┬──────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────┐
│                    UI Components                             │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │ Preferences │  │ TTSToolbar   │  │ STTToolbar        │   │
│  │ /Accessib.  │  │ Button+Menu  │  │ Button+Indicator  │   │
│  └─────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                   SpeechService                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ SpeechSynthesis │  │ SpeechRecognition               │   │
│  │ (TTS + CLI Mode)│  │ (STT + Voice Commands)          │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────┴─────────────────────────────┐   │
│  │ localStorage (settings persistence)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Infrastructure
- Create TypeScript interfaces for settings and events
- Implement SpeechService singleton with TTS/STT wrappers
- Create voice command definitions and parser
- Implement CLI narrator for teaching mode
- Add feature flags for gradual rollout

### Phase 2: Toolbar Integration
- Create TTS toolbar button with dropdown menu
- Create STT toolbar button with listening indicator
- Add SCSS styles with animations
- Export components from toolbar index

### Phase 3: Settings UI
- Add Accessibility tab to PreferencesTab enum
- Create accessibility.tsx preferences component
- Implement voice selection, rate, and language settings
- Add CLI teaching mode toggle

### Phase 4: State Management
- Add dispatcher methods for speech settings
- Add AppStore methods for persistence
- Wire up state changes to UI components

### Phase 5: Feature Integration
- Wire CLI narration to git operations
- Add voice command handlers to dispatcher
- Connect STT results to commit message input

### Phase 6: Polish
- Add keyboard shortcuts (Cmd/Ctrl+Shift+S for STT toggle)
- Accessibility review (ARIA labels, focus management)
- Error handling and edge cases
- Unit tests

## Voice Commands

| Phrases | Action |
|---------|--------|
| "commit", "commit changes" | Commit staged changes |
| "push", "push changes" | Push to remote |
| "pull", "pull changes" | Pull from remote |
| "fetch" | Fetch from remote |
| "switch branch", "checkout" | Open branch switcher |
| "create branch", "new branch" | Create new branch |
| "stash", "stash changes" | Stash current changes |
| "discard", "discard changes" | Discard uncommitted changes |
| "refresh" | Refresh repository status |
| "stop listening", "stop" | Stop voice recognition |
| "read commit" | Read selected commit message |
| "read diff" | Read diff summary |

## CLI Teaching Mode Examples

| Operation | TTS Output |
|-----------|------------|
| Commit | "git commit -m 'your message'" |
| Push | "git push origin branch-name" |
| Pull | "git pull origin branch-name" |
| Fetch | "git fetch --all" |
| Switch branch | "git checkout branch-name" |
| Create branch | "git checkout -b new-branch-name" |
| Stash | "git stash" |
| Stage file | "git add filename" |

## Technical Considerations

### Browser Compatibility
- **SpeechSynthesis (TTS)**: Supported in all Chromium/Electron versions
- **SpeechRecognition (STT)**: Requires `webkitSpeechRecognition`, needs internet for cloud processing

### Electron Configuration
GitHub Desktop uses `nodeIntegration: true` and `contextIsolation: false`, allowing direct use of Web Speech API in the renderer process without IPC.

### Fallback Behavior
Features gracefully disable with informative messages when APIs are unavailable. Toolbar buttons are hidden if the feature is not supported.

## Files to Create

```
app/src/lib/speech/
├── speech-types.ts           # TypeScript interfaces
├── speech-service.ts         # Core service singleton
├── speech-commands.ts        # Voice command definitions
├── cli-narrator.ts           # CLI teaching mode
└── index.ts                  # Public exports

app/src/ui/toolbar/
├── tts-toolbar-button.tsx    # TTS button with dropdown
└── stt-toolbar-button.tsx    # STT button with indicator

app/src/ui/preferences/
└── accessibility.tsx         # Accessibility settings tab

app/styles/ui/toolbar/
└── _speech.scss              # Speech button styles
```

## Files to Modify

- `app/src/models/preferences.ts` - Add Accessibility tab enum
- `app/src/lib/feature-flag.ts` - Add speech feature flags
- `app/src/lib/app-state.ts` - Add speech state properties
- `app/src/lib/stores/app-store.ts` - Add speech settings methods
- `app/src/ui/dispatcher/dispatcher.ts` - Add speech dispatcher methods
- `app/src/ui/preferences/preferences.tsx` - Render Accessibility tab
- `app/styles/_ui.scss` - Import speech styles
