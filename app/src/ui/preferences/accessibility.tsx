import * as React from 'react'
import { DialogContent } from '../dialog'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { Row } from '../lib/row'
import { Select } from '../lib/select'
import { Button } from '../lib/button'
import {
  ITTSSettings,
  ISTTSettings,
  IVoiceInfo,
  SupportedLanguages,
  DefaultTTSSettings,
  DefaultSTTSettings,
} from '../../lib/speech/speech-types'
import { getSpeechService } from '../../lib/speech/speech-service'
import { getVoiceCommandsHelp } from '../../lib/speech/speech-commands'

interface IAccessibilityPreferencesProps {
  readonly ttsSettings: ITTSSettings
  readonly sttSettings: ISTTSettings
  readonly onTTSSettingsChanged: (settings: Partial<ITTSSettings>) => void
  readonly onSTTSettingsChanged: (settings: Partial<ISTTSettings>) => void
}

interface IAccessibilityPreferencesState {
  readonly availableVoices: ReadonlyArray<IVoiceInfo>
  readonly isTTSSupported: boolean
  readonly isSTTSupported: boolean
  readonly isTestingSpeech: boolean
  readonly showVoiceCommandsHelp: boolean
}

export class Accessibility extends React.Component<
  IAccessibilityPreferencesProps,
  IAccessibilityPreferencesState
