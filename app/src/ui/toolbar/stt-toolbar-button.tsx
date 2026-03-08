import * as React from 'react'
import { ToolbarButton } from './button'
import * as OcticonSymbol from '../octicons/octicons.generated'
import {
  getSpeechService,
  ISTTSettings,
  SpeechRecognitionState,
  VoiceCommandAction,
} from '../../lib/speech'
import { enableSpeechRecognition } from '../../lib/feature-flag'
import { Disposable } from 'event-kit'
import classNames from 'classnames'

interface ISTTToolbarButtonProps {
  /** Current STT settings */
  readonly sttSettings: ISTTSettings

  /** Called when a voice command is recognized */
  readonly onVoiceCommand: (
    command: VoiceCommandAction,
    params?: string
  ) => void

  /** Called when speech recognition state changes */
  readonly onRecognitionStateChanged?: (state: SpeechRecognitionState) => void
}

interface ISTTToolbarButtonState {
  /** Current recognition state */
  readonly recognitionState: SpeechRecognitionState

  /** Last recognized transcript (for visual feedback) */
  readonly lastTranscript: string
}

/**
 * Toolbar button for Speech-to-Text (voice input) controls.
 *
 * Displays a microphone icon that toggles listening mode.
 * Shows visual feedback when actively listening.
 */
export class STTToolbarButton extends React.Component<
  ISTTToolbarButtonProps,
  ISTTToolbarButtonState
> {
  private speechService = getSpeechService()
  private eventSubscription: Disposable | null = null
  private transcriptClearTimeout: ReturnType<typeof setTimeout> | null = null

  public constructor(props: ISTTToolbarButtonProps) {
    super(props)

    this.state = {
      recognitionState: SpeechRecognitionState.Idle,
      lastTranscript: '',
    }
  }

  public componentDidMount() {
    this.eventSubscription = this.speechService.onEvent(event => {
      switch (event.type) {
        case 'stt-start':
          this.updateRecognitionState(SpeechRecognitionState.Listening)
          break

        case 'stt-end':
          this.updateRecognitionState(SpeechRecognitionState.Idle)
          break

        case 'stt-error':
          this.updateRecognitionState(SpeechRecognitionState.Error)
          // Auto-reset to idle after error
          setTimeout(() => {
            if (
              this.state.recognitionState === SpeechRecognitionState.Error
            ) {
              this.updateRecognitionState(SpeechRecognitionState.Idle)
            }
          }, 3000)
          break

        case 'stt-result':
          // Show interim results for visual feedback
          this.setState({ lastTranscript: event.result.transcript })

          // Clear transcript after a delay
          if (this.transcriptClearTimeout) {
            clearTimeout(this.transcriptClearTimeout)
          }
          this.transcriptClearTimeout = setTimeout(() => {
            this.setState({ lastTranscript: '' })
          }, 2000)
          break

        case 'command-recognized':
          this.props.onVoiceCommand(event.command, event.params)
          break
      }
    })
  }

  public componentWillUnmount() {
    this.eventSubscription?.dispose()
    if (this.transcriptClearTimeout) {
      clearTimeout(this.transcriptClearTimeout)
    }
    // Stop listening if component unmounts while listening
    if (this.state.recognitionState === SpeechRecognitionState.Listening) {
      this.speechService.stopListening()
    }
  }

  private updateRecognitionState(state: SpeechRecognitionState) {
    this.setState({ recognitionState: state })
    this.props.onRecognitionStateChanged?.(state)
  }

  private onClick = () => {
    const { sttSettings } = this.props

    if (!sttSettings.enabled) {
      return
    }

    // Toggle listening state
    this.speechService.toggleListening(sttSettings.voiceCommandsEnabled)
  }

  private getTooltip(): string {
    const { sttSettings } = this.props
    const { recognitionState } = this.state

    if (!sttSettings.enabled) {
      return 'Voice input (disabled)'
    }

    switch (recognitionState) {
      case SpeechRecognitionState.Listening:
        return 'Listening... (click to stop)'
      case SpeechRecognitionState.Processing:
        return 'Processing...'
      case SpeechRecognitionState.Error:
        return 'Voice input error (click to retry)'
      default:
        return 'Voice input (click to start)'
    }
  }

  private renderListeningIndicator(): JSX.Element | null {
    const { recognitionState, lastTranscript } = this.state

    if (recognitionState !== SpeechRecognitionState.Listening) {
      return null
    }

    return (
      <div className="stt-listening-indicator" aria-live="polite">
        <span className="stt-pulse" />
        {lastTranscript && (
          <span className="stt-transcript">{lastTranscript}</span>
        )}
      </div>
    )
  }

  public render() {
    const { sttSettings } = this.props
    const { recognitionState } = this.state

    // Don't render if feature is disabled or not supported
    if (!enableSpeechRecognition() || !this.speechService.isSTTSupported()) {
      return null
    }

    const isListening = recognitionState === SpeechRecognitionState.Listening
    const isError = recognitionState === SpeechRecognitionState.Error

    const icon = isListening
      ? OcticonSymbol.broadcast
      : OcticonSymbol.unmute

    const className = classNames('stt-toolbar-button', {
      'stt-enabled': sttSettings.enabled,
      'stt-listening': isListening,
      'stt-error': isError,
      'stt-disabled': !sttSettings.enabled,
    })

    return (
      <div className={className}>
        <ToolbarButton
          icon={icon}
          tooltip={this.getTooltip()}
          onClick={this.onClick}
          disabled={!sttSettings.enabled}
          ariaPressed={isListening}
          ariaLabel={
            isListening
              ? 'Stop voice input'
              : 'Start voice input'
          }
        />
        {this.renderListeningIndicator()}
      </div>
    )
  }
}
