import {
  VoiceCommandAction,
  IVoiceCommand,
  ICommandParseResult,
} from './speech-types'

/**
 * Voice command definitions for GitHub Desktop
 *
 * Each command has multiple phrases that can trigger it,
 * allowing for natural variation in how users speak commands.
 */
export const VoiceCommands: ReadonlyArray<IVoiceCommand> = [
  {
    phrases: ['commit', 'commit changes', 'make commit', 'create commit'],
    action: VoiceCommandAction.Commit,
    description: 'Commit staged changes',
  },
  {
    phrases: ['push', 'push changes', 'push to remote', 'push commits'],
    action: VoiceCommandAction.Push,
    description: 'Push commits to remote repository',
  },
  {
    phrases: ['pull', 'pull changes', 'pull from remote', 'get changes'],
    action: VoiceCommandAction.Pull,
    description: 'Pull changes from remote repository',
  },
  {
    phrases: ['fetch', 'fetch changes', 'fetch from remote', 'check for updates'],
    action: VoiceCommandAction.Fetch,
    description: 'Fetch changes from remote without merging',
  },
  {
    phrases: [
      'switch branch',
      'change branch',
      'checkout',
      'go to branch',
      'select branch',
    ],
    action: VoiceCommandAction.SwitchBranch,
    description: 'Switch to another branch',
  },
  {
    phrases: [
      'create branch',
      'new branch',
      'make branch',
      'add branch',
      'branch',
    ],
    action: VoiceCommandAction.CreateBranch,
    description: 'Create a new branch',
  },
  {
    phrases: [
      'stash',
      'stash changes',
      'save changes',
      'stash work',
      'save work',
    ],
    action: VoiceCommandAction.StashChanges,
    description: 'Stash current changes',
  },
  {
    phrases: [
      'discard',
      'discard changes',
      'undo changes',
      'revert changes',
      'throw away changes',
    ],
    action: VoiceCommandAction.DiscardChanges,
    description: 'Discard uncommitted changes',
  },
  {
    phrases: [
      'refresh',
      'refresh repository',
      'update status',
      'reload',
      'sync',
    ],
    action: VoiceCommandAction.RefreshRepository,
    description: 'Refresh repository status',
  },
  {
    phrases: [
      'stop listening',
      'stop',
      'cancel',
      'nevermind',
      'never mind',
      'quit listening',
    ],
    action: VoiceCommandAction.StopListening,
    description: 'Stop voice recognition',
  },
  {
    phrases: [
      'read commit',
      'read the commit',
      'read commit message',
      'what is the commit',
    ],
    action: VoiceCommandAction.ReadCommit,
    description: 'Read the selected commit message aloud',
  },
  {
    phrases: [
      'read diff',
      'read the diff',
      'read changes',
      'what changed',
      'summarize changes',
    ],
    action: VoiceCommandAction.ReadDiff,
    description: 'Read the diff summary aloud',
  },
]

/**
 * Parse a transcript to identify voice commands.
 *
 * This function performs fuzzy matching against known command phrases
 * and extracts any parameters that follow the command.
 *
 * @param transcript The speech recognition transcript to parse
 * @returns The parsed command and parameters, or null if no command matched
 */
export function parseVoiceCommand(
  transcript: string
): ICommandParseResult | null {
  const normalized = transcript.toLowerCase().trim()

  // Try exact prefix matching first
  for (const command of VoiceCommands) {
    for (const phrase of command.phrases) {
      if (normalized.startsWith(phrase)) {
        // Extract any parameters after the command phrase
        const params = normalized.slice(phrase.length).trim() || undefined
        return {
          action: command.action,
          params,
        }
      }
    }
  }

  // Try fuzzy matching for common variations
  const fuzzyMatches = getFuzzyMatches(normalized)
  if (fuzzyMatches) {
    return fuzzyMatches
  }

  return null
}

/**
 * Attempt fuzzy matching for common speech variations.
 *
 * This handles cases where the speech recognition might produce
 * slightly different output than our exact phrases.
 */
function getFuzzyMatches(normalized: string): ICommandParseResult | null {
  // Handle "I want to X" or "please X" patterns
  const politePatterns = [
    /^(?:i want to |please |can you |could you )(.+)$/,
    /^(?:let's |let me )(.+)$/,
  ]

  for (const pattern of politePatterns) {
    const match = normalized.match(pattern)
    if (match) {
      // Recursively try to parse the extracted command
      const result = parseVoiceCommand(match[1])
      if (result) {
        return result
      }
    }
  }

  // Handle common misrecognitions
  const corrections: Record<string, string> = {
    'comment': 'commit',
    'comments': 'commit',
    'committing': 'commit',
    'bush': 'push',
    'pushing': 'push',
    'pool': 'pull',
    'pulling': 'pull',
    'fresh': 'fetch',
    'fetching': 'fetch',
    'branch out': 'create branch',
    'stashing': 'stash',
    'discarding': 'discard',
  }

  for (const [misrecognition, correction] of Object.entries(corrections)) {
    if (normalized.includes(misrecognition)) {
      const corrected = normalized.replace(misrecognition, correction)
      const result = parseVoiceCommand(corrected)
      if (result) {
        return result
      }
    }
  }

  return null
}

/**
 * Get all available voice commands for display in help/settings.
 */
export function getVoiceCommandsHelp(): ReadonlyArray<{
  command: string
  description: string
}> {
  return VoiceCommands.map(cmd => ({
    command: cmd.phrases[0],
    description: cmd.description,
  }))
}

/**
 * Check if a transcript contains a stop command.
 * This is used for quick-exit from listening mode.
 */
export function isStopCommand(transcript: string): boolean {
  const result = parseVoiceCommand(transcript)
  return result?.action === VoiceCommandAction.StopListening
}
