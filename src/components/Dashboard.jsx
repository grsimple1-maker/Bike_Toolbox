import { useState, useMemo } from 'react'
import { COMPONENTS, BIKE_TYPES, COMPONENT_TIERS } from '../data/maintenance'
import { logService } from '../data/storage'

function exportServiceLogPDF(bike) {
  const lines = [
    `BikeWrench — История обслуживания`,
    `Байк: ${bike.bikeName}`,
    `Пробег: ${bike.mileage} км`,
    ``,
    `Дата       | Пробег  | Компонент            | Заметка`,
    `-----------|---------|----------------------|-------------------`,
    ...(bike.serviceLog || []).map(e =>
      `${new Date(e.date).toLocaleDateString('ru').padEnd(10)} | ${String(e.mileage).padEnd(7)} | ${e.componentName.padEnd(20)} | ${e.note || ''}`
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bikewrench_${bike.bikeName.replace(/\s+/g,'_')}_log.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// tier multiplier масштабирует диапазон: лучше компоненты — дольше живут
function getScaledRange(rawRange, tierMult) {
  if (!rawRange) return null
  const [min, max] = rawRange
  return [Math.round(min * tierMult), Math.round(max * tierMult)]
}

// Статус строится от диапазона [min, max], не от одной цифры:
// до min — всё ОК; между min и max — "пора проверить"; после max — просрочено по верхней границе ориентира
function getStatus(component, bikeType, totalMileage, lastServices, tierMult) {
  const rawRange = component.intervals[bikeType]
  const range = getScaledRange(rawRange, tierMult)
  if (!range) return null
  const [min, max] = range
  const lastAt = lastServices[component.id] ?? 0
  const kmSinceLast = totalMileage - lastAt
  const pct = kmSinceLast / max

  if (kmSinceLast >= max) return { level: 'overdue', pct: Math.min(pct, 1.4), kmSinceLast, range }
  if (kmSinceLast >= min) return { level: 'soon', pct, kmSinceLast, range }
  return { level: 'ok', pct, kmSinceLast, range }
}

function ProgressBar({ pct, level }) {
  return (
    <div className="progress-track">
      <div className={`progress-fill ${level}`} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
    </div>
  )
}

function ComponentCard({ component, status, onService }) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  if (!status) return null

  const handleService = () => {
    onService(component.id, component.name, note)
    setNote('')
    setExpanded(false)
  }

  const [min, max] = status.range

  return (
    <div className={`comp-card ${status.level}`} onClick={() => setExpanded(e => !e)}>
      <div className="comp-top">
        <span className="comp-icon">{component.icon}</span>
        <div className="comp-info">
          <span className="comp-name">{component.name}</span>
          <span className="comp-cat">{component.category}</span>
        </div>
        <div className="comp-status">
          {status.level === 'overdue' && <span className="badge overdue">Проверь!</span>}
          {status.level === 'soon'    && <span className="badge soon">Скоро</span>}
          {status.level === 'ok'      && <span className="badge ok">OK</span>}
        </div>
      </div>
      <ProgressBar pct={status.pct} level={status.level} />
      <div className="comp-meta">
        <span>{status.kmSinceLast.toLocaleString()} км с замены</span>
        <span className="comp-range">ориентир {min.toLocaleString()}–{max.toLocaleString()} км</span>
      </div>
      {expanded && (
        <div className="comp-detail" onClick={e => e.stopPropagation()}>
          <p className="comp-desc">{component.description}</p>
          {component.signs?.length > 0 && (
            <div className="comp-signs">
              <p className="comp-signs-title">🔍 Признаки что пора менять:</p>
              <ul className="comp-signs-list">
                {component.signs.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          <div className="comp-cost-row">💰 {component.cost}</div>
          <input
            className="note-input"
            placeholder="Заметка (необязательно): мастер, запчасть..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <button className="btn-service" onClick={handleService}>✓ Отметить как сделано</button>
        </div>
      )}
    </div>
  )
}

function ServiceLog({ log, onExport }) {
  if (!log.length) return (
    <div className="log-empty">
      <span>📋</span>
      <p>История пуста — отмечай обслуживания</p>
    </div>
  )
  return (
    <>
      <div className="log-actions-row">
        <span className="log-total-label">Записей: {log.length}</span>
        <button className="btn-export" onClick={onExport}>⬇ Экспорт</button>
      </div>
      <div className="log-list">
        {log.map(entry => (
          <div key={entry.id} className="log-entry">
            <div className="log-left">
              <span className="log-name">{entry.componentName}</span>
              {entry.note && <span className="log-note">{entry.note}</span>}
            </div>
            <div className="log-right">
              <span className="log-km">{entry.mileage.toLocaleString()} км</span>
              <span className="log-date">{new Date(entry.date).toLocaleDateString('ru')}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default function Dashboard({ bike, onUpdate, onBack }) {
  const [mileage, setMileage]               = useState(bike.mileage)
  const [editingMileage, setEditingMileage] = useState(false)
  const [tempMileage, setTempMileage]       = useState(bike.mileage)
  const [statusFilter, setStatusFilter]     = useState('all')
  const [activeTab, setActiveTab]           = useState('status') // 'status' | 'log'
  const [tier, setTier]                     = useState(bike.componentTier || 'mid')

  const bikeLabel = BIKE_TYPES.find(t => t.id === bike.bikeType)
  const tierInfo  = COMPONENT_TIERS.find(t => t.id === tier) || COMPONENT_TIERS[1]

  const statuses = useMemo(() => {
    const r = {}
    COMPONENTS.forEach(c => { r[c.id] = getStatus(c, bike.bikeType, mileage, bike.lastServices, tierInfo.mult) })
    return r
  }, [mileage, bike.lastServices, bike.bikeType, tierInfo.mult])

  const counts = useMemo(() => ({
    overdue: COMPONENTS.filter(c => statuses[c.id]?.level === 'overdue').length,
    soon:    COMPONENTS.filter(c => statuses[c.id]?.level === 'soon').length,
    ok:      COMPONENTS.filter(c => statuses[c.id]?.level === 'ok').length,
  }), [statuses])

  const total = counts.overdue + counts.soon + counts.ok

  const filtered = useMemo(() =>
    COMPONENTS.filter(c => {
      const s = statuses[c.id]
      if (!s) return false
      return statusFilter === 'all' || s.level === statusFilter
    }), [statusFilter, statuses])

  const saveMileage = () => {
    const val = parseInt(tempMileage) || 0
    setMileage(val)
    onUpdate({ ...bike, mileage: val })
    setEditingMileage(false)
  }

  const changeTier = (newTier) => {
    setTier(newTier)
    onUpdate({ ...bike, componentTier: newTier })
  }

  const handleService = (componentId, componentName, note) => {
    const updated = logService(bike, componentId, componentName, mileage, note)
    onUpdate(updated)
  }

  const lastServices = bike.lastServices

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>← Гараж</button>
          <div>
            <h1 className="dash-title">{bike.bikeName}</h1>
            <span className="dash-type">{bikeLabel?.emoji} {bikeLabel?.label}</span>
          </div>
        </div>
        <div className="mileage-block" onClick={() => !editingMileage && setEditingMileage(true)}>
          {editingMileage ? (
            <div className="mileage-edit" onClick={e => e.stopPropagation()}>
              <input type="number" value={tempMileage}
                onChange={e => setTempMileage(e.target.value)}
                className="mileage-input" autoFocus
                onKeyDown={e => e.key === 'Enter' && saveMileage()} />
              <button className="btn-save" onClick={saveMileage}>✓</button>
            </div>
          ) : (
            <>
              <span className="mileage-val">{mileage.toLocaleString()}</span>
              <span className="mileage-label">км ✏️</span>
            </>
          )}
        </div>
      </header>

      {/* Component tier selector */}
      <div className="tier-row">
        <span className="tier-label">Уровень компонентов:</span>
        <div className="tier-buttons">
          {COMPONENT_TIERS.map(t => (
            <button key={t.id} className={`tier-btn ${tier === t.id ? 'active' : ''}`}
              onClick={() => changeTier(t.id)} title={t.desc}>
              {t.label}
            </button>
          ))}
        </div>
        <p className="tier-hint">{tierInfo.desc} — влияет на ориентир износа</p>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        <button className={`tab ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>
          Состояние
        </button>
        <button className={`tab ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>
          История {bike.serviceLog?.length > 0 && <span className="tab-badge">{bike.serviceLog.length}</span>}
        </button>
      </div>

      {activeTab === 'status' && (
        <>
          {/* Disclaimer */}
          <div className="maint-disclaimer">
            <span>ℹ️</span>
            <p>Километраж — это ориентир «когда начать проверять», а не точная дата замены. Реальный износ зависит от погоды, стиля езды и ухода — смотри на признаки износа внутри карточки.</p>
          </div>

          {/* Summary */}
          <div className="summary-row">
            <button className={`summary-chip overdue ${statusFilter === 'overdue' ? 'active' : ''}`}
              onClick={() => setStatusFilter(f => f === 'overdue' ? 'all' : 'overdue')}>
              <span className="chip-num">{counts.overdue}</span><span>Проверь</span>
            </button>
            <button className={`summary-chip soon ${statusFilter === 'soon' ? 'active' : ''}`}
              onClick={() => setStatusFilter(f => f === 'soon' ? 'all' : 'soon')}>
              <span className="chip-num">{counts.soon}</span><span>Скоро</span>
            </button>
            <button className={`summary-chip ok ${statusFilter === 'ok' ? 'active' : ''}`}
              onClick={() => setStatusFilter(f => f === 'ok' ? 'all' : 'ok')}>
              <span className="chip-num">{counts.ok}</span><span>OK</span>
            </button>
          </div>

          {/* Health bar */}
          <div className="health-section">
            <div className="health-label">
              <span>Состояние байка</span>
              <span>{total > 0 ? Math.round((counts.ok / total) * 100) : 100}%</span>
            </div>
            <div className="health-track">
              <div className="health-fill overdue" style={{ width: `${(counts.overdue / Math.max(total,1)) * 100}%` }} />
              <div className="health-fill soon"    style={{ width: `${(counts.soon    / Math.max(total,1)) * 100}%` }} />
              <div className="health-fill ok"      style={{ width: `${(counts.ok      / Math.max(total,1)) * 100}%` }} />
            </div>
          </div>

          <div className="comp-list">
            {filtered.length === 0 && (
              <div className="empty-state"><span>🎉</span><p>Всё в порядке!</p></div>
            )}
            {filtered.map(c => (
              <ComponentCard
                key={c.id} component={c}
                status={statuses[c.id]}
                onService={handleService}
              />
            ))}
          </div>
          <p className="footer-note">Нажми на карточку — признаки износа и отметка обслуживания</p>
        </>
      )}

      {activeTab === 'log' && (
        <div className="log-section">
          <ServiceLog log={bike.serviceLog || []} onExport={() => exportServiceLogPDF(bike)} />
        </div>
      )}
    </div>
  )
}
