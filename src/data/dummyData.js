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
