# Projekt: "Life Dashboard" – Gamifiziertes Life-OS

## Vision
Baue mir eine Web-App (PWA), die mein Leben wie ein Videospiel/RPG darstellt. Reale Daten aus Fitness, Schlaf, Finanzen und persönlichen Zielen werden in ein Charakterbogen-System übersetzt: Stats, XP, Level, Streaks und Skill-Trees. Der Stil soll modern und clean sein – dezente Gaming-Akzente, aber kein visueller Overkill. Übersichtlichkeit geht vor Verspieltheit.

Zielgruppe: nur ich selbst (Single-User, kein Multi-Account nötig).

---

## Tech-Stack (Vorschlag, gerne anpassen)
- **Frontend:** React (Vite), Tailwind CSS für Styling
- **Charts:** Chart.js oder Recharts für Trend-Visualisierungen
- **Datenhaltung:** Zunächst LocalStorage/IndexedDB für clientseitige Persistenz; später optional ein simples Backend (z.B. Supabase) für echte Cloud-Sync zwischen Geräten
- **Hosting:** Netlify oder Vercel
- **PWA:** installierbar auf iPhone (Home Screen), offline-fähig für die manuell gepflegten Teile

---

## Datenquellen & Integrationen

### Oura Ring 4 (API)
- Schlafdaten (Sleep Score, Schlafphasen, Schlafdauer)
- Readiness Score (für Recovery-Bar)
- Schritte pro Tag, Aktivitätslevel
- Anbindung über offizielle Oura API (OAuth2), tägliches Sync
- Einzige Quelle für Bewegungsdaten (kein Strava/Hevy – deren APIs erfordern mittlerweile ein kostenpflichtiges Abo)

### Manuelle Eingaben
- Kreatin-Checkbox (täglich, ad-hoc abhakbar)
- Business-Fortschritt (Meta Ads Meilensteine)
- Skill-Tree-Meilensteine (Zertifikate, Kundenakquise, Bildungsschritte)
- Finanz-/Portfolio-Update (falls kein Live-Broker-API verfügbar ist, manuelle Eingabe des Portfoliowerts z.B. wöchentlich)

---

## Kern-Features

### 1. Stats-System (Charakterbogen)
Drei Kern-Stats, jeweils 0–100 normiert, mit transparenter Berechnungsformel (im UI einsehbar, z.B. per Tooltip "wie wird das berechnet?"):

| Stat | Datenquelle | Berechnung |
|---|---|---|
| **Vitalität** | Oura (Readiness, Schlaf, Schritte, Aktivitätslevel) | gewichteter gleitender Durchschnitt der letzten 7 Tage |
| **Disziplin** | Streak-Erfüllung aller Habits (Kreatin, Trainingsplan-Einhaltung) | % erfüllte Tage der letzten 30 Tage |
| **Wealth** | Portfolio-Wert-Fortschritt Richtung Zielsumme | % Fortschritt zum Ziel + kurzfristiger Performance-Trend |

Jeder Stat hat ein eigenes Level (z.B. Level = Stat-Wert / 10, oder XP-Kurve mit Schwellenwerten). XP wird täglich/wöchentlich aus den zugrundeliegenden Daten berechnet und im UI als Fortschrittsbalken zum nächsten Level dargestellt.

### 2. Streak-Grid (GitHub-Contribution-Style)
- Kästchen-Ansicht (52 Wochen x 7 Tage), jedes Kästchen repräsentiert einen Tag
- Helligkeit/Farbintensität zeigt Zielerreichung (z.B. Kreatin genommen = volles Kästchen, nicht genommen = leer)
- Erweiterbar für mehrere Habits (Toggle zwischen verschiedenen Streak-Grids: Kreatin, Training, Schlafenszeit eingehalten etc.)
- Aktuelle Streak-Länge und längste Streak prominent anzeigen

