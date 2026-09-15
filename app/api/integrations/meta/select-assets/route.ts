import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { selectMetaConnectedAssets } from "@/integrations/meta/meta-token.repository";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const form = await request.formData();
  const companyId = String(form.get("companyId") ?? "").trim();
  const pageId = String(form.get("pageId") ?? "").trim();
  const instagramBusinessId = String(form.get("instagramBusinessId") ?? "").trim() || null;
  const adAccountId = String(form.get("adAccountId") ?? "").trim() || null;
  const businessId = String(form.get("businessId") ?? "").trim() || null;

  const origin = new URL(request.url).origin;
  const redirect = new URL("/integrations/meta/connect", origin);

  if (!companyId || !UUID_PATTERN.test(companyId) || !pageId) {
    redirect.searchParams.set("error", "invalid_asset_selection");
    return NextResponse.redirect(redirect, 303);
  }

  redirect.searchParams.set("companyId", companyId);
  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) {
    redirect.searchParams.set("error", "company_access_denied");
    return NextResponse.redirect(redirect, 303);
  }

  try {
    await selectMetaConnectedAssets({
      companyId,
      pageId,
      instagramBusinessId,
      adAccountId,
      businessId,
    });
    redirect.searchParams.set("selected", "1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "asset_selection_failed";
    redirect.searchParams.set("error", message.slice(0, 180));
  }

  return NextResponse.redirect(redirect, 303);
}
