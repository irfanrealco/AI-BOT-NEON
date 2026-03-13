/**
 * Arqos Logo — Sketchy, hand-drawn style with draw-in animation
 * and true metallic gold coloring
 */

export function ArqosLogo({ size = 32, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-label="Arqos — Trust in Past Data to Assist Humans"
      className={animate ? "arqos-icon-glow" : ""}
    >
      {/* Outer hexagonal ring — sketchy, slightly imperfect strokes */}
      <path
        d="M24 4.5L41.5 14.2V33.8L24 43.5L6.5 33.8V14.2L24 4.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
        className={animate ? "arqos-icon-draw" : ""}
        style={animate ? { animationDelay: "0.3s" } : {}}
      />
      {/* Second hex ring — offset slightly for hand-drawn feel */}
      <path
        d="M24 5.8L40.2 15V33L24 42.2L7.8 33V15L24 5.8Z"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.12"
        strokeDasharray="3 4"
        className={animate ? "arqos-icon-draw" : ""}
        style={animate ? { animationDelay: "0.6s" } : {}}
      />

      {/* Inner diamond — TRUE GOLD, thick hand-drawn strokes */}
      <path
        d="M24 11L37 24L24 37L11 24L24 11Z"
        stroke="url(#goldGradient)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={animate ? "arqos-icon-draw" : ""}
        style={animate ? { animationDelay: "0.1s" } : {}}
      />
      {/* Diamond inner echo — lighter, sketch overlay */}
      <path
        d="M24 13.5L34.5 24L24 34.5L13.5 24L24 13.5Z"
        stroke="url(#goldGradientLight)"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        className={animate ? "arqos-icon-draw" : ""}
        style={animate ? { animationDelay: "0.8s" } : {}}
      />

      {/* Center jewel — filled gold with metallic effect */}
      <circle
        cx="24"
        cy="24"
        r="3.5"
        fill="url(#goldRadial)"
        className={animate ? "diamond-pulse" : ""}
      />
      {/* Jewel highlight */}
      <circle cx="23" cy="23" r="1.2" fill="white" opacity="0.3" />

      {/* Four data lines — sketchy, slightly offset */}
      <line x1="24" y1="15" x2="24" y2="19.5" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="24" y1="28.5" x2="24" y2="33" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="15" y1="24" x2="19.5" y2="24" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="28.5" y1="24" x2="33" y2="24" stroke="url(#goldGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* Tiny corner dots — data nodes */}
      <circle cx="24" cy="14" r="1" fill="url(#goldGradient)" opacity="0.5" />
      <circle cx="24" cy="34" r="1" fill="url(#goldGradient)" opacity="0.5" />
      <circle cx="14" cy="24" r="1" fill="url(#goldGradient)" opacity="0.5" />
      <circle cx="34" cy="24" r="1" fill="url(#goldGradient)" opacity="0.5" />

      {/* TRUE GOLD gradients */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B6914" />
          <stop offset="25%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#DAA520" />
          <stop offset="75%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
        <linearGradient id="goldGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DAA520" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#DAA520" />
        </linearGradient>
        <radialGradient id="goldRadial" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="40%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Hero icon — large version with full animation */
export function ArqosHeroIcon() {
  return (
    <div className="arqos-float-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F1F16] to-[#1A3A2A] dark:from-[#0A1A10] dark:to-[#152E20] flex items-center justify-center shadow-lg border border-[#DAA520]/20">
        <ArqosLogo size={44} animate={true} />
      </div>
    </div>
  );
}

export function ArqosWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <ArqosLogo size={28} />
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-wide gold-text">ARQOS</span>
        <span className="text-[9px] text-muted-foreground tracking-widest uppercase">Trust in Data</span>
      </div>
    </div>
  );
}
