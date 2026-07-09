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
