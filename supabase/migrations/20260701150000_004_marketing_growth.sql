-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

create table if not exists public.marketing_campaigns (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    name text not null,

    platform text not null,

    objective text,

    status text default 'draft',

    start_date date,

    end_date date,

    budget numeric default 0,

    spent numeric default 0,

    revenue_generated numeric default 0,

    roi numeric default 0,

    created_at timestamptz not null
    default timezone('utc', now()),

    updated_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_campaign_company
on public.marketing_campaigns(company_id);

create index if not exists idx_campaign_platform
on public.marketing_campaigns(platform);

create index if not exists idx_campaign_status
on public.marketing_campaigns(status);

-- =====================================================
-- AD SETS
-- =====================================================

create table if not exists public.ad_sets (

    id uuid primary key default gen_random_uuid(),

    campaign_id uuid not null
    references public.marketing_campaigns(id)
    on delete cascade,

    name text not null,

    audience jsonb default '{}'::jsonb,

    placements jsonb default '{}'::jsonb,

    optimization_goal text,

    daily_budget numeric default 0,

    lifetime_budget numeric default 0,

    status text default 'active',

    created_at timestamptz not null
    default timezone('utc', now()),

    updated_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_adsets_campaign
on public.ad_sets(campaign_id);

create index if not exists idx_adsets_status
on public.ad_sets(status);
-- =====================================================
-- ADS
-- =====================================================

create table if not exists public.ads (

    id uuid primary key default gen_random_uuid(),

    ad_set_id uuid not null
    references public.ad_sets(id)
    on delete cascade,

    name text not null,

    headline text,

    primary_text text,

    description text,

    call_to_action text,

    destination_url text,

    creative jsonb default '{}'::jsonb,

    impressions bigint default 0,

    reach bigint default 0,

    clicks bigint default 0,

    ctr numeric default 0,

    cpc numeric default 0,

    cpm numeric default 0,

    conversions integer default 0,

    spend numeric default 0,

    revenue numeric default 0,

    roi numeric default 0,

    status text default 'draft',

    created_at timestamptz not null
    default timezone('utc', now()),

    updated_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_ads_adset
on public.ads(ad_set_id);

create index if not exists idx_ads_status
on public.ads(status);

create index if not exists idx_ads_roi
on public.ads(roi);