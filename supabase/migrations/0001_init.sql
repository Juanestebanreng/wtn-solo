-- =========================================================
-- WTN Solo — initial schema
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- Tables
-- ---------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  workspace_id uuid references public.workspaces(id),
  created_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  company_name text,
  contact_name text,
  address_line_1 text,
  address_line_2 text,
  city text,
  postcode text,
  sic_code text,
  phone text,
  email text,
  carrier_registration_number text,
  permit_number text,
  is_carrier boolean not null default false,
  is_broker boolean not null default false,
  is_dealer boolean not null default false,
  is_permit_holder boolean not null default false,
  is_exemption_holder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence public.wtn_reference_seq start 1;

create table public.wtns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'final', 'corrected')),
  reference_number text unique,
  transfer_date date,
  transfer_time text,
  place_of_transfer text,
  broker_dealer_name text,
  broker_dealer_registration_number text,
  waste_description text,
  ewc_code text,
  quantity text,
  containment_type text check (containment_type in ('loose', 'sacks', 'skip', 'drum', 'other')),
  containment_other text,
  waste_hierarchy_confirmed boolean not null default false,
  pdf_path text,
  corrected_from uuid references public.wtns(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finalised_at timestamptz
);

create table public.wtn_parties (
  id uuid primary key default gen_random_uuid(),
  wtn_id uuid not null references public.wtns(id) on delete cascade,
  party_type text not null check (party_type in ('transferor', 'transferee')),
  full_name text,
  company_name text,
  address_line_1 text,
  address_line_2 text,
  city text,
  postcode text,
  role_producer boolean default false,
  role_importer boolean default false,
  role_local_authority boolean default false,
  role_permit_holder boolean default false,
  permit_number text,
  role_exemption_holder boolean default false,
  exemption_details text,
  role_carrier boolean default false,
  role_broker boolean default false,
  role_dealer boolean default false,
  registration_number text,
  represented_as text,
  unique (wtn_id, party_type)
);

create table public.wtn_signatures (
  id uuid primary key default gen_random_uuid(),
  wtn_id uuid not null references public.wtns(id) on delete cascade,
  party_type text not null check (party_type in ('transferor', 'transferee')),
  signed_name text not null,
  represented_as text,
  signed_at timestamptz not null default now(),
  signature_path text not null,
  unique (wtn_id, party_type)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'trialing',
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Auto reference number on finalise
-- ---------------------------------------------------------

create or replace function public.set_wtn_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference_number is null then
    new.reference_number := 'WTN-' || lpad(nextval('public.wtn_reference_seq')::text, 6, '0');
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger wtns_set_reference
  before insert on public.wtns
  for each row execute function public.set_wtn_reference();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger wtns_touch_updated_at
  before update on public.wtns
  for each row execute function public.touch_updated_at();

create trigger company_profiles_touch_updated_at
  before update on public.company_profiles
  for each row execute function public.touch_updated_at();

create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------
-- Auto-provision workspace + profile + 14-day trial on signup
-- ---------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
  company_name text;
  full_name text;
begin
  company_name := coalesce(new.raw_user_meta_data->>'company_name', 'My Company');
  full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);

  insert into public.workspaces (name)
  values (company_name)
  returning id into new_workspace_id;

  insert into public.profiles (id, email, full_name, workspace_id)
  values (new.id, new.email, full_name, new_workspace_id);

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  insert into public.company_profiles (workspace_id, company_name, contact_name, email)
  values (new_workspace_id, company_name, full_name, new.email);

  insert into public.subscriptions (workspace_id, status, trial_ends_at)
  values (new_workspace_id, 'trialing', now() + interval '14 days');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_members enable row level security;
alter table public.company_profiles enable row level security;
alter table public.wtns enable row level security;
alter table public.wtn_parties enable row level security;
alter table public.wtn_signatures enable row level security;
alter table public.subscriptions enable row level security;

-- workspace_members: a user can read their own membership rows
create policy "read own membership"
  on public.workspace_members for select
  to authenticated
  using (user_id = auth.uid());

-- profiles: a user can read/update their own profile
create policy "read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- workspaces: members can read their own workspace
create policy "members read workspace"
  on public.workspaces for select
  to authenticated
  using (
    id in (select workspace_id from public.workspace_members where user_id = auth.uid())
  );

-- Generic "workspace member" policies, repeated per table.
create policy "members read company_profiles"
  on public.company_profiles for select
  to authenticated
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "members write company_profiles"
  on public.company_profiles for insert
  to authenticated
  with check (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "members update company_profiles"
  on public.company_profiles for update
  to authenticated
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "members read wtns"
  on public.wtns for select
  to authenticated
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "members insert wtns"
  on public.wtns for insert
  to authenticated
  with check (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "members update wtns"
  on public.wtns for update
  to authenticated
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

create policy "members read wtn_parties"
  on public.wtn_parties for select
  to authenticated
  using (
    wtn_id in (
      select id from public.wtns
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "members insert wtn_parties"
  on public.wtn_parties for insert
  to authenticated
  with check (
    wtn_id in (
      select id from public.wtns
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "members read wtn_signatures"
  on public.wtn_signatures for select
  to authenticated
  using (
    wtn_id in (
      select id from public.wtns
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "members insert wtn_signatures"
  on public.wtn_signatures for insert
  to authenticated
  with check (
    wtn_id in (
      select id from public.wtns
      where workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid())
    )
  );

create policy "members read subscriptions"
  on public.subscriptions for select
  to authenticated
  using (workspace_id in (select workspace_id from public.workspace_members where user_id = auth.uid()));

-- subscriptions are otherwise written only by the service-role key from the
-- Stripe webhook, so no insert/update policy is granted to `authenticated`.

-- ---------------------------------------------------------
-- Storage: private bucket + folder-scoped policies
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('wtn-private', 'wtn-private', false)
on conflict (id) do nothing;

create policy "members read own workspace files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'wtn-private'
    and (storage.foldername(name))[1]::uuid in (
      select workspace_id from public.workspace_members where user_id = auth.uid()
    )
  );

create policy "members write own workspace files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'wtn-private'
    and (storage.foldername(name))[1]::uuid in (
      select workspace_id from public.workspace_members where user_id = auth.uid()
    )
  );

create policy "members update own workspace files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'wtn-private'
    and (storage.foldername(name))[1]::uuid in (
      select workspace_id from public.workspace_members where user_id = auth.uid()
    )
  );
