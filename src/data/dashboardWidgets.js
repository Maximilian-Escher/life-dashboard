export const WIDGET_LABELS = {
  weather: 'Wetter',
  recovery: 'Recovery',
  creatine: 'Kreatin',
  training: 'Training',
  oura: 'Oura-Übersicht',
  stats: 'Stats',
  streaks: 'Streak-Grid',
  skilltree: 'Skill-Tree Hinweis',
}

// Spalten im Desktop-Grid (siehe Breakpoints/cols in Home.jsx).
export const COLS = 4

// Default-Größe + Grenzen pro Widget-Typ, in Grid-Einheiten (w/h = Spalten/
// Zeilen, siehe rowHeight in Home.jsx für die Pixel-Umrechnung).
//
// Glass-Redesign: Wetter ist jetzt volle Zeilenbreite (w:4 statt 2) —
// bewusst niedrig (h:2) für eine schlanke Banner-Karte statt eines hohen
// Blocks.
export const WIDGET_SIZES = {
  weather: { w: 4, h: 2, minW: 2, minH: 2, maxW: 4, maxH: 3 },
  recovery: { w: 4, h: 2, minW: 2, minH: 2, maxW: 4, maxH: 3 },
  creatine: { w: 2, h: 4, minW: 1, minH: 3, maxW: 4, maxH: 5 },
  training: { w: 2, h: 4, minW: 1, minH: 3, maxW: 4, maxH: 5 },
  oura: { w: 4, h: 3, minW: 2, minH: 2, maxW: 4, maxH: 4 },
  stats: { w: 4, h: 3, minW: 2, minH: 2, maxW: 4, maxH: 4 },
  streaks: { w: 4, h: 3, minW: 2, minH: 2, maxW: 4, maxH: 4 },
  skilltree: { w: 2, h: 3, minW: 1, minH: 2, maxW: 4, maxH: 4 },
}

export const DEFAULT_WIDGET_ORDER = [
  'weather',
  'recovery',
  'creatine',
  'training',
  'oura',
  'stats',
  'streaks',
  'skilltree',
]
