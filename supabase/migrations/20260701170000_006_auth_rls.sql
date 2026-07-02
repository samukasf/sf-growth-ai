-- =====================================================
-- SF GROWTH AI
-- AUTH & RLS
-- =====================================================

create extension if not exists pgcrypto;
-- =====================================================
-- USER PROFILES
-- =====================================================

create table if not exists public.user_profiles (

    id uuid primary key
    references auth.users(id)
    on delete cascade,

    company_id uuid
    references public.companies(id)
    on delete cascade,

    full_name text,

    avatar_url text,

    role text default 'employee',

    active boolean default true,

    created_at timestamptz
    default timezone('utc', now())

);

create index if not exists idx_profiles_company
on public.user_profiles(company_id);

create index if not exists idx_profiles_role
on public.user_profiles(role);
-- =====================================================
-- AUTO CREATE PROFILE
-- =====================================================

create or replace function public.handle_new_user()

returns trigger

language plpgsql

security definer

as $$

begin

insert into public.user_profiles(id)

values(new.id)

on conflict do nothing;

return new;

end;

$$;
drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created

after insert

on auth.users

for each row

execute procedure public.handle_new_user();
-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.user_profiles
enable row level security;
create policy "Users can view own profile"

on public.user_profiles

for select

using (

auth.uid() = id

);
create policy "Users can update own profile"

on public.user_profiles

for update

using (

auth.uid() = id

);
create policy "Users can insert own profile"

on public.user_profiles

for insert

with check (

auth.uid() = id

);
-- =====================================================
-- COMPANY ACCESS FUNCTION
-- =====================================================

create or replace function public.current_company()

returns uuid

language sql

stable

as $$

select company_id

from public.user_profiles

where id = auth.uid()

limit 1;

$$;
alter table public.companies

enable row level security;
create policy "Users can view own company"

on public.companies

for select

using (

id = public.current_company()

);
create policy "Admins update own company"

on public.companies

for update

using (

id = public.current_company()

);
-- =====================================================
-- CONTACTS RLS
-- =====================================================

alter table public.contacts
enable row level security;
create policy "Company contacts select"

on public.contacts

for select

using (

company_id = public.current_company()

);
create policy "Company contacts insert"

on public.contacts

for insert

with check (

company_id = public.current_company()

);
create policy "Company contacts update"

on public.contacts

for update

using (

company_id = public.current_company()

);
create policy "Company contacts delete"

on public.contacts

for delete

using (

company_id = public.current_company()

);
-- =====================================================
-- LEADS RLS
-- =====================================================

alter table public.leads
enable row level security;
create policy "Company leads select"

on public.leads

for select

using (

    company_id = public.current_company()

);
create policy "Company leads insert"

on public.leads

for insert

with check (

    company_id = public.current_company()

);
create policy "Company leads update"

on public.leads

for update

using (

    company_id = public.current_company()

);
create policy "Company leads delete"

on public.leads

for delete

using (

    company_id = public.current_company()

);
-- =====================================================
-- DEALS RLS
-- =====================================================

alter table public.deals
enable row level security;
create policy "Company deals select"

on public.deals

for select

using (

    company_id = public.current_company()

);
create policy "Company deals insert"

on public.deals

for insert

with check (

    company_id = public.current_company()

);
create policy "Company deals update"

on public.deals

for update

using (

    company_id = public.current_company()

);
create policy "Company deals delete"

on public.deals

for delete

using (

    company_id = public.current_company()

);
-- =====================================================
-- ACTIVITIES RLS
-- =====================================================

alter table public.activities
enable row level security;
create policy "Company activities select"

on public.activities

for select

using (

    company_id = public.current_company()

);
create policy "Company activities insert"

on public.activities

for insert

with check (

    company_id = public.current_company()

);
create policy "Company activities update"

on public.activities

for update

using (

    company_id = public.current_company()

);
create policy "Company activities delete"

on public.activities

for delete

using (

    company_id = public.current_company()

);
-- =====================================================
-- BANK ACCOUNTS RLS
-- =====================================================

alter table public.bank_accounts
enable row level security;

create policy "Company bank_accounts select"
on public.bank_accounts
for select
using (
    company_id = public.current_company()
);

create policy "Company bank_accounts insert"
on public.bank_accounts
for insert
with check (
    company_id = public.current_company()
);

create policy "Company bank_accounts update"
on public.bank_accounts
for update
using (
    company_id = public.current_company()
);

create policy "Company bank_accounts delete"
on public.bank_accounts
for delete
using (
    company_id = public.current_company()
);

-- =====================================================
-- INVOICES RLS
-- =====================================================

