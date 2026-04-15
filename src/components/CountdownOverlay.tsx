import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onComplete: () => void;
  practiceName: string;
  t: (k: string) => string;
}

export function CountdownOverlay({ onComplete, practiceName, t }: Props) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) { setTimeout(onComplete, 600); return; }
    const id = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[8888] flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, rgba(6,13,24,0.92) 0%, rgba(6,13,24,0.98) 100%)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="font-display text-sm tracking-[0.4em] uppercase mb-8" style={{ color: 'var(--c-muted)' }}>
        {practiceName}
      </p>

      <AnimatePresence mode="wait">
        {count > 0 ? (
          <motion.div
            key={count}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-display"
            style={{ fontSize: '8rem', lineHeight: 1, color: 'var(--c-accent)', textShadow: '0 0 60px var(--c-glow)' }}
          >
            {count}
          </motion.div>
        ) : (
          <motion.div
            key="go"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-display"
            style={{ fontSize: '3.5rem', color: 'var(--c-accent)', letterSpacing: '0.2em' }}
          >
            ✦
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-10 text-xs tracking-[0.3em] uppercase" style={{ color: 'var(--c-muted)' }}>
        {t('breathe') ?? 'breathe'}
      </p>

      {/* Breathing rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: 'var(--c-accent)', opacity: 0.06 * (4 - i) }}
          initial={{ width: 80, height: 80 }}
          animate={{ width: 80 + i * 120, height: 80 + i * 120, opacity: [0.08 * (4 - i), 0.02, 0.08 * (4 - i)] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}
    </motion.div>
  );
}
