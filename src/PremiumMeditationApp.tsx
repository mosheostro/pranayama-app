import {
  useCallback, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, Clock, HeartHandshake, Home, Moon, Settings, Sun, Wind, X } from 'lucide-react';
import { AudioManager } from './audio/AudioManager';
import { AnalyticsPanel } from './components/AnalyticsPanel/index';
import { DanaPanel } from './components/DanaPanel/index';
import { SessionHistory } from './components/SessionHistory';
import { danaLinks, localeOrder } from './config/appConfig';
import { musicLibrary, practices, practiceLevels, timerSounds } from './data/practices';
import { WOLF_LEVELS, getWolfCycleCount, resolvePractice, type PracticeLevel } from './engine/sessionManager';
import { useAnalytics } from './hooks/useAnalytics';
import { useBreathing } from './hooks/useBreathing';
import { useLocalization, type Locale, localeMeta } from './hooks/useLocalization';
import { useSessionHistory } from './hooks/useSessionHistory';
import { ThemeContext, useTheme, useThemeState, type Theme } from './hooks/useTheme';
import { PracticeIcon } from './components/PracticeIcon';

type AppScreen = 'home' | 'session' | 'complete' | 'history' | 'analytics' | 'dana';

// ─── Phase helpers ────────────────────────────────────────────────
function phaseDisplayKey(type: string): string {
  if (type === 'wolfActive') return 'wolfActive';
  if (type === 'wolfRest')   return 'wolfRest';
  if (type === 'pause')      return 'pausePhase';
  return type;
}

// ─── Breathing Circle ────────────────────────────────────────────
function BreathCircle({
  phaseType, phaseDuration, phaseProgress, isRunning, isWolf,
}: {
  phaseType: string; phaseDuration: number; phaseProgress: number;
  isRunning: boolean; isWolf: boolean;
}) {
  const isExpand  = phaseType === 'inhale' || phaseType === 'hold' || phaseType === 'wolfActive';
  const isWolfRest = phaseType === 'wolfRest';
  const targetScale = isRunning ? (isExpand ? 1.16 : 0.91) : 1;
  const circR = 118; const circC = 2 * Math.PI * circR;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 254, height: 254 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="absolute inset-0 rounded-full"
          style={{ border: '1px solid var(--ring1)', transform: `scale(${1 + i * 0.19})`, opacity: 1 - i * 0.3 }} />
      ))}
      <svg className="absolute" width="254" height="254" style={{ transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
        <circle cx="127" cy="127" r={circR} fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray={circC} />
        <circle cx="127" cy="127" r={circR} fill="none" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.65"
          strokeLinecap="round" strokeDasharray={circC}
          strokeDashoffset={circC * (1 - phaseProgress)}
          style={{ transition: isRunning ? `stroke-dashoffset ${phaseDuration}s linear` : 'none' }} />
      </svg>
      <motion.div
        className={`absolute rounded-full ${isWolf && !isWolfRest && isRunning ? 'wolf-pulse' : ''}`}
        style={{
          width: 148, height: 148,
          background: 'radial-gradient(circle at 38% 35%, var(--sphere-core) 0%, var(--sphere-mid) 46%, rgba(100,160,185,.14) 78%, transparent 100%)',
          boxShadow: 'inset 0 2px 8px rgba(255,255,255,.4), 0 3px 28px var(--phase-glow)',
          opacity: isWolfRest ? 0.72 : 1,
        }}
        animate={{ scale: targetScale }}
        transition={{ duration: phaseDuration, ease: 'easeInOut' }}
      />
      <div className="absolute flex items-center justify-center" style={{ width: 148, height: 148, pointerEvents: 'none' }}>
        <span className="font-serif tracking-[.2em] text-[11px] font-semibold uppercase"
          style={{ color: 'var(--accent)', opacity: 0.85 }}>
          {phaseType}
        </span>
      </div>
    </div>
  );
}

// ─── Settings modal ───────────────────────────────────────────────
interface SettingsProps {
  onClose: () => void; t: (k: string) => string;
  theme: Theme; setTheme: (t: Theme) => void;
  locale: Locale; setLocale: (l: Locale) => void;
  selectedPracticeId: string; setSelectedPracticeId: (v: string) => void;
  selectedLevel: PracticeLevel; setSelectedLevel: (v: PracticeLevel) => void;
  selectedMusicId: string; setSelectedMusicId: (v: string) => void;
  selectedSoundId: string; setSelectedSoundId: (v: string) => void;
  musicVolume: number; setMusicVolume: (v: number) => void;
  toneVolume: number; setToneVolume: (v: number) => void;
  musicEnabled: boolean; setMusicEnabled: (v: boolean) => void;
  toneEnabled: boolean; setToneEnabled: (v: boolean) => void;
  sessionDuration: number; setSessionDuration: (v: number) => void;
  audio: AudioManager;
  practiceOptions: { id: string; label: string }[];
  musicOptions: { id: string; label: string }[];
  soundOptions: { id: string; label: string }[];
  levelOptions: { id: string; label: string }[];
}

