// Dashboard-Grid-Layout (Position + Größe + Sichtbarkeit der Home-Widgets)
// in Supabase (Tabelle "dashboard_layout", RLS auf auth.uid()).

import { supabase } from './supabaseClient.js'
import { COLS, WIDGET_SIZES, DEFAULT_WIDGET_ORDER } from '../data/dashboardWidgets.js'

// Einfacher Zeilen-Packer: platziert Widgets der Reihe nach, bricht in eine
// neue Zeile um, sobald die aktuelle nicht mehr passt. Kein perfektes
// Bin-Packing (das würde die vorgegebene Reihenfolge durcheinanderbringen),
// aber ein vernünftiger, nachvollziehbarer Startzustand.
function packWidgets(keys, startY = 0) {
  let x = 0
  let y = startY
  let rowHeight = 0
  const packed = []

  for (const key of keys) {
    const size = WIDGET_SIZES[key]
    if (!size) continue
    if (x + size.w > COLS) {
      x = 0
      y += rowHeight
      rowHeight = 0
    }
    packed.push({ key, x, y, w: size.w, h: size.h, visible: true })
    x += size.w
    rowHeight = Math.max(rowHeight, size.h)
  }

  return packed
}

export function buildDefaultLayout() {
  return packWidgets(DEFAULT_WIDGET_ORDER)
}

function appendMissingWidgets(existing, missingKeys) {
  const maxY = existing.reduce((max, item) => Math.max(max, item.y + item.h), 0)
  return packWidgets(missingKeys, maxY)
}

export async function getLayout() {
  const { data, error } = await supabase.from('dashboard_layout').select('widget_key, x, y, w, h, visible')

  if (error) throw error

  if (data.length === 0) {
    return buildDefaultLayout()
  }

  // Altes listenbasiertes Layout (vor dem Grid-Wechsel) erkennen: da lagen
  // alle Zeilen mangels x/y-Spalten auf dem Default 0/0 – in einem echten
  // Grid ist das für mehrere Widgets gleichzeitig unmöglich (Überlappung),
  // also ein sicheres Signal fürs Migrieren statt Datenverlust.
  const isLegacyFormat = data.every((row) => row.x === 0 && row.y === 0)
  if (isLegacyFormat) {
    const visibleByKey = Object.fromEntries(data.map((row) => [row.widget_key, row.visible]))
    return buildDefaultLayout().map((item) => ({ ...item, visible: visibleByKey[item.key] ?? true }))
  }

  const known = new Set(data.map((row) => row.widget_key))
  const missingKeys = DEFAULT_WIDGET_ORDER.filter((key) => !known.has(key))
  const existing = data.map(({ widget_key, x, y, w, h, visible }) => ({ key: widget_key, x, y, w, h, visible }))

  return missingKeys.length > 0 ? [...existing, ...appendMissingWidgets(existing, missingKeys)] : existing
}

export async function saveLayout(items) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt.')

  const rows = items.map((item) => ({
    user_id: user.id,
    widget_key: item.key,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    visible: item.visible,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('dashboard_layout').upsert(rows, { onConflict: 'user_id,widget_key' })
  if (error) throw error
}

// Packt ein Grid-Layout auf weniger Spalten um (für schmalere Breakpoints).
// Höhe bleibt erhalten, Breite wird gekappt; Reihenfolge (von oben nach
// unten, links nach rechts) bleibt erhalten.
export function deriveLayoutForCols(layoutItems, cols) {
  const sorted = [...layoutItems].sort((a, b) => a.y - b.y || a.x - b.x)
  let x = 0
  let y = 0
  let rowHeight = 0
  const packed = []

  for (const item of sorted) {
    const w = Math.min(item.w, cols)
    if (x + w > cols) {
      x = 0
      y += rowHeight
      rowHeight = 0
    }
    packed.push({
      ...item,
      x,
      y,
      w,
      minW: Math.min(item.minW ?? w, cols),
      maxW: Math.min(item.maxW ?? w, cols),
    })
    x += w
    rowHeight = Math.max(rowHeight, item.h)
  }

  return packed
}
