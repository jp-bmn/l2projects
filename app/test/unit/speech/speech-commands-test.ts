import {
  parseVoiceCommand,
  getVoiceCommandsHelp,
  isStopCommand,
} from '../../../src/lib/speech/speech-commands'
import { VoiceCommandAction } from '../../../src/lib/speech/speech-types'

describe('speech-commands', () => {
  describe('parseVoiceCommand', () => {
    describe('exact matches', () => {
      it('recognizes "commit" command', () => {
        const result = parseVoiceCommand('commit')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })

      it('recognizes "commit changes" command', () => {
        const result = parseVoiceCommand('commit changes')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })

      it('recognizes "push" command', () => {
        const result = parseVoiceCommand('push')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Push)
      })

      it('recognizes "pull" command', () => {
        const result = parseVoiceCommand('pull')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Pull)
      })

      it('recognizes "fetch" command', () => {
        const result = parseVoiceCommand('fetch')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Fetch)
      })

      it('recognizes "switch branch" command', () => {
        const result = parseVoiceCommand('switch branch')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.SwitchBranch)
      })

      it('recognizes "create branch" command', () => {
        const result = parseVoiceCommand('create branch')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.CreateBranch)
      })

      it('recognizes "stash" command', () => {
        const result = parseVoiceCommand('stash')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.StashChanges)
      })

      it('recognizes "refresh" command', () => {
        const result = parseVoiceCommand('refresh')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.RefreshRepository)
      })

      it('recognizes "stop listening" command', () => {
        const result = parseVoiceCommand('stop listening')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.StopListening)
      })
    })

    describe('case insensitivity', () => {
      it('matches uppercase input', () => {
        const result = parseVoiceCommand('COMMIT')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })

      it('matches mixed case input', () => {
        const result = parseVoiceCommand('Push Changes')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Push)
      })
    })

    describe('whitespace handling', () => {
      it('trims leading whitespace', () => {
        const result = parseVoiceCommand('  commit')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })

      it('trims trailing whitespace', () => {
        const result = parseVoiceCommand('commit  ')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })
    })

    describe('polite patterns', () => {
      it('recognizes "please commit" pattern', () => {
        const result = parseVoiceCommand('please commit')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })

      it('recognizes "I want to push" pattern', () => {
        const result = parseVoiceCommand('I want to push')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Push)
      })

      it('recognizes "can you pull" pattern', () => {
        const result = parseVoiceCommand('can you pull')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Pull)
      })

      it('recognizes "let me stash" pattern', () => {
        const result = parseVoiceCommand("let me stash")
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.StashChanges)
      })
    })

    describe('misrecognition corrections', () => {
      it('corrects "comment" to "commit"', () => {
        const result = parseVoiceCommand('comment')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Commit)
      })

      it('corrects "bush" to "push"', () => {
        const result = parseVoiceCommand('bush')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Push)
      })

      it('corrects "pool" to "pull"', () => {
        const result = parseVoiceCommand('pool')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Pull)
      })

      it('corrects "fresh" to "fetch"', () => {
        const result = parseVoiceCommand('fresh')
        expect(result).not.toBeNull()
        expect(result?.action).toBe(VoiceCommandAction.Fetch)
      })
    })

    describe('unknown commands', () => {
      it('returns null for unrecognized input', () => {
        const result = parseVoiceCommand('random gibberish')
        expect(result).toBeNull()
      })

      it('returns null for empty string', () => {
        const result = parseVoiceCommand('')
        expect(result).toBeNull()
      })
    })
  })

  describe('getVoiceCommandsHelp', () => {
    it('returns an array of command help objects', () => {
      const help = getVoiceCommandsHelp()
      expect(Array.isArray(help)).toBe(true)
      expect(help.length).toBeGreaterThan(0)
    })

    it('each help object has command and description', () => {
      const help = getVoiceCommandsHelp()
      for (const item of help) {
        expect(item.command).toBeDefined()
        expect(typeof item.command).toBe('string')
        expect(item.description).toBeDefined()
        expect(typeof item.description).toBe('string')
      }
    })
  })

  describe('isStopCommand', () => {
    it('returns true for "stop" command', () => {
      expect(isStopCommand('stop')).toBe(true)
    })

    it('returns true for "stop listening" command', () => {
      expect(isStopCommand('stop listening')).toBe(true)
    })

    it('returns true for "cancel" command', () => {
      expect(isStopCommand('cancel')).toBe(true)
    })

    it('returns true for "nevermind" command', () => {
      expect(isStopCommand('nevermind')).toBe(true)
    })

    it('returns false for non-stop commands', () => {
      expect(isStopCommand('commit')).toBe(false)
    })

    it('returns false for unknown input', () => {
      expect(isStopCommand('hello world')).toBe(false)
    })
  })
})
