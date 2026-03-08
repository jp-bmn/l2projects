CLI Teaching Mode
When enabled, reads the equivalent git CLI command after each operation:

Operation	TTS Output
Commit	"git commit -m 'your message'"
Push	"git push origin branch-name"
Pull	"git pull origin branch-name"
Fetch	"git fetch --all"
Switch branch	"git checkout branch-name"
Create branch	"git checkout -b new-branch-name"
Stash	"git stash"
Discard file	"git checkout -- filename"
Stage file	"git add filename"
Unstage file	"git reset HEAD filename"
cli-narrator.ts Implementation

export function getCLINarration(
  operation: GitOperation,
  context: IOperationContext
): string {
  switch (operation) {
    case 'commit':
      return `git commit -m "${context.message}"`
    case 'push':
      return `git push ${context.remote} ${context.branch}`
    case 'pull':
      return `git pull ${context.remote} ${context.branch}`
    case 'checkout':
      return `git checkout ${context.branch}`
    case 'create-branch':
      return `git checkout -b ${context.branch}`
    // ... etc
  }
}
Toolbar Integration
The toolbar layout will be:


┌────────────────────────────────────────────────────────────────────┐
│ [Fetch↓] [Pull↓] [Push] [Branch: main ▾]    ...    [🔊▾] [🎤]     │
└────────────────────────────────────────────────────────────────────┘
                                                      │     │
                                              TTS Menu│     │STT Toggle
                                                      ▼     ▼
                                              ┌──────────┐  Active/
                                              │ ☑ Enable │  Inactive
                                              │ ☑ CLI    │  indicator
                                              │   Mode   │
                                              │ Settings │
                                              │   ...    │
                                              └──────────┘
TTS Toolbar Button (tts-toolbar-button.tsx)
Speaker icon (🔊) with dropdown arrow
Dropdown menu contains:
Enable/Disable TTS toggle
CLI Teaching Mode toggle
"Read Last Action" option
"Open Settings..." link to Accessibility preferences
STT Toolbar Button (stt-toolbar-button.tsx)
Microphone icon (🎤)
Click to toggle listening on/off
Animated indicator when listening (pulsing red dot)
Tooltip shows current state
Voice Commands
Phrases	Action
"commit", "commit changes"	Open commit dialog / commit staged
"push", "push changes"	Push to remote
"pull", "pull changes"	Pull from remote
"fetch"	Fetch from remote
"switch branch", "checkout"	Open branch switcher
"create branch", "new branch"	Open create branch dialog
"stash", "stash changes"	Stash current changes
"discard", "discard changes"	Discard uncommitted changes
"refresh"	Refresh repository status
"stop listening", "stop"	Stop voice recognition
"read commit"	Read the selected commit message
"read diff"	Read the diff summary
Keyboard Shortcuts
Shortcut	Action
Cmd/Ctrl+Shift+S	Toggle speech recognition
Cmd/Ctrl+Shift+R	Read current selection/context aloud
Escape	Stop speech/recognition
Implementation Phases
Phase 1: Core Infrastructure
Create speech-types.ts with all interfaces
Implement speech-service.ts singleton with TTS/STT wrappers
Create cli-narrator.ts for CLI teaching mode
Add feature flags in feature-flag.ts
Add speech state to app-state.ts
Phase 2: Toolbar Integration
Create tts-toolbar-button.tsx with dropdown menu
Create stt-toolbar-button.tsx with listening indicator
Modify toolbar.tsx to add buttons on the right side
Create SCSS styles for toolbar buttons
Wire up to dispatcher
Phase 3: Settings UI
Add Accessibility to PreferencesTab enum
Create accessibility.tsx preferences component
Add dispatcher methods for settings
Integrate into preferences.tsx
Phase 4: TTS Features
Integrate TTS announcements for:
Commit messages (on selection)
Diff summaries
Branch switch notifications
Push/pull/fetch completion
Implement CLI teaching mode narration
Add "Read" context menu items where appropriate
Phase 5: STT Features
Implement voice command parser
Connect commands to dispatcher actions
Add voice dictation to commit message input
Add visual feedback during listening
Phase 6: Polish
Add keyboard shortcuts
Accessibility review (ARIA labels, focus management)
Error handling and edge cases
Unit tests for speech service
Integration tests for UI components
Settings Storage
Follow existing localStorage pattern:


// Keys
'speech-settings'     // Combined settings object
'tts-enabled'         // Quick boolean check
'stt-enabled'         // Quick boolean check
'cli-teaching-mode'   // CLI narration toggle

// Using existing helpers from local-storage.ts
getObject<ISpeechSettings>('speech-settings')
setObject('speech-settings', settings)
getBoolean('cli-teaching-mode', false)
Browser Compatibility
Feature	Support
SpeechSynthesis (TTS)	All Chromium/Electron versions
SpeechRecognition (STT)	Requires webkitSpeechRecognition, needs internet for cloud processing
Fallback behavior: Features gracefully disable with informative messages when APIs unavailable. Toolbar buttons hidden if not supported.

Testing Strategy
Unit Tests (app/test/unit/speech/)
speech-service-test.ts - Service initialization, settings, events
speech-commands-test.ts - Command parsing accuracy
cli-narrator-test.ts - CLI command generation
tts-toolbar-button-test.ts - Button state and menu
stt-toolbar-button-test.ts - Listening state management
Manual Testing Checklist
 TTS toolbar button shows/hides dropdown correctly
 Enable TTS, test voice selection and rate in settings
 CLI teaching mode reads correct commands after operations
 STT toolbar button toggles listening state
 Voice commands trigger correct actions
 Keyboard shortcuts work
 Graceful degradation when APIs unavailable
 Screen reader announces button states correctly
Accessibility Considerations
ARIA labels on all toolbar buttons (aria-label, aria-pressed)
aria-live="polite" for listening status announcements
Keyboard-accessible controls (toolbar buttons focusable)
Clear visual indicators during listening/speaking
Escape key always stops speech
Screen reader friendly error messages
High contrast support for listening indicator
Reference Files
Purpose	File
Toolbar structure	app/src/ui/toolbar/toolbar.tsx
Toolbar button pattern	app/src/ui/toolbar/push-pull-button.tsx
Dropdown button pattern	app/src/ui/toolbar/branch-dropdown.tsx
Settings pattern	app/src/ui/preferences/advanced.tsx
Store pattern	app/src/lib/stores/notifications-store.ts
localStorage helpers	app/src/lib/local-storage.ts
Feature flags	app/src/lib/feature-flag.ts
Commit message (STT target)	app/src/ui/changes/commit-message.tsx
Preferences dialog	app/src/ui/preferences/preferences.tsx
Preferences tabs enum	app/src/models/preferences.ts
Verification
After implementation, verify by:

Build: yarn build:dev - no TypeScript errors
Lint: yarn lint - passes ESLint checks
Tests: yarn test:unit - all tests pass
Manual:
Click TTS button, enable, perform a commit - hear CLI command
Click STT button, say "push" - push action triggered
Open Preferences > Accessibility - all settings work
Test with TTS/STT disabled - buttons hidden gracefully
