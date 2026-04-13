import { useEffect, useRef } from 'react';

interface EnergyFieldProps { direction: number; intensity: number; glow: number; spread: number; }
interface Particle { x: number; y: number; radius: number; speed: number; alpha: number; drift: number; life: number; }

const PARTICLE_COUNT = 42;

export function EnergyField({ direction, intensity, glow, spread }: EnergyFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: 0.5 + (Math.random() - 0.5) * 0.08, y: Math.random(), radius: 1 + Math.random() * 2.2,
      speed: 0.0012 + Math.random() * 0.0022, alpha: 0.08 + Math.random() * 0.22,
      drift: (Math.random() - 0.5) * 0.0014, life: Math.random(),
    }));

    let frameId = 0;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio; canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const resetParticle = (p: Particle, forcedTop?: boolean) => {
      p.x = 0.5 + (Math.random() - 0.5) * (0.09 + spread * 0.035); p.y = forcedTop ? 1.02 : -0.02;
      p.radius = 1 + Math.random() * 2.2; p.speed = 0.0012 + Math.random() * 0.0022;
      p.alpha = 0.08 + Math.random() * 0.22; p.drift = (Math.random() - 0.5) * 0.0014; p.life = Math.random();
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      const streamWidth = width * (0.11 + spread * 0.025);
      const centerX = width * 0.5;
      const glowGrad = context.createLinearGradient(centerX, height * 0.08, centerX, height * 0.92);
      glowGrad.addColorStop(0, `rgba(255, 225, 160, ${0.03 + glow * 0.035})`);
      glowGrad.addColorStop(0.5, `rgba(251, 191, 36, ${0.12 + glow * 0.08})`);
      glowGrad.addColorStop(1, `rgba(245, 158, 11, ${0.05 + glow * 0.05})`);
      context.fillStyle = glowGrad;
      context.beginPath();
      context.roundRect(centerX - streamWidth / 2, height * 0.1, streamWidth, height * 0.78, streamWidth);
      context.fill();

      particles.forEach(p => {
        p.y += p.speed * direction * intensity; p.x += p.drift * (0.7 + spread * 0.5); p.life += 0.008;
        const sway = Math.sin(p.life * 5.4) * 0.014 * spread;
        p.x += (0.5 - p.x) * 0.012;
        if (direction > 0 && p.y > 1.04) resetParticle(p, false);
        if (direction < 0 && p.y < -0.04) resetParticle(p, true);
        if (direction === 0) p.y += Math.sin(p.life * 3.2) * 0.00045;
        if (Math.abs(p.x - 0.5) > 0.16) p.x = 0.5 + (Math.random() - 0.5) * 0.08;
        const px = (p.x + sway) * width, py = p.y * height;
        const halo = context.createRadialGradient(px, py, 0, px, py, p.radius * 14);
        halo.addColorStop(0, `rgba(255, 241, 184, ${p.alpha * (0.8 + glow * 0.25)})`);
        halo.addColorStop(0.35, `rgba(252, 211, 77, ${p.alpha * 0.52})`);
        halo.addColorStop(1, 'rgba(252, 211, 77, 0)');
        context.fillStyle = halo;
        context.beginPath(); context.arc(px, py, p.radius * 8, 0, Math.PI * 2); context.fill();
      });
      frameId = window.requestAnimationFrame(draw);
    };

    resize(); draw();
    window.addEventListener('resize', resize);
    return () => { window.cancelAnimationFrame(frameId); window.removeEventListener('resize', resize); };
  }, [direction, glow, intensity, spread]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" aria-hidden="true" />;
}
