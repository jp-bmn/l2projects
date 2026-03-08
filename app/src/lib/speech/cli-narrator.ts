import {
  GitOperation,
  IOperationContext,
  ICLINarration,
} from './speech-types'

/**
 * CLI Narrator - Generates equivalent git CLI commands for operations
 *
 * This module provides educational narration of git operations,
 * helping users learn the command-line equivalents of GUI actions.
 */

/**
 * Generate the CLI command equivalent for a git operation.
 *
 * @param operation The git operation being performed
 * @param context Context providing dynamic values for the command
 * @returns The CLI narration including command and description
 */
export function getCLINarration(
  operation: GitOperation,
  context: IOperationContext
): ICLINarration {
  switch (operation) {
    case GitOperation.Commit:
      return {
        operation,
        cliCommand: getCommitCommand(context),
        description: 'Creates a new commit with staged changes',
      }

    case GitOperation.Push:
      return {
        operation,
        cliCommand: getPushCommand(context),
        description: 'Uploads local commits to the remote repository',
      }

    case GitOperation.Pull:
      return {
        operation,
        cliCommand: getPullCommand(context),
        description: 'Downloads and integrates remote changes',
      }

    case GitOperation.Fetch:
      return {
        operation,
        cliCommand: getFetchCommand(context),
        description: 'Downloads remote changes without merging',
      }

    case GitOperation.Checkout:
      return {
        operation,
        cliCommand: getCheckoutCommand(context),
        description: 'Switches to a different branch',
      }

    case GitOperation.CreateBranch:
      return {
        operation,
        cliCommand: getCreateBranchCommand(context),
        description: 'Creates and switches to a new branch',
      }

    case GitOperation.DeleteBranch:
      return {
        operation,
        cliCommand: getDeleteBranchCommand(context),
        description: 'Removes a branch from the repository',
      }

    case GitOperation.Merge:
      return {
        operation,
        cliCommand: getMergeCommand(context),
        description: 'Combines changes from another branch',
      }

    case GitOperation.Rebase:
      return {
        operation,
        cliCommand: getRebaseCommand(context),
        description: 'Reapplies commits on top of another branch',
      }

    case GitOperation.Stash:
      return {
        operation,
        cliCommand: 'git stash',
        description: 'Temporarily saves uncommitted changes',
      }

    case GitOperation.StashPop:
      return {
        operation,
        cliCommand: 'git stash pop',
        description: 'Restores the most recently stashed changes',
      }

    case GitOperation.StageFile:
      return {
        operation,
        cliCommand: getStageFileCommand(context),
        description: 'Adds file changes to the staging area',
      }

    case GitOperation.UnstageFile:
      return {
        operation,
        cliCommand: getUnstageFileCommand(context),
        description: 'Removes file from the staging area',
      }

    case GitOperation.DiscardFile:
      return {
        operation,
        cliCommand: getDiscardFileCommand(context),
        description: 'Discards uncommitted changes to a file',
      }

    case GitOperation.CherryPick:
      return {
        operation,
        cliCommand: getCherryPickCommand(context),
        description: 'Applies a commit from another branch',
      }

    case GitOperation.Revert:
      return {
        operation,
        cliCommand: getRevertCommand(context),
        description: 'Creates a new commit that undoes a previous commit',
      }

    case GitOperation.Reset:
      return {
        operation,
        cliCommand: getResetCommand(context),
        description: 'Moves the branch pointer to a different commit',
      }

    case GitOperation.Clone:
      return {
        operation,
        cliCommand: getCloneCommand(context),
        description: 'Creates a local copy of a remote repository',
      }

    case GitOperation.Init:
      return {
        operation,
        cliCommand: 'git init',
        description: 'Initializes a new Git repository',
      }

    default:
      return {
        operation,
        cliCommand: 'git --help',
        description: 'Unknown operation',
      }
  }
}

/**
 * Format the CLI narration as a speakable string.
 *
 * @param narration The CLI narration to format
 * @returns A string suitable for TTS
 */
export function formatNarrationForSpeech(narration: ICLINarration): string {
  // Make the command more speakable by expanding common abbreviations
  const speakableCommand = narration.cliCommand
    .replace(/^git /, 'git, ')
    .replace(/-m /, 'dash m, ')
    .replace(/-b /, 'dash b, ')
    .replace(/-d /, 'dash d, ')
    .replace(/-D /, 'dash capital D, ')
    .replace(/-f /, 'dash f, ')
    .replace(/--force/, 'dash dash force')
    .replace(/--all/, 'dash dash all')
    .replace(/--hard/, 'dash dash hard')
    .replace(/--soft/, 'dash dash soft')

  return `Command: ${speakableCommand}`
}

/**
 * Get a brief description suitable for TTS announcement.
 */
