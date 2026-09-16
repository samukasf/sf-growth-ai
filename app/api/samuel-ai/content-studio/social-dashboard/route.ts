import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim().slice(0, 80) || "default-company";
  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const supabase = getSupabaseServiceClient();
  const [publishResult, creativeResult] = await Promise.all([
    supabase
      .from("samuel_social_publish_jobs")
      .select("id,project_id,platform,status,provider_post_id,provider_payload,error_message,created_at,updated_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("samuel_creative_jobs")
      .select("id,kind,title,status,output,error_message,created_at,updated_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const publishJobs = publishResult.error ? [] : (publishResult.data ?? []).map((job) => ({
    id: job.id,
    projectId: job.project_id,
    platform: job.platform,
    status: job.status,
    providerPostId: job.provider_post_id,
    permalink: typeof job.provider_payload?.permalink === "string" ? job.provider_payload.permalink : null,
    error: job.error_message,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  }));
  const creativeJobs = creativeResult.error ? [] : (creativeResult.data ?? []).map((job) => ({
    id: job.id,
    kind: job.kind,
    title: job.title,
    status: job.status,
    provider: typeof job.output?.provider === "string" ? job.output.provider : null,
    model: typeof job.output?.model === "string" ? job.output.model : null,
    error: job.error_message,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  }));

  return Response.json({
    publishJobs,
    creativeJobs,
    warnings: [
      publishResult.error ? `Publicações: ${publishResult.error.message}` : null,
      creativeResult.error ? `Produções: ${creativeResult.error.message}` : null,
    ].filter(Boolean),
  }, { headers: { "Cache-Control": "private, no-store" } });
}
