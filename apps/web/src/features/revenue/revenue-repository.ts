import { createServerSupabaseAdmin } from "@/lib/supabase/server";

export type IcpInput = {
  companyId: string;
  name?: string;
  productService: string;
  description?: string;
  problemSolved?: string;
  primaryBenefit?: string;
  price?: number | null;
  minimumPrice?: number | null;
  markets?: string[];
  sectors?: string[];
  idealCustomer?: Record<string, unknown>;
  arguments?: string[];
  differentiators?: string[];
  proofs?: string[];
  objections?: string[];
  goals?: Record<string, unknown>;
  autonomyLevel?: 0 | 1 | 2 | 3;
};

export async function listIcpProfiles(companyId: string) {
  const db = createServerSupabaseAdmin();
  const { data, error } = await db.from("revenue_icp_profiles").select("*").eq("company_id", companyId).order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveIcpProfile(input: IcpInput) {
  const db = createServerSupabaseAdmin();
  const row = {
    company_id: input.companyId,
    name: input.name?.trim() || "Default ICP",
    product_service: input.productService.trim(),
    description: input.description?.trim() || null,
    problem_solved: input.problemSolved?.trim() || null,
    primary_benefit: input.primaryBenefit?.trim() || null,
    price: input.price ?? null,
    minimum_price: input.minimumPrice ?? null,
    markets: input.markets ?? [], sectors: input.sectors ?? [], ideal_customer: input.idealCustomer ?? {},
    arguments: input.arguments ?? [], differentiators: input.differentiators ?? [], proofs: input.proofs ?? [], objections: input.objections ?? [],
    goals: input.goals ?? {}, autonomy_level: input.autonomyLevel ?? 1, updated_at: new Date().toISOString(),
  };
  const { data, error } = await db.from("revenue_icp_profiles").insert(row).select("*").single();
  if (error) throw error;
  return data;
}

export async function getRevenueOverview(companyId: string) {
  const db = createServerSupabaseAdmin();
  const [leads, conversations, deals] = await Promise.all([
    db.from("leads").select("id,score,revenue_stage,value").eq("company_id", companyId),
    db.from("sales_conversations").select("id,intent,close_probability").eq("company_id", companyId),
    db.from("deals").select("id,value,status").eq("company_id", companyId),
  ]);
  if (leads.error) throw leads.error;
  if (conversations.error) throw conversations.error;
  if (deals.error) throw deals.error;
  const leadRows = leads.data ?? [];
  const dealRows = deals.data ?? [];
  return {
    leads: leadRows.length,
    qualified: leadRows.filter((lead) => Number(lead.score ?? 0) >= 50).length,
    replies: (conversations.data ?? []).length,
    opportunities: leadRows.filter((lead) => ["opportunity", "negotiation", "proposal_sent", "won"].includes(lead.revenue_stage ?? "")).length,
    pipelineValue: dealRows.filter((deal) => deal.status !== "lost").reduce((sum, deal) => sum + Number(deal.value ?? 0), 0),
    wonRevenue: dealRows.filter((deal) => deal.status === "won").reduce((sum, deal) => sum + Number(deal.value ?? 0), 0),
  };
}
