/**
 * Web Speech API types and interfaces for GitHub Desktop
 *
 * This module provides TypeScript interfaces for Text-to-Speech (TTS)
 * and Speech-to-Text (STT) functionality using the Web Speech API.
 */

/**
 * Configuration for Text-to-Speech functionality
 */
export interface ITTSSettings {
  /** Whether TTS is enabled */
  readonly enabled: boolean

  /** Speech rate (0.5 to 2.0, default 1) */
  readonly rate: number

  /** Speech pitch (0 to 2, default 1) */
  readonly pitch: number

  /** Speech volume (0 to 1, default 1) */
  readonly volume: number

  /** Preferred voice URI (browser-specific identifier) */
  readonly voiceURI: string | null

  /** Whether to read CLI equivalents after operations (teaching mode) */
  readonly cliTeachingMode: boolean
}

/**
 * Configuration for Speech-to-Text functionality
 */
export interface ISTTSettings {
  /** Whether STT is enabled */
  readonly enabled: boolean

  /** Language code for recognition (e.g., 'en-US') */
  readonly language: string

  /** Whether to use continuous listening mode */
  readonly continuous: boolean

  /** Whether to show interim (partial) results */
  readonly interimResults: boolean

  /** Whether voice commands are enabled */
  readonly voiceCommandsEnabled: boolean
}

/**
 * Combined speech settings
 */
export interface ISpeechSettings {
  readonly tts: ITTSSettings
  readonly stt: ISTTSettings
}

/**
 * Default TTS settings
 */
export const DefaultTTSSettings: ITTSSettings = {
  enabled: false,
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: null,
  cliTeachingMode: false,
}

/**
 * Default STT settings
 */
export const DefaultSTTSettings: ISTTSettings = {
  enabled: false,
  language: 'en-US',
  continuous: false,
  interimResults: true,
  voiceCommandsEnabled: true,
}

/**
 * Speech recognition state machine
 */
export enum SpeechRecognitionState {
  /** Not actively listening */
  Idle = 'idle',
  /** Currently listening for speech */
  Listening = 'listening',
  /** Processing recognized speech */
  Processing = 'processing',
  /** An error occurred */
  Error = 'error',
}

/**
 * Supported voice command actions
 */
export enum VoiceCommandAction {
  Commit = 'commit',
  Push = 'push',
  Pull = 'pull',
  Fetch = 'fetch',
  SwitchBranch = 'switch-branch',
  CreateBranch = 'create-branch',
  StashChanges = 'stash-changes',
  DiscardChanges = 'discard-changes',
  RefreshRepository = 'refresh-repository',
  StopListening = 'stop-listening',
  ReadCommit = 'read-commit',
  ReadDiff = 'read-diff',
}

/**
 * Voice command definition
 */
export interface IVoiceCommand {
  /** Command phrases that trigger this action */
  readonly phrases: ReadonlyArray<string>
  /** Action identifier */
  readonly action: VoiceCommandAction
  /** Description for help/documentation */
  readonly description: string
}

/**
 * Result from speech recognition
 */
export interface ISpeechRecognitionResult {
  /** The recognized text */
  readonly transcript: string
  /** Confidence score (0-1) */
  readonly confidence: number
  /** Whether this is a final result or interim */
  readonly isFinal: boolean
}

/**
 * Parsed voice command result
 */
export interface ICommandParseResult {
  /** The recognized action */
  readonly action: VoiceCommandAction
  /** Optional parameters extracted from the command */
  readonly params?: string
}

/**
 * Events emitted by the speech service
 */
export type SpeechServiceEvent =
  | { readonly type: 'tts-start' }
  | { readonly type: 'tts-end' }
  | { readonly type: 'tts-error'; readonly error: Error }
  | { readonly type: 'stt-start' }
  | { readonly type: 'stt-result'; readonly result: ISpeechRecognitionResult }
  | { readonly type: 'stt-end' }
  | { readonly type: 'stt-error'; readonly error: Error }
  | {
      readonly type: 'command-recognized'
      readonly command: VoiceCommandAction
      readonly params?: string
    }

/**
 * Available voice information
 */
export interface IVoiceInfo {
  /** Display name of the voice */
  readonly name: string
  /** Unique identifier for the voice */
  readonly voiceURI: string
  /** Language code (e.g., 'en-US') */
  readonly lang: string
  /** Whether this is a local voice (not requiring network) */
  readonly localService: boolean
  /** Whether this is the system default voice */
  readonly default: boolean
}

/**
 * Git operations that can be narrated with CLI equivalents
 */
export enum GitOperation {
  Commit = 'commit',
  Push = 'push',
  Pull = 'pull',
  Fetch = 'fetch',
  Checkout = 'checkout',
  CreateBranch = 'create-branch',
  DeleteBranch = 'delete-branch',
  Merge = 'merge',
  Rebase = 'rebase',
  Stash = 'stash',
  StashPop = 'stash-pop',
  StageFile = 'stage-file',
  UnstageFile = 'unstage-file',
  DiscardFile = 'discard-file',
  CherryPick = 'cherry-pick',
  Revert = 'revert',
  Reset = 'reset',
  Clone = 'clone',
  Init = 'init',
}

/**
 * Context for CLI narration - provides dynamic values for command generation
 */
export interface IOperationContext {
  /** Commit message (for commit operations) */
  readonly message?: string
  /** Branch name */
  readonly branch?: string
  /** Remote name (e.g., 'origin') */
  readonly remote?: string
  /** File path */
  readonly filePath?: string
  /** Commit SHA */
  readonly sha?: string
  /** Repository URL (for clone) */
  readonly url?: string
  /** Number of commits (for reset) */
  readonly count?: number
}

/**
 * CLI narration result
 */
export interface ICLINarration {
  /** The git operation performed */
  readonly operation: GitOperation
  /** The equivalent CLI command */
  readonly cliCommand: string
  /** Human-readable description of what the command does */
  readonly description: string
}

/**
 * Supported languages for speech recognition
 */
export const SupportedLanguages: ReadonlyArray<{
  code: string
  name: string
}> = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'en-AU', name: 'English (Australia)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
]
