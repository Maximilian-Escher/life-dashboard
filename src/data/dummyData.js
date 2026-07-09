// Platzhalter-Daten fürs Grundgerüst. Struktur bleibt gleich, wenn später
// echte Daten von Oura/Supabase reinkommen.

export const recovery = {
  score: 72,
  status: 'buff', // 'buff' | 'neutral' | 'debuff'
  note: 'Guter Tiefschlafanteil letzte Nacht.',
}

export const dailyQuests = [
  { id: 'steps', label: '8.000 Schritte', done: false },
  { id: 'sleep', label: 'Schlafenszeit eingehalten', done: false },
]

// source: 'manual' = per Toggle in habit_logs gepflegt, 'oura' = automatisch
// aus den Oura-Tagesdaten abgeleitet (siehe getOuraHabitDates in stats.js).
export const habits = [
  { key: 'creatine', label: 'Kreatin', source: 'manual' },
  { key: 'training', label: 'Training', source: 'manual' },
  { key: 'steps', label: 'Schritte', source: 'oura' },
  { key: 'sleep', label: 'Schlafenszeit', source: 'oura' },
]
