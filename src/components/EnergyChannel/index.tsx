import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { MeditationFigure } from '../MeditationFigure';

interface EnergyChannelProps { children: ReactNode; orbiting: boolean; }

export function EnergyChannel({ children, orbiting }: EnergyChannelProps) {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-[360px]">
      <div className="absolute inset-x-[46.5%] top-[11%] bottom-[10%] w-[7%] rounded-full bg-[linear-gradient(180deg,rgba(254,243,199,0.08)_0%,rgba(252,211,77,0.1)_18%,rgba(245,158,11,0.12)_50%,rgba(245,158,11,0.08)_100%)] blur-[10px]" />
      <div className="absolute inset-x-[49.2%] top-[11.5%] bottom-[10.4%] w-[1.6%] rounded-full bg-gradient-to-b from-amber-100/55 via-amber-300/42 to-amber-500/55 shadow-[0_0_28px_rgba(245,158,11,0.22)]" />
      <div className="absolute inset-0"><MeditationFigure /></div>
      <div className="absolute inset-x-0 top-[5.2%] flex justify-center"><div className="h-6 w-6 rounded-full bg-amber-100/30 blur-md" /></div>
      <div className="absolute inset-x-0 bottom-[6.4%] flex justify-center"><div className="h-8 w-8 rounded-full bg-amber-500/34 blur-md" /></div>
      {orbiting && (
        <motion.div className="absolute inset-[9%] rounded-[40%] border border-amber-300/10 shadow-[0_0_40px_rgba(251,191,36,0.06)]"
          animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
      )}
      {children}
    </div>
  );
}
