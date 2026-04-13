import type { EnergyPattern, PracticeConfig, PracticeLevel, PracticePhase } from '../engine/sessionManager';

function p(type: PracticePhase['type'], duration: number): PracticePhase {
  return { type, duration };
}

function buildLevels(
  levels: Record<PracticeLevel, { inhale: number; hold?: number; exhale: number; pause?: number }>,
): Record<PracticeLevel, PracticePhase[]> {
  const make = (lvl: PracticeLevel): PracticePhase[] => {
    const l = levels[lvl];
    return [
      p('inhale', l.inhale),
      ...(l.hold  ? [p('hold',  l.hold)]  : []),
      p('exhale', l.exhale),
      ...(l.pause ? [p('pause', l.pause)] : []),
    ];
  };
  return {
    beginner:     make('beginner'),
    intermediate: make('intermediate'),
    advanced:     make('advanced'),
    master:       make('master'),
  };
}

function buildWolfLevels(): Record<PracticeLevel, PracticePhase[]> {
  const durations: Record<PracticeLevel, { active: number; rest: number }> = {
    beginner:     { active: 30, rest: 10 },
    intermediate: { active: 45, rest: 15 },
    advanced:     { active: 60, rest: 15 },
    master:       { active: 80, rest: 15 },
  };
  const make = (lvl: PracticeLevel): PracticePhase[] => [
    p('wolfActive', durations[lvl].active),
    p('wolfRest',   durations[lvl].rest),
  ];
  return {
    beginner:     make('beginner'),
    intermediate: make('intermediate'),
    advanced:     make('advanced'),
    master:       make('master'),
  };
}

export const practices: PracticeConfig[] = [
  {
    // Falcon: very short inhale → long exhale. NO holds, NO pauses.
    id: 'falcon', nameKey: 'practice.falcon.name', descriptionKey: 'practice.falcon.desc',
    totalDurationSec: 300, energyPattern: 'default', defaultMusic: 'deepPranayama',
    levels: buildLevels({
      beginner:     { inhale: 1, exhale: 7  },
      intermediate: { inhale: 1, exhale: 7  },
      advanced:     { inhale: 2, exhale: 10 },
      master:       { inhale: 2, exhale: 12 },
    }),
  },
  {
    // Bear: long inhale → short exhale. NO holds, NO pauses.
    id: 'bear', nameKey: 'practice.bear.name', descriptionKey: 'practice.bear.desc',
    totalDurationSec: 600, energyPattern: 'default', defaultMusic: 'himalayanBowls',
    levels: buildLevels({
      beginner:     { inhale: 7,  exhale: 1 },
      intermediate: { inhale: 7,  exhale: 1 },
      advanced:     { inhale: 10, exhale: 2 },
      master:       { inhale: 12, exhale: 2 },
    }),
  },
  {
    // Wolf: adaptive active+rest cycles per level
    id: 'wolf', nameKey: 'practice.wolf.name', descriptionKey: 'practice.wolf.desc',
    totalDurationSec: 600, energyPattern: 'default', defaultMusic: 'tibetan',
    levels: buildWolfLevels(),
    isWolf: true,
  },
  {
    // Turtle: extremely slow symmetric breathing. NO holds, NO pauses.
    id: 'turtle', nameKey: 'practice.turtle.name', descriptionKey: 'practice.turtle.desc',
    totalDurationSec: 900, energyPattern: 'default', defaultMusic: 'deepPranayama',
    levels: buildLevels({
      beginner:     { inhale: 10, exhale: 10 },
      intermediate: { inhale: 15, exhale: 15 },
      advanced:     { inhale: 20, exhale: 20 },
      master:       { inhale: 30, exhale: 30 },
    }),
  },
  {
    // Square: four equal sides
    id: 'square', nameKey: 'practice.square.name', descriptionKey: 'practice.square.desc',
    totalDurationSec: 600, energyPattern: 'default', defaultMusic: 'himalayanBowls',
    levels: buildLevels({
      beginner:     { inhale: 4, hold: 4, exhale: 4, pause: 4 },
      intermediate: { inhale: 6, hold: 6, exhale: 6, pause: 6 },
      advanced:     { inhale: 9, hold: 9, exhale: 9, pause: 9 },
      master:       { inhale: 15, hold: 15, exhale: 15, pause: 15 },
    }),
  },
  {
    // Triangle: inhale → extended hold → exhale
    id: 'triangle', nameKey: 'practice.triangle.name', descriptionKey: 'practice.triangle.desc',
    totalDurationSec: 600, energyPattern: 'default', defaultMusic: 'ambientYoga',
    levels: buildLevels({
      beginner:     { inhale: 4,  hold: 8,  exhale: 4  },
      intermediate: { inhale: 7,  hold: 14, exhale: 7  },
      advanced:     { inhale: 10, hold: 20, exhale: 10 },
      master:       { inhale: 15, hold: 30, exhale: 15 },
    }),
  },
  {
    // Microcosmic Orbit: slow continuous cycle
    id: 'orbit', nameKey: 'practice.orbit.name', descriptionKey: 'practice.orbit.desc',
    totalDurationSec: 720, energyPattern: 'microcosmicOrbit', defaultMusic: 'himalayanBowls',
    levels: buildLevels({
      beginner:     { inhale: 5,  exhale: 5  },
      intermediate: { inhale: 12, exhale: 12 },
      advanced:     { inhale: 18, exhale: 18 },
      master:       { inhale: 30, exhale: 30 },
    }),
  },
];

export const practiceLevels: PracticeLevel[] = ['beginner', 'intermediate', 'advanced', 'master'];

export const musicLibrary = [
  { id: 'tibetan',        nameKey: 'music.tibetan',        carrier: 136.1, pulse: 0.07, warmth: 760, shimmer: 0.12 },
  { id: 'ambientYoga',    nameKey: 'music.ambientYoga',    carrier: 174,   pulse: 0.10, warmth: 920, shimmer: 0.18 },
  { id: 'himalayanBowls', nameKey: 'music.himalayanBowls', carrier: 110,   pulse: 0.05, warmth: 620, shimmer: 0.11 },
  { id: 'deepPranayama',  nameKey: 'music.deepPranayama',  carrier: 96,    pulse: 0.04, warmth: 540, shimmer: 0.07 },
] as const;

export const timerSounds = [
  { id: 'softBell',        nameKey: 'sound.softBell',        tone: 256,  decay: 3.5, brightness: 0.45 },
  { id: 'woodenClick',     nameKey: 'sound.woodenClick',     tone: 180,  decay: 2.0, brightness: 0.22 },
  { id: 'lightChime',      nameKey: 'sound.lightChime',      tone: 320,  decay: 4.0, brightness: 0.38 },
  { id: 'tibetanMiniBowl', nameKey: 'sound.tibetanMiniBowl', tone: 216,  decay: 5.5, brightness: 0.50 },
  { id: 'earthDrone',      nameKey: 'sound.earthDrone',      tone: 72,   decay: 3.5, brightness: 0.12 },
] as const;

export const energyPatternKeyMap: Record<EnergyPattern, string> = {
  default:          'energy.default',
  microcosmicOrbit: 'energy.microcosmicOrbit',
  nadiShodhana:     'energy.nadiShodhana',
};