function SettingsModal(p: SettingsProps) {
  const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-[.1em]" style={{ color: 'var(--text2)' }}>{label}</label>
      {children}
    </div>
  );
  const Sel = ({ value, onChange, options, onChangePreview }: {
    value: string; onChange: (v: string) => void;
    options: { id: string; label: string }[];
    onChangePreview?: (v: string) => void;
  }) => (
    <select value={value}
      onChange={e => { onChange(e.target.value); onChangePreview?.(e.target.value); }}
      style={{ width: '100%', minHeight: 44, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', borderRadius: 12, padding: '0 14px', fontSize: 13, fontWeight: 500, appearance: 'none', WebkitAppearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23607888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', outline: 'none' }}
      className="transition focus:ring-2 focus:ring-[var(--accent)]">
      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
    </select>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)' }}
        onClick={p.onClose} onTouchEnd={e => { e.preventDefault(); p.onClose(); }} />
      <motion.div initial={{ y: '100%', opacity: .5 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 32, stiffness: 340 }}
        className="relative w-full sm:max-w-md overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ maxHeight: '90dvh', background: 'var(--card)', boxShadow: 'var(--shadow-lg)', paddingBottom: 'max(1.5rem,env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--card-border)' }} />
        </div>
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[.22em] mb-0.5 uppercase" style={{ color: 'var(--muted)' }}>{p.t('sessionAtmosphere')}</p>
            <h2 className="font-serif text-2xl font-semibold" style={{ color: 'var(--text)' }}>{p.t('settings')}</h2>
          </div>
          <button onClick={p.onClose} style={{ minWidth: 44, minHeight: 44, color: 'var(--muted)' }}
            className="flex items-center justify-center rounded-full transition hover:opacity-70">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-4 space-y-4">
          <Row label={p.t('breathingPractice')}>
            <Sel value={p.selectedPracticeId} onChange={p.setSelectedPracticeId} options={p.practiceOptions} />
          </Row>
          <Row label={p.t('level')}>
            <Sel value={p.selectedLevel} onChange={v => p.setSelectedLevel(v as PracticeLevel)} options={p.levelOptions} />
          </Row>
          <Row label="Music">
            <Sel value={p.selectedMusicId} onChange={p.setSelectedMusicId}
              onChangePreview={v => void p.audio.previewMusic(v)} options={p.musicOptions} />
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{p.t('selectingMusicPreview')}</p>
          </Row>
          <Row label={p.t('meditationTone')}>
            <Sel value={p.selectedSoundId} onChange={p.setSelectedSoundId}
              onChangePreview={v => void p.audio.previewTone(v)} options={p.soundOptions} />
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{p.t('selectingTonePreview')}</p>
          </Row>
          <Row label={p.t('language')}>
            <Sel value={p.locale} onChange={v => p.setLocale(v as Locale)}
              options={localeOrder.map(l => ({ id: l, label: localeMeta[l as Locale].nativeName }))} />
          </Row>
          <Row label={p.t('sessionDuration')}>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map(d => (
                <button key={d} onClick={() => p.setSessionDuration(d)}
                  style={{ minHeight: 40, flex: 1, borderRadius: 10,
                    background: p.sessionDuration === d ? 'var(--btn-primary)' : 'var(--input-bg)',
                    border: `1px solid ${p.sessionDuration === d ? 'var(--btn-primary)' : 'var(--input-border)'}`,
                    color: p.sessionDuration === d ? 'var(--btn-primary-text)' : 'var(--text2)',
                  }} className="text-sm font-semibold transition">
                  {d}{p.t('minutes')}
                </button>
              ))}
            </div>
          </Row>
          <Row label={p.t('theme')}>
            <div className="flex gap-2">
              {(['aurora', 'dark'] as Theme[]).map(th => (
                <button key={th} onClick={() => p.setTheme(th)}
                  style={{ minHeight: 40, flex: 1, borderRadius: 10,
                    background: p.theme === th ? 'var(--btn-primary)' : 'var(--input-bg)',
                    border: `1px solid ${p.theme === th ? 'var(--btn-primary)' : 'var(--input-border)'}`,
                    color: p.theme === th ? 'var(--btn-primary-text)' : 'var(--text2)',
                  }} className="text-sm font-semibold transition flex items-center justify-center gap-1.5">
                  {th === 'aurora' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {p.t(`theme${th.charAt(0).toUpperCase() + th.slice(1)}`)}
                </button>
              ))}
            </div>
          </Row>
          <div className="space-y-3 pt-1" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            {[
              { label: p.t('musicVolume'), val: p.musicVolume, set: p.setMusicVolume, on: p.musicEnabled, toggle: p.setMusicEnabled, pct: Math.round(p.musicVolume * 100) },
              { label: p.t('toneVolume'),  val: p.toneVolume,  set: p.setToneVolume,  on: p.toneEnabled,  toggle: p.setToneEnabled,  pct: Math.round(p.toneVolume * 100) },
            ].map(ctrl => (
              <div key={ctrl.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-[.1em]" style={{ color: 'var(--text2)' }}>
                    {ctrl.label} — {ctrl.pct}%
                  </label>
                  <button onClick={() => ctrl.toggle(!ctrl.on)}
                    style={{ minHeight: 28, minWidth: 46, borderRadius: 7,
                      background: ctrl.on ? 'var(--accent-bg)' : 'var(--input-bg)',
                      border: `1px solid ${ctrl.on ? 'var(--accent)' : 'var(--input-border)'}`,
                      color: ctrl.on ? 'var(--accent)' : 'var(--muted)',
                    }} className="text-[11px] font-semibold px-2 transition">
                    {ctrl.on ? p.t('on') : p.t('off')}
                  </button>
                </div>
                <input type="range" min="0" max="1" step="0.01" value={ctrl.val}
                  onChange={e => ctrl.set(Number(e.target.value))} className="w-full" />
              </div>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{p.t('settingsSaved')}</p>
          <button onClick={p.onClose}
            style={{ minHeight: 46, width: '100%', borderRadius: 999, background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text2)', fontSize: 14, fontWeight: 600 }}
            className="transition hover:opacity-80">{p.t('done')}</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────
function CountdownOverlay({ onDone, practiceName, t }: { onDone: () => void; practiceName: string; t: (k: string) => string }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count === 0) { const id = setTimeout(onDone, 600); return () => clearTimeout(id); }
    const id = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, onDone]);
  return (
    <motion.div className="fixed inset-0 z-[8888] flex flex-col items-center justify-center"
      style={{ background: 'var(--bg)' }} initial={{ opacity: 0 }} animate={{ opacity: .97 }} exit={{ opacity: 0 }}>
      <p className="text-[11px] tracking-[.28em] uppercase mb-6" style={{ color: 'var(--muted)' }}>{practiceName}</p>
      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.div key={count} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: .7, opacity: 0 }} transition={{ duration: .4 }}
            className="font-serif" style={{ fontSize: '7rem', lineHeight: 1, color: 'var(--accent)' }}>{count}</motion.div>
        ) : (
          <motion.div key="go" initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="font-serif text-4xl italic" style={{ color: 'var(--accent)' }}>✦</motion.div>
        )}
      </AnimatePresence>
      <p className="mt-8 text-sm tracking-widest" style={{ color: 'var(--muted)' }}>{t('breathe')}</p>
    </motion.div>
  );
}