alter table public.invoices
enable row level security;

create policy "Company invoices select"
on public.invoices
for select
using (
    company_id = public.current_company()
);

create policy "Company invoices insert"
on public.invoices
for insert
with check (
    company_id = public.current_company()
);

create policy "Company invoices update"
on public.invoices
for update
using (
    company_id = public.current_company()
);

create policy "Company invoices delete"
on public.invoices
for delete
using (
    company_id = public.current_company()
);

-- =====================================================
-- EXPENSES RLS
-- =====================================================

alter table public.expenses
enable row level security;

create policy "Company expenses select"
on public.expenses
for select
using (
    company_id = public.current_company()
);

create policy "Company expenses insert"
on public.expenses
for insert
with check (
    company_id = public.current_company()
);

create policy "Company expenses update"
on public.expenses
for update
using (
    company_id = public.current_company()
);

create policy "Company expenses delete"
on public.expenses
for delete
using (
    company_id = public.current_company()
);

-- =====================================================
-- TRANSACTIONS RLS
-- =====================================================

alter table public.transactions
enable row level security;

create policy "Company transactions select"
on public.transactions
for select
using (
    company_id = public.current_company()
);

create policy "Company transactions insert"
on public.transactions
for insert
with check (
    company_id = public.current_company()
);

create policy "Company transactions update"
on public.transactions
for update
using (
    company_id = public.current_company()
);

create policy "Company transactions delete"
on public.transactions
for delete
using (
    company_id = public.current_company()
);

-- =====================================================
-- RECURRING PAYMENTS RLS
-- =====================================================

alter table public.recurring_payments
enable row level security;

create policy "Company recurring_payments select"
on public.recurring_payments
for select
using (
    company_id = public.current_company()
);

create policy "Company recurring_payments insert"
on public.recurring_payments
for insert
with check (
    company_id = public.current_company()
);

create policy "Company recurring_payments update"
on public.recurring_payments
for update
using (
    company_id = public.current_company()
);

create policy "Company recurring_payments delete"
on public.recurring_payments
for delete
using (
    company_id = public.current_company()
);
-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

alter table public.marketing_campaigns
enable row level security;

create policy "Company marketing_campaigns select"
on public.marketing_campaigns
for select
using (
    company_id = public.current_company()
);

create policy "Company marketing_campaigns insert"
on public.marketing_campaigns
for insert
with check (
    company_id = public.current_company()
);

create policy "Company marketing_campaigns update"
on public.marketing_campaigns
for update
using (
    company_id = public.current_company()
);

create policy "Company marketing_campaigns delete"
on public.marketing_campaigns
for delete
using (
    company_id = public.current_company()
);

-- =====================================================
-- AD SETS
-- =====================================================

alter table public.ad_sets
enable row level security;

create policy "Company ad_sets select"
on public.ad_sets
for select
using (
    campaign_id in (
        select id
        from public.marketing_campaigns
        where company_id = public.current_company()
    )
);

create policy "Company ad_sets insert"
on public.ad_sets
for insert
with check (
    campaign_id in (
        select id
        from public.marketing_campaigns
        where company_id = public.current_company()
    )
);

create policy "Company ad_sets update"
on public.ad_sets
for update
using (
    campaign_id in (
        select id
        from public.marketing_campaigns
        where company_id = public.current_company()
    )
);

create policy "Company ad_sets delete"
on public.ad_sets
for delete
using (
    campaign_id in (
        select id
        from public.marketing_campaigns
        where company_id = public.current_company()
    )
);

-- =====================================================
-- ADS
-- =====================================================

alter table public.ads
enable row level security;

create policy "Company ads select"
on public.ads
for select
using (
    ad_set_id in (
        select id
        from public.ad_sets
        where campaign_id in (
            select id
            from public.marketing_campaigns
            where company_id = public.current_company()
        )
    )
);

create policy "Company ads insert"
on public.ads
for insert
with check (
    ad_set_id in (
        select id
        from public.ad_sets
        where campaign_id in (
            select id
            from public.marketing_campaigns
            where company_id = public.current_company()
        )
    )
);

create policy "Company ads update"
on public.ads
for update
using (
    ad_set_id in (
        select id
        from public.ad_sets
        where campaign_id in (
            select id
            from public.marketing_campaigns
            where company_id = public.current_company()
        )
    )
);

create policy "Company ads delete"
on public.ads
for delete
using (
    ad_set_id in (
        select id
        from public.ad_sets
        where campaign_id in (
            select id
            from public.marketing_campaigns
            where company_id = public.current_company()
        )
    )
);