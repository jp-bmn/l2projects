/**
 * Web Speech API module for GitHub Desktop
 *
 * This module provides Text-to-Speech (TTS) and Speech-to-Text (STT)
 * functionality using the Web Speech API.
 */

// Types
export {
  ITTSSettings,
  ISTTSettings,
  ISpeechSettings,
  DefaultTTSSettings,
  DefaultSTTSettings,
  SpeechRecognitionState,
  VoiceCommandAction,
  IVoiceCommand,
  ISpeechRecognitionResult,
  ICommandParseResult,
  SpeechServiceEvent,
  IVoiceInfo,
  GitOperation,
  IOperationContext,
  ICLINarration,
  SupportedLanguages,
} from './speech-types'

// Speech Service
export {
  SpeechService,
  getSpeechService,
  disposeSpeechService,
} from './speech-service'

// Voice Commands
export {
  VoiceCommands,
  parseVoiceCommand,
  getVoiceCommandsHelp,
  isStopCommand,
} from './speech-commands'

// CLI Narrator
export {
  getCLINarration,
  formatNarrationForSpeech,
  getOperationAnnouncement,
} from './cli-narrator'
