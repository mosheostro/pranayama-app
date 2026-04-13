interface Option { id: string; label: string; }
interface ControlsProps {
  labels: { start: string; pause: string; resume: string; reset: string; end: string; analytics: string; music: string; sound: string; musicVolume: string; timerVolume: string; musicToggle: string; timerToggle: string; level: string; language: string; on: string; off: string; };
  musicOptions: Option[]; soundOptions: Option[]; levelOptions: Option[]; languageOptions: Option[];
  musicId: string; soundId: string; levelId: string; languageId: string;
  musicVolume: number; timerVolume: number; musicEnabled: boolean; timerEnabled: boolean;
  onMusicChange: (v: string) => void; onSoundChange: (v: string) => void;
  onMusicVolumeChange: (v: number) => void; onTimerVolumeChange: (v: number) => void;
  onMusicEnabledChange: (v: boolean) => void; onTimerEnabledChange: (v: boolean) => void;
  onLevelChange: (v: string) => void; onLanguageChange: (v: string) => void;
  onPause: () => void; onResume: () => void; onReset: () => void; onEnd: () => void; onAnalytics: () => void;
  isRunning: boolean; hasStarted: boolean;
}

const sel = 'mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300/40 focus:bg-white/10';
const ctrlBtn = 'inline-flex min-h-[52px] items-center justify-center rounded-2xl border px-4 py-3 text-sm leading-5 transition';

export function Controls(props: ControlsProps) {
  const { labels, musicOptions, soundOptions, levelOptions, languageOptions, musicId, soundId, levelId, languageId, musicVolume, timerVolume, musicEnabled, timerEnabled, onMusicChange, onSoundChange, onMusicVolumeChange, onTimerVolumeChange, onMusicEnabledChange, onTimerEnabledChange, onLevelChange, onLanguageChange, onPause, onResume, onReset, onEnd, onAnalytics, isRunning, hasStarted } = props;

  return (
    <section className="w-full rounded-[2rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.28em] text-slate-300/60">{labels.music}</span>
              <select className={sel} value={musicId} onChange={e => onMusicChange(e.target.value)}>
                {musicOptions.map(o => <option key={o.id} value={o.id} className="bg-slate-950">{o.label}</option>)}
              </select>
            </label>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-[0.28em] text-slate-300/60">
                <span>{labels.musicVolume}</span><span>{Math.round(musicVolume * 100)}%</span>
              </div>
              <input className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-300"
                type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={e => onMusicVolumeChange(Number(e.target.value))} />
              <button type="button" onClick={() => onMusicEnabledChange(!musicEnabled)}
                className={`mt-4 inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm transition ${musicEnabled ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                {labels.musicToggle}: {musicEnabled ? labels.on : labels.off}
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.28em] text-slate-300/60">{labels.sound}</span>
              <select className={sel} value={soundId} onChange={e => onSoundChange(e.target.value)}>
                {soundOptions.map(o => <option key={o.id} value={o.id} className="bg-slate-950">{o.label}</option>)}
              </select>
            </label>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between text-[11px] uppercase tracking-[0.28em] text-slate-300/60">
                <span>{labels.timerVolume}</span><span>{Math.round(timerVolume * 100)}%</span>
              </div>
              <input className="mt-4 h-3 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-300"
                type="range" min="0" max="1" step="0.01" value={timerVolume} onChange={e => onTimerVolumeChange(Number(e.target.value))} />
              <button type="button" onClick={() => onTimerEnabledChange(!timerEnabled)}
                className={`mt-4 inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm transition ${timerEnabled ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-white/10 bg-white/5 text-slate-200'}`}>
                {labels.timerToggle}: {timerEnabled ? labels.on : labels.off}
              </button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-300/60">{labels.level}</span>
            <select className={sel} value={levelId} onChange={e => onLevelChange(e.target.value)}>
              {levelOptions.map(o => <option key={o.id} value={o.id} className="bg-slate-950">{o.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.28em] text-slate-300/60">{labels.language}</span>
            <select className={sel} value={languageId} onChange={e => onLanguageChange(e.target.value)}>
              {languageOptions.map(o => <option key={o.id} value={o.id} className="bg-slate-950">{o.label}</option>)}
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <button type="button" onClick={onPause} disabled={!isRunning}
            className={`${ctrlBtn} border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45`}>{labels.pause}</button>
          <button type="button" onClick={onResume} disabled={isRunning}
            className={`${ctrlBtn} border-amber-300/20 bg-amber-300 text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-45`}>{hasStarted ? labels.resume : labels.start}</button>
          <button type="button" onClick={onReset} className={`${ctrlBtn} border-white/10 bg-white/5 text-white hover:bg-white/10`}>{labels.reset}</button>
          <button type="button" onClick={onEnd} className={`${ctrlBtn} border-white/10 bg-white/5 text-white hover:bg-white/10`}>{labels.end}</button>
          <button type="button" onClick={onAnalytics} className={`${ctrlBtn} border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15`}>{labels.analytics}</button>
        </div>
      </div>
    </section>
  );
}
