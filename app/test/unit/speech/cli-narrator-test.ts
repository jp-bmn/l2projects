import {
  getCLINarration,
  formatNarrationForSpeech,
  getOperationAnnouncement,
} from '../../../src/lib/speech/cli-narrator'
import { GitOperation } from '../../../src/lib/speech/speech-types'

describe('cli-narrator', () => {
  describe('getCLINarration', () => {
    describe('commit', () => {
      it('generates commit command with message', () => {
        const narration = getCLINarration(GitOperation.Commit, {
          message: 'Fix login bug',
        })
        expect(narration.cliCommand).toBe("git commit -m 'Fix login bug'")
        expect(narration.description).toContain('commit')
      })

      it('escapes single quotes in message', () => {
        const narration = getCLINarration(GitOperation.Commit, {
          message: "It's a bug fix",
        })
        expect(narration.cliCommand).toContain("\\'")
      })
    })

    describe('push', () => {
      it('generates push command with remote and branch', () => {
        const narration = getCLINarration(GitOperation.Push, {
          remote: 'origin',
          branch: 'main',
        })
        expect(narration.cliCommand).toBe('git push origin main')
      })

      it('uses default remote when not specified', () => {
        const narration = getCLINarration(GitOperation.Push, {
          branch: 'feature',
        })
        expect(narration.cliCommand).toBe('git push origin feature')
      })
    })

    describe('pull', () => {
      it('generates pull command with remote and branch', () => {
        const narration = getCLINarration(GitOperation.Pull, {
          remote: 'upstream',
          branch: 'develop',
        })
        expect(narration.cliCommand).toBe('git pull upstream develop')
      })
    })

    describe('fetch', () => {
      it('generates fetch all command when no remote specified', () => {
        const narration = getCLINarration(GitOperation.Fetch, {})
        expect(narration.cliCommand).toBe('git fetch --all')
      })

      it('generates fetch command with specific remote', () => {
        const narration = getCLINarration(GitOperation.Fetch, {
          remote: 'origin',
        })
        expect(narration.cliCommand).toBe('git fetch origin')
      })
    })

    describe('checkout', () => {
      it('generates checkout command with branch', () => {
        const narration = getCLINarration(GitOperation.Checkout, {
          branch: 'feature-branch',
        })
        expect(narration.cliCommand).toBe('git checkout feature-branch')
      })
    })

    describe('create branch', () => {
      it('generates checkout -b command', () => {
        const narration = getCLINarration(GitOperation.CreateBranch, {
          branch: 'new-feature',
        })
        expect(narration.cliCommand).toBe('git checkout -b new-feature')
      })
    })

    describe('delete branch', () => {
      it('generates branch -d command', () => {
        const narration = getCLINarration(GitOperation.DeleteBranch, {
          branch: 'old-feature',
        })
        expect(narration.cliCommand).toBe('git branch -d old-feature')
      })
    })

    describe('stash', () => {
      it('generates stash command', () => {
        const narration = getCLINarration(GitOperation.Stash, {})
        expect(narration.cliCommand).toBe('git stash')
      })
    })

    describe('stash pop', () => {
      it('generates stash pop command', () => {
        const narration = getCLINarration(GitOperation.StashPop, {})
        expect(narration.cliCommand).toBe('git stash pop')
      })
    })

    describe('stage file', () => {
      it('generates add command with filepath', () => {
        const narration = getCLINarration(GitOperation.StageFile, {
          filePath: 'src/app.ts',
        })
        expect(narration.cliCommand).toBe('git add src/app.ts')
      })
    })

    describe('unstage file', () => {
      it('generates reset HEAD command', () => {
        const narration = getCLINarration(GitOperation.UnstageFile, {
          filePath: 'src/app.ts',
        })
        expect(narration.cliCommand).toBe('git reset HEAD src/app.ts')
      })
    })

    describe('discard file', () => {
      it('generates checkout -- command', () => {
        const narration = getCLINarration(GitOperation.DiscardFile, {
          filePath: 'src/app.ts',
        })
        expect(narration.cliCommand).toBe('git checkout -- src/app.ts')
      })
    })

    describe('cherry-pick', () => {
      it('generates cherry-pick command with SHA', () => {
        const narration = getCLINarration(GitOperation.CherryPick, {
          sha: 'abc1234',
        })
        expect(narration.cliCommand).toBe('git cherry-pick abc1234')
      })
    })

    describe('revert', () => {
      it('generates revert command with SHA', () => {
        const narration = getCLINarration(GitOperation.Revert, {
          sha: 'def5678',
        })
        expect(narration.cliCommand).toBe('git revert def5678')
      })
    })

    describe('merge', () => {
      it('generates merge command with branch', () => {
        const narration = getCLINarration(GitOperation.Merge, {
          branch: 'feature',
        })
        expect(narration.cliCommand).toBe('git merge feature')
      })
    })

    describe('rebase', () => {
      it('generates rebase command with branch', () => {
        const narration = getCLINarration(GitOperation.Rebase, {
          branch: 'main',
        })
        expect(narration.cliCommand).toBe('git rebase main')
      })
    })

    describe('clone', () => {
      it('generates clone command with URL', () => {
        const narration = getCLINarration(GitOperation.Clone, {
          url: 'https://github.com/user/repo.git',
        })
        expect(narration.cliCommand).toBe(
          'git clone https://github.com/user/repo.git'
        )
      })
    })

    describe('init', () => {
      it('generates init command', () => {
        const narration = getCLINarration(GitOperation.Init, {})
        expect(narration.cliCommand).toBe('git init')
      })
    })
  })

  describe('formatNarrationForSpeech', () => {
    it('prefixes with "Command:"', () => {
      const narration = getCLINarration(GitOperation.Stash, {})
      const speech = formatNarrationForSpeech(narration)
      expect(speech).toContain('Command:')
    })

    it('adds comma after git', () => {
      const narration = getCLINarration(GitOperation.Stash, {})
      const speech = formatNarrationForSpeech(narration)
      expect(speech).toContain('git,')
    })

    it('expands -m flag', () => {
      const narration = getCLINarration(GitOperation.Commit, {
        message: 'test',
      })
      const speech = formatNarrationForSpeech(narration)
      expect(speech).toContain('dash m')
    })

    it('expands -b flag', () => {
      const narration = getCLINarration(GitOperation.CreateBranch, {
        branch: 'test',
      })
      const speech = formatNarrationForSpeech(narration)
      expect(speech).toContain('dash b')
    })
  })

  describe('getOperationAnnouncement', () => {
    it('announces commit with message', () => {
      const announcement = getOperationAnnouncement(GitOperation.Commit, {
        message: 'Fix bug',
      })
      expect(announcement).toContain('Committed')
      expect(announcement).toContain('Fix bug')
    })

    it('announces push with remote and branch', () => {
      const announcement = getOperationAnnouncement(GitOperation.Push, {
        remote: 'origin',
        branch: 'main',
      })
      expect(announcement).toContain('Pushed')
      expect(announcement).toContain('origin')
      expect(announcement).toContain('main')
    })

    it('announces pull', () => {
      const announcement = getOperationAnnouncement(GitOperation.Pull, {
        remote: 'origin',
        branch: 'main',
      })
      expect(announcement).toContain('Pulled')
    })

    it('announces fetch', () => {
      const announcement = getOperationAnnouncement(GitOperation.Fetch, {})
      expect(announcement).toContain('Fetched')
    })

    it('announces checkout', () => {
      const announcement = getOperationAnnouncement(GitOperation.Checkout, {
        branch: 'feature',
      })
      expect(announcement).toContain('Switched to branch')
      expect(announcement).toContain('feature')
    })

    it('announces branch creation', () => {
      const announcement = getOperationAnnouncement(GitOperation.CreateBranch, {
        branch: 'new-feature',
      })
      expect(announcement).toContain('Created branch')
      expect(announcement).toContain('new-feature')
    })

    it('announces stash', () => {
      const announcement = getOperationAnnouncement(GitOperation.Stash, {})
      expect(announcement).toContain('Stashed')
    })

    it('truncates long commit messages', () => {
      const longMessage = 'A'.repeat(100)
      const announcement = getOperationAnnouncement(GitOperation.Commit, {
        message: longMessage,
      })
      expect(announcement.length).toBeLessThan(longMessage.length + 20)
      expect(announcement).toContain('...')
    })
  })
})
