export function MeditationFigure() {
  return (
    <svg viewBox="0 0 260 420" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="figureFillPremium" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.24)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.07)" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="64" r="33" fill="url(#figureFillPremium)" />
      <path d="M100 110C87 136 83 190 93 232C102 266 115 289 130 289C145 289 158 266 167 232C177 190 173 136 160 110C151 97 141 90 130 90C119 90 109 97 100 110Z" fill="url(#figureFillPremium)" />
      <path d="M100 132C72 164 58 205 64 234C68 254 84 260 97 246C106 235 111 215 108 188L100 132Z" fill="url(#figureFillPremium)" />
      <path d="M160 132C188 164 202 205 196 234C192 254 176 260 163 246C154 235 149 215 152 188L160 132Z" fill="url(#figureFillPremium)" />
      <ellipse cx="130" cy="284" rx="44" ry="15" fill="rgba(255,255,255,0.1)" />
      <path d="M35 302C39 350 74 383 117 388C123 389 128 390 130 390C132 390 137 389 143 388C186 383 221 350 225 302C188 286 155 281 130 281C105 281 72 286 35 302Z" fill="url(#figureFillPremium)" />
      <ellipse cx="36" cy="303" rx="20" ry="14" fill="rgba(255,255,255,0.1)" />
      <ellipse cx="224" cy="303" rx="20" ry="14" fill="rgba(255,255,255,0.1)" />
    </svg>
  );
}
