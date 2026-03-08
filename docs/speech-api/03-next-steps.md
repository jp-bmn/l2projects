# Web Speech API - Next Steps

## Current Status

**Phases 1, 2, and 3 are complete.** The core speech service, toolbar components, and preferences UI are implemented. The remaining work focuses on integrating the toolbar buttons into the main app and wiring up CLI narration to git operations.

---

## Phase 3: Settings UI ✅ COMPLETE

All settings UI components have been implemented:
- `app/src/models/preferences.ts` - Added Accessibility enum
- `app/src/ui/preferences/accessibility.tsx` - Full settings component
- `app/src/ui/preferences/preferences.tsx` - Integrated Accessibility tab
- `app/styles/ui/_accessibility.scss` - Styling for settings

---

## Phase 4: App Integration (Next)

### 4.1 Add Toolbar Buttons to App

**File:** `app/src/ui/app.tsx`

In the toolbar render section, add speech buttons on the right side:
```tsx
<div className="speech-toolbar-buttons">
  <TTSToolbarButton
    ttsSettings={this.state.ttsSettings}
    onTTSEnabledChanged={this.onTTSEnabledChanged}
    onCLITeachingModeChanged={this.onCLITeachingModeChanged}
    onOpenAccessibilitySettings={this.onOpenAccessibilitySettings}
  />
  <STTToolbarButton
    sttSettings={this.state.sttSettings}
    onVoiceCommand={this.onVoiceCommand}
    onRecognitionStateChanged={this.onRecognitionStateChanged}
  />
</div>
```

### 4.2 Voice Command Handler

Implement command routing in app.tsx or dispatcher:
```typescript
private onVoiceCommand = (command: VoiceCommandAction, params?: string) => {
  switch (command) {
    case VoiceCommandAction.Commit:
      // Open commit dialog or commit staged
      break
    case VoiceCommandAction.Push:
      this.props.dispatcher.push(repository)
      break
    case VoiceCommandAction.Pull:
      this.props.dispatcher.pull(repository)
      break
    // ... etc
  }
}
```

---

## Phase 5: CLI Narration Integration (Pending)

### 5.1 Wire CLI Narration to Git Operations

Locations to add `announceOperation()` calls:

| Operation | File | Method |
|-----------|------|--------|
| Commit | `git-store.ts` | `createCommit()` |
| Push | `git-store.ts` | `push()` |
| Pull | `git-store.ts` | `pull()` |
| Fetch | `git-store.ts` | `fetch()` |
| Checkout | `git-store.ts` | `checkoutBranch()` |
| Create Branch | `git-store.ts` | `createBranch()` |
| Stash | `git-store.ts` | `createStash()` |
| Stage | `git-store.ts` | `changeFileIncluded()` |

Example integration:
```typescript
// After successful commit
const speechService = getSpeechService()
speechService.announceOperation(GitOperation.Commit, {
  message: commitMessage,
  branch: currentBranch,
})
```

---

## Phase 6: Polish (Pending)

### 6.1 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+Shift+S` | Toggle speech recognition |
| `Cmd/Ctrl+Shift+R` | Read current selection/context |
| `Escape` | Stop speech/recognition |

Add to menu definitions in `app/src/main-process/menu/`.

### 6.2 Accessibility Review

- Ensure all buttons have proper `aria-label` attributes
- Add `aria-live="polite"` for dynamic status updates
- Test with screen readers
- Verify keyboard navigation works

### 6.3 Error Handling

- Handle microphone permission denied
- Handle network errors for cloud STT
- Graceful degradation when APIs unavailable
- User-friendly error messages

### 6.4 Unit Tests

Create tests in `app/test/unit/speech/`:
- `speech-service-test.ts` - Service initialization and methods
- `speech-commands-test.ts` - Command parsing accuracy
- `cli-narrator-test.ts` - CLI command generation

---

## File Summary

### Files Complete ✅
- `app/src/lib/speech/*` - All speech module files
- `app/src/ui/toolbar/tts-toolbar-button.tsx`
- `app/src/ui/toolbar/stt-toolbar-button.tsx`
- `app/src/ui/toolbar/index.tsx`
- `app/src/lib/feature-flag.ts`
- `app/src/lib/app-state.ts`
- `app/styles/ui/toolbar/_speech.scss`
- `app/styles/_ui.scss`
- `app/src/models/preferences.ts`
- `app/src/ui/preferences/accessibility.tsx`
- `app/src/ui/preferences/preferences.tsx`
- `app/styles/ui/_accessibility.scss`

### Files to Modify (Remaining)
- `app/src/ui/app.tsx` - Add toolbar buttons and handlers
- `app/src/lib/stores/git-store.ts` - Add CLI narration calls (optional)

---

## Verification

After implementation, verify by:

1. **Build**: `yarn build:dev` - no TypeScript errors
2. **Lint**: `yarn lint` - passes ESLint checks
3. **Tests**: `yarn test:unit` - all tests pass
4. **Manual**:
   - Open Preferences > Accessibility - all settings work
   - Enable TTS, click Test Speech - hear output
   - Enable STT, click microphone button - listening state shown
   - Say "commit" - action triggered (if voice commands enabled)
   - Perform a commit with CLI mode on - hear git command
