export type BreathPhaseType = 'inhale' | 'hold' | 'exhale' | 'pause' | 'wolfActive' | 'wolfRest';
export type EnergyPattern = 'default' | 'microcosmicOrbit' | 'nadiShodhana';
export type PracticeLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface PracticePhase {
  type: BreathPhaseType;
  duration: number;
}

export interface PracticeConfig {
  id: string;
  nameKey: string;
  descriptionKey: string;
  totalDurationSec: number;
  levels: Record<PracticeLevel, PracticePhase[]>;
  energyPattern: EnergyPattern;
  defaultMusic: string;
  isWolf?: boolean;
}

export interface ResolvedPracticeConfig extends Omit<PracticeConfig, 'levels'> {
  level: PracticeLevel;
  phases: PracticePhase[];
}

export function resolvePractice(
  practice: PracticeConfig,
  level: PracticeLevel,
  durationSec: number,
): ResolvedPracticeConfig {
  return {
    ...practice,
    level,
    phases: practice.levels[level],
    totalDurationSec: durationSec,
  };
}

export function getCycleDurationSec(phases: PracticePhase[]) {
  return phases.reduce((sum, p) => sum + p.duration, 0);
}

export function getCycleCount(practice: ResolvedPracticeConfig) {
  const cd = getCycleDurationSec(practice.phases);
  return cd > 0 ? Math.max(1, Math.floor(practice.totalDurationSec / cd)) : 1;
}

// Wolf breath: returns { activeSec, restSec } per level
export const WOLF_LEVELS: Record<PracticeLevel, { active: number; rest: number }> = {
  beginner:     { active: 30, rest: 10 },
  intermediate: { active: 45, rest: 15 },
  advanced:     { active: 60, rest: 15 },
  master:       { active: 80, rest: 15 },
};

export function getWolfCycleCount(level: PracticeLevel, totalSec: number) {
  const { active, rest } = WOLF_LEVELS[level];
  return Math.max(1, Math.floor(totalSec / (active + rest)));
}
