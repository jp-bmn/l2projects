import * as React from 'react'
import { ToolbarDropdown, DropdownState } from './dropdown'
import * as OcticonSymbol from '../octicons/octicons.generated'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { getSpeechService, ITTSSettings } from '../../lib/speech'
import { enableTextToSpeech } from '../../lib/feature-flag'
import { Disposable } from 'event-kit'
import classNames from 'classnames'

interface ITTSToolbarButtonProps {
  /** Current TTS settings */
  readonly ttsSettings: ITTSSettings

  /** Called when TTS is enabled or disabled */
  readonly onTTSEnabledChanged: (enabled: boolean) => void

  /** Called when CLI teaching mode is toggled */
  readonly onCLITeachingModeChanged: (enabled: boolean) => void

  /** Called when user wants to open full accessibility settings */
  readonly onOpenAccessibilitySettings: () => void
}

interface ITTSToolbarButtonState {
  /** Current dropdown state */
  readonly dropdownState: DropdownState

  /** Whether TTS is currently speaking */
  readonly isSpeaking: boolean
}

/**
 * Toolbar button for Text-to-Speech controls.
 *
 * Displays a speaker icon with a dropdown menu for quick settings access.
 */
export class TTSToolbarButton extends React.Component<
  ITTSToolbarButtonProps,
  ITTSToolbarButtonState
> {
  private speechService = getSpeechService()
  private eventSubscription: Disposable | null = null

  public constructor(props: ITTSToolbarButtonProps) {
    super(props)

    this.state = {
      dropdownState: 'closed',
      isSpeaking: false,
    }
  }

  public componentDidMount() {
    this.eventSubscription = this.speechService.onEvent(event => {
      switch (event.type) {
        case 'tts-start':
          this.setState({ isSpeaking: true })
          break
        case 'tts-end':
        case 'tts-error':
          this.setState({ isSpeaking: false })
          break
      }
    })
  }

  public componentWillUnmount() {
    this.eventSubscription?.dispose()
  }

  private onDropdownStateChanged = (
    state: DropdownState,
    _source: 'keyboard' | 'pointer'
  ) => {
    this.setState({ dropdownState: state })
  }

  private onTTSEnabledChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onTTSEnabledChanged(event.currentTarget.checked)
  }

  private onCLITeachingModeChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.props.onCLITeachingModeChanged(event.currentTarget.checked)
  }

  private onStopSpeaking = () => {
    this.speechService.stopSpeaking()
  }

  private onOpenSettings = () => {
    this.setState({ dropdownState: 'closed' })
    this.props.onOpenAccessibilitySettings()
  }

  private renderDropdownContent = (): JSX.Element => {
    const { ttsSettings } = this.props
    const { isSpeaking } = this.state

    return (
      <div className="tts-dropdown-content">
        <div className="tts-dropdown-section">
          <Checkbox
            label="Enable Text-to-Speech"
            value={
              ttsSettings.enabled ? CheckboxValue.On : CheckboxValue.Off
            }
            onChange={this.onTTSEnabledChange}
          />
        </div>

        {ttsSettings.enabled && (
          <>
            <div className="tts-dropdown-section">
              <Checkbox
                label="CLI Teaching Mode"
                value={
                  ttsSettings.cliTeachingMode
                    ? CheckboxValue.On
                    : CheckboxValue.Off
                }
                onChange={this.onCLITeachingModeChange}
              />
              <p className="tts-dropdown-description">
                Read equivalent git commands after operations
              </p>
            </div>

            {isSpeaking && (
              <div className="tts-dropdown-section">
                <button
                  className="tts-stop-button"
                  onClick={this.onStopSpeaking}
                  type="button"
                >
                  Stop Speaking
                </button>
              </div>
            )}
          </>
        )}

        <div className="tts-dropdown-section tts-dropdown-footer">
          <button
            className="tts-settings-link"
            onClick={this.onOpenSettings}
            type="button"
          >
            Open Accessibility Settings...
          </button>
        </div>
      </div>
    )
  }

  public render() {
    // Don't render if feature is disabled
    if (!enableTextToSpeech() || !this.speechService.isTTSSupported()) {
      return null
    }

    const { ttsSettings } = this.props
    const { dropdownState, isSpeaking } = this.state

    const icon = ttsSettings.enabled
      ? OcticonSymbol.unmute
      : OcticonSymbol.mute

    const tooltip = ttsSettings.enabled
      ? isSpeaking
        ? 'Text-to-Speech (speaking...)'
        : 'Text-to-Speech (enabled)'
      : 'Text-to-Speech (disabled)'

    const className = classNames('tts-toolbar-button', {
      'tts-enabled': ttsSettings.enabled,
      'tts-speaking': isSpeaking,
    })

    return (
      <ToolbarDropdown
        className={className}
        icon={icon}
        tooltip={tooltip}
        dropdownState={dropdownState}
        onDropdownStateChanged={this.onDropdownStateChanged}
        dropdownContentRenderer={this.renderDropdownContent}
        showDisclosureArrow={true}
        ariaLabel="Text-to-Speech settings"
      />
    )
  }
}
