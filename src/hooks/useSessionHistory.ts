import { useCallback, useState } from 'react';

export interface SessionRecord {
  id: string;
  practiceId: string;
  practiceName: string;
  level: string;
  durationSec: number;
  completedAt: string; // ISO
  phases: Record<string, number>;
}

const KEY = 'sacred-breath-history-v2';

function load(): SessionRecord[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

function save(records: SessionRecord[]) {
  try { localStorage.setItem(KEY, JSON.stringify(records.slice(0, 100))); } catch {}
}

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionRecord[]>(load);

  const addRecord = useCallback((r: Omit<SessionRecord, 'id'>) => {
    const record = { ...r, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    setHistory(prev => {
      const next = [record, ...prev].slice(0, 100);
      save(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(KEY);
  }, []);

  const totalMinutes = Math.round(history.reduce((s, r) => s + r.durationSec, 0) / 60);
  const streak = calcStreak(history);

  return { history, addRecord, clearHistory, totalMinutes, streak };
}

function calcStreak(history: SessionRecord[]): number {
  if (!history.length) return 0;
  const days = new Set(history.map(r => r.completedAt.slice(0, 10)));
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let d = new Date(today);
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
