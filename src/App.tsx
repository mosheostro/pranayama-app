import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import './App.css'
import { trackEvent } from './lib/analytics'
import { MeditationAudioController } from './lib/audio'
import {
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  MUSIC_TRACKS,
  PRACTICES,
  SESSION_DURATION_SECONDS,
  TONE_OPTIONS,
  formatClock,
  getCycleState,
  getVisualBreathProgress,
  loadSettings,
  saveSettings,
  translations,
  type AppSettings,
  type LanguageId,
  type LevelId,
  type MusicTrackId,
  type PhaseKey,
  type PracticeId,
  type ToneId,
} from './lib/meditation'

const audio = new MeditationAudioController()

function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [isRunning, setIsRunning] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  const frameRef = useRef<number | null>(null)
  const startTimestampRef = useRef<number | null>(null)
  const lastPhaseRef = useRef<PhaseKey | null>(null)
  const elapsedRef = useRef(0)

  const copy = translations[settings.language]
  const cycleState = getCycleState(settings.practice, settings.level, elapsedMs / 1000)
  const remainingSeconds = Math.max(
    0,
    SESSION_DURATION_SECONDS - Math.floor(elapsedMs / 1000),
  )
  const phaseLabel = copy.phaseNames[cycleState.phase]
  const phasePrompt = copy.phasePrompts[cycleState.phase]
  const practiceLabel = copy.practiceNames[settings.practice]
  const visualProgress = getVisualBreathProgress(
    cycleState.phase,
    cycleState.progress,
  )
  const visualScale = 0.74 + visualProgress * 0.42
  const sessionProgress =
    Math.min(elapsedMs / (SESSION_DURATION_SECONDS * 1000), 1) * 100

  const stopAnimationLoop = useEffectEvent(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    startTimestampRef.current = null
  })

  const handleSessionComplete = useEffectEvent(() => {
    setIsRunning(false)
    setElapsedMs(SESSION_DURATION_SECONDS * 1000)
    stopAnimationLoop()
    audio.stopSessionMusic()
    audio.playCompletionCue()
    trackEvent('session_completed', {
      practice: settings.practice,
      level: settings.level,
      language: settings.language,
    })
  })

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.lang = settings.language
    document.documentElement.dir = settings.language === 'he' ? 'rtl' : 'ltr'
  }, [settings])

  useEffect(() => {
    audio.setVolume(settings.volume)
  }, [settings.volume])

  useEffect(() => {
    audio.setTone(settings.tone)
  }, [settings.tone])

  useEffect(() => {
    elapsedRef.current = elapsedMs
  }, [elapsedMs])

  useEffect(() => {
    if (!isRunning) {
      stopAnimationLoop()
      return
    }

    const baseElapsed = elapsedRef.current

    const animate = (timestamp: number) => {
      if (startTimestampRef.current === null) {
        startTimestampRef.current = timestamp
      }

      const nextElapsed =
        baseElapsed + (timestamp - startTimestampRef.current)

      if (nextElapsed >= SESSION_DURATION_SECONDS * 1000) {
        handleSessionComplete()
        return
      }

      setElapsedMs(nextElapsed)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [isRunning])

  useEffect(() => {
    if (!isRunning) {
      lastPhaseRef.current = null
      return
    }

    if (lastPhaseRef.current === null) {
      lastPhaseRef.current = cycleState.phase
      return
    }

    if (lastPhaseRef.current !== cycleState.phase) {
      audio.playPhaseCue(cycleState.phase)
      trackEvent('phase_changed', {
        practice: settings.practice,
        level: settings.level,
        phase: cycleState.phase,
      })
      lastPhaseRef.current = cycleState.phase
    }
  }, [cycleState.phase, isRunning, settings.level, settings.practice])

  useEffect(() => {
    if (!isRunning) {
      audio.stopSessionMusic()
      return
    }

    if (!audio.isUnlocked()) {
      return
    }

    audio.startSessionMusic(settings.musicTrack)
  }, [isRunning, settings.musicTrack])

  useEffect(() => {
    if (!isSettingsOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isSettingsOpen])

  const unlockAudio = async () => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }

    try {
      await audio.unlock()
    } catch {
      // Browsers may still suspend audio until the next trusted interaction.
    }
  }

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...partial }))
  }

  const handleStartPause = async () => {
    await unlockAudio()

    if (isRunning) {
      setIsRunning(false)
      audio.stopSessionMusic()
      trackEvent('session_paused', {
        practice: settings.practice,
        level: settings.level,
      })
      return
    }

    if (elapsedMs >= SESSION_DURATION_SECONDS * 1000) {
      setElapsedMs(0)
    }

    lastPhaseRef.current = null
    audio.startSessionMusic(settings.musicTrack)
    setIsRunning(true)
    trackEvent('session_started', {
      practice: settings.practice,
      level: settings.level,
      language: settings.language,
    })
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsedMs(0)
    lastPhaseRef.current = null
    audio.stopSessionMusic()
    trackEvent('session_reset', {
      practice: settings.practice,
      level: settings.level,
    })
  }

  const handlePracticeChange = (practice: PracticeId) => {
    updateSettings({ practice })
    trackEvent('practice_selected', { practice })
  }

  const handleLevelChange = (level: LevelId) => {
    updateSettings({ level })
    trackEvent('level_selected', {
      practice: settings.practice,
      level,
    })
  }

  const handleLanguageChange = (language: LanguageId) => {
    updateSettings({ language })
    trackEvent('language_selected', { language })
  }

  const handleMusicChange = async (musicTrack: MusicTrackId) => {
    updateSettings({ musicTrack })
    trackEvent('music_selected', { musicTrack })
    await unlockAudio()
    if (isRunning) {
      audio.startSessionMusic(musicTrack)
    }
    audio.previewMusic(musicTrack, 5000, isRunning)
  }

  const handleToneChange = async (tone: ToneId) => {
    updateSettings({ tone })
    trackEvent('tone_selected', { tone })
    await unlockAudio()
    audio.setTone(tone)
    audio.previewTone(tone, 2000)
  }

  const handleVolumeChange = async (volume: number) => {
    updateSettings({ volume })
    audio.setVolume(volume)
    await unlockAudio()
    audio.playVolumeFeedback()
  }

  return (
    <div
      className={`app-shell phase-${cycleState.phase} ${isRunning ? 'running' : 'paused'}`}
      dir={settings.language === 'he' ? 'rtl' : 'ltr'}
      onPointerDownCapture={() => {
        void unlockAudio()
      }}
      onTouchStartCapture={() => {
        void unlockAudio()
      }}
    >
      <button
        type="button"
        className="settings-trigger"
        onClick={() => setIsSettingsOpen(true)}
        aria-label={copy.actions.openSettings}
      >
        <SettingsIcon />
      </button>

      <header className="practice-header">
        <p className="eyebrow">{copy.labels.guidance}</p>
        <h1>{practiceLabel}</h1>
        <div className="phase-copy">
          <span className="phase-label">{copy.labels.currentPhase}</span>
          <strong>{phaseLabel}</strong>
        </div>
      </header>

      <main className="experience-card">
        <div className="status-band">
          <div className="status-item">
            <span>{copy.labels.timer}</span>
            <strong>{formatClock(remainingSeconds)}</strong>
          </div>
          <div className="status-item">
            <span>{copy.labels.phase}</span>
            <strong>{phasePrompt}</strong>
          </div>
        </div>

        <section className="visualization-panel" aria-label={copy.labels.visualization}>
          <div className="visualization-stage">
            <div className="ambient-ring ring-one" />
            <div className="ambient-ring ring-two" />
            <div
              className="breath-ring"
              style={{
                transform: `translate(-50%, -50%) scale(${visualScale})`,
              }}
            />
            <div
              className="energy-core"
              style={{
                transform: `translate(-50%, -50%) scale(${0.82 + visualProgress * 0.3})`,
              }}
            >
              <span>{phaseLabel}</span>
            </div>
          </div>
        </section>

        <div className="progress-rail" aria-hidden="true">
          <div
            className="progress-bar"
            style={{ transform: `scaleX(${sessionProgress / 100})` }}
          />
        </div>

        <section className="controls-panel" aria-label={copy.labels.controls}>
          <button
            type="button"
            className="primary-control"
            onClick={() => {
              void handleStartPause()
            }}
          >
            {isRunning ? copy.actions.pause : elapsedMs > 0 ? copy.actions.resume : copy.actions.start}
          </button>
          <button
            type="button"
            className="secondary-control"
            onClick={handleReset}
          >
            {copy.actions.reset}
          </button>
        </section>

        <p className="session-footnote">
          {hasInteracted ? copy.labels.audioReady : copy.labels.audioHint}
        </p>
      </main>

      <SettingsSheet
        copy={copy}
        isRunning={isRunning}
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onLanguageChange={handleLanguageChange}
        onLevelChange={handleLevelChange}
        onMusicChange={handleMusicChange}
        onPracticeChange={handlePracticeChange}
        onToneChange={handleToneChange}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  )
}

