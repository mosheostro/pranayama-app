export type LanguageId = 'en' | 'es' | 'he'
export type LevelId = 'beginner' | 'intermediate' | 'advanced' | 'master'
export type PracticeId =
  | 'box'
  | 'coherent'
  | 'fourSevenEight'
  | 'falcon'
  | 'bear'
  | 'wolf'
  | 'turtle'
export type MusicTrackId = 'none' | 'aurora' | 'temple' | 'forest'
export type ToneId = 'softBell' | 'crystal' | 'wooden'
export type PhaseKey = 'inhale' | 'holdIn' | 'exhale' | 'holdOut'

export type LevelDurations = {
  inhale: number
  holdIn?: number
  exhale: number
  holdOut?: number
}

export type PracticeDefinition = {
  id: PracticeId
  pattern: 'balanced' | 'simple' | 'guided' | 'rapid' | 'slow'
  levels: Record<LevelId, LevelDurations>
}

export type AppSettings = {
  practice: PracticeId
  level: LevelId
  language: LanguageId
  musicTrack: MusicTrackId
  tone: ToneId
  volume: number
}

export const SESSION_DURATION_SECONDS = 300
export const LEVEL_OPTIONS: LevelId[] = [
  'beginner',
  'intermediate',
  'advanced',
  'master',
]
export const LANGUAGE_OPTIONS: LanguageId[] = ['en', 'es', 'he']
export const MUSIC_TRACKS: MusicTrackId[] = ['none', 'aurora', 'temple', 'forest']
export const TONE_OPTIONS: ToneId[] = ['softBell', 'crystal', 'wooden']

export const PRACTICES: Record<PracticeId, PracticeDefinition> = {
  box: {
    id: 'box',
    pattern: 'balanced',
    levels: {
      beginner: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
      intermediate: { inhale: 5, holdIn: 5, exhale: 5, holdOut: 5 },
      advanced: { inhale: 6, holdIn: 6, exhale: 6, holdOut: 6 },
      master: { inhale: 8, holdIn: 8, exhale: 8, holdOut: 8 },
    },
  },
  coherent: {
    id: 'coherent',
    pattern: 'simple',
    levels: {
      beginner: { inhale: 4, exhale: 4 },
      intermediate: { inhale: 5, exhale: 5 },
      advanced: { inhale: 6, exhale: 6 },
      master: { inhale: 7, exhale: 7 },
    },
  },
  fourSevenEight: {
    id: 'fourSevenEight',
    pattern: 'guided',
    levels: {
      beginner: { inhale: 4, holdIn: 7, exhale: 8 },
      intermediate: { inhale: 4, holdIn: 7, exhale: 8 },
      advanced: { inhale: 5, holdIn: 8, exhale: 10 },
      master: { inhale: 6, holdIn: 9, exhale: 12 },
    },
  },
  falcon: {
    id: 'falcon',
    pattern: 'simple',
    levels: {
      beginner: { inhale: 1, exhale: 7 },
      intermediate: { inhale: 1, exhale: 7 },
      advanced: { inhale: 1, exhale: 7 },
      master: { inhale: 1, exhale: 7 },
    },
  },
  bear: {
    id: 'bear',
    pattern: 'simple',
    levels: {
      beginner: { inhale: 7, exhale: 1 },
      intermediate: { inhale: 7, exhale: 1 },
      advanced: { inhale: 7, exhale: 1 },
      master: { inhale: 7, exhale: 1 },
    },
  },
  wolf: {
    id: 'wolf',
    pattern: 'rapid',
    levels: {
      beginner: { inhale: 0.25, exhale: 0.25 },
      intermediate: { inhale: 0.25, exhale: 0.25 },
      advanced: { inhale: 0.25, exhale: 0.25 },
      master: { inhale: 0.25, exhale: 0.25 },
    },
  },
  turtle: {
    id: 'turtle',
    pattern: 'slow',
    levels: {
      beginner: { inhale: 10, exhale: 10 },
      intermediate: { inhale: 15, exhale: 15 },
      advanced: { inhale: 20, exhale: 20 },
      master: { inhale: 30, exhale: 30 },
    },
  },
}

type TranslationBundle = {
  actions: {
    closeSettings: string
    done: string
    openSettings: string
    pause: string
    reset: string
    resume: string
    start: string
  }
  labels: {
    audioHint: string
    audioReady: string
    controls: string
    currentPhase: string
    customize: string
    guidance: string
    language: string
    level: string
    liveApplied: string
    music: string
    musicPreview: string
    phase: string
    practice: string
    savedApplied: string
    timer: string
    tone: string
    tonePreview: string
    visualization: string
    volume: string
  }
  languageNames: Record<LanguageId, string>
  levelNames: Record<LevelId, string>
  musicNames: Record<MusicTrackId, string>
  phaseNames: Record<PhaseKey, string>
  phasePrompts: Record<PhaseKey, string>
  practiceNames: Record<PracticeId, string>
  toneNames: Record<ToneId, string>
}

