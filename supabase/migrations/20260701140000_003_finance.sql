-- =====================================================
-- FINANCE
-- =====================================================

create table if not exists public.bank_accounts (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    name text not null,

    bank_name text,

    account_type text,

    currency text default 'EUR',

    balance numeric default 0,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_bank_accounts_company
on public.bank_accounts(company_id);

-- =====================================================
-- INVOICES
-- =====================================================

create table if not exists public.invoices (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    contact_id uuid
    references public.contacts(id)
    on delete set null,

    deal_id uuid
    references public.deals(id)
    on delete set null,

    invoice_number text,

    status text default 'draft',

    issue_date date,

    due_date date,

    total numeric default 0,

    currency text default 'EUR',

    notes text,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_invoices_company
on public.invoices(company_id);

create index if not exists idx_invoices_status
on public.invoices(status);

create index if not exists idx_invoices_due
on public.invoices(due_date);

-- =====================================================
-- EXPENSES
-- =====================================================

create table if not exists public.expenses (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    bank_account_id uuid
    references public.bank_accounts(id)
    on delete set null,

    category text,

    supplier text,

    description text,

    amount numeric not null,

    currency text default 'EUR',

    expense_date date,

    payment_status text default 'pending',

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_expenses_company
on public.expenses(company_id);

create index if not exists idx_expenses_category
on public.expenses(category);

create index if not exists idx_expenses_date
on public.expenses(expense_date);


-- =====================================================
-- REVENUES
-- =====================================================

create table if not exists public.revenues (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    invoice_id uuid
    references public.invoices(id)
    on delete set null,

    bank_account_id uuid
    references public.bank_accounts(id)
    on delete set null,

    source text,

    description text,

    amount numeric not null,

    currency text default 'EUR',

    received_date date,

    payment_method text,

    created_at timestamptz not null default timezone('utc', now()),

    updated_at timestamptz not null default timezone('utc', now())

);

create index if not exists idx_revenues_company
on public.revenues(company_id);

create index if not exists idx_revenues_date
on public.revenues(received_date);

-- =====================================================
-- TRANSACTIONS
-- =====================================================

create table if not exists public.transactions (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    bank_account_id uuid
    references public.bank_accounts(id)
    on delete set null,

    revenue_id uuid
    references public.revenues(id)
    on delete set null,

    expense_id uuid
    references public.expenses(id)
    on delete set null,

    transaction_type text not null,

    description text,

    amount numeric not null,

    currency text default 'EUR',

    transaction_date timestamptz
    default timezone('utc', now()),

    created_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_transactions_company
on public.transactions(company_id);

create index if not exists idx_transactions_bank
on public.transactions(bank_account_id);

create index if not exists idx_transactions_date
on public.transactions(transaction_date);

create index if not exists idx_transactions_type
on public.transactions(transaction_type);

-- =====================================================
-- BUDGETS
-- =====================================================

create table if not exists public.budgets (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    category text not null,

    period text not null,

    planned_amount numeric not null,

    actual_amount numeric default 0,

    currency text default 'EUR',

    notes text,

    created_at timestamptz not null
    default timezone('utc', now()),

    updated_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_budgets_company
on public.budgets(company_id);

create index if not exists idx_budgets_period
on public.budgets(period);

create index if not exists idx_budgets_category
on public.budgets(category);

-- =====================================================
-- RECURRING PAYMENTS
-- =====================================================

create table if not exists public.recurring_payments (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    bank_account_id uuid
    references public.bank_accounts(id)
    on delete set null,

    category text,

    supplier text,

    description text,

    amount numeric not null,

    currency text default 'EUR',

    frequency text not null,

    next_due_date date,

    active boolean default true,

    created_at timestamptz not null
    default timezone('utc', now()),

    updated_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_recurring_company
on public.recurring_payments(company_id);

create index if not exists idx_recurring_due
on public.recurring_payments(next_due_date);

create index if not exists idx_recurring_active
on public.recurring_payments(active);

-- =====================================================
-- FINANCIAL REPORTS
-- =====================================================

create table if not exists public.financial_reports (

    id uuid primary key default gen_random_uuid(),

    company_id uuid not null
    references public.companies(id)
    on delete cascade,

    report_name text not null,

    report_type text not null,

    period_start date,

    period_end date,

    generated_at timestamptz not null
    default timezone('utc', now()),

    generated_by uuid
    references auth.users(id)
    on delete set null,

    report_data jsonb not null default '{}'::jsonb,

    ai_summary text,

    created_at timestamptz not null
    default timezone('utc', now())

);

create index if not exists idx_financial_reports_company
on public.financial_reports(company_id);

create index if not exists idx_financial_reports_type
on public.financial_reports(report_type);

create index if not exists idx_financial_reports_generated
on public.financial_reports(generated_at);