import { Emitter, Disposable } from 'event-kit'
import {
  ISpeechSettings,
  ITTSSettings,
  ISTTSettings,
  DefaultTTSSettings,
  DefaultSTTSettings,
  SpeechRecognitionState,
  SpeechServiceEvent,
  IVoiceInfo,
  ISpeechRecognitionResult,
  GitOperation,
  IOperationContext,
} from './speech-types'
import { parseVoiceCommand, isStopCommand } from './speech-commands'
import {
  getCLINarration,
  formatNarrationForSpeech,
  getOperationAnnouncement,
} from './cli-narrator'
import { getObject, setObject } from '../local-storage'

const SpeechSettingsKey = 'speech-settings'

/**
 * SpeechRecognition type for Chromium/Electron
 */
type SpeechRecognitionType = typeof window.SpeechRecognition

/**
 * Get the SpeechRecognition constructor (with webkit prefix for Chromium)
 */
function getSpeechRecognitionConstructor(): SpeechRecognitionType | null {
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition
  }
  if ('webkitSpeechRecognition' in window) {
    return (window as any).webkitSpeechRecognition
  }
  return null
}

/**
 * Centralized service for managing Web Speech API functionality.
 *
 * This service provides:
 * - Text-to-Speech (TTS) for reading content aloud
 * - Speech-to-Text (STT) for voice input and commands
 * - CLI teaching mode for educational narration
 *
 * The service is a singleton and should be accessed via getSpeechService().
 */
export class SpeechService {
  private readonly emitter = new Emitter()
  private ttsSettings: ITTSSettings = DefaultTTSSettings
  private sttSettings: ISTTSettings = DefaultSTTSettings

  private recognition: SpeechRecognition | null = null
  private recognitionState: SpeechRecognitionState = SpeechRecognitionState.Idle
  private synthesis: SpeechSynthesis | null = null
  private availableVoices: IVoiceInfo[] = []

  private currentUtterance: SpeechSynthesisUtterance | null = null
  private commandModeActive = false
  private lastAnnouncement: string = ''

  public constructor() {
    this.loadSettings()
    this.initializeSynthesis()
    this.initializeRecognition()
  }

  // ==================== Initialization ====================

  private loadSettings(): void {
    const saved = getObject<ISpeechSettings>(SpeechSettingsKey)
    if (saved) {
      this.ttsSettings = { ...DefaultTTSSettings, ...saved.tts }
      this.sttSettings = { ...DefaultSTTSettings, ...saved.stt }
    }
  }

  private saveSettings(): void {
    setObject(SpeechSettingsKey, {
      tts: this.ttsSettings,
      stt: this.sttSettings,
    })
  }

  private initializeSynthesis(): void {
    if (!this.isTTSSupported()) {
      return
    }

    this.synthesis = window.speechSynthesis

    // Voices may load asynchronously in some browsers
    const loadVoicesHandler = () => this.loadVoices()

    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.addEventListener('voiceschanged', loadVoicesHandler)
    }

