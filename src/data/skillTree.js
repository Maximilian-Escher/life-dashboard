// Branch-Metadaten (Label/Farbe fürs UI) + die ursprünglichen Standard-
// Knoten. Die Knoten selbst werden zur Laufzeit aus Supabase geladen (siehe
// src/lib/skillTreeNodes.js) – dieses Array wird nur noch als Seed-Daten für
// den einmaligen Import pro Nutzer verwendet, nicht mehr direkt in den Views.
//
// node.requires = id des Knotens, der vorher abgeschlossen sein muss
// (null = erster Knoten im Zweig, direkt freigeschaltet).
// node.statKey verweist auf den Stat (siehe src/lib/stats.js), der beim
// Abschluss Bonus-XP bekommt.

export const skillTreeBranches = [
  { key: 'business', label: 'Business', statKey: 'wealth', color: '#f59e0b' },
  { key: 'bildung', label: 'Bildung', statKey: 'disziplin', color: '#38bdf8' },
  { key: 'fitness', label: 'Fitness', statKey: 'vitalitaet', color: '#34d399' },
]

export const skillTreeNodes = [
  // Business
  {
    id: 'meta-blueprint',
    title: 'Meta Blueprint Zertifizierung',
    branch: 'business',
    statKey: 'wealth',
    bonusXp: 50,
    requires: null,
  },
  {
    id: 'google-digital-garage',
    title: 'Google Digital Garage',
    branch: 'business',
    statKey: 'wealth',
    bonusXp: 50,
    requires: 'meta-blueprint',
  },
  {
    id: 'meta-ads-associate',
    title: 'Meta Ads Associate Exam',
    branch: 'business',
    statKey: 'wealth',
    bonusXp: 75,
    requires: 'google-digital-garage',
  },
  {
    id: 'first-client',
    title: 'Erster Referenzkunde',
    branch: 'business',
    statKey: 'wealth',
    bonusXp: 100,
    requires: 'meta-ads-associate',
  },
  {
    id: 'gewerbeanmeldung',
    title: 'Gewerbeanmeldung',
    branch: 'business',
    statKey: 'wealth',
    bonusXp: 100,
    requires: 'first-client',
  },

  // Bildung
  {
    id: 'ausbildungsabschluss',
    title: 'Ausbildungsabschluss',
    branch: 'bildung',
    statKey: 'disziplin',
    bonusXp: 50,
    requires: null,
  },
  {
    id: 'bos-kulmbach',
    title: 'BOS Kulmbach',
    branch: 'bildung',
    statKey: 'disziplin',
    bonusXp: 75,
    requires: 'ausbildungsabschluss',
  },
  {
    id: 'fachhochschulreife',
    title: 'Fachhochschulreife',
    branch: 'bildung',
    statKey: 'disziplin',
    bonusXp: 75,
    requires: 'bos-kulmbach',
  },
  {
    id: 'studium',
    title: 'Studium (Campus M / CODE Berlin)',
    branch: 'bildung',
    statKey: 'disziplin',
    bonusXp: 150,
    requires: 'fachhochschulreife',
  },

  // Fitness – freie Platzhalter, Titel gerne selbst anpassen
  {
    id: 'fitness-meilenstein-1',
    title: 'Fitness-Meilenstein 1 (editierbar)',
    branch: 'fitness',
    statKey: 'vitalitaet',
    bonusXp: 50,
    requires: null,
  },
  {
    id: 'fitness-meilenstein-2',
    title: 'Fitness-Meilenstein 2 (editierbar)',
    branch: 'fitness',
    statKey: 'vitalitaet',
    bonusXp: 50,
    requires: 'fitness-meilenstein-1',
  },
  {
    id: 'fitness-meilenstein-3',
    title: 'Fitness-Meilenstein 3 (editierbar)',
    branch: 'fitness',
    statKey: 'vitalitaet',
    bonusXp: 50,
    requires: 'fitness-meilenstein-2',
  },
]
