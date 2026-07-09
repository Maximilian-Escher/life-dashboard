// Platzhalter-Daten fürs Grundgerüst. Struktur bleibt gleich, wenn später
// echte Daten von Oura/Strava/Supabase reinkommen.

export const stats = [
  { key: 'vitalitaet', label: 'Vitalität', value: 68, level: 7, xp: 340, xpToNext: 500 },
  { key: 'disziplin', label: 'Disziplin', value: 74, level: 8, xp: 120, xpToNext: 400 },
  { key: 'wealth', label: 'Wealth', value: 41, level: 4, xp: 90, xpToNext: 300 },
]

export const recovery = {
  score: 72,
  status: 'buff', // 'buff' | 'neutral' | 'debuff'
  note: 'Guter Tiefschlafanteil letzte Nacht.',
}

export const dailyQuests = [
  { id: 'creatine', label: 'Kreatin genommen', done: true },
  { id: 'steps', label: '8.000 Schritte', done: false },
  { id: 'sleep', label: 'Schlafenszeit eingehalten', done: false },
]

export const habits = [
  { key: 'creatine', label: 'Kreatin' },
  { key: 'training', label: 'Training' },
  { key: 'sleep', label: 'Schlafenszeit' },
]

export const skillTree = [
  {
    branch: 'Business',
    nodes: [
      { id: 'meta-blueprint', label: 'Meta Blueprint Zertifizierung', status: 'done' },
      { id: 'google-digital-garage', label: 'Google Digital Garage', status: 'in-progress' },
      { id: 'meta-ads-associate', label: 'Meta Ads Associate Exam', status: 'locked' },
      { id: 'first-client', label: 'Erster Referenzkunde', status: 'locked' },
      { id: 'gewerbe', label: 'Gewerbeanmeldung', status: 'locked' },
    ],
  },
  {
    branch: 'Bildung',
    nodes: [
      { id: 'ausbildung', label: 'Ausbildungsabschluss', status: 'done' },
      { id: 'bos', label: 'BOS Kulmbach', status: 'in-progress' },
      { id: 'fachhochschulreife', label: 'Fachhochschulreife', status: 'locked' },
      { id: 'studium', label: 'Studium (Campus M / CODE Berlin)', status: 'locked' },
    ],
  },
  {
    branch: 'Fitness',
    nodes: [
      { id: 'workouts-25', label: '25 geloggte Workouts', status: 'done' },
      { id: 'workouts-100', label: '100 geloggte Workouts', status: 'in-progress' },
    ],
  },
]

export const finance = {
  currentValue: 8250,
  goalValue: 25000,
  history: [
    { month: 'Feb', value: 6100 },
    { month: 'Mär', value: 6700 },
    { month: 'Apr', value: 7200 },
    { month: 'Mai', value: 7550 },
    { month: 'Jun', value: 7900 },
    { month: 'Jul', value: 8250 },
  ],
}