export const translations: Record<LanguageId, TranslationBundle> = {
  en: {
    actions: {
      closeSettings: 'Close settings',
      done: 'Done',
      openSettings: 'Settings',
      pause: 'Pause',
      reset: 'Reset',
      resume: 'Resume',
      start: 'Start',
    },
    labels: {
      audioHint: 'Tap anywhere once to unlock calm audio on mobile and Safari.',
      audioReady: 'Audio is ready for music, phase tones, and the session ending bell.',
      controls: 'Meditation controls',
      currentPhase: 'Current phase',
      customize: 'Session atmosphere',
      guidance: 'Pranayama practice',
      language: 'Language',
      level: 'Level',
      liveApplied: 'Changes apply immediately while the meditation continues.',
      music: 'Music',
      musicPreview: 'Selecting a track previews about 5 seconds.',
      phase: 'Guidance',
      practice: 'Breathing practice',
      savedApplied: 'Selections are saved and apply as soon as you close the panel.',
      timer: 'Timer',
      tone: 'Meditation tone',
      tonePreview: 'Selecting a tone previews about 2 seconds.',
      visualization: 'Breathing visualization',
      volume: 'Volume',
    },
    languageNames: {
      en: 'English',
      es: 'Spanish',
      he: 'Hebrew',
    },
    levelNames: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      master: 'Master',
    },
    musicNames: {
      none: 'Silence',
      aurora: 'Aurora Drift',
      temple: 'Temple Current',
      forest: 'Forest Lanterns',
    },
    phaseNames: {
      inhale: 'Inhale',
      holdIn: 'Hold',
      exhale: 'Exhale',
      holdOut: 'Rest',
    },
    phasePrompts: {
      inhale: 'Breathe in softly',
      holdIn: 'Stay spacious',
      exhale: 'Let the breath release',
      holdOut: 'Rest in stillness',
    },
    practiceNames: {
      box: 'Box Breathing',
      coherent: 'Coherent Breathing',
      fourSevenEight: '4-7-8 Breath',
      falcon: 'Falcon Breathing',
      bear: 'Bear Breathing',
      wolf: 'Wolf Breathing',
      turtle: 'Turtle Breathing',
    },
    toneNames: {
      softBell: 'Soft Bell',
      crystal: 'Crystal Bowl',
      wooden: 'Wood Pulse',
    },
  },
  es: {
    actions: {
      closeSettings: 'Cerrar ajustes',
      done: 'Listo',
      openSettings: 'Ajustes',
      pause: 'Pausar',
      reset: 'Reiniciar',
      resume: 'Continuar',
      start: 'Comenzar',
    },
    labels: {
      audioHint: 'Toca una vez la pantalla para activar el audio en móvil y Safari.',
      audioReady: 'El audio está listo para música, tonos de fase y la campana final.',
      controls: 'Controles de meditación',
      currentPhase: 'Fase actual',
      customize: 'Atmósfera de la sesión',
      guidance: 'Práctica de pranayama',
      language: 'Idioma',
      level: 'Nivel',
      liveApplied: 'Los cambios se aplican al instante mientras continúa la sesión.',
      music: 'Música',
      musicPreview: 'Elegir una pista reproduce una vista previa de unos 5 segundos.',
      phase: 'Guía',
      practice: 'Práctica de respiración',
      savedApplied: 'Las opciones se guardan y se aplican al cerrar el panel.',
      timer: 'Temporizador',
      tone: 'Tono de meditación',
      tonePreview: 'Elegir un tono reproduce una vista previa de unos 2 segundos.',
      visualization: 'Visualización de la respiración',
      volume: 'Volumen',
    },
    languageNames: {
      en: 'Inglés',
      es: 'Español',
      he: 'Hebreo',
    },
    levelNames: {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      master: 'Maestro',
    },
    musicNames: {
      none: 'Silencio',
      aurora: 'Deriva Aurora',
      temple: 'Corriente del Templo',
      forest: 'Linternas del Bosque',
    },
    phaseNames: {
      inhale: 'Inhala',
      holdIn: 'Sostén',
      exhale: 'Exhala',
      holdOut: 'Descansa',
    },
    phasePrompts: {
      inhale: 'Inhala con suavidad',
      holdIn: 'Mantén amplitud',
      exhale: 'Suelta la respiración',
      holdOut: 'Descansa en quietud',
    },
    practiceNames: {
      box: 'Respiración Cuadrada',
      coherent: 'Respiración Coherente',
      fourSevenEight: 'Respiración 4-7-8',
      falcon: 'Respiración Halcón',
      bear: 'Respiración Oso',
      wolf: 'Respiración Lobo',
      turtle: 'Respiración Tortuga',
    },
    toneNames: {
      softBell: 'Campana Suave',
      crystal: 'Cuenco de Cristal',
      wooden: 'Pulso de Madera',
    },
  },
  he: {
    actions: {
      closeSettings: 'סגור הגדרות',
      done: 'סיום',
      openSettings: 'הגדרות',
      pause: 'השהה',
      reset: 'איפוס',
      resume: 'המשך',
      start: 'התחל',
    },
    labels: {
      audioHint: 'יש להקיש פעם אחת על המסך כדי לאפשר שמע במובייל וב-Safari.',
      audioReady: 'השמע מוכן למוזיקה, לצלילי מעבר ולפעמון הסיום.',
      controls: 'פקדי מדיטציה',
      currentPhase: 'השלב הנוכחי',
      customize: 'אווירת התרגול',
      guidance: 'תרגול פראניאמה',
      language: 'שפה',
      level: 'רמה',
      liveApplied: 'השינויים חלים מיד גם בזמן שהמדיטציה ממשיכה.',
      music: 'מוזיקה',
      musicPreview: 'בחירת קטע תשמיע תצוגה מקדימה של כ-5 שניות.',
      phase: 'הנחיה',
      practice: 'סוג נשימה',
      savedApplied: 'הבחירות נשמרות ומוחלות ברגע שסוגרים את החלון.',
      timer: 'טיימר',
      tone: 'צליל מדיטציה',
      tonePreview: 'בחירת צליל תשמיע תצוגה מקדימה של כ-2 שניות.',
      visualization: 'הדמיית הנשימה',
      volume: 'עוצמה',
    },
    languageNames: {
      en: 'אנגלית',
      es: 'ספרדית',
      he: 'עברית',
    },
    levelNames: {
      beginner: 'מתחיל',
      intermediate: 'בינוני',
      advanced: 'מתקדם',
      master: 'מאסטר',
    },
    musicNames: {
      none: 'שקט',
      aurora: 'זרם אורורה',
      temple: 'זרם המקדש',
      forest: 'פנסי היער',
    },
    phaseNames: {
      inhale: 'שאיפה',
      holdIn: 'החזקה',
      exhale: 'נשיפה',
      holdOut: 'מנוחה',
    },
    phasePrompts: {
      inhale: 'שאפו בעדינות',
      holdIn: 'הישארו פתוחים',
      exhale: 'שחררו את הנשיפה',
      holdOut: 'נוחו בשקט',
    },
    practiceNames: {
      box: 'נשימת קופסה',
      coherent: 'נשימה קוהרנטית',
      fourSevenEight: 'נשימת 4-7-8',
      falcon: 'נשימת בז',
      bear: 'נשימת דוב',
      wolf: 'נשימת זאב',
      turtle: 'נשימת צב',
    },
    toneNames: {
      softBell: 'פעמון רך',
      crystal: 'קערת קריסטל',
      wooden: 'פולס עץ',
    },
  },
}

