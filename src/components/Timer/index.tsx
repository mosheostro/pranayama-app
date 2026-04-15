interface TimerProps { milliseconds: number; label: string; showProgress?: boolean; totalMs?: number; }

function formatTime(ms: number) {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return { m: m.toString().padStart(2, '0'), s: sec.toString().padStart(2, '0') };
}

export function Timer({ milliseconds, label, showProgress, totalMs }: TimerProps) {
  const { m, s } = formatTime(milliseconds);
  const progress = totalMs && totalMs > 0 ? Math.max(0, 1 - milliseconds / totalMs) : 0;

  return (
    <div className="rounded-2xl px-6 py-4 text-center" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ color: 'var(--c-muted)' }}>{label}</div>
      <div className="font-display tabular-nums" style={{ fontSize: '2.8rem', letterSpacing: '-0.02em', color: 'var(--c-text)' }}>
        <span>{m}</span>
        <span style={{ color: 'var(--c-accent)', opacity: 0.7 }}>:</span>
        <span>{s}</span>
      </div>
      {showProgress && totalMs && (
        <div className="mt-3 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress * 100}%`, background: 'var(--c-accent)' }}
          />
        </div>
      )}
    </div>
  );
}
