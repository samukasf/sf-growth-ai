create schema if not exists extensions;
alter extension vector set schema extensions;

drop policy if exists "Users can view own company" on public.companies;
drop policy if exists "Admins update own company" on public.companies;
drop policy if exists "Users can view own profile" on public.user_profiles;

do $$
declare
  target_table text;
  target_tables text[] := array['ai_memory', 'budgets', 'financial_reports'];
begin
  foreach target_table in array target_tables loop
    execute format('alter table public.%I enable row level security', target_table);
    execute format('drop policy if exists %I on public.%I',
      target_table || '_authenticated_members', target_table);
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.is_company_member(company_id)) with check (private.is_company_member(company_id))',
      target_table || '_authenticated_members', target_table
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
  end loop;
end $$;

do $$
declare
  target_table text;
  target_tables text[] := array[
    'executive_inbox_actions',
    'google_oauth_connections',
    'meta_oauth_connections',
    'future_me_affiliate_clicks',
    'future_me_one_time_ops'
  ];
begin
  foreach target_table in array target_tables loop
    execute format('drop policy if exists %I on public.%I',
      target_table || '_server_only', target_table);
    execute format(
      'create policy %I on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
      target_table || '_server_only', target_table
    );
    execute format('revoke all on table public.%I from anon, authenticated', target_table);
  end loop;
end $$;

create index if not exists financial_reports_generated_by_idx
  on public.financial_reports (generated_by);
