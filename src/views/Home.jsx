import { useEffect, useMemo, useState } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { recovery as dummyRecovery, dailyQuests } from '../data/dummyData.js'
import { WIDGET_LABELS, WIDGET_SIZES } from '../data/dashboardWidgets.js'
import { connectOura, isConnected, clearTokens } from '../lib/ouraAuth.js'
import { fetchOuraDays } from '../lib/ouraApi.js'
import { getLoggedDates, toggleDay, todayIso, getCurrentStreak } from '../lib/habitLog.js'
import { getPortfolioSnapshots, getPortfolioGoal } from '../lib/portfolio.js'
import { calculateVitalitaet, calculateDisziplin, calculateWealth, getOuraHabitDates } from '../lib/stats.js'
import { getCompletedNodeIds } from '../lib/skillTreeProgress.js'
import { getNodes as getSkillTreeNodes } from '../lib/skillTreeNodes.js'
import { getInProgressNodeByBranch } from '../lib/skillTree.js'
import { skillTreeBranches } from '../data/skillTree.js'
import { getLayout, saveLayout, deriveLayoutForCols } from '../lib/dashboardLayout.js'
import GridWidgetItem from '../components/dashboard/GridWidgetItem.jsx'
import RecoveryWidget from '../components/widgets/RecoveryWidget.jsx'
import HabitToggleWidget from '../components/widgets/HabitToggleWidget.jsx'
import OuraWidget from '../components/widgets/OuraWidget.jsx'
import StatsWidget from '../components/widgets/StatsWidget.jsx'
import StreakPreviewWidget from '../components/widgets/StreakPreviewWidget.jsx'
import SkillTreeHintWidget from '../components/widgets/SkillTreeHintWidget.jsx'
import WeatherWidget from '../components/widgets/WeatherWidget.jsx'

const ResponsiveGridLayout = WidthProvider(Responsive)

const BREAKPOINTS = { lg: 600, md: 400, sm: 0 }
const COLS_BY_BREAKPOINT = { lg: 4, md: 2, sm: 1 }
const ROW_HEIGHT = 56
const GRID_MARGIN = [20, 20]

const OURA_FETCH_DAYS = 30

function recoveryFromScore(score) {
  if (score >= 85) return { status: 'buff', note: 'Sehr gute Erholung letzte Nacht.' }
  if (score >= 70) return { status: 'buff', note: 'Gute Erholung letzte Nacht.' }
  if (score >= 50) return { status: 'neutral', note: 'Mittlere Erholung – heute moderat trainieren.' }
  return { status: 'debuff', note: 'Niedrige Erholung – intensives Training heute suboptimal.' }
}

