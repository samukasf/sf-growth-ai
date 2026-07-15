import "server-only";

import { getFirstCompany } from "@/services/executive-context.service";

import { createGoogleWorkspaceChatSignal } from "./google-workspace-chat";
import { buildGoogleWorkspaceSummary } from "./google-workspace-summary.server";

export async function loadGoogleWorkspaceChatSignal(query: string, companyId: string) {
  const empty = createGoogleWorkspaceChatSignal(query, null);
  if (!empty.relevant) return empty;

  try {
    const company = await getFirstCompany();
    if (!company || company.id !== companyId) return empty;
    const summary = await buildGoogleWorkspaceSummary(companyId);
    return createGoogleWorkspaceChatSignal(query, summary);
  } catch {
    return empty;
  }
}
