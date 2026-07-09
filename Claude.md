# Life Dashboard – Projekt-Kontext

## Was das ist
Gamifiziertes Life-OS als PWA. Reale Daten (Schlaf, Training, Finanzen) werden zu Stats/XP/Level/Streaks. Single-User (nur ich). Details zu allen Features: siehe `docs/spec.md`.

## Tech-Stack
- Frontend: React (Vite) + Tailwind CSS
- Charts: Recharts oder Chart.js
- Backend/Secrets: Netlify Functions (OAuth-Token-Austausch für Oura/Strava)
- Datenbank/Auth: Supabase
- Hosting: Netlify
- PWA-fähig, mobile-first, Dark Mode als Standard

## Konventionen
- Kleine, überprüfbare Schritte – nicht alles auf einmal bauen
- Keine Secrets/API-Keys jemals im Code oder Git-Repo, nur als Umgebungsvariablen
- Datenstrukturen (Skill-Tree, Habits, Stats) als editierbare Config/JSON, nicht hardcoded im UI-Code
- Bei Unsicherheit zwischen zwei Lösungswegen: beide kurz erklären, mich entscheiden lassen
- Minimal-invasive Änderungen: keine Refactorings an Code, der nicht Teil der aktuellen Aufgabe ist

## Aktueller Stand
- [ ] Grundgerüst (leere Views, Navigation, Styling)
- [ ] Oura-Integration
- [ ] Strava-Integration
- [ ] Streak-Grid + Kreatin-Checkbox
- [ ] Stats/XP-Berechnung
- [ ] Skill-Tree
- [ ] Supabase-Anbindung
- [ ] Deployment + PWA-Test

## Referenzen
- Vollständige Feature-Spec: `docs/spec.md`