export default function Home() {
  const [connected, setConnected] = useState(isConnected())
  const [connecting, setConnecting] = useState(false)
  const [ouraDays, setOuraDays] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [creatineDates, setCreatineDates] = useState(new Set())
  const [creatineError, setCreatineError] = useState(null)
  const [trainingDates, setTrainingDates] = useState(new Set())
  const [trainingError, setTrainingError] = useState(null)
  const [portfolio, setPortfolio] = useState({ value: null, goal: null })
  const [skillCompletedIds, setSkillCompletedIds] = useState(new Set())
  const [skillNodes, setSkillNodes] = useState([])

  const [layout, setLayout] = useState([])
  const [layoutError, setLayoutError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [currentCols, setCurrentCols] = useState(null)

  useEffect(() => {
    if (!connected) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchOuraDays(OURA_FETCH_DAYS)
      .then(({ days }) => {
        if (!cancelled) setOuraDays(days)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [connected])

  useEffect(() => {
    let cancelled = false
    getLoggedDates('creatine')
      .then((dates) => {
        if (!cancelled) setCreatineDates(dates)
      })
      .catch((err) => {
        if (!cancelled) setCreatineError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getLoggedDates('training')
      .then((dates) => {
        if (!cancelled) setTrainingDates(dates)
      })
      .catch((err) => {
        if (!cancelled) setTrainingError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getPortfolioSnapshots(3650), getPortfolioGoal()])
      .then(([snapshots, goal]) => {
        if (!cancelled) setPortfolio({ value: snapshots[snapshots.length - 1]?.value ?? null, goal })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([getSkillTreeNodes(), getCompletedNodeIds()])
      .then(([nodeList, ids]) => {
        if (!cancelled) {
          setSkillNodes(nodeList)
          setSkillCompletedIds(ids)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getLayout()
      .then((items) => {
        if (!cancelled) setLayout(items)
      })
      .catch((err) => {
        if (!cancelled) setLayoutError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleConnect() {
    setError(null)
    setConnecting(true)
    try {
      await connectOura()
      setConnected(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }

  function handleDisconnect() {
    clearTokens()
    setConnected(false)
    setOuraDays(null)
  }

  async function handleToggleCreatine() {
    setCreatineError(null)
    try {
      const dates = await toggleDay('creatine', todayIso())
      setCreatineDates(dates)
    } catch (err) {
      setCreatineError(err.message)
    }
  }

  async function handleToggleTraining() {
    setTrainingError(null)
    try {
      const dates = await toggleDay('training', todayIso())
      setTrainingDates(dates)
    } catch (err) {
      setTrainingError(err.message)
    }
  }

  function toggleWidgetVisible(key) {
    setLayout((items) => {
      const next = items.map((i) => (i.key === key ? { ...i, visible: !i.visible } : i))
      saveLayout(next).catch((err) => setLayoutError(err.message))
      return next
    })
  }

  function handleLayoutChange(currentBpLayout) {
    if (!editing) return
    setLayout((prev) => {
      const next = prev.map((item) => {
        const changed = currentBpLayout.find((l) => l.i === item.key)
        if (!changed) return item
        if (currentCols === COLS_BY_BREAKPOINT.lg) {
          return { ...item, x: changed.x, y: changed.y, w: changed.w, h: changed.h }
        }
        return { ...item, h: changed.h }
      })
      saveLayout(next).catch((err) => setLayoutError(err.message))
      return next
    })
  }

  const creatineToday = creatineDates.has(todayIso())
  const creatineStreak = getCurrentStreak(creatineDates)
  const trainingToday = trainingDates.has(todayIso())
  const trainingStreak = getCurrentStreak(trainingDates)

  const disziplinHabitDates = {
    creatine: creatineDates,
    training: trainingDates,
    ...(ouraDays ? { steps: getOuraHabitDates(ouraDays, 'steps') } : {}),
  }

  const statCards = [
    { key: 'vitalitaet', label: 'Vitalität', value: ouraDays ? calculateVitalitaet(ouraDays.slice(-7)) : null },
    { key: 'disziplin', label: 'Disziplin', value: calculateDisziplin(disziplinHabitDates, 30) },
    { key: 'wealth', label: 'Wealth', value: calculateWealth(portfolio.value, portfolio.goal) },
  ]

  const inProgressByBranch = getInProgressNodeByBranch(skillNodes, skillCompletedIds)
  const inProgressBranches = skillTreeBranches.filter((b) => inProgressByBranch[b.key])

  const latestDay = ouraDays?.[ouraDays.length - 1]
  const recoveryScore = latestDay?.readinessScore
  const recoveryInfo = recoveryScore != null ? recoveryFromScore(recoveryScore) : null
  const recoveryBadge = recoveryInfo?.status ?? (dummyRecovery.status === 'buff' ? 'buff' : 'debuff')
  const recoveryBarValue = recoveryScore ?? dummyRecovery.score
  const recoveryNote = loading ? 'Lade Oura-Daten…' : (recoveryInfo?.note ?? dummyRecovery.note)

  const widgetContent = {
    weather: <WeatherWidget />,
    recovery: <RecoveryWidget badge={recoveryBadge} barValue={recoveryBarValue} note={recoveryNote} />,
    creatine: (
      <HabitToggleWidget
        title="Kreatin"
        doneLabel="Heute genommen"
        notDoneLabel="Heute noch nicht genommen"
        dates={creatineDates}
        today={creatineToday}
        streak={creatineStreak}
        error={creatineError}
        onToggle={handleToggleCreatine}
      />
    ),
    training: (
      <HabitToggleWidget
        title="Training"
        doneLabel="Heute gemacht"
        notDoneLabel="Heute noch nicht gemacht"
        dates={trainingDates}
        today={trainingToday}
        streak={trainingStreak}
        error={trainingError}
        onToggle={handleToggleTraining}
      />
    ),
    oura: <OuraWidget connected={connected} ouraDays={ouraDays} />,
    stats: <StatsWidget statCards={statCards} />,
    streaks: <StreakPreviewWidget dates={creatineDates} />,
    skilltree: <SkillTreeHintWidget branches={inProgressBranches} inProgressByBranch={inProgressByBranch} />,
  }

  const visibleLayout = editing ? layout : layout.filter((item) => item.visible)

  const lgLayoutItems = useMemo(
    () =>
      visibleLayout.map((item) => {
        const { minW, maxW, minH, maxH } = WIDGET_SIZES[item.key]
        return { i: item.key, x: item.x, y: item.y, w: item.w, h: item.h, minW, maxW, minH, maxH }
      }),
    [visibleLayout],
  )

  const gridLayouts = useMemo(
    () => ({
      lg: lgLayoutItems,
      md: deriveLayoutForCols(lgLayoutItems, COLS_BY_BREAKPOINT.md),
      sm: deriveLayoutForCols(lgLayoutItems, COLS_BY_BREAKPOINT.sm),
    }),
    [lgLayoutItems],
  )

  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Übersicht</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {connected ? 'Live-Daten von Oura' : 'Platzhalter-Daten – noch keine Live-Integration'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {connected ? (
            <button
              onClick={handleDisconnect}
              className="rounded-xl border border-white/10 px-3.5 py-2.5 text-[13px] font-medium text-zinc-400 hover:text-zinc-200"
            >
              Oura trennen
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))' }}
            >
              {connecting ? 'Verbinde…' : 'Mit Oura verbinden'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="rounded-xl px-4.5 py-2.5 text-[13.5px] font-semibold transition-colors"
            style={
              editing
                ? { background: 'rgba(255,255,255,0.1)', color: 'white' }
                : {
                    background: 'linear-gradient(140deg, var(--color-accent), var(--color-accent-soft))',
                    color: 'white',
                    boxShadow: '0 10px 24px -8px rgba(99,102,241,0.55)',
                  }
            }
          >
            {editing ? 'Fertig' : 'Dashboard anpassen'}
          </button>
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">{error}</p>
      )}
      {layoutError && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
          {layoutError}
        </p>
      )}
      {editing && (
        <p className="text-xs text-zinc-500">
          Ziehe Widgets per Punkte-Icon zum Umsortieren, am rechten/unteren Rand zum Verändern der Größe. Checkbox
          blendet ein/aus.
        </p>
      )}

      {layout.length > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={gridLayouts}
          breakpoints={BREAKPOINTS}
          cols={COLS_BY_BREAKPOINT}
          rowHeight={ROW_HEIGHT}
          margin={GRID_MARGIN}
          containerPadding={[0, 0]}
          compactType="vertical"
          isBounded
          isDraggable={editing}
          isResizable={editing}
          resizeHandles={['e', 's', 'se']}
          draggableHandle=".widget-drag-handle"
          onWidthChange={(width, margin, cols) => setCurrentCols(cols)}
          onLayoutChange={handleLayoutChange}
        >
          {visibleLayout.map((item) => (
            <GridWidgetItem
              key={item.key}
              label={WIDGET_LABELS[item.key]}
              visible={item.visible}
              editing={editing}
              onToggleVisible={() => toggleWidgetVisible(item.key)}
            >
              {widgetContent[item.key]}
            </GridWidgetItem>
          ))}
        </ResponsiveGridLayout>
      )}

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="mb-3 text-[12.5px] font-semibold text-zinc-400">Daily Quests</h2>
        <ul className="flex flex-col gap-2.5">
          {dailyQuests.map((q) => (
            <li key={q.id} className="flex items-center gap-3 text-sm">
              <span
                className="flex h-4 w-4 items-center justify-center rounded border"
                style={{
                  borderColor: q.done ? 'var(--color-accent)' : 'var(--glass-border)',
                  background: q.done ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {q.done && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className={q.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}>{q.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
