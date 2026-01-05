-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create annual_collages table
create table if not exists public.annual_collages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  theme text,
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year)
);

alter table public.annual_collages enable row level security;

create policy "annual_collages_select_own"
  on public.annual_collages for select
  using (auth.uid() = user_id);

create policy "annual_collages_insert_own"
  on public.annual_collages for insert
  with check (auth.uid() = user_id);

create policy "annual_collages_update_own"
  on public.annual_collages for update
  using (auth.uid() = user_id);

create policy "annual_collages_delete_own"
  on public.annual_collages for delete
  using (auth.uid() = user_id);

-- Create monthly_collages table
create table if not exists public.monthly_collages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null,
  direction text,
  reflection text,
  images jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year, month)
);

alter table public.monthly_collages enable row level security;

create policy "monthly_collages_select_own"
  on public.monthly_collages for select
  using (auth.uid() = user_id);

create policy "monthly_collages_insert_own"
  on public.monthly_collages for insert
  with check (auth.uid() = user_id);

create policy "monthly_collages_update_own"
  on public.monthly_collages for update
  using (auth.uid() = user_id);

create policy "monthly_collages_delete_own"
  on public.monthly_collages for delete
  using (auth.uid() = user_id);

-- Create practices table
create table if not exists public.practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year integer not null,
  month integer not null,
  name text not null,
  is_paused boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.practices enable row level security;

create policy "practices_select_own"
  on public.practices for select
  using (auth.uid() = user_id);

create policy "practices_insert_own"
  on public.practices for insert
  with check (auth.uid() = user_id);

create policy "practices_update_own"
  on public.practices for update
  using (auth.uid() = user_id);

create policy "practices_delete_own"
  on public.practices for delete
  using (auth.uid() = user_id);

-- Create practice_completions table
create table if not exists public.practice_completions (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  created_at timestamptz default now(),
  unique(practice_id, completed_date)
);

alter table public.practice_completions enable row level security;

create policy "practice_completions_select_own"
  on public.practice_completions for select
  using (auth.uid() = user_id);

create policy "practice_completions_insert_own"
  on public.practice_completions for insert
  with check (auth.uid() = user_id);

create policy "practice_completions_delete_own"
  on public.practice_completions for delete
  using (auth.uid() = user_id);

-- Create trigger to auto-create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
