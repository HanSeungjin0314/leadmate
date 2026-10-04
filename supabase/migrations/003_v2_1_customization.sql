-- LeadMate V2.1 / DB schema 2.1.0
-- V2.0에 이어 실행하세요. 기존 데이터는 유지됩니다.

alter table public.business_settings
  add column if not exists custom_fields jsonb not null default '[]'::jsonb;

alter table public.customers
  add column if not exists custom_data jsonb not null default '{}'::jsonb;

insert into public.schema_version (id, version)
values (1, '2.1.0')
on conflict (id) do update set version = excluded.version, applied_at = now();
