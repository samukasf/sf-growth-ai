import "server-only";

import { getCompanyById } from "@/services/executive-context.service";

import { createGoogleWorkspaceChatSignal } from "./google-workspace-chat";
import { buildGoogleWorkspaceSummary } from "./google-workspace-summary.server";

export async function loadGoogleWorkspaceChatSignal(query: string, companyId: string) {
  const empty = createGoogleWorkspaceChatSignal(query, null);
  if (!empty.relevant) return empty;

  try {
    const company = await getCompanyById(companyId);
    if (!company) return empty;
    const summary = await buildGoogleWorkspaceSummary(companyId);
    return createGoogleWorkspaceChatSignal(query, summary);
  } catch {
    return empty;
  }
}
