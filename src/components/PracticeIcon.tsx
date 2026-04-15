/**
 * PracticeIcon — minimal SVG icons for each breathing practice.
 * Pure SVG, no external deps. Uses currentColor so they inherit
 * from parent text color automatically — works in both themes.
 */

interface IconProps {
  size?: number;
  style?: React.CSSProperties;
}

// ── Falcon — sweeping wings / dive shape ──────────────────────────
export function FalconIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden>
      {/* Wings spread wide, pointed tips */}
      <path d="M12 14 C8 12 3 8 1 5 C4 7 8 10 12 10 C16 10 20 7 23 5 C21 8 16 12 12 14Z" fill="currentColor" stroke="none" opacity="0.85"/>
      {/* Tail feathers pointing down */}
      <path d="M11 14 L9 20 M12 14 L12 21 M13 14 L15 20" strokeWidth="1.3" opacity="0.7"/>
      {/* Head */}
      <circle cx="12" cy="8" r="2" fill="currentColor" opacity="0.9"/>
    </svg>
  );
}

// ── Bear — round silhouette with ears ────────────────────────────
export function BearIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden>
      {/* Body */}
      <ellipse cx="12" cy="15" rx="7" ry="6" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      {/* Head */}
      <circle cx="12" cy="9" r="5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      {/* Ears */}
      <circle cx="7.5" cy="5.5" r="2" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="16.5" cy="5.5" r="2" fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="1.2"/>
      {/* Snout */}
      <ellipse cx="12" cy="11" rx="2.5" ry="1.8" fill="currentColor" opacity="0.25"/>
      {/* Nose */}
      <circle cx="12" cy="10.2" r="0.8" fill="currentColor"/>
    </svg>
  );
}

// ── Wolf — angular head with pointed ears ────────────────────────
export function WolfIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden>
      {/* Head shape — angular jaw */}
      <path d="M5 18 L5 12 L8 8 L12 6 L16 8 L19 12 L19 18 L15 20 L9 20 Z"
        fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      {/* Left ear — sharp pointed */}
      <path d="M8 9 L6 3 L11 7Z" fill="currentColor" opacity="0.7" stroke="currentColor" strokeWidth="1.2"/>
      {/* Right ear */}
      <path d="M16 9 L18 3 L13 7Z" fill="currentColor" opacity="0.7" stroke="currentColor" strokeWidth="1.2"/>
      {/* Eyes */}
      <circle cx="9.5" cy="13" r="1" fill="currentColor"/>
      <circle cx="14.5" cy="13" r="1" fill="currentColor"/>
      {/* Muzzle line */}
      <path d="M10 16.5 L12 18 L14 16.5" strokeWidth="1.2" opacity="0.6"/>
    </svg>
  );
}

// ── Turtle — shell with head and flippers ───────────────────────
export function TurtleIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden>
      {/* Shell */}
      <ellipse cx="12" cy="13" rx="7.5" ry="6" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      {/* Shell hexagonal pattern */}
      <path d="M12 8 L12 18 M7 10.5 L17 15.5 M7 15.5 L17 10.5" strokeWidth="1" opacity="0.3"/>
      {/* Head */}
      <circle cx="12" cy="5.5" r="2.5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.4"/>
      {/* Neck */}
      <line x1="12" y1="8" x2="12" y2="7" strokeWidth="2" opacity="0.5"/>
      {/* Flippers */}
      <path d="M4.5 12 C2 10 1.5 13 4 14Z" fill="currentColor" opacity="0.5" stroke="currentColor" strokeWidth="1"/>
      <path d="M19.5 12 C22 10 22.5 13 20 14Z" fill="currentColor" opacity="0.5" stroke="currentColor" strokeWidth="1"/>
      {/* Eyes */}
      <circle cx="11" cy="5.2" r="0.6" fill="currentColor"/>
      <circle cx="13" cy="5.2" r="0.6" fill="currentColor"/>
    </svg>
  );
}

// ── Square — equal four-sided geometric shape ───────────────────
export function SquareIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden>
      {/* Outer square */}
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.6"/>
      {/* Corner dots — representing the 4 equal phases */}
      <circle cx="6" cy="6" r="1.2" fill="currentColor" opacity="0.8"/>
      <circle cx="18" cy="6" r="1.2" fill="currentColor" opacity="0.8"/>
      <circle cx="18" cy="18" r="1.2" fill="currentColor" opacity="0.8"/>
      <circle cx="6" cy="18" r="1.2" fill="currentColor" opacity="0.8"/>
      {/* Inner cross lines showing equal division */}
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.25"/>
    </svg>
  );
}

// ── Triangle — three-phase breathing symbol ──────────────────────
export function TriangleIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden>
      {/* Main triangle */}
      <path d="M12 3 L21 20 L3 20 Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.6"/>
      {/* Corner dots — three phases */}
      <circle cx="12" cy="3.5" r="1.3" fill="currentColor" opacity="0.85"/>
      <circle cx="20.5" cy="19.5" r="1.3" fill="currentColor" opacity="0.85"/>
      <circle cx="3.5" cy="19.5" r="1.3" fill="currentColor" opacity="0.85"/>
      {/* Center point */}
      <circle cx="12" cy="14.5" r="1" fill="currentColor" opacity="0.35"/>
    </svg>
  );
}

// ── Microcosmic Orbit — circular loop / energy cycle ────────────
export function OrbitIcon({ size = 16, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      style={style} aria-hidden>
      {/* Outer orbit circle */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" opacity="0.3"/>
      {/* Flowing orbit arc — nearly full circle with gap for direction */}
      <path d="M12 3 A9 9 0 1 1 5 17" stroke="currentColor" strokeWidth="1.8" opacity="0.9"/>
      {/* Arrow head showing rotation */}
      <path d="M5 17 L3.5 13 M5 17 L8.5 15.5" strokeWidth="1.6" opacity="0.9"/>
      {/* Inner dot — center of energy */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.2"/>
      {/* Small ascending dot */}
      <circle cx="12" cy="3" r="1.4" fill="currentColor" opacity="0.9"/>
    </svg>
  );
}

// ── Icon map — lookup by practice id ────────────────────────────
export function PracticeIcon({ id, size = 15, style }: { id: string; size?: number; style?: React.CSSProperties }) {
  const props = { size, style };
  switch (id) {
    case 'falcon':   return <FalconIcon   {...props} />;
    case 'bear':     return <BearIcon     {...props} />;
    case 'wolf':     return <WolfIcon     {...props} />;
    case 'turtle':   return <TurtleIcon   {...props} />;
    case 'square':   return <SquareIcon   {...props} />;
    case 'triangle': return <TriangleIcon {...props} />;
    case 'orbit':    return <OrbitIcon    {...props} />;
    default:         return null;
  }
}
