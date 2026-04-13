import { useCallback, useEffect, useRef, useState } from 'react';
import type { ResolvedPracticeConfig } from '../engine/sessionManager';
import { WOLF_LEVELS, getWolfCycleCount } from '../engine/sessionManager';

export interface BreathFrame {
  phaseIndex:       number;
  phaseType:        string;
  phaseRemainingMs: number;
  totalRemainingMs: number;
  isComplete:       boolean;
  wolfCycleIndex:   number;
  wolfTotalCycles:  number;
  wolfIsRest:       boolean;
}

function makeFrame(overrides?: Partial<BreathFrame>): BreathFrame {
  return {
    phaseIndex: 0, phaseType: 'inhale', phaseRemainingMs: 4000,
    totalRemainingMs: 0, isComplete: false,
    wolfCycleIndex: 0, wolfTotalCycles: 0, wolfIsRest: false,
    ...overrides,
  };
}

export function useBreathing(practice: ResolvedPracticeConfig) {
  const isWolf = !!practice.isWolf;
  const totalMs = practice.totalDurationSec * 1000;

  const [isRunning, setIsRunning] = useState(false);
  const [frame, setFrame] = useState<BreathFrame>(() => {
    const ph = practice.phases[0];
    const wolfTotal = isWolf ? getWolfCycleCount(practice.level, practice.totalDurationSec) : 0;
    return makeFrame({ phaseType: ph?.type ?? 'inhale', phaseRemainingMs: (ph?.duration ?? 4) * 1000, totalRemainingMs: totalMs, wolfTotalCycles: wolfTotal });
  });

  const frameRef   = useRef(frame);
  const runningRef = useRef(false);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncFrame = (f: BreathFrame) => { frameRef.current = f; setFrame(f); };

  const TICK = 100;

  const tick = useCallback(() => {
    if (!runningRef.current) return;
    const f = { ...frameRef.current };

    f.phaseRemainingMs = Math.max(0, f.phaseRemainingMs - TICK);
    f.totalRemainingMs = Math.max(0, f.totalRemainingMs - TICK);

    if (f.totalRemainingMs === 0) {
      runningRef.current = false;
      setIsRunning(false);
      syncFrame({ ...f, isComplete: true });
      return;
    }

    if (f.phaseRemainingMs === 0) {
      if (isWolf) {
        const wl = WOLF_LEVELS[practice.level];
        if (!f.wolfIsRest) {
          // active → rest
          f.wolfIsRest = true;
          f.phaseIndex = 1;
          f.phaseType = 'wolfRest';
          f.phaseRemainingMs = wl.rest * 1000;
        } else {
          // rest → next active cycle
          f.wolfIsRest = false;
          f.wolfCycleIndex = f.wolfCycleIndex + 1;
          if (f.wolfCycleIndex >= f.wolfTotalCycles) {
            // all cycles done, finish
            runningRef.current = false;
            setIsRunning(false);
            syncFrame({ ...f, isComplete: true });
            return;
          }
          f.phaseIndex = 0;
          f.phaseType = 'wolfActive';
          f.phaseRemainingMs = wl.active * 1000;
        }
      } else {
        const next = (f.phaseIndex + 1) % practice.phases.length;
        f.phaseIndex = next;
        f.phaseType = practice.phases[next].type;
        f.phaseRemainingMs = practice.phases[next].duration * 1000;
      }
    }

    syncFrame(f);
  }, [isWolf, practice]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(tick, TICK);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, tick]);

  const start = useCallback(() => {
    runningRef.current = true;
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const ph = practice.phases[0];
    const wolfTotal = isWolf ? getWolfCycleCount(practice.level, practice.totalDurationSec) : 0;
    const f = makeFrame({
      phaseType: ph?.type ?? 'inhale',
      phaseRemainingMs: (ph?.duration ?? 4) * 1000,
      totalRemainingMs: totalMs,
      wolfTotalCycles: wolfTotal,
    });
    syncFrame(f);
  }, [isWolf, practice, totalMs]);

  // Reset when practice changes
  useEffect(() => { reset(); }, [practice.id, practice.level, practice.totalDurationSec, reset]);

  return { isRunning, frame, start, pause, reset };
}