export function getOperationAnnouncement(
  operation: GitOperation,
  context: IOperationContext
): string {
  switch (operation) {
    case GitOperation.Commit:
      return `Committed changes${context.message ? `: ${truncate(context.message, 50)}` : ''}`

    case GitOperation.Push:
      return `Pushed to ${context.remote || 'origin'}${context.branch ? `, branch ${context.branch}` : ''}`

    case GitOperation.Pull:
      return `Pulled from ${context.remote || 'origin'}${context.branch ? `, branch ${context.branch}` : ''}`

    case GitOperation.Fetch:
      return `Fetched from ${context.remote || 'all remotes'}`

    case GitOperation.Checkout:
      return `Switched to branch ${context.branch || 'unknown'}`

    case GitOperation.CreateBranch:
      return `Created branch ${context.branch || 'unknown'}`

    case GitOperation.DeleteBranch:
      return `Deleted branch ${context.branch || 'unknown'}`

    case GitOperation.Merge:
      return `Merged branch ${context.branch || 'unknown'}`

    case GitOperation.Rebase:
      return `Rebased onto ${context.branch || 'unknown'}`

    case GitOperation.Stash:
      return 'Stashed changes'

    case GitOperation.StashPop:
      return 'Applied stashed changes'

    case GitOperation.StageFile:
      return `Staged ${context.filePath || 'file'}`

    case GitOperation.UnstageFile:
      return `Unstaged ${context.filePath || 'file'}`

    case GitOperation.DiscardFile:
      return `Discarded changes to ${context.filePath || 'file'}`

    case GitOperation.CherryPick:
      return `Cherry-picked commit ${truncate(context.sha || '', 7)}`

    case GitOperation.Revert:
      return `Reverted commit ${truncate(context.sha || '', 7)}`

    case GitOperation.Reset:
      return `Reset to ${context.sha ? `commit ${truncate(context.sha, 7)}` : 'previous state'}`

    case GitOperation.Clone:
      return `Cloned repository`

    case GitOperation.Init:
      return 'Initialized new repository'

    default:
      return 'Operation completed'
  }
}

// Helper functions for generating specific commands

function getCommitCommand(context: IOperationContext): string {
  const message = context.message || 'Your commit message'
  // Escape single quotes in the message
  const escapedMessage = message.replace(/'/g, "'\\''")
  return `git commit -m '${escapedMessage}'`
}

function getPushCommand(context: IOperationContext): string {
  const remote = context.remote || 'origin'
  const branch = context.branch || '<branch-name>'
  return `git push ${remote} ${branch}`
}

function getPullCommand(context: IOperationContext): string {
  const remote = context.remote || 'origin'
  const branch = context.branch || '<branch-name>'
  return `git pull ${remote} ${branch}`
}

function getFetchCommand(context: IOperationContext): string {
  if (context.remote) {
    return `git fetch ${context.remote}`
  }
  return 'git fetch --all'
}

function getCheckoutCommand(context: IOperationContext): string {
  const branch = context.branch || '<branch-name>'
  return `git checkout ${branch}`
}

function getCreateBranchCommand(context: IOperationContext): string {
  const branch = context.branch || '<new-branch-name>'
  return `git checkout -b ${branch}`
}

function getDeleteBranchCommand(context: IOperationContext): string {
  const branch = context.branch || '<branch-name>'
  return `git branch -d ${branch}`
}

function getMergeCommand(context: IOperationContext): string {
  const branch = context.branch || '<branch-name>'
  return `git merge ${branch}`
}

function getRebaseCommand(context: IOperationContext): string {
  const branch = context.branch || '<branch-name>'
  return `git rebase ${branch}`
}

function getStageFileCommand(context: IOperationContext): string {
  const filePath = context.filePath || '<file-path>'
  return `git add ${filePath}`
}

function getUnstageFileCommand(context: IOperationContext): string {
  const filePath = context.filePath || '<file-path>'
  return `git reset HEAD ${filePath}`
}

function getDiscardFileCommand(context: IOperationContext): string {
  const filePath = context.filePath || '<file-path>'
  return `git checkout -- ${filePath}`
}

function getCherryPickCommand(context: IOperationContext): string {
  const sha = context.sha || '<commit-sha>'
  return `git cherry-pick ${sha}`
}

function getRevertCommand(context: IOperationContext): string {
  const sha = context.sha || '<commit-sha>'
  return `git revert ${sha}`
}

function getResetCommand(context: IOperationContext): string {
  if (context.count) {
    return `git reset --soft HEAD~${context.count}`
  }
  if (context.sha) {
    return `git reset --soft ${context.sha}`
  }
  return 'git reset --soft HEAD~1'
}

function getCloneCommand(context: IOperationContext): string {
  const url = context.url || '<repository-url>'
  return `git clone ${url}`
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength - 3) + '...'
}
