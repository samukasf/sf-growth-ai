import { createServerSupabaseAdmin } from "@/lib/supabase/server";
import { calculateLeadScore, type LeadScoreComponents } from "./lead-score";

export type VerifiedLeadCandidate = {
  companyId: string;
  name: string;
  sourceType: string;
  sourceUrl: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  language?: string | null;
  externalId?: string | null;
  confidence: number;
  scoreComponents: LeadScoreComponents;
  problemDetected?: string | null;
  recommendedOffer?: string | null;
  bestChannel?: string | null;
  enrichment?: Array<{ field: string; value: unknown; sourceUrl: string; confidence: number }>;
};

const norm = (value?: string | null) => value?.trim().toLowerCase() || null;

export async function ingestVerifiedLead(candidate: VerifiedLeadCandidate) {
  if (!candidate.sourceUrl?.trim()) throw new Error("A source URL is required; unverified leads cannot be ingested");
  const db = createServerSupabaseAdmin();
  const email = norm(candidate.email); const phone = norm(candidate.phone); const website = norm(candidate.website);

  let existingId: string | null = null;
  if (candidate.externalId) {
    const { data } = await db.from("lead_sources").select("lead_id").eq("company_id", candidate.companyId).eq("source_type", candidate.sourceType).eq("external_id", candidate.externalId).maybeSingle();
    existingId = data?.lead_id ?? null;
  }
  if (!existingId && (email || phone || website)) {
    const { data: contacts } = await db.from("contacts").select("id,email,phone,website").eq("company_id", candidate.companyId).limit(250);
    const contact = (contacts ?? []).find((row) => (email && norm(row.email) === email) || (phone && norm(row.phone) === phone) || (website && norm(row.website) === website));
    if (contact) {
      const { data: lead } = await db.from("leads").select("id").eq("company_id", candidate.companyId).eq("contact_id", contact.id).maybeSingle();
      existingId = lead?.id ?? null;
    }
  }
  if (existingId) return { leadId: existingId, duplicate: true };

  const { data: contact, error: contactError } = await db.from("contacts").insert({ company_id: candidate.companyId, name: candidate.name, email, phone, website }).select("id").single();
  if (contactError) throw contactError;
  const score = calculateLeadScore(candidate.scoreComponents, candidate);
  const { data: lead, error: leadError } = await db.from("leads").insert({ company_id: candidate.companyId, contact_id: contact.id, source: candidate.sourceType, score: score.score, revenue_stage: score.score >= 50 ? "qualified" : "researched", score_reason: score.components, opportunity_summary: candidate.problemDetected ?? null, recommended_offer: candidate.recommendedOffer ?? null, best_channel: candidate.bestChannel ?? null, next_best_action: score.nextBestAction, language: candidate.language ?? null, confidence: Math.max(0, Math.min(1, candidate.confidence)) }).select("id").single();
  if (leadError) throw leadError;

  const { error: sourceError } = await db.from("lead_sources").insert({ company_id: candidate.companyId, lead_id: lead.id, source_type: candidate.sourceType, source_url: candidate.sourceUrl, external_id: candidate.externalId ?? null });
  if (sourceError) throw sourceError;
  const { error: scoreError } = await db.from("lead_scores").insert({ company_id: candidate.companyId, lead_id: lead.id, score: score.score, components: score.components, explanation: score.explanation.join(" · "), problem_detected: score.problemDetected, recommended_offer: score.recommendedOffer, best_channel: score.bestChannel, next_best_action: score.nextBestAction });
  if (scoreError) throw scoreError;
  if (candidate.enrichment?.length) {
    const { error } = await db.from("lead_enrichment").insert(candidate.enrichment.map((item) => ({ company_id: candidate.companyId, lead_id: lead.id, field_name: item.field, field_value: item.value, source_url: item.sourceUrl, confidence: Math.max(0, Math.min(1, item.confidence)), verified_at: new Date().toISOString() })));
    if (error) throw error;
  }
  return { leadId: lead.id, duplicate: false, score };
}
