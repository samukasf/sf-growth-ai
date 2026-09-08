-- Revenue tenant integrity hardening.
-- Composite uniqueness allows child records to prove that related CRM rows belong to the same company.

create unique index if not exists uq_leads_company_id_id on public.leads(company_id, id);
create unique index if not exists uq_deals_company_id_id on public.deals(company_id, id);
create unique index if not exists uq_revenue_icp_company_id_id on public.revenue_icp_profiles(company_id, id);
create unique index if not exists uq_sales_campaigns_company_id_id on public.sales_campaigns(company_id, id);
create unique index if not exists uq_sales_sequences_company_id_id on public.sales_sequences(company_id, id);
create unique index if not exists uq_sequence_steps_company_id_id on public.sequence_steps(company_id, id);

alter table public.lead_sources drop constraint if exists lead_sources_lead_id_fkey;
alter table public.lead_sources add constraint lead_sources_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete cascade;

alter table public.lead_enrichment drop constraint if exists lead_enrichment_lead_id_fkey;
alter table public.lead_enrichment add constraint lead_enrichment_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete cascade;

alter table public.lead_scores drop constraint if exists lead_scores_lead_id_fkey;
alter table public.lead_scores add constraint lead_scores_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete cascade;

alter table public.sales_campaigns drop constraint if exists sales_campaigns_icp_profile_id_fkey;
alter table public.sales_campaigns add constraint sales_campaigns_tenant_icp_fkey foreign key (company_id, icp_profile_id) references public.revenue_icp_profiles(company_id, id) on delete set null;

alter table public.sales_sequences drop constraint if exists sales_sequences_campaign_id_fkey;
alter table public.sales_sequences add constraint sales_sequences_tenant_campaign_fkey foreign key (company_id, campaign_id) references public.sales_campaigns(company_id, id) on delete cascade;

alter table public.sequence_steps drop constraint if exists sequence_steps_sequence_id_fkey;
alter table public.sequence_steps add constraint sequence_steps_tenant_sequence_fkey foreign key (company_id, sequence_id) references public.sales_sequences(company_id, id) on delete cascade;

alter table public.outreach_messages drop constraint if exists outreach_messages_lead_id_fkey;
alter table public.outreach_messages drop constraint if exists outreach_messages_sequence_step_id_fkey;
alter table public.outreach_messages add constraint outreach_messages_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete cascade;
alter table public.outreach_messages add constraint outreach_messages_tenant_step_fkey foreign key (company_id, sequence_step_id) references public.sequence_steps(company_id, id) on delete set null;

alter table public.sales_conversations drop constraint if exists sales_conversations_lead_id_fkey;
alter table public.sales_conversations add constraint sales_conversations_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete cascade;

alter table public.sales_tasks drop constraint if exists sales_tasks_lead_id_fkey;
alter table public.sales_tasks drop constraint if exists sales_tasks_deal_id_fkey;
alter table public.sales_tasks add constraint sales_tasks_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete cascade;
alter table public.sales_tasks add constraint sales_tasks_tenant_deal_fkey foreign key (company_id, deal_id) references public.deals(company_id, id) on delete cascade;

alter table public.sales_ai_runs drop constraint if exists sales_ai_runs_lead_id_fkey;
alter table public.sales_ai_runs add constraint sales_ai_runs_tenant_lead_fkey foreign key (company_id, lead_id) references public.leads(company_id, id) on delete set null;