### 3. Recovery-Bar (Buff/Debuff-System)
- Live-Balken basierend auf Oura Readiness Score des aktuellen Tages
- Ab bestimmten Schwellenwerten: visueller "Buff" (grün, Bonus-Icon) oder "Debuff" (rot/gedämpft, Warnhinweis)
- Ehrliche Darstellung: bei niedrigem Recovery-Wert klar kommunizieren, dass intensives Training heute suboptimal ist – keine Beschönigung
- Kurzer Erklärtext, warum der Wert so ist (z.B. "niedrige Tiefschlafphase letzte Nacht")

### 4. Skill-Tree (manuell gepflegte Meilenstein-Bäume)
Statisches, aber visuell ansprechendes Node-Diagramm (kein Overkill, clean gestaltet) mit Status pro Knoten: gesperrt / in Arbeit / abgeschlossen.

Beispielhafte Zweige (bitte als editierbare Datenstruktur anlegen, keine Hardcoded-Werte im UI-Code):
- **Business-Zweig:** Meta Blueprint Zertifizierung → Google Digital Garage → Meta Ads Associate Exam → erster Referenzkunde → Gewerbeanmeldung
- **Bildungs-Zweig:** Ausbildungsabschluss → BOS Kulmbach → Fachhochschulreife → Studium (Campus M / CODE Berlin)
- **Fitness-Zweig:** eigene Trainings-Meilensteine (frei definierbar, z.B. "100 geloggte Workouts")

Jeder Knoten lässt sich manuell als "abgeschlossen" markieren, was einen kleinen Celebration-Moment im UI auslöst (dezente Animation, kein Overkill) und ggf. Bonus-XP für den zugehörigen Stat gibt.

### 5. Quest-System
- **Daily Quests:** Kreatin, Schrittziel, Schlafenszeit einhalten
- **Weekly Quests:** z.B. 3x Training, Portfolio-Review, Business-Vault-Aufgabe erledigt
- Quests sind ad-hoc abhakbar (kein erzwungener täglicher Check-in-Flow), aber im Dashboard immer sichtbar mit aktuellem Status

---

## Views/Seiten

1. **Home/Übersicht:** Recovery-Bar, Tagesziele (Quests), Streak-Grid-Ausschnitt, Kurzstatus aller drei Stats
2. **Charakterbogen:** Detailansicht aller Stats mit Levelfortschritt, Berechnungs-Tooltips, historische Trendlinie (letzte 30/90 Tage)
3. **Streaks:** volle GitHub-Style Übersicht aller Habits, umschaltbar
4. **Skill-Tree:** vollständige Baumansicht mit allen Zweigen
5. **Finanzen:** Portfolio-Wert-Verlauf, Fortschritt zum Ziel, ggf. einfache manuelle Eintragsmaske

---

## Design-Richtlinien
- Modern, clean, minimalistisch – vergleichbar mit guten Fintech-/Analytics-Dashboards
- Gaming-Elemente dezent einsetzen: schlanke Progress-Bars statt bunter RPG-Balken, dezente Icons statt verspielter Illustrationen
- Dark Mode als Standard (gerne mit Light-Mode-Option)
- Mobile-first, da primäre Nutzung vermutlich über iPhone erfolgt
- Keine überladenen Animationen – Feedback (Level-Up, Meilenstein erreicht) darf auffallen, aber kurz und subtil bleiben

---

## Nicht-funktionale Anforderungen
- PWA-fähig (installierbar auf iOS Home Screen)
- Responsive für Mobile und Desktop
- Daten lokal persistent (kein Datenverlust bei Reload)
- API-Keys/Secrets sicher handhaben (nicht im Frontend-Code hardcoden)
- Erweiterbar: neue Habits, Skill-Tree-Zweige oder Stats sollen sich einfach per Datenstruktur hinzufügen lassen, ohne den Code grundlegend umzubauen

---

## Was ich NICHT will
- Keine Multi-User-Funktionalität
- Keine übertrieben bunte/verspielte RPG-Optik
- Keine erzwungenen täglichen Rituale – alles soll ad-hoc bedienbar sein
- Keine Bloat-Features, die nicht direkt einem der oben genannten Punkte dienen