    // Also try to load immediately (some browsers have voices ready)
    this.loadVoices()
  }

  private loadVoices(): void {
    if (!this.synthesis) {
      return
    }

    const voices = this.synthesis.getVoices()
    this.availableVoices = voices.map(voice => ({
      name: voice.name,
      voiceURI: voice.voiceURI,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
    }))
  }

  private initializeRecognition(): void {
    if (!this.isSTTSupported()) {
      return
    }

    const SpeechRecognitionAPI = getSpeechRecognitionConstructor()
    if (!SpeechRecognitionAPI) {
      return
    }

    this.recognition = new SpeechRecognitionAPI()
    this.configureRecognition()
  }

  private configureRecognition(): void {
    if (!this.recognition) {
      return
    }

    this.recognition.continuous = this.sttSettings.continuous
    this.recognition.interimResults = this.sttSettings.interimResults
    this.recognition.lang = this.sttSettings.language

    this.recognition.onstart = () => {
      this.recognitionState = SpeechRecognitionState.Listening
      this.emit({ type: 'stt-start' })
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleRecognitionResult(event)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // 'no-speech' and 'aborted' are not really errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.recognitionState = SpeechRecognitionState.Error
        this.emit({ type: 'stt-error', error: new Error(event.error) })
      }
    }

    this.recognition.onend = () => {
      const wasListening =
        this.recognitionState === SpeechRecognitionState.Listening
      this.recognitionState = SpeechRecognitionState.Idle
      this.emit({ type: 'stt-end' })

      // Auto-restart if in continuous mode and we didn't intentionally stop
      if (
        wasListening &&
        this.sttSettings.continuous &&
        this.commandModeActive
      ) {
        this.startListening(true)
      }
    }
  }

  // ==================== TTS Methods ====================

  /**
   * Check if Text-to-Speech is supported in this environment.
   */
  public isTTSSupported(): boolean {
    return 'speechSynthesis' in window
  }

  /**
   * Check if TTS is both supported and enabled.
   */
  public isTTSEnabled(): boolean {
    return this.ttsSettings.enabled && this.isTTSSupported()
  }

  /**
   * Get current TTS settings.
   */
  public getTTSSettings(): ITTSSettings {
    return this.ttsSettings
  }

  /**
   * Update TTS settings.
   */
  public setTTSSettings(settings: Partial<ITTSSettings>): void {
    this.ttsSettings = { ...this.ttsSettings, ...settings }
    this.saveSettings()
  }

  /**
   * Get available voices for TTS.
   */
  public getAvailableVoices(): ReadonlyArray<IVoiceInfo> {
    return this.availableVoices
  }

  /**
   * Speak the given text using TTS.
   *
   * @param text The text to speak
   * @param options Optional override settings for this utterance
   */
  public speak(text: string, options?: Partial<ITTSSettings>): void {
    if (!this.synthesis || !this.isTTSEnabled()) {
      return
    }

    // Cancel any ongoing speech
    this.stopSpeaking()

    const settings = { ...this.ttsSettings, ...options }
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = settings.volume

    // Find and set the preferred voice
    if (settings.voiceURI) {
      const voice = this.synthesis
        .getVoices()
        .find(v => v.voiceURI === settings.voiceURI)
      if (voice) {
        utterance.voice = voice
      }
    }

    utterance.onstart = () => {
      this.emit({ type: 'tts-start' })
    }

    utterance.onend = () => {
      this.currentUtterance = null
      this.emit({ type: 'tts-end' })
    }

    utterance.onerror = event => {
      this.currentUtterance = null
      // 'canceled' is not an error, just means we stopped it
      if (event.error !== 'canceled') {
        this.emit({ type: 'tts-error', error: new Error(event.error) })
      }
    }

    this.currentUtterance = utterance
    this.synthesis.speak(utterance)
  }

  /**
   * Stop any ongoing speech.
   */
  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }
  }

  /**
   * Check if TTS is currently speaking.
   */
  public isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false
  }

  /**
   * Announce a git operation with optional CLI narration.
   *
   * @param operation The git operation that was performed
   * @param context Context for generating the announcement
   */
  public announceOperation(
    operation: GitOperation,
    context: IOperationContext
  ): void {
    if (!this.isTTSEnabled()) {
      return
    }

    const announcement = getOperationAnnouncement(operation, context)

    // Don't repeat the same announcement
    if (announcement === this.lastAnnouncement) {
      return
    }
    this.lastAnnouncement = announcement

    if (this.ttsSettings.cliTeachingMode) {
      const narration = getCLINarration(operation, context)
      const cliNarration = formatNarrationForSpeech(narration)
      this.speak(`${announcement}. ${cliNarration}`)
    } else {
      this.speak(announcement)
    }
  }

  /**
   * Read the CLI equivalent for an operation (teaching mode).
   */
  public narrateCliCommand(
    operation: GitOperation,
    context: IOperationContext
  ): void {
    if (!this.isTTSEnabled()) {
      return
    }

    const narration = getCLINarration(operation, context)
    this.speak(formatNarrationForSpeech(narration))
  }

  // ==================== STT Methods ====================

  /**
   * Check if Speech-to-Text is supported in this environment.
   */
  public isSTTSupported(): boolean {
    return getSpeechRecognitionConstructor() !== null
  }

  /**
   * Check if STT is both supported and enabled.
   */
  public isSTTEnabled(): boolean {
    return this.sttSettings.enabled && this.isSTTSupported()
  }

  /**
   * Get current STT settings.
   */
  public getSTTSettings(): ISTTSettings {
    return this.sttSettings
  }

  /**
   * Update STT settings.
   */
  public setSTTSettings(settings: Partial<ISTTSettings>): void {
    this.sttSettings = { ...this.sttSettings, ...settings }
    this.saveSettings()

    // Update recognition instance if it exists
    this.configureRecognition()
  }

  /**
   * Get the current recognition state.
   */
  public getRecognitionState(): SpeechRecognitionState {
    return this.recognitionState
  }

  /**
   * Start listening for speech input.
   *
   * @param commandMode If true, parse results as voice commands
   */
  public startListening(commandMode = false): void {
    if (!this.recognition || !this.isSTTEnabled()) {
      return
    }

    if (this.recognitionState === SpeechRecognitionState.Listening) {
      return
    }

    this.commandModeActive = commandMode

    try {
      this.recognition.start()
    } catch (error) {
      // Recognition may already be running
      if (error instanceof DOMException && error.name === 'InvalidStateError') {
        // Already running, that's fine
      } else {
        throw error
      }
    }
  }

  /**
   * Stop listening for speech input.
   */
  public stopListening(): void {
    if (this.recognition) {
      this.commandModeActive = false
      this.recognition.stop()
    }
  }

  /**
   * Check if currently listening for speech.
   */
  public isListening(): boolean {
    return this.recognitionState === SpeechRecognitionState.Listening
  }

  /**
   * Toggle listening state.
   */
  public toggleListening(commandMode = false): void {
    if (this.isListening()) {
      this.stopListening()
    } else {
      this.startListening(commandMode)
    }
  }

  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const lastResultIndex = event.results.length - 1
    const lastResult = event.results[lastResultIndex]
    const transcript = lastResult[0].transcript
    const confidence = lastResult[0].confidence
    const isFinal = lastResult.isFinal

    const result: ISpeechRecognitionResult = {
      transcript,
      confidence,
      isFinal,
    }

    this.emit({ type: 'stt-result', result })

    // Check for stop command first
    if (isFinal && isStopCommand(transcript)) {
      this.stopListening()
      return
    }

    // If in command mode and we have a final result, try to parse as command
    if (
      this.commandModeActive &&
      this.sttSettings.voiceCommandsEnabled &&
      isFinal
    ) {
      const command = parseVoiceCommand(transcript)
      if (command) {
        this.emit({
          type: 'command-recognized',
          command: command.action,
          params: command.params,
        })
      }
    }
  }

  // ==================== Event Handling ====================

  /**
   * Subscribe to speech service events.
   *
   * @param callback Function to call when events occur
   * @returns Disposable to unsubscribe
   */
  public onEvent(callback: (event: SpeechServiceEvent) => void): Disposable {
    return this.emitter.on('speech-event', callback)
  }

  private emit(event: SpeechServiceEvent): void {
    this.emitter.emit('speech-event', event)
  }

  /**
   * Clean up resources.
   */
  public dispose(): void {
    this.stopSpeaking()
    this.stopListening()
    this.emitter.dispose()
  }
}

// ==================== Singleton Instance ====================

let speechServiceInstance: SpeechService | null = null

/**
 * Get the singleton SpeechService instance.
 *
 * Creates the instance on first call.
 */
export function getSpeechService(): SpeechService {
  if (!speechServiceInstance) {
    speechServiceInstance = new SpeechService()
  }
  return speechServiceInstance
}

/**
 * Dispose of the singleton instance (for testing).
 */
export function disposeSpeechService(): void {
  if (speechServiceInstance) {
    speechServiceInstance.dispose()
    speechServiceInstance = null
  }
}
