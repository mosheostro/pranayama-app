import type { EnergyPattern, BreathPhaseType } from './sessionManager';

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * Math.max(0, Math.min(1, progress));
}

export function getEnergyPosition(pattern: EnergyPattern, phase: BreathPhaseType, progress: number) {
  if (pattern === 'nadiShodhana') {
    if (phase === 'inhale') return interpolate(0.82, 0.16, progress);
    if (phase === 'hold') return 0.16;
    if (phase === 'exhale') return interpolate(0.16, 0.82, progress);
    return 0.82;
  }
  if (phase === 'inhale') return interpolate(0.16, 0.82, progress);
  if (phase === 'hold') return 0.82;
  if (phase === 'exhale') return interpolate(0.82, 0.16, progress);
  return 0.16;
}

export function getRingScale(phase: BreathPhaseType) {
  if (phase === 'inhale') return 1.18;
  if (phase === 'hold') return 1.16;
  if (phase === 'exhale') return 0.88;
  return 0.84;
}

export function getParticleDirection(pattern: EnergyPattern, phase: BreathPhaseType) {
  if (phase === 'hold' || phase === 'pause') return 0;
  if (pattern === 'nadiShodhana') return phase === 'inhale' ? -1 : 1;
  return phase === 'inhale' ? 1 : -1;
}

export function getEnergyGlow(phase: BreathPhaseType) {
  if (phase === 'inhale') return 1;
  if (phase === 'hold') return 0.94;
  if (phase === 'exhale') return 0.82;
  return 0.72;
}

export function getFlowSpread(phase: BreathPhaseType) {
  if (phase === 'inhale') return 1;
  if (phase === 'hold') return 0.78;
  if (phase === 'exhale') return 0.92;
  return 0.66;
}
