import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BreathPhaseType, PracticeLevel } from '../engine/sessionManager';

const STORAGE_KEY = 'sacred-breath-analytics';

export interface AnalyticsEntry {
  timestamp: string;
  practiceId: string;
  level: PracticeLevel;
  sessionSeconds: number;
  phaseSeconds: Partial<Record<BreathPhaseType, number>>;
}

export interface AnalyticsStore {
  completedSessions: number;
  totalSeconds: number;
  entries: AnalyticsEntry[];
}

const defaultStore: AnalyticsStore = { completedSessions: 0, totalSeconds: 0, entries: [] };

const defaultPhase: Record<string, number> = { inhale: 0, hold: 0, exhale: 0, pause: 0, wolfActive: 0, wolfRest: 0 };

export function useAnalytics() {
  const [store, setStore] = useState<AnalyticsStore>(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : defaultStore; } catch { return defaultStore; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }, [store]);

  const recordSession = useCallback((entry: AnalyticsEntry) => {
    setStore(c => ({ completedSessions: c.completedSessions + 1, totalSeconds: c.totalSeconds + entry.sessionSeconds, entries: [entry, ...c.entries].slice(0, 180) }));
  }, []);

  const practiceTotals = useMemo(() => store.entries.reduce<Record<string, { seconds: number; sessions: number }>>((acc, e) => {
    if (!acc[e.practiceId]) acc[e.practiceId] = { seconds: 0, sessions: 0 };
    acc[e.practiceId].seconds += e.sessionSeconds; acc[e.practiceId].sessions += 1; return acc;
  }, {}), [store.entries]);

  const levelTotals = useMemo(() => store.entries.reduce<Record<string, { seconds: number; sessions: number }>>((acc, e) => {
    const key = `${e.practiceId}:${e.level}`;
    if (!acc[key]) acc[key] = { seconds: 0, sessions: 0 };
    acc[key].seconds += e.sessionSeconds; acc[key].sessions += 1; return acc;
  }, {}), [store.entries]);

  const phaseTotals = useMemo(() => store.entries.reduce<Record<string, number>>((acc, e) => {
    Object.keys(defaultPhase).forEach(k => {
      acc[k] = (acc[k] ?? 0) + ((e.phaseSeconds as Record<string, number>)[k] ?? 0);
    });
    return acc;
  }, { ...defaultPhase }), [store.entries]);

  const mostUsedPracticeId = useMemo(() => {
    const ranked = Object.entries(practiceTotals) as Array<[string, { seconds: number; sessions: number }]>;
    ranked.sort(([, l], [, r]) => r.sessions !== l.sessions ? r.sessions - l.sessions : r.seconds - l.seconds);
    return ranked[0]?.[0] ?? null;
  }, [practiceTotals]);

  return { store, recordSession, practiceTotals, levelTotals, phaseTotals, mostUsedPracticeId };
}
