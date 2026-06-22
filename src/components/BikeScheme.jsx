import { useMemo } from 'react'

// SVG схема велосипеда с динамическими параметрами посадки
export default function BikeScheme({ results, bikeType }) {
  const hasDropbar = bikeType === 'road' || bikeType === 'fix' || bikeType === 'gravel'

  const pts = useMemo(() => {
    if (!results) return null

    const BB  = { x: 190, y: 185 }
    const RW  = { x: 310, y: 185 }
    const FW  = { x: 70,  y: 185 }
    const wheelR = 52

    const sH = Math.max(60, Math.min(120, results.saddleHeight / 3.2))
    const sBack = Math.max(10, Math.min(30, results.saddleSetback / 2.5))
    const SADDLE = { x: BB.x + sBack, y: BB.y - sH }

    const reach = Math.max(30, Math.min(70, results.reach / 4.5))
    const stack = Math.max(50, Math.min(90, results.stack / 4.5))
    const HB = { x: BB.x - reach, y: BB.y - stack }

    const HT_BOT = { x: HB.x + 8,  y: HB.y + 25 }
    const HT_TOP = { x: HB.x + 2,  y: HB.y }

    return { BB, RW, FW, SADDLE, HB, HT_BOT, HT_TOP, wheelR }
  }, [results, bikeType])

  if (!pts) return null
  const { BB, RW, FW, SADDLE, HB, HT_BOT, wheelR } = pts

  const saddlePts = [
    [SADDLE.x - 19, SADDLE.y + 4],
    [SADDLE.x + 15, SADDLE.y + 4],
    [SADDLE.x + 13, SADDLE.y - 2],
    [SADDLE.x - 17, SADDLE.y - 2],
  ]

  const crankAngle = 40 * Math.PI / 180
  const crankLen = 22
  const PEDAL = {
    x: BB.x + Math.cos(crankAngle) * crankLen,
    y: BB.y + Math.sin(crankAngle) * crankLen,
  }

  return (
    <div className="bike-scheme-wrap">
      <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" className="bike-scheme-svg">
        <defs>
          <radialGradient id="bsWheelGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#34344a" />
            <stop offset="80%" stopColor="#1c1c28" />
            <stop offset="100%" stopColor="#101018" />
          </radialGradient>
          <radialGradient id="bsTireGrad" cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="#15151e" />
            <stop offset="100%" stopColor="#050507" />
          </radialGradient>
          <linearGradient id="bsFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#52526a" />
            <stop offset="100%" stopColor="#2c2c3e" />
          </linearGradient>
        </defs>

        {/* ===== Колёса ===== */}
        {[RW, FW].map((W, i) => (
          <g key={i}>
            <circle cx={W.x} cy={W.y} r={wheelR + 9} fill="url(#bsTireGrad)" />
            <circle cx={W.x} cy={W.y} r={wheelR + 9} fill="none" stroke="#3a3a4e" strokeWidth="1" />
            <circle cx={W.x} cy={W.y} r={wheelR} fill="url(#bsWheelGrad)" />
            <circle cx={W.x} cy={W.y} r={wheelR} fill="none" stroke="#454560" strokeWidth="1" />
            {[0,45,90,135,180,225,270,315].map(a => {
              const rad = a * Math.PI / 180
              return (
                <line key={a} x1={W.x} y1={W.y}
                  x2={W.x + Math.cos(rad)*wheelR} y2={W.y + Math.sin(rad)*wheelR}
                  stroke="#4a4a64" strokeWidth="0.8" opacity="0.85" />
              )
            })}
            <circle cx={W.x} cy={W.y} r={6} fill="#52526a" stroke="#ff5c35" strokeWidth="1.5" />
            <circle cx={W.x} cy={W.y} r={2} fill="#15151e" />
            <path d={`M ${W.x - wheelR*0.6} ${W.y - wheelR*0.45} A ${wheelR} ${wheelR} 0 0 1 ${W.x} ${W.y - wheelR}`}
              fill="none" stroke="#6a6a88" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
          </g>
        ))}

        {/* ===== Рама ===== */}
        <line x1={BB.x} y1={BB.y} x2={SADDLE.x} y2={SADDLE.y + 2} stroke="url(#bsFrameGrad)" strokeWidth="6" strokeLinecap="round" />
        <line x1={SADDLE.x} y1={SADDLE.y + 2} x2={HT_BOT.x} y2={HT_BOT.y} stroke="url(#bsFrameGrad)" strokeWidth="5" strokeLinecap="round" />
        <line x1={BB.x} y1={BB.y} x2={HT_BOT.x} y2={HT_BOT.y} stroke="url(#bsFrameGrad)" strokeWidth="6" strokeLinecap="round" />
        <line x1={BB.x} y1={BB.y} x2={RW.x} y2={RW.y} stroke="url(#bsFrameGrad)" strokeWidth="5" strokeLinecap="round" />
        <line x1={SADDLE.x} y1={SADDLE.y + 2} x2={RW.x} y2={RW.y} stroke="#3a3a50" strokeWidth="3.5" strokeLinecap="round" />
        <line x1={HT_BOT.x} y1={HT_BOT.y} x2={FW.x} y2={FW.y} stroke="url(#bsFrameGrad)" strokeWidth="5" strokeLinecap="round" />
        <line x1={SADDLE.x} y1={SADDLE.y + 1} x2={HT_BOT.x} y2={HT_BOT.y - 1} stroke="#ff5c35" strokeWidth="1" opacity="0.35" strokeLinecap="round" />

        {/* ===== Каретка / шатуны ===== */}
        <circle cx={BB.x} cy={BB.y} r={9} fill="#3a3a50" stroke="#62627e" strokeWidth="2" />
        <line x1={BB.x} y1={BB.y} x2={PEDAL.x} y2={PEDAL.y} stroke="#ff5c35" strokeWidth="4.5" strokeLinecap="round" />
        <rect x={PEDAL.x - 8} y={PEDAL.y - 3} width="16" height="6" rx="2" fill="#ff5c35" />
        <circle cx={BB.x} cy={BB.y} r={15} fill="none" stroke="#ff5c35" strokeWidth="2.5" strokeDasharray="4 3" />

        {/* ===== Седло ===== */}
        <path d={`M ${saddlePts[0][0]} ${saddlePts[0][1]}
                  Q ${SADDLE.x - 2} ${SADDLE.y - 8} ${saddlePts[2][0]} ${saddlePts[2][1]}
                  L ${saddlePts[1][0]} ${saddlePts[1][1]} Z`}
          fill="#46465e" stroke="#6a6a86" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1={SADDLE.x} y1={SADDLE.y + 3} x2={SADDLE.x} y2={SADDLE.y + 18} stroke="#ff5c35" strokeWidth="3.5" strokeLinecap="round" />

        {/* ===== Руль ===== */}
        {hasDropbar ? (
          <>
            <path d={`M ${HB.x - 14} ${HB.y} Q ${HB.x - 15} ${HB.y + 15} ${HB.x - 7} ${HB.y + 21}`}
              fill="none" stroke="#ff5c35" strokeWidth="4.5" strokeLinecap="round" />
            <path d={`M ${HB.x + 14} ${HB.y} Q ${HB.x + 15} ${HB.y + 15} ${HB.x + 7} ${HB.y + 21}`}
              fill="none" stroke="#ff5c35" strokeWidth="4.5" strokeLinecap="round" />
            <line x1={HB.x - 14} y1={HB.y} x2={HB.x + 14} y2={HB.y} stroke="#ff5c35" strokeWidth="4.5" strokeLinecap="round" />
          </>
        ) : (
          <line x1={HB.x - 23} y1={HB.y} x2={HB.x + 23} y2={HB.y} stroke="#ff5c35" strokeWidth="5.5" strokeLinecap="round" />
        )}
        <line x1={HB.x} y1={HB.y} x2={HT_BOT.x} y2={HT_BOT.y} stroke="#ff5c35" strokeWidth="4" strokeLinecap="round" />
        <line x1={HT_BOT.x} y1={HT_BOT.y} x2={HT_BOT.x - 6} y2={HT_BOT.y - 28} stroke="#5a5a78" strokeWidth="5.5" strokeLinecap="round" />

        {/* ── Размерные линии ── */}
        <line x1={BB.x + 55} y1={BB.y} x2={BB.x + 55} y2={SADDLE.y}
          stroke="#ffd600" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <line x1={BB.x + 48} y1={BB.y} x2={BB.x + 62} y2={BB.y} stroke="#ffd600" strokeWidth="1" opacity="0.6" />
        <line x1={BB.x + 48} y1={SADDLE.y} x2={BB.x + 62} y2={SADDLE.y} stroke="#ffd600" strokeWidth="1" opacity="0.6" />
        <text x={BB.x + 64} y={(BB.y + SADDLE.y) / 2 + 4} fontSize="9" fill="#ffd600" opacity="0.9">
          {results.saddleHeight}мм
        </text>

        <line x1={HB.x - 28} y1={BB.y} x2={HB.x - 28} y2={HB.y}
          stroke="#00b4d8" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <text x={HB.x - 52} y={(BB.y + HB.y) / 2 + 4} fontSize="9" fill="#00b4d8" opacity="0.9">
          {results.stack}мм
        </text>

        <line x1={BB.x} y1={HB.y - 22} x2={HB.x} y2={HB.y - 22}
          stroke="#00e676" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <line x1={BB.x} y1={HB.y - 28} x2={BB.x} y2={HB.y - 16} stroke="#00e676" strokeWidth="1" opacity="0.6" />
        <line x1={HB.x} y1={HB.y - 28} x2={HB.x} y2={HB.y - 16} stroke="#00e676" strokeWidth="1" opacity="0.6" />
        <text x={(BB.x + HB.x) / 2 - 14} y={HB.y - 28} fontSize="9" fill="#00e676" opacity="0.9">
          {results.reach}мм
        </text>

        <rect x="8" y="8" width="110" height="54" rx="6" fill="rgba(10,10,15,0.7)" />
        {[
          { color: '#ffd600', label: 'Высота седла' },
          { color: '#00b4d8', label: 'Stack' },
          { color: '#00e676', label: 'Reach' },
        ].map((item, i) => (
          <g key={i}>
            <rect x="16" y={18 + i * 14} width="8" height="3" rx="1" fill={item.color} opacity="0.9" />
            <text x="30" y={22 + i * 14} fontSize="9" fill={item.color} opacity="0.9">{item.label}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
