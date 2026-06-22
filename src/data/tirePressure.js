export const SURFACES = [
  { id: 'smooth',  label: 'Гладкий асфальт',  emoji: '🛣️', factor: 1.10, desc: 'Трек, новый асфальт' },
  { id: 'road',    label: 'Обычная дорога',    emoji: '🚗',  factor: 1.0,  desc: 'Город, трещины, стыки' },
  { id: 'gravel',  label: 'Гравий / грунт',    emoji: '🌾',  factor: 0.88, desc: 'Смешанное покрытие' },
  { id: 'trail',   label: 'Трейл / тропа',     emoji: '🏔️', factor: 0.78, desc: 'Корни, камни, мягкий грунт' },
  { id: 'rough',   label: 'Жёсткий MTB трейл', emoji: '🪨',  factor: 0.68, desc: 'Эндуро / даунхилл' },
]

export const TIRE_SETUPS = [
  { id: 'tubeless', label: 'Бескамерная',  mult: 0.92, desc: 'Можно держать ниже — нет риска прокола камеры' },
  { id: 'clincher',  label: 'С камерой',    mult: 1.0,  desc: 'Стандартная связка покрышка + камера' },
  { id: 'tubular',   label: 'Туб',          mult: 1.08, desc: 'Клеевая, держит выше давление' },
]

export const ETRTO_MAX_HOOKLESS = 73
export const MIN_SAFE_PSI       = 18

const K = 532

export function calcPressure({ riderWeightKg, bikeWeightKg, tireWidthMm, surfaceFactor, tireMult }) {
  const totalLbs = (riderWeightKg + bikeWeightKg) * 2.205
  const widthIn  = tireWidthMm * 0.03937
  const base = (totalLbs * K) / (Math.pow(widthIn, 1.5) * 1000)
  const adj  = base * surfaceFactor * tireMult
  const clamp = v => Math.round(Math.max(MIN_SAFE_PSI, v))
  return {
    front:   clamp(adj * 0.94),
    rear:    clamp(adj * 1.06),
    basePsi: Math.round(base),
  }
}

export function psiToBar(psi) {
  return (psi / 14.5038).toFixed(1)
}
