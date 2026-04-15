import { motion } from 'motion/react';

interface BreathingRingProps { scale: number; duration: number; phase: string; }

const phaseColors: Record<string, string> = {
  inhale:  'rgba(126,184,201,0.35)',
  hold:    'rgba(212,168,83,0.45)',
  exhale:  'rgba(147,210,178,0.30)',
  pause:   'rgba(180,170,155,0.20)',
};

export function BreathingRing({ scale, duration, phase }: BreathingRingProps) {
  const color = phaseColors[phase] ?? phaseColors.inhale;

  return (
    <>
      {/* Outer ambient ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ inset: '-20%', border: '1px solid', borderColor: 'var(--c-border)' }}
        animate={{ scale: scale + 0.12, opacity: scale > 1 ? 0.25 : 0.08 }}
        transition={{ duration: duration * 1.1, ease: 'easeInOut' }}
      />
      {/* Mid ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ inset: '-8%', border: '1px solid', borderColor: color }}
        animate={{ scale: scale + 0.05, opacity: scale > 1 ? 0.5 : 0.15 }}
        transition={{ duration, ease: 'easeInOut' }}
      />
      {/* Inner fill */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '3%',
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          border: '1px solid',
          borderColor: color,
        }}
        animate={{ scale, opacity: scale > 1 ? 0.7 : 0.3 }}
        transition={{ duration, ease: 'easeInOut' }}
      />
      {/* Glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 60%)` }}
        animate={{ opacity: scale > 1 ? [0.3, 0.6, 0.3] : [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}
