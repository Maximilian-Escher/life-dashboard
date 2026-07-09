-- Life Dashboard: Datenbank-Schema
-- Im Supabase-Dashboard unter "SQL Editor" ausführen. Die ganze Datei kann
-- jederzeit erneut komplett ausgeführt werden (idempotent).

-- ---------------------------------------------------------------------
-- habit_logs: ein Eintrag pro erledigtem Tag; kein Eintrag = nicht erledigt.
-- ---------------------------------------------------------------------

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_key text not null,
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, habit_key, date)
);

alter table public.habit_logs enable row level security;

drop policy if exists "Nutzer sehen eigene Habit-Logs" on public.habit_logs;
create policy "Nutzer sehen eigene Habit-Logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigene Habit-Logs" on public.habit_logs;
create policy "Nutzer erstellen eigene Habit-Logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer löschen eigene Habit-Logs" on public.habit_logs;
create policy "Nutzer löschen eigene Habit-Logs"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- portfolio_snapshots: manuelle Portfolio-Wert-Eintragungen (Wealth-Stat).
-- ---------------------------------------------------------------------

create table if not exists public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  value numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.portfolio_snapshots enable row level security;

drop policy if exists "Nutzer sehen eigene Portfolio-Snapshots" on public.portfolio_snapshots;
create policy "Nutzer sehen eigene Portfolio-Snapshots"
  on public.portfolio_snapshots for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigene Portfolio-Snapshots" on public.portfolio_snapshots;
create policy "Nutzer erstellen eigene Portfolio-Snapshots"
  on public.portfolio_snapshots for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer aktualisieren eigene Portfolio-Snapshots" on public.portfolio_snapshots;
create policy "Nutzer aktualisieren eigene Portfolio-Snapshots"
  on public.portfolio_snapshots for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer löschen eigene Portfolio-Snapshots" on public.portfolio_snapshots;
create policy "Nutzer löschen eigene Portfolio-Snapshots"
  on public.portfolio_snapshots for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- portfolio_settings: Zielsumme, eine Zeile pro Nutzer.
-- ---------------------------------------------------------------------

create table if not exists public.portfolio_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  goal_value numeric not null default 1020000,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_settings enable row level security;

drop policy if exists "Nutzer sehen eigene Portfolio-Einstellungen" on public.portfolio_settings;
create policy "Nutzer sehen eigene Portfolio-Einstellungen"
  on public.portfolio_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigene Portfolio-Einstellungen" on public.portfolio_settings;
create policy "Nutzer erstellen eigene Portfolio-Einstellungen"
  on public.portfolio_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer aktualisieren eigene Portfolio-Einstellungen" on public.portfolio_settings;
create policy "Nutzer aktualisieren eigene Portfolio-Einstellungen"
  on public.portfolio_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- skill_tree_progress: abgeschlossene Skill-Tree-Knoten (permanent, kein
-- "entabschließen" vorgesehen).
-- ---------------------------------------------------------------------

create table if not exists public.skill_tree_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  node_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, node_id)
);

alter table public.skill_tree_progress enable row level security;

drop policy if exists "Nutzer sehen eigenen Skill-Tree-Fortschritt" on public.skill_tree_progress;
create policy "Nutzer sehen eigenen Skill-Tree-Fortschritt"
  on public.skill_tree_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigenen Skill-Tree-Fortschritt" on public.skill_tree_progress;
create policy "Nutzer erstellen eigenen Skill-Tree-Fortschritt"
  on public.skill_tree_progress for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- skill_tree_nodes: die Knoten-Definitionen selbst, jetzt pro Nutzer in der
-- DB statt in einer statischen Config-Datei. "id" ist pro Nutzer eindeutig
-- (zusammengesetzter Primary Key), nicht global.
-- ---------------------------------------------------------------------

create table if not exists public.skill_tree_nodes (
  id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  branch text not null,
  stat_key text not null,
  bonus_xp integer not null default 0,
  requires_node_id text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.skill_tree_nodes enable row level security;

drop policy if exists "Nutzer sehen eigene Skill-Tree-Knoten" on public.skill_tree_nodes;
create policy "Nutzer sehen eigene Skill-Tree-Knoten"
  on public.skill_tree_nodes for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigene Skill-Tree-Knoten" on public.skill_tree_nodes;
create policy "Nutzer erstellen eigene Skill-Tree-Knoten"
  on public.skill_tree_nodes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer löschen eigene Skill-Tree-Knoten" on public.skill_tree_nodes;
create policy "Nutzer löschen eigene Skill-Tree-Knoten"
  on public.skill_tree_nodes for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- skill_tree_seed_status: Marker "Standard-Knoten wurden für diesen Nutzer
-- schon mal importiert". Getrennt vom Node-Count, damit das Seeding nicht
-- erneut anspringt, nur weil der Nutzer alle Knoten gelöscht hat.
-- ---------------------------------------------------------------------

create table if not exists public.skill_tree_seed_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  seeded_at timestamptz not null default now()
);

alter table public.skill_tree_seed_status enable row level security;

drop policy if exists "Nutzer sehen eigenen Seed-Status" on public.skill_tree_seed_status;
create policy "Nutzer sehen eigenen Seed-Status"
  on public.skill_tree_seed_status for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigenen Seed-Status" on public.skill_tree_seed_status;
create policy "Nutzer erstellen eigenen Seed-Status"
  on public.skill_tree_seed_status for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- weather_settings: manuell hinterlegter Ort (Fallback, falls Geolocation
-- abgelehnt/nicht verfügbar ist), eine Zeile pro Nutzer.
-- ---------------------------------------------------------------------

create table if not exists public.weather_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  location_label text,
  latitude numeric,
  longitude numeric,
  updated_at timestamptz not null default now()
);

alter table public.weather_settings enable row level security;

drop policy if exists "Nutzer sehen eigene Wetter-Einstellungen" on public.weather_settings;
create policy "Nutzer sehen eigene Wetter-Einstellungen"
  on public.weather_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigene Wetter-Einstellungen" on public.weather_settings;
create policy "Nutzer erstellen eigene Wetter-Einstellungen"
  on public.weather_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer aktualisieren eigene Wetter-Einstellungen" on public.weather_settings;
create policy "Nutzer aktualisieren eigene Wetter-Einstellungen"
  on public.weather_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- dashboard_layout: Reihenfolge + Sichtbarkeit der Home-Widgets, pro Nutzer.
-- ---------------------------------------------------------------------

create table if not exists public.dashboard_layout (
  user_id uuid not null references auth.users (id) on delete cascade,
  widget_key text not null,
  position integer not null,
  visible boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, widget_key)
);

alter table public.dashboard_layout enable row level security;

drop policy if exists "Nutzer sehen eigenes Dashboard-Layout" on public.dashboard_layout;
create policy "Nutzer sehen eigenes Dashboard-Layout"
  on public.dashboard_layout for select
  using (auth.uid() = user_id);

drop policy if exists "Nutzer erstellen eigenes Dashboard-Layout" on public.dashboard_layout;
create policy "Nutzer erstellen eigenes Dashboard-Layout"
  on public.dashboard_layout for insert
  with check (auth.uid() = user_id);

drop policy if exists "Nutzer aktualisieren eigenes Dashboard-Layout" on public.dashboard_layout;
create policy "Nutzer aktualisieren eigenes Dashboard-Layout"
  on public.dashboard_layout for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