function Screen({ children, id }: { children: ReactNode; id: string }) {
  return (
    <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }} transition={{ duration: .32, ease: 'easeInOut' }} className="w-full">
      {children}
    </motion.div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
function AppInner() {
  const { locale, setLocale, t, dir, locales } = useLocalization();
  const { theme, setTheme } = useTheme();

  const [screen, setScreen]       = useState<AppScreen>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const [selectedPracticeId, setSelectedPracticeId] = useState(practices[0].id);
  const [selectedLevel,  setSelectedLevelRaw]  = useState<PracticeLevel>('beginner');
  const [selectedMusicId,  setSelectedMusicId]  = useState(practices[0].defaultMusic);
  const [selectedSoundId,  setSelectedSoundId]  = useState(timerSounds[0].id);
  const [musicVolume, setMusicVolumeRaw] = useState(0.55);
  const [toneVolume,  setToneVolumeRaw]  = useState(0.55);
  const [musicEnabled, setMusicEnabledRaw] = useState(true);
  const [toneEnabled,  setToneEnabledRaw]  = useState(true);
  const [sessionDuration, setSessionDuration] = useState(5);
  const [sessionHasStarted, setSessionHasStarted] = useState(false);

  const audioRef = useRef<AudioManager | null>(null);
  if (!audioRef.current) audioRef.current = new AudioManager();
  const audio = audioRef.current;

  const analytics     = useAnalytics();
  const sessionHistory = useSessionHistory();
  const prevPhaseRef  = useRef<string | null>(null);
  const completedRef  = useRef(false);

  const basePractice = useMemo(() => practices.find(pr => pr.id === selectedPracticeId) ?? practices[0], [selectedPracticeId]);
  const practice     = useMemo(() => resolvePractice(basePractice, selectedLevel, sessionDuration * 60), [basePractice, selectedLevel, sessionDuration]);
  const breathing    = useBreathing(practice);
  const isWolf       = !!basePractice.isWolf;

  // Volume wrappers
  const setMusicVolume  = (v: number) => { setMusicVolumeRaw(v);  audio.setMusicVolume(v); };
  const setToneVolume   = (v: number) => { setToneVolumeRaw(v);   audio.setToneVolume(v); };
  const setMusicEnabled = (on: boolean) => { setMusicEnabledRaw(on); audio.setMusicEnabled(on); };
  const setToneEnabled  = (on: boolean) => { setToneEnabledRaw(on);  audio.setToneEnabled(on); };
  const setSelectedLevel = (v: PracticeLevel) => {
    setSelectedLevelRaw(v); breathing.reset(); audio.stopMusic(); setSessionHasStarted(false);
  };

  // Phase tone trigger + Wolf breath loop control
  useEffect(() => {
    const phase = breathing.frame.phaseType;
    if (!breathing.isRunning) {
      audio.stopWolfBreathLoop();
      prevPhaseRef.current = phase;
      return;
    }
    const phaseChanged = prevPhaseRef.current !== null && prevPhaseRef.current !== phase;
    if (phaseChanged || prevPhaseRef.current === null) {
      if (phase === "wolfActive") {
        // Start rhythmic breath sounds for wolf active phase
        void audio.unlock().then(() => audio.startWolfBreathLoop());
      } else if (phase === "wolfRest") {
        // Silence during rest phase — stop breath loop
        audio.stopWolfBreathLoop();
      } else {
        // Normal practice: play bowl tone, ensure wolf loop is off
        audio.stopWolfBreathLoop();
        if (phaseChanged) void audio.playPhaseSound(selectedSoundId, phase as any);
      }
    }
    prevPhaseRef.current = phase;
  }, [audio, breathing.frame.phaseType, breathing.isRunning, selectedSoundId]);

  // Completion
  useEffect(() => {
    if (breathing.frame.isComplete && !completedRef.current) {
      completedRef.current = true;
      audio.stopWolfBreathLoop();
      audio.stopMusic();
      void audio.playSessionEndSound();
      setSessionHasStarted(false);
      analytics.recordSession({
        timestamp: new Date().toISOString(), practiceId: practice.id, level: selectedLevel,
        sessionSeconds: practice.totalDurationSec, phaseSeconds: {},
      });
      sessionHistory.addRecord({
        practiceId: practice.id, practiceName: t(practice.nameKey), level: selectedLevel,
        durationSec: practice.totalDurationSec, completedAt: new Date().toISOString(), phases: {},
      });
      setScreen('complete');
    }
    if (!breathing.frame.isComplete) completedRef.current = false;
  }, [analytics, audio, breathing.frame.isComplete, practice, selectedLevel, sessionHistory, t]);

  // Options
  const practiceOptions = practices.map(pr => ({ id: pr.id, label: t(pr.nameKey) }));
  const musicOptions    = musicLibrary.map(m => ({ id: m.id, label: t(m.nameKey) }));
  const soundOptions    = timerSounds.map(s => ({ id: s.id, label: t(s.nameKey) }));
  const levelOptions    = practiceLevels.map(l => ({ id: l, label: t(`level.${l}`) }));

  // Session computed
  const curPhase      = practice.phases[breathing.frame.phaseIndex];
  const phaseDur      = curPhase?.duration ?? 4;
  const phaseProgress = curPhase ? 1 - (breathing.frame.phaseRemainingMs / (phaseDur * 1000)) : 0;
  const secsLeft      = Math.ceil(Math.max(0, breathing.frame.totalRemainingMs) / 1000);
  const mLeft         = String(Math.floor(secsLeft / 60)).padStart(2, '0');
  const sLeft         = String(secsLeft % 60).padStart(2, '0');
  const guidanceText  = t(`guidance.${breathing.frame.phaseType}`);
  const phaseLabel    = t(phaseDisplayKey(breathing.frame.phaseType));

  // Wolf computed
  const wolfCycles = isWolf ? getWolfCycleCount(selectedLevel, sessionDuration * 60) : 0;
  const wolfCurIdx = breathing.frame.wolfCycleIndex;

  // Actions
  const openSession = useCallback(() => {
    breathing.reset(); audio.stopMusic(); setSessionHasStarted(false);
    prevPhaseRef.current = null; setScreen('session');
  }, [audio, breathing]);

  const startWithCountdown = useCallback(async () => {
    await audio.unlock(); setAudioUnlocked(true); setShowCountdown(true);
  }, [audio]);

  const onCountdownDone = useCallback(async () => {
    setShowCountdown(false);
    await audio.startMusic(selectedMusicId);
    breathing.start(); setSessionHasStarted(true);
  }, [audio, breathing, selectedMusicId]);

  const pauseSession  = useCallback(() => { breathing.pause(); audio.stopWolfBreathLoop(); audio.pauseMusic(); }, [audio, breathing]);
  const resumeSession = useCallback(async () => {
    await audio.unlock(); await audio.startMusic(selectedMusicId);
    breathing.start(); setSessionHasStarted(true);
  }, [audio, breathing, selectedMusicId]);
  const resetSession  = useCallback(() => {
    breathing.reset(); audio.stopWolfBreathLoop(); audio.stopMusic(); setSessionHasStarted(false); prevPhaseRef.current = null;
  }, [audio, breathing]);
  const endSession    = useCallback(() => {
    breathing.reset(); audio.stopWolfBreathLoop(); audio.stopMusic(); setSessionHasStarted(false); setScreen('home');
  }, [audio, breathing]);

  const navItems = [
    { key: 'home'      as AppScreen, label: t('nav.home'),      icon: Home },
    { key: 'session'   as AppScreen, label: t('nav.session'),   icon: Wind },
    { key: 'history'   as AppScreen, label: t('nav.history'),   icon: Clock },
    { key: 'analytics' as AppScreen, label: t('nav.analytics'), icon: BarChart3 },
    { key: 'dana'      as AppScreen, label: t('nav.dana'),      icon: HeartHandshake },
  ];

  // info strip phases
  const wl = WOLF_LEVELS[selectedLevel];
  const infoPhases = isWolf
    ? [{ label: t('wolfActive'), val: `${wl.active}s` }, { label: t('wolfRest'), val: `${wl.rest}s` }]
    : practice.phases.map(ph => ({ label: t(phaseDisplayKey(ph.type)), val: `${ph.duration}s` }));
  const cycleCountInfo = isWolf
    ? getWolfCycleCount(selectedLevel, sessionDuration * 60)
    : Math.max(1, Math.floor(sessionDuration * 60 / practice.phases.reduce((s, ph) => s + ph.duration, 0)));

  // analytics passthroughs
  const practiceRows = practices.map(pr => ({
    label: t(pr.nameKey),
    seconds: analytics.practiceTotals[pr.id]?.seconds ?? 0,
    sessions: analytics.practiceTotals[pr.id]?.sessions ?? 0,
  }));
  const mostUsed     = practices.find(pr => pr.id === analytics.mostUsedPracticeId);
  const levelRows    = practiceLevels.map(l => ({
    label: t(`level.${l}`),
    seconds: Object.entries(analytics.levelTotals).filter(([k]) => k.endsWith(`:${l}`)).reduce((s: number, [, v]: any) => s + v.seconds, 0),
    sessions: Object.entries(analytics.levelTotals).filter(([k]) => k.endsWith(`:${l}`)).reduce((s: number, [, v]: any) => s + v.sessions, 0),
  }));
  const trendRows    = analytics.store.entries.slice(0, 8).reverse().map((e, i) => ({ label: `${i + 1}`, seconds: e.sessionSeconds }));
  const phaseLabels: Record<string, string> = { inhale: t('inhale'), hold: t('hold'), exhale: t('exhale'), pause: t('pausePhase'), wolfActive: t('wolfActive'), wolfRest: t('wolfRest') };
  const danaMethods  = danaLinks.map(l => ({ id: l.id, label: t(l.labelKey), value: l.value, href: l.href }));

  return (
    <div dir={dir} style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top bar */}
      <header style={{ paddingTop: 'max(1rem,env(safe-area-inset-top))', padding: '1rem 16px .5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {localeOrder.map(l => (
            <button key={l} onClick={() => setLocale(l as Locale)}
              style={{ minHeight: 30, minWidth: 30, padding: '0 8px', borderRadius: 7,
                background: locale === l ? 'var(--accent-bg)' : 'transparent',
                border: `1px solid ${locale === l ? 'var(--accent)' : 'var(--card-border)'}`,
                color: locale === l ? 'var(--accent)' : 'var(--muted)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .14s',
              }}>{locales[l].label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => setTheme(theme === 'aurora' ? 'dark' : 'aurora')}
            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {theme === 'aurora' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button onClick={() => setSettingsOpen(true)}
            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--card-border)', background: 'var(--card)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Settings size={14} />
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 10px', maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)' }}>
          {navItems.map(({ key, label, icon: Icon }) => {
            const active = screen === key || (key === 'session' && screen === 'complete');
            return (
              <button key={key} onClick={() => setScreen(key)}
                style={{ minHeight: 34, padding: '0 11px', borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'all .14s', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500,
                  background: active ? 'var(--btn-primary)' : 'transparent',
                  color: active ? 'var(--btn-primary-text)' : 'var(--muted)',
                }}>
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px', paddingBottom: 'max(5rem,calc(env(safe-area-inset-bottom) + 4rem))' }}>
        <AnimatePresence mode="wait">

          {/* ═══ HOME ═══ */}
          {screen === 'home' && (
            <Screen id="home">
              <div style={{ textAlign: 'center', paddingTop: 14, paddingBottom: 10 }}>
                <p style={{ fontSize: 10, letterSpacing: '.26em', color: 'var(--muted)', marginBottom: 8 }}>{t('pranayamaPractice')}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 2 }}>
                  <PracticeIcon id={basePractice.id} size={28} style={{ opacity: 0.75 }} />
                  <h1 className="font-serif" style={{ fontSize: 'clamp(1.9rem,7vw,2.8rem)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{t(basePractice.nameKey)}</h1>
                </div>
              </div>
              {/* Practice chips */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 20, padding: 18, marginBottom: 12, boxShadow: 'var(--shadow)' }}>
                <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 11 }}>{t('selectPractice')}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {practices.map(pr => (
                    <button key={pr.id} onClick={() => { setSelectedPracticeId(pr.id); setSelectedMusicId(pr.defaultMusic); }}
                      style={{ minHeight: 34, padding: '0 13px', borderRadius: 999, cursor: 'pointer', transition: 'all .14s', fontSize: 13, fontWeight: selectedPracticeId === pr.id ? 600 : 400,
                        background: selectedPracticeId === pr.id ? 'var(--accent-bg)' : 'transparent',
                        border: `1px solid ${selectedPracticeId === pr.id ? 'var(--accent)' : 'var(--card-border)'}`,
                        color: selectedPracticeId === pr.id ? 'var(--accent)' : 'var(--text2)',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                      <PracticeIcon id={pr.id} size={14} />
                      {t(pr.nameKey)}
                    </button>
                  ))}
                </div>
              </div>
              {/* Level + Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 12 }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 14, boxShadow: 'var(--shadow)' }}>
                  <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 7 }}>{t('level')}</p>
                  <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value as PracticeLevel)}
                    style={{ width: '100%', minHeight: 38, background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: 9, padding: '0 10px', color: 'var(--text)', fontSize: 13, fontWeight: 500, appearance: 'none', WebkitAppearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23607888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 9px center', outline: 'none' }}>
                    {levelOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 14, boxShadow: 'var(--shadow)' }}>
                  <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 7 }}>{t('sessionDuration')}</p>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[5, 10, 15, 20].map(d => (
                      <button key={d} onClick={() => setSessionDuration(d)}
                        style={{ flex: 1, minHeight: 36, borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .14s', border: 'none',
                          background: sessionDuration === d ? 'var(--btn-primary)' : 'var(--input-bg)',
                          color: sessionDuration === d ? 'var(--btn-primary-text)' : 'var(--text2)',
                          outline: sessionDuration === d ? 'none' : '1px solid var(--input-border)',
                        }}>{d}m</button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Wolf note */}
              {isWolf && (
                <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--accent)', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', marginBottom: 2, color: 'var(--accent)' }}>{t('wolfActive')}: {wl.active}s → {t('wolfRest')}: {wl.rest}s</strong>
                  <span style={{ color: 'var(--text2)', fontSize: 12 }}>× {wolfCycles} {t('cycles')}</span>
                </div>
              )}
              {/* Info strip */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '10px 14px', marginBottom: 12, boxShadow: 'var(--shadow)', display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                {infoPhases.map((ip, i) => (
                  <div key={i}>
                    <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{ip.label} </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{ip.val}</span>
                  </div>
                ))}
                <div>
                  <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{t('cycleCount')} </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{cycleCountInfo}</span>
                </div>
              </div>
              {/* CTA — full surface */}
              <div style={{ position: 'relative', zIndex: 1, marginBottom: 12 }}>
                <button onClick={openSession}
                  style={{ display: 'block', width: '100%', minHeight: 52, lineHeight: '52px', textAlign: 'center', borderRadius: 999, border: 'none', background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '.04em', boxShadow: '0 2px 14px rgba(61,107,122,.22)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                  {t('startSession')}
                </button>
              </div>
              {/* Mini stats */}
              {sessionHistory.history.length > 0 && (
                <div style={{ display: 'flex', gap: 9 }}>
                  {[{ l: t('totalSessions'), v: sessionHistory.history.length }, { l: t('totalMinutes'), v: sessionHistory.totalMinutes }, { l: t('streak'), v: `${sessionHistory.streak}d` }].map(s => (
                    <div key={s.l} style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 13, padding: '10px 7px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
                      <div className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>{s.v}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: 1 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </Screen>
          )}

          {/* ═══ SESSION ═══ */}
          {screen === 'session' && (
            <Screen id="session">
              <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 6 }}>
                <p style={{ fontSize: 10, letterSpacing: '.26em', color: 'var(--muted)', marginBottom: 6 }}>{t('pranayamaPractice')}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                  <PracticeIcon id={practice.id} size={24} style={{ opacity: 0.7 }} />
                  <h1 className="font-serif" style={{ fontSize: 'clamp(1.6rem,5.5vw,2.3rem)', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{t(practice.nameKey)}</h1>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 13 }}>
                <AnimatePresence mode="wait">
                  <motion.div key={breathing.frame.phaseType}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: .22 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 16px', borderRadius: 999, background: 'var(--card)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow)' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.1em' }}>{t('currentPhase')}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.04em' }}>{phaseLabel}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Wolf cycle indicator */}
              {isWolf && (
                <div style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', borderRadius: 11, padding: '8px 13px', marginBottom: 11, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                      {breathing.frame.wolfIsRest ? t('wolfRest') : t('wolfActive')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                      {t('cycle')} {Math.min(wolfCurIdx + 1, wolfCycles)} {t('of')} {wolfCycles}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 140 }}>
                    {Array.from({ length: wolfCycles }).map((_, i) => (
                      <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i <= wolfCurIdx ? 'var(--accent)' : 'var(--card-border)', opacity: i === wolfCurIdx ? 1 : i < wolfCurIdx ? .55 : .3, transition: 'all .3s' }} />
                    ))}
                  </div>
                </div>
              )}
              {/* Main card */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 22, padding: 18, marginBottom: 13, boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 18 }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 13px' }}>
                    <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>{t('timer')}</p>
                    <p className="font-serif" style={{ fontSize: '1.85rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{mLeft}:{sLeft}</p>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '12px 13px' }}>
                    <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 3 }}>{t('guidance')}</p>
                    <AnimatePresence mode="wait">
                      <motion.p key={breathing.frame.phaseType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                        {guidanceText}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 14px' }}>
                  <BreathCircle phaseType={breathing.frame.phaseType} phaseDuration={phaseDur}
                    phaseProgress={phaseProgress} isRunning={breathing.isRunning} isWolf={isWolf} />
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, borderRadius: 2, background: 'var(--card-border)', overflow: 'hidden', marginBottom: 14 }}>
                  <motion.div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, originX: 0 }}
                    animate={{ scaleX: sessionDuration > 0 ? 1 - (breathing.frame.totalRemainingMs / (sessionDuration * 60 * 1000)) : 0 }}
                    transition={{ duration: .5 }} />
                </div>
                {/* Controls — full surface buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: sessionHasStarted && breathing.isRunning ? '1fr 1fr' : sessionHasStarted ? '1fr 1fr' : '1fr', gap: 10, position: 'relative', zIndex: 2 }}>
                  {!sessionHasStarted ? (
                    <button onClick={startWithCountdown}
                      style={{ display: 'block', width: '100%', minHeight: 52, lineHeight: '52px', textAlign: 'center', borderRadius: 999, border: 'none', background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(61,107,122,.22)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                      {t('start')}
                    </button>
                  ) : breathing.isRunning ? (
                    <>
                      <button onClick={pauseSession}
                        style={{ display: 'block', width: '100%', minHeight: 52, lineHeight: '52px', textAlign: 'center', borderRadius: 999, border: 'none', background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                        {t('pause')}
                      </button>
                      <button onClick={resetSession}
                        style={{ display: 'block', width: '100%', minHeight: 52, lineHeight: '52px', textAlign: 'center', borderRadius: 999, border: '1px solid var(--btn-secondary-border)', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', fontSize: 15, fontWeight: 600, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                        {t('reset')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={resumeSession}
                        style={{ display: 'block', width: '100%', minHeight: 52, lineHeight: '52px', textAlign: 'center', borderRadius: 999, border: 'none', background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', fontSize: 15, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                        {t('resume')}
                      </button>
                      <button onClick={resetSession}
                        style={{ display: 'block', width: '100%', minHeight: 52, lineHeight: '52px', textAlign: 'center', borderRadius: 999, border: '1px solid var(--btn-secondary-border)', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', fontSize: 15, fontWeight: 600, cursor: 'pointer', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
                        {t('reset')}
                      </button>
                    </>
                  )}
                </div>
                {audioUnlocked && (
                  <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>{t('audioReady')}</p>
                )}
              </div>
              {/* Phase badges */}
              {!isWolf && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center', marginBottom: 9 }}>
                  {practice.phases.map((ph, i) => (
                    <div key={i} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, transition: 'all .2s',
                      background: i === breathing.frame.phaseIndex ? 'var(--accent-bg)' : 'var(--card)',
                      border: `1px solid ${i === breathing.frame.phaseIndex ? 'var(--accent)' : 'var(--card-border)'}`,
                      color: i === breathing.frame.phaseIndex ? 'var(--accent)' : 'var(--text2)',
                    }}>
                      {t(phaseDisplayKey(ph.type))} {ph.duration}s
                    </div>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <button onClick={endSession}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: '7px 14px' }}>
                  {t('endSession')}
                </button>
              </div>
            </Screen>
          )}

          {/* ═══ COMPLETE ═══ */}
          {screen === 'complete' && (
            <Screen id="complete">
              <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 22 }}>
                <motion.div initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14 }}>
                  <div className="font-serif" style={{ fontSize: '5rem', color: 'var(--accent)' }}>✦</div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
                  <h2 className="font-serif" style={{ fontSize: '2.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 7 }}>{t('sessionComplete')}</h2>
                  <p style={{ color: 'var(--text2)', fontSize: 14, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>{t('sessionCompleteText')}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 11, justifyContent: 'center' }}>
                  <button onClick={openSession}
                    style={{ minHeight: 48, padding: '0 26px', borderRadius: 999, border: 'none', background: 'var(--btn-primary)', color: 'var(--btn-primary-text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                    {t('startSession')}
                  </button>
                  <button onClick={() => setScreen('home')}
                    style={{ minHeight: 48, padding: '0 22px', borderRadius: 999, border: '1px solid var(--btn-secondary-border)', background: 'var(--btn-secondary)', color: 'var(--btn-secondary-text)', fontSize: 14, cursor: 'pointer' }}>
                    {t('backToHome')}
                  </button>
                </motion.div>
              </div>
            </Screen>
          )}

          {screen === 'history' && (
            <Screen id="history">
              <SessionHistory history={sessionHistory.history} totalMinutes={sessionHistory.totalMinutes}
                streak={sessionHistory.streak} clearHistory={sessionHistory.clearHistory} t={t} />
            </Screen>
          )}

          {screen === 'analytics' && (
            <Screen id="analytics">
              <AnalyticsPanel title={t('analyticsTitle')} completedLabel={t('analyticsCompleted')}
                totalTimeLabel={t('analyticsTotalTime')} averageLabel={t('analyticsAverage')}
                mostUsedLabel={t('analyticsMostUsed')} sessionsLabel={t('analyticsSessions')}
                phaseTitle={t('analyticsPhases')} progressTitle={t('analyticsProgress')}
                trendTitle={t('analyticsTrends')} store={analytics.store}
                mostUsedPractice={mostUsed ? t(mostUsed.nameKey) : '—'}
                phaseTotals={analytics.phaseTotals} practiceRows={practiceRows}
                levelRows={levelRows} trendRows={trendRows} phaseLabels={phaseLabels} />
            </Screen>
          )}

          {screen === 'dana' && (
            <Screen id="dana">
              <DanaPanel title={t('danaTitle')} body={t('danaText')} methods={danaMethods} />
            </Screen>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showCountdown && <CountdownOverlay onDone={onCountdownDone} practiceName={t(practice.nameKey)} t={t} />}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal onClose={() => setSettingsOpen(false)}
            t={t} theme={theme} setTheme={setTheme} locale={locale} setLocale={setLocale}
            selectedPracticeId={selectedPracticeId}
            setSelectedPracticeId={id => { setSelectedPracticeId(id); setSelectedMusicId(practices.find(pr => pr.id === id)?.defaultMusic ?? selectedMusicId); }}
            selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel}
            selectedMusicId={selectedMusicId} setSelectedMusicId={setSelectedMusicId}
            selectedSoundId={selectedSoundId} setSelectedSoundId={setSelectedSoundId as any}
            musicVolume={musicVolume} setMusicVolume={setMusicVolume}
            toneVolume={toneVolume} setToneVolume={setToneVolume}
            musicEnabled={musicEnabled} setMusicEnabled={setMusicEnabled}
            toneEnabled={toneEnabled} setToneEnabled={setToneEnabled}
            sessionDuration={sessionDuration} setSessionDuration={setSessionDuration}
            audio={audio}
            practiceOptions={practiceOptions} musicOptions={musicOptions}
            soundOptions={soundOptions} levelOptions={levelOptions}
          />
        )}
      </AnimatePresence>


    </div>
  );
}

export default function PremiumMeditationApp() {
  const themeState = useThemeState();
  return (
    <ThemeContext.Provider value={themeState}>
      <AppInner />
    </ThemeContext.Provider>
  );
}
