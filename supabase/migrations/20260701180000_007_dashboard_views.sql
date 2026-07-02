-- =====================================================
-- DASHBOARD VIEWS
-- =====================================================

-- =====================================================
-- DASHBOARD COMPANIES
-- =====================================================

create or replace view public.dashboard_companies as
select

    c.id,

    c.name,

    c.created_at,

    (
        select count(*)
        from public.contacts ct
        where ct.company_id = c.id
    ) as total_contacts,

    (
        select count(*)
        from public.deals d
        where d.company_id = c.id
    ) as total_deals,

    (
        select coalesce(sum(i.total),0)
        from public.invoices i
        where i.company_id = c.id
    ) as total_invoices,

    (
        select coalesce(sum(e.amount),0)
        from public.expenses e
        where e.company_id = c.id
    ) as total_expenses,

    (
        select coalesce(sum(t.amount),0)
        from public.transactions t
        where t.company_id = c.id
    ) as total_transactions

from public.companies c;
-- =====================================================
-- DASHBOARD FINANCE
-- =====================================================

create or replace view public.dashboard_finance as
select

    company_id,

    count(*) as total_transactions,

    coalesce(sum(amount),0) as total_amount,

    coalesce(
        sum(
            case
                when transaction_type = 'income'
                then amount
                else 0
            end
        ),
        0
    ) as total_income,

    coalesce(
        sum(
            case
                when transaction_type = 'expense'
                then amount
                else 0
            end
        ),
        0
    ) as total_expense

from public.transactions

group by company_id;
-- =====================================================
-- DASHBOARD MARKETING
-- =====================================================

create or replace view public.dashboard_marketing as
select

    company_id,

    count(*) as total_campaigns,

    coalesce(sum(budget),0) as total_budget,

    coalesce(sum(spent),0) as total_spent,

    coalesce(sum(revenue_generated),0) as total_revenue,

    round(avg(roi),2) as average_roi

from public.marketing_campaigns

group by company_id;
-- =====================================================
-- DASHBOARD SALES
-- =====================================================

create or replace view public.dashboard_sales as
select

    company_id,

    count(*) as total_deals,

    coalesce(
        sum(
            case
                when stage = 'won' then 1
                else 0
            end
        ),
        0
    ) as won_deals,

    coalesce(
        sum(
            case
                when stage = 'lost' then 1
                else 0
            end
        ),
        0
    ) as lost_deals,

    coalesce(sum(amount),0) as pipeline_value,

    coalesce(
        sum(
            case
                when stage = 'won' then amount
                else 0
            end
        ),
        0
    ) as won_value

from public.deals

group by company_id;
