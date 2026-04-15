import { motion } from 'motion/react';

interface EnergySphereProps { topPercent: number; duration: number; pulseSpeed?: number; glow?: number; spread?: number; }
const trailOffsets = [-16, -8, 0, 8, 16];

export function EnergySphere({ topPercent, duration, pulseSpeed = 2.6, glow = 0.9, spread = 0.9 }: EnergySphereProps) {
  const auraScale = 0.9 + spread * 0.18;
  return (
    <>
      <div className="absolute left-1/2 top-[13%] z-10 h-[72%] w-[30px] -translate-x-1/2 overflow-hidden rounded-full">
        <div className="absolute inset-x-[28%] inset-y-0 rounded-full bg-gradient-to-b from-amber-100/10 via-amber-200/50 to-amber-500/18 blur-[10px]" />
      </div>
      <div className="absolute left-1/2 z-20 -translate-x-1/2" style={{ top: `${topPercent * 100}%` }}>
        <motion.div className="relative h-20 w-20 -translate-y-1/2"
          animate={{ scale: [1, 1.05 + glow * 0.04, 1], opacity: [0.82 + glow * 0.08, 1, 0.82 + glow * 0.08] }}
          transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut' }}>
          <motion.div className="absolute inset-[-52%] rounded-full bg-amber-200/10 blur-[34px]"
            animate={{ scale: [1, 1.08 + spread * 0.06, 1], opacity: [0.42, 0.62, 0.42] }}
            transition={{ duration: pulseSpeed * 1.2, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(252,211,77,0.45)_0%,rgba(251,191,36,0.18)_48%,rgba(251,191,36,0)_80%)] blur-xl"
            animate={{ scale: [1, auraScale, 1] }} transition={{ duration: pulseSpeed, repeat: Infinity, ease: 'easeInOut' }} />
          {trailOffsets.map((offset, i) => (
            <motion.div key={offset} className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-amber-100/60 blur-[2px]"
              animate={{ x: [-offset * 0.1, offset * 0.08], y: [offset * 0.7, -offset * 0.45], scale: [0.85, 1.08, 0.82], opacity: [0.16, 0.42, 0.1] }}
              transition={{ duration: Math.max(1.8, duration * 0.75) + i * 0.08, repeat: Infinity, ease: 'easeInOut', delay: i * 0.05 }}
              style={{ marginLeft: -6, marginTop: -6 }} />
          ))}
          <div className="absolute inset-[28%] rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,250,220,1)_0%,rgba(250,217,122,0.96)_28%,rgba(245,158,11,0.76)_58%,rgba(245,158,11,0.08)_100%)] shadow-[0_0_42px_rgba(245,158,11,0.4)]" />
        </motion.div>
      </div>
    </>
  );
}
