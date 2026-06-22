import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SURFACES, TIRE_SETUPS, calcPressure, psiToBar, ETRTO_MAX_HOOKLESS, MIN_SAFE_PSI } from '../data/tirePressure'

function GaugeCard({ label, psi, color }) {
  const bar = psiToBar(psi)
  const pct = Math.min(((psi - MIN_SAFE_PSI) / (ETRTO_MAX_HOOKLESS - MIN_SAFE_PSI)) * 100, 100)
  return (
    <div className="tp-gauge-card" style={{ '--gauge-color': color }}>
      <span className="tp-gauge-label">{label}</span>
      <div className="tp-gauge-ring">
        <svg viewBox="0 0 120 120" className="tp-gauge-svg">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a38" strokeWidth="10" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${pct * 3.14} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)" />
        </svg>
        <div className="tp-gauge-center">
          <span className="tp-gauge-psi">{psi}</span>
          <span className="tp-gauge-unit">PSI</span>
        </div>
      </div>
      <span className="tp-gauge-bar">{bar} bar</span>
    </div>
  )
}

export default function TirePressure() {
  const navigate = useNavigate()
  const [riderWeight, setRiderWeight] = useState(75)
  const [bikeWeight, setBikeWeight]   = useState(9)
  const [tireWidth, setTireWidth]     = useState(28)
  const [surface, setSurface]         = useState('road')
  const [tireSetup, setTireSetup]     = useState('clincher')
  const [hookless, setHookless]       = useState(false)

  const surfaceInfo = SURFACES.find(s => s.id === surface)
  const setupInfo   = TIRE_SETUPS.find(t => t.id === tireSetup)

  const result = useMemo(() => calcPressure({
    riderWeightKg: riderWeight,
    bikeWeightKg: bikeWeight,
    tireWidthMm: tireWidth,
    surfaceFactor: surfaceInfo.factor,
    tireMult: setupInfo.mult,
  }), [riderWeight, bikeWeight, tireWidth, surfaceInfo, setupInfo])

  const overHookless = hookless && (result.front >= 73 || result.rear >= 73)

  return (
    <div className="tp-screen">
      <button className="btn-back-nav" onClick={() => navigate('/')}>← На главную</button>

      <div className="tp-header">
        <span className="tp-header-icon">💨</span>
        <h1 className="tp-title">ДАВЛЕНИЕ</h1>
        <p className="tp-sub">Подбор PSI по весу и покрытию</p>
      </div>

      {/* Результаты сверху */}
      <div className="tp-gauges-row">
        <GaugeCard label="Переднее" psi={result.front} color="#00b4d8" />
        <GaugeCard label="Заднее"   psi={result.rear}  color="#ff5c35" />
      </div>

      {overHookless && (
        <div className="wind-error">⚠️ Давление выше лимита hookless-ободов (73 PSI / 5 bar по ETRTO). Не превышай максимум на ободе.</div>
      )}

      {/* Вес */}
      <div className="tp-section">
        <p className="tp-section-title">⚖️ Вес системы</p>
        <div className="fit-input-group">
          <label className="fit-label">Твой вес</label>
          <div className="fit-input-row">
            <input type="number" className="fit-input" value={riderWeight}
              onChange={e => setRiderWeight(Number(e.target.value))} min={30} max={180} />
            <span className="fit-unit">кг</span>
          </div>
        </div>
        <div className="fit-input-group">
          <label className="fit-label">Вес байка со снарягой</label>
          <div className="fit-input-row">
            <input type="number" className="fit-input" value={bikeWeight}
              onChange={e => setBikeWeight(Number(e.target.value))} min={5} max={30} step={0.5} />
            <span className="fit-unit">кг</span>
          </div>
        </div>
      </div>

      {/* Ширина */}
      <div className="tp-section">
        <p className="tp-section-title">📏 Ширина покрышки</p>
        <div className="fit-input-group">
          <div className="fit-input-row">
            <input type="number" className="fit-input" value={tireWidth}
              onChange={e => setTireWidth(Number(e.target.value))} min={18} max={65} />
            <span className="fit-unit">мм</span>
          </div>
          <span className="input-hint">Шоссе 23–32мм · Гравел 35–45мм · MTB 55–65мм</span>
        </div>
      </div>

      {/* Тип покрышки */}
      <div className="tp-section">
        <p className="tp-section-title">🛞 Тип покрышки</p>
        <div className="tp-pill-row">
          {TIRE_SETUPS.map(t => (
            <button key={t.id} className={`tp-pill ${tireSetup === t.id ? 'active' : ''}`}
              onClick={() => setTireSetup(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="tier-hint">{setupInfo.desc}</p>
      </div>

      {/* Поверхность */}
      <div className="tp-section">
        <p className="tp-section-title">🏔️ Покрытие</p>
        <div className="tp-surface-grid">
          {SURFACES.map(s => (
            <button key={s.id} className={`tp-surface-card ${surface === s.id ? 'active' : ''}`}
              onClick={() => setSurface(s.id)}>
              <span className="tp-surface-emoji">{s.emoji}</span>
              <span className="tp-surface-label">{s.label}</span>
              <span className="tp-surface-desc">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hookless */}
      <label className="tp-checkbox-row">
        <input type="checkbox" checked={hookless} onChange={e => setHookless(e.target.checked)} />
        <span>У меня hookless-ободья (проверить лимит ETRTO 73 PSI)</span>
      </label>

      <div className="fit-disclaimer">
        <span>⚠️</span>
        <p>Расчёт — стартовая точка по методологии SRAM/ENVE/SILCA. Никогда не превышай максимум на боковине покрышки или ободе. Корректируй под ощущения на первой поездке.</p>
      </div>
    </div>
  )
}
