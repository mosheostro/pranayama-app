import React from 'react';
import type { AnalyticsStore } from '../../hooks/useAnalytics';

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m ${sec > 0 ? sec + 's' : ''}`.trim() : `${sec}s`;
}

interface AnalyticsPanelProps {
  title: string;
  completedLabel: string; totalTimeLabel: string; averageLabel: string;
  mostUsedLabel: string; sessionsLabel: string;
  phaseTitle: string; progressTitle: string; trendTitle: string;
  store: AnalyticsStore;
  mostUsedPractice: string;
  phaseTotals: Record<string, number>;
  practiceRows: Array<{ label: string; seconds: number; sessions: number }>;
  levelRows: Array<{ label: string; seconds: number; sessions: number }>;
  trendRows: Array<{ label: string; seconds: number }>;
  phaseLabels: Record<string, string>;
}

const card: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  borderRadius: 16,
  padding: '14px 16px',
  boxShadow: 'var(--shadow)',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '.18em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  fontWeight: 600,
  marginBottom: 12,
};

const barTrack: React.CSSProperties = {
  flex: 1,
  height: 5,
  background: 'var(--card-border)',
  borderRadius: 3,
  overflow: 'hidden',
};

const barFill: React.CSSProperties = {
  height: '100%',
  background: 'var(--accent)',
  borderRadius: 3,
  transition: 'width .55s ease',
};

const phaseBarColors: Record<string, string> = {
  inhale:     '#4a8fa8',
  hold:       '#d4a44c',
  exhale:     '#3a9e7a',
  pause:      '#8a9aaa',
  wolfActive: '#d46a3a',
  wolfRest:   '#4aaa8a',
};

export function AnalyticsPanel({
  title, completedLabel, totalTimeLabel, averageLabel, mostUsedLabel,
  sessionsLabel, phaseTitle, progressTitle, trendTitle,
  store, mostUsedPractice, phaseTotals, practiceRows, levelRows, trendRows, phaseLabels,
}: AnalyticsPanelProps) {
  const maxPractice = Math.max(1, ...practiceRows.map(r => r.seconds));
  const maxLevel    = Math.max(1, ...levelRows.map(r => r.seconds));
  const maxTrend    = Math.max(1, ...trendRows.map(r => r.seconds));

  const statItems = [
    { label: completedLabel, val: String(store.completedSessions) },
    { label: totalTimeLabel,  val: fmt(store.totalSeconds) },
    { label: averageLabel,    val: store.completedSessions ? fmt(store.totalSeconds / store.completedSessions) : '—' },
    { label: mostUsedLabel,   val: mostUsedPractice },
  ];

  const visiblePhases = Object.keys(phaseTotals).filter(k => phaseTotals[k] > 0 || ['inhale','exhale'].includes(k));

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Page title */}
      <div className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
        {title}
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {statItems.map(({ label, val }) => (
          <div key={label} style={card}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>
              {label}
            </div>
            <div className="font-serif" style={{ fontSize: '1.7rem', fontWeight: 600, color: 'var(--accent)', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* Practice progress */}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={sectionTitle}>{progressTitle}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {practiceRows.map(row => (
            <div key={row.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
                  {row.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, fontWeight: 600 }}>
                  {row.sessions} {sessionsLabel}
                </span>
              </div>
              <div style={barTrack}>
                <div style={{ ...barFill, width: `${maxPractice > 0 ? Math.max(row.sessions > 0 ? 3 : 0, (row.seconds / maxPractice) * 100) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase + Level */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {/* Phase breakdown */}
        <div style={card}>
          <div style={sectionTitle}>{phaseTitle}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {visiblePhases.map(phase => (
              <div key={phase}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                    {phaseLabels[phase] || phase}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                    {fmt(phaseTotals[phase] || 0)}
                  </span>
                </div>
                <div style={barTrack}>
                  <div style={{
                    ...barFill,
                    background: phaseBarColors[phase] || 'var(--accent)',
                    width: `${store.totalSeconds > 0 ? Math.max(phaseTotals[phase] > 0 ? 3 : 0, ((phaseTotals[phase] || 0) / store.totalSeconds) * 100) : 0}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level breakdown */}
        <div style={card}>
          <div style={sectionTitle}>Level usage</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {levelRows.map(row => (
              <div key={row.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                    {row.sessions} {sessionsLabel}
                  </span>
                </div>
                <div style={barTrack}>
                  <div style={{ ...barFill, width: `${maxLevel > 0 ? Math.max(row.sessions > 0 ? 3 : 0, (row.seconds / maxLevel) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend bars */}
      <div style={card}>
        <div style={sectionTitle}>{trendTitle}</div>
        {trendRows.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: '24px 0' }}>
            No sessions recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {trendRows.map(row => (
              <div key={row.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0', background: 'var(--accent)', opacity: .75,
                  minHeight: 4,
                  height: `${Math.max(4, (row.seconds / maxTrend) * 84)}px`,
                  transition: 'height .5s ease',
                }} />
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{row.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