export const DEFAULT_SETTINGS: AppSettings = {
  practice: 'box',
  level: 'beginner',
  language: 'en',
  musicTrack: 'aurora',
  tone: 'softBell',
  volume: 0.55,
}

const SETTINGS_STORAGE_KEY = 'pranayama-settings-v2'

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function getCycleState(
  practiceId: PracticeId,
  level: LevelId,
  elapsedSeconds: number,
) {
  const levelConfig = PRACTICES[practiceId].levels[level]
  const segments = [
    { phase: 'inhale' as const, duration: levelConfig.inhale },
    { phase: 'holdIn' as const, duration: levelConfig.holdIn ?? 0 },
    { phase: 'exhale' as const, duration: levelConfig.exhale },
    { phase: 'holdOut' as const, duration: levelConfig.holdOut ?? 0 },
  ].filter((segment) => segment.duration > 0)

  const cycleDuration = segments.reduce(
    (total, segment) => total + segment.duration,
    0,
  )

  if (cycleDuration <= 0) {
    return {
      cycleDuration: 1,
      phase: 'inhale' as const,
      progress: 0,
    }
  }

  let cycleTime = elapsedSeconds % cycleDuration
  if (cycleTime < 0) {
    cycleTime += cycleDuration
  }

  for (const segment of segments) {
    if (cycleTime < segment.duration) {
      return {
        cycleDuration,
        phase: segment.phase,
        progress: segment.duration === 0 ? 0 : cycleTime / segment.duration,
      }
    }

    cycleTime -= segment.duration
  }

  const fallback = segments[segments.length - 1]
  return {
    cycleDuration,
    phase: fallback.phase,
    progress: 1,
  }
}

export function getVisualBreathProgress(phase: PhaseKey, progress: number) {
  if (phase === 'inhale') {
    return progress
  }

  if (phase === 'holdIn') {
    return 1
  }

  if (phase === 'exhale') {
    return 1 - progress
  }

  return 0
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