type SettingsSheetProps = {
  copy: (typeof translations)[LanguageId]
  isOpen: boolean
  isRunning: boolean
  settings: AppSettings
  onClose: () => void
  onLanguageChange: (language: LanguageId) => void
  onLevelChange: (level: LevelId) => void
  onMusicChange: (music: MusicTrackId) => Promise<void>
  onPracticeChange: (practice: PracticeId) => void
  onToneChange: (tone: ToneId) => Promise<void>
  onVolumeChange: (volume: number) => Promise<void>
}

function SettingsSheet({
  copy,
  isOpen,
  isRunning,
  settings,
  onClose,
  onLanguageChange,
  onLevelChange,
  onMusicChange,
  onPracticeChange,
  onToneChange,
  onVolumeChange,
}: SettingsSheetProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="settings-overlay">
      <button
        type="button"
        className="settings-backdrop"
        onClick={onClose}
        aria-label={copy.actions.closeSettings}
      />
      <aside
        className="settings-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="sheet-header">
          <div>
            <p className="eyebrow">{copy.labels.customize}</p>
            <h2 id="settings-title">{copy.actions.openSettings}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={copy.actions.closeSettings}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="settings-grid">
          <Field label={copy.labels.practice}>
            <select
              value={settings.practice}
              onChange={(event) =>
                onPracticeChange(event.target.value as PracticeId)
              }
            >
              {Object.keys(PRACTICES).map((practiceId) => (
                <option key={practiceId} value={practiceId}>
                  {copy.practiceNames[practiceId as PracticeId]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={copy.labels.level}>
            <select
              value={settings.level}
              onChange={(event) => onLevelChange(event.target.value as LevelId)}
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {copy.levelNames[level]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={copy.labels.music}>
            <select
              value={settings.musicTrack}
              onChange={(event) => {
                void onMusicChange(event.target.value as MusicTrackId)
              }}
            >
              {MUSIC_TRACKS.map((track) => (
                <option key={track} value={track}>
                  {copy.musicNames[track]}
                </option>
              ))}
            </select>
            <small>{copy.labels.musicPreview}</small>
          </Field>

          <Field label={copy.labels.tone}>
            <select
              value={settings.tone}
              onChange={(event) => {
                void onToneChange(event.target.value as ToneId)
              }}
            >
              {TONE_OPTIONS.map((tone) => (
                <option key={tone} value={tone}>
                  {copy.toneNames[tone]}
                </option>
              ))}
            </select>
            <small>{copy.labels.tonePreview}</small>
          </Field>

          <Field label={copy.labels.language}>
            <select
              value={settings.language}
              onChange={(event) =>
                onLanguageChange(event.target.value as LanguageId)
              }
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {copy.languageNames[language]}
                </option>
              ))}
            </select>
          </Field>

          <Field label={copy.labels.volume}>
            <div className="slider-row">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={settings.volume}
                onChange={(event) => {
                  void onVolumeChange(Number(event.target.value))
                }}
              />
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
          </Field>
        </div>

        <div className="sheet-footer">
          <p>{isRunning ? copy.labels.liveApplied : copy.labels.savedApplied}</p>
          <button type="button" className="secondary-control" onClick={onClose}>
            {copy.actions.done}
          </button>
        </div>
      </aside>
    </div>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      {children}
    </label>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5Zm9 3.75l-2.15-.73c-.14-.5-.34-.97-.6-1.4l.98-2.06l-1.8-1.8l-2.06.98c-.43-.26-.9-.46-1.4-.6L13.5 3h-3l-.73 2.15c-.5.14-.97.34-1.4.6L6.31 4.77l-1.8 1.8l.98 2.06c-.26.43-.46.9-.6 1.4L3 10.5v3l2.15.73c.14.5.34.97.6 1.4l-.98 2.06l1.8 1.8l2.06-.98c.43.26.9.46 1.4.6L10.5 21h3l.73-2.15c.5-.14.97-.34 1.4-.6l2.06.98l1.8-1.8l-.98-2.06c.26-.43.46-.9.6-1.4L21 13.5v-3Z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z" />
    </svg>
  )
}

export default App
