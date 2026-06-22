// Детальная векторная иллюстрация шоссейного велосипеда
// Используется на главной странице как hero-визуал
export default function BikeIllustration({ className = '', accentColor = '#ff5c35' }) {
  return (
    <svg
      viewBox="0 0 600 360"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3a3a52" />
          <stop offset="50%" stopColor="#26263a" />
          <stop offset="100%" stopColor="#1a1a28" />
        </linearGradient>
        <linearGradient id="frameHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id="wheelGrad" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#35354a" />
          <stop offset="75%" stopColor="#1c1c2a" />
          <stop offset="100%" stopColor="#0e0e16" />
        </radialGradient>
        <radialGradient id="tireGrad" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#0a0a0f" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="300" cy="318" rx="220" ry="14" fill="url(#shadowGrad)" opacity="0.6" />

      {/* ===== Wheels ===== */}
      {/* Rear wheel */}
      <g>
        <circle cx="430" cy="248" r="78" fill="url(#tireGrad)" />
        <circle cx="430" cy="248" r="78" fill="none" stroke="#3a3a4e" strokeWidth="1.5" />
        <circle cx="430" cy="248" r="62" fill="url(#wheelGrad)" />
        <circle cx="430" cy="248" r="62" fill="none" stroke="#44445a" strokeWidth="1" />
        {/* Spokes */}
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i * 20 * Math.PI) / 180
          return (
            <line key={i}
              x1={430} y1={248}
              x2={430 + Math.cos(a) * 60} y2={248 + Math.sin(a) * 60}
              stroke="#52526a" strokeWidth="1" opacity="0.8" />
          )
        })}
        <circle cx="430" cy="248" r="9" fill="#55556e" stroke={accentColor} strokeWidth="2" />
        <circle cx="430" cy="248" r="3" fill="#1a1a28" />
        {/* Rim highlight */}
        <path d="M 372 220 A 62 62 0 0 1 430 186" fill="none" stroke="#6a6a85" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      </g>

      {/* Front wheel */}
      <g>
        <circle cx="160" cy="248" r="78" fill="url(#tireGrad)" />
        <circle cx="160" cy="248" r="78" fill="none" stroke="#3a3a4e" strokeWidth="1.5" />
        <circle cx="160" cy="248" r="62" fill="url(#wheelGrad)" />
        <circle cx="160" cy="248" r="62" fill="none" stroke="#44445a" strokeWidth="1" />
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i * 20 * Math.PI) / 180
          return (
            <line key={i}
              x1={160} y1={248}
              x2={160 + Math.cos(a) * 60} y2={248 + Math.sin(a) * 60}
              stroke="#52526a" strokeWidth="1" opacity="0.8" />
          )
        })}
        <circle cx="160" cy="248" r="9" fill="#55556e" stroke={accentColor} strokeWidth="2" />
        <circle cx="160" cy="248" r="3" fill="#1a1a28" />
        <path d="M 102 220 A 62 62 0 0 1 160 186" fill="none" stroke="#6a6a85" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      </g>

      {/* ===== Frame ===== */}
      {/* Down tube (BB to head tube) */}
      <line x1="300" y1="248" x2="195" y2="170" stroke="url(#frameGrad)" strokeWidth="14" strokeLinecap="round" />
      <line x1="300" y1="248" x2="195" y2="170" stroke="url(#frameHighlight)" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Seat tube */}
      <line x1="300" y1="248" x2="262" y2="118" stroke="url(#frameGrad)" strokeWidth="13" strokeLinecap="round" />
      <line x1="300" y1="248" x2="262" y2="118" stroke="url(#frameHighlight)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

      {/* Top tube */}
      <line x1="262" y1="118" x2="195" y2="170" stroke="url(#frameGrad)" strokeWidth="11" strokeLinecap="round" />

      {/* Chain stay */}
      <line x1="300" y1="248" x2="430" y2="248" stroke="url(#frameGrad)" strokeWidth="11" strokeLinecap="round" />

      {/* Seat stay */}
      <line x1="262" y1="118" x2="430" y2="248" stroke="#2a2a3c" strokeWidth="8" strokeLinecap="round" />

      {/* Fork */}
      <line x1="195" y1="170" x2="160" y2="248" stroke="url(#frameGrad)" strokeWidth="11" strokeLinecap="round" />
      <line x1="195" y1="170" x2="160" y2="248" stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.4" />

      {/* Head tube */}
      <line x1="195" y1="170" x2="201" y2="138" stroke="#3a3a52" strokeWidth="12" strokeLinecap="round" />

      {/* ===== Bottom bracket / crank ===== */}
      <circle cx="300" cy="248" r="17" fill="#222230" stroke="#44445a" strokeWidth="2" />
      <circle cx="300" cy="248" r="34" fill="none" stroke={accentColor} strokeWidth="3.5" strokeDasharray="3 4" opacity="0.85" />
      {/* Crank arm + pedal */}
      <line x1="300" y1="248" x2="344" y2="280" stroke="#2a2a3a" strokeWidth="8" strokeLinecap="round" />
      <rect x="336" y="274" width="22" height="9" rx="3" fill={accentColor} transform="rotate(38 347 278)" />
      <line x1="300" y1="248" x2="256" y2="216" stroke="#2a2a3a" strokeWidth="8" strokeLinecap="round" />
      <rect x="244" y="212" width="22" height="9" rx="3" fill="#3a3a4e" transform="rotate(38 255 216)" />

      {/* ===== Saddle ===== */}
      <path d="M 232 112 Q 262 104 292 112 L 288 122 Q 262 116 236 122 Z" fill="#3a3a4e" stroke="#52526a" strokeWidth="1.5" />
      <line x1="262" y1="118" x2="262" y2="138" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />

      {/* ===== Handlebar (drop bar) ===== */}
      <path d="M 175 132 Q 158 132 156 148 Q 155 162 168 168"
        fill="none" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
      <path d="M 227 132 Q 244 132 246 148 Q 247 162 234 168"
        fill="none" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
      <line x1="175" y1="132" x2="227" y2="132" stroke={accentColor} strokeWidth="6" strokeLinecap="round" />
      {/* Stem */}
      <line x1="201" y1="132" x2="201" y2="138" stroke="#3a3a4e" strokeWidth="7" strokeLinecap="round" />
      <line x1="201" y1="138" x2="195" y2="170" stroke="#44445a" strokeWidth="0" />

      {/* Brake levers */}
      <ellipse cx="172" cy="148" rx="7" ry="4" fill="#2a2a3a" transform="rotate(-30 172 148)" />
      <ellipse cx="230" cy="148" rx="7" ry="4" fill="#2a2a3a" transform="rotate(30 230 148)" />

      {/* ===== Subtle speed lines (motion) ===== */}
      <g opacity="0.25">
        <line x1="40" y1="200" x2="80" y2="200" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="230" x2="75" y2="230" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="45" y1="260" x2="85" y2="260" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
