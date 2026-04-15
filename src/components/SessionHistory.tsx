import { motion } from 'motion/react';
import type { SessionRecord } from '../hooks/useSessionHistory';

interface Props {
  history: SessionRecord[];
  totalMinutes: number;
  streak: number;
  clearHistory: () => void;
  t: (k: string) => string;
}

function fmtDuration(sec: number) { return `${Math.floor(sec / 60)}m`; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); }

export function SessionHistory({ history, totalMinutes, streak, clearHistory, t }: Props) {
  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Page title */}
      <div className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
        {t('history')}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: t('totalSessions'), value: history.length },
          { label: t('totalMinutes'),  value: totalMinutes },
          { label: t('streak'),        value: `${streak}d` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}
            style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '12px 8px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
            <div className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--muted)', marginTop: 2, fontWeight: 600 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* History list */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {/* Header */}
        <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', background: 'var(--bg2)' }}>
          <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.18em', color: 'var(--muted)', fontWeight: 600 }}>
            {t('recentSessions')}
          </span>
          {history.length > 0 && (
            <button onClick={clearHistory}
              style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', opacity: .55, fontWeight: 600 }}>
              {t('clearHistory')}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            {t('noSessionsYet')}
          </div>
        ) : (
          <div>
            {history.slice(0, 30).map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .03 }}
                style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.practiceName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{r.level}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{fmtDuration(r.durationSec)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(r.completedAt)} {fmtTime(r.completedAt)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
