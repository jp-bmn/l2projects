# GitHub Desktop

GitHub Desktop is an open-source Electron-based desktop application for managing Git repositories with native GitHub integration. It provides a visual interface for Git operations as an alternative to command-line tools.

## Tech Stack

- **Framework**: Electron 19.0.0
- **UI**: React 16.8.4 with TypeScript
- **Language**: TypeScript 4.6.4 (strict mode)
- **Build**: Webpack 5 with parallel-webpack
- **Styling**: SCSS
- **Testing**: Jest 26.6.3
- **Package Manager**: Yarn 1.9+
- **Git Library**: dugite (libgit2 wrapper)
- **Platforms**: macOS (Intel & ARM64), Windows, Linux

## Project Structure

```
/
├── app/                          # Main application
│   ├── src/
│   │   ├── main-process/         # Electron main process
│   │   ├── ui/                   # React components (87+ features)
│   │   ├── lib/                  # Business logic (117+ modules)
│   │   │   ├── git/              # Git command wrappers (53 modules)
│   │   │   ├── stores/           # State management (35 stores)
│   │   │   └── api.ts            # GitHub API client
│   │   ├── models/               # Data models (48 entities)
│   │   ├── cli/                  # CLI tools
│   │   ├── crash/                # Crash handler
│   │   └── highlighter/          # Syntax highlighting
│   ├── static/                   # Static assets
│   ├── styles/                   # SCSS stylesheets
│   ├── test/                     # Unit tests
│   └── webpack.*.ts              # Webpack configs
├── docs/                         # Documentation
├── script/                       # Build scripts
├── eslint-rules/                 # Custom ESLint rules
└── .github/workflows/            # CI/CD
```

## Architecture

### Electron Process Model

**Main Process** (`app/src/main-process/`):
- `main.ts` - Application entry, lifecycle, window management
- `ipc-main.ts` - IPC handlers for renderer communication
- `menu/` - Platform-specific menu definitions
- Handles: auto-updates, notifications, system integration

**Renderer Process** (`app/src/ui/`):
- `app.tsx` - Main React component (orchestrates entire UI)
- `repository.tsx` - Repository view with tabs
- Feature components in subdirectories

### State Management

Centralized immutable state with event-driven updates:

```
UI Component → Dispatcher → Store → State Change → UI Re-render
```

**Key Stores** (`app/src/lib/stores/`):
- `app-store.ts` - Main state container
- `git-store.ts` - Repository Git operations
- `repositories-store.ts` - Repository list
- `accounts-store.ts` - GitHub accounts
- `pull-request-store.ts` - PR data

**State Interface** (`app/src/lib/app-state.ts`):
```typescript
IAppState {
  accounts: ReadonlyArray<Account>
  repositories: ReadonlyArray<Repository>
  selectedState: PossibleSelections | null
  currentPopup: Popup | null
  currentBanner: Banner | null
  // ...40+ properties
}
```

### IPC Communication

Type-safe channels between main and renderer:

**Request Channels** (main → renderer, one-way):
- `menu-event`, `app-menu`, `focus/blur`, `update-accounts`

**Request-Response Channels** (renderer → main, async):
- `get-path`, `move-to-trash`, `show-contextual-menu`
- `show-open-dialog`, `show-save-dialog`, `open-external`

### Git Integration

All Git operations via dugite wrapper (`app/src/lib/git/`):
- 53 modules for Git commands (branch, checkout, commit, merge, rebase, etc.)
- Error parsing and progress tracking
- LFS support

### GitHub API

REST API client (`app/src/lib/api.ts`):
- OAuth authentication (scopes: repo, user, workflow)
- Repository, PR, and check run operations
- GitHub Enterprise support

## Key Data Models

Located in `app/src/models/`:

```typescript
Repository { path, id, gitHubRepository, alias, missing }
GitHubRepository { name, owner, htmlURL, cloneURL, fork, parent }
Branch { name, upstream, tip, type, ref }
Commit { sha, shortSha, author, body }
Account { login, endpoint, token, emails, avatarURL }
WorkingDirectoryFileChange { path, status, oldPath }
```

## Development

### Commands

```bash
yarn install          # Install dependencies
yarn build:dev        # Development build
yarn build:prod       # Production build
yarn start            # Dev server with hot reload (port 3000)
yarn test:unit        # Run unit tests
yarn lint             # ESLint + Prettier check
yarn package          # Create installer
```

### Build Process

- Webpack compiles: main process, renderer, CLI, crash handler, highlighter
- Development: inline CSS, source maps, hot module replacement
- Production: separate CSS extraction, bundle analysis

### Testing

- Jest with ts-jest transformer
- Tests in `app/test/unit/`
- Fixtures in `app/test/fixtures/`
- Custom GitHub Actions reporter

### Code Quality

- TypeScript strict mode
- ESLint with custom rules (`eslint-rules/`)
- Prettier formatting
- CI runs on macOS and Windows (x64 + arm64)

## Key Features

- **Repository Management**: Clone, add, create, remove repositories
- **Branching**: Create, rename, delete, switch branches
- **Commits**: Stage, commit, amend, revert
- **Advanced Git**: Merge, rebase, cherry-pick, stash
- **Pull Requests**: View, create, check CI status
- **Diffs**: Text diffs with syntax highlighting, image diffs
- **Conflict Resolution**: Visual merge conflict handling
- **Multi-account**: GitHub.com and Enterprise support

## Important Files

| Purpose | Location |
|---------|----------|
| Main entry | `app/src/main-process/main.ts` |
| React root | `app/src/ui/app.tsx` |
| Main store | `app/src/lib/stores/app-store.ts` |
| Git store | `app/src/lib/stores/git-store.ts` |
| API client | `app/src/lib/api.ts` |
| State types | `app/src/lib/app-state.ts` |
| IPC types | `app/src/lib/ipc-shared.ts` |
| Dispatcher | `app/src/ui/dispatcher/dispatcher.ts` |

## Conventions

- Immutable state updates (never mutate)
- Type-safe IPC channels
- React functional components with hooks
- SCSS with BEM-style naming
- Co-located tests in `app/test/unit/`

## Common Patterns

### Adding a Dialog

1. Add popup type to `PopupType` enum in `app/src/models/popup.ts`
2. Create component in `app/src/ui/`
3. Handle in `app.tsx` switch statement
4. Add dispatcher method to show popup

### Adding Git Operation

1. Create wrapper in `app/src/lib/git/`
2. Add store method in relevant store
3. Add dispatcher method
4. Connect to UI component

### State Updates

```typescript
// In store
this.emitUpdate()

// In dispatcher
appStore._updateRepositoryState(repository, state => ({
  ...state,
  changedProperty: newValue
}))
```