> {
  private speechService = getSpeechService()

  public constructor(props: IAccessibilityPreferencesProps) {
    super(props)

    this.state = {
      availableVoices: [],
      isTTSSupported: this.speechService.isTTSSupported(),
      isSTTSupported: this.speechService.isSTTSupported(),
      isTestingSpeech: false,
      showVoiceCommandsHelp: false,
    }
  }

  public componentDidMount() {
    // Load available voices (may be async in some browsers)
    this.loadVoices()

    // Voices might load after component mounts
    if (window.speechSynthesis) {
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        this.loadVoices
      )
    }
  }

  public componentWillUnmount() {
    if (window.speechSynthesis) {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        this.loadVoices
      )
    }
  }

  private loadVoices = () => {
    this.setState({
      availableVoices: this.speechService.getAvailableVoices(),
    })
  }

  // TTS Settings Handlers
  private onTTSEnabledChanged = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onTTSSettingsChanged({ enabled: event.currentTarget.checked })
  }

  private onCLITeachingModeChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onTTSSettingsChanged({
      cliTeachingMode: event.currentTarget.checked,
    })
  }

  private onVoiceChanged = (event: React.FormEvent<HTMLSelectElement>) => {
    const voiceURI = event.currentTarget.value || null
    this.props.onTTSSettingsChanged({ voiceURI })
  }

  private onRateChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const rate = parseFloat(event.currentTarget.value)
    this.props.onTTSSettingsChanged({ rate })
  }

  private onVolumeChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.currentTarget.value)
    this.props.onTTSSettingsChanged({ volume })
  }

  private onPitchChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const pitch = parseFloat(event.currentTarget.value)
    this.props.onTTSSettingsChanged({ pitch })
  }

  // STT Settings Handlers
  private onSTTEnabledChanged = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onSTTSettingsChanged({ enabled: event.currentTarget.checked })
  }

  private onLanguageChanged = (event: React.FormEvent<HTMLSelectElement>) => {
    this.props.onSTTSettingsChanged({ language: event.currentTarget.value })
  }

  private onContinuousChanged = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onSTTSettingsChanged({ continuous: event.currentTarget.checked })
  }

  private onVoiceCommandsEnabledChanged = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onSTTSettingsChanged({
      voiceCommandsEnabled: event.currentTarget.checked,
    })
  }

  // Actions
  private onTestSpeech = () => {
    this.setState({ isTestingSpeech: true })

    const testMessage = this.props.ttsSettings.cliTeachingMode
      ? 'Testing text to speech. Command: git status'
      : 'Testing text to speech in GitHub Desktop.'

    this.speechService.speak(testMessage)

    // Reset state after speech (approximate duration)
    setTimeout(() => {
      this.setState({ isTestingSpeech: false })
    }, 4000)
  }

  private onStopSpeech = () => {
    this.speechService.stopSpeaking()
    this.setState({ isTestingSpeech: false })
  }

  private toggleVoiceCommandsHelp = () => {
    this.setState(state => ({
      showVoiceCommandsHelp: !state.showVoiceCommandsHelp,
    }))
  }

  public render() {
    return (
      <DialogContent>
        {this.renderTTSSettings()}
        {this.renderSTTSettings()}
      </DialogContent>
    )
  }

  private renderTTSSettings() {
    const { ttsSettings } = this.props
    const { isTTSSupported, availableVoices, isTestingSpeech } = this.state

    if (!isTTSSupported) {
      return (
        <div className="advanced-section">
          <h2>Text-to-Speech</h2>
          <p className="git-settings-description">
            Text-to-Speech is not supported in your environment.
          </p>
        </div>
      )
    }

    return (
      <div className="advanced-section">
        <h2>Text-to-Speech</h2>
        <Checkbox
          label="Enable text-to-speech"
          value={ttsSettings.enabled ? CheckboxValue.On : CheckboxValue.Off}
          onChange={this.onTTSEnabledChanged}
        />
        <p className="git-settings-description">
          Read content aloud using your system's speech synthesis.
        </p>

        {ttsSettings.enabled && (
          <>
            <Row className="accessibility-row">
              <Checkbox
                label="CLI Teaching Mode"
                value={
                  ttsSettings.cliTeachingMode
                    ? CheckboxValue.On
                    : CheckboxValue.Off
                }
                onChange={this.onCLITeachingModeChanged}
              />
            </Row>
            <p className="git-settings-description">
              When enabled, announces the equivalent git command after each
              operation. Great for learning the command line!
            </p>

            <Row className="accessibility-row">
              <Select
                label="Voice"
                value={ttsSettings.voiceURI || ''}
                onChange={this.onVoiceChanged}
              >
                <option value="">System Default</option>
                {availableVoices.map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                    {voice.localService ? '' : ' [Online]'}
                  </option>
                ))}
              </Select>
            </Row>

            <Row className="accessibility-row">
              <label className="accessibility-slider-label">
                Speed: {ttsSettings.rate.toFixed(1)}x
                <input
                  type="range"
                  className="accessibility-slider"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsSettings.rate}
                  onChange={this.onRateChanged}
                />
              </label>
            </Row>

            <Row className="accessibility-row">
              <label className="accessibility-slider-label">
                Volume: {Math.round(ttsSettings.volume * 100)}%
                <input
                  type="range"
                  className="accessibility-slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={ttsSettings.volume}
                  onChange={this.onVolumeChanged}
                />
              </label>
            </Row>

            <Row className="accessibility-row">
              <label className="accessibility-slider-label">
                Pitch: {ttsSettings.pitch.toFixed(1)}
                <input
                  type="range"
                  className="accessibility-slider"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsSettings.pitch}
                  onChange={this.onPitchChanged}
                />
              </label>
            </Row>

            <Row className="accessibility-row">
              {isTestingSpeech ? (
                <Button onClick={this.onStopSpeech}>Stop</Button>
              ) : (
                <Button onClick={this.onTestSpeech}>Test Speech</Button>
              )}
            </Row>
          </>
        )}
      </div>
    )
  }

  private renderSTTSettings() {
    const { sttSettings } = this.props
    const { isSTTSupported, showVoiceCommandsHelp } = this.state

    if (!isSTTSupported) {
      return (
        <div className="advanced-section">
          <h2>Speech Recognition</h2>
          <p className="git-settings-description">
            Speech recognition is not supported in your environment.
          </p>
        </div>
      )
    }

    return (
      <div className="advanced-section">
        <h2>Speech Recognition</h2>
        <Checkbox
          label="Enable voice input"
          value={sttSettings.enabled ? CheckboxValue.On : CheckboxValue.Off}
          onChange={this.onSTTEnabledChanged}
        />
        <p className="git-settings-description">
          Use your microphone to dictate text and execute voice commands. Click
          the microphone button in the toolbar to start listening.
        </p>

        {sttSettings.enabled && (
          <>
            <Row className="accessibility-row">
              <Select
                label="Language"
                value={sttSettings.language}
                onChange={this.onLanguageChanged}
              >
                {SupportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </Select>
            </Row>

            <Row className="accessibility-row">
              <Checkbox
                label="Enable voice commands"
                value={
                  sttSettings.voiceCommandsEnabled
                    ? CheckboxValue.On
                    : CheckboxValue.Off
                }
                onChange={this.onVoiceCommandsEnabledChanged}
              />
            </Row>
            <p className="git-settings-description">
              When enabled, recognized speech will be parsed for commands like
              "commit", "push", "pull", etc.
            </p>

            <Row className="accessibility-row">
              <Checkbox
                label="Continuous listening mode"
                value={
                  sttSettings.continuous ? CheckboxValue.On : CheckboxValue.Off
                }
                onChange={this.onContinuousChanged}
              />
            </Row>
            <p className="git-settings-description">
              Keep listening after processing each phrase until manually
              stopped.
            </p>

            <Row className="accessibility-row">
              <Button onClick={this.toggleVoiceCommandsHelp}>
                {showVoiceCommandsHelp
                  ? 'Hide Voice Commands'
                  : 'Show Voice Commands'}
              </Button>
            </Row>

            {showVoiceCommandsHelp && this.renderVoiceCommandsHelp()}
          </>
        )}
      </div>
    )
  }

  private renderVoiceCommandsHelp() {
    const commands = getVoiceCommandsHelp()

    return (
      <div className="voice-commands-help">
        <h3>Available Voice Commands</h3>
        <table className="voice-commands-table">
          <thead>
            <tr>
              <th>Command</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {commands.map(cmd => (
              <tr key={cmd.command}>
                <td>"{cmd.command}"</td>
                <td>{cmd.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="git-settings-description">
          Tip: You can also say "stop listening" or "stop" to stop voice
          recognition.
        </p>
      </div>
    )
  }
}
