-- LeadMate V2.0 / DB schema 2.0.0
-- 기존 V1 데이터는 유지됩니다. Supabase SQL Editor에서 이 파일만 새로 실행하세요.

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.business_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  industry text not null default 'other',
  usage_mode text not null default 'solo' check (usage_mode in ('solo','team')),
  business_name text,
  selling_description text,
  product_label text not null default '관심상품/서비스',
  secondary_label text not null default '추가정보',
  source_options jsonb not null default '["Meta","Google","Naver","소개","전화","오프라인","기타"]'::jsonb,
  pipeline_labels jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  status_key text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (business_id, status_key)
);

alter table public.customers add column if not exists business_id uuid references public.businesses(id) on delete set null;
create index if not exists customers_business_id_idx on public.customers(business_id);
create index if not exists business_members_user_idx on public.business_members(user_id);

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.business_settings enable row level security;
alter table public.pipeline_stages enable row level security;

-- 재실행 가능하도록 V2 정책은 삭제 후 생성
drop policy if exists "businesses_insert_own" on public.businesses;
drop policy if exists "businesses_select_member" on public.businesses;
drop policy if exists "businesses_update_member" on public.businesses;
drop policy if exists "members_select_own_business" on public.business_members;
drop policy if exists "members_insert_self" on public.business_members;
drop policy if exists "settings_select_member" on public.business_settings;
drop policy if exists "settings_insert_member" on public.business_settings;
drop policy if exists "settings_update_member" on public.business_settings;
drop policy if exists "pipeline_select_member" on public.pipeline_stages;
drop policy if exists "pipeline_manage_member" on public.pipeline_stages;

create policy "businesses_insert_own" on public.businesses for insert with check (auth.uid() = created_by);
create policy "businesses_select_member" on public.businesses for select using (
  auth.uid() = created_by or exists (select 1 from public.business_members bm where bm.business_id = id and bm.user_id = auth.uid())
);
create policy "businesses_update_member" on public.businesses for update using (
  auth.uid() = created_by or exists (select 1 from public.business_members bm where bm.business_id = id and bm.user_id = auth.uid())
) with check (
  auth.uid() = created_by or exists (select 1 from public.business_members bm where bm.business_id = id and bm.user_id = auth.uid())
);

create policy "members_select_own_business" on public.business_members for select using (user_id = auth.uid());
create policy "members_insert_self" on public.business_members for insert with check (user_id = auth.uid());

create policy "settings_select_member" on public.business_settings for select using (
  exists (select 1 from public.business_members bm where bm.business_id = business_settings.business_id and bm.user_id = auth.uid())
);
create policy "settings_insert_member" on public.business_settings for insert with check (
  exists (select 1 from public.business_members bm where bm.business_id = business_settings.business_id and bm.user_id = auth.uid())
);
create policy "settings_update_member" on public.business_settings for update using (
  exists (select 1 from public.business_members bm where bm.business_id = business_settings.business_id and bm.user_id = auth.uid())
) with check (
  exists (select 1 from public.business_members bm where bm.business_id = business_settings.business_id and bm.user_id = auth.uid())
);

create policy "pipeline_select_member" on public.pipeline_stages for select using (
  exists (select 1 from public.business_members bm where bm.business_id = pipeline_stages.business_id and bm.user_id = auth.uid())
);
create policy "pipeline_manage_member" on public.pipeline_stages for all using (
  exists (select 1 from public.business_members bm where bm.business_id = pipeline_stages.business_id and bm.user_id = auth.uid())
) with check (
  exists (select 1 from public.business_members bm where bm.business_id = pipeline_stages.business_id and bm.user_id = auth.uid())
);

-- 기존 고객 RLS는 user_id 기준으로 유지하여 V1 데이터가 안전하게 보존됩니다.
insert into public.schema_version (id, version)
values (1, '2.0.0')
on conflict (id) do update set version = excluded.version, applied_at = now();
