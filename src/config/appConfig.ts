import type { PracticeLevel } from '../engine/sessionManager';
import type { Locale } from '../hooks/useLocalization';

export const danaLinks = [
  { id: 'paypal', labelKey: 'dana.paypal', value: 'moshe.svarga@gmail.com', href: 'mailto:moshe.svarga@gmail.com?subject=Dana' },
  { id: 'whatsapp', labelKey: 'dana.whatsapp', value: '+972549989627', href: 'https://wa.me/972549989627' },
  { id: 'telegram', labelKey: 'dana.telegram', value: '@mosheostro1974', href: 'https://t.me/mosheostro1974' },
];

export const levelIntensity: Record<PracticeLevel, { particle: number; pulse: number }> = {
  beginner:     { particle: 0.70, pulse: 3.0 },
  intermediate: { particle: 0.85, pulse: 2.6 },
  advanced:     { particle: 1.0,  pulse: 2.3 },
  master:       { particle: 1.15, pulse: 2.0 },
};

export const localeOrder: Locale[] = ['en', 'ru', 'he', 'de', 'es'];
