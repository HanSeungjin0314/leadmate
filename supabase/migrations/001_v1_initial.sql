-- LeadMate V1 / DB schema 1.0.0
-- Supabase SQL Editor에서 전체 실행하세요.

create extension if not exists pgcrypto;

create table if not exists public.schema_version (
  id integer primary key default 1 check (id = 1),
  version text not null,
  applied_at timestamptz not null default now()
);

insert into public.schema_version (id, version)
values (1, '1.0.0')
on conflict (id) do update set version = excluded.version, applied_at = now();

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  phone text not null,
  project_name text,
  source text,
  interest_type text,
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','INTERESTED','CALLBACK','VISIT_BOOKED','VISITED','CONTRACTED','HOLD','REJECTED')),
  memo text,
  next_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'call',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'callback',
  scheduled_at timestamptz not null,
  memo text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers(user_id);
create index if not exists customers_next_contact_idx on public.customers(user_id, next_contact_at);
create index if not exists customers_status_idx on public.customers(user_id, status);
create index if not exists activities_customer_idx on public.activities(customer_id, created_at desc);
create index if not exists appointments_user_schedule_idx on public.appointments(user_id, scheduled_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_leadmate on auth.users;
create trigger on_auth_user_created_leadmate
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.activities enable row level security;
alter table public.appointments enable row level security;
alter table public.schema_version enable row level security;

-- users
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- customers
create policy "customers_select_own" on public.customers for select using (auth.uid() = user_id);
create policy "customers_insert_own" on public.customers for insert with check (auth.uid() = user_id);
create policy "customers_update_own" on public.customers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "customers_delete_own" on public.customers for delete using (auth.uid() = user_id);

-- activities
create policy "activities_select_own" on public.activities for select using (auth.uid() = user_id);
create policy "activities_insert_own" on public.activities for insert with check (auth.uid() = user_id);
create policy "activities_update_own" on public.activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activities_delete_own" on public.activities for delete using (auth.uid() = user_id);

-- appointments
create policy "appointments_select_own" on public.appointments for select using (auth.uid() = user_id);
create policy "appointments_insert_own" on public.appointments for insert with check (auth.uid() = user_id);
create policy "appointments_update_own" on public.appointments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "appointments_delete_own" on public.appointments for delete using (auth.uid() = user_id);

-- 앱에서 DB 버전 읽기만 허용
create policy "schema_version_read" on public.schema_version for select using (true);
