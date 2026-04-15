import type { BreathPhaseType, ResolvedPracticeConfig } from './sessionManager';

export interface BreathingFrame {
  phaseIndex: number;
  phaseType: BreathPhaseType;
  phaseRemainingMs: number;
  phaseProgress: number;
  cycleIndex: number;
  totalRemainingMs: number;
  isComplete: boolean;
}

export function deriveBreathingFrame(practice: ResolvedPracticeConfig, elapsedMs: number): BreathingFrame {
  const phaseDurations = practice.phases.map(p => p.duration * 1000);
  const cycleDurationMs = phaseDurations.reduce((s, d) => s + d, 0);
  const totalDurationMs = practice.totalDurationSec * 1000;
  const clamped = Math.min(elapsedMs, totalDurationMs);
  const totalRemainingMs = Math.max(0, totalDurationMs - clamped);

  if (clamped >= totalDurationMs || cycleDurationMs === 0) {
    const last = practice.phases.length - 1;
    return { phaseIndex: last, phaseType: practice.phases[last].type, phaseRemainingMs: 0, phaseProgress: 1, cycleIndex: 0, totalRemainingMs: 0, isComplete: true };
  }

  const cycleIndex = Math.floor(clamped / cycleDurationMs);
  const inCycle = clamped % cycleDurationMs;
  let traversed = 0;
  for (let i = 0; i < phaseDurations.length; i++) {
    const dur = phaseDurations[i];
    if (inCycle < traversed + dur) {
      const elapsed = inCycle - traversed;
      return { phaseIndex: i, phaseType: practice.phases[i].type, phaseRemainingMs: dur - elapsed, phaseProgress: dur === 0 ? 1 : elapsed / dur, cycleIndex, totalRemainingMs, isComplete: false };
    }
    traversed += dur;
  }
  return { phaseIndex: 0, phaseType: practice.phases[0].type, phaseRemainingMs: phaseDurations[0], phaseProgress: 0, cycleIndex, totalRemainingMs, isComplete: false };
}
